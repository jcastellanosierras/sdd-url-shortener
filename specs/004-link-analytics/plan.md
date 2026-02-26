# Implementation Plan: Analítica de enlaces acortados

**Branch**: `004-link-analytics` | **Date**: 2026-02-26 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/004-link-analytics/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.cursor/commands/speckit.plan.md` for the execution workflow.

## Summary

Registrar una visita por cada acceso a una URL acortada (redirección), capturando localización, dispositivo, SO, referrer y parámetros UTM, y permitir al propietario del enlace ver totales y desgloses. **Enfoque técnico**: nueva tabla `Visit` asociada a `ShortenedURL`; el registro de la visita **no debe retrasar** al usuario: desde la ruta de redirección `[slug]/route.ts` se invoca un endpoint interno en modo **fire-and-forget** (sin esperar respuesta); ese endpoint es el que persiste la visita en DB. Así la redirección responde de inmediato y la analítica se escribe de forma asíncrona.

## Technical Context

**Language/Version**: TypeScript 5  
**Primary Dependencies**: Next.js 16, React 19, Prisma 7  
**Storage**: SQLite (Prisma)  
**Testing**: Vitest (unit + integration)  
**Target Platform**: Node (Next.js App Router), despliegue en Vercel o equivalente  
**Project Type**: single Next.js App Router (monolito)  
**Performance Goals**: Redirección no bloqueada por escritura de analítica; latencia de redirect similar a la actual.  
**Constraints**: Registro de visita asíncrono obligatorio (fire-and-forget desde route handler).  
**Scale/Scope**: Feature 004; una tabla nueva (Visit), un endpoint interno POST, endpoints/vista de lectura de analíticas.

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

Verificar cumplimiento con `.specify/memory/constitution.md`:

- **Code Quality**: Lint/format configurados; estructura y nombres coherentes; sin deuda técnica no justificada.
- **Testing Standards**: Estrategia definida: tests unitarios para validación del payload de visita y parsing (User-Agent, UTM); tests de integración para flujo redirect + invocación fire-and-forget al endpoint de registro, y para vista de analíticas (GET por enlace, solo propietario). Tests fallan antes de implementar donde aplique.
- **User Experience Consistency**: Patrones de UI/UX del dashboard existente; vista de analíticas accesible desde listado de enlaces; feedback y accesibilidad alineados.
- **Performance Requirements**: Criterio explícito: la redirección no espera a la persistencia de la visita; se usa webhook interno (fire-and-forget) para cumplirlo.

Cualquier violación justificada debe documentarse en la tabla Complexity Tracking más abajo.

## Project Structure

### Documentation (this feature)

```text
specs/004-link-analytics/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
src/
├── app/
│   ├── [slug]/route.ts       # GET redirect; fire-and-forget al POST interno
│   ├── api/                  # API routes (auth, interno registro visita, analíticas)
│   ├── dashboard/            # listado enlaces + acceso a analíticas por enlace
│   ├── actions.ts
│   ├── layout.tsx
│   └── page.tsx
├── components/               # UI (header, formularios, etc.)
└── lib/
    ├── db.ts
    └── auth.ts

prisma/
└── schema.prisma             # ShortenedURL, User, Session, Account, Visit (nuevo)

tests/
├── unit/                     # validación payload, parsing UA/UTM
└── integration/              # redirect + webhook, vista analíticas
```

**Structure Decision**: Proyecto único Next.js App Router. Código en `src/app`, `src/components`, `src/lib`; datos en Prisma (SQLite). Tests en `tests/unit` y `tests/integration`. El endpoint interno de registro de visita vive bajo `src/app/api/` (p. ej. `api/visits/route.ts` o similar) y es invocado por la ruta de redirección sin await.

**Prisma**: Tras añadir el modelo Visit (o tras cualquier cambio en schema.prisma), ejecutar `pnpm prisma generate` y reiniciar el servidor de desarrollo para que el cliente exponga `prisma.visit`.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

Ninguna.

## Post Phase 1

**Constitution Check (re-evaluación tras Phase 1)**: Los cuatro principios se mantienen; el diseño (tabla Visit, webhook interno fire-and-forget, GET analíticas solo propietario) es compatible con Code Quality, Testing (unit + integration definidos), UX (acceso desde dashboard) y Performance (redirección no bloqueada). Sin violaciones que documentar en Complexity Tracking.
