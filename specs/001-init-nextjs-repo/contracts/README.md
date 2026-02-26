# Contratos de API (contracts)

**Feature**: 001-init-nextjs-repo

## Estado actual

En esta feature **no se definen contratos de API** (OpenAPI, GraphQL, etc.). El alcance es únicamente la inicialización del repositorio (Next.js, TypeScript, Prisma, shadcn/ui, tests, lint/format).

## Features posteriores

Cuando se implementen endpoints (p. ej. API para acortar URLs, redirecciones, etc.), los contratos se añadirán en este directorio, por ejemplo:

- `openapi.yaml` o `openapi.json` para APIs REST
- Esquemas GraphQL si se usa GraphQL

Cada feature que introduzca o modifique APIs públicas debe actualizar o crear los contratos correspondientes y referenciarlos desde su plan.
