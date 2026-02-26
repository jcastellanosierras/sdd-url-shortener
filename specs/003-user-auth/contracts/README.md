# Contratos: Autenticación y panel de URLs (003-user-auth)

**Feature**: Autenticación y panel de URLs por usuario  
**Date**: 2026-02-26

## Resumen

- **Autenticación**: better-auth expone sus propios endpoints bajo `/api/auth/[...all]` (sign-in, sign-up, sign-out, get-session, etc.). No se documentan aquí; seguir la documentación de better-auth y la configuración en `src/lib/auth.ts`.
- **Formularios**: Login y registro envían a la API de better-auth (desde cliente o Server Actions que deleguen). Validación con Zod en cliente/servidor antes de enviar (campos requeridos, email válido, contraseña mínima, coincidencia de contraseñas en registro).
- **Creación de URL acortada**: la Server Action existente se extiende para asociar `userId` cuando hay sesión.
- **Dashboard**: página protegida que obtiene el listado de URLs del usuario con Prisma.

---

## 1. Autenticación (better-auth)

**Rutas**: Delegadas a better-auth en `src/app/api/auth/[...all]/route.ts`. Incluyen, entre otros:

- Sign up (registro)
- Sign in (login)
- Sign out (logout)
- Get session

**Configuración**: `src/lib/auth.ts` — `betterAuth({ database: prismaAdapter(prisma, { provider: "sqlite" }), emailAndPassword: { enabled: true } })`; sin `requireEmailVerification`.

**Contrato de formularios (comportamiento esperado)**:

- **Registro**: nombre, correo, contraseña, repetir contraseña. Validación Zod: todos requeridos; email formato válido; contraseña longitud mínima (p. ej. 8); contraseña y repetición iguales. Si el correo ya existe, better-auth devuelve error → mostrar mensaje “Este correo ya está registrado” (o equivalente).
- **Login**: correo, contraseña. Validación Zod: ambos requeridos; email formato válido. Si credenciales incorrectas, better-auth devuelve error → mostrar mensaje genérico “Credenciales incorrectas”.

---

## 2. Crear URL acortada (Server Action existente, extendida)

**Nombre**: `createShortenedUrl` (o el actual en `src/app/actions.ts`).

**Entrada**: Sin cambios (p. ej. `FormData` con campo `url`). La acción debe poder obtener la sesión (better-auth) en el servidor para leer el `userId`.

**Comportamiento**:

1. Validar URL con Zod (como hasta ahora).
2. Obtener sesión del usuario (better-auth `auth.api.getSession({ headers })` o equivalente).
3. Generar slug único y persistir `ShortenedURL` con `slug`, `originalUrl` y **userId** (si hay sesión; si no hay sesión, según criterio: guardar `userId: null` o rechazar y devolver error “Debes iniciar sesión para acortar URLs”).
4. Devolver `{ success: true, shortUrl }` o `{ success: false, error }`.

**Salida**: Igual que en 002-url-shortener. Si se exige sesión para crear, en caso de no autenticado devolver `{ success: false, error: "..." }`.

**Tests**: Unit test con sesión (userId asignado) y sin sesión (userId null o error); integración opcional.

---

## 3. Dashboard: listado de URLs del usuario

**Ruta**: `GET /dashboard` (página `src/app/dashboard/page.tsx` o equivalente). No es un API route; es una página que se renderiza en el servidor.

**Protección**: La página debe comprobar sesión. Si no hay sesión → redirigir a `/login` (o mostrar mensaje de “acceso denegado”).

**Obtención de datos**: En el servidor (page o layout), obtener sesión (better-auth) y luego consulta Prisma:

- `prisma.shortenedURL.findMany({ where: { userId: session.user.id }, orderBy: { createdAt: 'desc' } })`

**Salida (UI)**: Lista de filas (o tarjetas) que muestren para cada URL: URL acortada (o slug) y URL de destino (originalUrl). Botón o enlace “Volver a la página principal” que lleve a `/`.

**Contrato para tests**: Dado un usuario autenticado con N URLs, la página muestra exactamente esas N URLs; dado un usuario sin sesión, la petición a la ruta dashboard resulta en redirección a login (o 403).

---

## 4. Cabecera (estado de sesión)

**Componente**: Cabecera en la página principal (y opcionalmente en login/register/dashboard) que muestre:

- **Sin sesión**: Enlaces “Iniciar sesión” (a `/login`) y “Registrarse” (a `/register`).
- **Con sesión**: Avatar (iniciales o icono) con dropdown que incluya “Dashboard” (enlace a `/dashboard`) y “Cerrar sesión” (acción que llama a sign-out de better-auth).

**Obtención de sesión**: En el cliente con el cliente de better-auth (getSession) o en el servidor pasando sesión al layout/page. No es un contrato de API; es un contrato de UI y flujo.

---

## Notas

- No se define contrato para API REST pública de auth; better-auth define sus propios endpoints.
- Variables de entorno: las que requiera better-auth (p. ej. `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`) según su documentación.
