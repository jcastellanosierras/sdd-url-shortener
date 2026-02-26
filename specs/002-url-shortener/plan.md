# Implementation Plan: Acortador de URLs

**Branch**: `002-url-shortener` | **Date**: 2025-02-10 | **Spec**: [spec.md](./spec.md)  
**Input**: Feature specification from `specs/002-url-shortener/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.cursor/commands/speckit.plan.md` for the execution workflow.

## Summary

El usuario introduce una URL en un formulario en la página principal; la aplicación valida la URL (Zod), genera un slug único, persiste la asociación en SQLite con Prisma (modelo ShortenedURL) y muestra la URL acortada. Una ruta dinámica GET `/[slug]` busca el slug en base de datos y redirige a la URL original o devuelve 404. Stack: Next.js (App Router), React, shadcn/ui, Prisma (SQLite), Zod; formulario nativo sin librerías extra.

## Technical Context

**Language/Version**: TypeScript 5 (Node.js >= 20.9)  
**Primary Dependencies**: Next.js 16, React 19, Prisma 7, shadcn/ui (Radix, Tailwind), Zod (añadir)  
**Storage**: SQLite vía Prisma (archivo local en desarrollo); migración futura a Turso posible  
**Testing**: Vitest, React Testing Library (ya en proyecto); tests unitarios para validación y Server Action; integración para redirect/404  
**Target Platform**: Web (navegador); servidor Node.js  
**Project Type**: single (monolito Next.js: app, API implícita en Server Actions y rutas)  
**Performance Goals**: Redirección percibida como inmediata; creación de URL acortada en &lt; 1 s en condiciones normales  
**Constraints**: Validación de URL obligatoria antes de persistir; no redirigir a destinos externos cuando el slug no existe  
**Scale/Scope**: Una entidad (ShortenedURL); una página principal (formulario); una ruta dinámica (redirect)

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

Verificar cumplimiento con `.specify/memory/constitution.md`:

- **Code Quality**: Lint/format configurados (ESLint, Prettier); estructura y nombres coherentes con el resto del proyecto; sin deuda técnica no justificada.
- **Testing Standards**: Estrategia definida: tests unitarios (Zod, generación de slug, Server Action con mocks o DB de test); tests de integración para GET /[slug] (redirect y 404). Red-green-refactor donde aplique.
- **User Experience Consistency**: Formulario y mensajes de error/éxito con shadcn; feedback claro (URL acortada mostrada, “URL no válida”, “enlace no encontrado” en 404).
- **Performance Requirements**: Criterios: redirección inmediata (respuesta 302/307); creación de URL en tiempo razonable; documentados en plan/spec.

Cualquier violación justificada debe documentarse en la tabla Complexity Tracking más abajo.

## Project Structure

### Documentation (this feature)

```text
specs/002-url-shortener/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
│   └── README.md        # Server Action + GET [slug] contract
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
src/
├── app/
│   ├── layout.tsx
│   ├── page.tsx              # Página principal: formulario acortador (sustituir contenido actual)
│   ├── [slug]/               # Ruta dinámica: GET → redirect o 404
│   │   └── route.ts           # o page.tsx con redirect
│   ├── globals.css
│   └── favicon.ico
├── components/
│   └── ui/                   # shadcn (Button, Input, Label, etc. según necesidad)
├── lib/
│   ├── db.ts                 # Cliente Prisma (existente)
│   ├── utils.ts
│   └── validations.ts        # Esquema Zod para URL (nuevo, opcional nombre)
prisma/
├── schema.prisma             # provider sqlite; modelo ShortenedURL
└── migrations/
tests/
├── unit/                     # Zod, generación slug, Server Action (mock DB)
└── integration/              # GET /[slug] redirect y 404
```

**Structure Decision**: Proyecto único Next.js (App Router). La página principal (`src/app/page.tsx`) se modifica para mostrar solo el formulario del acortador (eliminando contenido placeholder y enlace a /demo; se puede eliminar la ruta `/demo` si no se usa). La ruta dinámica `src/app/[slug]/route.ts` (o `page.tsx`) implementa el GET que busca por slug y redirige o devuelve 404. Persistencia en `prisma/schema.prisma` con SQLite.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation   | Why Needed | Simpler Alternative Rejected Because |
| ----------- | ---------- | ------------------------------------ |
| _(ninguna)_ | —          | —                                    |
