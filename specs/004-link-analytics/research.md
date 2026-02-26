# Research: Analítica de enlaces (004-link-analytics)

**Feature**: 004-link-analytics  
**Date**: 2026-02-26

## 1. Fire-and-forget desde un Route Handler en Next.js App Router

**Decision**: Usar la API `after()` de Next.js (`next/server`) dentro del Route Handler de redirección para programar el registro de la visita **después** de enviar la respuesta al usuario, sin bloquear el redirect.

**Rationale**: En App Router no se debe hacer `await` a una llamada que persiste en DB desde el mismo handler que hace `NextResponse.redirect()`, porque eso retrasa la respuesta. Next.js 15.1+ ofrece `after(callback)` que ejecuta trabajo después de que la respuesta (o el redirect) se ha enviado. El callback puede hacer `fetch` al endpoint interno de registro o, alternativamente, contener la lógica de persistencia directamente; en ambos casos la ejecución no bloquea al cliente. Documentación: [Next.js after()](https://nextjs.org/docs/app/api-reference/functions/after).

**Alternatives considered**:

- **`fetch` a ruta API interna sin `await`**: Lanzar `fetch(url, { method: 'POST', body: ... })` sin await desde el route handler. Riesgo: en algunos entornos (Vercel Serverless) el proceso puede terminar antes de que la petición HTTP interna complete; no se garantiza que la visita se persista. Por tanto no se recomienda como única estrategia.
- **Cola externa (Redis, SQS, etc.)**: Añade complejidad e infraestructura; para este alcance no es necesario.
- **`after()`**: Garantiza que el trabajo se ejecuta después de la respuesta y no bloquea al usuario; soportado en Route Handlers. **Elegido**.

---

## 2. Patrón "webhook interno" para no bloquear la respuesta

**Decision**: Patrón de dos partes: (1) Route Handler `[slug]` hace redirect y, dentro de `after()`, invoca (fire-and-forget) un endpoint interno POST que recibe los datos de la visita; (2) ese endpoint es el único que escribe en la tabla `Visit`. El cliente de la redirección nunca espera al POST.

**Rationale**: Separa responsabilidades: el handler de redirect solo resuelve slug → URL y responde; la persistencia queda en un endpoint dedicado, testeable y reutilizable. El "webhook interno" es simplemente una ruta API (p. ej. `POST /api/visits` o `POST /api/internal/register-visit`) llamada desde el servidor sin esperar su respuesta dentro del flujo de la petición del usuario.

**Alternatives considered**:

- Lógica de persistencia inline dentro de `after()`: Posible, pero mezcla redirect con acceso a DB en el mismo archivo; menos claro y más difícil de testear el contrato del "registro de visita" por separado.
- Endpoint interno + `after()`: **Elegido**: `after()` hace `fetch(internalUrl, { method: 'POST', body })` sin await (o con await dentro del callback, que no bloquea la respuesta ya enviada). El endpoint interno recibe el payload y persiste en DB; 201/202. El cliente ya ha recibido el redirect.

---

## 3. Parsear User-Agent (dispositivo / OS) y obtener país/región

**User-Agent (dispositivo y SO)**

- **Decision**: Usar una librería ligera de parsing de User-Agent en el servidor (p. ej. `ua-parser-js` / UAParser.js) para inferir dispositivo (mobile/desktop/unknown) y sistema operativo (Windows, macOS, Linux, iOS, Android, Other, unknown).
- **Rationale**: El User-Agent es la señal estándar disponible en la request; parsearlo con una librería bien mantenida evita regex frágiles y da categorías consistentes para almacenar y agrupar en desgloses.
- **Alternatives**: Regex manual (propenso a errores y mantenimiento); servicios externos que devuelven device/OS (más latencia y dependencia). Se elige librería local.

**País/región**

- **Decision**: Obtener país y región desde cabeceras cuando estén disponibles. En Vercel: `x-vercel-ip-country` (código ISO 2 letras), `x-vercel-ip-country-region` (región ISO 3166-2). En desarrollo local estas cabeceras pueden no existir; en ese caso guardar `null` o "unknown".
- **Rationale**: Evita llamadas a servicios externos de geolocalización por IP durante el request, mantiene latencia baja y no bloquea la respuesta.
- **Alternatives**: Servicio externo de geolocalización por IP (más preciso en algunos casos, pero añade latencia y dependencia). Para analítica de origen de tráfico, país/región por cabeceras es suficiente.

---

## 4. Parámetros UTM estándar a almacenar

**Decision**: Almacenar los cinco parámetros UTM estándar de Google (y uso común en campañas): `utm_source`, `utm_medium`, `utm_campaign`, `utm_term`, `utm_content`. Todos opcionales (nullable); se leen de la URL de la petición (query string) en el momento del redirect.

**Rationale**: Cubren el 99% de casos de atribución (fuente, medio, campaña, término, contenido). Cualquier otro parámetro personalizado puede añadirse en el futuro sin cambiar este conjunto base.

**Alternatives considered**: Solo utm_source, utm_medium, utm_campaign: suficiente para lo mínimo, pero utm_term y utm_content son estándar y útiles para anuncios y A/B; se incluyen desde el inicio.
