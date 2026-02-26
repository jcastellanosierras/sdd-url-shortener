# Contratos: Analítica de enlaces (004-link-analytics)

**Feature**: Analítica de enlaces acortados  
**Date**: 2026-02-26

## Resumen

- **Registro de visita (interno)**: POST a un endpoint interno que persiste una visita en DB. Consumido por la ruta de redirección en modo fire-and-forget (no se espera respuesta por parte del cliente de la redirección). Respuesta 201/202.
- **Lectura de analíticas**: GET por enlace (solo propietario) que devuelve total de visitas y desgloses por país, dispositivo, SO, referrer y UTM.

Los detalles de payload y respuestas se documentan en [endpoints.md](./endpoints.md).

---

## 1. POST interno: registrar visita

**Ruta**: `POST /api/visits` (o equivalente interno, no expuesto como API pública de terceros).

**Consumidor**: Route Handler `src/app/[slug]/route.ts`, desde dentro de `after()`, sin esperar la respuesta (fire-and-forget).

**Payload (cuerpo JSON)**:

- `slug` (string) **o** `shortenedUrlId` (string): identificación del enlace acortado.
- Datos de sesión/request: `userAgent` (string), `referer` (string opcional), `ip` o cabeceras de geolocalización (según implementación), y query params UTM si se envían en el body: `utm_source`, `utm_medium`, `utm_campaign`, `utm_term`, `utm_content` (todos opcionales).

**Comportamiento**:

1. Resolver `ShortenedURL` por slug o id.
2. Si no existe, responder 404 (en fire-and-forget el cliente no lo ve; el registro simplemente no se crea).
3. Parsear User-Agent para device y OS; leer país/región de cabeceras si están disponibles.
4. Crear registro `Visit` con `shortenedUrlId`, `createdAt` (now), y el resto de campos.
5. Responder **201 Created** (o 202 Accepted). El cliente de la redirección no espera esta respuesta.

**Contrato para tests**: Dado un payload válido con slug existente, el endpoint crea exactamente una fila en `Visit` y devuelve 201. Dado slug inexistente, 404. Tests unitarios pueden validar el payload; tests de integración pueden simular POST y comprobar persistencia.

---

## 2. GET analíticas por enlace (solo propietario)

**Ruta**: `GET /api/links/[slugOrId]/analytics` o página `GET /dashboard/links/[slug]/analytics` que obtenga datos vía Server Component o API. (La ruta exacta puede ser la que mejor encaje en el diseño: API route o datos en servidor en página.)

**Autenticación**: Sesión obligatoria (better-auth). Solo el usuario propietario del enlace (`ShortenedURL.userId === session.user.id`) puede ver analíticas.

**Comportamiento**:

1. Obtener sesión; si no hay sesión → 401 o redirección a login.
2. Resolver enlace por slug (o id); si no existe → 404.
3. Si `row.userId !== session.user.id` → 403 Forbidden.
4. Agregar visitas del enlace: total (count) y desgloses por: país, región, device, os, referrer, utm_source, utm_medium, utm_campaign, utm_term, utm_content (conteos o listas según diseño de UI).

**Respuesta (ejemplo para API)**:

- Total de visitas.
- Desgloses: por país (lista de { country, count }), por device, por os, por referrer, por cada UTM (lista de { value, count } o equivalente). Formato concreto en [endpoints.md](./endpoints.md).

**Contrato para tests**: Usuario propietario recibe 200 y datos coherentes con las visitas en DB. Usuario no propietario recibe 403. No autenticado recibe 401 o redirect. Tests de integración: crear enlace, crear visitas vía POST interno, consultar GET como propietario y verificar totales y desgloses.

---

## Notas

- El endpoint POST de visitas puede estar protegido por cabecera interna o ruta no pública para que solo sea invocable desde el mismo origen (evitar que terceros envíen visitas falsas). Detalle de implementación en quickstart.
- OpenAPI: si se desea, se puede añadir un archivo OpenAPI en esta carpeta; por ahora la documentación en README y endpoints.md es suficiente.
