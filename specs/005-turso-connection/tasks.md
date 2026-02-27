# Tasks: Conexión a Turso

**Input**: Design documents from `/specs/005-turso-connection/`  
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: No se generan tareas de test explícitas; la spec no lo solicita. Los tests existentes deben seguir pasando; validación manual según quickstart.md.

**Organization**: Tareas agrupadas por user story (US1, US2, US3) para permitir implementación y verificación independiente.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Puede ejecutarse en paralelo (archivos distintos, sin dependencias entre ellas).
- **[Story]**: User story (US1, US2, US3) cuando aplica.
- Incluir rutas de archivo en la descripción.

## Path Conventions

- Proyecto único: `src/`, `prisma/`, raíz del repo.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Dependencias y configuración de entorno para Turso.

- [x] T001 [P] Instalar dependencias `@libsql/client` y `@prisma/adapter-libsql` vía `npm install` (actualiza package.json)
- [x] T002 [P] Añadir `TURSO_DATABASE_URL` y `TURSO_AUTH_TOKEN` a `.env.example` con comentario de que son opcionales para Turso

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Schema Prisma y generación del cliente; requisito para usar el adaptador libSQL.

**⚠️ CRITICAL**: Ninguna user story puede empezar hasta completar esta fase.

- [x] T003 Añadir `previewFeatures = ["driverAdapters"]` al `generator` en `prisma/schema.prisma` y asegurar que el `datasource` tenga `url` válida para migraciones locales (p. ej. `url = "file:./dev.db"` o la usada por prisma.config.ts)
- [x] T004 Ejecutar `npx prisma generate` tras T003 y comprobar que el cliente se genera sin errores (salida en node_modules/.prisma/client)

**Checkpoint**: Schema y cliente listos; puede implementarse el adaptador condicional en db.ts

---

## Phase 3: User Story 1 - La aplicación persiste y lee datos correctamente (Priority: P1) 🎯 MVP

**Goal**: La app usa Turso como almacén cuando está configurado y persiste/recupera datos correctamente; sin config Turso sigue usando SQLite local.

**Independent Test**: Con `TURSO_DATABASE_URL` y `TURSO_AUTH_TOKEN` definidos, arrancar la app, crear/modificar datos (registro, enlace, etc.) y comprobar que persisten y se leen en peticiones posteriores. Sin esas variables, la app arranca y usa SQLite local.

### Implementation for User Story 1

- [x] T005 [US1] Implementar adaptador condicional en `src/lib/db.ts`: si existen `TURSO_DATABASE_URL` y `TURSO_AUTH_TOKEN`, crear `PrismaLibSQL` con esas env y usarlo como adaptador del `PrismaClient`; si no, mantener el adaptador actual `PrismaBetterSqlite3` con `DATABASE_URL` o archivo local (ver research.md y quickstart.md)

**Checkpoint**: Con Turso configurado, las operaciones de lectura/escritura deben completarse contra Turso; sin config, contra SQLite local.

---

## Phase 4: User Story 2 - La aplicación arranca y se conecta al almacén (Priority: P2)

**Goal**: Arranque correcto con Turso configurado y disponible; si la config es inválida o Turso no está disponible, fallo visible (logs o salida de proceso), no operatividad silenciosa.

**Independent Test**: Arrancar con Turso configurado y válido → app lista; arrancar con Turso configurado pero URL/token inválidos o servicio caído → error visible en logs o proceso que permita diagnosticar.

### Implementation for User Story 2

- [x] T006 [US2] Asegurar en `src/lib/db.ts` que los fallos de conexión a Turso (config inválida o servicio no disponible) no se traguen: que el error se registre y/o se propague para que el arranque o la primera petición fallen de forma visible (FR-004, SC-003)

**Checkpoint**: Comportamiento de arranque y fallo de conexión verificable según criterios de la spec.

---

