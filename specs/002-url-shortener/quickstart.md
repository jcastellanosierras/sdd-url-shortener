# Quickstart: 002-url-shortener

**Feature**: Acortador de URLs  
**Branch**: `002-url-shortener`

## Requisitos

- **Node.js**: 20.9 o superior (recomendado LTS).
- **Gestor de paquetes**: pnpm.
- **Base de datos**: SQLite (archivo local; Prisma gestiona el archivo).

## Instalación y preparación

```bash
# Clonar / estar en el directorio del proyecto
cd url-shortener

# Instalar dependencias (incluye Zod si se añadió en esta feature)
pnpm install

# Configurar Prisma: schema con provider sqlite y modelo ShortenedURL
# Crear migración y aplicar
pnpm exec prisma migrate dev --name add_shortened_url

# Opcional: generar cliente Prisma tras cambios en schema
pnpm exec prisma generate
```

## Comandos principales

| Comando                        | Descripción                                    |
| ------------------------------ | ---------------------------------------------- |
| `pnpm dev`                     | Servidor de desarrollo (http://localhost:3000) |
| `pnpm build`                   | Build de producción                            |
| `pnpm start`                   | Servir build en producción                     |
| `pnpm test`                    | Ejecutar tests (Vitest)                        |
| `pnpm test:watch`              | Tests en modo watch                            |
| `pnpm lint`                    | ESLint                                         |
| `pnpm format`                  | Prettier                                       |
| `pnpm exec prisma migrate dev` | Crear/aplicar migraciones (desarrollo)         |

## Verificación rápida (después de implementar)

1. **Desarrollo**: `pnpm dev` → abrir http://localhost:3000. La página principal muestra el formulario del acortador.
2. **Crear URL**: Introducir una URL válida (p. ej. `https://google.com`) y enviar. Debe mostrarse una URL acortada (p. ej. `http://localhost:3000/abc12xy`).
3. **Redirección**: Abrir en el navegador la URL acortada → debe redirigir a la URL original.
4. **404**: Abrir `http://localhost:3000/slug-que-no-existe` → debe mostrarse mensaje de “no encontrado” o 404, sin redirigir a sitio externo.
5. **Validación**: Enviar URL inválida o vacía → mensaje de error en pantalla, sin crear enlace.
6. **Tests**: `pnpm test` → tests unitarios e integración pasan.
7. **Build**: `pnpm build` → sin errores.

## Estructura relevante para esta feature

- **Página principal**: `src/app/page.tsx` — formulario con shadcn, validación Zod, Server Action que crea ShortenedURL y muestra la URL acortada.
- **Redirección**: `src/app/[slug]/route.ts` (o `page.tsx`) — GET que busca por slug en Prisma y responde con redirect (302/307) o 404.
- **Modelo**: `prisma/schema.prisma` — datasource SQLite; modelo `ShortenedURL` (id, slug, originalUrl, createdAt, updatedAt).
- **Validación**: Zod para URL (p. ej. en `src/lib/validations.ts` o junto a la acción).
- **Tests**: `tests/unit/` (validación, acción); `tests/integration/` (redirect y 404).

## Documentación adicional

- [spec.md](./spec.md): requisitos y user stories.
- [plan.md](./plan.md): contexto técnico y estructura.
- [data-model.md](./data-model.md): entidad ShortenedURL.
- [contracts/README.md](./contracts/README.md): contrato Server Action y GET [slug].
