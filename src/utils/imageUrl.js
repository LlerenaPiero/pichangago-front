const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const FALLBACK_IMG = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300"><rect fill="%23EDF0F4" width="400" height="300"/><text x="200" y="140" text-anchor="middle" font-family="sans-serif" font-size="48">⚽</text><text x="200" y="172" text-anchor="middle" font-family="sans-serif" font-size="14" fill="%236B7280">Sin foto</text></svg>';

export const getImageUrl = (url) => {
  if (!url) return FALLBACK_IMG;
  if (url.startsWith('http')) return url;
  if (url.startsWith('/')) return `${API_URL}${url}`;
  return `${API_URL}/${url}`;
};

export const getDownloadUrl = (url) => {
  if (!url) return '';
  if (url.startsWith('http')) return url;
  if (url.startsWith('/')) return `${API_URL}${url}`;
  return `${API_URL}/${url}`;
};
