# Principios WAVE / WCAG — PichangaGo Frontend

> **Estándar**: WCAG 2.1 (Web Content Accessibility Guidelines)
> **Nivel objetivo**: AA
> **Herramienta de referencia**: WAVE Web Accessibility Evaluation Tool

---

## 1. Perceptible (Perceivable)

### 1.1 Alternativas textuales

| Requisito | Implementación | Archivo |
|-----------|---------------|---------|
| `alt` descriptivo en imágenes | ✅ Todas las `<img>` tienen `alt` | `Buscar.jsx:142`, `ModalGestionCancha.jsx:407` |
| `aria-label` en modales | ✅ Todos los modales tienen `aria-label` descriptivo que varía según contexto | `AuthModal.jsx:74`, `ModalGestionCancha.jsx:223`, `ModalDetalleReserva.jsx:27`, `ConfirmDialog.jsx:28` |
| `title` en inputs complejos | ✅ Inputs con `title` para instrucción adicional | `AuthModal.jsx:134,138,147,164` |
| `aria-describedby` en campos con ayuda | ✅ Vincula mensajes de ayuda contextual | `AuthModal.jsx:164` |

### 1.2 Contenido adaptable

| Requisito | Implementación | Archivo |
|-----------|---------------|---------|
| La información no se pierde al redimensionar | ✅ CSS responsivo con `clamp()`, `min-width`, `flex-wrap` | `index.css` |
| Diseño responsivo hasta 320px | ✅ Grid y flexbox adaptativos; media queries en navbar | `index.css:476-482` |
| Texto redimensionable sin pérdida | ✅ Uso de unidades relativas (`rem`, `%`) y `clamp()` | `index.css:60` |

### 1.3 Contraste y uso del color

| Requisito | Implementación | Archivo |
|-----------|---------------|---------|
| Contraste ≥ 4.5:1 (texto normal) | ✅ Variables CSS verificadas: `#1A2033` sobre `#F7F8FA` = 14.2:1; `#00D084` sobre blanco = 2.3:1 (solo para íconos/decoración) | `index.css:3-30` |
| Contraste ≥ 3:1 (texto grande) | ✅ | — |
| Información no depende solo del color | ✅ Estados de slots usan íconos + color + etiqueta textual (✅, 🔒, 🔥, 🚫) | `COLOR_MAP` en `colorMap.js` |
| `:focus-visible` con outline verde | ✅ Outline 2px `var(--green)` en todos los elementos interactivos | `index.css` |

### 1.4 Multimedia

| Requisito | Implementación |
|-----------|---------------|
| Animaciones respetan `prefers-reduced-motion` | ⚠️ Pendiente — agregar `@media (prefers-reduced-motion: no-preference)` |

---

## 2. Operable (Operable)

### 2.1 Teclado

| Requisito | Implementación | Archivo |
|-----------|---------------|---------|
| Todas las funcionalidades accesibles por teclado | ✅ Botones, enlaces, inputs nativos funcionan con Tab/Enter |
| Navegación por flechas en tabs | ✅ PanelDueno tabs: flechas izquierda/derecha con `tabIndex` dinámico | `PanelDueno.jsx:133` |
| Navegación por flechas en tabs de reportes | ✅ ReportesDueno: flechas izquierda/derecha | `ReportesDueno.jsx:18` |
| `onKeyDown` en cards expandibles | ✅ AgendaDueno: Enter/Espacio para expandir/colapsar | `AgendaDueno.jsx:424`, `AgendaDueno.jsx:536` |
| `onFocus`/`onBlur` en hover cards | ✅ Buscar.jsx: hover effects replicados para teclado | `Buscar.jsx:139-140` |
| Escape cierra modales | ✅ ConfirmDialog con `keydown Escape` | `ConfirmDialog.jsx:16-19` |
| Skip-to-content link | ✅ "Saltar al contenido principal" visible al recibir foco | `App.jsx` |

### 2.2 Tiempo suficiente

| Requisito | Implementación |
|-----------|---------------|
| Sesión expira con aviso | ✅ Polling de `validate-session` cada 60s; redirect automático en 403 |
| Sin límites de tiempo restrictivos en formularios | ✅ No hay timeouts forzados en formularios |

### 2.3 Navegación

| Requisito | Implementación | Archivo |
|-----------|---------------|---------|
| `role="navigation"` en navbar | ✅ `<nav className="navbar">` — semántico por defecto |
| `role="main"` en contenido principal | ✅ `<main id="main-content">` | `App.jsx` |
| `role="tablist"` + `role="tab"` en tabs | ✅ PanelDueno, ReportesDueno, ModalGestionCancha | Múltiples |
| Jerarquía de encabezados (h1 > h2 > h3...) | ✅ h1 implícito en hero, h2 secciones, h3 paneles | — |

