import { prisma } from "./db";

const NULL_LABEL_REFERRER = "direct";
const NULL_LABEL_DIMENSION = "none";

/** Resultado de agregación de visitas por enlace (según contracts/endpoints.md) */
export interface LinkAnalytics {
  totalVisits: number;
  byCountry: Array<{ country: string; count: number }>;
  byDevice: Array<{ device: string; count: number }>;
  byOs: Array<{ os: string; count: number }>;
  byReferrer: Array<{ referrer: string; count: number }>;
  byUtmSource: Array<{ utm_source: string; count: number }>;
  byUtmMedium: Array<{ utm_medium: string; count: number }>;
  byUtmCampaign: Array<{ utm_campaign: string; count: number }>;
  byUtmTerm: Array<{ utm_term: string; count: number }>;
  byUtmContent: Array<{ utm_content: string; count: number }>;
}

function normalizeKey(value: string | null, useDirect: boolean): string {
  if (value === null || value === "")
    return useDirect ? NULL_LABEL_REFERRER : NULL_LABEL_DIMENSION;
  return value;
}

/**
 * Agrega visitas de un enlace: total y desglose por país, device, os, referrer y UTM.
 * Valores null/empty se devuelven como "direct" (referrer) o "none" (resto).
 */
export async function getLinkAnalytics(
  shortenedUrlId: string
): Promise<LinkAnalytics> {
  if (!prisma.visit) {
    throw new Error("Prisma client not regenerated: run pnpm prisma generate");
  }
  const where = { shortenedUrlId };

  const [
    totalVisits,
    countryRows,
    deviceRows,
    osRows,
    referrerRows,
    utmSourceRows,
    utmMediumRows,
    utmCampaignRows,
    utmTermRows,
    utmContentRows,
  ] = await Promise.all([
    prisma.visit.count({ where }),
    prisma.visit.groupBy({ by: ["country"], where, _count: { _all: true } }),
    prisma.visit.groupBy({ by: ["device"], where, _count: { _all: true } }),
    prisma.visit.groupBy({ by: ["os"], where, _count: { _all: true } }),
    prisma.visit.groupBy({ by: ["referrer"], where, _count: { _all: true } }),
    prisma.visit.groupBy({ by: ["utm_source"], where, _count: { _all: true } }),
    prisma.visit.groupBy({ by: ["utm_medium"], where, _count: { _all: true } }),
    prisma.visit.groupBy({
      by: ["utm_campaign"],
      where,
      _count: { _all: true },
    }),
    prisma.visit.groupBy({ by: ["utm_term"], where, _count: { _all: true } }),
    prisma.visit.groupBy({
      by: ["utm_content"],
      where,
      _count: { _all: true },
    }),
  ]);

  return {
    totalVisits,
    byCountry: countryRows.map((r) => ({
      country: normalizeKey(r.country, false),
      count: r._count._all,
    })),
    byDevice: deviceRows.map((r) => ({
      device: normalizeKey(r.device, false),
      count: r._count._all,
    })),
    byOs: osRows.map((r) => ({
      os: normalizeKey(r.os, false),
      count: r._count._all,
    })),
    byReferrer: referrerRows.map((r) => ({
      referrer: normalizeKey(r.referrer, true),
      count: r._count._all,
    })),
    byUtmSource: utmSourceRows.map((r) => ({
      utm_source: normalizeKey(r.utm_source, false),
      count: r._count._all,
    })),
    byUtmMedium: utmMediumRows.map((r) => ({
      utm_medium: normalizeKey(r.utm_medium, false),
      count: r._count._all,
    })),
    byUtmCampaign: utmCampaignRows.map((r) => ({
      utm_campaign: normalizeKey(r.utm_campaign, false),
      count: r._count._all,
    })),
    byUtmTerm: utmTermRows.map((r) => ({
      utm_term: normalizeKey(r.utm_term, false),
      count: r._count._all,
    })),
    byUtmContent: utmContentRows.map((r) => ({
      utm_content: normalizeKey(r.utm_content, false),
      count: r._count._all,
    })),
  };
}
