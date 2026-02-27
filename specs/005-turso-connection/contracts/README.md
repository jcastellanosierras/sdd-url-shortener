# Contracts: 005-turso-connection

**Feature**: [spec.md](../spec.md) | **Plan**: [plan.md](../plan.md)

## Alcance

Esta feature es **infraestructura** (cambio de almacén de datos). No se añaden ni modifican endpoints HTTP, APIs públicas ni contratos de integración.

- Los endpoints y rutas existentes del acortador y de better-auth siguen igual.
- El contrato hacia el cliente (request/response) no cambia.
- La única “interfaz” nueva es la **configuración** vía variables de entorno (`TURSO_DATABASE_URL`, `TURSO_AUTH_TOKEN`), documentada en [quickstart.md](../quickstart.md) y `.env.example`.

## Verificación

- Tests de integración/contrato existentes deben seguir pasando con SQLite local.
- Opcional: ejecutar los mismos flujos contra Turso (con env configurado) para validar comportamiento equivalente.
