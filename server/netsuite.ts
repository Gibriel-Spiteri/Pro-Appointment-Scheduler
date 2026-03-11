import fs from "fs";
import path from "path";
import jwt from "jsonwebtoken";
import { log } from "./index";

const NETSUITE_ACCOUNT_ID = process.env.NETSUITE_ACCOUNT_ID || "";
const CLIENT_ID = process.env.NETSUITE_CLIENT_ID || "";
const OIDC_CLIENT_ID = process.env.NETSUITE_OIDC_CLIENT_ID || "";
const CERTIFICATE_ID = process.env.NETSUITE_CERTIFICATE_ID || process.env.CERTIFICATE_ID || "";

const PRIVATE_KEY_PATH = path.resolve("server/certs/private_key.pem");

let cachedToken: { accessToken: string; expiresAt: number } | null = null;

function extractAccountId(): string {
  let raw = NETSUITE_ACCOUNT_ID.trim();
  raw = raw.replace(/^https?:\/\//, "");
  raw = raw.replace(/\.app\.netsuite\.com\/?.*$/, "");
  raw = raw.replace(/\.suitetalk\.api\.netsuite\.com\/?.*$/, "");
  raw = raw.replace(/\/$/, "");
  return raw;
}

function getBaseUrl(): string {
  const accountId = extractAccountId().toLowerCase().replace(/_/g, "-");
  return `https://${accountId}.suitetalk.api.netsuite.com`;
}

function getTokenEndpoint(): string {
  return `${getBaseUrl()}/services/rest/auth/oauth2/v1/token`;
}

function getPrivateKey(): string {
  return fs.readFileSync(PRIVATE_KEY_PATH, "utf-8");
}

function getEffectiveClientId(): string {
  return OIDC_CLIENT_ID || CLIENT_ID;
}

function createClientAssertion(): string {
  const privateKey = getPrivateKey();
  const tokenEndpoint = getTokenEndpoint();
  const clientId = getEffectiveClientId();

  const now = Math.floor(Date.now() / 1000);
  const payload = {
    iss: clientId,
    scope: ["rest_webservices"],
    aud: tokenEndpoint,
    iat: now,
    exp: now + 3600,
  };

  log(`Creating JWT with iss=${clientId}, kid=${CERTIFICATE_ID}, alg=PS256`, "netsuite");

  const token = jwt.sign(payload, privateKey, {
    algorithm: "PS256" as any,
    header: {
      alg: "PS256",
      typ: "JWT",
      kid: CERTIFICATE_ID,
    } as any,
  });

  return token;
}

async function getAccessToken(): Promise<string> {
  if (cachedToken && Date.now() < cachedToken.expiresAt - 60000) {
    return cachedToken.accessToken;
  }

  const tokenEndpoint = getTokenEndpoint();
  const clientAssertion = createClientAssertion();

  log(`Requesting OAuth2 M2M token from ${tokenEndpoint}`, "netsuite");

  const body = new URLSearchParams({
    grant_type: "client_credentials",
    client_assertion_type: "urn:ietf:params:oauth:client-assertion-type:jwt-bearer",
    client_assertion: clientAssertion,
  });

  const response = await fetch(tokenEndpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: body.toString(),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    log(`Token request failed (${response.status}): ${errorBody}`, "netsuite");
    throw new Error(`Failed to obtain access token (${response.status}): ${errorBody}`);
  }

  const data = await response.json();

  cachedToken = {
    accessToken: data.access_token,
    expiresAt: Date.now() + (data.expires_in || 3600) * 1000,
  };

  log("Successfully obtained OAuth2 access token", "netsuite");
  return cachedToken.accessToken;
}

export function validateNetSuiteConfig(): { valid: boolean; missing: string[] } {
  const effectiveClientId = getEffectiveClientId();
  const required: Record<string, string> = {
    NETSUITE_ACCOUNT_ID,
    "NETSUITE_CLIENT_ID or NETSUITE_OIDC_CLIENT_ID": effectiveClientId,
    NETSUITE_CERTIFICATE_ID: CERTIFICATE_ID,
  };

  const missing = Object.entries(required)
    .filter(([, value]) => !value)
    .map(([key]) => key);

  if (!fs.existsSync(PRIVATE_KEY_PATH)) {
    missing.push("Private Key File (server/certs/private_key.pem)");
  }

  return { valid: missing.length === 0, missing };
}

export async function executeSuiteQL(
  query: string,
  limit: number = 1000,
  offset: number = 0
): Promise<{ success: boolean; data?: any; error?: string; totalResults?: number }> {
  const config = validateNetSuiteConfig();
  if (!config.valid) {
    return {
      success: false,
      error: `Missing NetSuite configuration: ${config.missing.join(", ")}`,
    };
  }

  try {
    const accessToken = await getAccessToken();

    const baseUrl = getBaseUrl();
    const url = `${baseUrl}/services/rest/query/v1/suiteql?limit=${limit}&offset=${offset}`;

    log(`Executing SuiteQL query against ${url}`, "netsuite");
    log(`Query: ${query.substring(0, 200)}`, "netsuite");

    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
        prefer: "transient",
      },
      body: JSON.stringify({ q: query }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      log(`SuiteQL error ${response.status}: ${errorBody}`, "netsuite");

      if (response.status === 401) {
        cachedToken = null;
      }

      let sanitizedError = `NetSuite API error (${response.status})`;
      try {
        const parsed = JSON.parse(errorBody);
        if (parsed["o:errorDetails"]?.[0]?.detail) {
          sanitizedError += `: ${parsed["o:errorDetails"][0].detail}`;
        } else if (parsed.title) {
          sanitizedError += `: ${parsed.title}`;
        }
      } catch {
        sanitizedError += `: ${response.statusText}`;
      }

      return {
        success: false,
        error: sanitizedError,
      };
    }

    const data = await response.json();
    log(`SuiteQL query returned ${data.items?.length || 0} results`, "netsuite");

    return {
      success: true,
      data: data.items || [],
      totalResults: data.totalResults || data.items?.length || 0,
    };
  } catch (error: any) {
    const errorDetail = error.cause
      ? `${error.message} (cause: ${error.cause?.message || error.cause})`
      : error.message;
    log(`SuiteQL request failed: ${errorDetail}`, "netsuite");
    return {
      success: false,
      error: `Request failed: ${errorDetail}`,
    };
  }
}

