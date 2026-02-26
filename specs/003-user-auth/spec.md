# Feature Specification: Autenticación y panel de URLs por usuario

**Feature Branch**: `003-user-auth`  
**Created**: 2026-02-26  
**Status**: Draft  
**Input**: User description: "debemos añadir autenticación en el proyecto para que cada persona tenga sus propias urls acortadas. Pantalla de login (correo y contraseña), pantalla de register (nombre, correo, contraseña y repetir contraseña), enlaces entre sí; componente arriba a la derecha con Iniciar sesión/Registrarse si no hay sesión o avatar con dropdown (Dashboard, Cerrar sesión) si hay sesión; dashboard sencillo con volver a página principal y listado de URLs acortadas indicando a qué URL apuntan. Autenticación más sencilla posible, sin verificación."

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Registro e inicio de sesión (Priority: P1)

El usuario puede crear una cuenta con nombre, correo y contraseña (con repetición de contraseña) y, posteriormente, iniciar sesión con correo y contraseña. No se requiere verificación de correo ni otros pasos adicionales.

**Why this priority**: Sin registro y login no hay identificación del usuario ni posibilidad de asociar URLs acortadas a una persona.

**Independent Test**: Se puede verificar registrando un nuevo usuario, cerrando sesión (o en otro navegador), e iniciando sesión con ese correo y contraseña; el sistema debe aceptar el login y considerar al usuario autenticado.

**Acceptance Scenarios**:

1. **Given** el usuario está en la pantalla de registro, **When** introduce nombre, correo, contraseña y repetición de contraseña válidos y envía, **Then** se crea la cuenta y el usuario queda autenticado (o es redirigido a login/inicio con mensaje de éxito).
2. **Given** el usuario está en la pantalla de login, **When** introduce correo y contraseña correctos de una cuenta existente y envía, **Then** el usuario queda autenticado y puede acceder a las áreas restringidas (p. ej. dashboard).
3. **Given** el usuario está en registro o login, **When** accede a la otra pantalla mediante el enlace correspondiente, **Then** puede ir de "Iniciar sesión" a "Registrarse" y viceversa sin perder contexto de la aplicación.

---

### User Story 2 - Cabecera con estado de sesión (Priority: P2)

En la página principal, arriba a la derecha, hay un componente que refleja el estado de sesión: si no hay sesión iniciada muestra enlaces para "Iniciar sesión" y "Registrarse"; si hay sesión iniciada muestra un avatar que, al expandirse (dropdown), ofrece las opciones "Dashboard" y "Cerrar sesión".

**Why this priority**: Permite descubrir y usar login/registro desde la página principal y acceder al dashboard o cerrar sesión de forma clara.

**Independent Test**: Se puede verificar entrando en la página principal sin sesión (se ven los enlaces de login/registro), iniciando sesión y comprobando que aparece el avatar con dropdown y las opciones indicadas; al elegir "Cerrar sesión" la sesión termina y vuelven a mostrarse los enlaces de login/registro.

**Acceptance Scenarios**:

1. **Given** no hay sesión iniciada, **When** el usuario está en la página principal, **Then** en la zona superior derecha se muestran enlaces (o botones) "Iniciar sesión" y "Registrarse".
2. **Given** hay sesión iniciada, **When** el usuario está en la página principal, **Then** en la zona superior derecha se muestra un avatar que al expandirse muestra un menú con "Dashboard" y "Cerrar sesión".
3. **Given** el menú del avatar está expandido, **When** el usuario selecciona "Dashboard", **Then** se navega al panel de control del usuario.
4. **Given** el menú del avatar está expandido, **When** el usuario selecciona "Cerrar sesión", **Then** la sesión se cierra y la interfaz refleja estado no autenticado (enlaces de login/registro).

---

### User Story 3 - Dashboard de URLs acortadas (Priority: P3)

El usuario autenticado dispone de un panel de control sencillo donde puede ver sus URLs acortadas, indicando en cada una a qué URL apuntan. El panel incluye un modo de volver a la página principal.

**Why this priority**: Es el valor central de "cada persona tiene sus propias URLs": poder ver y gestionar el listado de enlaces acortados propios.

**Independent Test**: Se puede verificar iniciando sesión, creando una o varias URLs acortadas desde la página principal, entrando al Dashboard y comprobando que se listan esas URLs con la URL de destino asociada, y que el botón/enlace de volver lleva a la página principal.

**Acceptance Scenarios**:

1. **Given** el usuario está autenticado, **When** accede al Dashboard, **Then** ve un listado de sus URLs acortadas, mostrando para cada una la URL acortada (o su identificador) y la URL a la que apunta.
2. **Given** el usuario está en el Dashboard, **When** no tiene ninguna URL acortada creada, **Then** el panel muestra un estado vacío entendible (p. ej. "Aún no tienes URLs acortadas" o listado vacío).
3. **Given** el usuario está en el Dashboard, **When** usa el control de "Volver a la página principal", **Then** navega a la página principal de la aplicación.
4. **Given** el usuario no está autenticado, **When** intenta acceder al Dashboard, **Then** el sistema no muestra el listado privado (redirige a login o muestra mensaje de acceso denegado).