---

## 3. Comprensible (Understandable)

### 3.1 Legibilidad

| Requisito | Implementación | Archivo |
|-----------|---------------|---------|
| Idioma declarado | ⚠️ Pendiente — agregar `lang="es"` en `<html>` | `index.html` |
| Texto en español | ✅ Todos los textos de UI están en español | — |
| Errores descriptivos en español | ✅ Mensajes como "⚠️ Credenciales incorrectas. (2/3 intentos)" | — |

### 3.2 Predecible

| Requisito | Implementación | Archivo |
|-----------|---------------|---------|
| Comportamiento consistente | ✅ Botones de acción principal siempre en misma posición | — |
| Links con texto descriptivo | ✅ "Inicio", "Buscar canchas", "Panel Dueño", etc. | — |
| Sin apertura de nuevas ventanas sin aviso | ✅ No se usan `target="_blank"` sin advertencia | — |

### 3.3 Asistencia en entrada de datos

| Requisito | Implementación | Archivo |
|-----------|---------------|---------|
| `label` asociado a inputs | ✅ Todos los inputs tienen `<label htmlFor="">` | Múltiples |
| `aria-required="true"` en campos obligatorios | ✅ | `AuthModal.jsx` |
| `aria-describedby` para mensajes de ayuda | ✅ | `AuthModal.jsx:164` |
| Validación en tiempo real con mensajes claros | ✅ RUC, CCI, email, contraseña validados client-side | `ConfigDueno.jsx:34-39`, `PanelDueno.jsx:79-85` |
| Botón submit deshabilitado durante carga | ✅ | `AuthModal.jsx:180` |

---

## 4. Robusto (Robust)

### 4.1 Compatibilidad

| Requisito | Implementación |
|-----------|---------------|
| HTML semántico | ✅ Uso de `<nav>`, `<main>`, `<form>`, `<table>`, `<button>` |
| ARIA roles correctos | ✅ `dialog`, `alertdialog`, `tablist`, `tab`, `alert`, `status`, `button` |
| `aria-modal="true"` en diálogos | ✅ Todos los modales |
| `aria-selected` en tabs | ✅ PanelDueno, ReportesDueno, ModalGestionCancha |
| `aria-expanded` en acordeones | ✅ AgendaDueno (vista semanal y diaria) |
| `aria-live="polite"` en regiones dinámicas | ✅ PanelDueno mensajes, ConfigDueno mensajes |
| `role="status"` en loaders | ✅ Dashboard, Agenda, PanelDueno loading |

---

## 5. Resumen de estado por componente (módulo dueño)

| Componente | WAVE Pasos | Pendiente |
|------------|-----------|-----------|
| `Navbar.jsx` | Skip-link, teclado, roles, aria-label hamburguesa, logout con confirmación | — |
| `AuthModal.jsx` | ARIA dialog, `aria-live`, `role="alert"`, `label`/`aria-required`, teclado, bloqueo | — |
| `PanelDueno.jsx` | `role="tablist"`, flechas teclado, `aria-live`, `role="alert"`, tabs `tabIndex` dinámico | — |
| `DashboardDueno.jsx` | `role="status"` en loading, jerarquía headings | — |
| `AgendaDueno.jsx` | `role="button"`, `aria-expanded`, `tabIndex`, `onKeyDown`, `role="status"` loading | — |
| `ModalGestionCancha.jsx` | `role="dialog"`, `role="tablist"`, `aria-label`, `label` inputs | — |
| `ModalDetalleReserva.jsx` | `role="dialog"`, `aria-label` | — |
| `ConfirmDialog.jsx` | `role="alertdialog"`, auto-foco, Escape, `aria-label` | — |
| `ReportesDueno.jsx` | `role="tablist"`, flechas teclado, `tabIndex` dinámico | — |
| `ConfigDueno.jsx` | `aria-live`, `role="alert"`, validación RUC/CCI | — |
| `DuenoOnboarding.jsx` | `label`/`aria-describedby`, `role="alert"` mensajes | — |
| `GestionLocales.jsx` | (leer si aplica) | Pendiente revisión |
| `ErrorBoundary.jsx` | `role="alert"`, botón recarga accesible | — |
| `index.css` | `:focus-visible` outlines, variables contraste, animaciones | `prefers-reduced-motion` |

---

## Pendientes globales

- [ ] Agregar `lang="es"` al `<html>` en `index.html`
- [ ] Agregar `@media (prefers-reduced-motion)` para respetar preferencias de animación
- [ ] Agregar `aria-label` faltantes en botones de solo ícono (ej: ◀ ▶ en agenda)
- [ ] Revisar `GestionLocales.jsx`, `ModalNuevaCancha.jsx` para roles ARIA
