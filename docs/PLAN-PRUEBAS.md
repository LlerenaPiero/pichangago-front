# Plan de Pruebas — PichangaGo

## 1. Objetivo

Definir las herramientas, tipos de prueba y estrategia para validar la plataforma PichangaGo (frontend + backend).

---

## 2. Herramientas seleccionadas

### 2.1 Pruebas E2E — Playwright + BDD

| Aspecto | Detalle |
|---------|---------|
| **Herramienta** | Playwright + `playwright-bdd` |
| **Descripción** | Framework de automatización multiplataforma de Microsoft. Soporta Chromium, Firefox y WebKit (Safari). Incluye `page.route()` para mockear APIs y `playwright-bdd` para escribir escenarios en Gherkin. |
| **Contexto de uso** | Navegador headless/headful, simulando interacciones reales del usuario en la web. Los tests se escriben en archivos `.feature` (Gherkin) y los step definitions se implementan con la API de Playwright. |
| **Para qué sirve** | Validar flujos completos de Jugador y Dueño desde la UI: registro, login, búsqueda, reserva, gestión de canchas, etc. |
| **Qué nos muestra** | • Reporte HTML con cada paso detallado<br>• Video de la ejecución (útil para debuggear fallos)<br>• Trazas de red (API calls que hizo el test)<br>• Tiempo de cada paso<br>• Screenshots en cada paso o en fallos |

---

### 2.2 Pruebas de API — Postman

| Aspecto | Detalle |
|---------|---------|
| **Herramienta** | Postman + Newman (CLI) |
| **Descripción** | Cliente HTTP con interfaz gráfica para diseñar, guardar y ejecutar requests. Permite crear colecciones de endpoints, variables de entorno, scripts Pre-request/Test y generar reportes. Newman ejecuta las colecciones desde terminal (útil para CI/CD). |
| **Contexto de uso** | Construir peticiones HTTP a `https://pichangago-back.onrender.com`, definir variables de entorno (URL base, tokens), y escribir tests en Postman para validar códigos de estado, estructura JSON y tiempos de respuesta. |
| **Para qué sirve** | Validar que los endpoints del backend responden correctamente antes de escribir los tests E2E. Sirve como documentación viva de la API. |
| **Qué nos muestra** | • Status code (200, 201, 400, 401, 403, 404, 500)<br>• Tiempo de respuesta (ms)<br>• Cuerpo de la respuesta (JSON)<br>• Headers (CORS, Content-Type, Set-Cookie)<br>• Resultado de tests assertions (pass/fail)<br>• Reporte HTML con Newman |

---

### 2.3 Pruebas unitarias y de componentes — Vitest

| Aspecto | Detalle |
|---------|---------|
| **Herramienta** | Vitest + React Testing Library |
| **Descripción** | Framework de testing nativo de Vite (usa el mismo `vite.config.js` y el mismo bundler esbuild). Es compatible con la API de Jest pero más rápido. React Testing Library permite renderizar componentes y probar el comportamiento desde la perspectiva del usuario (clics, escritura, navegación). |
| **Contexto de uso** | Se ejecutan en Node.js con jsdom (simula un navegador sin interfaz). Cada archivo de test importa el componente, lo renderiza, y simula interacciones. Se ejecutan con `npx vitest`. |
| **Para qué sirve** | Probar componentes individuales de forma aislada: validar que `AuthModal` muestra errores, que `CanchaDetail` calcula precios, que `Navbar` muestra los links correctos según el rol. |
| **Qué nos muestra** | • Tests pasaron/fallaron<br>• Cobertura de código (líneas, funciones, ramas)<br>• Tiempo de ejecución por test<br>• Tiempo real de renderizado del componente<br>• Errores de accesibilidad (aria-* faltantes, roles incorrectos)<br>• Errores de consola de React |

---

### 2.4 Pruebas de carga — k6

| Aspecto | Detalle |
|---------|---------|
| **Herramienta** | k6 (Grafana) |
| **Descripción** | Herramienta de testing de carga open-source escrita en Go, con scripting en JavaScript. Soporta miles de usuarios virtuales concurrentes con bajo consumo de recursos. Se integra con Prometheus/Grafana para métricas en tiempo real. |
| **Contexto de uso** | Se escribe un script en JavaScript que define el flujo de un usuario virtual (login → buscar cancha → ver detalle → reservar). Se ejecuta desde terminal con `k6 run script.js` simulando 50, 100, 500 usuarios concurrentes. |
| **Para qué sirve** | Medir cómo se comporta el backend bajo estrés: tiempos de respuesta, tasa de errores, cuellos de botella. Útil antes de campañas de marketing o fines de semana con alta demanda. |
| **Qué nos muestra** | • Tiempo de respuesta promedio, percentiles p50/p95/p99 (ms)<br>• Tasa de requests por segundo (RPS)<br>• Tasa de errores HTTP (4xx, 5xx)<br>• Usuarios virtuales concurrentes (VU)<br>• Duración mínima, máxima y promedio por petición<br>• Reporte HTML con gráficas de evolución en el tiempo |

