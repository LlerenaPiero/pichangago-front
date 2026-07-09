# Instructivo — Vista Home (PichangaGo)

## Archivos involucrados

- `src/pages/Home.jsx` — Componente principal
- `src/index.css` — Estilos (hero, search-bar, trust-badges, ofertas, cards, cómo funciona, footer)
- `src/components/Navbar.jsx` — Barra de navegación
- `src/services/canchaService.js` — Llamadas al backend
- `src/utils/imageUrl.js` — Utilidad para resolver URLs de imágenes

---

## Flujo de carga

1. **Geolocalización** — Al montar el componente, se intenta obtener la ubicación del usuario mediante `navigator.geolocation.getCurrentPosition`. Si se obtiene, se envía `lat` y `lng` como filtros al backend para ordenar por cercanía. Si el usuario rechaza o hay error, se cargan todas sin filtro geográfico.

2. **Carga de canchas** — Se llama a `canchaService.listarCanchas(filtros)` donde `filtros` puede contener `lat` y `lng`. La respuesta esperada tiene `{ status: 'success', data: [...] }`. Cada cancha tiene:
   - `ID_Cancha`, `Nombre`, `Distrito`, `Descripcion`, `Precio_Base`, `Rating`, `TotalReviews`, `Fotos[{URL_Foto}]`

3. **Carga de ofertas** — Se llama a `canchaService.obtenerOfertasHoy()`. La respuesta esperada tiene `{ status: 'success', data: [...] }`. Si no hay ofertas o hay error, no se muestra la sección.

---

## Componentes visuales

### 1. Hero (barra de búsqueda)

```
Título: "Reserva una cancha cerca de ti"
Subtítulo: "Elige horario, paga con Yape y recibe confirmación inmediata."

Campos:
  [Ubicación (text)]  [Fecha (date)]  [Hora (time)]  [Buscar disponibles (btn)]
```

- **Ubicación**: texto libre (ciudad, distrito o nombre de cancha). Se envía como `nombre` en la URL.
- **Fecha**: selector de fecha nativo. Default: hoy. Se envía como `fecha`.
- **Hora**: selector de hora nativo. Opcional. Se envía como `hora`.
- **Botón "Buscar disponibles"**: navega a `/buscar?nombre=...&fecha=...&hora=...`.

### 2. Trust badges

Tres badges debajo del buscador como señales de confianza:
- Disponibilidad actualizada
- Pago con Yape
- Comprobante inmediato

### 3. Ofertas de último minuto

Sección que **solo se muestra si `ofertas.length > 0`**. Si el array está vacío, no se renderiza nada (ni título, ni caja, ni esqueleto).

Cada oferta es una card horizontal con scroll:
- Imagen, distrito, nombre, horario, precio original (tachado), precio oferta, % descuento, minutos restantes
- Botón "Reservar" (navega a detalle de cancha)
- Toda la card es un `Link` a `/cancha/:id`

### 4. Canchas recomendadas

Título: "Canchas recomendadas cerca de ti"
Subtítulo: "Las mejores canchas para ti"

Se renderizan **todas** las canchas devueltas por el backend en un grid responsive. No hay límite de cards.

Cada card incluye:
- Imagen
- Distrito, nombre, descripción/tipo
- Precio por hora
- Rating redondeado a 1 decimal (formato: `4.2 ★ (394)`)
- CTA "Ver horarios" que aparece al hacer hover (centrado en la base de la card)

### 5. Cómo funciona

Tres pasos horizontales (en desktop):
1. Busca
2. Elige horario
3. Paga y juega

En mobile se apilan verticalmente y se ocultan los divisores.

### 6. Footer

Grid de 3 columnas: marca + soporte + legal. Barra inferior con copyright.

---

## Geolocalización

El Home intenta obtener la ubicación del usuario de forma **no bloqueante**:

```js
navigator.geolocation.getCurrentPosition(
  (pos) => setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
  () => {}, // error silencioso
  { timeout: 5000, enableHighAccuracy: false }
);
```

Si se obtienen coordenadas, se pasan al backend en `listarCanchas({ lat, lng })`.
El backend debe:
1. Recibir `lat` y `lng` como query params.
2. Calcular distancia con las canchas.
3. Ordenar por cercanía o filtrar por un radio (ej. 10 km).
4. Devolver las canchas ordenadas (más cercanas primero).

Si el usuario rechaza o hay timeout, se cargan todas sin orden geográfico.

---

## Backend endpoints requeridos

| Endpoint | Método | Parámetros | Respuesta |
|---|---|---|---|
| `/api/canchas` | GET | `?nombre= &distrito= &precioMin= &precioMax= &lat= &lng= &fecha= &hora= &tipo=` | `{ status: 'success', data: [...] }` |
| `/api/canchas/ofertas-hoy` | GET | — | `{ status: 'success', data: [...] }` |

---

## Estados de carga

- **Canchas**: mientras `loading=true`, se muestran skeletons (4 cards grises animadas).
- **Ofertas**: mientras `loadingOfertas=true` y no hay ofertas, se muestran 3 skeletons pequeños.
- **Error**: si `canchas.length === 0` después de cargar, se muestra "No hay canchas disponibles en este momento."

---

## Pendientes / Notas

- La hora en el buscador es opcional. Si no se selecciona, no se envía el parámetro.
- El tipo de cancha se eliminó del Home porque los usuarios ajustan según los jugadores disponibles.
- El botón "Buscar disponibles" ocupa todo el ancho en mobile.
- La geolocalización necesita implementación del lado del backend para recibir `lat`/`lng` y ordenar/filtrar.
