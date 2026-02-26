# Feature Specification: Analítica de enlaces acortados

**Feature Branch**: `004-link-analytics`  
**Created**: 2026-02-26  
**Status**: Draft  
**Input**: User description: "Add link analytics: visits count, location, device, OS, referrer, UTM params"

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Registro de visitas al hacer clic (Priority: P1)

Cuando un visitante accede a una URL acortada (redirección), el sistema registra una visita asociada a ese enlace, capturando: número total de visitas por enlace, y por cada visita la localización (país y/o región), tipo de dispositivo (móvil/desktop), sistema operativo del visitante, referrer (si existe) y parámetros UTM presentes en la URL (utm_source, utm_medium, utm_campaign, etc.) para conocer el origen del tráfico (ej. LinkedIn, Instagram, campañas de email).

**Why this priority**: Sin registro de visitas no hay analítica; es el fundamento para todo el desglose posterior.

**Independent Test**: Se puede verificar generando una URL acortada, haciendo una o varias peticiones a la URL acortada desde distintos contextos (diferente User-Agent, referrer o UTM en la URL), y comprobando que el sistema persiste una visita por cada acceso con los datos capturados (totales incrementados y datos por visita).

**Acceptance Scenarios**:

1. **Given** existe un enlace acortado válido, **When** un visitante accede a la URL acortada (sigue el redirect), **Then** el sistema registra una visita asociada a ese enlace e incrementa el contador total de visitas del enlace.
2. **Given** una petición a la URL acortada incluye referrer y/o parámetros UTM en la URL de destino, **When** el sistema procesa el redirect, **Then** la visita registrada incluye referrer y los parámetros UTM capturados (utm_source, utm_medium, utm_campaign y otros UTM presentes).
3. **Given** una petición a la URL acortada incluye cabeceras o señales que permiten inferir dispositivo (móvil/desktop) y sistema operativo, **When** el sistema registra la visita, **Then** la visita queda asociada con tipo de dispositivo y sistema operativo cuando sea posible determinarlos.
4. **Given** una petición a la URL acortada permite inferir país y/o región (p. ej. por IP o cabeceras), **When** el sistema registra la visita, **Then** la visita queda asociada con localización (país y/o región) cuando sea posible determinarla.

---

### User Story 2 - Visualización de totales y desglose de analíticas (Priority: P2)

El propietario del enlace (usuario autenticado que creó la URL acortada) puede ver las analíticas de sus enlaces: número total de visitas por enlace y desglose por país/región, dispositivo, sistema operativo, referrer y parámetros UTM, para saber el origen del tráfico.

**Why this priority**: El valor de la analítica es que el usuario pueda consultar totales y desgloses; sin esta visualización el registro de visitas no sería útil.

**Independent Test**: Se puede verificar creando un enlace acortado, generando varias visitas con distintos referrers, UTM, dispositivos o localizaciones (simulados o reales), y comprobando que en la interfaz de analíticas del usuario se muestran el total de visitas y los desgloses por país, dispositivo, SO, referrer y UTM de forma coherente con los datos registrados.

**Acceptance Scenarios**:

1. **Given** el usuario está autenticado y tiene al menos un enlace acortado con visitas, **When** accede a la vista de analíticas de ese enlace (o al listado de analíticas), **Then** ve el número total de visitas de ese enlace.
2. **Given** el usuario está viendo las analíticas de un enlace, **When** existen visitas con datos de localización, **Then** puede ver un desglose por país y/o región (p. ej. conteos o porcentajes).
3. **Given** el usuario está viendo las analíticas de un enlace, **When** existen visitas con datos de dispositivo y SO, **Then** puede ver un desglose por tipo de dispositivo (móvil/desktop) y por sistema operativo.
4. **Given** el usuario está viendo las analíticas de un enlace, **When** existen visitas con referrer o parámetros UTM, **Then** puede ver un desglose por referrer y por UTM (utm_source, utm_medium, utm_campaign, etc.) para identificar origen del tráfico (ej. redes sociales, campañas).
5. **Given** el usuario no es el propietario del enlace o no está autenticado, **When** intenta acceder a las analíticas de un enlace, **Then** el sistema no muestra los datos analíticos de ese enlace (acceso denegado o redirección).

---

### User Story 3 - Acceso a analíticas desde el listado de enlaces (Priority: P3)

El usuario puede llegar a la vista de analíticas de un enlace desde su panel o listado de URLs acortadas (p. ej. desde el Dashboard), de forma que cada enlace tenga una entrada clara para ver sus analíticas.

**Why this priority**: Integra la analítica en el flujo existente del usuario (crear enlace, ver listado) sin exigir URLs o rutas memorizadas.

**Independent Test**: Se puede verificar entrando al Dashboard (o listado de enlaces del usuario), identificando un enlace y usando el control (botón, enlace o acción) que lleva a las analíticas de ese enlace; se comprueba que se muestra la vista de totales y desglose correspondiente a ese enlace.

**Acceptance Scenarios**:

1. **Given** el usuario está en el Dashboard (o listado de sus URLs acortadas), **When** selecciona la opción de ver analíticas de un enlace concreto, **Then** navega a la vista de analíticas de ese enlace y ve totales y desgloses.
2. **Given** el usuario está en la vista de analíticas de un enlace, **When** desea volver al listado o al Dashboard, **Then** dispone de un control (enlace o botón) para regresar.

---

### Edge Cases

