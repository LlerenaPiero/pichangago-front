export const slugify = (str) => {
  if (!str) return '';
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
};

export const getCanchaSlug = (cancha) => {
  if (cancha.SLUG) return cancha.SLUG;
  const nameSlug = slugify(cancha.NOMBRE || '');
  const id = cancha.ID_CANCHA || cancha.ID_Cancha || '';
  const suffix = id.slice(-6);
  return `${nameSlug}-${suffix}`;
};
