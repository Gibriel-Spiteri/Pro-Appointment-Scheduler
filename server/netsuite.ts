import crypto from "crypto";
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

function generateNonce(): string {
  return crypto.randomBytes(16).toString("hex");
}

function generateTimestamp(): string {
  return Math.floor(Date.now() / 1000).toString();
}

function percentEncode(str: string): string {
  return encodeURIComponent(str)
    .replace(/!/g, "%21")
    .replace(/\*/g, "%2A")
    .replace(/'/g, "%27")
    .replace(/\(/g, "%28")
    .replace(/\)/g, "%29");
}

function generateOAuthSignature(
  method: string,
  url: string,
  params: Record<string, string>,
  algorithm: "sha1" | "sha256" = "sha256"
): string {
  const sortedKeys = Object.keys(params).sort();
  const paramString = sortedKeys
    .map((key) => `${percentEncode(key)}=${percentEncode(params[key])}`)
    .join("&");

  const baseString = [
    method.toUpperCase(),
    percentEncode(url),
    percentEncode(paramString),
  ].join("&");

  const signingKey = `${percentEncode(CONSUMER_SECRET)}&${percentEncode(TOKEN_SECRET)}`;

  const signature = crypto
    .createHmac(algorithm, signingKey)
    .update(baseString)
    .digest("base64");

  return signature;
}

function buildAuthorizationHeader(
  method: string,
  url: string
): string {
  const nonce = generateNonce();
  const timestamp = generateTimestamp();

  const signatureMethod = "HMAC-SHA256";
  const hashAlgorithm: "sha1" | "sha256" = "sha256";

  const oauthParams: Record<string, string> = {
    oauth_consumer_key: CONSUMER_KEY,
    oauth_token: TOKEN_ID,
    oauth_nonce: nonce,
    oauth_timestamp: timestamp,
    oauth_signature_method: signatureMethod,
    oauth_version: "1.0",
  };

  const signature = generateOAuthSignature(method, url, oauthParams, hashAlgorithm);
  oauthParams.oauth_signature = signature;

  const realm = getAccountRealm();

  const headerParts = Object.keys(oauthParams)
    .sort()
    .map((key) => `${percentEncode(key)}="${percentEncode(oauthParams[key])}"`)
    .join(", ");

  return `OAuth realm="${realm}", ${headerParts}`;
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
    log(`Executing SuiteQL query: ${query.substring(0, 100)}...`, "netsuite");

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
    const errorDetail = error.cause ? `${error.message} (cause: ${error.cause?.message || error.cause})` : error.message;
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
    };
  }

  return {
    success: false,
    message: result.error || "Failed to connect to NetSuite",
  };
}
