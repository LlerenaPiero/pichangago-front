export const formatValidationErrors = (response) => {
  if (response.detalles && Array.isArray(response.detalles)) {
    return response.detalles.map(d => `• ${d.mensaje}`).join('\n');
  }
  return response.error || 'Error desconocido.';
};
