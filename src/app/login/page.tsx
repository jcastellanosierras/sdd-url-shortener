"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signIn } from "@/lib/auth-client";
import { loginSchema } from "@/lib/validations";

export default function LoginPage() {
  const router = useRouter();
  const [errors, setErrors] = useState<{ email?: string; password?: string }>(
    {}
  );
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrors({});
    setFormError(null);
    const form = e.currentTarget;
    const formData = new FormData(form);
    const data = {
      email: (formData.get("email") as string) ?? "",
      password: (formData.get("password") as string) ?? "",
    };
    const result = loginSchema.safeParse(data);
    if (!result.success) {
      const fieldErrors: { email?: string; password?: string } = {};
      result.error
        .flatten()
        .fieldErrors.email?.forEach((msg) => (fieldErrors.email = msg));
      result.error
        .flatten()
        .fieldErrors.password?.forEach((msg) => (fieldErrors.password = msg));
      setErrors(fieldErrors);
      return;
    }
    setIsSubmitting(true);
    const { data: signInData, error } = await signIn.email({
      email: result.data.email,
      password: result.data.password,
    });
    setIsSubmitting(false);
    if (error) {
      setFormError("Credenciales incorrectas");
      return;
    }
    if (signInData) {
      router.push("/");
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="w-full max-w-md space-y-6 px-4 py-16">
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          Iniciar sesión
        </h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          {formError && (
            <p
              className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-950 dark:text-red-400"
              role="alert"
            >
              {formError}
            </p>
          )}
          <div className="space-y-2">
            <Label htmlFor="email">Correo</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="tu@correo.com"
              autoComplete="email"
              aria-invalid={Boolean(errors.email)}
              aria-describedby={errors.email ? "email-error" : undefined}
            />
            {errors.email && (
              <p
                id="email-error"
                className="text-sm text-red-600 dark:text-red-400"
                role="alert"
              >
                {errors.email}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Contraseña</Label>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="••••••••"
              autoComplete="current-password"
              aria-invalid={Boolean(errors.password)}
              aria-describedby={errors.password ? "password-error" : undefined}
            />
            {errors.password && (
              <p
                id="password-error"
                className="text-sm text-red-600 dark:text-red-400"
                role="alert"
              >
                {errors.password}
              </p>
            )}
          </div>
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Entrando…" : "Entrar"}
          </Button>
        </form>
        <p className="text-center text-sm text-zinc-600 dark:text-zinc-400">
          ¿No tienes cuenta?{" "}
          <Link
            href="/register"
            className="font-medium text-zinc-900 underline underline-offset-2 dark:text-zinc-50"
          >
            Regístrate
          </Link>
        </p>
      </main>
    </div>
  );
}
