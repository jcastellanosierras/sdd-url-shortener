import { z } from "zod";

/**
 * Schema for a valid URL (http or https only). Used before creating a ShortenedURL.
 */
export const urlSchema = z
  .string()
  .min(1, "La URL no puede estar vacía")
  .url("Introduce una URL válida")
  .refine(
    (val) => val.startsWith("http://") || val.startsWith("https://"),
    "La URL debe comenzar por http:// o https://"
  );

export type UrlInput = z.infer<typeof urlSchema>;

/**
 * Schema for login form. Email and password, basic validations.
 */
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "El correo no puede estar vacío")
    .email("Introduce un correo válido"),
  password: z.string().min(1, "La contraseña no puede estar vacía"),
});

export type LoginInput = z.infer<typeof loginSchema>;

/**
 * Schema for registration form. Name, email, password with confirmation.
 */
export const registerSchema = z
  .object({
    name: z.string().min(1, "El nombre no puede estar vacío"),
    email: z
      .string()
      .min(1, "El correo no puede estar vacío")
      .email("Introduce un correo válido"),
    password: z
      .string()
      .min(8, "La contraseña debe tener al menos 8 caracteres"),
    passwordConfirm: z.string(),
  })
  .refine((data) => data.password === data.passwordConfirm, {
    message: "Las contraseñas no coinciden",
    path: ["passwordConfirm"],
  });

export type RegisterInput = z.infer<typeof registerSchema>;