## Phase 5: User Story 3 - Esquema de datos aplicable y consistente (Priority: P3)

**Goal**: El esquema definido en Prisma puede aplicarse a Turso y mantenerse consistente; flujo documentado y, opcionalmente, script para aplicar migraciones.

**Independent Test**: Aplicar el esquema/migraciones a una base Turso vacía (según quickstart.md), arrancar la app y ejecutar flujos que lean/escriban; no deben aparecer errores de tablas o columnas faltantes.

### Implementation for User Story 3

- [x] T007 [P] [US3] Añadir script (shell o npm) para aplicar las migraciones de `prisma/migrations/` a una base Turso (nombre de DB por env o argumento), siguiendo `specs/005-turso-connection/quickstart.md`; documentar su uso en quickstart o README del proyecto

**Checkpoint**: Esquema aplicable a Turso de forma repetible; sin errores de esquema en runtime en los flujos cubiertos.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Validación y limpieza final.

- [x] T008 Validar pasos de `specs/005-turso-connection/quickstart.md` (ejecutar manualmente o documentar en README del repo cómo comprobar conexión Turso y aplicación de migraciones)
- [x] T009 [P] Ejecutar lint/format en archivos tocados (`prisma/schema.prisma`, `src/lib/db.ts`, `.env.example`) y corregir si aplica

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: Sin dependencias.
- **Phase 2 (Foundational)**: Depende de Phase 1 (deps instaladas). Bloquea US1, US2, US3.
- **Phase 3 (US1)**: Depende de Phase 2. Entrega MVP (persistencia/lectura con Turso o SQLite).
- **Phase 4 (US2)**: Depende de Phase 2; puede hacerse tras o en paralelo a US1. Arranque y fallo visible.
- **Phase 5 (US3)**: Depende de Phase 2; puede hacerse tras o en paralelo a US1/US2. Script/docs de migraciones a Turso.
- **Phase 6 (Polish)**: Tras las user stories que se quieran entregar.

### User Story Dependencies

- **US1 (P1)**: Solo depende de Foundational. Independiente de US2/US3.
- **US2 (P2)**: Solo depende de Foundational; refuerza el mismo `src/lib/db.ts` que US1.
- **US3 (P3)**: Solo depende de Foundational; no bloquea US1/US2.

### Parallel Opportunities

- T001 y T002 pueden ejecutarse en paralelo (Phase 1).
- T007 (script de migraciones) es [P] dentro de Phase 5.
- T009 es [P] en Phase 6.
- Tras Phase 2, US1, US2 y US3 pueden repartirse en paralelo si hay varias personas.

---

## Parallel Example: After Foundational

```bash
# Una persona: US1 (T005) → US2 (T006) → US3 (T007)
# O en paralelo:
# Dev A: T005 (db.ts condicional)
# Dev B: T006 (manejo de errores en db.ts - coordinar con A si es mismo archivo)
# Dev C: T007 (script de migraciones)
```

---

## Implementation Strategy

### MVP First (User Story 1)

1. Phase 1: Setup (T001, T002).
2. Phase 2: Foundational (T003, T004).
3. Phase 3: US1 (T005).
4. Validar: arrancar con y sin Turso; crear y leer datos.
5. Opcional: seguir con US2 (T006), US3 (T007) y Polish (T008, T009).

### Incremental Delivery

1. Setup + Foundational → cliente Prisma con driverAdapters listo.
2. US1 → persistencia/lectura con Turso o SQLite (MVP).
3. US2 → arranque y fallo de conexión claros.
4. US3 → aplicar esquema a Turso de forma repetible.
5. Polish → quickstart validado y lint limpio.

---

## Notes

- Tareas con [P] = archivos distintos o sin dependencias entre ellas.
- [US1/US2/US3] vincula la tarea a la user story para trazabilidad.
- Cada user story es verificable de forma independiente según la spec.
- Commit recomendado tras cada tarea o grupo lógico.
