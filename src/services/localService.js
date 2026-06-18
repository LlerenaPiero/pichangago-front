import { apiFetch } from '../utils/apiFetch';

export const localService = {
    registrarLocal: async (datosLocal) => {
        const response = await apiFetch('/api/dueno/locales', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(datosLocal)
        });
        return response.json();
    },

    listarMisLocales: async () => {
        const response = await apiFetch('/api/dueno/locales');
        return response.json();
    },

    obtenerDetalleLocal: async (idLocal) => {
        const response = await apiFetch(`/api/dueno/locales/${idLocal}`);
        return response.json();
    },

    editarLocal: async (idLocal, datosLocal) => {
        const response = await apiFetch(`/api/dueno/locales/${idLocal}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(datosLocal)
        });
        return response.json();
    }
};
