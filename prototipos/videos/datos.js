// Vídeos reales del panel de Sanity (solo para los prototipos).
window.VIDEOS = [
  { id: 'iJnZJuWOnjE', t: 'Rancho de Ánimas de Arbejales-Teror, F. Cárdenes y P. Herrera, 1968-1969', anio: 1968 },
  { id: 'ZMGOOGA0Cqo', t: 'Rancho de Ánimas de Arbejales-Teror, Raíces, 1974', anio: 1974 },
  { id: 'ATmt-mGxN8w', t: 'Rancho de Ánimas de Arbejales-Teror, Pino Santo, 6/2/1982', anio: 1982 },
  { id: 'mr_YEbFgC5Q', t: 'Rancho de Ánimas de Arbejales-Teror, Suso Ríos, 28/2/2026', anio: 2026 },
  { id: 'UYq2bFe979I', t: 'Rancho de Ánimas de Arbejales-Teror: Con el timple a cuestas (6-07-2026)', anio: 2026 },
];
window.thumb = (id) => `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
window.embed = (id, auto) => `https://www.youtube-nocookie.com/embed/${id}?rel=0${auto ? '&autoplay=1' : ''}`;
window.corto = (t) => t.replace('Rancho de Ánimas de Arbejales-Teror', '').replace(/^[,:]\s*/, '');
