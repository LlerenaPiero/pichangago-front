import { apiFetch } from '../utils/apiFetch';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const safeJson = async (res) => {
  try { return await res.json(); }
  catch { return { status: 'error', error: `Error al procesar respuesta del servidor (${res.status})` }; }
};

export const jugadorService = {
  obtenerDashboard: async () => {
    try {
      const res = await apiFetch('/api/jugador/dashboard');
      return safeJson(res);
    } catch {
      return { status: 'error', error: 'Error de conexión al cargar dashboard.' };
    }
  },

  obtenerReservas: async ({ page = 1, limit = 10, estado = '', q = '' } = {}) => {
    try {
      const params = new URLSearchParams();
      params.append('page', page);
      params.append('limit', limit);
      if (estado) params.append('estado', estado);
      if (q) params.append('q', q);
      const res = await apiFetch(`/api/jugador/reservas?${params.toString()}`);
      return safeJson(res);
    } catch {
      return { status: 'error', error: 'Error de conexión al cargar reservas.' };
    }
  },

  obtenerReservaDetalle: async (idReserva) => {
    try {
      const res = await apiFetch(`/api/jugador/reservas/${idReserva}`);
      return safeJson(res);
    } catch {
      return { status: 'error', error: 'Error de conexión al cargar detalle de reserva.' };
    }
  },

  cancelarReserva: async (idReserva, motivo = '') => {
    try {
      const res = await apiFetch(`/api/jugador/reservas/${idReserva}/cancelar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ motivo }),
      });
      return safeJson(res);
    } catch {
      return { status: 'error', error: 'Error de conexión al cancelar reserva.' };
    }
  },

  obtenerPerfil: async () => {
    try {
      const res = await apiFetch('/api/jugador/perfil');
      return safeJson(res);
    } catch {
      return { status: 'error', error: 'Error de conexión al cargar perfil.' };
    }
  },

  actualizarPerfil: async (datos) => {
    try {
      const res = await apiFetch('/api/jugador/perfil', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(datos),
      });
      return safeJson(res);
    } catch {
      return { status: 'error', error: 'Error de conexión al actualizar perfil.' };
    }
  },

  descargarComprobante: async (idReserva) => {
    const token = localStorage.getItem('token');
    const res = await fetch(`${API_URL}/api/jugador/reservas/${idReserva}/comprobante`, {
      headers: { ...(token ? { 'Authorization': `Bearer ${token}` } : {}) },
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Error al descargar comprobante.' }));
      return { status: 'error', error: err.error };
    }
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
    setTimeout(() => URL.revokeObjectURL(url), 30000);
    return { status: 'success' };
  },

  crearReview: async ({ idReserva, calificacion, comentarios = '' }) => {
    try {
      const res = await apiFetch('/api/jugador/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idReserva, calificacion, comentarios }),
      });
      return safeJson(res);
    } catch {
      return { status: 'error', error: 'Error de conexión al enviar reseña.' };
    }
  },

  cambiarPassword: async ({ currentPassword, newPassword, confirmNewPassword }) => {
    try {
      const res = await apiFetch('/api/jugador/cambiar-contrasena', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword, confirmNewPassword }),
      });
      return safeJson(res);
    } catch {
      return { status: 'error', error: 'Error de conexión al cambiar contraseña.' };
    }
  },

};
