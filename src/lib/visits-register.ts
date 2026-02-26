import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { parseUserAgent } from "@/lib/visits-parsing";
import { parseUtmParams } from "@/lib/visits-parsing";
import type { Device, Os } from "@/lib/visits-validations";

export interface VisitData {
  device: Device;
  os: Os;
  referrer?: string | null;
  country?: string | null;
  region?: string | null;
  utm_source?: string | null;
  utm_medium?: string | null;
  utm_campaign?: string | null;
  utm_term?: string | null;
  utm_content?: string | null;
}

/**
 * Persiste una visita en DB asociada a un shortenedUrlId.
 * Usado por el route [slug] (después del redirect) y por POST /api/visits.
 */
export async function createVisitInDb(
  shortenedUrlId: string,
  data: VisitData
): Promise<void> {
  await prisma.visit.create({
    data: {
      shortenedUrlId,
      device: data.device,
      os: data.os,
      referrer: data.referrer ?? null,
      country: data.country ?? null,
      region: data.region ?? null,
      utm_source: data.utm_source ?? null,
      utm_medium: data.utm_medium ?? null,
      utm_campaign: data.utm_campaign ?? null,
      utm_term: data.utm_term ?? null,
      utm_content: data.utm_content ?? null,
    },
  });
}

/**
 * Construye datos de visita desde la request (headers + URL para UTM)
 * y persiste la visita. Usado en after() del GET /[slug].
 */
export async function registerVisitFromRedirect(
  shortenedUrlId: string,
  request: NextRequest
): Promise<void> {
  const userAgent = request.headers.get("user-agent") ?? "";
  const { device, os } = parseUserAgent(userAgent);
  const referrer = request.headers.get("referer") ?? null;
  const rawCountry = request.headers.get("x-vercel-ip-country");
  const rawRegion = request.headers.get("x-vercel-ip-country-region");
  const country = rawCountry ? rawCountry.slice(0, 10) : null;
  const region = rawRegion ? rawRegion.slice(0, 50) : null;
  const url = request.url ? new URL(request.url) : null;
  const utm = url ? parseUtmParams(url.searchParams) : null;

  await createVisitInDb(shortenedUrlId, {
    device,
    os,
    referrer: referrer ?? undefined,
    country,
    region,
    utm_source: utm?.utm_source ?? undefined,
    utm_medium: utm?.utm_medium ?? undefined,
    utm_campaign: utm?.utm_campaign ?? undefined,
    utm_term: utm?.utm_term ?? undefined,
    utm_content: utm?.utm_content ?? undefined,
  });
}
