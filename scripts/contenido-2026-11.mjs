#!/usr/bin/env node
/**
 * Carga puntual de los cambios pedidos por la AV Arbejales (correos del 8-11-2026):
 * horarios y contactos de iglesia/cementerio/archivo, foto del Sagrado Corazón
 * y la noticia de las excursiones a Puerto Rico.
 *
 * Uso: node scripts/contenido-2026-11.mjs
 * Requiere SANITY_API_TOKEN con permiso de escritura (en .env) y las fotos WebP
 * en ~/Downloads. Es idempotente: reutiliza las fotos ya subidas por nombre.
 */
import { createClient } from '@sanity/client';
import { createReadStream, existsSync, readFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { basename, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

// News date: controls its position on the home page (ordered by date, newest first).
const NEWS_DATE = '2026-11-09';

const root = resolve(fileURLToPath(new URL('..', import.meta.url)));
const env = readFileSync(resolve(root, '.env'), 'utf8');
const token = env.match(/^SANITY_API_TOKEN=(.*)$/m)?.[1]?.trim();
if (!token) {
  console.error('Falta SANITY_API_TOKEN en .env (necesita permiso de escritura).');
  process.exit(1);
}

const client = createClient({ projectId: '9p125sri', dataset: 'production', apiVersion: '2025-01-01', token, useCdn: false });

async function upload(path) {
  if (!existsSync(path)) throw new Error(`No existe ${path}`);
  const filename = basename(path);
  const existing = await client.fetch(`*[_type == "sanity.imageAsset" && originalFilename == $filename][0]._id`, { filename });
  if (existing) return existing;
  const asset = await client.assets.upload('image', createReadStream(path), { filename, contentType: 'image/webp' });
  console.log(`  ↑ ${filename}`);
  return asset._id;
}

const photo = (ref, description, key) => ({
  ...(key ? { _key: key } : {}),
  _type: 'foto',
  imagen: { _type: 'image', asset: { _type: 'reference', _ref: ref } },
  descripcion: description,
});

const downloads = resolve(homedir(), 'Downloads');
const heartPhoto = await upload(resolve(downloads, 'corazon-de-jesus-arbejales.webp'));
const beachPhoto = await upload(resolve(downloads, 'arbejales-se-va-a-la-playa.webp'));

const transaction = client.transaction();

// Iglesia y cementerio: horarios reales y la foto nueva al principio de la lista.
transaction.patch('iglesiaCementerio', (patch) =>
  patch
    .set({
      horarioMisas: 'Viernes y sábados a las 19:30',
      horarioCementerio: 'Sábados, de 9:00 a 13:00\nDomingos, de 9:00 a 14:00',
      contactoCementerio: {
        responsable: 'Rubicense Servicios',
        telefono: '613 11 85 29',
        email: 'administracioncentronorte@rubicense.es',
      },
      horarioArchivo: 'Viernes, de 17:00 a 18:30',
      contactoArchivo: { responsable: 'Parroquia de Arbejales', email: 'parroquiaarbejales@gmail.com' },
    })
    .setIfMissing({ fotos: [] })
    .unset(['fotos[_key=="corazon-de-jesus"]'])
    .prepend('fotos', [photo(heartPhoto, 'Imagen del Sagrado Corazón de Jesús de Arbejales', 'corazon-de-jesus')]),
);

transaction.createOrReplace({
  _id: 'novedad-excursiones-puerto-rico-2026',
  _type: 'novedad',
  etiqueta: 'Noticia',
  titulo: 'Finalizan las excursiones a la playa de Puerto Rico',
  fecha: NEWS_DATE,
  resumen:
    'Durante los meses de julio y agosto, como es tradición cada año, los vecinos de Arbejales se han organizado para hacer una excursión semanal a la playa de Puerto Rico, donde, además de refrescarse y tomar un poco de sol, se mantiene una bonita convivencia. ¡Hasta el próximo año!',
  foto: photo(beachPhoto, 'Grupo de vecinos de Arbejales junto a la guagua en la excursión a la playa de Puerto Rico'),
});

await transaction.commit();
console.log('✓ Iglesia y cementerio actualizada y noticia de la excursión publicada.');
