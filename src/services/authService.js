const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const authService = {
  register: async (nombre, apellido, email, password, rol, telefono = '') => {
    try {
      const response = await fetch(`${API_URL}/api/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre, apellido, email, password, rol, telefono }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Error en el registro');
      return data;
    } catch (error) {
      console.error('[authService.register]', { error: error.message });
      throw error;
    }
  },

  login: async (email, password) => {
    try {
      const response = await fetch(`${API_URL}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (!response.ok) {
        const err = new Error(data.error || 'Error en el login');
        err.status = response.status;
        throw err;
      }
      if (data.token) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('refreshToken', data.refreshToken);
        localStorage.setItem('usuario', JSON.stringify(data.usuario));
      }
      return data;
    } catch (error) {
      console.error('[authService.login]', { error: error.message, status: error.status });
      throw error;
    }
  },

  logout: async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      await fetch(`${API_URL}/api/logout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });
    } catch (error) {
      console.error('[authService.logout]', { error: error.message });
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('usuario');
      window.location.href = '/';
    }
  },

  refreshAccessToken: async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) throw new Error('No hay refresh token guardado');
      const response = await fetch(`${API_URL}/api/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error('Refresh token inválido o caducado');
      localStorage.setItem('token', data.accessToken);
      return data.accessToken;
    } catch (error) {
      authService.logout();
      throw error;
    }
  },

  fetchProtected: async (endpoint, options = {}) => {
    const token = localStorage.getItem('token');
    const headers = {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      ...options.headers,
    };
    let response = await fetch(`${API_URL}${endpoint}`, { ...options, headers });
    if (response.status === 401) {
      const newToken = await authService.refreshAccessToken();
      headers['Authorization'] = `Bearer ${newToken}`;
      response = await fetch(`${API_URL}${endpoint}`, { ...options, headers });
    }
    return response;
  }
};
