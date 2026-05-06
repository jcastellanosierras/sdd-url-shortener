---
name: better-auth
description: Usa better-auth para autenticacion y autorizacion en el proyecto. Consultar documentacion actualizada via Context7 cuando se implemente o modifique login, registro, sesiones, OAuth, 2FA, permisos o cualquier flujo de autenticacion.
---

# Better Auth

Este proyecto usa **better-auth** para autenticacion y autorizacion. No uses otras librerias (NextAuth, Auth.js, etc.) para auth.

## Cuando aplicar

- Implementar o modificar login, registro, cierre de sesion
- Configurar proveedores OAuth (Google, GitHub, etc.)
- Sesiones, cookies, JWTs
- 2FA, magic links, passkeys
- Roles, permisos, autorizacion
- Cualquier duda sobre la API o patrones de better-auth

## Consultar documentacion (Context7)

Para obtener documentacion y ejemplos actualizados de better-auth:

1. Obtener library ID con `resolve-library-id`:
   - `libraryName`: `"better-auth"`
   - `query`: descripcion del objetivo (ej. "setup Next.js authentication")

2. Consultar docs con `query-docs`:
   - `libraryId`: `"/better-auth/better-auth"` (o el devuelto)
   - `query`: pregunta concreta (ej. "How to configure email password sign in")

No hagas mas de 3 llamadas a Context7 por pregunta; si no encuentras lo necesario, usa la mejor informacion disponible.

## Referencia rapida

- Library ID por defecto en Context7: `/better-auth/better-auth`
- Better Auth es agnostico de framework (TypeScript), con soporte para Next.js y React.
