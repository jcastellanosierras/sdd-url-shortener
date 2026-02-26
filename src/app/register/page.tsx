"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signUp } from "@/lib/auth-client";
import { registerSchema, type RegisterInput } from "@/lib/validations";

type FieldErrors = Partial<Record<keyof RegisterInput, string[]>>;

const EMAIL_EXISTS_CODE = "USER_ALREADY_EXISTS";

export default function RegisterPage() {
  const router = useRouter();
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFieldErrors({});
    setServerError(null);

    const form = e.currentTarget;
    const formData = new FormData(form);
    const raw = {
      name: (formData.get("name") as string) ?? "",
      email: (formData.get("email") as string) ?? "",
      password: (formData.get("password") as string) ?? "",
      passwordConfirm: (formData.get("passwordConfirm") as string) ?? "",
    };

    const result = registerSchema.safeParse(raw);

    if (!result.success) {
      const flattened = result.error.flatten();
      setFieldErrors(flattened.fieldErrors as FieldErrors);
      return;
    }

    const { name, email, password } = result.data;
    setIsSubmitting(true);

    const { data, error } = await signUp.email({
      email,
      password,
      name,
      callbackURL: "/",
    });

    setIsSubmitting(false);

    if (error) {
      const isEmailExists =
        error.code === EMAIL_EXISTS_CODE ||
        /already exists|already registered|ya está registrado/i.test(
          error.message ?? ""
        );
      setServerError(
        isEmailExists
          ? "Este correo ya está registrado"
          : "Error al crear la cuenta. Inténtalo de nuevo."
      );
      return;
    }

    if (data) {
      router.push("/?registered=1");
    }
  }

  const getError = (field: keyof FieldErrors) => fieldErrors[field]?.[0];

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="w-full max-w-lg space-y-6 px-4 py-16">
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          Registro
        </h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Crea una cuenta para guardar y gestionar tus enlaces cortos.
        </p>

        {(Object.keys(fieldErrors).length > 0 || serverError) && (
          <div
            className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-200"
            role="alert"
          >
            {serverError ? (
              <p>{serverError}</p>
            ) : (
              <>
                <p className="font-medium">
                  Revisa los errores del formulario:
                </p>
                <ul className="mt-1 list-inside list-disc">
                  {Object.entries(fieldErrors).map(([field, messages]) =>
                    messages?.map((msg, i) => (
                      <li key={`${field}-${i}`}>{msg}</li>
                    ))
                  )}
                </ul>
              </>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nombre</Label>
            <Input
              id="name"
              name="name"
              type="text"
              placeholder="Tu nombre"
              autoComplete="name"
              aria-invalid={Boolean(getError("name"))}
              aria-describedby={getError("name") ? "name-error" : undefined}
            />
            {getError("name") && (
              <p
                id="name-error"
                className="text-sm text-red-600 dark:text-red-400"
                role="alert"
              >
                {getError("name")}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Correo electrónico</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="tu@correo.com"
              autoComplete="email"
              aria-invalid={Boolean(getError("email"))}
              aria-describedby={getError("email") ? "email-error" : undefined}
            />
            {getError("email") && (
              <p
                id="email-error"
                className="text-sm text-red-600 dark:text-red-400"
                role="alert"
              >
                {getError("email")}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Contraseña</Label>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="Mínimo 8 caracteres"
              autoComplete="new-password"
              aria-invalid={Boolean(getError("password"))}
              aria-describedby={
                getError("password") ? "password-error" : undefined
              }
            />
            {getError("password") && (
              <p
                id="password-error"
                className="text-sm text-red-600 dark:text-red-400"
                role="alert"
              >
                {getError("password")}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="passwordConfirm">Confirmar contraseña</Label>
            <Input
              id="passwordConfirm"
              name="passwordConfirm"
              type="password"
              placeholder="Repite la contraseña"
              autoComplete="new-password"
              aria-invalid={Boolean(getError("passwordConfirm"))}
              aria-describedby={
                getError("passwordConfirm")
                  ? "passwordConfirm-error"
                  : undefined
              }
            />
            {getError("passwordConfirm") && (
              <p
                id="passwordConfirm-error"
                className="text-sm text-red-600 dark:text-red-400"
                role="alert"
              >
                {getError("passwordConfirm")}
              </p>
            )}
          </div>

          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Creando cuenta…" : "Registrarse"}
          </Button>
        </form>

        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          ¿Ya tienes cuenta?{" "}
          <Link
            href="/login"
            className="font-medium text-zinc-900 underline underline-offset-2 hover:no-underline dark:text-zinc-50"
          >
            Iniciar sesión
          </Link>
        </p>
      </main>
    </div>
  );
}
