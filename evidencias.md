# 🧪 Evidencias de Pruebas

**Total: 20 pruebas** (4 backend + 8 frontend unit + 8 E2E)

---

## Backend — Pruebas Unitarias (JUnit 5 + Mockito) — 4 pruebas

Prueban la lógica de negocio de los servicios aislándola de la base de datos mediante mocks.

```bash
cd backend
mvn test
```

- **Framework:** JUnit 5 + Mockito
- **Ubicación:** `backend/src/test/java/com/reservas/service/`

### ServicioServiceTest

| Prueba | Descripción |
|--------|-------------|
| `debeCrearServicioYRetornarDTO` | Crea un servicio y verifica que el DTO retornado contenga los datos correctos (nombre, precio, duración, activo) |
| `debeObtenerTodosLosServicios` | Lista todos los servicios (activos e inactivos) y verifica el tamaño de la lista y los valores de cada uno |

### ReservaServiceTest

| Prueba | Descripción |
|--------|-------------|
| `debeConfirmarReservaYCambiarEstado` | Confirma una reserva existente y verifica que el estado cambie a "Confirmada" |
| `debeLanzarExcepcionAlRechazarReservaInexistente` | Intenta rechazar una reserva que no existe y verifica que lance `RuntimeException` con el mensaje "Reserva no encontrada" |

---

## Frontend — Pruebas Unitarias (Jest + React Testing Library) — 8 pruebas

Prueban componentes React y la capa de servicios Axios.

```bash
cd frontend
npm test                 # Modo interactivo (watch)
npm run test:unit        # Una sola ejecución
```

- **Framework:** Jest + React Testing Library
- **Ubicación:** `frontend/src/__tests__/`

### App.test.js

| Prueba | Descripción |
|--------|-------------|
| `muestra el formulario y las credenciales de prueba` | Renderiza el componente App y verifica que el heading "Iniciar Sesión", el placeholder `admin@reservas.com` y el texto "Credenciales de prueba" estén presentes en el DOM |
| `valida los campos obligatorios antes de enviar` | Hace clic en el botón "Iniciar Sesión" sin llenar los campos y verifica que aparezcan los mensajes "El email es obligatorio" y "La contraseña es obligatoria" |

### api.test.js

| Prueba | Descripción |
|--------|-------------|
| `obtenerServicios()` | Mockea `axios.get` y verifica que llame a `GET /servicios` y retorne los datos simulados |
| `crearServicio()` | Mockea `axios.post` y verifica que llame a `POST /servicios` con el payload del nuevo servicio |
| `crearReserva()` | Mockea `axios.post` y verifica que llame a `POST /reservas` con los datos de la reserva |
| `confirmarReserva()` | Mockea `axios.put` y verifica que llame a `PUT /reservas/{id}/confirmar` |

### ReservaForm.test.js

| Prueba | Descripción |
|--------|-------------|
| `debe mostrar el título y cargar los servicios` | Renderiza el formulario, mockea la respuesta de servicios y verifica que se listen correctamente |
| `debe enviar el formulario correctamente` | Completa todos los campos del formulario, lo envía y verifica que se muestre el mensaje de éxito |

---

## Frontend — Pruebas E2E (Playwright) — 8 pruebas

Simulan la interacción real del usuario en el navegador, incluyendo validación de formularios, llamadas a la API (interceptadas) y navegación entre rutas.

```bash
cd frontend
npm run test:e2e
```

### login.spec.js — 6 pruebas

Ubicación: `frontend/e2e/login.spec.js`

| Prueba | Descripción |
|--------|-------------|
| `muestra la pantalla de inicio de sesión` | Navega a `/` y verifica que el heading "Iniciar Sesión", el placeholder `admin@reservas.com` y el bloque "Credenciales de prueba" sean visibles |
| `impide enviar el login con campos vacíos` | Hace clic en "Iniciar Sesión" sin llenar campos y verifica los mensajes de error "El email es obligatorio" y "La contraseña es obligatoria", además de que la URL siga siendo `/` |
| `validación de formato de email inválido` | Escribe `correo@` en el email, desactiva la validación nativa del navegador, envía y verifica que aparezca "Email inválido" |
| `toggle de visibilidad de la contraseña` | Hace clic en el botón del ojo y verifica que el input de contraseña cambie de `password` a `text`, y al hacer clic nuevamente vuelva a `password` |
| `muestra mensaje de error con credenciales incorrectas` | Intercepta la petición `POST /api/auth/login` con código 401, llena credenciales, envía y verifica que se muestre el toast "Credenciales incorrectas" |
| `login exitoso redirige al dashboard` | Intercepta la petición `POST /api/auth/login` con código 200 y datos de usuario válidos, llena credenciales, envía y verifica el toast "Bienvenido al sistema" y la redirección a `/dashboard` |

### reservas.spec.js — 2 pruebas

Ubicación: `frontend/e2e/reservas.spec.js`

| Prueba | Descripción |
|--------|-------------|
| `inicia sesion como administrador y muestra el resumen` | Inicia sesión como admin, verifica redirección a `/dashboard` y que se muestren el nombre del admin, "Total Reservas" y la tabla de "Reservas Recientes" |
| `confirma una reserva pendiente desde el panel administrativo` | Inicia sesión, navega a la gestión de reservas, confirma una reserva pendiente y verifica que el estado cambie a "Confirmada" y aparezca el toast "Reserva confirmada" |

### Configuración de Playwright

Archivo: `frontend/playwright.config.js`

- **Servidor web:** Comentado — se espera que el servidor de desarrollo esté corriendo previamente en el puerto `3000`
- **Base URL:** `http://localhost:3000`
- **Proyectos:** Chromium (Desktop Chrome)
- **Workers:** 4 en paralelo
- **Trace:** Solo en primer reintento (`on-first-retry`)
- **Timeout:** 30 segundos por prueba
- **Intercepción:** Las peticiones a `http://localhost:8080/api/**` se interceptan para no depender del backend real

### Requisitos

```bash
cd frontend
npm install
npx playwright install chromium
```

---

## Resumen

| Capa | Lenguaje | Framework | Pruebas |
|------|----------|-----------|---------|
| Backend | Java | JUnit 5 + Mockito | 4 |
| Frontend unit | JavaScript | Jest + React Testing Library | 8 |
| E2E | JavaScript | Playwright | 8 |
| **Total** | | | **20** |
