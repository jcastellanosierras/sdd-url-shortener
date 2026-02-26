# Tasks: Autenticación y panel de URLs por usuario

**Input**: Design documents from `specs/003-user-auth/`  
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: Incluidos según constitution (tests unitarios para Zod y Server Action; integración para dashboard y flujos auth). Cada user story es independiente y verificable.

**Organization**: Tareas agrupadas por user story para permitir implementación y prueba independiente.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Puede ejecutarse en paralelo (archivos distintos, sin dependencias entre ellas).
- **[Story]**: User story (US1, US2, US3). Solo en fases de user story.
- Incluir rutas de archivo exactas en las descripciones.

## Path Conventions

- Proyecto único Next.js: `src/`, `tests/`, `prisma/` en la raíz del repo.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Inicialización del proyecto y dependencias para auth y UI.

- [x] T001 Install better-auth dependency (e.g. `pnpm add better-auth`) and ensure Prisma adapter is available per plan in package.json
- [x] T002 Add BETTER_AUTH_SECRET and BETTER_AUTH_URL to .env.example or document in quickstart.md at repo root
- [x] T003 [P] Verify shadcn components exist or add Button, Input, Label, DropdownMenu (and Avatar if needed) in src/components/ui/ per plan

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Infraestructura de auth y esquema que DEBE estar lista antes de cualquier user story.

**⚠️ CRITICAL**: No se puede empezar ninguna user story hasta completar esta fase.

- [x] T004 Run better-auth CLI generate (`pnpm dlx @better-auth/cli@latest generate`) and merge generated User, Session, Account models into prisma/schema.prisma
- [x] T005 Add optional userId field (String, relation to User) to ShortenedURL model in prisma/schema.prisma per data-model.md
- [x] T006 Run prisma migrate dev (e.g. name add_auth_and_user_id_to_urls) and prisma generate per research.md
- [x] T007 Create src/lib/auth.ts with betterAuth, prismaAdapter(prisma, { provider: "sqlite" }), emailAndPassword: { enabled: true } (no requireEmailVerification) per contracts/README.md
- [x] T008 Create src/app/api/auth/[...all]/route.ts that forwards requests to auth.handler from src/lib/auth.ts
- [x] T009 Create src/lib/auth-client.ts with better-auth client for getSession and signOut (client-side) per better-auth docs
- [x] T010 [P] Add loginSchema and registerSchema (Zod) with basic validations (required, email format, min password length, password match for register) in src/lib/validations.ts

**Checkpoint**: Auth API y esquema listos; se puede implementar US1, US2 y US3.

---

## Phase 3: User Story 1 - Registro e inicio de sesión (Priority: P1) 🎯 MVP

**Goal**: Pantallas de login y registro con formularios shadcn + Zod; enlaces entre sí; integración con better-auth (sign-up, sign-in) y mensajes de error claros.

**Independent Test**: Registrar un usuario, cerrar sesión (u otro navegador), iniciar sesión con ese correo y contraseña; el sistema acepta el login. Navegar entre login y registro mediante los enlaces.

### Tests for User Story 1

- [x] T011 [P] [US1] Unit tests for loginSchema and registerSchema (valid/invalid inputs) in tests/unit/validations-auth.test.ts
- [ ] T012 [P] [US1] Integration test for register then login flow (optional but recommended) in tests/integration/auth-flow.test.ts

### Implementation for User Story 1

- [x] T013 [P] [US1] Create src/app/register/page.tsx with form (name, email, password, repeat password), shadcn components, Zod validation, link to /login
- [x] T014 [P] [US1] Create src/app/login/page.tsx with form (email, password), shadcn components, Zod validation, link to /register
- [x] T015 [US1] Wire register form in src/app/register/page.tsx to better-auth sign-up; show error message when email already exists (e.g. "Este correo ya está registrado")
- [x] T016 [US1] Wire login form in src/app/login/page.tsx to better-auth sign-in; show generic error when credentials incorrect (e.g. "Credenciales incorrectas")

**Checkpoint**: User Story 1 funciona de forma independiente: registro, login y navegación entre pantallas verificables.

---

## Phase 4: User Story 2 - Cabecera con estado de sesión (Priority: P2)

**Goal**: En la página principal, zona superior derecha: sin sesión → "Iniciar sesión" y "Registrarse"; con sesión → avatar con dropdown "Dashboard" y "Cerrar sesión".

**Independent Test**: Entrar en la página principal sin sesión (enlaces visibles), iniciar sesión y comprobar avatar con dropdown; elegir "Cerrar sesión" y comprobar que vuelven los enlaces.

### Implementation for User Story 2

- [x] T017 [P] [US2] Create src/components/header-auth.tsx: when no session show links to /login and /register; when session show avatar (icon or initials) with DropdownMenu items "Dashboard" (link to /dashboard) and "Cerrar sesión" per contracts/README.md
- [x] T018 [US2] Use auth-client getSession in header-auth (client component) or pass session from layout; implement signOut on "Cerrar sesión" in src/components/header-auth.tsx
- [x] T019 [US2] Add HeaderAuth component to src/app/layout.tsx or src/app/page.tsx so it appears on main page (and optionally login/register/dashboard) per plan

**Checkpoint**: User Stories 1 y 2 funcionan; cabecera refleja estado de sesión.

---

## Phase 5: User Story 3 - Dashboard de URLs acortadas (Priority: P3)

**Goal**: Página dashboard accesible solo para autenticados; listado de URLs acortadas del usuario (slug/URL acortada + URL de destino); botón/enlace "Volver a la página principal"; creación de URL asociada al userId.

