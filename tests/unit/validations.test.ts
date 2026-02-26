import { describe, it, expect } from "vitest";
import { urlSchema } from "@/lib/validations";

describe("urlSchema", () => {
  it("accepts valid https URL", () => {
    expect(urlSchema.parse("https://example.com")).toBe("https://example.com");
    expect(urlSchema.parse("https://sub.ejemplo.com/ruta?q=1")).toBe(
      "https://sub.ejemplo.com/ruta?q=1"
    );
  });

  it("accepts valid http URL", () => {
    expect(urlSchema.parse("http://localhost:3000")).toBe("http://localhost:3000");
  });

  it("rejects empty string", () => {
    expect(() => urlSchema.parse("")).toThrow();
  });

  it("rejects invalid URL", () => {
    expect(() => urlSchema.parse("not a url")).toThrow();
    expect(() => urlSchema.parse("ftp://example.com")).toThrow();
  });

  it("rejects URL without http/https scheme", () => {
    expect(() => urlSchema.parse("javascript:alert(1)")).toThrow();
  });
});
