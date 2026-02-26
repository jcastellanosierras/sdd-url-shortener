# Tasks: Inicialización del repositorio con Next.js

**Input**: Design documents from `/specs/001-init-nextjs-repo/`  
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, quickstart.md

**Tests**: Incluidos por constitución (`.specify/memory/constitution.md`): smoke test y scripts de test desde el inicio.

**Organization**: Tareas agrupadas por user story para implementación y verificación independiente.

## Format: `[ID] [P?] [Story?] Description`

- **[P]**: Se puede ejecutar en paralelo (archivos distintos, sin dependencias entre ellas)
- **[Story]**: User story (US1, US2, US3)
- Incluir rutas de archivo exactas en la descripción

## Path Conventions

- Proyecto único en raíz: `src/`, `prisma/`, `tests/` en la raíz del repositorio
- Rutas según plan.md: `src/app/`, `src/components/ui/`, `src/lib/`, `prisma/`, `tests/unit/`, `tests/integration/`

---

## Phase 1: Setup (Infraestructura compartida)

**Purpose**: Inicialización del proyecto Next.js y dependencias base

- [x] T001 Create Next.js project with pnpm dlx create-next-app@latest (TypeScript, ESLint, Tailwind, App Router) at repository root; ensure package.json and src/app/ exist
- [x] T002 [P] Add Prisma: create prisma/schema.prisma (minimal datasource + generator), run prisma generate, add Prisma Client singleton in src/lib/db.ts
- [x] T003 [P] Add Vitest and React Testing Library: install deps, add vitest.config.ts at root, add "test" and "test:watch" scripts in package.json
- [x] T004 [P] Add Prettier: create .prettierrc at root, integrate with ESLint (eslint-config-prettier), add "format" script in package.json
- [x] T005 Initialize shadcn/ui (pnpm dlx shadcn@latest init) and add Button component in src/components/ui/ per research.md

---

## Phase 2: Foundational (Prerrequisitos bloqueantes)

**Purpose**: Estructura de tests y verificación mínima que debe existir antes de validar las user stories

**⚠️ CRITICAL**: Las user stories dependen de que esta fase esté completa

- [x] T006 Create tests/unit and tests/integration directories at repository root; ensure src/app/, src/components/, src/lib/, prisma/ exist per plan.md
- [x] T007 [P] Add smoke test in tests/integration/app-smoke.test.tsx that verifies the app or home page renders (e.g. fetch or render root layout/page)

**Checkpoint**: Base lista; se puede validar US1, US2 y US3

---

## Phase 3: User Story 1 - Proyecto base ejecutable (Priority: P1) 🎯 MVP

**Goal**: Un desarrollador puede clonar el repo, instalar dependencias y tener el servidor de desarrollo funcionando; lockfile presente; Next.js última estable.

**Independent Test**: `pnpm install` sin errores; `pnpm dev` sirve la app en http://localhost:3000 y la página base es accesible; lockfile pnpm-lock.yaml en el repo.

### Implementation for User Story 1

- [x] T008 [US1] Ensure package.json has scripts dev, build, start and lockfile pnpm-lock.yaml is present and committed at repository root
- [x] T009 [US1] Verify dev server runs and homepage loads at http://localhost:3000 (extend smoke test in tests/integration/ or document manual check in quickstart)
- [x] T010 [US1] Confirm next dependency in package.json is latest stable; document version or "latest" policy in README or specs/001-init-nextjs-repo/spec.md

**Checkpoint**: User Story 1 completada; proyecto ejecutable de forma independiente

---

## Phase 4: User Story 2 - Estructura lista para ampliar (Priority: P2)

**Goal**: Estructura de carpetas clara; añadir una ruta o componente nuevo funciona sin cambiar configuración global.

**Independent Test**: Añadir una página en src/app/ y un uso de componente en src/components/ui/; la ruta es accesible y el componente se renderiza sin cambios de config.

### Implementation for User Story 2

