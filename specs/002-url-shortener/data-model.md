# Data Model: Acortador de URLs (002-url-shortener)

**Feature**: Acortador de URLs  
**Date**: 2025-02-10

## Alcance

Una sola entidad de dominio: **ShortenedURL**, que asocia un identificador (slug) único con la URL original y metadatos de auditoría.

## Entidad: ShortenedURL

| Atributo    | Tipo     | Obligatorio | Descripción                                                                                              |
| ----------- | -------- | ----------- | -------------------------------------------------------------------------------------------------------- |
| id          | String   | Sí (PK)     | Identificador único interno (p. ej. cuid, uuid o id auto). No es el slug de la ruta.                     |
| slug        | String   | Sí, único   | Identificador público usado en la URL acortada (p. ej. `fjas952k`). Índice único para búsqueda por ruta. |
| originalUrl | String   | Sí          | URL de destino (http/https). Almacenada tal cual para la redirección.                                    |
| createdAt   | DateTime | Sí          | Fecha y hora de creación.                                                                                |
| updatedAt   | DateTime | Sí          | Fecha y hora de última actualización.                                                                    |

### Reglas de validación (aplicación)

- **slug**: único en la base de datos; generado por la aplicación (no lo introduce el usuario). Formato: cadena corta, URL-safe (p. ej. alfanumérica o con guiones).
- **originalUrl**: validada con Zod antes de persistir (esquema http/https, formato URL válido). No persistir si la validación falla.
- **Timestamps**: gestionados por Prisma (`@updatedAt`) o en creación.

### Relaciones

Ninguna en esta feature. ShortenedURL es una entidad independiente.

## Persistencia (Prisma)

- **Provider**: SQLite.
- **Ubicación del esquema**: `prisma/schema.prisma`.
- **Cliente**: el existente en `src/lib/db.ts` (singleton).
- **Migraciones**: crear migración inicial para el modelo ShortenedURL tras cambiar datasource a SQLite.

## Evolución futura

- Producción: migración a Turso (driver SQLite compatible) si se desea; el modelo ShortenedURL se mantiene.
- Posibles ampliaciones: userId (si se añade autenticación), expiresAt, contador de visitas, etc. No incluidas en este plan.
