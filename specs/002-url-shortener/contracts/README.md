# Contratos: Acortador de URLs (002-url-shortener)

**Feature**: Acortador de URLs  
**Date**: 2025-02-10

## Resumen

Esta feature no expone una API REST pública para el formulario. El flujo de “crear URL acortada” se realiza mediante **Server Action** de Next.js; el flujo de “redirigir” se realiza mediante una **ruta dinámica GET**. Los contratos siguientes definen el comportamiento esperado para tests y consumo.

---

## 1. Crear URL acortada (Server Action)

**Ubicación**: Acción de servidor invocada desde el formulario de la página principal.

**Nombre (sugerido)**: `createShortenedUrl` (o equivalente).

**Entrada**:

- `originalUrl`: string — URL que el usuario quiere acortar. Debe ser válida (http/https); la validación se hace con Zod antes de llamar a la acción.

**Comportamiento**:

1. Validar `originalUrl` con Zod (URL válida, esquema http o https). Si falla, devolver error sin persistir.
2. Generar un `slug` único (por ejemplo, cadena corta aleatoria o nanoid).
3. Persistir en base de datos: `ShortenedURL` con `slug`, `originalUrl` y timestamps.
4. Construir la URL acortada: `{baseUrl}/{slug}` (baseUrl = dominio de la aplicación, p. ej. `http://localhost:3000` en dev).
5. Devolver al cliente: la URL acortada (string) o un objeto con `{ success: true, shortUrl: string }`; en caso de error, `{ success: false, error: string }` (o equivalente para mostrar en UI).

**Salida (éxito)**:

- La página muestra la URL acortada al usuario (copiable o con botón de copiar si se desea en implementación).

**Salida (error)**:

- Validación fallida o error de base de datos: mensaje claro en la misma pantalla (sin redirección errónea).

**Tests**: Unit test de la acción con URL válida/inválida; integración opcional con DB en memoria o SQLite de test.

---

## 2. Redirigir por slug (GET dinámico)

**Ruta**: `GET /[slug]` (ruta dinámica en App Router, p. ej. `src/app/[slug]/route.ts` o `page.tsx` que haga redirect).

**Entrada**:

- `slug`: segmento de ruta (ej. `fjas952k`). No es un query param.

**Comportamiento**:

1. Buscar en base de datos un registro `ShortenedURL` con `slug` igual al segmento.
2. Si existe: responder con **redirección HTTP** (302 o 307) a `originalUrl`. No abrir la URL en el servidor; el cliente (navegador) debe seguir el redirect.
3. Si no existe: responder con **404** (Not Found) y, si se desea, una página o mensaje “enlace no encontrado” dentro de la aplicación (sin redirigir a URL externa).

**Respuestas**:

- `302 Found` (o `307`) + `Location: {originalUrl}` cuando el slug existe.
- `404 Not Found` cuando el slug no existe.

**Tests**: Integración: dado un ShortenedURL en DB, GET /{slug} debe devolver redirect a originalUrl; GET /slug-inexistente debe devolver 404.

---

## Notas

- No se define contrato para una API REST pública (p. ej. `POST /api/shorten`) en esta feature; si se añade después, se documentará aquí o en un nuevo contrato.
- Base URL para construir la URL acortada: en desarrollo `NEXT_PUBLIC_APP_URL` o `process.env.VERCEL_URL` o derivado del host; documentar en quickstart o variables de entorno.
