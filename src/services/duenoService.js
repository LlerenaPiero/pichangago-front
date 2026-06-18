import { apiFetch } from '../utils/apiFetch';

const buildFormData = (data, file, fileFieldName = 'foto') => {
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value !== '') {
            formData.append(key, value);
        }
    });
    if (file) formData.append(fileFieldName, file);
    return formData;
};

export const duenoService = {
    registrarCancha: async (datosCancha, fotoFile = null) => {
        const response = await apiFetch('/api/dueno/canchas', {
            method: 'POST',
            headers: {},
            body: buildFormData(datosCancha, fotoFile)
        });
        return response.json();
    },

    obtenerMisCanchas: async () => {
        const response = await apiFetch('/api/dueno/canchas');
        return response.json();
    },

    obtenerDetalleCancha: async (idCancha) => {
        const response = await apiFetch(`/api/dueno/canchas/${idCancha}`);
        return response.json();
    },

    editarCancha: async (idCancha, datosCancha, fotoFile = null, reemplazarFotoId = null) => {
        const body = buildFormData(datosCancha, fotoFile);
        if (reemplazarFotoId) body.append('reemplazarFotoId', reemplazarFotoId);
        const response = await apiFetch(`/api/dueno/canchas/${idCancha}`, {
            method: 'PUT',
            headers: {},
            body
        });
        return response.json();
    },

    cambiarEstadoCancha: async (idCancha, estado) => {
        const response = await apiFetch(`/api/dueno/canchas/${idCancha}/estado`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ estado })
        });
        return response.json();
    },

    eliminarFoto: async (idFoto) => {
        const response = await apiFetch(`/api/dueno/canchas/fotos/${idFoto}`, {
            method: 'DELETE'
        });
        return response.json();
    },

    actualizarPerfilFinanciero: async (datosFinancieros) => {
        const response = await apiFetch('/api/dueno/perfil-financiero', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(datosFinancieros)
        });
        return response.json();
    },

    obtenerPerfilFinanciero: async () => {
        const response = await apiFetch('/api/dueno/perfil-financiero');
        return response.json();
    },

    obtenerHorariosCancha: async (idCancha) => {
        const response = await apiFetch(`/api/dueno/canchas/${idCancha}/horarios`);
        return response.json();
    },

    configurarHorariosTarifas: async (idCancha, listaHorarios) => {
        const response = await apiFetch(`/api/dueno/canchas/${idCancha}/horarios`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ horarios: listaHorarios })
        });
        return response.json();
    },

    generarSlotsDesdeHorarios: async (idCancha) => {
        try {
            const response = await apiFetch(`/api/dueno/canchas/${idCancha}/slots/generar`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
            });
            const text = await response.text();
            return JSON.parse(text);
        } catch {
            return { status: 'error', error: 'El backend no tiene implementado el endpoint de generación de slots.' };
        }
    },

    obtenerAgendaDiaria: async (fecha) => {
        const response = await apiFetch(`/api/dueno/agenda/diaria?fecha=${fecha}`);
        return response.json();
    },

    actualizarEstadoSlot: async (idSlot, nuevoEstado) => {
        const response = await apiFetch(`/api/dueno/slots/${idSlot}/estado`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nuevoEstado })
        });
        return response.json();
    },

    crearOfertaSlot: async (idSlot, datosOferta) => {
        const response = await apiFetch(`/api/dueno/slots/${idSlot}/oferta`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(datosOferta)
        });
        return response.json();
    },

    obtenerDetalleReserva: async (idReserva) => {
        const response = await apiFetch(`/api/dueno/reservas/${idReserva}`);
        return response.json();
    },

    obtenerAgendaSemanal: async (fechaInicio) => {
        const response = await apiFetch(`/api/dueno/agenda/semanal?fecha_inicio=${fechaInicio}`);
        return response.json();
    },

    obtenerReviewsCancha: async (idCancha) => {
        const response = await apiFetch(`/api/dueno/canchas/${idCancha}/reviews`);
        return response.json();
    },

    obtenerDashboard: async () => {
        const response = await apiFetch('/api/dueno/dashboard');
        return response.json();
    },

    obtenerReporteIngresos: async (fechaInicio, fechaFin) => {
        const response = await apiFetch(`/api/dueno/reportes/ingresos?fecha_inicio=${fechaInicio}&fecha_fin=${fechaFin}`);
        return response.json();
    },

    obtenerSaldoPendiente: async () => {
        const response = await apiFetch('/api/dueno/reportes/saldo-pendiente');
        return response.json();
    },

    obtenerHistorialLiquidaciones: async () => {
        const response = await apiFetch('/api/dueno/reportes/liquidaciones');
        return response.json();
    },

    obtenerEstadisticasOcupacion: async (mes, anio) => {
        const response = await apiFetch(`/api/dueno/reportes/ocupacion?mes=${mes}&anio=${anio}`);
        return response.json();
    },

    obtenerHistorialReservas: async (filtros = {}) => {
        const params = new URLSearchParams();
        if (filtros.fecha_desde) params.append('fecha_desde', filtros.fecha_desde);
        if (filtros.fecha_hasta) params.append('fecha_hasta', filtros.fecha_hasta);
        if (filtros.estado) params.append('estado', filtros.estado);
        const qs = params.toString();
        const response = await apiFetch(`/api/dueno/reservas/historial${qs ? '?' + qs : ''}`);
        return response.json();
    }
};
