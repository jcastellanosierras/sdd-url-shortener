# Implementation Plan: Inicialización del repositorio con Next.js

**Branch**: `001-init-nextjs-repo` | **Date**: 2025-02-10 | **Spec**: [spec.md](./spec.md)  
**Input**: Feature specification from `/specs/001-init-nextjs-repo/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.cursor/commands/speckit.plan.md` for the execution workflow.

## Summary

Inicializar el repositorio con un proyecto Next.js en su última versión estable, usando pnpm como gestor de paquetes, TypeScript, ESLint, Prettier, pruebas automatizadas, shadcn/ui para UI y Prisma como ORM. El proyecto debe ser ejecutable en modo desarrollo en menos de 5 minutos, con estructura y documentación listas para ampliar.

## Technical Context

**Language/Version**: TypeScript 5.x (Node.js 20.9+)  
**Primary Dependencies**: Next.js (última estable), shadcn/ui, Prisma, ESLint, Prettier  
**Storage**: Prisma ORM (conexión a base de datos; DB concreta se definirá en features posteriores)  
**Testing**: Vitest + React Testing Library (tests unitarios e integración de componentes); opcional Playwright/Cypress en fases posteriores  
**Target Platform**: Web (navegador + servidor Node)  
**Project Type**: web  
**Performance Goals**: Arranque del servidor de desarrollo en segundos; cumplir SC-001 (setup < 5 min).  
**Constraints**: Código bajo lint/format; tests disponibles y ejecutables desde el inicio.  
**Scale/Scope**: Proyecto base para aplicación URL shortener; escala definida en features futuras.

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

Verificar cumplimiento con `.specify/memory/constitution.md`:

- **Code Quality**: ESLint y Prettier configurados desde el inicio; estructura de carpetas y convenciones de nombres coherentes; sin deuda técnica no justificada en el bootstrap.
- **Testing Standards**: Vitest + React Testing Library configurados; al menos un test de ejemplo o smoke test que verifique que la app arranca; estrategia de tests (unit/integration) documentada en quickstart.
- **User Experience Consistency**: shadcn/ui proporciona patrones consistentes; accesibilidad considerada por defecto en componentes shadcn; no aplica flujo de usuario crítico en esta feature (solo proyecto base).
- **Performance Requirements**: Criterio de rendimiento para esta feature: tiempo de setup y arranque (SC-001); no hay flujos críticos de negocio aún.

**Resultado**: Cumple. No se requieren excepciones en Complexity Tracking.

## Project Structure

### Documentation (this feature)

```text
specs/001-init-nextjs-repo/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output (placeholder para APIs futuras)
└── tasks.md             # Phase 2 output (/speckit.tasks - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
# Next.js App Router + TypeScript + Prisma + shadcn/ui
src/
├── app/                    # App Router (Next.js)
│   ├── layout.tsx
│   ├── page.tsx
│   ├── globals.css
│   └── (rutas futuras)
├── components/             # Componentes React (shadcn en components/ui)
│   ├── ui/                 # shadcn/ui
│   └── (componentes de dominio en features posteriores)
├── lib/                    # Utilidades, Prisma client wrapper
│   └── db.ts               # Prisma client singleton (cuando se use)
└── (hooks, services, etc. en features posteriores)

prisma/
├── schema.prisma           # Esquema Prisma (vacío o modelo de ejemplo)
└── (migrations en uso)

public/
└── (assets estáticos)

tests/
├── unit/
├── integration/
└── (e2e en features posteriores si se añade Playwright/Cypress)

# Configuración en raíz
.eslintrc.*
.prettierrc
next.config.*
tsconfig.json
package.json
README.md
```

**Structure Decision**: Monorepo de aplicación web con Next.js App Router. La raíz del código es `src/` con `app/` para rutas, `components/` para UI (shadcn en `components/ui`), y `prisma/` para el ORM. Los tests viven en `tests/` (unit/integration) para mantenerlos fuera de `src` y alinear con la constitución (Testing Standards).

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
| --------- | ---------- | ------------------------------------ |
| (Ninguna) | —          | —                                    |
