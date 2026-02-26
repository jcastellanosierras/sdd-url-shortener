import { headers } from "next/headers";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getLinkAnalytics } from "@/lib/analytics";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function LinkAnalyticsPage({ params }: PageProps) {
  const h = await headers();
  const session = await auth.api.getSession({ headers: h });
  if (!session) {
    redirect("/login");
  }

  const { slug } = await params;
  const link = await prisma.shortenedURL.findUnique({
    where: { slug },
  });

  if (!link) {
    notFound();
  }

  if (link.userId !== session.user.id) {
    redirect("/dashboard");
  }

  const analytics = await getLinkAnalytics(link.id);

  const host = h.get("host") ?? "localhost:3000";
  const proto = h.get("x-forwarded-proto") ?? "http";
  const baseUrl = `${proto}://${host}`;

  return (
    <main className="mx-auto max-w-2xl px-4 py-8">
      <Link
        href="/dashboard"
        className="mb-6 inline-block rounded bg-gray-200 px-4 py-2 text-sm font-medium text-gray-800 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
      >
        Volver al dashboard
      </Link>

      <h1 className="mb-2 text-2xl font-bold">Analíticas del enlace</h1>
      <p className="mb-6 font-mono text-sm text-blue-600 dark:text-blue-400">
        <a
          href={`${baseUrl}/${link.slug}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          {baseUrl}/{link.slug}
        </a>
      </p>
      <p
        className="mb-6 truncate text-sm text-gray-600 dark:text-gray-400"
        title={link.originalUrl}
      >
        → {link.originalUrl}
      </p>

      <section className="mb-8 rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
        <h2 className="mb-2 text-lg font-semibold">Total de visitas</h2>
        <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          {analytics.totalVisits}
        </p>
      </section>

      <SectionTable
        title="Por país"
        headers={["País", "Visitas"]}
        rows={analytics.byCountry.map((r) => [r.country, r.count])}
      />
      <SectionTable
        title="Por dispositivo"
        headers={["Dispositivo", "Visitas"]}
        rows={analytics.byDevice.map((r) => [r.device, r.count])}
      />
      <SectionTable
        title="Por sistema operativo"
        headers={["SO", "Visitas"]}
        rows={analytics.byOs.map((r) => [r.os, r.count])}
      />
      <SectionTable
        title="Por referrer"
        headers={["Referrer", "Visitas"]}
        rows={analytics.byReferrer.map((r) => [r.referrer, r.count])}
      />
      <SectionTable
        title="Por UTM source"
        headers={["utm_source", "Visitas"]}
        rows={analytics.byUtmSource.map((r) => [r.utm_source, r.count])}
      />
      <SectionTable
        title="Por UTM medium"
        headers={["utm_medium", "Visitas"]}
        rows={analytics.byUtmMedium.map((r) => [r.utm_medium, r.count])}
      />
      <SectionTable
        title="Por UTM campaign"
        headers={["utm_campaign", "Visitas"]}
        rows={analytics.byUtmCampaign.map((r) => [r.utm_campaign, r.count])}
      />
      <SectionTable
        title="Por UTM term"
        headers={["utm_term", "Visitas"]}
        rows={analytics.byUtmTerm.map((r) => [r.utm_term, r.count])}
      />
      <SectionTable
        title="Por UTM content"
        headers={["utm_content", "Visitas"]}
        rows={analytics.byUtmContent.map((r) => [r.utm_content, r.count])}
      />
    </main>
  );
}

function SectionTable({
  title,
  headers,
  rows,
}: {
  title: string;
  headers: [string, string];
  rows: (string | number)[][];
}) {
  if (rows.length === 0) return null;
  return (
    <section className="mb-8 rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
      <h2 className="mb-3 text-lg font-semibold">{title}</h2>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-600">
              <th className="pb-2 pr-4 text-left font-medium text-gray-700 dark:text-gray-300">
                {headers[0]}
              </th>
              <th className="pb-2 text-right font-medium text-gray-700 dark:text-gray-300">
                {headers[1]}
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map(([label, count], i) => (
              <tr
                key={i}
                className="border-b border-gray-100 last:border-0 dark:border-gray-700"
              >
                <td className="py-2 pr-4 text-gray-800 dark:text-gray-200">
                  {String(label)}
                </td>
                <td className="py-2 text-right text-gray-600 dark:text-gray-400">
                  {count}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
