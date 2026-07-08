export function makeSlug(text = 'homenagem') {
  const base = String(text || 'homenagem')
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .toLowerCase().replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '').slice(0, 42) || 'homenagem';
  return `${base}-${Math.random().toString(36).slice(2, 8)}`;
}
