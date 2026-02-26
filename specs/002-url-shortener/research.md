# Research: Acortador de URLs (002-url-shortener)

**Feature**: Acortador de URLs  
**Date**: 2025-02-10

## Decisiones tomadas (input del usuario)

No hubo NEEDS CLARIFICATION; el usuario definió explícitamente el stack y el diseño.

### Framework y UI

- **Decision**: Next.js (App Router) + React como framework principal. Formulario en la página principal usando componentes shadcn/ui. Eliminar páginas/rutas que sobren (p. ej. contenido placeholder de la home y enlace a /demo) y dejar el formulario como contenido principal.
- **Rationale**: El proyecto ya está inicializado con Next.js y shadcn; mantener coherencia y aprovechar lo existente.
- **Alternatives considered**: Otra página dedicada solo al formulario — rechazada: el usuario pidió modificar la página principal y eliminar lo que sobre.

### Validación del formulario

- **Decision**: Validación de URL con Zod. Formulario nativo (HTML `<form>`), sin react-hook-form ni otras librerías de formularios.
- **Rationale**: Zod es sencilla y estándar para validación; para un único campo no justifica una librería de formularios.
- **Alternatives considered**: react-hook-form — rechazada explícitamente por el usuario.

### Base de datos y persistencia

- **Decision**: Prisma con SQLite. Una sola entidad: ShortenedURL (identificador/slug, URL original, timestamps). Producción futura: posibilidad de migrar a Turso (compatible con SQLite).
- **Rationale**: SQLite evita infraestructura externa en desarrollo; Prisma ya está en el proyecto; Turso permite escalar manteniendo compatibilidad.
- **Alternatives considered**: PostgreSQL ya referenciado en schema actual — se cambia a SQLite para esta feature según petición del usuario.

### Ruta de redirección

- **Decision**: Nueva ruta dinámica (p. ej. `/[slug]` o `/[id]`) que responde a GET: busca el identificador en base de datos; si existe, redirige a la URL guardada; si no existe, responde con error (404 / “no encontrado”).
- **Rationale**: Un único controlador GET por slug cubre la User Story 2; alineado con spec (visitar URL acortada → redirección).

### Creación de la URL acortada

- **Decision**: El formulario de la página principal envía la URL; el servidor genera un identificador único, persiste ShortenedURL en Prisma y devuelve/muestra la URL acortada al usuario. Implementación mediante Server Action de Next.js (sin API REST pública obligatoria para el formulario).
- **Rationale**: Server Actions encajan con formulario nativo y evitan exponer un endpoint POST adicional si no se requiere API pública.

## Resumen

- **Stack**: Next.js 16, React 19, TypeScript, Prisma (SQLite), shadcn/ui, Zod.
- **Dependencia nueva**: Zod (añadir al proyecto).
- **Cambio en Prisma**: provider de `postgresql` a `sqlite` y definir modelo ShortenedURL; `url` de datasource para SQLite (p. ej. `file:./dev.db`).
- **Estructura**: Página principal = formulario (shadcn + form nativo + Zod); ruta dinámica GET para redirección; una entidad ShortenedURL.
