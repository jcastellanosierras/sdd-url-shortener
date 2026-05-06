import { headers } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import type { ShortenedURL } from "@prisma/client";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export default async function DashboardPage() {
  const h = await headers();
  const session = await auth.api.getSession({ headers: h });
  if (!session) {
    redirect("/login");
  }

  const items = await prisma.shortenedURL.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
  });

  const host = h.get("host") ?? "localhost:3000";
  const proto = h.get("x-forwarded-proto") ?? "http";
  const baseUrl = `${proto}://${host}`;

  return (
    <main className="mx-auto max-w-2xl px-4 py-8">
      <Link
        href="/"
        className="mb-6 inline-block rounded bg-gray-200 px-4 py-2 text-sm font-medium text-gray-800 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
      >
        Volver a la página principal
      </Link>
      <h1 className="mb-6 text-2xl font-bold">Tus URLs acortadas</h1>
      {items.length === 0 ? (
        <p className="text-gray-600 dark:text-gray-400">
          Aún no tienes URLs acortadas.
        </p>
      ) : (
        <ul className="space-y-4">
          {items.map((item: ShortenedURL) => (
            <li
              key={item.id}
              className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800"
            >
              <p className="font-mono text-sm text-blue-600 dark:text-blue-400">
                <a
                  href={`${baseUrl}/${item.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {baseUrl}/{item.slug}
                </a>
              </p>
              <p
                className="mt-1 truncate text-sm text-gray-600 dark:text-gray-400"
                title={item.originalUrl}
              >
                → {item.originalUrl}
              </p>
              {item.hasQr && (
                <div className="mt-3">
                  <Image
                    src={`/api/links/${item.slug}/qr`}
                    alt={`Codigo QR para ${item.slug}`}
                    width={96}
                    height={96}
                    className="h-24 w-24 rounded border border-gray-200 bg-white p-1 dark:border-gray-700"
                  />
                  <a
                    href={`/api/links/${item.slug}/qr?download=1`}
                    className="mt-2 inline-block text-sm text-blue-600 underline dark:text-blue-400"
                  >
                    Descargar QR
                  </a>
                </div>
              )}
              <Link
                href={`/dashboard/links/${item.slug}/analytics`}
                className="mt-2 inline-block rounded bg-gray-200 px-3 py-1.5 text-sm font-medium text-gray-800 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
              >
                Ver analíticas
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
