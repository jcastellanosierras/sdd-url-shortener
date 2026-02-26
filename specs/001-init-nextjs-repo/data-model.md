# Data Model: 001-init-nextjs-repo

**Feature**: Inicialización del repositorio con Next.js  
**Date**: 2025-02-10

## Alcance de esta feature

Esta feature solo inicializa el proyecto (Next.js, TypeScript, Prisma, etc.). **No se definen entidades de dominio ni modelos de negocio** en este plan; el modelo de datos se ampliará en features posteriores (p. ej. URLs acortadas, usuarios, etc.).

## Uso de Prisma

- **ORM**: Prisma.
- **Ubicación del esquema**: `prisma/schema.prisma`.
- **Cliente**: Singleton de Prisma Client en `src/lib/db.ts` (o equivalente) para evitar múltiples instancias en desarrollo (hot reload).
- **Migraciones**: Se ejecutarán cuando existan modelos en el schema; en el bootstrap se puede dejar el schema vacío o con un modelo placeholder para que `prisma generate` funcione.

## Convenciones para features posteriores

- Los modelos de dominio se definirán en `prisma/schema.prisma` con nombres descriptivos y relaciones explícitas.
- Las validaciones de negocio se documentarán en las specs de cada feature y se implementarán en código (Prisma no sustituye validación de aplicación).
- Se seguirá la guía oficial de Prisma para migraciones y seeds cuando se introduzcan entidades.

## Entidades en esta feature

Ninguna. El data model concreto (tablas, relaciones) se especificará en los planes de las features que introduzcan persistencia.
