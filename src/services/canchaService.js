import { apiFetch } from '../utils/apiFetch';

export const canchaService = {
  listarCanchas: async (filtros = {}) => {
    const params = new URLSearchParams();
    if (filtros.distrito) params.append('distrito', filtros.distrito);
    if (filtros.nombre) params.append('nombre', filtros.nombre);
    if (filtros.precioMin) params.append('precioMin', filtros.precioMin);
    if (filtros.precioMax) params.append('precioMax', filtros.precioMax);
    const qs = params.toString();
    const res = await apiFetch(`/api/canchas${qs ? '?' + qs : ''}`);
    return res.json();
  },

  obtenerCancha: async (id) => {
    const res = await apiFetch(`/api/canchas/${id}`);
    return res.json();
  },

  obtenerSlots: async (idCancha, fecha) => {
    const res = await apiFetch(`/api/canchas/${idCancha}/slots?fecha=${fecha}`);
    return res.json();
  },

  obtenerOfertasHoy: async () => {
    const res = await apiFetch('/api/canchas/ofertas-hoy');
    return res.json();
  },



  
  // ⚽ FUNCIÓN DE RESERVA INYECTADA Y CONECTADA A TU BACKEND:
  reservarCancha: async (datosReserva) => {
    const res = await apiFetch('/api/canchas/reservar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(datosReserva)
    });
    return res.json();
  },


  
  obtenerMisReservas: async () => {
    const res = await apiFetch('/api/jugador/reservas', { method: 'GET' });
    return res.json();
  }


  
};