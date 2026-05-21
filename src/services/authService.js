// src/services/authService.js

// Lee la URL de Render configurada en Vercel, o usa localhost si estás programando en tu PC
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const authService = {
  // 📝 Función para registrar un nuevo usuario (Jugador o Dueño)
  register: async (nombre, apellido, email, password, rol) => {
    try {
      const response = await fetch(`${API_URL}/api/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ nombre, apellido, email, password, rol }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error en el registro');
      }

      return data;
    } catch (error) {
      console.error('Error en authService.register:', error);
      throw error;
    }
  },

  // 🔑 Función para iniciar sesión y obtener el Token JWT
  login: async (email, password) => {
    try {
      const response = await fetch(`${API_URL}/api/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error en el login');
      }

      // 💾 ESTÁNDAR OWASP: Si el login es correcto, guardamos el Token y los datos en el localStorage
      if (data.token) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('usuario', JSON.stringify(data.usuario));
      }

      return data;
    } catch (error) {
      console.error('Error en authService.login:', error);
      throw error;
    }
  },

  // 🚪 Función para cerrar sesión (Limpia la memoria del navegador)
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    window.location.href = '/login';
  },

  // 🕵️‍♂️ Función auxiliar para obtener el usuario actual y su Rol desde cualquier pantalla
  getCurrentUser: () => {
    const userStr = localStorage.getItem('usuario');
    return userStr ? JSON.parse(userStr) : null;
  }
};