function parseNetSuiteTime(nsTime: string): string {
  if (!nsTime) return "";
  const cleaned = nsTime.trim().toLowerCase();
  const match = cleaned.match(/^(\d{1,2}):(\d{2})\s*([ap])/);
  if (!match) return nsTime;
  const [, hourStr, minStr, ampm] = match;
  const hour = parseInt(hourStr, 10);
  const min = minStr;
  const period = ampm === "a" ? "AM" : "PM";
  return `${hour}:${min} ${period}`;
}

function formatDateForSuiteQL(dateStr: string): string {
  const [y, m, d] = dateStr.split("-");
  return `${parseInt(m, 10)}/${parseInt(d, 10)}/${y}`;
}

export interface NetSuiteLocation {
  id: string;
  name: string;
}

export interface NetSuiteSchedule {
  employeeId: string;
  scheduleDate: string;
  startTime: string;
  endTime: string;
  pto: boolean;
  scheduleChange: boolean;
}

const CUSTOMER_FACING_LOCATION_IDS = [5, 2, 4, 3, 17, 16];

export async function fetchLocations(): Promise<NetSuiteLocation[]> {
  const locationIds = CUSTOMER_FACING_LOCATION_IDS.join(",");
  const result = await executeSuiteQL(
    `SELECT DISTINCT e.location AS id, BUILTIN.DF(e.location) AS name
     FROM employee e
     WHERE e.isinactive = 'F' AND e.location IN (${locationIds})
     ORDER BY name`,
    100
  );

  if (!result.success || !result.data) return [];

  return result.data
    .filter((row: any) => row.name && row.id)
    .map((row: any) => ({ id: String(row.id), name: String(row.name) }));
}

