# Implementation Plan: Autenticación y panel de URLs por usuario

**Branch**: `003-user-auth` | **Date**: 2026-02-26 | **Spec**: [spec.md](./spec.md)  
**Input**: Feature specification from `specs/003-user-auth/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.cursor/commands/speckit.plan.md` for the execution workflow.

## Summary

Añadir autenticación con **better-auth** (email y contraseña, sin verificación) para que cada usuario tenga sus propias URLs acortadas. Better-auth se integra con Prisma (SQLite); el esquema de tablas de auth se genera con el CLI de better-auth y se aplica con migraciones de Prisma; solo se añade el campo `userId` a la tabla de URLs acortadas para asociarlas al usuario. Pantallas: login, registro (con enlaces entre sí), cabecera con estado de sesión (enlaces Iniciar sesión / Registrarse o avatar con dropdown Dashboard / Cerrar sesión), y dashboard sencillo que lista las URLs acortadas del usuario (vía Prisma). Formularios con **shadcn/ui** y validación básica con **Zod** (sin react-hook-form).

## Technical Context

**Language/Version**: TypeScript 5 (Node.js >= 20.9)  
**Primary Dependencies**: Next.js 16, React 19, Prisma 7, better-auth, shadcn/ui (Radix, Tailwind), Zod  
**Storage**: SQLite vía Prisma (existente); tablas de better-auth (user, session, account) generadas por CLI; ShortenedURL con `userId`  
**Testing**: Vitest, React Testing Library; tests unitarios para validaciones Zod y Server Actions; integración para flujos auth y dashboard  
**Target Platform**: Web (navegador); servidor Node.js  
**Project Type**: single (monolito Next.js: App Router, Server Actions, rutas API de better-auth)  
**Performance Goals**: Login/registro y carga del dashboard en tiempo razonable (&lt; 2 s en condiciones normales); redirección por slug sin degradación  
**Constraints**: Auth solo email/contraseña sin verificación; formularios shadcn + Zod únicamente; validaciones básicas  
**Scale/Scope**: Tres entidades de auth (User, Session, Account), ShortenedURL extendida con userId; 4 pantallas (home, login, register, dashboard)

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

Verificar cumplimiento con `.specify/memory/constitution.md`:

- **Code Quality**: Lint/format existentes (ESLint, Prettier); nombres y estructura coherentes; better-auth y Prisma documentados en plan; sin deuda técnica no justificada.
- **Testing Standards**: Tests unitarios para esquemas Zod (login/register) y para Server Action de creación de URL (con/sin sesión); tests de integración para acceso al dashboard (autenticado/no autenticado) y listado de URLs por usuario.
- **User Experience Consistency**: Mensajes de error claros (credenciales incorrectas, correo duplicado, contraseñas no coinciden); feedback en formularios; cabecera y dashboard alineados con el resto de la UI (shadcn).
- **Performance Requirements**: Criterios en spec (registro &lt; 2 min, login en un paso); dashboard con listado acotado (Prisma query con `where: { userId }`).

**Post Phase 1**: Re-evaluado tras diseño (data-model, contracts, quickstart). Sin violaciones; Complexity Tracking vacío.

Cualquier violación justificada debe documentarse en la tabla Complexity Tracking más abajo.

## Project Structure

### Documentation (this feature)

```text
specs/003-user-auth/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
│   └── README.md
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
src/
├── app/
│   ├── layout.tsx
│   ├── page.tsx                    # Página principal: formulario + cabecera con sesión
│   ├── api/auth/[...all]/route.ts  # Better-auth catch-all (configuración del proyecto)
│   ├── login/
│   │   └── page.tsx                # Pantalla login (correo, contraseña; enlace a registro)
│   ├── register/
│   │   └── page.tsx                # Pantalla registro (nombre, correo, contraseña, repetir; enlace a login)
│   ├── dashboard/
│   │   └── page.tsx                # Panel: volver a home + listado URLs del usuario (solo autenticados)
│   ├── [slug]/route.ts             # Sin cambios: redirect por slug
│   └── ...
├── components/
│   ├── ui/                         # shadcn (Button, Input, Label, etc.)
│   └── header-auth.tsx             # Cabecera: enlaces login/registro o avatar + dropdown (Dashboard, Cerrar sesión)
├── lib/
│   ├── auth.ts                     # Configuración better-auth (Prisma adapter, emailAndPassword, sin verificación)
│   ├── auth-client.ts              # Cliente better-auth para uso en cliente (opcional, según docs)
│   ├── db.ts
│   ├── validations.ts              # Zod: urlSchema existente + loginSchema, registerSchema (básicos)
│   └── utils.ts
prisma/
├── schema.prisma                   # User, Session, Account (better-auth) + ShortenedURL con userId
└── migrations/
tests/
├── unit/                           # Zod (login/register), acciones con mocks
└── integration/                    # Dashboard protegido, listado por usuario
```

**Structure Decision**: Proyecto único Next.js (App Router). Better-auth expone rutas bajo `/api/auth/[...all]`. Pantallas login y register son páginas estáticas con formularios shadcn + Zod; la cabecera (componente reutilizable) muestra estado de sesión y enlaces/avatar según sesión. Dashboard es una página que obtiene las URLs del usuario con Prisma (`where: { userId: session.user.id }`) y las muestra en lista simple. No se usa react-hook-form; validación solo con Zod.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation                | Why Needed | Simpler Alternative Rejected Because |
| ------------------------ | ---------- | ------------------------------------ |
| _(ninguna en este plan)_ |            |                                      |
