import { UAParser } from "ua-parser-js";

function getParserResult(ua: string): {
  device: { type?: string };
  os: { name?: string };
} {
  return UAParser(ua) as ReturnType<typeof getParserResult>;
}

export type DeviceType = "mobile" | "desktop" | "unknown";
export type OsType =
  | "Windows"
  | "macOS"
  | "Linux"
  | "iOS"
  | "Android"
  | "Other"
  | "unknown";

export interface ParsedUserAgent {
  device: DeviceType;
  os: OsType;
}

const MOBILE_DEVICE_TYPES = ["mobile", "tablet"] as const;
const DESKTOP_DEVICE_TYPE = "desktop" as const;

const OS_NORMALIZE: Record<string, OsType> = {
  windows: "Windows",
  "mac os": "macOS",
  macos: "macOS",
  "mac os x": "macOS",
  linux: "Linux",
  ubuntu: "Linux",
  debian: "Linux",
  fedora: "Linux",
  ios: "iOS",
  "iphone os": "iOS",
  android: "Android",
};

/**
 * Parsea un User-Agent string y devuelve device (mobile/desktop/unknown) y os normalizado.
 */
export function parseUserAgent(userAgent: string): ParsedUserAgent {
  const result = getParserResult(userAgent);
  const deviceType = result.device.type;
  const osName = (result.os.name ?? "").toLowerCase().trim();

  let device: DeviceType = "unknown";
  if (deviceType) {
    if (
      MOBILE_DEVICE_TYPES.includes(
        deviceType as (typeof MOBILE_DEVICE_TYPES)[number]
      )
    ) {
      device = "mobile";
    } else if (deviceType === DESKTOP_DEVICE_TYPE) {
      device = "desktop";
    }
  }
  // Si no hay device.type, inferir por OS (ej. iOS/Android sin type suelen ser mobile)
  if (device === "unknown" && osName) {
    if (osName.includes("ios") || osName.includes("android")) {
      device = "mobile";
    } else if (
      osName.includes("windows") ||
      osName.includes("mac") ||
      osName.includes("linux")
    ) {
      device = "desktop";
    }
  }

  let os: OsType = "unknown";
  if (osName) {
    const matched =
      Object.keys(OS_NORMALIZE).find((key) => osName.includes(key)) ?? null;
    os = matched ? OS_NORMALIZE[matched] : "Other";
  }

  return { device, os };
}

export interface ParsedUtmParams {
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  utm_term: string | null;
  utm_content: string | null;
}

const UTM_KEYS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_term",
  "utm_content",
] as const;

export type QueryLike =
  | Record<string, string | string[] | undefined>
  | URLSearchParams;

function getQueryValue(
  query: QueryLike,
  key: string
): string | string[] | undefined {
  if (query instanceof URLSearchParams) {
    const v = query.get(key);
    return v === null ? undefined : v;
  }
  return query[key];
}

/**
 * Extrae UTM params de un objeto query (o URLSearchParams).
 * Claves ausentes o valores vacíos devuelven null.
 */
export function parseUtmParams(query: QueryLike): ParsedUtmParams {
  const out: ParsedUtmParams = {
    utm_source: null,
    utm_medium: null,
    utm_campaign: null,
    utm_term: null,
    utm_content: null,
  };
  for (const key of UTM_KEYS) {
    const raw = getQueryValue(query, key);
    const value =
      raw == null
        ? null
        : Array.isArray(raw)
          ? raw[0]?.trim() || null
          : String(raw).trim() || null;
    out[key] = value;
  }
  return out;
}
