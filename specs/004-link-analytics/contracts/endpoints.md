# Endpoints: Analítica de enlaces (004-link-analytics)

**Feature**: 004-link-analytics  
**Date**: 2026-02-26

## POST /api/visits — Registrar visita (interno)

Consumido por la redirección en modo fire-and-forget. No expuesto como API pública.

### Request

- **Method**: POST
- **Content-Type**: application/json
- **Body** (todos los campos excepto slug/shortenedUrlId opcionales según diseño):

```json
{
  "slug": "abc12",
  "userAgent": "Mozilla/5.0 ...",
  "referer": "https://twitter.com/...",
  "country": "ES",
  "region": "MD",
  "utm_source": "newsletter",
  "utm_medium": "email",
  "utm_campaign": "winter",
  "utm_term": null,
  "utm_content": "banner"
}
```

- Alternativa: enviar `shortenedUrlId` en lugar de `slug` si ya se resolvió en el route handler.
- Si el registro de visita se hace dentro de `after()` con datos leídos de `headers()` y de la request, el payload puede construirse en el route y enviarse al POST; país/región pueden leerse en el endpoint desde headers (x-vercel-ip-country, etc.) en lugar del body.

### Response

- **201 Created**: Visita creada. Body opcional (ej. `{ "id": "..." }`).
- **202 Accepted**: Aceptado para procesamiento asíncrono (alternativa válida).
- **404 Not Found**: Slug o shortenedUrlId no existe.
- **400 Bad Request**: Payload inválido (ej. slug ausente).

El cliente de la redirección no espera esta respuesta.

---

## GET analíticas por enlace (solo propietario)

Opciones de diseño:

- **A)** `GET /api/links/[slug]/analytics` — API route que devuelve JSON.
- **B)** Página `GET /dashboard/links/[slug]/analytics` — Server Component que obtiene datos con Prisma y renderiza la vista.

En ambos casos el contrato de datos es el mismo.

### Autenticación y autorización

- Sesión requerida (better-auth).
- Solo el usuario con `ShortenedURL.userId === session.user.id` puede ver las analíticas.

### Response (cuando se expone como API JSON)

**200 OK** — Ejemplo de estructura:

```json
{
  "totalVisits": 42,
  "byCountry": [
    { "country": "ES", "count": 20 },
    { "country": "MX", "count": 12 }
  ],
  "byDevice": [
    { "device": "mobile", "count": 28 },
    { "device": "desktop", "count": 14 }
  ],
  "byOs": [
    { "os": "Android", "count": 15 },
    { "os": "Windows", "count": 10 }
  ],
  "byReferrer": [
    { "referrer": "https://twitter.com/", "count": 5 },
    { "referrer": null, "count": 30 }
  ],
  "byUtmSource": [{ "utm_source": "newsletter", "count": 8 }]
}
```

- Desgloses por `utm_medium`, `utm_campaign`, `utm_term`, `utm_content` con la misma forma `{ "key": value, "count": n }`.
- Valores `null` o vacíos se agrupan como "direct" o "none" según criterio de producto.

**403 Forbidden**: Usuario no es propietario del enlace.  
**404 Not Found**: Enlace no existe.  
**401 Unauthorized**: No hay sesión (o redirect a login si es página).
