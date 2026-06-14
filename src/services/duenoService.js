const API_URL = 'http://localhost:5000/api/dueno';

// Función auxiliar para extraer el token JWT guardado en el Login del grupo
const getAuthHeaders = () => {
    const token = localStorage.getItem('token'); 
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };
};

export const duenoService = {
    // D-01: Registrar Cancha
    registrarCancha: async (datosCancha) => {
        const response = await fetch(`${API_URL}/canchas`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(datosCancha)
        });
        return response.json();
    },

    // D-02: Configurar cuenta de cobro
    actualizarPerfilFinanciero: async (datosFinancieros) => {
        const response = await fetch(`${API_URL}/perfil-financiero`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify(datosFinancieros)
        });
        return response.json();
    },

    // D-03 y D-04: Registrar el lote de horarios de apertura y sus tarifas
    configurarHorariosTarifas: async (idCancha, listaHorarios) => {
        const response = await fetch(`${API_URL}/canchas/${idCancha}/horarios`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify({ horarios: listaHorarios })
        });
        return response.json();
    }
};