---

### 2.5 Pruebas de accesibilidad — WAVE

| Aspecto | Detalle |
|---------|---------|
| **Herramienta** | WAVE (Web Accessibility Evaluation Tool) — extensión de navegador |
| **Descripción** | Extensión para Chrome/Firefox desarrollada por WebAIM. Analiza la página web en vivo y superpone iconos y colores directamente sobre el DOM para mostrar errores de accesibilidad: contraste bajo, etiquetas faltantes, estructura de encabezados, roles ARIA, etc. |
| **Contexto de uso** | Navegar a cada página de la aplicación (Home, Buscar, Detalle, Mis Reservas, Panel Dueño) y hacer clic en el icono de WAVE en la barra de extensiones. Genera un reporte visual in-situ. |
| **Para qué sirve** | Detectar problemas de accesibilidad WCAG 2.1 AA de forma visual e inmediata: contraste de colores, etiquetas de formularios, estructura semántica, textos alternativos. |
| **Qué nos muestra** | • **Errores** (ícono rojo): contraste insuficiente, labels faltantes, botones sin texto<br>• **Alertas** (ícono naranja): posibles problemas como títulos vacíos o encabezados saltados<br>• **Elementos accesibles** (ícono verde): landmarks ARIA, encabezados, listas<br>• **Estructura**: outline de los encabezados (h1→h6), roles ARIA, puntos de referencia<br>• **Contraste**: cálculo exacto de ratio de contraste para cada par de colores |

---

### 2.6 Pruebas de seguridad — OWASP ZAP

| Aspecto | Detalle |
|---------|---------|
| **Herramienta** | OWASP ZAP (Zed Attack Proxy) |
| **Descripción** | Escáner de seguridad web open-source mantenido por OWASP. Funciona como proxy de interceptación entre el navegador y el servidor. Tiene modos: pasivo (solo observa) y activo (inyecta payloads maliciosos). Incluye spider automático para descubrir rutas. |
| **Contexto de uso** | Se configura ZAP como proxy, se navega manualmente por la aplicación para que ZAP registre el tráfico, luego se ejecuta el escaneo activo. También se puede automatizar desde CLI con `zap-cli` o desde Docker para CI/CD. |
| **Para qué sirve** | Detectar vulnerabilidades de seguridad comunes: SQL injection, XSS, CSRF, falta de headers de seguridad (CSP, HSTS), exposición de información sensible, autenticación débil. |
| **Qué nos muestra** | • **Alto riesgo**: SQL injection, XSS reflejado/persistente, inyección de comandos<br>• **Medio riesgo**: falta de headers de seguridad, cookies sin SameSite, CORS permisivo<br>• **Bajo riesgo**: información de versión expuesta, falta de Content-Type, autocomplete en campos sensibles<br>• **Alertas informativas**: comentarios HTML expuestos, métodos HTTP permitidos (TRACE, OPTIONS)<br>• Reporte HTML/PDF/XML con cada alerta clasificada por riesgo, URL afectada y recomendación de mitigación |

---

## 3. Estrategia y prioridades

```
Tipo                Herramienta          Prioridad    Fase
─────────────────────────────────────────────────────────────
E2E                 Playwright + BDD     🔴 Alta     Fase 1 (38 escenarios)
API                 Postman + Newman     🟡 Media    Fase 1 (validar endpoints)
Unit / Component    Vitest + RTL         🟡 Media    Fase 2 (componentes críticos)
Carga               k6                   🟢 Baja     Fase 3 (cuando escale)
Accesibilidad       WAVE                 🟢 Baja     Fase 2 (revisión manual)
Seguridad           OWASP ZAP            🟢 Baja     Fase 3 (antes de produccion)
```

---

## 4. Instalación y configuración

### 4.1 Playwright + BDD

