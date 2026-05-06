import { describe, it, expect, vi } from "vitest";
import { NextRequest } from "next/server";
import { GET } from "@/app/api/links/[slug]/qr/route";

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
      findUnique: vi.fn(),
    },
  },
}));

vi.mock("qrcode", () => ({
  default: {
    toBuffer: vi.fn(() => Promise.resolve(Buffer.from("fake-png"))),
  },
}));

import { prisma } from "@/lib/db";

describe("GET /api/links/[slug]/qr", () => {
  it("returns PNG image for existing slug", async () => {
    vi.mocked(prisma.shortenedURL.findUnique).mockResolvedValueOnce({
      id: "1",
      slug: "abc12345",
      originalUrl: "https://example.com",
      hasQr: true,
      userId: "user1",
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const request = new NextRequest("http://localhost:3000/api/links/abc12345/qr");
    const response = await GET(request, {
      params: Promise.resolve({ slug: "abc12345" }),
    });

    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toContain("image/png");
    expect(response.headers.get("content-disposition")).toBeNull();
  });

  it("adds attachment header when download=1", async () => {
    vi.mocked(prisma.shortenedURL.findUnique).mockResolvedValueOnce({
      id: "1",
      slug: "xyz98765",
      originalUrl: "https://example.com",
      hasQr: true,
      userId: "user1",
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const request = new NextRequest(
      "http://localhost:3000/api/links/xyz98765/qr?download=1"
    );
    const response = await GET(request, {
      params: Promise.resolve({ slug: "xyz98765" }),
    });

    expect(response.status).toBe(200);
    expect(response.headers.get("content-disposition")).toBe(
      'attachment; filename="xyz98765-qr.png"'
    );
  });

  it("returns 404 when slug does not exist", async () => {
    vi.mocked(prisma.shortenedURL.findUnique).mockResolvedValueOnce(null);

    const request = new NextRequest("http://localhost:3000/api/links/missing/qr");
    const response = await GET(request, {
      params: Promise.resolve({ slug: "missing" }),
    });

    expect(response.status).toBe(404);
    const json = await response.json();
    expect(json.error).toBeTruthy();
  });
});
