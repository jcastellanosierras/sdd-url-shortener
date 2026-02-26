<!--
  Sync Impact Report (re-validation — 2026-02-26)
  Version change: 1.0.0 → 1.0.1 (PATCH: re-validation and governance dates alignment)
  Modified principles: none
  Added sections: none
  Removed sections: none
  Templates: plan-template.md ✅ (Constitution Check aligned with four principles), spec-template.md ✅, tasks-template.md ✅
  Commands: .cursor/commands/speckit.* — referenced correctly in plan-template ✅
  Follow-up TODOs: none
-->

# URL Shortener Constitution

## Core Principles

### I. Code Quality

El código MUST ser mantenible, legible y coherente con el resto del proyecto.

- Código MUST seguir las reglas de lint y formato definidas en el proyecto (configuración compartida).
- Nombres de símbolos, módulos y rutas MUST ser descriptivos; la complejidad MUST estar justificada en diseño o comentarios.
- No se acepta deuda técnica sin ticket o justificación documentada.
- **Rationale**: Calidad de código reduce bugs, facilita onboarding y permite evolucionar el producto de forma predecible.

### II. Testing Standards

Los estándares de pruebas son obligatorios para garantizar regresión y comportamiento esperado.

- Las funcionalidades nuevas MUST estar cubiertas por tests (unitarios, de integración o de contrato según el alcance).
- Los tests MUST ser deterministas, rápidos donde sea posible y deben fallar antes de implementar el comportamiento (red-green-refactor cuando se aplique).
- Contratos y APIs públicas MUST tener tests de contrato; flujos críticos MUST tener tests de integración.
- **Rationale**: Tests automatizados permiten refactor seguro, documentan el comportamiento y detectan regresiones antes de producción.

### III. User Experience Consistency

La experiencia de usuario MUST ser coherente y predecible en toda la aplicación.

- Patrones de UI/UX (navegación, feedback, mensajes de error, estados de carga) MUST ser consistentes entre pantallas y flujos.
- Las acciones del usuario MUST tener feedback claro (éxito, error, progreso); los errores MUST ser comprensibles y accionables.
- Se MUST respetar criterios de accesibilidad básicos (contraste, etiquetas, navegación por teclado donde aplique).
- **Rationale**: Consistencia y feedback reducen confusión, soporte y abandono; la accesibilidad amplía el alcance del producto.

### IV. Performance Requirements

El rendimiento MUST ser medible y cumplir objetivos definidos por dominio.

- Cada feature o flujo crítico MUST tener criterios de rendimiento definidos (latencia, throughput o uso de recursos) cuando aplique.
- Los objetivos MUST ser verificables (tests de rendimiento, métricas o benchmarks) y documentados en plan o spec.
- No se introducen cambios que degraden de forma injustificada latencia, memoria o tiempo de respuesta por debajo de los umbrales acordados.
- **Rationale**: Objetivos claros evitan regresiones de rendimiento y permiten priorizar optimizaciones de forma objetiva.

## Additional Constraints

- Stack tecnológico y dependencias MUST estar documentados en el plan de implementación; cambios relevantes requieren actualización del plan.
- Seguridad: datos sensibles MUST estar protegidos (no logs de secretos, validación de entradas, prácticas estándar del stack).
- Despliegue y configuración MUST estar documentados (entorno, variables, pasos de despliegue) para permitir reproducción.

## Development Workflow

- Code review: todos los PRs MUST verificar cumplimiento con esta constitución (calidad, tests, UX y rendimiento según aplique).
- Quality gates: el plan de cada feature MUST incluir un Constitution Check que evalúe los cuatro principios antes de Fase 0 y tras Fase 1.
- Las excepciones o violaciones justificadas MUST documentarse en el plan (tabla de Complexity Tracking) con alternativa rechazada y motivo.

## Governance

- Esta constitución tiene prioridad sobre prácticas ad hoc; las decisiones de diseño y proceso deben alinearse con estos principios.
- Enmiendas: requieren propuesta documentada, impacto en plantillas y versionado semántico (MAJOR/MINOR/PATCH).
- Revisión de cumplimiento: en cada plan de feature se debe re-evaluar el Constitution Check; las desviaciones deben quedar registradas.
- Para guía operativa de desarrollo (comandos, flujos, scripts), usar la documentación del proyecto y los comandos en `.cursor/commands/`.

**Version**: 1.0.1 | **Ratified**: 2025-02-10 | **Last Amended**: 2026-02-26
