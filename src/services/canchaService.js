import { apiFetch } from '../utils/apiFetch';

const safeJson = async (res) => {
  try { return await res.json(); }
  catch { return { status: 'error', error: `Error al procesar respuesta del servidor (${res.status})` }; }
};

export const canchaService = {
  listarCanchas: async (filtros = {}) => {
    try {
      const params = new URLSearchParams();
      if (filtros.departamento) params.append('departamento', filtros.departamento);
      if (filtros.provincia) params.append('provincia', filtros.provincia);
      if (filtros.distrito) params.append('distrito', filtros.distrito);
      if (filtros.nombre) params.append('nombre', filtros.nombre);
      if (filtros.precioMin) params.append('precioMin', filtros.precioMin);
      if (filtros.precioMax) params.append('precioMax', filtros.precioMax);
      if (filtros.lat) params.append('lat', filtros.lat);
      if (filtros.lng) params.append('lng', filtros.lng);
      if (filtros.fecha) params.append('fecha', filtros.fecha);
      if (filtros.hora) params.append('hora', filtros.hora);
      if (filtros.tipo) params.append('tipo', filtros.tipo);
      if (filtros.superficie) params.append('superficie', filtros.superficie);
      if (filtros.techada !== undefined && filtros.techada !== '') params.append('techada', filtros.techada === 'true' ? '1' : '0');
      if (filtros.iluminacion !== undefined && filtros.iluminacion !== '') params.append('iluminacion', filtros.iluminacion === 'true' ? '1' : '0');
      const qs = params.toString();
      const res = await apiFetch(`/api/canchas${qs ? '?' + qs : ''}`);
      const json = await safeJson(res);
      return json;
    } catch (e) {
      return { status: 'error', error: 'Error de conexión al cargar canchas.' };
    }
  },

  obtenerCancha: async (id) => {
    try {
      const res = await apiFetch(`/api/canchas/${id}`);
      const json = await safeJson(res);
      return json;
    } catch (e) {
      return { status: 'error', error: 'Error de conexión al cargar cancha.' };
    }
  },

  obtenerSlots: async (idCancha, fecha) => {
    try {
      const res = await apiFetch(`/api/canchas/${idCancha}/slots?fecha=${fecha}`);
      const json = await safeJson(res);
      if (json.status === 'success' && Array.isArray(json.data)) {
        json.data = json.data.map(s => {
          if (s.PRECIO !== undefined && s.Precio === undefined) s.Precio = s.PRECIO;
          return s;
        });
      }
      return json;
    } catch (e) {
      return { status: 'error', error: 'Error de conexión al cargar horarios.' };
    }
  },

  obtenerOfertasHoy: async () => {
    try {
      const res = await apiFetch('/api/canchas/ofertas-hoy');
      return safeJson(res);
    } catch (e) {
      return { status: 'error', error: 'Error de conexión al cargar ofertas.' };
    }
  },

  reservarCancha: async (datosReserva) => {
    try {
      const res = await apiFetch('/api/canchas/reservar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(datosReserva)
      });
      return safeJson(res);
    } catch (e) {
      return { status: 'error', error: 'Error de conexión al realizar reserva.' };
    }
  },

  obtenerMisReservas: async ({ page = 1, limit = 10, estado = '' } = {}) => {
    try {
      const params = new URLSearchParams();
      params.append('page', page);
      params.append('limit', limit);
      if (estado) params.append('estado', estado);
      const res = await apiFetch(`/api/jugador/reservas?${params.toString()}`, { method: 'GET' });
      return safeJson(res);
    } catch (e) {
      return { status: 'error', error: 'Error de conexión al cargar reservas.' };
    }
  },

  obtenerDepartamentos: async () => {
    try {
      const res = await apiFetch('/api/ubicaciones/departamentos');
      return safeJson(res);
    } catch (e) {
      return { status: 'error', error: 'Error de conexión.' };
    }
  },

  obtenerProvincias: async (departamento) => {
    try {
      const res = await apiFetch(`/api/ubicaciones/provincias?departamento=${encodeURIComponent(departamento)}`);
      return safeJson(res);
    } catch (e) {
      return { status: 'error', error: 'Error de conexión.' };
    }
  },

  obtenerTiposCancha: async () => {
    try {
      const res = await apiFetch('/api/canchas/tipos-cancha');
      return safeJson(res);
    } catch (e) {
      return { status: 'error', error: 'Error de conexión al cargar tipos de cancha.' };
    }
  },

  obtenerReviews: async (idCancha) => {
    try {
      const res = await apiFetch(`/api/canchas/${idCancha}/reviews`);
      return safeJson(res);
    } catch (e) {
      return { status: 'error', error: 'Error de conexión al cargar reseñas.' };
    }
  },

  buscarPorSlug: async (slug) => {
    try {
      const res = await apiFetch(`/api/canchas/search/${encodeURIComponent(slug)}`);
      const json = await safeJson(res);
      return json;
    } catch (e) {
      return { status: 'error', error: 'Error de conexión al buscar cancha por slug.' };
    }
  },

  obtenerDistritos: async (departamento, provincia) => {
    try {
      let params = '';
      if (departamento) params += `departamento=${encodeURIComponent(departamento)}`;
      if (provincia) params += `${params ? '&' : ''}provincia=${encodeURIComponent(provincia)}`;
      const res = await apiFetch(`/api/ubicaciones/distritos${params ? '?' + params : ''}`);
      return safeJson(res);
    } catch (e) {
      return { status: 'error', error: 'Error de conexión.' };
    }
  }

};