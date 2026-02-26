# Data Model: Analítica de enlaces (004-link-analytics)

**Feature**: 004-link-analytics  
**Date**: 2026-02-26

## Entidad: Visit (visita)

Registro de un acceso a una URL acortada que resultó en redirección. Cada fila es una visita; la agregación (total, desgloses) se obtiene por consultas (count, groupBy) sobre esta tabla.

### Atributos

| Campo          | Tipo     | Obligatorio | Descripción                                                                    |
| -------------- | -------- | ----------- | ------------------------------------------------------------------------------ |
| id             | String   | Sí          | Identificador único (p. ej. CUID).                                             |
| shortenedUrlId | String   | Sí          | FK a `ShortenedURL.id`.                                                        |
| createdAt      | DateTime | Sí          | Fecha y hora de la visita (server).                                            |
| country        | String?  | No          | Código país (ej. ISO 2 letras desde cabeceras).                                |
| region         | String?  | No          | Región (ej. ISO 3166-2 desde cabeceras).                                       |
| device         | String   | Sí          | `mobile` \| `desktop` \| `unknown`.                                            |
| os             | String   | Sí          | `Windows` \| `macOS` \| `Linux` \| `iOS` \| `Android` \| `Other` \| `unknown`. |
| referrer       | String?  | No          | Valor del header Referer (origen del tráfico).                                 |
| utm_source     | String?  | No          | Parámetro UTM source.                                                          |
| utm_medium     | String?  | No          | Parámetro UTM medium.                                                          |
| utm_campaign   | String?  | No          | Parámetro UTM campaign.                                                        |
| utm_term       | String?  | No          | Parámetro UTM term.                                                            |
| utm_content    | String?  | No          | Parámetro UTM content.                                                         |

### Relación

- **ShortenedURL 1 — N Visit**: Una URL acortada tiene muchas visitas; cada visita pertenece a una URL acortada.
- En Prisma: `ShortenedURL` tiene `visits Visit[]`; `Visit` tiene `shortenedUrl ShortenedURL` con `shortenedUrlId` y `onDelete: Cascade` (si se borra el enlace, se borran sus visitas).

### Contador total de visitas

El total de visitas por enlace **no** se almacena como columna en `ShortenedURL`; se deriva con `count(visits)` (o agregación equivalente) cuando se consulten las analíticas. Así se evita desnormalización y posibles desincronizaciones. Si en el futuro se prefiere un contador denormalizado por rendimiento, se documentará en Assumptions del plan/spec.

---

## Reglas de validación y persistencia

- **Prisma**: Modelo `Visit` en `schema.prisma` con los campos anteriores; relación con `ShortenedURL` y `onDelete: Cascade`.
- **SQLite**: Tipos compatibles (String, DateTime; strings opcionales como nullable). Longitud de strings: límites razonables (p. ej. 500 para referrer, 200 para UTM y country/region) para evitar abusos; si se superan, truncar o rechazar en el endpoint que crea la visita.
- **Valores por defecto**: `device` y `os` por defecto `unknown` si no se pueden inferir; `createdAt` por defecto `now()`.
- **Índices**: Índice en `shortenedUrlId` (y opcionalmente en `createdAt`) para consultas por enlace y ordenación temporal.

---

## Assumptions

- No se añade columna `visitCount` en `ShortenedURL`; el total se obtiene por agregación sobre `Visit`.
- Si en el futuro se introduce un contador denormalizado por rendimiento, se documentará aquí y en la spec.
