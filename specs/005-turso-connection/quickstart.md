# Quickstart: Conexión a Turso (005)

**Feature**: [spec.md](./spec.md) | **Plan**: [plan.md](./plan.md)

Pasos para dejar la aplicación usando Turso como almacén de datos (o seguir usando SQLite local si no configuras Turso).

---

## 1. Prerrequisitos

- [Turso CLI](https://docs.turso.tech/cli/installation) instalado.
- Cuenta Turso: [signup / login](https://docs.turso.tech/cli/authentication#signup).
- Prisma 5.4.2+ (el proyecto usa 7.x).

---

## 2. Instalar dependencias

```bash
npm install @libsql/client @prisma/adapter-libsql
```

(O `pnpm add @libsql/client @prisma/adapter-libsql` / `yarn add ...` según el gestor del proyecto.)

---

## 3. Credenciales de Turso

- Crear base de datos (si aún no existe):

  ```bash
  turso db create <nombre-db>
  ```

- Obtener URL y token:

  ```bash
  turso db show <nombre-db> --url
  turso db tokens create <nombre-db>
  ```

Documentación: [Retrieve database credentials](https://docs.turso.tech/sdk/ts/orm/prisma.md#retrieve-database-credentials).

---

## 4. Schema Prisma

En `prisma/schema.prisma`:

- Añadir la preview feature en el `generator`:

  ```prisma
  generator client {
    provider        = "prisma-client-js"
    previewFeatures = ["driverAdapters"]
  }
  ```

- Mantener `datasource` con `provider = "sqlite"` y una `url` válida para migraciones locales (por ejemplo `url = "file:./dev.db"` o la que use tu `prisma.config.ts`).

Luego:

```bash
npx prisma generate
```

---

## 5. Cliente Prisma (runtime)

En `src/lib/db.ts`: usar adaptador **condicional**:

- Si existen `TURSO_DATABASE_URL` y `TURSO_AUTH_TOKEN`: crear `PrismaLibSQL` con esas variables y usarlo como adaptador del `PrismaClient`.
- Si no: usar el adaptador actual (better-sqlite3) con `DATABASE_URL` o archivo local.

Así, sin configurar Turso, el proyecto sigue funcionando con SQLite local.

---

## 6. Variables de entorno

Añadir a `.env` (o al entorno de despliegue):

```env
TURSO_DATABASE_URL=https://<nombre-db>-<org>.turso.io
TURSO_AUTH_TOKEN=<token-generado>
```

Actualizar `.env.example` con estas variables (con valores de ejemplo o comentario de que son opcionales para Turso).

---

## 7. Aplicar el esquema a Turso

Prisma Migrate no se ejecuta directamente contra Turso. Flujo recomendado:

1. Generar migraciones contra SQLite local:

   ```bash
   npx prisma migrate dev --name init
   # (o el nombre que corresponda si ya tienes migraciones)
   ```

2. Aplicar cada migración a la base Turso:

   ```bash
   turso db shell <nombre-db> < ./prisma/migrations/<timestamp>_<name>/migration.sql
   ```

   Sustituir `<timestamp>_<name>` por el directorio real (por ejemplo `20230922132717_init`).

Si ya tienes migraciones aplicadas en local, ejecuta el `turso db shell` para cada archivo `migration.sql` en el orden de los directorios.

### Script automático

Puedes aplicar todas las migraciones en orden con:

```bash
pnpm db:turso-apply [nombre-db]
```

O directamente:

```bash
./scripts/turso-apply-migrations.sh [nombre-db]
```

- **Nombre de la base**: puedes pasarlo como primer argumento (`nombre-db`) o usar variables de entorno:
  - **`TURSO_DB_NAME`**: nombre de la base Turso (recomendado).
  - **`TURSO_DATABASE_URL`**: si no hay argumento ni `TURSO_DB_NAME`, el script intenta extraer el nombre del host (formato `https://<nombre>-<org>.turso.io`; se usa la parte antes del último guion). Si tu URL no sigue ese formato, usa argumento o `TURSO_DB_NAME`.

Ejemplo con env:

```bash
export TURSO_DB_NAME=mi-base
pnpm db:turso-apply
```

---

## 8. Comprobar

- Con `TURSO_DATABASE_URL` y `TURSO_AUTH_TOKEN` definidos, arrancar la app (`npm run dev`) y usar los flujos normales (registro, login, crear enlace, redirección).
- Sin esas variables, la app debe seguir arrancando y usando SQLite local.

---

## Referencias

- [Prisma + Turso](https://docs.turso.tech/sdk/ts/orm/prisma.md)
- [Turso docs index](https://docs.turso.tech/llms.txt)
- [research.md](./research.md) de esta feature
