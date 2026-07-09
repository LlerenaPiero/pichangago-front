# Instructivo — PichangaGo

## Arquitectura de páginas

| Página | Rol |
|---|---|
| `/` (Home) | Capturar intención, generar confianza, preview de canchas |
| `/buscar` | Filtrar, comparar y elegir cancha con herramientas completas |
| `/cancha/:id` | Detalle, horarios y reserva |
| `/mis-reservas` | Gestión del usuario |

Home y `/buscar` están separados con roles distintos. El Home envía a `/buscar` con parámetros.

---

## Home (`/`)

### Archivos involucrados

- `src/pages/Home.jsx` — Componente principal
- `src/index.css` — Estilos
- `src/components/Navbar.jsx` — Barra de navegación
- `src/services/canchaService.js` — Llamadas al backend
- `src/utils/imageUrl.js` — Utilidad para resolver URLs de imágenes

### Flujo de carga

1. **Geolocalización** — Al montar, se intenta obtener la ubicación del usuario. Si se obtiene, se envía `lat` y `lng` al backend para ordenar por cercanía.
2. **Carga de canchas** — Se llama a `listarCanchas(filtros)`. La respuesta esperada: `{ status: 'success', data: [...] }`.
3. **Carga de ofertas** — Se llama a `obtenerOfertasHoy()`. Si no hay ofertas, no se muestra la sección.

### Componentes visuales

#### 1. Hero + buscador rápido

```
Reserva una cancha cerca de ti
Elige horario, paga con Yape y recibe confirmación inmediata.

[Ubicación (text)] [Fecha (date)] [Hora (time)] [Buscar disponibles (btn)]
```

- **Ubicación**: texto libre → se envía como `nombre`
- **Fecha**: date picker, default hoy → se envía como `fecha`
- **Hora**: opcional → se envía como `hora`
- **Botón "Buscar disponibles"**: redirige a `/buscar?nombre=...&fecha=...&hora=...`

No tiene filtros avanzados (precio, ordenar, rating, tipo). Eso está en `/buscar`.

#### 2. Trust badges

Tres badges: Disponibilidad actualizada · Pago con Yape · Comprobante inmediato

#### 3. Sección dinámica

- Si hay ofertas (`ofertas.length > 0`): se muestra **"Ofertas de último minuto"**
- Si NO hay ofertas (y hay canchas): se muestra **"Disponibles hoy cerca de ti"** con 4 cards + "Ver todas las canchas"

La sección de ofertas nunca se muestra vacía. Si no hay datos, se reemplaza por valor.

#### 4. Canchas recomendadas

Preview de **4 canchas máximo** en un grid. Debajo, un botón **"Ver todas las canchas →"** que redirige a `/buscar`.

Cada card incluye:
- Imagen
- Distrito, nombre, descripción/tipo
- Precio por hora
- Rating redondeado a 1 decimal (`4.2 ★ (394)`)
- CTA "Ver horarios" en hover

#### 5. Cómo funciona

3 pasos: Busca → Elige horario → Paga y juega

---

## Búsqueda (`/buscar`)

### Archivos involucrados

- `src/pages/Buscar.jsx`
- `src/index.css`
- `src/services/canchaService.js`

### Flujo

1. Recibe parámetros desde Home (o desde URL directa).
2. Filtra en tiempo real con debounce de 300 ms.
3. Muestra resultados con disponibilidad y CTA.

### Filtros

| Campo | Tipo | Notas |
|---|---|---|
| Buscar | texto | Cancha, distrito o dirección |
| Distrito | select | Lista de distritos de Lima |
| Fecha | date | Default hoy |
| Hora | select | 06:00 - 23:00, opcional |
| Tipo de cancha | select | Fútbol 5/6/7/8/11 |
| Precio máx | number | Opcional |
| Ordenar | select | Recomendadas, Menor precio, Mejor valoradas, Nombre |

No incluye Precio mínimo (se eliminó por ser de utilidad dudosa).

### Cards de resultado

Cada card incluye:
- Imagen, nombre, ubicación
- Tags: tipo de cancha, hora valle, hora punta
- Rating redondeado con reseñas
- Precio por hora
- CTA **"Ver horarios"** (botón verde visible siempre)

---

## Backend endpoints requeridos

| Endpoint | Método | Parámetros | Respuesta |
|---|---|---|---|
| `/api/canchas` | GET | `nombre, distrito, precioMax, lat, lng, fecha, hora, tipo` | `{ status: 'success', data: [...] }` |
| `/api/canchas/ofertas-hoy` | GET | — | `{ status: 'success', data: [...] }` |

---

## Estados de carga

**Home:**
- Canchas: 4 skeletons animados
- Ofertas: 3 skeletons pequeños (solo si está cargando)
- Vacío: "No hay canchas disponibles en este momento."

**Buscar:**
- 3 skeletons tipo card horizontal
- Vacío: "No encontramos canchas con esos filtros" + botón "Restablecer filtros"
- Error: mensaje de error del backend

---

## Geolocalización

Tanto Home como Buscar pueden enviar `lat` y `lng`. El backend debe:
1. Recibir `lat` y `lng` como query params.
2. Calcular distancia (haversine).
3. Ordenar por cercanía.
4. Requiere coordenadas (`Latitud`, `Longitud`) en la tabla `Local`.

---

## Notas

- La hora es opcional en ambos lados.
- El tipo de cancha se eliminó del Home (los usuarios ajustan según los jugadores disponibles), pero está en `/buscar`.
- Precio mínimo no está en ninguna de las dos páginas.
- El botón de búsqueda en Home ocupa ancho completo en mobile.
- Navbar: "Ver canchas" reemplazó a "Buscar canchas". "Inicio" se eliminó como botón destacado.