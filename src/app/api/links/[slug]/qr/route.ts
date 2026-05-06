import { headers } from "next/headers";
import { NextResponse } from "next/server";
import QRCode from "qrcode";
import { prisma } from "@/lib/db";

interface RouteContext {
  params: Promise<{ slug: string }>;
}

export async function GET(request: Request, context: RouteContext) {
  const { slug } = await context.params;
  const link = await prisma.shortenedURL.findUnique({ where: { slug } });

  if (!link) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const h = await headers();
  const host = h.get("host") ?? "localhost:3000";
  const proto = h.get("x-forwarded-proto") ?? "http";
  const shortUrl = `${proto}://${host}/${slug}`;

  const image = await QRCode.toBuffer(shortUrl, {
    type: "png",
    width: 512,
    margin: 1,
  });
  const body = new Uint8Array(image);

  const isDownload = new URL(request.url).searchParams.get("download") === "1";

  return new NextResponse(body, {
    status: 200,
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "public, max-age=3600",
      ...(isDownload
        ? {
            "Content-Disposition": `attachment; filename="${slug}-qr.png"`,
          }
        : {}),
    },
  });
}
