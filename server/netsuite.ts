import crypto from "crypto";
import OAuth from "oauth-1.0a";
import { log } from "./index";

const NETSUITE_ACCOUNT_ID = process.env.NETSUITE_ACCOUNT_ID || "";
const CONSUMER_KEY = process.env.NETSUITE_CONSUMER_KEY || "";
const CONSUMER_SECRET = process.env.NETSUITE_CONSUMER_SECRET || "";
const TOKEN_ID = process.env.NETSUITE_TOKEN_ID || "";
const TOKEN_SECRET = process.env.NETSUITE_TOKEN_SECRET || "";

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

function getAccountRealm(): string {
  return extractAccountId().toUpperCase();
}

function createOAuthClient() {
  return new OAuth({
    consumer: {
      key: CONSUMER_KEY,
      secret: CONSUMER_SECRET,
    },
    signature_method: "HMAC-SHA256",
    hash_function(baseString: string, key: string) {
      return crypto.createHmac("sha256", key).update(baseString).digest("base64");
    },
    realm: getAccountRealm(),
  });
}

function buildAuthorizationHeader(method: string, url: string): string {
  const oauth = createOAuthClient();
  const requestData = { url, method };
  const token = { key: TOKEN_ID, secret: TOKEN_SECRET };

  const authHeader = oauth.toHeader(oauth.authorize(requestData, token));

  let headerValue = authHeader.Authorization;
  if (!headerValue.includes("realm=")) {
    headerValue = headerValue.replace("OAuth ", `OAuth realm="${getAccountRealm()}", `);
  }

  return headerValue;
}

export function validateNetSuiteConfig(): { valid: boolean; missing: string[] } {
  const required: Record<string, string> = {
    NETSUITE_ACCOUNT_ID,
    NETSUITE_CONSUMER_KEY: CONSUMER_KEY,
    NETSUITE_CONSUMER_SECRET: CONSUMER_SECRET,
    NETSUITE_TOKEN_ID: TOKEN_ID,
    NETSUITE_TOKEN_SECRET: TOKEN_SECRET,
  };

  const missing = Object.entries(required)
    .filter(([, value]) => !value)
    .map(([key]) => key);

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

  const baseUrl = getBaseUrl();
  const url = `${baseUrl}/services/rest/query/v1/suiteql`;
  const urlWithParams = `${url}?limit=${limit}&offset=${offset}`;

  const authHeader = buildAuthorizationHeader("POST", url);

  try {
    log(`Executing SuiteQL query against ${urlWithParams}`, "netsuite");
    log(`Query: ${query.substring(0, 200)}`, "netsuite");

    const response = await fetch(urlWithParams, {
      method: "POST",
      headers: {
        Authorization: authHeader,
        "Content-Type": "application/json",
        prefer: "transient",
      },
      body: JSON.stringify({ q: query }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      log(`SuiteQL error ${response.status}: ${errorBody}`, "netsuite");
      return {
        success: false,
        error: `NetSuite API error (${response.status}): ${errorBody}`,
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