export async function fetchSchedulesByDateAndLocation(
  date: string,
  locationId: string
): Promise<NetSuiteSchedule[]> {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    throw new Error(`Invalid date format: ${date}`);
  }
  const numericLocationId = parseInt(locationId, 10);
  if (isNaN(numericLocationId)) {
    throw new Error(`Invalid location ID: ${locationId}`);
  }
  const nsDate = formatDateForSuiteQL(date);

  const result = await executeSuiteQL(
    `SELECT
       s.custrecord_sch_employee AS employeeid,
       s.custrecord_sch_date AS scheduledate,
       s.custrecord_sch_starttime AS starttime,
       s.custrecord_sch_endtime AS endtime,
       s.custrecord_sch_pto AS pto,
       s.custrecord_sch_change AS schedulechange
     FROM customrecord_schedule s
     JOIN employee e ON s.custrecord_sch_employee = e.id
     WHERE s.custrecord_sch_date = '${nsDate}'
       AND e.location = ${numericLocationId}
       AND s.isinactive = 'F'`,
    1000
  );

  if (!result.success || !result.data) return [];

  return result.data.map((row: any) => ({
    employeeId: String(row.employeeid),
    scheduleDate: date,
    startTime: parseNetSuiteTime(row.starttime),
    endTime: parseNetSuiteTime(row.endtime),
    pto: row.pto === "T",
    scheduleChange: row.schedulechange === "T",
  }));
}

export interface NetSuiteEvent {
  eventId: string;
  title: string;
  startTime: string;
  endTime: string;
  organizer: string;
  storeLocationId: string;
  status: string;
}

export async function fetchEventsByDateAndLocation(
  date: string,
  locationId: string
): Promise<NetSuiteEvent[]> {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    throw new Error(`Invalid date format: ${date}`);
  }
  const numericLocationId = parseInt(locationId, 10);
  if (isNaN(numericLocationId)) {
    throw new Error(`Invalid location ID: ${locationId}`);
  }
  const nsDate = formatDateForSuiteQL(date);

  const result = await executeSuiteQL(
    `SELECT
       ce.id AS eventid,
       ce.title AS title,
       TO_CHAR(ce.starttime, 'HH:MI AM') AS starttime,
       TO_CHAR(ce.endtime, 'HH:MI AM') AS endtime,
       ce.organizer AS organizer,
       ce.custevent_storeloc AS storelocationid,
       ce.status AS status
     FROM calendarevent ce
     WHERE TRUNC(ce.startdate) = TO_DATE('${nsDate}', 'MM/DD/YYYY')
       AND ce.custevent_storeloc = ${numericLocationId}
       AND ce.status = 'CONFIRMED'
       AND ce.custevent_etype NOT IN (10, 12)`,
    1000
  );

  if (!result.success || !result.data) return [];

  return result.data.map((row: any) => ({
    eventId: String(row.eventid),
    title: String(row.title || ""),
    startTime: String(row.starttime || "").trim(),
    endTime: String(row.endtime || "").trim(),
    organizer: String(row.organizer || ""),
    storeLocationId: String(row.storelocationid || ""),
    status: String(row.status || ""),
  }));
}

export interface EmployeeDetail {
  id: string;
  name: string;
  email: string;
}

export async function fetchEmployeeDetails(employeeId: string): Promise<EmployeeDetail | null> {
  const result = await executeSuiteQL(
    `SELECT e.id, e.entityid || ' ' || e.lastname AS name, e.email
     FROM employee e
     WHERE e.id = ${parseInt(employeeId, 10)}`,
    1
  );
  if (!result.success || !result.data || result.data.length === 0) return null;
  const row = result.data[0];
  return {
    id: String(row.id),
    name: String(row.name || ""),
    email: String(row.email || ""),
  };
}

