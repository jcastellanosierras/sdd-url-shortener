# Feature Specification: Acortador de URLs

**Feature Branch**: `002-url-shortener`  
**Created**: 2025-02-10  
**Status**: Draft  
**Input**: User description: "quiero añadir una nueva funcionalidad para tener un acortador de urls. Formulario donde el usuario introduce una URL, la aplicación crea un alias que redirige bajo el dominio de la aplicación. User stories: (1) usuario introduce URL y recibe la URL acortada; (2) usuario entra a la URL acortada y es redirigido a la URL original."

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Crear URL acortada (Priority: P1)

El usuario introduce una URL larga en un formulario (por ejemplo `https://google.com`). La aplicación genera un alias único bajo el dominio de la aplicación y devuelve al usuario la URL acortada (por ejemplo `http://localhost:3000/abc12xy`) que, al visitarla, llevará a la URL original.

**Why this priority**: Sin esta historia no existe valor: el usuario debe poder obtener la URL acortada para compartirla.

**Independent Test**: Se puede verificar introduciendo una URL en el formulario y comprobando que la aplicación devuelve una URL del dominio de la aplicación con un identificador que no existía antes.

**Acceptance Scenarios**:

1. **Given** el usuario está en la página con el formulario, **When** introduce una URL válida (p. ej. `https://ejemplo.com/ruta`) y envía el formulario, **Then** la aplicación muestra o devuelve una URL acortada bajo el dominio de la aplicación que apunta a esa URL original.
2. **Given** una URL válida ya introducida, **When** el usuario envía el formulario, **Then** la URL acortada generada redirige correctamente a la URL original cuando se visita.

---

### User Story 2 - Redirigir desde la URL acortada (Priority: P2)

El usuario (o cualquier visitante) abre en el navegador la URL acortada (por ejemplo `http://localhost:3000/fjas952k`). La aplicación redirige al usuario a la URL original que se asoció a ese identificador al crearla (por ejemplo `https://google.com`).

**Why this priority**: Es el comportamiento central del acortador; sin redirección la URL acortada no tiene utilidad.

**Independent Test**: Se puede verificar creando primero una URL acortada (US1) y luego visitando la URL acortada y comprobando que el navegador termina en la URL original.

**Acceptance Scenarios**:

1. **Given** existe una URL acortada asociada a una URL original, **When** el usuario visita la URL acortada, **Then** el navegador es redirigido a la URL original.
2. **Given** el usuario visita una URL acortada que no existe (identificador desconocido), **When** se solicita esa ruta, **Then** la aplicación responde con un error entendible (p. ej. "no encontrada") sin redirigir a una URL externa.

---

### Edge Cases

- ¿Qué ocurre cuando el usuario introduce una URL inválida o vacía? La aplicación debe rechazar el envío y mostrar un mensaje claro (p. ej. "URL no válida").
- ¿Qué ocurre cuando se visita un identificador que no existe? La aplicación debe responder con un error (p. ej. 404 o página "enlace no encontrado") sin redirigir.
- ¿Se permite la misma URL larga varias veces? La aplicación puede generar una nueva URL acortada cada vez o reutilizar una existente; el comportamiento debe ser coherente y predecible para el usuario.
- URLs con caracteres especiales o muy largas: la aplicación debe aceptar URLs válidas estándar y persistir la asociación correctamente.

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: El sistema MUST permitir al usuario introducir una URL (cadena que representa un enlace) mediante un formulario.
- **FR-002**: El sistema MUST validar que la entrada sea una URL válida antes de crear el alias; si no lo es, MUST indicar el error al usuario sin crear el alias.
- **FR-003**: El sistema MUST generar un identificador único para cada URL acortada creada y exponer la URL acortada bajo el dominio de la aplicación.
- **FR-004**: El sistema MUST persistir la asociación entre el identificador de la URL acortada y la URL original.
- **FR-005**: Cuando un usuario visita la ruta de la aplicación que corresponde a un identificador existente, el sistema MUST redirigir al usuario a la URL original asociada.
- **FR-006**: Cuando un usuario visita una ruta con un identificador que no existe, el sistema MUST responder con un error claro (no redirección a URL externa).
- **FR-007**: La aplicación MUST mostrar o devolver al usuario la URL acortada tras crear el alias con éxito.

### Key Entities _(include if feature involves data)_

- **URL acortada (alias)**: Representa el vínculo entre un identificador único (usado en la ruta) y la URL original. Atributos esenciales: identificador, URL original (destino). La persistencia debe permitir resolver "identificador → URL original" y, si se desea, "URL original → identificador" para reutilizar enlaces.

## Success Criteria _(mandatory)_

### Measurable Outcomes

_(Align with constitution: include UX, performance or quality metrics where applicable.)_

- **SC-001**: Un usuario puede introducir una URL válida y obtener la URL acortada en una única acción (un envío de formulario), sin pasos adicionales obligatorios.
- **SC-002**: Al visitar una URL acortada válida, el usuario es redirigido a la URL original en un tiempo percibido como inmediato (comportamiento típico de redirección web).
- **SC-003**: Las entradas inválidas (URL vacía o mal formada) reciben feedback claro en la misma pantalla, sin redirección errónea.
- **SC-004**: Los identificadores inexistentes no provocan redirección a destinos externos; el usuario recibe un mensaje de error o página de "no encontrado" dentro de la aplicación.

## Assumptions

- El dominio base de la aplicación (p. ej. `localhost:3000` en desarrollo) es el que se usa para construir las URLs acortadas.
- No se exige autenticación para crear o visitar URLs acortadas en este alcance.
- Una misma URL larga puede generar varias URLs acortadas (una por envío) o reutilizar una existente; la decisión se deja al diseño técnico mientras sea coherente.
- Solo se consideran URLs con esquema estándar (p. ej. http/https); la validación sigue criterios habituales de URL válida.