```bash
# Instalar Playwright
npm install -D @playwright/test
npx playwright install

# Instalar playwright-bdd para Gherkin
npm install -D playwright-bdd

# Instalar tipos (opcional pero recomendado)
npm install -D @types/node
```

**Scripts en `package.json`:**
```json
{
  "scripts": {
    "test:e2e": "npx bddgen && npx playwright test",
    "test:e2e:ui": "npx bddgen && npx playwright test --ui",
    "test:e2e:debug": "npx bddgen && npx playwright test --debug"
  }
}
```

**Estructura de carpetas:**
```
tests/
├── features/
│   ├── shared/
│   │   ├── registro.feature
│   │   ├── login.feature
│   │   ├── recuperacion.feature
│   │   └── cierre-sesion.feature
│   ├── jugador/
│   │   ├── explorar.feature
│   │   ├── detalle-cancha.feature
│   │   ├── reservar.feature
│   │   ├── mis-reservas.feature
│   │   └── cancelar.feature
│   └── dueno/
│       ├── perfil.feature
│       ├── financiero.feature
│       ├── locales.feature
│       ├── canchas.feature
│       ├── horarios.feature
│       ├── dashboard.feature
│       └── agenda.feature
├── step_definitions/
│   ├── shared/
│   ├── jugador/
│   └── dueno/
├── fixtures/
│   ├── usuarios.json
│   ├── canchas.json
│   └── reservas.json
├── support/
│   └── mocks/
│       ├── auth.ts
│       ├── canchas.ts
│       ├── reservas.ts
│       └── dueno.ts
├── playwright.config.ts
└── tsconfig.json
```

**`playwright.config.ts` básico:**
```ts
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/step_definitions',
  fullyParallel: true,
  retries: 1,
  use: {
    baseURL: 'http://localhost:5173',
    viewport: { width: 1280, height: 720 },
    actionTimeout: 10000,
  },
  projects: [
    { name: 'chromium', use: { browserName: 'chromium' } },
    { name: 'firefox', use: { browserName: 'firefox' } },
    { name: 'webkit', use: { browserName: 'webkit' } },
  ],
});
```

---

### 4.2 Postman

