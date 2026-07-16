import { eraseSessionCookie } from './cookies';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const getToken = () => localStorage.getItem('token');
const getRefreshToken = () => localStorage.getItem('refreshToken');
const setToken = (token) => localStorage.setItem('token', token);
const clearSession = () => { localStorage.clear(); eraseSessionCookie(); window.location.href = '/'; };

function buildOptions(options = {}) {
  const token = getToken();
  const headers = {
    ...options.headers,
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
  };
  if (options.body instanceof FormData) {
    delete headers['Content-Type'];
  }
  return { ...options, headers };
}

export async function apiFetch(endpoint, options = {}) {
  let fetchOpts = buildOptions(options);
  let res = await fetch(`${API_URL}${endpoint}`, fetchOpts);

  if (res.status === 429) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || 'Demasiadas solicitudes. Intenta de nuevo en unos minutos.');
  }

  if (res.status === 403) {
    clearSession();
    throw new Error('Acceso denegado. Redirigiendo...');
  }

  if (res.status === 401) {
    console.info('[apiFetch] token expirado, renovando...');
    const refreshToken = getRefreshToken();
    if (!refreshToken) { clearSession(); throw new Error('Sesión expirada.'); }
    const refreshRes = await fetch(`${API_URL}/api/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });
    if (refreshRes.ok) {
      const { accessToken } = await refreshRes.json();
      setToken(accessToken);
      fetchOpts = buildOptions({ ...options, headers: { ...options.headers, 'Authorization': `Bearer ${accessToken}` } });
      res = await fetch(`${API_URL}${endpoint}`, fetchOpts);
    } else {
      clearSession();
      throw new Error('Sesión expirada. Inicia sesión nuevamente.');
    }
  }

  return res;
}
