"use server";

import { headers } from "next/headers";
import { urlSchema } from "@/lib/validations";
import { generateSlug } from "@/lib/slug";
import { prisma } from "@/lib/db";

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
    const msg = (first && "message" in first ? first.message : undefined) ?? "URL no válida";
    return { success: false, error: String(msg) };
  }

  const originalUrl = parsed.data;

  let slug = generateSlug(8);
  const maxAttempts = 5;
  for (let i = 0; i < maxAttempts; i++) {
    const existing = await prisma.shortenedURL.findUnique({ where: { slug } });
    if (!existing) break;
    slug = generateSlug(8);
  }

  await prisma.shortenedURL.create({
    data: { slug, originalUrl },
  });

  const h = await headers();
  const host = h.get("host") ?? "localhost:3000";
  const proto = h.get("x-forwarded-proto") ?? "http";
  const baseUrl = `${proto}://${host}`;
  const shortUrl = `${baseUrl}/${slug}`;

  return { success: true, shortUrl };
}
