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
