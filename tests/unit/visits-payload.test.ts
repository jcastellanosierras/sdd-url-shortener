import { describe, it, expect } from "vitest";
import {
  validateVisitPayload,
  safeValidateVisitPayload,
  DEVICE_VALUES,
  OS_VALUES,
} from "@/lib/visits-validations";

describe("visit payload validation (POST /api/visits)", () => {
  const validMinimal = {
    slug: "abc12",
    userAgent:
      "Mozilla/5.0 (Windows NT 10.0; rv:91.0) Gecko/20100101 Firefox/91.0",
  };

  const validWithShortenedUrlId = {
    shortenedUrlId: "clxx123",
    userAgent: "Mozilla/5.0 ...",
  };

  const validFull = {
    slug: "abc12",
    userAgent: "Mozilla/5.0 ...",
    referer: "https://twitter.com/",
    country: "ES",
    region: "MD",
    utm_source: "newsletter",
    utm_medium: "email",
    utm_campaign: "winter",
    utm_term: null,
    utm_content: "banner",
    device: "desktop" as const,
    os: "Windows" as const,
  };

  describe("device: solo mobile | desktop | unknown", () => {
    it("acepta device mobile, desktop y unknown", () => {
      for (const device of DEVICE_VALUES) {
        const payload = { ...validMinimal, device };
        expect(validateVisitPayload(payload).device).toBe(device);
      }
    });

    it("rechaza device inválido", () => {
      expect(() =>
        validateVisitPayload({ ...validMinimal, device: "tablet" })
      ).toThrow();
      expect(() =>
        validateVisitPayload({ ...validMinimal, device: "" })
      ).toThrow();
      expect(() =>
        validateVisitPayload({ ...validMinimal, device: "Mobile" })
      ).toThrow();
    });

    it("device es opcional en el payload", () => {
      expect(validateVisitPayload(validMinimal).device).toBeUndefined();
    });
  });

  describe("os: solo Windows, macOS, Linux, iOS, Android, Other, unknown", () => {
    it("acepta todos los valores de os del data-model", () => {
      for (const os of OS_VALUES) {
        const payload = { ...validMinimal, os };
        expect(validateVisitPayload(payload).os).toBe(os);
      }
    });

    it("rechaza os inválido", () => {
      expect(() =>
        validateVisitPayload({ ...validMinimal, os: "windows" })
      ).toThrow();
      expect(() =>
        validateVisitPayload({ ...validMinimal, os: "Chrome OS" })
      ).toThrow();
      expect(() => validateVisitPayload({ ...validMinimal, os: "" })).toThrow();
    });

    it("os es opcional en el payload", () => {
      expect(validateVisitPayload(validMinimal).os).toBeUndefined();
    });
  });

  describe("campos del payload: slug/shortenedUrlId, userAgent, referer, country, region, utm_*", () => {
    it("acepta payload mínimo con slug y userAgent", () => {
      const result = validateVisitPayload(validMinimal);
      expect(result.slug).toBe("abc12");
      expect(result.userAgent).toBe(validMinimal.userAgent);
    });

    it("acepta payload con shortenedUrlId en lugar de slug", () => {
      const result = validateVisitPayload(validWithShortenedUrlId);
      expect(result.shortenedUrlId).toBe("clxx123");
      expect(result.userAgent).toBe("Mozilla/5.0 ...");
    });

    it("acepta payload completo con referer, country, region y utm_* opcionales", () => {
      const result = validateVisitPayload(validFull);
      expect(result.referer).toBe("https://twitter.com/");
      expect(result.country).toBe("ES");
      expect(result.region).toBe("MD");
      expect(result.utm_source).toBe("newsletter");
      expect(result.utm_medium).toBe("email");
      expect(result.utm_campaign).toBe("winter");
      expect(result.utm_term).toBeNull();
      expect(result.utm_content).toBe("banner");
    });

    it("rechaza si falta slug y shortenedUrlId", () => {
      expect(() =>
        validateVisitPayload({ userAgent: "Mozilla/5.0" })
      ).toThrow();
      expect(() =>
        validateVisitPayload({ slug: "", shortenedUrlId: "", userAgent: "x" })
      ).toThrow();
    });

    it("rechaza si falta userAgent", () => {
      expect(() =>
        validateVisitPayload({ slug: "abc", userAgent: "" })
      ).toThrow();
      expect(() => validateVisitPayload({ slug: "abc" })).toThrow();
    });

    it("safeParse devuelve success: true para payload válido", () => {
      const r = safeValidateVisitPayload(validMinimal);
      expect(r.success).toBe(true);
      if (r.success) expect(r.data.slug).toBe("abc12");
    });

    it("safeParse devuelve success: false para payload inválido", () => {
      const r = safeValidateVisitPayload({});
      expect(r.success).toBe(false);
      if (!r.success) expect(r.error.issues.length).toBeGreaterThan(0);
    });
  });

  describe("forma del payload inválido", () => {
    it("rechaza body que no es objeto", () => {
      expect(() => validateVisitPayload(null)).toThrow();
      expect(() => validateVisitPayload("string")).toThrow();
      expect(() => validateVisitPayload(123)).toThrow();
    });

    it("rechaza tipos incorrectos en campos", () => {
      expect(() =>
        validateVisitPayload({ ...validMinimal, slug: 123 })
      ).toThrow();
      expect(() =>
        validateVisitPayload({ ...validMinimal, userAgent: null })
      ).toThrow();
      expect(() =>
        validateVisitPayload({ ...validMinimal, country: 42 })
      ).toThrow();
    });
  });
});
