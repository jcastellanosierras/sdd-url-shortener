import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { parseUserAgent } from "@/lib/visits-parsing";
import { createVisitInDb } from "@/lib/visits-register";
import {
  safeValidateVisitPayload,
  type Device,
  type Os,
} from "@/lib/visits-validations";
import { DEVICE_VALUES, OS_VALUES } from "@/lib/visits-validations";

function isDevice(s: string): s is Device {
  return (DEVICE_VALUES as readonly string[]).includes(s);
}
function isOs(s: string): s is Os {
  return (OS_VALUES as readonly string[]).includes(s);
}

/**
 * POST /api/visits — Registrar visita (interno, fire-and-forget desde GET /[slug]).
 */
export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Body JSON inválido" }, { status: 400 });
  }

  const parsed = safeValidateVisitPayload(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Payload inválido", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const payload = parsed.data;
  let shortenedUrlId: string | null = payload.shortenedUrlId ?? null;

  if (!shortenedUrlId && payload.slug) {
    const row = await prisma.shortenedURL.findUnique({
      where: { slug: payload.slug },
    });
    if (!row) {
      return NextResponse.json(
        { error: "Enlace no encontrado" },
        { status: 404 }
      );
    }
    shortenedUrlId = row.id;
  }

  if (!shortenedUrlId) {
    return NextResponse.json(
      { error: "Se requiere slug o shortenedUrlId" },
      { status: 400 }
    );
  }

  const { device: parsedDevice, os: parsedOs } = parseUserAgent(
    payload.userAgent
  );
  const device: Device =
    payload.device && isDevice(payload.device) ? payload.device : parsedDevice;
  const os: Os = payload.os && isOs(payload.os) ? payload.os : parsedOs;

  const rawCountry =
    payload.country ?? request.headers.get("x-vercel-ip-country") ?? null;
  const rawRegion =
    payload.region ?? request.headers.get("x-vercel-ip-country-region") ?? null;
  const country = rawCountry ? rawCountry.slice(0, 10) : null;
  const region = rawRegion ? rawRegion.slice(0, 50) : null;

  await createVisitInDb(shortenedUrlId, {
    device,
    os,
    referrer: payload.referer ?? null,
    country,
    region,
    utm_source: payload.utm_source ?? null,
    utm_medium: payload.utm_medium ?? null,
    utm_campaign: payload.utm_campaign ?? null,
    utm_term: payload.utm_term ?? null,
    utm_content: payload.utm_content ?? null,
  });

  return NextResponse.json({ ok: true }, { status: 201 });
}
