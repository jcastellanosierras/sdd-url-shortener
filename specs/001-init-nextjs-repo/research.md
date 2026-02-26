# Research: Inicialización del repositorio con Next.js

**Feature**: 001-init-nextjs-repo  
**Date**: 2025-02-10

## 1. Versión de Next.js y creación del proyecto

- **Decision**: Usar la última versión estable de Next.js mediante `create-next-app@latest` con flags para TypeScript, ESLint, Tailwind, App Router y estructura estándar.
- **Rationale**: La spec exige “última versión estable”; `create-next-app@latest` garantiza la versión actual en el momento de la inicialización. TypeScript, ESLint y App Router son requisitos del usuario.
- **Alternatives considered**: Fijar una versión concreta (p. ej. 15.x) fue descartado para cumplir FR-002 y SC-003; usar Pages Router fue descartado porque el estándar actual es App Router.

## 2. Linter y formateador

- **Decision**: ESLint (con config recomendada por Next.js) y Prettier; integración ESLint+Prettier sin conflicto (Prettier como formateador, ESLint para reglas de calidad).
- **Rationale**: El usuario pidió “prettier y eslint, o cualquier linter y formateador”; la combinación ESLint + Prettier es la más usada en el ecosistema TypeScript/React.
- **Alternatives considered**: Solo ESLint con reglas de formato (eslint-config-prettier) es válido; se mantiene Prettier explícito para consistencia y preferencias de formato del equipo.

## 3. Tests

- **Decision**: Vitest como runner de tests; React Testing Library para componentes React. Scripts `test` y `test:watch` en `package.json`.
- **Rationale**: Vitest es rápido, compatible con Vite/ESM y se integra bien con Next.js; RTL es el estándar para testing de componentes React. La constitución exige tests desde el inicio.
- **Alternatives considered**: Jest sigue siendo válido con Next.js; se elige Vitest por velocidad y menor configuración en proyectos modernos. Playwright/Cypress para E2E se dejan para features posteriores si se necesitan.

## 4. UI: shadcn/ui

- **Decision**: Instalar y configurar shadcn/ui sobre el proyecto Next.js con Tailwind (incluido por defecto con create-next-app). Inicializar con tema por defecto y al menos un componente de ejemplo (p. ej. Button) para validar el setup.
- **Rationale**: El usuario pidió “shadcn/ui para tener estilos rápidos de forma sencilla”; shadcn se instala como componentes copiados al repo (no como dependencia npm), lo que da control y alineación con la constitución (Code Quality, UX consistency).
- **Alternatives considered**: Otras librerías (MUI, Chakra) añaden más dependencias y estilos menos “neutrales”; shadcn (Radix + Tailwind) encaja con Tailwind ya elegido por create-next-app.

## 5. ORM y base de datos

- **Decision**: Instalar Prisma como ORM; crear `prisma/schema.prisma` y cliente en `src/lib/db.ts`. No fijar un proveedor de DB concreto (PostgreSQL, SQLite, etc.) en esta feature: se puede dejar un schema mínimo o un modelo de ejemplo y documentar que la DB se elegirá en una feature posterior.
- **Rationale**: El usuario pidió “Prisma también como orm” para conectarse a bases de datos; tener Prisma instalado y configurado cumple el requisito; la elección de DB (y migraciones reales) puede hacerse cuando se implemente el dominio (p. ej. URLs acortadas).
- **Alternatives considered**: Drizzle u otros ORMs fueron descartados por requisito explícito de Prisma. Incluir SQLite o PostgreSQL desde ya es opcional; se puede usar un schema vacío o con un modelo placeholder para que `prisma generate` funcione.

## 6. Gestor de paquetes

- **Decision**: Usar pnpm como gestor de paquetes; documentar pnpm en README y quickstart; lockfile pnpm-lock.yaml en el repo.
- **Rationale**: pnpm es rápido, ahorra disco con store global y es compatible con el ecosistema Node; se documenta como único gestor recomendado para consistencia.
- **Alternatives considered**: npm (por defecto en create-next-app) y yarn son válidos; se elige pnpm por decisión del equipo. Soportar varios gestores con múltiples lockfiles se evita.

## Resumen de decisiones

| Tema            | Decisión                                     |
| --------------- | -------------------------------------------- |
| Next.js         | Última estable vía create-next-app@latest    |
| TypeScript      | Sí (flag --ts o opción en wizard)            |
| Lint/Format     | ESLint + Prettier                            |
| Tests           | Vitest + React Testing Library               |
| UI              | shadcn/ui + Tailwind                         |
| ORM             | Prisma (schema inicial mínimo)               |
| Estructura      | App Router, src/app, src/components, prisma/ |
| Gestor paquetes | pnpm (pnpm-lock.yaml)                        |
