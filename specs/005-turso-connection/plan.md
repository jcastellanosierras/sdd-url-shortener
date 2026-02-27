# Implementation Plan: Conexión a Turso

**Branch**: `005-turso-connection` | **Date**: 2025-02-27 | **Spec**: [spec.md](./spec.md)  
**Input**: Feature specification from `/specs/005-turso-connection/spec.md`

**Note**: Documentación de referencia proporcionada por el usuario: [Prisma + Turso](https://docs.turso.tech/sdk/ts/orm/prisma.md). Índice de docs: https://docs.turso.tech/llms.txt

## Summary

Conectar la aplicación al almacén de datos Turso usando Prisma con el adaptador libSQL. El esquema Prisma se mantiene (SQLite como provider); en runtime se usan `TURSO_DATABASE_URL` y `TURSO_AUTH_TOKEN` cuando están definidos; en desarrollo local sin Turso se mantiene el adaptador better-sqlite3 contra un archivo SQLite. Las migraciones se generan con `prisma migrate dev` contra SQLite local y se aplican a Turso con `turso db shell < migration.sql`.

## Technical Context

**Language/Version**: TypeScript (Node ≥20.9), Next.js 16  
**Primary Dependencies**: Prisma 7.x, Next.js, better-auth; añadir @libsql/client, @prisma/adapter-libsql  
**Storage**: Turso (libSQL) en runtime cuando está configurado; SQLite local (better-sqlite3) para desarrollo y para generar migraciones  
**Testing**: Vitest, Testing Library; tests de integración que usen DB deben poder usar SQLite local o Turso según env  
**Target Platform**: Node (Next.js server); compatible con despliegue serverless/edge si el adaptador libSQL lo soporta  
**Project Type**: Web (monolito Next.js con `src/`)  
**Performance Goals**: Sin degradación respecto al uso actual de SQLite; latencia de queries acorde a Turso/libSQL  
**Constraints**: Prisma Migrate no soportado directamente contra Turso; flujo: migrar contra SQLite local, aplicar SQL a Turso vía CLI  
**Scale/Scope**: Mismo modelo de datos actual (User, Session, Account, ShortenedURL, Visit); solo cambio de backend de persistencia

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

Verificación con `.specify/memory/constitution.md`:

- **Code Quality**: Lint/format ya configurados (ESLint, Prettier). Cambios limitados a `prisma/schema.prisma`, `src/lib/db.ts`, dependencias y env; nombres y estructura coherentes.
- **Testing Standards**: Tests existentes deben seguir pasando. Añadir o ajustar tests que dependan de DB para que soporten ambos backends (SQLite local / Turso) o marcar entorno; flujos críticos (acortar URL, auth) deben seguir cubiertos.
- **User Experience Consistency**: No hay cambios de UI; la experiencia del usuario es la misma salvo que la persistencia se sirve desde Turso cuando está configurado.
- **Performance Requirements**: Sin criterios nuevos de rendimiento en esta feature; no degradar latencia de forma injustificada (objetivo implícito: misma o mejor con Turso).

Ninguna violación que requiera Complexity Tracking.

**Re-check post Phase 1**: Tras research, data-model, contracts y quickstart, los cuatro principios se mantienen cumplidos; no hay nuevos riesgos de UX ni de rendimiento.

## Project Structure

### Documentation (this feature)

```text
specs/005-turso-connection/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output (modelo existente, sin cambios de entidades)
├── quickstart.md        # Phase 1 output (pasos para usar Turso)
├── contracts/           # Phase 1 output (README: sin nuevos endpoints)
└── tasks.md             # Phase 2 output (/speckit.tasks — no creado por /speckit.plan)
```

### Source Code (repository root)

```text
src/
├── app/                 # Next.js App Router
├── components/
├── lib/
│   ├── auth.ts
│   └── db.ts            # Cambio: adapter condicional Turso vs better-sqlite3
└── ...

prisma/
├── schema.prisma        # Cambio: previewFeatures = ["driverAdapters"], url para migrate
└── migrations/          # Generadas con migrate dev (SQLite); aplicar a Turso con turso db shell

.env / .env.example       # Añadir TURSO_DATABASE_URL, TURSO_AUTH_TOKEN (opcionales para local)
```

**Structure Decision**: Monolito Next.js existente; solo se modifican configuración de Prisma, cliente de DB y variables de entorno. No se añaden nuevos módulos de negocio.

## Complexity Tracking

> Sin violaciones que justificar; tabla vacía.

| Violation | Why Needed | Simpler Alternative Rejected Because |
| --------- | ---------- | ------------------------------------ |
| —         | —          | —                                    |