export async function fetchAvailableEmployeeForSlot(
  date: string,
  locationId: string,
  startTime: string,
  endTime: string
): Promise<EmployeeDetail | null> {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return null;
  const numericLocationId = parseInt(locationId, 10);
  if (isNaN(numericLocationId)) return null;
  const nsDate = formatDateForSuiteQL(date);

  const scheduledResult = await executeSuiteQL(
    `SELECT
       s.custrecord_sch_employee AS employeeid,
       BUILTIN.DF(s.custrecord_sch_employee) AS employeename,
       e.email AS email,
       s.custrecord_sch_starttime AS starttime,
       s.custrecord_sch_endtime AS endtime
     FROM customrecord_schedule s
     JOIN employee e ON s.custrecord_sch_employee = e.id
     WHERE s.custrecord_sch_date = '${nsDate}'
       AND e.location = ${numericLocationId}
       AND s.isinactive = 'F'
       AND s.custrecord_sch_pto = 'F'
       AND s.custrecord_sch_change = 'F'`,
    100
  );

  if (!scheduledResult.success || !scheduledResult.data || scheduledResult.data.length === 0) {
    return null;
  }

  const requestStart = timeToMinutesUtil(startTime);
  const requestEnd = timeToMinutesUtil(endTime);

  const eligibleEmployees = scheduledResult.data.filter((row: any) => {
    const schedStart = timeToMinutesUtil(parseNetSuiteTime(row.starttime));
    const schedEnd = timeToMinutesUtil(parseNetSuiteTime(row.endtime));
    return requestStart >= schedStart && requestEnd <= schedEnd;
  });

  if (eligibleEmployees.length === 0) return null;

  const eventsResult = await executeSuiteQL(
    `SELECT
       ce.organizer AS organizer,
       TO_CHAR(ce.starttime, 'HH:MI AM') AS starttime,
       TO_CHAR(ce.endtime, 'HH:MI AM') AS endtime
     FROM calendarevent ce
     WHERE TRUNC(ce.startdate) = TO_DATE('${nsDate}', 'MM/DD/YYYY')
       AND ce.custevent_storeloc = ${numericLocationId}
       AND ce.status = 'CONFIRMED'
       AND ce.custevent_etype NOT IN (10, 12)`,
    1000
  );

  const busyEvents = eventsResult.success && eventsResult.data ? eventsResult.data : [];

  for (const emp of eligibleEmployees) {
    const empId = String(emp.employeeid);
    const hasConflict = busyEvents.some((evt: any) => {
      if (String(evt.organizer) !== empId) return false;
      const evtStart = timeToMinutesUtil(String(evt.starttime || "").trim());
      const evtEnd = timeToMinutesUtil(String(evt.endtime || "").trim());
      return requestStart < evtEnd && requestEnd > evtStart;
    });

    if (!hasConflict) {
      return {
        id: empId,
        name: String(emp.employeename || ""),
        email: String(emp.email || ""),
      };
    }
  }

  return null;
}

function timeToMinutesUtil(t: string): number {
  if (!t) return 0;
  const [time, period] = t.split(" ");
  if (!time || !period) return 0;
  let [h, m] = time.split(":").map(Number);
  if (period === "PM" && h !== 12) h += 12;
  if (period === "AM" && h === 12) h = 0;
  return h * 60 + (m || 0);
}

function formatTimeForNetSuite(timeStr: string, dateStr: string): string {
  const mins = timeToMinutesUtil(timeStr);
  let h = Math.floor(mins / 60);
  const m = mins % 60;
  const [y, mo, d] = dateStr.split("-");
  return `${parseInt(mo, 10)}/${parseInt(d, 10)}/${y} ${h}:${m.toString().padStart(2, "0")}:00`;
}

export async function createNetSuiteCalendarEvent(params: {
  title: string;
  startDate: string;
  startTime: string;
  endTime: string;
  organizerId: string;
  locationId: string;
  message?: string;
}): Promise<{ success: boolean; eventId?: string; error?: string }> {
  const config = validateNetSuiteConfig();
  if (!config.valid) {
    return { success: false, error: `Missing NetSuite configuration: ${config.missing.join(", ")}` };
  }

  try {
    const accessToken = await getAccessToken();
    const baseUrl = getBaseUrl();
    const url = `${baseUrl}/services/rest/record/v1/calendarEvent`;

    const nsDate = (() => {
      const [y, m, d] = params.startDate.split("-");
      return `${parseInt(m, 10)}/${parseInt(d, 10)}/${y}`;
    })();

    const startDateTime = formatTimeForNetSuite(params.startTime, params.startDate);
    const endDateTime = formatTimeForNetSuite(params.endTime, params.startDate);

    const eventBody: any = {
      title: params.title,
      organizer: { id: params.organizerId },
      owner: { id: params.organizerId },
      startDate: nsDate,
      endDate: nsDate,
      startTime: startDateTime,
      endTime: endDateTime,
      status: "CONFIRMED",
      customFields: [
        { scriptId: "custevent_storeloc", value: params.locationId },
      ],
    };

    if (params.message) {
      eventBody.message = params.message;
    }

    log(`Creating calendar event for organizer ${params.organizerId} on ${params.startDate}`, "netsuite");

    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
        prefer: "respond-async, return=representation",
      },
      body: JSON.stringify(eventBody),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      log(`Calendar event creation failed (${response.status}): ${errorBody}`, "netsuite");

      if (response.status === 401) {
        cachedToken = null;
      }

      return { success: false, error: `Failed to create calendar event (${response.status}): ${errorBody}` };
    }

    const locationHeader = response.headers.get("Location");
    let eventId: string | undefined;
    if (locationHeader) {
      const match = locationHeader.match(/\/(\d+)$/);
      if (match) eventId = match[1];
    }

    if (!eventId) {
      try {
        const data = await response.json();
        eventId = data.id ? String(data.id) : undefined;
      } catch {
      }
    }

    log(`Calendar event created successfully. Event ID: ${eventId || "unknown"}`, "netsuite");
    return { success: true, eventId };
  } catch (error: any) {
    log(`Calendar event creation request failed: ${error.message}`, "netsuite");
    return { success: false, error: `Request failed: ${error.message}` };
  }
}

