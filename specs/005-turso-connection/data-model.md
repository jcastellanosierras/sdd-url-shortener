# Data Model: Conexión a Turso (005)

**Feature**: [spec.md](./spec.md) | **Plan**: [plan.md](./plan.md)

## Alcance

Esta feature **no introduce nuevas entidades ni cambios en el modelo de datos**. Solo cambia el backend de persistencia (de SQLite local a Turso cuando está configurado). El esquema Prisma existente se mantiene.

## Entidades existentes (sin cambios)

Las entidades que ya usa la aplicación y que seguirán sirviéndose desde el mismo esquema Prisma, ahora pudiendo usar Turso como almacén, son:

| Entidad          | Uso en la aplicación                       |
| ---------------- | ------------------------------------------ |
| **User**         | better-auth: usuarios, email, sesiones     |
| **Session**      | better-auth: sesiones de usuario           |
| **Account**      | better-auth: cuentas OAuth / credenciales  |
| **ShortenedURL** | Acortador: slug, originalUrl, dueño        |
| **Visit**        | Analytics: visitas por enlace, UTM, device |

Relaciones y restricciones (claves, índices, `onDelete`) permanecen como en `prisma/schema.prisma` actual. La compatibilidad SQLite/Turso se mantiene porque Turso es compatible con SQLite (libSQL).

## Validación y consistencia

- Las reglas de validación de negocio (slug único, URLs válidas, etc.) siguen en la capa de aplicación; no se modifican.
- La consistencia del esquema se garantiza aplicando las migraciones generadas (contra SQLite) a la base Turso con el flujo descrito en [research.md](./research.md) y [quickstart.md](./quickstart.md).

## Migraciones

- Las migraciones existentes en `prisma/migrations/` siguen siendo válidas.
- Nuevas migraciones: generar con `prisma migrate dev` (contra SQLite local) y aplicar el `.sql` a Turso con `turso db shell <db> < migration.sql`.
