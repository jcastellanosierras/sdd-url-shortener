import { describe, it, expect, vi } from "vitest";
import { NextRequest } from "next/server";
import { GET } from "@/app/[slug]/route";

vi.mock("@/lib/db", () => ({
  prisma: {
    shortenedURL: {
      findUnique: vi.fn(),
    },
  },
}));

import { prisma } from "@/lib/db";

describe("GET /[slug]", () => {
  it("returns 302 redirect to originalUrl when slug exists", async () => {
    vi.mocked(prisma.shortenedURL.findUnique).mockResolvedValueOnce({
      id: "1",
      slug: "abc12xy",
      originalUrl: "https://example.com/target",
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const request = new NextRequest("http://localhost:3000/abc12xy");
    const response = await GET(request, { params: Promise.resolve({ slug: "abc12xy" }) });

    expect(response.status).toBe(302);
    expect(response.headers.get("location")).toBe("https://example.com/target");
  });

  it("returns 404 when slug does not exist", async () => {
    vi.mocked(prisma.shortenedURL.findUnique).mockResolvedValueOnce(null);

    const request = new NextRequest("http://localhost:3000/nonexistent");
    const response = await GET(request, { params: Promise.resolve({ slug: "nonexistent" }) });

    expect(response.status).toBe(404);
    const json = await response.json();
    expect(json.error).toBeTruthy();
  });
});
