# Research: Autenticación y panel de URLs por usuario (003-user-auth)

**Feature**: Autenticación y panel de URLs por usuario  
**Date**: 2026-02-26

## Decisiones tomadas (input del usuario + documentación)

### Autenticación: better-auth

- **Decision**: Usar **better-auth** para todo el flujo de autenticación (registro, login, sesión, logout). Método único: email y contraseña; **sin verificación de correo**.
- **Rationale**: El usuario lo especificó; el proyecto ya tiene regla/skill para better-auth y documentación vía MCP context7.
- **Alternatives considered**: NextAuth/Auth.js — rechazado; el usuario y las reglas del proyecto exigen better-auth.

### ¿Better-auth crea las tablas/migraciones automáticamente?

- **Decision**: Con **Prisma**, better-auth **no** crea las tablas automáticamente en tiempo de ejecución. El flujo es:
  1. **Generar esquema**: El CLI de better-auth (`npx @better-auth/cli@latest generate` o `npx auth generate`) puede generar el esquema Prisma (modelos User, Session, Account) según la configuración y plugins.
  2. **Integrar en nuestro schema**: Se añaden esos modelos al `prisma/schema.prisma` existente (o se usa el archivo generado y se fusiona).
  3. **Añadir relación con URLs**: En el modelo `ShortenedURL` se añade el campo opcional `userId` (relación con User) para asociar cada URL acortada al usuario que la creó.
  4. **Aplicar migraciones**: Se usan las migraciones de **Prisma** (`prisma migrate dev`), no el comando `auth migrate` de better-auth (que está pensado para el adaptador Kysely integrado).
- **Rationale**: Documentación de better-auth (installation, adapters/prisma, CLI): con Prisma se usa el adaptador `prismaAdapter(prisma, { provider: "sqlite" })`; el CLI puede generar el esquema ORM; la aplicación de cambios se hace con el flujo normal de Prisma.
- **Resumen**: No hay “auto-migración” en runtime; lo que hay es generación de esquema con el CLI y migraciones aplicadas con Prisma. Lo único que añadimos manualmente en nuestro schema es el campo `user_id` en la tabla de URLs acortadas.

### Email y contraseña sin verificación

- **Decision**: Configurar better-auth con `emailAndPassword: { enabled: true }` y **no** activar `requireEmailVerification`. Opcionalmente `autoSignIn: true` tras registro para que el usuario quede logueado al registrarse.
- **Rationale**: Documentación better-auth (email-password): `requireEmailVerification: true` es opt-in; por defecto el login está disponible sin verificación.
- **Alternatives considered**: Activar verificación de correo — rechazado por el usuario (“autenticación más sencilla posible”).

### Dashboard: obtención de URLs del usuario

- **Decision**: En la página del dashboard, usar **Prisma** para obtener las URLs acortadas del usuario: consulta con `where: { userId: session.user.id }` (o el campo que exponga la sesión de better-auth). Ordenar por fecha de creación (desc) si se desea. Sin paginación inicial; listado sencillo.
- **Rationale**: El usuario lo indicó explícitamente (“en el dashboard tendremos que usar prisma para obtener las urls correspondientes del usuario”); mejor-auth gestiona sesión; nosotros solo leemos nuestra entidad ShortenedURL filtrada por usuario.

### Formularios: shadcn/ui + Zod, sin react-hook-form

- **Decision**: Formularios de login y registro con componentes **shadcn/ui** (Input, Label, Button, etc.). Validación solo con **Zod** (ya instalado); **no** usar react-hook-form ni otras librerías de formularios. Validaciones **básicas**: campos requeridos, formato email, longitud mínima de contraseña, coincidencia de contraseña y repetición en registro.
- **Rationale**: El usuario lo especificó (“shadcn/ui sin necesidad de complicarnos con react-hook-form”; “validar es zod”; “validaciones básicas”).
- **Alternatives considered**: react-hook-form + Zod — rechazado por el usuario.

### Resumen técnico

| Tema           | Decisión                                                                                 |
| -------------- | ---------------------------------------------------------------------------------------- |
| Auth library   | better-auth                                                                              |
| Auth method    | Email + contraseña, sin verificación                                                     |
| Tablas de auth | Generadas por CLI de better-auth; integradas en Prisma; migraciones con `prisma migrate` |
| Cambio en URLs | Añadir `userId` (FK a User) en ShortenedURL                                              |
| Dashboard      | Prisma: listar ShortenedURL donde `userId = session.user.id`                             |
| Formularios    | shadcn/ui + Zod; validaciones básicas; sin react-hook-form                               |
