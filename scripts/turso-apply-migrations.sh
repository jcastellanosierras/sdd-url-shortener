#!/usr/bin/env sh
# Aplica las migraciones de prisma/migrations/ a una base Turso, en orden por nombre de carpeta.
# Uso: ./scripts/turso-apply-migrations.sh [nombre-db]
#   - nombre-db: nombre de la base Turso (opcional si se usa env).
# Variables de entorno (opcionales):
#   - TURSO_DB_NAME: nombre de la base Turso.
#   - TURSO_DATABASE_URL: si no hay argumento ni TURSO_DB_NAME, se extrae el nombre del host
#     (se asume formato https://<nombre>-<org>.turso.io o libsql://<nombre>-<org>.region.turso.io).
set -e

# Cargar .env desde la raíz del repo para tener TURSO_* disponibles al ejecutar vía pnpm
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
if [ -f "$ROOT/.env" ]; then
  set -a
  # shellcheck source=/dev/null
  . "$ROOT/.env"
  set +a
fi

MIGRATIONS_DIR="prisma/migrations"
MIGRATIONS_TABLE="_prisma_migrations_opencode"

# Resolver nombre de la base
if [ -n "$1" ]; then
  DB_NAME="$1"
elif [ -n "$TURSO_DB_NAME" ]; then
  DB_NAME="$TURSO_DB_NAME"
elif [ -n "$TURSO_DATABASE_URL" ]; then
  host="${TURSO_DATABASE_URL#*://}"
  host="${host%%/*}"
  host="${host%%.turso.io}"
  # Nombre = primer segmento (ej. develop-josecastellano.aws-eu-west-1 -> develop)
  DB_NAME="${host%%-*}"
  if [ -z "$DB_NAME" ]; then
    echo "Error: no se pudo extraer el nombre de la base desde TURSO_DATABASE_URL. Usa TURSO_DB_NAME o pasa el nombre como argumento." >&2
    exit 1
  fi
else
  echo "Error: indica el nombre de la base Turso como primer argumento o define TURSO_DB_NAME o TURSO_DATABASE_URL." >&2
  echo "Uso: $0 [nombre-db]" >&2
  exit 1
fi

if [ ! -d "$MIGRATIONS_DIR" ]; then
  echo "Error: no existe el directorio $MIGRATIONS_DIR." >&2
  exit 1
fi

# Crear tabla de control de migraciones si no existe
turso db shell "$DB_NAME" "CREATE TABLE IF NOT EXISTS \"$MIGRATIONS_TABLE\" (name TEXT PRIMARY KEY, applied_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP);" >/dev/null

is_known_safe_error() {
  msg="$1"
  case "$msg" in
    *"already exists"*|*"duplicate column name"*)
      return 0
      ;;
    *)
      return 1
      ;;
  esac
}

is_migration_applied() {
  migration_name="$1"
  result="$(turso db shell "$DB_NAME" "SELECT name FROM \"$MIGRATIONS_TABLE\" WHERE name = '$migration_name' LIMIT 1;" 2>/dev/null || true)"
  [ -n "$result" ]
}

# Aplicar cada migración en orden (por nombre de carpeta)
for dir in $(find "$MIGRATIONS_DIR" -maxdepth 1 -type d -name '[0-9]*' | sort); do
  sql="$dir/migration.sql"
  migration_name="$(basename "$dir")"

  if is_migration_applied "$migration_name"; then
    echo "Saltando (ya aplicada): $dir"
    continue
  fi

  if [ -f "$sql" ]; then
    echo "Aplicando: $dir"
    if turso db shell "$DB_NAME" < "$sql"; then
      turso db shell "$DB_NAME" "INSERT OR IGNORE INTO \"$MIGRATIONS_TABLE\" (name) VALUES ('$migration_name');" >/dev/null
      continue
    fi

    output_file="$(mktemp)"
    if turso db shell "$DB_NAME" < "$sql" >"$output_file" 2>&1; then
      rm -f "$output_file"
      turso db shell "$DB_NAME" "INSERT OR IGNORE INTO \"$MIGRATIONS_TABLE\" (name) VALUES ('$migration_name');" >/dev/null
      continue
    fi

    output="$(cat "$output_file")"
    rm -f "$output_file"
    if is_known_safe_error "$output"; then
      echo "Saltando (ya existente en DB): $dir"
      turso db shell "$DB_NAME" "INSERT OR IGNORE INTO \"$MIGRATIONS_TABLE\" (name) VALUES ('$migration_name');" >/dev/null
    else
      echo "$output" >&2
      echo "Error: fallo aplicando $dir" >&2
      exit 1
    fi
  fi
done

echo "Migraciones aplicadas a la base \"$DB_NAME\"."