---

### Edge Cases

- ¿Qué ocurre cuando en registro el correo ya existe? El sistema debe rechazar el registro y mostrar un mensaje claro (p. ej. "Este correo ya está registrado") sin crear una cuenta duplicada.
- ¿Qué ocurre cuando en login el correo o la contraseña son incorrectos? El sistema debe mostrar un mensaje genérico de error (p. ej. "Credenciales incorrectas") sin revelar si el fallo fue el correo o la contraseña.
- ¿Qué ocurre cuando en registro la contraseña y la repetición no coinciden? El sistema debe indicar el error en el formulario y no crear la cuenta.
- ¿Qué ocurre cuando se dejan campos obligatorios vacíos (nombre, correo, contraseña)? El sistema debe validar y mostrar errores en el formulario sin enviar la petición de registro o login.
- Acceso directo al Dashboard sin sesión: el sistema debe redirigir a login o mostrar que se requiere autenticación.
- Sesión caducada o inválida: al intentar acceder al Dashboard (o al expandir el avatar) el sistema debe tratar al usuario como no autenticado y mostrar los enlaces de login/registro.

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: El sistema MUST permitir el registro de usuarios con nombre, correo electrónico, contraseña y repetición de contraseña; la contraseña y la repetición deben coincidir para aceptar el registro.
- **FR-002**: El sistema MUST permitir el inicio de sesión con correo electrónico y contraseña para cuentas ya registradas.
- **FR-003**: El sistema MUST rechazar el registro si el correo ya está registrado e informar al usuario de forma clara.
- **FR-004**: El sistema MUST rechazar el login si las credenciales son incorrectas e informar al usuario sin revelar si el error es el correo o la contraseña.
- **FR-005**: Las pantallas de login y de registro MUST incluir enlaces (o navegación) entre sí para ir de una a la otra.
- **FR-006**: En la página principal, el sistema MUST mostrar en la zona superior derecha: si no hay sesión, enlaces "Iniciar sesión" y "Registrarse"; si hay sesión, un avatar expandible con opciones "Dashboard" y "Cerrar sesión".
- **FR-007**: El sistema MUST ofrecer un Dashboard accesible solo para usuarios autenticados que muestre las URLs acortadas del usuario, indicando para cada una la URL de destino a la que apunta.
- **FR-008**: El Dashboard MUST incluir un control (botón o enlace) para volver a la página principal.
- **FR-009**: El sistema MUST asociar cada URL acortada creada al usuario autenticado que la crea; las URLs acortadas listadas en el Dashboard MUST ser únicamente las del usuario en sesión.
- **FR-010**: El sistema MUST mantener una sesión tras login/registro hasta que el usuario cierre sesión (o la sesión expire según criterio del sistema); no se requiere verificación de correo ni flujos adicionales en este alcance.

### Key Entities _(include if feature involves data)_

- **Usuario**: Persona que se registra e inicia sesión. Atributos esenciales: nombre (o identificador de nombre), correo electrónico (único), contraseña (almacenada de forma segura). Relación: es el propietario de sus URLs acortadas.
- **Sesión**: Representa que un usuario está autenticado en la aplicación; permite decidir qué mostrar en la cabecera y si se permite acceso al Dashboard.
- **URL acortada (existente, extendida)**: Además del identificador y la URL de destino, debe tener asociado el usuario propietario para filtrar en el Dashboard y para asignar la propiedad al crear nuevas URLs.

### Assumptions

- La autenticación es únicamente con correo y contraseña; no se requiere OAuth, verificación de correo ni recuperación de contraseña en este alcance.
- El "avatar" en la cabecera puede ser un icono genérico o iniciales; no se exige foto de perfil ni subida de imagen.
- El Dashboard es de solo lectura para el listado de URLs (ver propias URLs y a qué apuntan); la gestión avanzada (editar, eliminar) queda fuera de este alcance salvo que se indique lo contrario.
- Las URLs acortadas creadas antes de implementar la autenticación pueden quedar sin propietario o asignarse a un usuario por criterio de diseño; el requisito es que a partir de esta feature las nuevas URLs queden asociadas al usuario autenticado.

## Success Criteria _(mandatory)_

### Measurable Outcomes

_(Align with constitution: include UX, performance or quality metrics where applicable.)_

- **SC-001**: Un usuario puede completar el registro (nombre, correo, contraseña, repetir contraseña) y quedar autenticado en menos de 2 minutos.
- **SC-002**: Un usuario registrado puede iniciar sesión con correo y contraseña y acceder al Dashboard en un flujo de un solo paso (login correcto → acceso).
- **SC-003**: En la página principal, el estado de sesión (enlaces login/registro vs avatar con Dashboard y Cerrar sesión) se refleja de forma inmediata tras login o logout.
- **SC-004**: En el Dashboard, el usuario ve solo sus propias URLs acortadas y, para cada una, la URL de destino de forma clara; el listado se actualiza según las URLs que haya creado estando autenticado.
- **SC-005**: Los errores de formulario (contraseñas no coinciden, correo duplicado, credenciales incorrectas) se muestran en la misma pantalla con mensajes entendibles, sin dejar al usuario sin feedback.
