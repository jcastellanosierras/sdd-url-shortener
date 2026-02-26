import { describe, it, expect } from "vitest";
import { parseUserAgent, parseUtmParams } from "@/lib/visits-parsing";

describe("parseUserAgent", () => {
  it("devuelve desktop y Windows para Chrome en Windows", () => {
    const ua =
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";
    const result = parseUserAgent(ua);
    expect(result.device).toBe("desktop");
    expect(result.os).toBe("Windows");
  });

  it("devuelve desktop y macOS para Safari en macOS", () => {
    const ua =
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Safari/605.1.15";
    const result = parseUserAgent(ua);
    expect(result.device).toBe("desktop");
    expect(result.os).toBe("macOS");
  });

  it("devuelve desktop y Linux para Firefox en Linux", () => {
    const ua =
      "Mozilla/5.0 (X11; Linux x86_64; rv:121.0) Gecko/20100101 Firefox/121.0";
    const result = parseUserAgent(ua);
    expect(result.device).toBe("desktop");
    expect(result.os).toBe("Linux");
  });

  it("devuelve mobile y iOS para Safari en iPhone", () => {
    const ua =
      "Mozilla/5.0 (iPhone; CPU iPhone OS 17_1_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Mobile/15E148 Safari/604.1";
    const result = parseUserAgent(ua);
    expect(result.device).toBe("mobile");
    expect(result.os).toBe("iOS");
  });

  it("devuelve mobile y Android para Chrome en Android", () => {
    const ua =
      "Mozilla/5.0 (Linux; Android 14; SM-S918B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36";
    const result = parseUserAgent(ua);
    expect(result.device).toBe("mobile");
    expect(result.os).toBe("Android");
  });

  it("devuelve unknown para User-Agent vacío o desconocido", () => {
    expect(parseUserAgent("")).toEqual({ device: "unknown", os: "unknown" });
    expect(parseUserAgent("CustomBot/1.0")).toEqual({
      device: "unknown",
      os: "unknown",
    });
  });
});

describe("parseUtmParams", () => {
  it("extrae todos los UTM cuando están presentes", () => {
    const query: Record<string, string> = {
      utm_source: "google",
      utm_medium: "cpc",
      utm_campaign: "spring",
      utm_term: "shoes",
      utm_content: "banner",
    };
    const result = parseUtmParams(query);
    expect(result).toEqual({
      utm_source: "google",
      utm_medium: "cpc",
      utm_campaign: "spring",
      utm_term: "shoes",
      utm_content: "banner",
    });
  });

  it("devuelve null para claves ausentes", () => {
    const query: Record<string, string> = {
      utm_source: "newsletter",
      utm_medium: "email",
    };
    const result = parseUtmParams(query);
    expect(result).toEqual({
      utm_source: "newsletter",
      utm_medium: "email",
      utm_campaign: null,
      utm_term: null,
      utm_content: null,
    });
  });

  it("devuelve null para query vacío", () => {
    const result = parseUtmParams({});
    expect(result).toEqual({
      utm_source: null,
      utm_medium: null,
      utm_campaign: null,
      utm_term: null,
      utm_content: null,
    });
  });

  it("maneja valores en array (toma el primero)", () => {
    const query: Record<string, string[]> = {
      utm_source: ["source1", "source2"],
      utm_medium: ["cpc"],
    };
    const result = parseUtmParams(query);
    expect(result.utm_source).toBe("source1");
    expect(result.utm_medium).toBe("cpc");
    expect(result.utm_campaign).toBe(null);
  });

  it("convierte cadenas vacías a null", () => {
    const query: Record<string, string> = {
      utm_source: "",
      utm_medium: "  ",
      utm_campaign: "ok",
    };
    const result = parseUtmParams(query);
    expect(result.utm_source).toBe(null);
    expect(result.utm_medium).toBe(null);
    expect(result.utm_campaign).toBe("ok");
  });

  it("funciona con URLSearchParams", () => {
    const params = new URLSearchParams();
    params.set("utm_source", "twitter");
    params.set("utm_medium", "social");
    const result = parseUtmParams(params);
    expect(result.utm_source).toBe("twitter");
    expect(result.utm_medium).toBe("social");
    expect(result.utm_campaign).toBe(null);
    expect(result.utm_term).toBe(null);
    expect(result.utm_content).toBe(null);
  });
});
