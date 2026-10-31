import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import sanity from '@sanity/astro';

const projectId = process.env.PUBLIC_SANITY_PROJECT_ID ?? '9p125sri';
const dataset = process.env.PUBLIC_SANITY_DATASET ?? 'production';

export default defineConfig({
  // Ajustar `site` al dominio definitivo antes de publicar.
  // site: 'https://example.org',
  redirects: {
    '/telefonos-de-interes': '/contactos',
    '/rancho-de-animas/historia': '/rancho-de-animas',
    '/rancho-de-animas/videos': '/rancho-de-animas',
  },
  integrations: [
    // Panel de control en /admin (Sanity Studio incrustado).
    sanity({ projectId, dataset, useCdn: false, studioBasePath: '/admin' }),
    react(),
  ],
});