- ¿Qué ocurre cuando no se puede determinar país/región, dispositivo o SO? El sistema registra la visita igualmente; los campos no determinables quedan como "desconocido" o equivalente y el desglose los agrupa bajo esa categoría.
- ¿Qué ocurre cuando la URL de redirección no tiene parámetros UTM ni referrer? La visita se registra con totales actualizados; referrer y UTM quedan vacíos o "directo/none" y el desglose lo refleja.
- ¿Qué ocurre cuando hay múltiples clics en un corto espacio de tiempo desde la misma fuente (mismo IP, mismo User-Agent)? Por defecto cada acceso a la URL acortada cuenta como una visita; si se decide deduplicar (p. ej. por IP + enlace en ventana de tiempo), se documenta en Supuestos.
- Visitas a enlaces creados antes de activar la analítica: se asume que no hay datos históricos; las analíticas aplican a visitas registradas a partir de la activación de esta funcionalidad.
- Enlace eliminado o inexistente: no se registran visitas; las analíticas de enlaces eliminados pueden no mostrarse o mostrarse como "ya no disponible" según criterio de producto.

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: El sistema MUST registrar una visita cada vez que un usuario accede a una URL acortada y se realiza la redirección, asociando la visita al enlace acortado correspondiente.
- **FR-002**: El sistema MUST mantener un contador (o equivalente derivable) del número total de visitas por enlace acortado.
- **FR-003**: Por cada visita, el sistema MUST almacenar o derivar, cuando sea posible: localización (país y/o región), tipo de dispositivo (móvil/desktop), sistema operativo del visitante, valor del referrer (si existe) y parámetros UTM presentes en la solicitud (utm_source, utm_medium, utm_campaign y otros UTM estándar).
- **FR-004**: El sistema MUST permitir al usuario autenticado propietario del enlace consultar el total de visitas de sus enlaces acortados.
- **FR-005**: El sistema MUST permitir al usuario propietario ver un desglose de las visitas por: país/región, dispositivo, sistema operativo, referrer y parámetros UTM (utm_source, utm_medium, utm_campaign, etc.), cuando existan datos para ello.
- **FR-006**: El sistema MUST restringir la visualización de analíticas de un enlace al usuario propietario de ese enlace (o roles autorizados según el modelo de permisos existente).
- **FR-007**: El sistema MUST ofrecer un modo de acceso desde el listado o panel de enlaces del usuario (p. ej. Dashboard) para navegar a la vista de analíticas de un enlace concreto.
- **FR-008**: Cuando no se pueda determinar localización, dispositivo, SO, referrer o UTM para una visita, el sistema MUST registrar la visita de todos modos y clasificar esos datos como desconocidos o vacíos en los desgloses.

### Key Entities _(include if feature involves data)_

- **Visit (visita/clic)**: Registro de un acceso a una URL acortada que resultó en redirección. Atributos conceptuales: asociación al enlace acortado, timestamp, localización (país/región), tipo de dispositivo, sistema operativo, referrer, parámetros UTM (utm_source, utm_medium, utm_campaign, etc.). Permite agregar totales y desgloses por cualquiera de estos ejes.
- **Link (enlace acortado)**: Entidad existente; debe poder asociarse con múltiples visitas y exponer total de visitas y desgloses para el propietario.

### Assumptions

- La localización se obtiene por IP o por mecanismos estándar (cabeceras, servicios externos); se asume precisión a nivel país/región suficiente para analítica de origen de tráfico.
- Dispositivo (móvil/desktop) y sistema operativo se infieren a partir del User-Agent o señales equivalentes; se aceptan categorías genéricas (p. ej. "Mobile", "Desktop", "Unknown" y "Windows", "macOS", "Linux", "iOS", "Android", "Other").
- Cada petición HTTP que resulta en redirección a la URL larga cuenta como una visita; no se exige deduplicación por IP o por sesión en este alcance (si se añade después, se documenta).
- Los parámetros UTM a soportar incluyen al menos utm_source, utm_medium, utm_campaign; pueden incluirse utm_term, utm_content u otros estándar según necesidad del producto.
- La vista de analíticas puede ser una página dedicada por enlace o un panel/modal accesible desde el listado; el requisito es que el usuario pueda ver totales y desgloses por país, dispositivo, SO, referrer y UTM.
- Enlaces sin visitas muestran total cero y desgloses vacíos o mensaje equivalente.

### Dependencies

- Existencia de enlaces acortados y redirección funcionando (feature de url-shortener).
- Usuario autenticado y asociación enlace–propietario (feature de user-auth) para restringir quién ve las analíticas de cada enlace.

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: Cada clic en una URL acortada que resulta en redirección queda registrado como visita y el total de visitas del enlace se actualiza de forma coherente.
- **SC-002**: El propietario del enlace puede ver el total de visitas y al menos un desglose por uno de los ejes (país, dispositivo, SO, referrer o UTM) en una única sesión de consulta.
- **SC-003**: Las visitas que incluyen referrer o UTM en la solicitud muestran esos datos en el desglose correspondiente de forma verificable.
- **SC-004**: Solo el propietario del enlace (o usuarios autorizados) puede acceder a las analíticas de ese enlace; los demás no ven los datos.
- **SC-005**: El usuario puede llegar a la vista de analíticas de un enlace desde el listado o panel de sus enlaces (p. ej. Dashboard) en un solo paso (un clic o acción).
