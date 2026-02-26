# Quickstart: 003-user-auth

**Feature**: Autenticación y panel de URLs por usuario  
**Branch**: `003-user-auth`

## Requisitos

- **Node.js**: 20.9 o superior (recomendado LTS).
- **Gestor de paquetes**: pnpm.
- **Base de datos**: SQLite (Prisma, existente). Better-auth usa las mismas tablas vía Prisma adapter.

## Instalación y preparación

```bash
cd url-shortener

# Instalar dependencias (incluye better-auth cuando se añada)
pnpm install

# Generar esquema Prisma de better-auth (User, Session, Account)
pnpm dlx @better-auth/cli@latest generate
# Integrar la salida en prisma/schema.prisma (fusionar modelos) y añadir
# en ShortenedURL el campo userId (opcional) y relación con User.

# Crear y aplicar migración Prisma
pnpm exec prisma migrate dev --name add_auth_and_user_id_to_urls

# Regenerar cliente Prisma
pnpm exec prisma generate
```

## Variables de entorno

Configurar las que requiera better-auth (consultar documentación), por ejemplo:

- `BETTER_AUTH_SECRET`: secreto para firmar sesiones/cookies.
- `BETTER_AUTH_URL`: URL base de la app (p. ej. `http://localhost:3000` en desarrollo).

## Comandos principales

| Comando                        | Descripción                                    |
| ------------------------------ | ---------------------------------------------- |
| `pnpm dev`                     | Servidor de desarrollo (http://localhost:3000) |
| `pnpm build`                   | Build de producción                            |
| `pnpm start`                   | Servir build en producción                     |
| `pnpm test`                    | Ejecutar tests (Vitest)                        |
| `pnpm lint`                    | ESLint                                         |
| `pnpm exec prisma migrate dev` | Crear/aplicar migraciones (desarrollo)         |

## Verificación rápida (después de implementar)

1. **Registro**: Ir a `/register`, rellenar nombre, correo, contraseña, repetir contraseña → cuenta creada y sesión iniciada (o redirección a login con mensaje de éxito).
2. **Login**: Ir a `/login`, introducir correo y contraseña → sesión iniciada; la cabecera muestra avatar con dropdown (Dashboard, Cerrar sesión).
3. **Cabecera**: En la página principal sin sesión se ven “Iniciar sesión” y “Registrarse”; con sesión, avatar con dropdown.
4. **Crear URL**: Estando logueado, crear una URL acortada en la página principal → debe guardarse con `userId` del usuario actual.
5. **Dashboard**: Ir a `/dashboard` → listado de URLs acortadas del usuario (slug/URL acortada y URL de destino); botón/enlace “Volver a la página principal”. Sin sesión → redirección a login.
6. **Cerrar sesión**: Desde el dropdown del avatar, “Cerrar sesión” → la cabecera vuelve a mostrar “Iniciar sesión” y “Registrarse”.
7. **Tests**: `pnpm test` → tests unitarios (Zod, acciones) e integración (dashboard, auth) pasan.
8. **Build**: `pnpm build` → sin errores.

## Estructura relevante para esta feature

- **Auth**: `src/lib/auth.ts` (config better-auth), `src/app/api/auth/[...all]/route.ts` (catch-all de better-auth).
- **Pantallas**: `src/app/login/page.tsx`, `src/app/register/page.tsx`, `src/app/dashboard/page.tsx`.
- **Cabecera**: `src/components/header-auth.tsx` (o similar) en layout o página principal.
- **Validaciones**: `src/lib/validations.ts` — esquemas Zod para login y registro (básicos).
- **Modelo**: `prisma/schema.prisma` — User, Session, Account (better-auth) + ShortenedURL con `userId`.
- **Dashboard**: Prisma `shortenedURL.findMany({ where: { userId } })` en la página del dashboard.

## Documentación adicional

- [spec.md](../spec.md): requisitos y user stories.
- [plan.md](../plan.md): contexto técnico y estructura.
- [research.md](../research.md): decisiones (better-auth, migraciones, Zod, shadcn).
- [data-model.md](../data-model.md): entidades User, Session, Account, ShortenedURL.
- [contracts/README.md](./contracts/README.md): contratos de auth, creación de URL, dashboard y cabecera.
