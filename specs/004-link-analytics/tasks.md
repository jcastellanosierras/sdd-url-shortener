---
description: "Task list for feature 004-link-analytics (Analítica de enlaces)"
---

# Tasks: Analítica de enlaces acortados (004-link-analytics)

**Input**: Design documents from `specs/004-link-analytics/`  
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: La constitución (`.specify/memory/constitution.md`) exige estándares de testing. Se incluyen tareas de tests unitarios (payload, parsing UA/UTM) e integración (redirect+webhook, vista analíticas) según plan.md. Los tests deben fallar antes de implementar (red-green-refactor).

**Organization**: Tareas agrupadas por user story para implementación y prueba independiente.

## Format: `[ID] [P?] [Story?] Description`

- **[P]**: Puede ejecutarse en paralelo (archivos distintos, sin dependencias)
- **[Story]**: User story (US1, US2, US3)
- Incluir rutas de archivo exactas en la descripción

## Path Conventions

- Proyecto único Next.js: `src/app/`, `src/lib/`, `prisma/`, `tests/unit/`, `tests/integration/` en la raíz del repo.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Dependencias y configuración necesaria para la feature.

- [x] T001 Add dependency ua-parser-js for User-Agent parsing in package.json
- [x] T002 [P] Verify Vitest config covers tests/unit and tests/integration for analytics tests

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Modelo de datos y migración que deben estar listos antes de cualquier user story.

**⚠️ CRITICAL**: Ninguna user story puede comenzar hasta completar esta fase.

- [x] T003 Add Visit model to prisma/schema.prisma per data-model.md (id, shortenedUrlId, createdAt, country, region, device, os, referrer, utm_source, utm_medium, utm_campaign, utm_term, utm_content; relation ShortenedURL 1—N Visit, onDelete Cascade)
- [x] T004 Run Prisma migration: `pnpm prisma migrate dev --name add_visit_model` and verify ShortenedURL has visits relation

**Checkpoint**: Foundation ready — implementación de user stories puede comenzar

---

## Phase 3: User Story 1 - Registro de visitas al hacer clic (Priority: P1) 🎯 MVP

**Goal**: Registrar una visita por cada acceso a URL acortada (redirect), capturando localización, dispositivo, SO, referrer y UTM; redirección no bloqueada (fire-and-forget).

**Independent Test**: Generar URL acortada, hacer peticiones a la URL desde distintos contextos (User-Agent, referrer, UTM); comprobar que se persiste una visita por acceso con datos capturados.

### Tests for User Story 1

> **NOTE: Escribir estos tests PRIMERO; deben FALLAR antes de la implementación**

- [x] T005 [P] [US1] Unit test: validate visit payload (types, allowed device/os values) in tests/unit/visits-payload.test.ts
- [x] T006 [P] [US1] Unit test: User-Agent parsing and UTM query parsing to expected structure in tests/unit/visits-parsing.test.ts
- [x] T007 [US1] Integration test: GET /[slug] returns 302 and one visit persisted (redirect + webhook fire-and-forget) in tests/integration/analytics-visit.test.ts

### Implementation for User Story 1

- [x] T008 [US1] Create POST /api/visits route in src/app/api/visits/route.ts (resolve ShortenedURL by slug or shortenedUrlId, 404 if not found, accept JSON body per contracts/endpoints.md)
- [x] T009 [US1] Parse User-Agent with ua-parser-js for device (mobile/desktop/unknown) and os (Windows, macOS, Linux, iOS, Android, Other, unknown) in src/app/api/visits/route.ts or src/lib; default "unknown" when not inferrable
- [x] T010 [US1] Read country and region from request headers (x-vercel-ip-country, x-vercel-ip-country-region) in src/app/api/visits/route.ts; store null or omit when absent
- [x] T011 [US1] Modify src/app/[slug]/route.ts: after() from next/server with fire-and-forget fetch to POST /api/visits with payload (slug, userAgent, referer, UTM params from query, country/region from headers)

**Checkpoint**: US1 fully functional; visits recorded on redirect without blocking response

---

## Phase 4: User Story 2 - Visualización de totales y desglose de analíticas (Priority: P2)

**Goal**: El propietario del enlace puede ver total de visitas y desgloses por país, dispositivo, SO, referrer y UTM; solo propietario autorizado.

**Independent Test**: Crear enlace, generar visitas con distintos referrers/UTM/dispositivos; comprobar que la interfaz de analíticas muestra total y desgloses coherentes; no propietario recibe 403.

### Tests for User Story 2

- [x] T012 [P] [US2] Integration test: owner GET analytics for link returns 200 with totalVisits and breakdowns (byCountry, byDevice, byOs, byReferrer, byUtm\*) in tests/integration/analytics-view.test.ts
- [x] T013 [P] [US2] Integration test: non-owner GET analytics for link returns 403 in tests/integration/analytics-view.test.ts

### Implementation for User Story 2

