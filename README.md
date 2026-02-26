# URL Shortener (sdd-url-shortener)

Aplicación para acortar URLs con autenticación, panel de usuario y analíticas de visitas. Next.js (App Router), TypeScript, pnpm, Prisma (SQLite), better-auth, shadcn/ui, Vitest, ESLint y Prettier.

## Requisitos

- **Node.js**: 20.9 o superior (recomendado LTS).
- **Gestor de paquetes**: [pnpm](https://pnpm.io/).

## Instalación

```bash
git clone https://github.com/<tu-usuario>/sdd-url-shortener.git
cd sdd-url-shortener

pnpm install
pnpm prisma generate
pnpm prisma migrate dev
```

## Comandos

| Comando           | Descripción                                    |
| ----------------- | ---------------------------------------------- |
| `pnpm dev`        | Servidor de desarrollo (http://localhost:3000) |
| `pnpm build`      | Build de producción                            |
| `pnpm start`      | Servir build en producción                     |
| `pnpm test`       | Ejecutar tests (Vitest)                        |
| `pnpm test:watch` | Tests en modo watch                            |
| `pnpm lint`       | ESLint                                         |
| `pnpm format`     | Formatear código con Prettier                  |

## Arranque rápido

```bash
pnpm install
pnpm prisma generate
pnpm prisma migrate dev
pnpm dev
```

Abre [http://localhost:3000](http://localhost:3000).

- **Página principal**: introduce una URL y obtén un enlace corto (requiere iniciar sesión o registrarse).
- **Redirección**: al visitar `/{slug}` se redirige a la URL original y se registra una visita (analíticas).
- **Dashboard**: lista tus URLs acortadas y enlace a analíticas por enlace.
- **Analíticas**: por cada enlace, total de visitas y desglose por país, dispositivo, SO, referrer y parámetros UTM.

## Estructura

- `src/app/` — App Router: página principal, login, registro, dashboard, `[slug]` (redirección), `api/visits`, `api/links/[slug]/analytics`, `dashboard/links/[slug]/analytics`.
- `src/components/` — UI (shadcn, cabecera con auth).
- `src/lib/` — Prisma, auth (better-auth), validaciones (Zod), slug, analíticas (visits, parsing, register).
- `prisma/` — Esquema SQLite (User, Session, Account, ShortenedURL, Visit) y migraciones.
- `tests/` — Tests unitarios e integración (Vitest).
- `specs/` — Especificaciones por feature (002 url-shortener, 003 user-auth, 004 link-analytics).

## Stack

- **Next.js** 16, **React** 19, **TypeScript** 5.
- **Prisma** 7 con SQLite (better-sqlite3).
- **better-auth** (email/contraseña, sesiones).
- **shadcn/ui**, Radix, Tailwind, Zod.
- **Vitest**, React Testing Library, jsdom.

## Documentación de features

- [specs/002-url-shortener](specs/002-url-shortener/) — Acortador de URLs.
- [specs/003-user-auth](specs/003-user-auth/) — Autenticación y dashboard.
- [specs/004-link-analytics](specs/004-link-analytics/) — Analíticas de visitas (UTM, dispositivo, SO, referrer).
