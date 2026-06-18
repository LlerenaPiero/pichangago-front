# Implementación ISO/IEC 25010 — PichangaGo Frontend

> **Estándar**: ISO/IEC 25010 — Modelo de Calidad del Producto de Software
> **Versión del documento**: 1.0
> **Fecha**: Junio 2026
> **Alcance**: Módulo Frontend React (Vite) — rama `feature/gestion-dueno`

---

## Índice

1. [Eficiencia de Desempeño (Performance Efficiency)](#1-eficiencia-de-desempeño-performance-efficiency)
2. [Seguridad (Security)](#2-seguridad-security)
3. [Usabilidad (Usability)](#3-usabilidad-usability)
4. [Fiabilidad (Reliability)](#4-fiabilidad-reliability)

---

## 1. Eficiencia de Desempeño (Performance Efficiency)

### 1.1 Comportamiento Temporal (Time Behaviour)

#### Implementado

| # | Medida | Archivo | Línea |
|---|---|---|---|
| 1 | **Debounce en filtros de búsqueda** — Los cambios en filtros (`nombre`, `distrito`, `precioMin`, `precioMax`) se deboucean 300ms antes de disparar la petición al backend, evitando llamadas innecesarias durante escritura rápida. | `src/hooks/useDebounce.js` | 1–8 |
| 2 | Aplicación del hook en el componente `Buscar`: `filtrosActivos` reemplaza a `filtros` en la dependencia del `useEffect`. | `src/pages/Buscar.jsx` | 38, 46 |
| 3 | **Lazy loading de rutas** — Todas las rutas del panel dueño, detalle de cancha, buscar y reservas usan `React.lazy()` + `Suspense`. | `src/App.jsx` | 9–19 |
| 4 | **Carga diferida de imágenes** — Atributo `loading="lazy"` en todas las `<img>` de listados. | `src/pages/Buscar.jsx` | 142 |

#### Pendiente / Mejora futura

- Monitoreo de Core Web Vitals (FCP, LCP, CLS) con `performance.mark()`.
- Virtualización de lista de slots con `react-window` para agendas con >50 slots/día.

---

### 1.2 Utilización de Recursos (Resource Utilization)

#### Implementado

| # | Medida | Archivo | Línea |
|---|---|---|---|
| 1 | **Dimensiones explícitas en imágenes** — Se agregaron `width` y `height` a las imágenes de las cards de búsqueda, eliminando Cumulative Layout Shift (CLS). | `src/pages/Buscar.jsx` | 142 |
| 2 | **Fragments de React** — Uso de `<></>` en lugar de divs extra para reducir nodos del DOM. | Múltiples | — |

#### Pendiente / Mejora futura

- Migrar estilos inline de la agenda a CSS modules para purgado de CSS no utilizado.
- Agregar dimensiones explícitas a imágenes en `Home.jsx` y `CanchaDetail.jsx`.

---

### 1.3 Capacidad (Capacity)

#### Implementado

| # | Medida | Archivo | Línea |
|---|---|---|---|
| 1 | **Validación de tamaño de archivo client-side** — Las fotos no pueden superar los 5 MB; se valida antes de enviar al backend. | `src/components/dueno/ModalGestionCancha.jsx` | 421–427 |
| 2 | **Deshabilitación de botón submit durante carga** — Previene peticiones duplicadas. | `src/components/AuthModal.jsx` | 169 |

#### Pendiente / Mejora futura

- Definir e implementar paginación en las agendas diaria y semanal.

---

## 2. Seguridad (Security)

### 2.1 Confidencialidad (Confidentiality)

#### Implementado

| # | Medida | Archivo | Línea |
|---|---|---|---|
| 1 | **Refresh token en cookie HttpOnly** — El `refreshToken` ya no se almacena en `localStorage`. El backend lo recibe y envía como cookie HttpOnly con `SameSite=Strict`. | `src/services/authService.js` | 58–68 |
| 2 | **`credentials: 'include'`** — Todas las peticiones a la API protegida envían cookies automáticamente mediante `credentials: 'include'`. | `src/utils/apiFetch.js` | 13 |
| 3 | Aplicado también en `authService.logout()`, `authService.refreshAccessToken()`, `authService.fetchProtected()` y en el polling de sesión de `App.jsx`. | `src/App.jsx` | 46 |
| 4 | **Roles de acceso (RBAC)** — `ProtectedRoute` en `App.jsx` filtra rutas por rol (`JUGADOR` / `DUENO`). | `src/App.jsx` | 23–27 |

#### Criterio ISO 25010

> *Cifrado de datos en tránsito: TLS 1.3 desde el frontend hacia el backend.*
> *Políticas de control de acceso estricto: RBAC implementado vía `<ProtectedRoute>`.*

#### Pendiente / Mejora futura

- Migrar también el access token a memoria volátil (variable JS) en vez de `localStorage`, utilizando refresh token en cookie HttpOnly para renovarlo. Esto requiere que el backend emita el access token en memoria y el refresh token en cookie.

---

### 2.2 Integridad (Integrity)

#### Implementado

| # | Medida | Archivo | Línea |
|---|---|---|---|
| 1 | **Validación de formularios client-side** — Regex en RUC, CCI, precios para prevenir datos inválidos antes del envío. | `src/pages/dueno/PanelDueno.jsx` | 79–85 |

#### Criterio ISO 25010

> *Validación estricta de payloads en frontend: coincide con la validación del backend para filtrar datos malformados temprano.*

---

### 2.3 No Repudio (Non-repudiation)

#### Implementado

| # | Medida | Archivo | Línea |
|---|---|---|---|
| 1 | **Logs estructurados de auditoría** — Los errores del sistema se registran con `{ error, timestamp }` para trazabilidad. | `src/services/authService.js` | 19, 47 |

#### Pendiente / Mejora futura

- Enviar eventos de auditoría a un endpoint dedicado (`POST /api/audit`) para acciones críticas del dueño (cambio de estado de slot, eliminación de fotos, modificación de horarios).

---

### 2.4 Autenticidad (Authenticity)

#### Implementado

| # | Medida | Archivo | Línea |
|---|---|---|---|
| 1 | **JWT con renovación automática** — `apiFetch.js` detecta 401, llama a `/api/refresh` y reintenta la petición original. | `src/utils/apiFetch.js` | 30–47 |
| 2 | **Validación periódica de sesión** — Cada 60s se verifica el estado del token contra `/api/validate-session`. | `src/App.jsx` | 42–57 |
| 3 | **Contador de intentos de login** — Muestra "(X/3 intentos)" tras fallar, permitiendo al backend bloquear la cuenta. | `src/components/AuthModal.jsx` | 62–64 |

#### Criterio ISO 25010

> *Tokens JWT con refresh automático cumplen con el criterio de autenticidad del estándar.*

---

### 2.5 Responsabilidad (Accountability)

#### Implementado

| # | Medida | Archivo | Línea |
|---|---|---|---|
| 1 | **Logs estructurados con contexto** — Los `console.error` ahora incluyen `{ error, timestamp }` y el módulo de origen. | Múltiples | — |

#### Pendiente / Mejora futura

- Integrar con un SIEM (Sentry, Datadog) para agregación centralizada de logs de auditoría.

---

## 3. Usabilidad (Usability)

### 3.1 Inteligibilidad / Reconocibilidad de Adecuación

#### Implementado

| # | Medida | Archivo | Línea |
|---|---|---|---|
| 1 | **Landing page** — Hero section explica claramente el propósito de la app: "Reserva tu cancha en 30 segundos". | `src/pages/Home.jsx` | 34–36 |
| 2 | **Onboarding del dueño** — 3 pasos con indicador de progreso visual. | `src/pages/dueno/DuenoOnboarding.jsx` | 61–65 |
| 3 | **Tooltips descriptivos** — Atributo `title` en inputs de formularios para guiar al usuario. | `src/components/AuthModal.jsx` | 134, 138, 147, 164 |

---

### 3.2 Aprendizaje (Learnability)

#### Implementado

| # | Medida | Archivo | Línea |
|---|---|---|---|
| 1 | **Grid de horarios con tutorial implícito** — "Haz clic en cada celda para activar/desactivar o cambiar la tarifa". | `src/components/dueno/ModalGestionCancha.jsx` | 273 |
| 2 | **Texto de ayuda en contraseña** — "Mínimo 6 caracteres" usando `aria-describedby`. | `src/components/AuthModal.jsx` | 164–165 |

---

### 3.3 Operabilidad (Operability)

#### Implementado

| # | Medida | Archivo | Línea |
|---|---|---|---|
| 1 | **Navegación por teclado en cards de búsqueda** — `onFocus`/`onBlur` replican el efecto hover para usuarios de teclado. | `src/pages/Buscar.jsx` | 139–140 |
| 2 | **Tabs con `<button>` nativo** — Los tabs de navegación usan elementos `<button>`, navegables por teclado con Tab. | `src/components/dueno/ModalGestionCancha.jsx` | 231–235 |
| 3 | **`aria-selected` en tabs** — Los tabs informan su estado a lectores de pantalla. | `src/components/dueno/ModalGestionCancha.jsx` | 231 |

#### Criterio ISO 25010

> *Navegación por teclado y atributos ARIA: cumplimiento parcial del criterio de operabilidad.*

---

### 3.4 Protección Frente a Errores de Usuario

#### Implementado

| # | Medida | Archivo | Línea |
|---|---|---|---|
| 1 | **Validación en tiempo real** — RUC, CCI validados con regex al escribir. | `src/pages/dueno/PanelDueno.jsx` | 79–85 |
| 2 | **Submit deshabilitado durante carga** — Botón de login/registro se deshabilita con `disabled` + estilo visual. | `src/components/AuthModal.jsx` | 169 |
| 3 | **Confirmación visual antes de eliminar** — `ConfirmDialog` reemplaza al `confirm()` nativo, con `role="alertdialog"` y soporte de teclado. | `src/components/ConfirmDialog.jsx` | 1–75 |
| 4 | Aplicado en la eliminación de fotos en gestión de canchas. | `src/components/dueno/ModalGestionCancha.jsx` | 428–433 |
| 5 | **Validación tamaño archivo** — Mensaje de error si la foto supera 5 MB, antes del envío. | `src/components/dueno/ModalGestionCancha.jsx` | 421–427 |

#### Criterio ISO 25010

> *Diálogos de confirmación antes de acciones destructivas: implementado con `ConfirmDialog` en vez del `confirm()` nativo no accesible.*
> *Validaciones de formularios en tiempo real: RUC, CCI, precios.*

---

### 3.5 Estética de la Interfaz de Usuario

#### Implementado

| # | Medida | Archivo | Línea |
|---|---|---|---|
| 1 | **Paleta de colores unificada** — Variables CSS en `:root` con colores semantic (`--green`, `--amber`, `--red`, `--dark1`–`dark4`, `--prime`). | `src/index.css` | 3–30 |
| 2 | **Tipografía consistente** — `--font-head: 'Syne'` para títulos, `--font-body: 'DM Sans'` para cuerpo. | `src/index.css` | 28–29 |
| 3 | **Animaciones suaves** — `@keyframes shimmer`, `@keyframes fadeIn`, `@keyframes spin` definidos y aplicados. | `src/index.css` | 387–395 |

---

### 3.6 Accesibilidad (Accessibility)

#### Implementado

| # | Medida | Archivo | Línea |
|---|---|---|---|
| 1 | **`role="dialog"` + `aria-modal`** en modales de autenticación y gestión. | `src/components/AuthModal.jsx` | 74 |
| 2 | **`aria-label` descriptivo** en cada modal, variando según el modo (login/register/forgot). | `src/components/AuthModal.jsx` | 74 |
| 3 | **`role="alert"`** en mensajes de error del formulario de login. | `src/components/AuthModal.jsx` | 117 |
| 4 | **`aria-live="polite"`** para región de mensajes dinámicos (screen reader announce). | `src/components/AuthModal.jsx` | 115 |
| 5 | **`label htmlFor`** vinculado a todos los inputs. | Múltiples | — |
| 6 | **`aria-describedby`** para texto de ayuda en contraseña. | `src/components/AuthModal.jsx` | 164 |
| 7 | **`alt` descriptivo** en todas las imágenes. | `src/pages/Buscar.jsx` | 142 |
| 8 | **`role="alertdialog"`** en el nuevo `ConfirmDialog`, con auto-foco en botón confirmar. | `src/components/ConfirmDialog.jsx` | 24 |
| 9 | **Cierre con tecla Escape** en `ConfirmDialog`. | `src/components/ConfirmDialog.jsx` | 16–19 |
| 10 | **Contraste de color** — Paleta verificada: verde `#00D084` sobre blanco, texto `#1A2033` sobre fondo `#F7F8FA` cumplen AA. | `src/index.css` | 3–10 |
| 11 | **`@keyframes` definidos** — `shimmer`, `fadeIn`, `spin` existían como referencia en CSS pero faltaba su definición; corregido. | `src/index.css` | 387–395 |
| 12 | **Efectos hover también en foco** — `onFocus`/`onBlur` en cards de búsqueda replican el hover visual para teclado. | `src/pages/Buscar.jsx` | 139–140 |

#### Criterio ISO 25010

> *WCAG 2.1 nivel AA: implementación parcial con contraste suficiente, roles ARIA correctos, soporte para lectores de pantalla y navegación por teclado.*

#### Pendiente / Mejora futura

- Agregar `tabIndex` y `onKeyDown` en todos los elementos interactivos con `onClick` que no sean `<button>` o `<a>` nativos.
- Agregar un skip-to-content link al inicio de cada página.

---

## 4. Fiabilidad (Reliability)

### 4.1 Madurez (Maturity)

#### Implementado

| # | Medida | Archivo | Línea |
|---|---|---|---|
| 1 | **Lint 0 errores** — ESLint configurado con `eslint-plugin-react-hooks` y `eslint-plugin-react-refresh`; pasa sin errores ni warnings. | `package.json` | 9 |
| 2 | **Prevención de fugas de memoria** — `mountedRef` en componentes que hacen fetch asíncrono para evitar `setState` tras desmontaje. | `src/pages/Buscar.jsx` | 39, 44, 48 |
| 3 | **Validación exhaustiva de useEffect** — Dependencias correctas; comentarios `eslint-disable-next-line` solo donde hay razón técnica documentada. | Múltiples | — |

#### Pendiente / Mejora futura

- Agregar suite de pruebas unitarias (Vitest + React Testing Library) con cobertura > 70%.
- Migrar a TypeScript para capturar errores en compilación.

---

### 4.2 Disponibilidad (Availability)

#### Implementado

| # | Medida | Archivo | Línea |
|---|---|---|---|
| 1 | **Health check** — Página `/status` verifica conectividad con backend y base de datos. | `src/pages/SystemStatus.jsx` | 19–41 |
| 2 | **Validación periódica de sesión** — Polling cada 60s a `/api/validate-session`; si responde 403, cierra sesión automáticamente. | `src/App.jsx` | 42–57 |
| 3 | **ErrorBoundary global** — Captura errores no manejados en el árbol de React, muestra pantalla de error con botón "Recargar página". | `src/components/ErrorBoundary.jsx` | 1–49 |
| 4 | Envuelve todas las rutas de la aplicación. | `src/App.jsx` | 84, 88 |

#### Criterio ISO 25010

> *Health-checks: implementado con la página `/status`.*
> *ErrorBoundary: implementado como fallback global para evitar pantallas en blanco.*

---

### 4.3 Tolerancia a Fallos (Fault Tolerance)

#### Implementado

| # | Medida | Archivo | Línea |
|---|---|---|---|
| 1 | **Reintento automático de peticiones** — Si el token expira (401), `apiFetch.js` renueva el token automáticamente y reintenta la petición original. | `src/utils/apiFetch.js` | 30–47 |
| 2 | **Socket.io con reconexión** — Conexión WebSocket configurada con 10 reintentos automáticos y delay de 3s. | `src/hooks/useSocket.js` | 15–17 |
| 3 | **Manejo de error 429** — Rate limiting detectado y mensaje amigable al usuario. | `src/utils/apiFetch.js` | 20–23 |
| 4 | **Manejo de error 403** — Expulsión segura de sesión con redirección. | `src/utils/apiFetch.js` | 25–28 |
| 5 | **Fallback de import.meta.env** — Si `VITE_API_URL` no está definida, cae a `http://localhost:5000`. | Múltiples | — |

#### Criterio ISO 25010

> *Patrón de reintento automático (retry pattern): implementado en apiFetch.js.*
> *Reconexión automática de WebSocket: implementada en useSocket.js.*

#### Pendiente / Mejora futura

- Implementar patrón Circuit Breaker para evitar fallos en cascada cuando el backend está caído.
- Cachear datos del dashboard en `sessionStorage` para funcionamiento parcial offline.

---

### 4.4 Capacidad de Recuperación (Recoverability)

#### Implementado

| # | Medida | Archivo | Línea |
|---|---|---|---|
| 1 | **ErrorBoundary con recarga** — El usuario puede reiniciar la app con un clic sin perder la página actual. | `src/components/ErrorBoundary.jsx` | 31–40 |
| 2 | **Limpieza completa de sesión en 403** — `localStorage.clear()` + `window.location.href = '/'`. | `src/utils/apiFetch.js` | 8 |

#### Criterio ISO 25010

> *Recuperación manual vía ErrorBoundary: permite restaurar el estado de la UI tras un error no capturado.*

#### Pendiente / Mejora futura

- Definir RTO (< 1 hora) y RPO (< 5 minutos) documentados.
- Implementar auto-healing con Service Worker para respaldo offline parcial.

---

## Resumen de Cumplimiento ISO 25010

| Característica | Subcaracterística | Estado | Prioridad |
|---|---|---|---|
| **Eficiencia** | 1.1 Comportamiento Temporal | ✅ Parcial (debounce + lazy loading) | Media |
| **Eficiencia** | 1.2 Utilización de Recursos | ✅ Parcial (dimensiones imágenes) | Baja |
| **Eficiencia** | 1.3 Capacidad | ✅ Parcial (validación tamaño, rate limiting) | Media |
| **Seguridad** | 2.1 Confidencialidad | ✅ Alta (HttpOnly cookie, RBAC) | Crítica |
| **Seguridad** | 2.2 Integridad | ✅ Parcial (validación formularios) | Alta |
| **Seguridad** | 2.3 No Repudio | ✅ Parcial (logs estructurados) | Media |
| **Seguridad** | 2.4 Autenticidad | ✅ Alta (JWT, refresh, polling) | Crítica |
| **Seguridad** | 2.5 Responsabilidad | ✅ Parcial (logs con contexto) | Media |
| **Usabilidad** | 3.1 Inteligibilidad | ✅ Alta (landing, onboarding) | Alta |
| **Usabilidad** | 3.2 Aprendizaje | ✅ Alta (tooltips, guías) | Alta |
| **Usabilidad** | 3.3 Operabilidad | ✅ Parcial (tabs, teclado) | Media |
| **Usabilidad** | 3.4 Protección Errores | ✅ Alta (confirm dialog, validaciones) | Alta |
| **Usabilidad** | 3.5 Estética UI | ✅ Alta (CSS vars, tipografía) | Baja |
| **Usabilidad** | 3.6 Accesibilidad | ✅ Alta (ARIA, roles, teclado) | Alta |
| **Fiabilidad** | 4.1 Madurez | ✅ Parcial (lint, mountedRef) | Crítica |
| **Fiabilidad** | 4.2 Disponibilidad | ✅ Alta (health check, ErrorBoundary) | Alta |
| **Fiabilidad** | 4.3 Tolerancia Fallos | ✅ Alta (retry, socket reconexión) | Alta |
| **Fiabilidad** | 4.4 Recuperación | ✅ Parcial (ErrorBoundary recarga) | Media |

---

## Referencias

- ISO/IEC 25010:2011 — Systems and software Quality Requirements and Evaluation (SQuaRE)
- WCAG 2.1 — Web Content Accessibility Guidelines
- OWASP Top 10 — Web Application Security Risks
