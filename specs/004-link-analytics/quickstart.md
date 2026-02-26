# Quickstart: Analítica de enlaces (004-link-analytics)

**Feature**: 004-link-analytics  
**Date**: 2026-02-26

Pasos para un desarrollador que implemente esta feature.

---

## 1. Migración Prisma (modelo Visit)

1. Añadir el modelo `Visit` en `prisma/schema.prisma` según [data-model.md](./data-model.md):
   - Campos: id, shortenedUrlId, createdAt, country, region, device, os, referrer, utm_source, utm_medium, utm_campaign, utm_term, utm_content.
   - Relación: `ShortenedURL` tiene `visits Visit[]`; `Visit` tiene `shortenedUrlId` y `shortenedUrl` con `onDelete: Cascade`.
2. Ejecutar `pnpm prisma migrate dev --name add_visit_model` (o equivalente).
3. Verificar que la migración aplica y que `ShortenedURL` tiene la relación `visits`.
4. Ejecutar `pnpm prisma generate` si no se ha hecho (p. ej. al clonar o tras cambiar el schema). Reiniciar el servidor de desarrollo para cargar el cliente actualizado.

---

## 2. Endpoint POST interno: registrar visita

1. Crear ruta API p. ej. `src/app/api/visits/route.ts`.
2. Implementar `POST`: leer body JSON (slug o shortenedUrlId, userAgent, referer, country, region, UTM params).
3. Resolver `ShortenedURL` por slug o id; si no existe, devolver 404.
4. Parsear User-Agent (p. ej. con `ua-parser-js`) para obtener device (mobile/desktop/unknown) y os (Windows, macOS, etc.); si no se puede inferir, usar "unknown".
5. Crear registro `Visit` con Prisma (`prisma.visit.create({ data: { ... } })`).
6. Responder 201 (o 202). Opcional: proteger la ruta para que solo sea invocable desde el mismo origen (cabecera interna o verificación de host).

---

## 3. Modificar [slug]/route.ts: fire-and-forget

1. En `src/app/[slug]/route.ts`, después de encontrar `row` y antes de devolver el redirect, usar `after()` de `next/server` para registrar la visita sin bloquear la respuesta.
2. **Implementación actual (recomendada)**: Dentro del callback de `after()`, llamar a un helper que extraiga de la request los datos de la visita y persista con Prisma (p. ej. `registerVisitFromRedirect(row.id, request)`). Ese helper debe leer userAgent, referer, query UTM de la URL y cabeceras opcionales (x-vercel-ip-country, x-vercel-ip-country-region), parsear User-Agent y UTM (reutilizando la lógica de `src/lib/visits-parsing.ts`) y llamar a la misma función de persistencia que usa POST /api/visits (`createVisitInDb` en `src/lib/visits-register.ts`). Hacer `.catch(() => {})` para no propagar errores. No bloquear el redirect: devolver `NextResponse.redirect(row.originalUrl, 302)` de inmediato.
3. **Alternativa**: En lugar del helper, construir la URL del endpoint interno y hacer `fetch(internalPostUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })` dentro del callback; el POST /api/visits es el que persiste. La redirección se devuelve sin esperar al fetch.

Ver [research.md](./research.md) para el uso de `after()`.

---

## 4. GET analíticas y vista en dashboard

1. **Obtención de datos**: Crear API route `GET /api/links/[slug]/analytics` o obtener datos en un Server Component de página. Comprobar sesión (better-auth); resolver enlace por slug; si `row.userId !== session.user.id`, devolver 403. Agregar visitas: total (count) y groupBy por country, device, os, referrer, utm_source, utm_medium, utm_campaign, utm_term, utm_content.
2. **Vista**: Página p. ej. `src/app/dashboard/links/[slug]/analytics/page.tsx` que muestre total de visitas y desgloses (tablas, listas o gráficos según diseño). Enlace "Volver al dashboard" o "Volver al listado".
3. **Acceso desde listado**: En la página del dashboard (`src/app/dashboard/page.tsx`), añadir por cada enlace un enlace o botón "Ver analíticas" que lleve a `/dashboard/links/[slug]/analytics` (o la ruta elegida).

---

## 5. Tests

1. **Unitarios**: Validación del payload de visita (tipos, valores permitidos para device/os). Parsing de User-Agent y de query UTM a estructura esperada por el endpoint.
2. **Integración**: (a) Request GET a `/[slug]` con slug válido → respuesta 302 y, en segundo plano, una visita registrada (comprobar con Prisma o con un GET de analíticas). (b) Usuario propietario hace GET a la vista/API de analíticas de su enlace → 200 y total/desgloses coherentes. (c) Usuario no propietario intenta acceder a analíticas de un enlace ajeno → 403.

Ejecutar: `pnpm test` (o `vitest` según configuración del proyecto).
