import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(
  _request: NextRequest,
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
  return NextResponse.redirect(row.originalUrl, 302);
}
