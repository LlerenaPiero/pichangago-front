# Resultados de Pruebas — PichangaGo

**Fecha:** 19/06/2026

---

## 1. Pruebas de API — Postman

**Estado: ✅ Completado**

Todos los endpoints del backend responden correctamente:

| Categoría | Endpoints | Estado |
|-----------|-----------|--------|
| Autenticación | Register, Login, Logout, Refresh | ✅ |
| Canchas (público) | Listar, Detalle, Slots, Ofertas, Reservar | ✅ |
| Reservas (jugador) | Mis reservas, Cancelar | ✅ |
| Dueño | CRUD canchas, Perfil, Horarios, Slots, Agenda, Dashboard, Reportes | ✅ |
| Locales | CRUD locales | ✅ |

---

## 2. Pruebas Unitarias — Vitest + React Testing Library

**Estado: ✅ 97/97 tests pasando · 14/14 archivos · 0 fallos**

### Resultado por archivo

| Archivo | Tests | Estado |
|---------|-------|--------|
| `authService.test.js` | 11 | ✅ |
| `canchaService.test.js` | 9 | ✅ |
| `duenoService.test.js` | 13 | ✅ |
| `localService.test.js` | 4 | ✅ |
| `useToast.test.js` | 7 | ✅ |
| `ErrorBoundary.test.jsx` | 2 | ✅ |
| `DashboardDueno.test.jsx` | 6 | ✅ |
| `ToastContainer.test.jsx` | 6 | ✅ |
| `Navbar.test.jsx` | 7 | ✅ |
| `Home.test.jsx` | 5 | ✅ |
| `MisReservas.test.jsx` | 6 | ✅ |
| `CanchaDetail.test.jsx` | 7 | ✅ |
| `PerfilDueno.test.jsx` | 6 | ✅ |
| `AuthModal.test.jsx` | 8 | ✅ |

### Cobertura de código

| Cobertura | Porcentaje |
|-----------|-----------|
| Statements | 74.53% |
| Branches | 63.31% |
| Functions | 69.50% |
| Lines | 78.61% |

**Archivos con cobertura 100%:** `ToastContainer.jsx`, `canchaService.js`, `localService.js`, `useToast.js`

**Archivos por mejorar:** `duenoService.js` (42.64%), `validationErrors.js` (25%), `AuthModal.jsx` (66.66%)

### Correcciones realizadas (12 fallos → 0)

| Archivo | Fallas | Causa | Fix |
|---------|--------|-------|-----|
| AuthModal | 3 | Texto fantasma "Procesando..." en botón login; textos duplicados en registro | Eliminado texto inexistente; `getAllByText` |
| DashboardDueno | 1 | Nombre partido por `<br>` | Regex `/Carlos López/` |
| Home | 1 | Distrito "Miraflores" duplicado en datos mock | `getAllByText` por índice |
| PerfilDueno | 4 | Roles inexistentes en DOM; textos partidos por `<strong>` | `findByRole('alert')`; `getAllByText` |
| CanchaDetail | 3→0 | Texto con sufijo adicional; race conditions; selector muy amplio | Regex; `findByText` async; `getByRole` específico |

---

## 3. Pruebas de Accesibilidad — WAVE

**Estado: ✅ 8.5/10**

- Sin errores de contraste
- Estructura semántica correcta
- Encabezados y landmarks presentes
- Navegación por teclado funcional

---

## 4. Pruebas de Seguridad — OWASP ZAP

**Estado: ✅ Completado — 0 vulnerabilidades críticas/medias**

Se realizó escaneo activo sobre `http://localhost:5173` navegando por la aplicación (login, búsqueda, detalle de cancha, reserva).

### Hallazgos

| Alerta | Severidad | Descripción |
|--------|-----------|-------------|
| Cabecera CSP no configurada | 🟢 Baja | Falta header `Content-Security-Policy` |
| Falta Anti-Clickjacking | 🟢 Baja | Falta header `X-Frame-Options` |
| Falta X-Content-Type-Options | 🟢 Baja | Falta header `X-Content-Type-Options: nosniff` |
| Divulgación de timestamps | 🔵 Informativa | Timestamps Unix en respuestas |
| ID de sesión en URL | 🟢 Baja | Parámetros en URL visibles en logs |
| Aplicación Web Moderna | 🔵 Informativa | SPA detectada (React) — normal |
| Recuperado de Caché | 🔵 Informativa | Uso de cache del navegador — normal |

**Total: 0 altas · 0 medias · 3 bajas · 4 informativas**

Ninguna vulnerabilidad explotable. Las alertas bajas corresponden a headers HTTP de hardening que no afectan la seguridad funcional de la aplicación.

---

## 5. Pruebas de Carga — K6

**Estado: ⚠️ Parcial (rate limiting en register/login)**

- **GET endpoints** (listar canchas, ofertas, detalle, slots): funcionan correctamente bajo carga escalonada hasta 200 VUs concurrentes
- **Register/Login**: el backend aplica rate limiting que rechaza peticiones concurrentes — comportamiento esperado como medida anti-fuerza bruta

---

## Herramientas

| Tipo | Herramienta | Estado |
|------|-------------|--------|
| API | Postman | ✅ Completado |
| Unit / Componente | Vitest + RTL | ✅ 97/97 tests |
| Accesibilidad | WAVE | ✅ 8.5/10 |
| Seguridad | OWASP ZAP | ✅ 0 críticas |
| Carga | K6 | ⚠️ Parcial |