No requiere instalación desde terminal. Se descarga desde [postman.com/downloads](https://www.postman.com/downloads/).

```bash
# Para Newman (CLI), opcional:
npm install -g newman
```

**Configuración:**
1. Crear colección "PichangaGo API"
2. Definir variable de entorno `{{base_url}}` = `https://pichangago-back.onrender.com`
3. Agrupar endpoints por recurso: Auth, Canchas, Reservas, Dueño
4. Agregar tests en cada request (ej: `pm.response.to.have.status(200)`)

---

### 4.3 Vitest

```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom
```

**`vite.config.js` actualizado:**
```js
/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './tests/setup.js',
    css: true,
  },
})
```

**Scripts en `package.json`:**
```json
{
  "scripts": {
    "test": "vitest",
    "test:run": "vitest run",
    "test:coverage": "vitest run --coverage"
  }
}
```

**Estructura:**
```
tests/
├── setup.js          # Configuración global
└── components/
    ├── AuthModal.test.jsx
    ├── Navbar.test.jsx
    ├── CanchaDetail.test.jsx
    └── ...
```

---

### 4.4 k6

```bash
# Descargar e instalar desde https://k6.io/docs/get-started/installation/
# Windows (winget):
winget install k6

# O con chocolatey:
choco install k6

# Verificar instalación:
k6 version
```

**Script de ejemplo (`tests/load/login.js`):**
```js
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '30s', target: 20 },
    { duration: '1m', target: 20 },
    { duration: '30s', target: 0 },
  ],
  thresholds: {
    http_req_duration: ['p(95)<2000'],
    http_req_failed: ['rate<0.01'],
  },
};

export default function () {
  const res = http.post('https://pichangago-back.onrender.com/api/login', {
    email: 'test@example.com',
    password: 'test123',
  });
  check(res, { 'login success': (r) => r.status === 200 });
  sleep(1);
}
```

**Ejecución:**
```bash
k6 run tests/load/login.js
```

---

### 4.5 WAVE

1. Instalar la extensión desde Chrome Web Store: [WAVE Evaluation Tool](https://chrome.google.com/webstore/detail/wave-evaluation-tool/jbbplnpkjmmeebjpijfedlgcdilocofh)
2. Navegar a cualquier página de PichangaGo
3. Hacer clic en el icono de WAVE en la barra de extensiones
4. Revisar errores, alertas y estructura semántica

---

### 4.6 OWASP ZAP

```bash
# Opción 1: Descargar desde https://www.zaproxy.org/download/
docker pull ghcr.io/zaproxy/zaproxy:stable
```

**Uso básico:**
1. Iniciar ZAP (interfaz gráfica o con Docker)
2. Configurar proxy en el navegador: `localhost:8080`
3. Navegar por la aplicación para que ZAP registre el tráfico
4. Ejecutar escaneo activo desde la interfaz

---

## 5. Arquitectura E2E con Playwright + BDD

```
tests/
├── features/
│   ├── shared/
│   │   ├── registro.feature           # HU-01
│   │   ├── login.feature              # HU-02
│   │   ├── recuperacion.feature       # HU-03
│   │   └── cierre-sesion.feature      # HU-06
│   ├── jugador/
│   │   ├── explorar.feature           # HU-04
│   │   ├── detalle-cancha.feature     # HU-05
│   │   ├── reservar.feature           # HU-07
│   │   ├── mis-reservas.feature       # HU-08
│   │   └── cancelar.feature           # HU-09
│   └── dueno/
│       ├── perfil.feature             # HU-10
│       ├── financiero.feature         # HU-11
│       ├── locales.feature            # HU-13
│       ├── canchas.feature            # HU-14
│       ├── horarios.feature           # HU-15
│       ├── dashboard.feature          # HU-17
│       └── agenda.feature             # HU-18
├── step_definitions/
│   ├── shared/
│   │   ├── registro.ts
│   │   ├── login.ts
│   │   ├── recuperacion.ts
│   │   └── cierre-sesion.ts
│   ├── jugador/
│   │   ├── explorar.ts
│   │   ├── detalle-cancha.ts
│   │   ├── reservar.ts
│   │   ├── mis-reservas.ts
│   │   └── cancelar.ts
│   └── dueno/
│       ├── perfil.ts
│       ├── financiero.ts
│       ├── locales.ts
│       ├── canchas.ts
│       ├── horarios.ts
│       ├── dashboard.ts
│       └── agenda.ts
├── fixtures/
│   ├── usuarios.json
│   ├── canchas.json
│   └── reservas.json
├── support/
│   └── mocks/
│       ├── auth.ts
│       ├── canchas.ts
│       ├── reservas.ts
│       └── dueno.ts
├── playwright.config.ts
└── tsconfig.json
```

---

## 6. Plan de ejecución por fases

### Fase 1 — Prioridad Alta (ahora)

| Feature | Escenarios | Dependencias |
|---------|-----------|--------------|
| Registro | 4 | Mock API register |
| Login | 4 | Mock API login |
| Recuperación | 4 | Mock API forgot/reset password |
| Cierre sesión | 2 | Login previo + Mock API logout |
| Explorar canchas | 6 | Mock API canchas |
| Detalle cancha | 5 | Mock API canchas + slots |
| Mis reservas | 4 | Mock API reservas |
| Perfil dueño | 2 | Login dueño + Mock API perfil |
| Gestión locales | 2 | Login dueño + Mock API locales |
| Dashboard dueño | 2 | Login dueño + Mock API dashboard |
| Horarios y tarifas | 3 | Login dueño + Mock API horarios |
| **Total** | **38** | |

### Fase 2 — Prioridad Media

- Tests unitarios con Vitest para componentes críticos (`AuthModal`, `CanchaDetail`, `Navbar`)
- Postman: colección completa de endpoints
- WAVE: revisión de accesibilidad en todas las páginas

### Fase 3 — Prioridad Baja

- k6: script de carga para endpoints críticos (login, búsqueda, reserva)
- OWASP ZAP: escaneo de seguridad completo

---

## 7. Resumen

| Herramienta | Tipo | Instalación | Uso |
|-------------|------|-------------|-----|
| Playwright + BDD | E2E | `npm install -D @playwright/test playwright-bdd` | Tests con Gherkin desde navegador real |
| Postman + Newman | API | `npm install -g newman` + [postman.com](https://www.postman.com) | Validar endpoints y documentar API |
| Vitest + RTL | Unit/Component | `npm install -D vitest @testing-library/react` | Tests unitarios de componentes React |
| k6 | Carga | `winget install k6` o `choco install k6` | Simular usuarios concurrentes |
| WAVE | Accesibilidad | Extensión Chrome Web Store | Revisión visual de accesibilidad WCAG |
| OWASP ZAP | Seguridad | `docker pull zaproxy/zaproxy:stable` | Escaneo de vulnerabilidades |
