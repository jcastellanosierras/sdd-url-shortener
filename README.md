# URL Shortener

Proyecto base para la aplicación URL shortener: Next.js (App Router), TypeScript, pnpm, Prisma, shadcn/ui, Vitest, ESLint y Prettier.

## Requisitos

- **Node.js**: 20.9 o superior (recomendado LTS).
- **Gestor de paquetes**: [pnpm](https://pnpm.io/).

## Instalación

```bash
git clone <repo-url>
cd url-shortener

pnpm install
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
pnpm dev
```

Abre [http://localhost:3000](http://localhost:3000). En la página principal puedes introducir una URL y obtener un enlace corto; al visitar ese enlace se redirige a la URL original.

## Estructura

- `src/app/` — Rutas (App Router): página principal (formulario) y `[slug]` (redirección).
- `src/components/ui/` — Componentes shadcn/ui.
- `src/lib/` — Utilidades, Prisma, validaciones (Zod) y generación de slug.
- `prisma/` — Esquema SQLite y migraciones (modelo ShortenedURL).
- `tests/` — Tests unitarios e integración.

Para más detalle, ver [specs/002-url-shortener/quickstart.md](specs/002-url-shortener/quickstart.md).

## Stack

- **Next.js**: última estable (ver `package.json`).
- TypeScript, ESLint, Prettier, Vitest, React Testing Library, shadcn/ui, Prisma (SQLite), Zod.
