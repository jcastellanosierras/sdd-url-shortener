# Data Model: Autenticación y panel de URLs por usuario (003-user-auth)

**Feature**: Autenticación y panel de URLs por usuario  
**Date**: 2026-02-26

## Alcance

Entidades de **better-auth** (User, Session, Account) generadas por el CLI de better-auth e integradas en el mismo `schema.prisma`; extensión del modelo existente **ShortenedURL** con relación al usuario.

## Entidades de autenticación (better-auth)

Los nombres y campos exactos los define el CLI de better-auth al generar el esquema Prisma. A nivel conceptual:

### User

| Atributo (conceptual) | Descripción                                                         |
| --------------------- | ------------------------------------------------------------------- |
| id                    | Identificador único del usuario (PK).                               |
| name                  | Nombre (registro).                                                  |
| email                 | Correo electrónico, único.                                          |
| emailVerified         | Booleano o fecha (better-auth lo gestiona; no usamos verificación). |
| image                 | URL de imagen (opcional; no obligatorio en esta feature).           |
| createdAt / updatedAt | Timestamps si el esquema generado los incluye.                      |

### Session

| Atributo (conceptual) | Descripción                                         |
| --------------------- | --------------------------------------------------- |
| id                    | Identificador de sesión (token/session id).         |
| userId                | FK al User.                                         |
| expiresAt             | Fecha de expiración.                                |
| token                 | Token de sesión (único).                            |
| Otros                 | ipAddress, userAgent, etc., según esquema generado. |

### Account

Almacena credenciales (email/password) y datos de proveedores OAuth. Con solo email/contraseña, better-auth usa esta tabla para el hash de la contraseña asociado al usuario. Campos típicos: userId, tipo de cuenta, datos del proveedor (o password hash). El esquema exacto lo proporciona el CLI.

### Relaciones

- User 1 — N Session
- User 1 — N Account
- ShortenedURL N — 1 User (añadida en esta feature)

## Entidad: ShortenedURL (extendida)

Se mantienen los campos actuales y se añade la relación con el usuario:

| Atributo    | Tipo       | Obligatorio       | Descripción                                                                       |
| ----------- | ---------- | ----------------- | --------------------------------------------------------------------------------- |
| id          | String     | Sí (PK)           | Sin cambios.                                                                      |
| slug        | String     | Sí, único         | Sin cambios.                                                                      |
| originalUrl | String     | Sí                | Sin cambios.                                                                      |
| **userId**  | **String** | **No (nullable)** | FK al User. Si null, la URL se creó sin sesión (comportamiento legacy o anónimo). |
| createdAt   | DateTime   | Sí                | Sin cambios.                                                                      |
| updatedAt   | DateTime   | Sí                | Sin cambios.                                                                      |

### Reglas de validación (aplicación)

- **userId**: al crear una URL acortada, si hay sesión se asigna el `id` del usuario actual; si no hay sesión puede quedar null (o rechazar creación según criterio de producto; la spec indica que las nuevas URLs queden asociadas al usuario autenticado — en implementación se puede exigir sesión para crear).
- **slug / originalUrl**: mismas reglas que en 002-url-shortener.

### Relaciones

- **ShortenedURL** N — 1 **User** (opcional): cada URL acortada puede tener un propietario. En el dashboard se listan solo las que tienen `userId = session.user.id`.

## Persistencia (Prisma)

- **Provider**: SQLite (existente).
- **Ubicación**: `prisma/schema.prisma`.
- **Origen de modelos auth**: salida del CLI de better-auth (`npx @better-auth/cli@latest generate`); fusionar con el schema existente.
- **Cambio manual**: añadir en `ShortenedURL` el campo `userId` (opcional) y la relación con `User`.
- **Migraciones**: una migración Prisma que añada las tablas de auth (user, session, account) y la columna `userId` en la tabla de URLs acortadas.

## Evolución

- URLs creadas antes de esta feature: `userId` null; en el dashboard no se muestran o se tratan como “sin propietario” según criterio (spec: “las nuevas URLs queden asociadas al usuario autenticado”).
- Futuro: eliminación en cascada de ShortenedURL al borrar User si se desea; por ahora no es requisito.