**Independent Test**: Iniciar sesión, crear una o varias URLs desde la página principal, abrir Dashboard y comprobar listado; sin sesión, acceso a /dashboard redirige a login.

### Tests for User Story 3

- [ ] T020 [P] [US3] Unit test for createShortenedUrl with session (userId set) and without session (userId null or error) in tests/unit/create-short-url-auth.test.ts
- [ ] T021 [P] [US3] Integration test: dashboard without session redirects to /login; with session shows only current user URLs in tests/integration/dashboard.test.ts

### Implementation for User Story 3

- [x] T022 [US3] Extend createShortenedUrl in src/app/actions.ts to get session (e.g. auth.api.getSession({ headers })) and pass userId when creating ShortenedURL; keep behavior when no session (userId null or return error per product decision) per contracts/README.md
- [x] T023 [US3] Create src/app/dashboard/page.tsx: get session (server-side); if no session redirect to /login
- [x] T024 [US3] In src/app/dashboard/page.tsx fetch prisma.shortenedURL.findMany({ where: { userId: session.user.id }, orderBy: { createdAt: 'desc' } }) and render list (short URL or slug + originalUrl), empty state (e.g. "Aún no tienes URLs acortadas"), and link "Volver a la página principal" to /
- [x] T025 [US3] Ensure dashboard page uses Prisma in server component and displays data per data-model.md and contracts/README.md

**Checkpoint**: Todas las user stories están implementadas y son verificables de forma independiente.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Verificación final, lint y documentación.

- [x] T026 Run full verification steps from specs/003-user-auth/quickstart.md (register, login, header, create URL, dashboard, sign out, tests, build)
- [x] T027 [P] Run pnpm lint and pnpm format; fix any issues in modified files
- [x] T028 Ensure no secrets in code; env vars (BETTER_AUTH_SECRET, BETTER_AUTH_URL) documented in quickstart or .env.example

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: Sin dependencias; puede empezar de inmediato.
- **Phase 2 (Foundational)**: Depende de Phase 1; BLOQUEA todas las user stories.
- **Phase 3 (US1)**: Depende de Phase 2; puede empezar en paralelo con US2/US3 una vez Phase 2 esté lista.
- **Phase 4 (US2)**: Depende de Phase 2 (necesita auth-client y sesión); puede hacerse tras o en paralelo con US1.
- **Phase 5 (US3)**: Depende de Phase 2 (Prisma con userId, sesión); recomendable después de US1 para tener usuarios que creen URLs.
- **Phase 6 (Polish)**: Depende de que estén completas las user stories que se quieran entregar.

### User Story Dependencies

- **US1 (P1)**: Solo depende de Phase 2. Es el MVP (registro + login + enlaces entre pantallas).
- **US2 (P2)**: Depende de Phase 2; usa sesión y auth-client. Independiente de US1 a nivel de implementación (solo necesita que exista auth).
- **US3 (P3)**: Depende de Phase 2 y de que createShortenedUrl acepte userId (T022); recomendable US1 antes para probar con usuarios reales.

### Within Each User Story

- Tests (T011–T012, T020–T021) pueden escribirse en paralelo con la implementación o antes; los unit tests de Zod y de la Server Action deben poder fallar antes de implementar.
- US1: Páginas login/register (T013, T014) en paralelo; luego wiring (T015, T016).
- US2: Componente header (T017, T018) y su integración en layout/page (T019).
- US3: Acción extendida (T022), luego página dashboard (T023, T024, T025).

### Parallel Opportunities

- Phase 1: T003 [P] puede hacerse en paralelo con T001, T002.
- Phase 2: T010 [P] en paralelo con T004–T009 una vez se tenga el schema.
- Phase 3: T011, T012, T013, T014 [P] entre sí; luego T015, T016 secuenciales si comparten patrones.
- Phase 4: T017 [P] independiente; T018, T019 secuenciales.
- Phase 5: T020, T021 [P]; T022 antes que T023–T025 (la página usa la acción y el schema con userId).

---

## Parallel Example: User Story 1

```bash
# Tests US1 en paralelo:
Task T011: "Unit tests for loginSchema and registerSchema in tests/unit/validations-auth.test.ts"
Task T012: "Integration test for register then login in tests/integration/auth-flow.test.ts"

# Páginas US1 en paralelo:
Task T013: "Create src/app/register/page.tsx ..."
Task T014: "Create src/app/login/page.tsx ..."
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Completar Phase 1: Setup
2. Completar Phase 2: Foundational
3. Completar Phase 3: User Story 1 (registro, login, enlaces)
4. **PARAR y VALIDAR**: Probar registro, login y navegación entre login/register
5. Desplegar o demostrar si aplica

### Incremental Delivery

1. Setup + Foundational → base lista
2. Añadir US1 → probar independientemente → MVP (auth usable)
3. Añadir US2 → cabecera con sesión y logout → probar
4. Añadir US3 → dashboard y URLs por usuario → probar
5. Polish → verificación quickstart y lint

### Parallel Team Strategy

Con varios desarrolladores:

1. Todo el equipo completa Phase 1 y Phase 2
2. Desarrollador A: US1 (pantallas login/register)
3. Desarrollador B: US2 (cabecera)
4. Desarrollador C: US3 (dashboard y extensión de createShortenedUrl)
5. Integrar y ejecutar Phase 6

---

## Notes

- Tareas [P] = archivos distintos, sin dependencias entre ellas.
- Etiqueta [USn] asocia la tarea a la user story para trazabilidad.
- Cada user story debe ser completable y testeable de forma independiente.
- Verificar que los tests fallen antes de implementar cuando se aplique red-green-refactor.
- Hacer commit tras cada tarea o grupo lógico.
- Detenerse en cada checkpoint para validar la story de forma independiente.
