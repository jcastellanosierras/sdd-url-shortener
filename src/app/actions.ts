"use server";

import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { generateSlug } from "@/lib/slug";
import { urlSchema } from "@/lib/validations";

export type CreateShortUrlResult =
  | { success: true; shortUrl: string }
  | { success: false; error: string };

export async function createShortenedUrl(
  formData: FormData
): Promise<CreateShortUrlResult> {
  const raw = formData.get("url");
  const url = typeof raw === "string" ? raw.trim() : "";

  const parsed = urlSchema.safeParse(url);
  if (!parsed.success) {
    const first = parsed.error.issues?.[0];
    const msg =
      (first && "message" in first ? first.message : undefined) ??
      "URL no válida";
    return { success: false, error: String(msg) };
  }

  const originalUrl = parsed.data;

  const h = await headers();
  const session = await auth.api.getSession({ headers: h });
  const userId = session?.user?.id ?? null;

  let slug = generateSlug(8);
  const maxAttempts = 5;
  for (let i = 0; i < maxAttempts; i++) {
    const existing = await prisma.shortenedURL.findUnique({ where: { slug } });
    if (!existing) break;
    slug = generateSlug(8);
  }

  await prisma.shortenedURL.create({
    data: { slug, originalUrl, userId },
  });

  const host = h.get("host") ?? "localhost:3000";
  const proto = h.get("x-forwarded-proto") ?? "http";
  const baseUrl = `${proto}://${host}`;
  const shortUrl = `${baseUrl}/${slug}`;

  return { success: true, shortUrl };
}
