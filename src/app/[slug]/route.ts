import { after } from "next/server";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { registerVisitFromRedirect } from "@/lib/visits-register";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const row = await prisma.shortenedURL.findUnique({
    where: { slug },
  });
  if (!row) {
    return NextResponse.json(
      { error: "Enlace no encontrado" },
      { status: 404 }
    );
  }
  after(() => {
    registerVisitFromRedirect(row.id, request).catch(() => {});
  });
  return NextResponse.redirect(row.originalUrl, 302);
}
