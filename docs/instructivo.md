# Instructivo — PichangaGo (para backend)

## Arquitectura de páginas

| Página | Rol |
|---|---|
| `/` (Home) | Capturar intención, generar confianza, mostrar todas las canchas según ubicación |
| `/buscar` | Filtrar, comparar y elegir cancha con herramientas completas |
| `/cancha/:id` | Detalle, horarios y reserva |
| `/mis-reservas` | Gestión del usuario |

El Home envía a `/buscar` con parámetros vía URL.

---

## Endpoints requeridos

### `GET /api/canchas`

Lista canchas con filtros opcionales. El frontend envía los que tenga disponibles.

| Parámetro | Tipo | Desde | Ejemplo |
|---|---|---|---|
| `nombre` | string | Home y Buscar | `?nombre=los+olivos` |
| `distrito` | string | Buscar | `?distrito=Miraflores` |
| `precioMax` | number | Buscar | `?precioMax=80` |
| `fecha` | string (YYYY-MM-DD) | Home y Buscar | `?fecha=2026-07-09` |
| `hora` | string (HH:mm) | Home y Buscar | `?hora=20:00` |
| `tipo` | string | Buscar | `?tipo=Fútbol+7` |
| `lat` | number | Home (geolocalización) | `?lat=-12.0464` |
| `lng` | number | Home (geolocalización) | `?lng=-77.0428` |

**Respuesta esperada:**
```json
{
  "status": "success",
  "data": [
    {
      "ID_Cancha": 1,
      "Nombre": "Cancha del viernes",
      "Distrito": "Los Olivos",
      "Direccion": "Av. Central 123",
      "Descripcion": "Fútbol 7 · Grass sintético",
      "Tipo_Deporte": "Fútbol 7",
      "Precio_Base": 70.00,
      "Precio_Baja": 50.00,
      "Precio_Prime": 90.00,
      "Rating": 4.2,
      "TotalReviews": 126,
      "Fotos": [{ "URL_Foto": "/uploads/cancha1.jpg" }]
    }
  ]
}
```

### `GET /api/canchas/ofertas-hoy`

Sin parámetros. Si no hay ofertas activas, responder con `{ "status": "success", "data": [] }` (array vacío). No debe devolver error ni mensaje, el frontend oculta la sección automáticamente.

---

## Comportamiento esperado del backend

### Geolocalización
- El frontend envía `lat` y `lng` cuando el usuario da su ubicación.
- El backend debe calcular distancia (haversine) y ordenar las canchas de más cercana a más lejana.
- Si no se envían `lat`/`lng`, se devuelven todas sin orden geográfico.
- Requiere coordenadas (`Latitud`, `Longitud`) en la tabla `Local`.

### Filtro por fecha y hora
- `fecha` y `hora` son opcionales. Si se envían, el backend debe cruzar con la disponibilidad real de la cancha (slots/libres).
- Si no hay disponibilidad para ese horario, la cancha no debe aparecer en resultados.

### Filtro por tipo de cancha
- `tipo` acepta valores como "Fútbol 5", "Fútbol 7", "Fútbol 11", etc.
- Debe coincidir con `Tipo_Deporte` de la cancha (o campo similar).

### Orden por defecto
- Si no se especifica `sortBy`, el backend puede ordenar por: disponibilidad > cercanía > rating > precio.
- El frontend aplica orden local solo para precio, rating y nombre.

---

## Lo que NUNCA debe mostrar el Home

- No mostrar sección "No hay ofertas disponibles" — si no hay ofertas, el frontend no renderiza nada.
- No mostrar secciones vacías con títulos sin contenido.
- No hay footer en el Home.
- No hay filtros de precio mínimo, ordenar, rating ni tipo en el Home.

---

## Notas técnicas

- El Home muestra **todas** las canchas devueltas por `GET /api/canchas` (sin límite).
- `GET /api/canchas/ofertas-hoy` debe devolver `data: []` si no hay ofertas, nunca un error.
- Los ratings deben venir como número (ej. `4.2`), el frontend redondea a 1 decimal.
- `Precio_Baja` y `Precio_Prime` se muestran como "Hora valle" y "Hora punta".
- Si `lat` y `lng` no están implementados, el frontend funciona igual (carga todo sin filtro).