# Quickstart: 001-init-nextjs-repo

**Feature**: Inicialización del repositorio con Next.js  
**Branch**: `001-init-nextjs-repo`

## Requisitos

- **Node.js**: 20.9 o superior (recomendado LTS).
- **Gestor de paquetes**: pnpm.

## Instalación

```bash
# Clonar el repositorio (o estar en el directorio del proyecto)
git clone <repo-url>
cd url-shortener

# Instalar dependencias
pnpm install
```

## Comandos principales

| Comando                     | Descripción                                     |
| --------------------------- | ----------------------------------------------- |
| `pnpm dev`                  | Arranca el servidor de desarrollo (Next.js)     |
| `pnpm build`                | Build de producción                             |
| `pnpm start`                | Sirve la aplicación en modo producción          |
| `pnpm test`                 | Ejecuta tests (Vitest)                          |
| `pnpm test:watch`           | Tests en modo watch (si está configurado)       |
| `pnpm lint`                 | Ejecuta ESLint                                  |
| `pnpm format`               | Formatea código con Prettier (si está definido) |
| `pnpm exec prisma generate` | Genera el cliente Prisma (tras cambiar schema)  |

## Verificación rápida

1. **Desarrollo**: `pnpm dev` → abrir http://localhost:3000 y comprobar que la página base carga.
2. **Tests**: `pnpm test` → todos los tests pasan (incluido al menos un smoke test o test de ejemplo).
3. **Lint**: `pnpm lint` → sin errores.
4. **Build**: `pnpm build` → build termina sin errores.

## Estructura relevante

- `src/app/`: Rutas (App Router). Añadir una ruta nueva no requiere cambiar configuración: por ejemplo `src/app/demo/page.tsx` expone `/demo`.
- `src/components/`: Componentes React; `src/components/ui/`: shadcn/ui.
- `src/lib/`: Utilidades y cliente Prisma (`db.ts`).
- `prisma/schema.prisma`: Esquema de datos (Prisma).
- `tests/`: Tests unitarios (`tests/unit/`) e integración (`tests/integration/`).

## Documentación adicional

- README en la raíz del repositorio: instalación y arranque.
- [spec.md](./spec.md): requisitos y criterios de éxito de la feature.
- [plan.md](./plan.md): contexto técnico y estructura del proyecto.
