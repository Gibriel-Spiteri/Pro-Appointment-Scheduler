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

const CUSTOMER_FACING_LOCATION_IDS = [5, 2, 4, 3, 17];

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
