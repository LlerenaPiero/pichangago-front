const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const getImageUrl = (url) => {
  if (!url) return 'https://placehold.co/400x300/png?text=Sin+Foto+⚽';
  if (url.startsWith('http')) return url;
  return `${API_URL}${url}`;
};
