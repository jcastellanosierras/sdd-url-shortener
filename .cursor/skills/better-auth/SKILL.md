---
name: better-auth
description: Usa better-auth para autenticación y autorización en el proyecto. Consulta la documentación actualizada vía MCP context7. Usar cuando se implemente o modifique login, registro, sesiones, OAuth, 2FA, permisos o cualquier flujo de autenticación.
---

# Better Auth

Este proyecto usa **better-auth** para autenticación y autorización. No uses otras librerías (NextAuth, Auth.js, etc.) para auth.

## Cuándo aplicar

- Implementar o modificar login, registro, cierre de sesión
- Configurar proveedores OAuth (Google, GitHub, etc.)
- Sesiones, cookies, JWTs
- 2FA, magic links, passkeys
- Roles, permisos, autorización
- Cualquier duda sobre la API o patrones de better-auth

## Consultar documentación (MCP context7)

Para obtener documentación y ejemplos actualizados de better-auth:

1. **Obtener library ID** (si no lo tienes): llamar al MCP `user-context7`, herramienta `resolve-library-id`:
   - `libraryName`: `"better-auth"`
   - `query`: descripción del objetivo (ej. "setup Next.js authentication", "OAuth Google")

2. **Consultar docs**: con el library ID (p. ej. `/better-auth/better-auth`), llamar `query-docs`:
   - `libraryId`: `"/better-auth/better-auth"` (o el devuelto por resolve-library-id)
   - `query`: pregunta concreta (ej. "How to configure email password sign in", "session middleware Next.js")

No hagas más de 3 llamadas a context7 por pregunta; si no encuentras lo necesario, usa la mejor información disponible.

## Referencia rápida

- Library ID por defecto en Context7: `/better-auth/better-auth`
- Better Auth es agnóstico de framework (TypeScript), con soporte explícito para Next.js y React.
- Para componentes UI listos (shadcn), existe también `/llmstxt/better-auth-ui_llms_txt` en Context7.
