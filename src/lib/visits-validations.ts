import { z } from "zod";

/**
 * Valores permitidos para device según data-model (004-link-analytics).
 */
export const DEVICE_VALUES = ["mobile", "desktop", "unknown"] as const;
export type Device = (typeof DEVICE_VALUES)[number];

/**
 * Valores permitidos para os según data-model (004-link-analytics).
 */
export const OS_VALUES = [
  "Windows",
  "macOS",
  "Linux",
  "iOS",
  "Android",
  "Other",
  "unknown",
] as const;
export type Os = (typeof OS_VALUES)[number];

const deviceSchema = z.enum(DEVICE_VALUES);
const osSchema = z.enum(OS_VALUES);

const utmOptional = z.string().max(200).nullable().optional();

/**
 * Schema para el body de POST /api/visits.
 * Requiere slug o shortenedUrlId (al menos uno), userAgent; resto opcionales.
 */
export const visitPayloadSchema = z
  .object({
    slug: z.string().max(50).optional(),
    shortenedUrlId: z.string().max(100).optional(),
    userAgent: z.string().min(1, "userAgent es obligatorio"),
    referer: z.string().max(500).optional(),
    country: z.string().max(10).optional(),
    region: z.string().max(50).optional(),
    utm_source: utmOptional,
    utm_medium: utmOptional,
    utm_campaign: utmOptional,
    utm_term: utmOptional,
    utm_content: utmOptional,
    device: deviceSchema.optional(),
    os: osSchema.optional(),
  })
  .refine(
    (data) =>
      (data.slug != null && data.slug !== "") ||
      (data.shortenedUrlId != null && data.shortenedUrlId !== ""),
    { message: "Se requiere slug o shortenedUrlId", path: ["slug"] }
  );

export type VisitPayload = z.infer<typeof visitPayloadSchema>;

/**
 * Valida el body del POST /api/visits. Lanza si es inválido.
 */
export function validateVisitPayload(body: unknown): VisitPayload {
  return visitPayloadSchema.parse(body);
}

/**
 * Valida y devuelve resultado (safe). Útil para endpoints que devuelven 400.
 */
export function safeValidateVisitPayload(
  body: unknown
): z.SafeParseReturnType<unknown, VisitPayload> {
  return visitPayloadSchema.safeParse(body);
}
