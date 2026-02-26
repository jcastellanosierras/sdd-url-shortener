import { describe, it, expect, afterEach, vi } from "vitest";
import { NextRequest } from "next/server";
import { GET } from "@/app/[slug]/route";
import { prisma } from "@/lib/db";

// after() de Next.js solo existe en request scope; en Vitest no hay. Mockeamos para
// que el callback se ejecute en el mismo proceso y podamos comprobar la visita en DB.
vi.mock("next/server", async (importOriginal) => {
  const mod = await importOriginal<typeof import("next/server")>();
  return {
    ...mod,
    after: (fn: () => void | Promise<void>) => {
      void Promise.resolve().then(() => fn());
    },
  };
});

/**
 * Test de integración T007: GET /[slug] devuelve 302, Location = originalUrl,
 * y se persiste exactamente una visita (redirect + registro fire-and-forget vía after()).
 *
 * Patrón: mismo que redirect.test.ts (invocar handler directamente), pero sin mock
 * de Prisma para poder comprobar la persistencia en la tabla Visit. Se usa la misma
 * DB que el resto del proyecto (DATABASE_URL o dev.db). Se crea un ShortenedURL
 * en el test y se limpia después.
 */
describe("GET /[slug] — redirect y persistencia de visita", () => {
  const originalUrl = "https://example.com/destino";
  let slug: string;
  let shortenedUrlId: string;

  afterEach(async () => {
    if (shortenedUrlId) {
      await prisma.visit.deleteMany({ where: { shortenedUrlId } });
      await prisma.shortenedURL
        .delete({ where: { id: shortenedUrlId } })
        .catch(() => {});
    }
  });

  it("devuelve 302, Location = originalUrl y se persiste exactamente una visita", async () => {
    const row = await prisma.shortenedURL.create({
      data: {
        slug: `t007-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`,
        originalUrl,
      },
    });
    slug = row.slug;
    shortenedUrlId = row.id;

    const request = new NextRequest(`http://localhost:3000/${slug}`, {
      headers: { "user-agent": "Mozilla/5.0 (Test) Vitest" },
    });

    const response = await GET(request, {
      params: Promise.resolve({ slug }),
    });

    expect(response.status).toBe(302);
    expect(response.headers.get("location")).toBe(originalUrl);

    // after() se ejecuta en el mismo proceso; dar tiempo a que se programe y ejecute.
    await new Promise((r) => setTimeout(r, 50));

    const count = await prisma.visit.count({
      where: { shortenedUrlId },
    });
    expect(count).toBe(1);
  });
});