- [x] T011 [P] [US2] Add example page at src/app/demo/page.tsx accessible at /demo without modifying next.config or global config
- [x] T012 [US2] Use at least one component from src/components/ui (e.g. Button) in src/app/page.tsx or src/app/demo/page.tsx to validate structure
- [x] T013 [US2] Verify and document folder structure (src/app, src/components, src/lib, prisma) in specs/001-init-nextjs-repo/quickstart.md or plan.md

**Checkpoint**: User Stories 1 y 2 completadas; estructura ampliable verificada

---

## Phase 5: User Story 3 - Arranque documentado (Priority: P3)

**Goal**: Documentación mínima para que un desarrollador nuevo pueda arrancar el proyecto siguiendo el README.

**Independent Test**: Seguir solo el README (Node, pnpm install, pnpm dev) y tener la app corriendo en local.

### Implementation for User Story 3

- [x] T014 [US3] Write README.md at repository root with: Node version (20.9+), pnpm install, pnpm dev, pnpm build, pnpm test, pnpm lint, and link to quickstart if needed
- [x] T015 [US3] Add engines field in package.json for Node >= 20.9 (optional) and reference Node version in README.md

**Checkpoint**: Las tres user stories son verificables de forma independiente

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Validación end-to-end y detalles que afectan a todo el proyecto

- [x] T016 [P] Run full quickstart validation per specs/001-init-nextjs-repo/quickstart.md: pnpm install, pnpm dev, pnpm test, pnpm lint, pnpm build all succeed
- [x] T017 Ensure pnpm format (Prettier) is in package.json and documented in README.md
- [x] T018 Final cleanup: ensure ESLint and Prettier pass on all committed files; remove or minimize default placeholder content as appropriate for url-shortener

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: Sin dependencias; puede empezar de inmediato
- **Foundational (Phase 2)**: Depende de Phase 1; BLOQUEA el cierre de las user stories hasta tener tests/ y smoke test
- **User Stories (Phase 3–5)**: Dependen de Phase 2; pueden ejecutarse en orden P1 → P2 → P3
- **Polish (Phase 6)**: Depende de que las fases 3–5 estén completas

### User Story Dependencies

- **US1 (P1)**: Tras Foundational; no depende de US2/US3
- **US2 (P2)**: Tras Foundational; usa estructura ya creada en Setup; independiente de US3
- **US3 (P3)**: Tras Foundational; documenta lo ya implementado en US1/US2; independiente en verificación

### Parallel Opportunities

- T002, T003, T004 pueden ejecutarse en paralelo (Phase 1)
- T007 puede ejecutarse en paralelo con T006 una vez existan tests/ (Phase 2)
- T011 puede ejecutarse en paralelo con otras tareas de US2 que no modifiquen los mismos archivos
- T016, T017 pueden ejecutarse en paralelo (Phase 6)

---

## Parallel Example: Phase 1

```bash
# Tras T001, lanzar en paralelo:
Task T002: "Add Prisma: prisma/schema.prisma, src/lib/db.ts"
Task T003: "Add Vitest + RTL: vitest.config.ts, package.json scripts"
Task T004: "Add Prettier: .prettierrc, format script"
```

---

## Implementation Strategy

### MVP First (User Story 1 only)

1. Completar Phase 1: Setup
2. Completar Phase 2: Foundational
3. Completar Phase 3: User Story 1
4. **STOP and VALIDATE**: Verificar instalación, dev y smoke test
5. Entregar/demo si aplica

### Incremental Delivery

1. Setup + Foundational → base lista
2. US1 → verificar ejecutable → MVP
3. US2 → verificar estructura ampliable
4. US3 → verificar documentación de arranque
5. Polish → validación quickstart y lint/format

### Suggested MVP Scope

- **MVP**: Phase 1 + Phase 2 + Phase 3 (User Story 1).
- Con eso se cumple: proyecto instalable, servidor de desarrollo funcionando, tests disponibles, lockfile y versión de Next.js documentada.

---

## Notes

- [P] = archivos distintos, sin dependencias entre tareas
- [USn] vincula la tarea a la user story para trazabilidad
- Cada user story debe poder completarse y verificarse de forma independiente
- Commit recomendado tras cada tarea o grupo lógico
- Validar en cada checkpoint antes de seguir
