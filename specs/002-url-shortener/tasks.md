# Tasks: Acortador de URLs

**Input**: Design documents from `/specs/002-url-shortener/`  
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Incluidos por constitución (`.specify/memory/constitution.md`): tests unitarios para validación y Server Action; tests de integración para redirect y 404.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g. US1, US2)
- Include exact file paths in descriptions

## Path Conventions

- **Single project**: `src/`, `tests/` at repository root
- Paths follow plan.md: `src/app/`, `src/lib/`, `prisma/`, `tests/unit/`, `tests/integration/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Dependencies and structure for the feature

- [x] T001 Add Zod dependency to package.json (`pnpm add zod`)
- [x] T002 [P] Add shadcn/ui form components (Input, Label) if not present; run from project root e.g. `pnpm dlx shadcn@latest add input label` targeting `src/components/ui/`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Database and shared utilities that MUST be complete before ANY user story

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T003 Update prisma/schema.prisma: set datasource provider to `sqlite` with `url = "file:./dev.db"` and add ShortenedURL model (id, slug, originalUrl, createdAt, updatedAt) per data-model.md
- [x] T004 Run `pnpm exec prisma migrate dev --name add_shortened_url` from repo root to create and apply migration
- [x] T005 Run `pnpm exec prisma generate` from repo root
- [x] T006 [P] Create URL validation schema (Zod) in src/lib/validations.ts (http/https URL only, export for use in Server Action)
- [x] T007 [P] Create slug generation utility (short URL-safe unique string) in src/lib/slug.ts or src/lib/utils.ts

**Checkpoint**: Foundation ready — user story implementation can now begin

---

## Phase 3: User Story 1 - Crear URL acortada (Priority: P1) 🎯 MVP

**Goal**: User submits a URL in the form and receives the short URL under the app domain.

**Independent Test**: Submit a valid URL on the home page and confirm the app returns a short URL (e.g. `http://localhost:3000/abc12xy`); visiting that short URL later redirects to the original (after US2).

### Tests for User Story 1

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [x] T008 [P] [US1] Unit test Zod URL validation (valid/invalid/empty) in tests/unit/validations.test.ts
- [x] T009 [P] [US1] Unit test slug generation (uniqueness, URL-safe format) in tests/unit/slug.test.ts
- [x] T010 [US1] Integration or unit test for createShortenedUrl: given valid URL returns shortUrl; given invalid URL returns error; in tests/integration/create-short-url.test.ts or tests/unit/actions.test.ts

### Implementation for User Story 1

- [x] T011 [US1] Implement createShortenedUrl Server Action in src/app/actions.ts (validate with Zod, generate slug, persist via prisma, return { success, shortUrl } or { success: false, error })
- [x] T012 [US1] Replace src/app/page.tsx with acortador form: shadcn Input + Label + Button, native form, client-side Zod validation and Server Action; show short URL on success and clear error message on validation failure; remove placeholder content and demo link

**Checkpoint**: User Story 1 is complete — form creates short URLs and displays them

---

## Phase 4: User Story 2 - Redirigir desde la URL acortada (Priority: P2)

**Goal**: Visiting the short URL redirects the user to the original URL; unknown slug returns 404.

**Independent Test**: Create a short URL (US1), then open the short URL in the browser and confirm redirect to original; open a non-existent slug and confirm 404 / “not found”.

### Tests for User Story 2

- [x] T013 [P] [US2] Integration test: GET /[slug] returns 302/307 redirect to originalUrl when slug exists, in tests/integration/redirect.test.ts
- [x] T014 [P] [US2] Integration test: GET /[slug] returns 404 when slug does not exist, in tests/integration/redirect.test.ts (or same file)

### Implementation for User Story 2

- [x] T015 [US2] Create src/app/[slug]/route.ts: GET handler looks up slug in DB via Prisma; if found return NextResponse.redirect(originalUrl, 302); if not found return NextResponse with 404 or use notFound()

**Checkpoint**: User Stories 1 and 2 are complete — create and redirect both work

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: Cleanup and verification

- [x] T016 Remove src/app/demo/ route (directory and page.tsx) if no longer used, per plan
- [x] T017 [P] Run quickstart.md verification steps (dev, create URL, redirect, 404, tests, build)
- [x] T018 [P] Update README.md or docs if project structure or commands changed

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately
- **Foundational (Phase 2)**: Depends on Setup — BLOCKS all user stories
- **User Stories (Phase 3–4)**: Depend on Foundational completion; US2 can start after or in parallel with US1 (US2 only needs Prisma + ShortenedURL and the [slug] route)
- **Polish (Phase 5)**: Depends on desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Starts after Foundational; no dependency on US2
- **User Story 2 (P2)**: Starts after Foundational; uses same ShortenedURL model and DB (no code dependency on US1 UI)

### Within Each User Story

- Tests (T008–T010, T013–T014) MUST be written and failing before implementation tasks
- T011 (Server Action) before T012 (page that calls it); T015 (route) can be done after integration tests

### Parallel Opportunities

- T002, T006, T007 can run in parallel after T001
- T006 and T007 are parallel in Phase 2
- T008, T009 in Phase 3 are parallel; T010 after (may use DB)
- T013, T014 in Phase 4 are parallel
- T017, T018 in Phase 5 are parallel

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational
3. Complete Phase 3: User Story 1 (tests then implementation)
4. **STOP and VALIDATE**: Form creates short URL and shows it (redirect will 404 until US2)
5. Deploy/demo form flow if desired

### Incremental Delivery

1. Setup + Foundational → DB and validation/slug ready
2. User Story 1 → Form creates and displays short URL (MVP)
3. User Story 2 → Visiting short URL redirects; 404 for unknown slug
4. Polish → Remove demo, run quickstart, update docs

### Parallel

- After Foundational: one developer can do US1 (form + action), another US2 (route) in parallel.

---

## Notes

- [P] = parallel-safe (different files or no ordering requirement)
- [US1]/[US2] = traceability to spec.md user stories
- Commit after each task or logical group
- Use base URL (e.g. from env or request) when building shortUrl in the Server Action; see contracts/README.md