- [x] T014 [US2] Implement GET analytics: auth (better-auth), resolve link by slug, owner check (ShortenedURL.userId === session.user.id), 403 if not owner — in src/app/api/links/[slug]/analytics/route.ts or Server Component data fetch
- [x] T015 [US2] Aggregate visits: total count and groupBy country, device, os, referrer, utm_source, utm_medium, utm_campaign, utm_term, utm_content in src/lib/analytics.ts or route handler
- [x] T016 [US2] Create analytics view page at src/app/dashboard/links/[slug]/analytics/page.tsx showing total visits and breakdowns (country, device, os, referrer, UTM) per contracts/endpoints.md
- [x] T017 [US2] Handle unknown/empty values in analytics view (e.g. "direct"/"none" for null referrer/UTM) per spec edge cases in src/app/dashboard/links/[slug]/analytics/page.tsx

**Checkpoint**: US2 complete; owner can view analytics; non-owner gets 403

---

## Phase 5: User Story 3 - Acceso a analíticas desde el listado de enlaces (Priority: P3)

**Goal**: Usuario llega a la vista de analíticas desde el Dashboard/listado; cada enlace tiene control "Ver analíticas"; vista de analíticas tiene "Volver".

**Independent Test**: Entrar al Dashboard, usar el control de ver analíticas de un enlace, comprobar navegación a vista de totales/desglose; usar "Volver" y comprobar regreso al listado.

### Implementation for User Story 3

- [x] T018 [US3] Add "Ver analíticas" link or button per link in dashboard list in src/app/dashboard/page.tsx linking to /dashboard/links/[slug]/analytics
- [x] T019 [US3] Add "Volver" (back) link or button on analytics view in src/app/dashboard/links/[slug]/analytics/page.tsx to return to dashboard/list

**Checkpoint**: All user stories functional; navigation from list to analytics and back

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Mejoras que afectan a varias user stories o cierre de la feature.

- [x] T020 [P] Update quickstart.md or docs if steps changed during implementation
- [x] T021 Run quickstart.md validation (manual or script) to verify setup and flows
- [x] T022 [P] Code cleanup, lint and format pass for src/app/api/visits, src/app/[slug]/route.ts, src/app/dashboard/links, tests/

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: Sin dependencias — puede iniciarse de inmediato
- **Foundational (Phase 2)**: Depende de Setup — BLOQUEA todas las user stories
- **User Stories (Phase 3–5)**: Dependen de Foundational
  - US1 (P1) → US2 (P2) → US3 (P3) en orden de prioridad, o en paralelo si hay capacidad
- **Polish (Phase 6)**: Depende de que las user stories deseadas estén completas

### User Story Dependencies

- **US1 (P1)**: Tras Phase 2; sin dependencias de otras stories
- **US2 (P2)**: Tras Phase 2; consume datos de Visit creados por US1; independientemente testeable con visitas creadas en tests
- **US3 (P3)**: Tras Phase 2; integra con listado (dashboard) y vista de analíticas (US2); requiere US2 para que la ruta de analíticas exista

### Within Each User Story

- Tests MUST escribirse y FALLAR antes de la implementación
- Modelo/API antes de integración en redirect (US1: POST visits → luego [slug]/route.ts)
- Core implementation antes de integración (US2: GET + agregación → luego página)
- Story completa antes de pasar a la siguiente prioridad

### Parallel Opportunities

- T002 [P] en Setup puede ejecutarse en paralelo con T001
- T005 y T006 [P] (tests unitarios US1) pueden ejecutarse en paralelo
- T012 y T013 [P] (tests integración US2) pueden ejecutarse en paralelo
- T020 y T022 [P] en Polish pueden ejecutarse en paralelo
- Diferentes user stories pueden trabajarse en paralelo por distintos desarrolladores una vez completada Phase 2

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Completar Phase 1: Setup
2. Completar Phase 2: Foundational (CRÍTICO)
3. Completar Phase 3: US1 (tests primero, luego implementación)
4. **STOP and VALIDATE**: Probar US1 de forma independiente (redirect + visita persistida)
5. Desplegar/demo si procede

### Incremental Delivery

1. Setup + Foundational → base lista
2. US1 → tests + implementación → validar → MVP (registro de visitas)
3. US2 → tests + implementación → validar → visualización de analíticas
4. US3 → implementación → validar → acceso desde listado
5. Cada story aporta valor sin romper las anteriores

### Parallel Team Strategy

Con varios desarrolladores:

1. Equipo completa Setup + Foundational junto
2. Tras Foundational:
   - Dev A: US1
   - Dev B: US2 (tests con datos de visita creados en fixtures o API)
   - Dev C: US3 (tras o en paralelo a US2 para rutas y página)
3. Stories se completan e integran de forma independiente

---

## Notes

- [P] = archivos distintos, sin dependencias entre tareas
- [US1/US2/US3] permite trazabilidad con spec.md
- Cada user story debe ser completable y testeable de forma independiente
- Verificar que los tests fallan antes de implementar
- Commit tras cada tarea o grupo lógico
- Detenerse en cualquier checkpoint para validar la story de forma independiente
- Evitar: tareas vagas, conflictos en el mismo archivo, dependencias entre stories que rompan la independencia
