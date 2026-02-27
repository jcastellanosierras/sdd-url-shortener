# Research: Conexión a Turso (005)

**Feature**: [spec.md](./spec.md) | **Plan**: [plan.md](./plan.md)

## Fuentes

- Documentación proporcionada por el usuario: [Prisma + Turso](https://docs.turso.tech/sdk/ts/orm/prisma.md)
- Índice Turso: https://docs.turso.tech/llms.txt
- Prisma actual: schema SQLite, adaptador `@prisma/adapter-better-sqlite3` en `src/lib/db.ts`

---

## 1. Adaptador de Prisma para Turso

**Decision**: Usar `@prisma/adapter-libsql` con `@libsql/client` para conectar Prisma a Turso.

**Rationale**: Es el flujo oficial documentado por Turso para Prisma. El adaptador libSQL permite usar el mismo PrismaClient contra Turso usando `TURSO_DATABASE_URL` y `TURSO_AUTH_TOKEN`. Requiere la preview feature `driverAdapters` en el generador de Prisma.

**Alternatives considered**:

- Mantener solo better-sqlite3: no cumple el objetivo de conectar a Turso.
- Usar el cliente libSQL directamente sin Prisma: implicaría reescribir toda la capa de datos; se rechaza.

---

## 2. Compatibilidad desarrollo local sin Turso

**Decision**: Soporte dual en `src/lib/db.ts`: si están definidos `TURSO_DATABASE_URL` y `TURSO_AUTH_TOKEN`, usar `PrismaLibSQL`; en caso contrario, usar el adaptador actual `PrismaBetterSqlite3` contra `DATABASE_URL` o archivo local.

**Rationale**: Permite desarrollar y ejecutar tests sin cuenta Turso ni red; en producción o staging se configuran las variables de Turso. Cumple FR-006 (configuración externalizable) y no obliga a tener Turso en todos los entornos.

**Alternatives considered**:

- Solo Turso en todos los entornos: obligaría a crear una base Turso de desarrollo para cada desarrollador; más fricción.
- Solo SQLite local: no cumpliría la feature de “conectarnos a Turso”.

---

## 3. Schema Prisma y migraciones

**Decision**:

- En `prisma/schema.prisma`: mantener `provider = "sqlite"`; añadir `previewFeatures = ["driverAdapters"]` al `generator`; mantener (o añadir) `url` para que `prisma migrate dev` siga usando SQLite local (p. ej. `url = "file:./dev.db"` o vía `prisma.config.ts`).
- Migraciones: generar con `prisma migrate dev` contra la base SQLite local; aplicar a Turso con `turso db shell <nombre-db> < ./prisma/migrations/<timestamp>_<name>/migration.sql`.

**Rationale**: Prisma Migrate e Introspection no están soportados directamente contra Turso (documentación oficial). El flujo recomendado es generar migraciones contra SQLite y aplicar el SQL resultante a Turso vía CLI. El schema sigue siendo SQLite para máxima compatibilidad con ambos backends.

**Alternatives considered**:

- Usar Prisma Migrate contra Turso: no soportado por Prisma/Turso.
- Gestionar esquema solo en Turso a mano: frágil y sin historial versionado; se rechaza.

---

## 4. Variables de entorno

**Decision**: Introducir `TURSO_DATABASE_URL` y `TURSO_AUTH_TOKEN` (opcionales). Si ambas están presentes, se usa Turso; si no, se usa SQLite (actual). Documentar en `.env.example` y en `quickstart.md`.

**Rationale**: Estándar en la documentación de Turso; permite rotar credenciales sin tocar código; alineado con FR-006.

**Alternatives considered**:

- Una sola variable que contenga URL y token: menos estándar y más difícil de rotar solo el token.
- Credenciales en código: rechazado por seguridad.

---

## 5. Dependencias a añadir y quitar

**Decision**:

- Añadir: `@libsql/client`, `@prisma/adapter-libsql`.
- Mantener (para desarrollo local): `@prisma/adapter-better-sqlite3`, `better-sqlite3`; se usan cuando no hay config de Turso.

**Rationale**: El adaptador libSQL es necesario para Turso; better-sqlite3 se mantiene para el camino local sin Turso.

---

## Resumen para implementación

| Tema            | Decisión                                                              |
| --------------- | --------------------------------------------------------------------- |
| Adaptador Turso | `@prisma/adapter-libsql` + `@libsql/client`                           |
| Preview Prisma  | `previewFeatures = ["driverAdapters"]`                                |
| Config runtime  | `TURSO_DATABASE_URL` + `TURSO_AUTH_TOKEN` → Turso; si faltan → SQLite |
| Migraciones     | `prisma migrate dev` (SQLite) → `turso db shell <db> < migration.sql` |
| Schema          | `provider = "sqlite"`, `url` para migrate (local)                     |
