"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createShortenedUrl, type CreateShortUrlResult } from "@/app/actions";

function HomeContent() {
  const searchParams = useSearchParams();
  const [result, setResult] = useState<CreateShortUrlResult | null>(null);
  const showRegisteredSuccess = searchParams?.get("registered") === "1";

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setResult(null);
    const form = e.currentTarget;
    const formData = new FormData(form);
    const res = await createShortenedUrl(formData);
    setResult(res);
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="w-full max-w-lg space-y-6 px-4 py-16">
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          Acortador de URLs
        </h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Introduce una URL y obtendrás un enlace corto que redirige a la misma.
        </p>
        {showRegisteredSuccess && (
          <div
            className="rounded-md border border-green-200 bg-green-50 p-3 text-sm text-green-800 dark:border-green-800 dark:bg-green-950 dark:text-green-200"
            role="status"
          >
            Cuenta creada correctamente.
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="url">URL</Label>
            <Input
              id="url"
              name="url"
              type="url"
              placeholder="https://ejemplo.com"
              required
              aria-invalid={Boolean(result && !result.success)}
              aria-describedby={
                result && !result.success ? "url-error" : undefined
              }
            />
            {result && !result.success && (
              <p
                id="url-error"
                className="text-sm text-red-600 dark:text-red-400"
                role="alert"
              >
                {result.error}
              </p>
            )}
          </div>
          <Button type="submit">Acortar</Button>
        </form>
        {result?.success && (
          <div className="rounded-md border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-900">
            <p className="mb-1 text-sm font-medium text-zinc-700 dark:text-zinc-300">
              URL acortada:
            </p>
            <a
              href={result.shortUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="break-all text-sm text-blue-600 underline dark:text-blue-400"
            >
              {result.shortUrl}
            </a>
          </div>
        )}
      </main>
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={null}>
      <HomeContent />
    </Suspense>
  );
}