function getRestletBaseUrl(): string {
  const accountId = extractAccountId().toLowerCase().replace(/_/g, "-");
  return `https://${accountId}.restlets.api.netsuite.com`;
}

export async function callRestlet(
  scriptId: string,
  deployId: string,
  method: "GET" | "POST" = "POST",
  body?: any
): Promise<{ success: boolean; data?: any; error?: string }> {
  const config = validateNetSuiteConfig();
  if (!config.valid) {
    return { success: false, error: `Missing NetSuite configuration: ${config.missing.join(", ")}` };
  }

  try {
    const accessToken = await getAccessToken();
    const restletUrl = `${getRestletBaseUrl()}/app/site/hosting/restlet.nl?script=${scriptId}&deploy=${deployId}`;

    log(`Calling RESTlet: script=${scriptId}, deploy=${deployId}, method=${method}`, "netsuite");

    const headers: Record<string, string> = {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    };

    const options: RequestInit = { method, headers };
    if (body && method === "POST") {
      options.body = JSON.stringify(body);
    }

    const response = await fetch(restletUrl, options);

    if (!response.ok) {
      const errorBody = await response.text();
      log(`RESTlet call failed (${response.status}): ${errorBody}`, "netsuite");

      if (response.status === 401) {
        cachedToken = null;
      }

      return { success: false, error: `RESTlet error (${response.status}): ${errorBody}` };
    }

    const data = await response.json();
    log(`RESTlet call succeeded: script=${scriptId}`, "netsuite");
    return { success: true, data };
  } catch (error: any) {
    log(`RESTlet call failed: ${error.message}`, "netsuite");
    return { success: false, error: `Request failed: ${error.message}` };
  }
}

export async function createCustomRecord(
  recordType: string,
  fields: Record<string, any>
): Promise<{ success: boolean; id?: string; error?: string }> {
  const config = validateNetSuiteConfig();
  if (!config.valid) {
    return { success: false, error: `Missing NetSuite configuration: ${config.missing.join(", ")}` };
  }

  try {
    const accessToken = await getAccessToken();
    const url = `${getBaseUrl()}/services/rest/record/v1/${recordType}`;

    log(`Creating ${recordType} record`, "netsuite");

    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
        Prefer: "respond-async,resultrep",
      },
      body: JSON.stringify(fields),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      log(`Failed to create ${recordType}: (${response.status}) ${errorBody}`, "netsuite");
      if (response.status === 401) cachedToken = null;
      return { success: false, error: `${response.status}: ${errorBody}` };
    }

    const location = response.headers.get("Location") || "";
    const idMatch = location.match(/\/(\d+)$/);
    let id: string | undefined;

    if (idMatch) {
      id = idMatch[1];
    } else {
      try {
        const data = await response.json();
        id = data.id ? String(data.id) : undefined;
      } catch {}
    }

    log(`Created ${recordType} record: ${id || "unknown id"}`, "netsuite");
    return { success: true, id };
  } catch (error: any) {
    log(`Error creating ${recordType}: ${error.message}`, "netsuite");
    return { success: false, error: error.message };
  }
}

export async function testConnection(): Promise<{
  success: boolean;
  message: string;
  accountId?: string;
  endpoint?: string;
}> {
  const config = validateNetSuiteConfig();
  if (!config.valid) {
    return {
      success: false,
      message: `Missing configuration: ${config.missing.join(", ")}`,
    };
  }

  const result = await executeSuiteQL("SELECT TOP 1 id, companyname FROM customer", 1);

  if (result.success) {
    return {
      success: true,
      message: "Successfully connected to NetSuite",
      accountId: extractAccountId(),
      endpoint: getBaseUrl(),
    };
  }

  return {
    success: false,
    message: result.error || "Failed to connect to NetSuite",
    endpoint: getBaseUrl(),
  };
}
