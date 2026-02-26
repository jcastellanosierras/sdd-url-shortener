import { describe, it, expect, afterEach, vi } from "vitest";
import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";

vi.mock("next/headers", () => ({
  headers: vi.fn(() => Promise.resolve(new Headers())),
}));

const getSessionMock = vi.fn();
vi.mock("@/lib/auth", () => ({
  auth: {
    api: {
      getSession: (opts: unknown) => getSessionMock(opts),
    },
  },
}));

import { GET } from "@/app/api/links/[slug]/analytics/route";

/**
 * Tests de integración para GET analíticas de enlace (004-link-analytics).
 * T012: owner GET → 200 con totalVisits y breakdowns.
 * T013: no propietario GET → 403 Forbidden.
 */
describe("GET /api/links/[slug]/analytics", () => {
  let userAId: string;
  let userBId: string;
  let slug: string;
  let shortenedUrlId: string;

  afterEach(async () => {
    if (shortenedUrlId) {
      await prisma.visit.deleteMany({ where: { shortenedUrlId } });
      await prisma.shortenedURL
        .delete({ where: { id: shortenedUrlId } })
        .catch(() => {});
    }
    if (userAId)
      await prisma.user.delete({ where: { id: userAId } }).catch(() => {});
    if (userBId)
      await prisma.user.delete({ where: { id: userBId } }).catch(() => {});
  });

  it("T012: propietario obtiene 200 con totalVisits y desgloses (byCountry, byDevice, byOs, byReferrer, byUtm*)", async () => {
    const owner = await prisma.user.create({
      data: {
        name: "Owner T012",
        email: `t012-${Date.now()}@test.local`,
        emailVerified: false,
      },
    });
    userAId = owner.id;

    const link = await prisma.shortenedURL.create({
      data: {
        slug: `t012-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`,
        originalUrl: "https://example.com/t012",
        userId: owner.id,
      },
    });
    slug = link.slug;
    shortenedUrlId = link.id;

    await prisma.visit.createMany({
      data: [
        {
          shortenedUrlId,
          country: "ES",
          device: "mobile",
          os: "Android",
          referrer: "https://twitter.com/",
          utm_source: "newsletter",
        },
        {
          shortenedUrlId,
          country: "ES",
          device: "desktop",
          os: "Windows",
          referrer: null,
          utm_source: null,
        },
        {
          shortenedUrlId,
          country: "MX",
          device: "mobile",
          os: "iOS",
          referrer: "https://twitter.com/",
          utm_source: "newsletter",
        },
      ],
    });

    getSessionMock.mockResolvedValue({ user: { id: owner.id } });

    const request = new NextRequest(
      `http://localhost:3000/api/links/${slug}/analytics`
    );
    const response = await GET(request, {
      params: Promise.resolve({ slug }),
    });

    expect(response.status).toBe(200);

    const data = await response.json();
    expect(typeof data.totalVisits).toBe("number");
    expect(data.totalVisits).toBe(3);

    expect(Array.isArray(data.byCountry)).toBe(true);
    expect(data.byCountry.length).toBeGreaterThan(0);
    expect(data.byCountry[0]).toMatchObject(
      expect.objectContaining({
        country: expect.any(String),
        count: expect.any(Number),
      })
    );

    expect(Array.isArray(data.byDevice)).toBe(true);
    expect(data.byDevice.length).toBeGreaterThan(0);
    expect(data.byDevice[0]).toMatchObject(
      expect.objectContaining({
        device: expect.any(String),
        count: expect.any(Number),
      })
    );

    expect(Array.isArray(data.byOs)).toBe(true);
    expect(data.byOs.length).toBeGreaterThan(0);
    expect(data.byOs[0]).toMatchObject(
      expect.objectContaining({
        os: expect.any(String),
        count: expect.any(Number),
      })
    );

    expect(Array.isArray(data.byReferrer)).toBe(true);
    expect(data.byReferrer.length).toBeGreaterThan(0);
    const refItem = data.byReferrer[0];
    expect(refItem).toHaveProperty("count");
    expect(typeof refItem.count).toBe("number");
    expect(
      refItem.hasOwnProperty("referrer") || refItem.hasOwnProperty("key")
    ).toBe(true);

    const utmKeys = Object.keys(data).filter((k) => k.startsWith("byUtm"));
    expect(utmKeys.length).toBeGreaterThanOrEqual(1);
    const firstUtmKey = utmKeys[0];
    expect(Array.isArray(data[firstUtmKey])).toBe(true);
    if (data[firstUtmKey].length > 0) {
      const utmItem = data[firstUtmKey][0];
      expect(utmItem).toHaveProperty("count");
      expect(typeof utmItem.count).toBe("number");
    }
  });

  it("T013: usuario no propietario recibe 403 al hacer GET analíticas del enlace", async () => {
    const userA = await prisma.user.create({
      data: {
        name: "User A",
        email: `t013-a-${Date.now()}@test.local`,
        emailVerified: true,
      },
    });
    const userB = await prisma.user.create({
      data: {
        name: "User B",
        email: `t013-b-${Date.now()}@test.local`,
        emailVerified: true,
      },
    });
    userAId = userA.id;
    userBId = userB.id;

    const link = await prisma.shortenedURL.create({
      data: {
        slug: `t013-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`,
        originalUrl: "https://example.com/t013",
        userId: userA.id,
      },
    });
    slug = link.slug;
    shortenedUrlId = link.id;

    await prisma.visit.create({
      data: {
        shortenedUrlId,
        device: "desktop",
        os: "Windows",
      },
    });

    getSessionMock.mockResolvedValue({
      user: { id: userB.id },
    });

    const request = new NextRequest(
      `http://localhost:3000/api/links/${slug}/analytics`
    );
    const response = await GET(request, {
      params: Promise.resolve({ slug }),
    });

    expect(response.status).toBe(403);
  });
});
