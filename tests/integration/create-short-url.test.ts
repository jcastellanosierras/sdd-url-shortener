import { describe, it, expect, vi } from "vitest";

vi.mock("next/headers", () => ({
  headers: vi.fn(() =>
    Promise.resolve(
      new Map([
        ["host", "localhost:3000"],
        ["x-forwarded-proto", "http"],
      ]) as unknown as Headers
    )
  ),
}));

vi.mock("@/lib/db", () => ({
  prisma: {
    shortenedURL: {
      findUnique: vi.fn(() => Promise.resolve(null)),
      create: vi.fn(
        (args: {
          data: {
            slug: string;
            originalUrl: string;
            hasQr?: boolean;
          };
        }) =>
        Promise.resolve({
          id: "1",
          ...args.data,
          hasQr: args.data.hasQr ?? false,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
      ),
    },
  },
}));

import { createShortenedUrl } from "@/app/actions";

describe("createShortenedUrl", () => {
  it("returns shortUrl for valid URL", async () => {
    const formData = new FormData();
    formData.set("url", "https://example.com/valid");

    const result = await createShortenedUrl(formData);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.shortUrl).toMatch(/^https?:\/\/.+\/[a-zA-Z0-9]{8}$/);
      expect(result.hasQr).toBe(false);
      expect(result.qrUrl).toBeNull();
    }
  });

  it("returns shortUrl and qrUrl when QR is requested", async () => {
    const formData = new FormData();
    formData.set("url", "https://example.com/with-qr");
    formData.set("generateQr", "on");

    const result = await createShortenedUrl(formData);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.hasQr).toBe(true);
      expect(result.qrUrl).toMatch(/^\/api\/links\/.+\/qr$/);
    }
  });

  it("returns error for invalid URL", async () => {
    const formData = new FormData();
    formData.set("url", "not-a-url");

    const result = await createShortenedUrl(formData);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBeTruthy();
    }
  });

  it("returns error for empty URL", async () => {
    const formData = new FormData();
    formData.set("url", "   ");

    const result = await createShortenedUrl(formData);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBeTruthy();
    }
  });
});
