#!/usr/bin/env node
/**
 * Vuelca los datos de ejemplo (src/data/mock.ts) a la cuenta real de Sanity.
 *
 * Uso: npm run seed
 * Requiere SANITY_API_TOKEN con permiso de escritura (en .env).
 *
 * Es idempotente: los documentos usan ids fijos (createOrReplace) y las
 * imágenes/archivos ya subidos se reutilizan por nombre de archivo.
 */
import { createClient } from '@sanity/client';
import { createReadStream, existsSync, readFileSync } from 'node:fs';
import { basename, extname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  mockFiestas,
  mockFiestasAnios,
  mockHistoria,
  mockIglesia,
  mockNovedades,
  mockOcupacion,
  mockRancho,
  mockTelefonos,
  mockVideos,
} from '../src/data/mock.ts';

const root = resolve(fileURLToPath(new URL('..', import.meta.url)));
const envFile = resolve(root, '.env');
const env = existsSync(envFile) ? readFileSync(envFile, 'utf8') : '';
const envValue = (key, fallback) =>
  process.env[key] ?? env.match(new RegExp(`^${key}=(.*)$`, 'm'))?.[1]?.trim() ?? fallback;

const projectId = envValue('PUBLIC_SANITY_PROJECT_ID', '9p125sri');
const dataset = envValue('PUBLIC_SANITY_DATASET', 'production');
const token = envValue('SANITY_API_TOKEN');

if (!token) {
  console.error('Falta SANITY_API_TOKEN en .env (necesita permiso de escritura).');
  process.exit(1);
}

const client = createClient({ projectId, dataset, apiVersion: '2025-01-01', token, useCdn: false });

console.log(`Sembrando ${projectId}/${dataset}…`);

// ── Assets ───────────────────────────────────────────────────────────────────
const MIME = {
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.pdf': 'application/pdf',
  '.doc': 'application/msword',
  '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
};

const subidos = new Map();

async function subir(ruta, tipo) {
  const nombre = basename(ruta);
  if (subidos.has(`${tipo}:${nombre}`)) return subidos.get(`${tipo}:${nombre}`);

  const assetType = tipo === 'image' ? 'sanity.imageAsset' : 'sanity.fileAsset';
  const [existente] = await client.fetch(`*[_type == $assetType && originalFilename == $nombre][0...1]{_id}`, {
    assetType,
    nombre,
  });

  if (existente) {
    subidos.set(`${tipo}:${nombre}`, existente._id);
    return existente._id;
  }

  const absoluta = resolve(root, 'public', ruta.replace(/^\//, ''));
  const contentType = MIME[extname(absoluta)] ?? 'application/octet-stream';
  const asset = await client.assets.upload(tipo, createReadStream(absoluta), { filename: nombre, contentType });

  subidos.set(`${tipo}:${nombre}`, asset._id);
  console.log(`  ↑ ${nombre}`);
  return asset._id;
}

async function foto(f, indice = 0, claveFija = null) {
  const ref = await subir(f.url, 'image');
  // Sanity exige una `_key` única en cada elemento de un array.
  const clave =
    claveFija ?? `${basename(f.url, extname(f.url)).replace(/[^a-zA-Z0-9_-]/g, '-')}-${indice}`;
  return {
    _key: clave,
    _type: 'foto',
    imagen: { _type: 'image', asset: { _type: 'reference', _ref: ref } },
    descripcion: f.alt,
  };
}

const fotos = async (lista) => Promise.all(lista.map((f, i) => foto(f, i)));

/** Convierte los bloques del mock (texto + fotos intercaladas) al formato de Sanity. */
const cuerpoDesdeMock = (bloques) =>
  Promise.all(
    bloques.map(async (bloque) => {
      if (bloque._type === 'foto') return foto({ url: bloque.url, alt: bloque.alt }, 0, bloque._key);
      return {
        _key: bloque._key,
        _type: 'block',
        style: bloque.style ?? 'normal',
        ...(bloque.listItem ? { listItem: bloque.listItem, level: bloque.level ?? 1 } : {}),
        markDefs: [],
        children: (bloque.children ?? []).map((span, i) => ({
          _type: 'span',
          _key: `${bloque._key}-span-${i}`,
          marks: span.marks ?? [],
          text: span.text,
        })),
      };
    }),
  );

// ── Documentos ───────────────────────────────────────────────────────────────
const docs = [];

// Portada · noticias, eventos y convocatorias
for (const [i, n] of mockNovedades.entries()) {
  docs.push({
    _id: `novedad-${i + 1}`,
    _type: 'novedad',
    etiqueta: n.etiqueta,
    titulo: n.titulo,
    fecha: n.fecha,
    resumen: n.resumen,
    ...(n.foto ? { foto: await foto(n.foto) } : {}),
    ...(n.enlace ? { enlace: n.enlace } : {}),
  });
}

// 1 · Historia de Arbejales (texto y fotos intercalados)
docs.push({
  _id: 'historia',
  _type: 'historia',
  cuerpo: await cuerpoDesdeMock(mockHistoria.cuerpo),
});

// 2 · Rancho de Ánimas (mismo editor: texto y fotos intercalados)
docs.push({
  _id: 'ranchoAnimas',
  _type: 'ranchoAnimas',
  cuerpo: await cuerpoDesdeMock(mockRancho.cuerpo),
});

for (const [i, v] of mockVideos.entries()) {
  docs.push({
    _id: `video-${i + 1}`,
    _type: 'video',
    orden: i + 1,
    titulo: v.titulo,
    enlace: `https://youtu.be/${v.youtubeId}`,
  });
}

// 3 · Nuestras fiestas
docs.push({
  _id: 'nuestrasFiestas',
  _type: 'nuestrasFiestas',
  cuerpo: await cuerpoDesdeMock(mockFiestas.cuerpo),
});

for (const f of mockFiestasAnios) {
  docs.push({
    _id: `fiestaAnio-${f.anio}`,
    _type: 'fiestaAnio',
    anio: f.anio,
    fotos: await fotos(f.fotos),
  });
}

// 3 · Iglesia y cementerio
docs.push({
  _id: 'iglesiaCementerio',
  _type: 'iglesiaCementerio',
  horarioMisas: mockIglesia.horarioMisas,
  horarioCementerio: mockIglesia.horarioCementerio,
  horarioArchivo: mockIglesia.horarioArchivo,
  fotos: await fotos(mockIglesia.fotos),
});

// 5 · Disponibilidad del local (días consecutivos con el mismo motivo → un solo documento)
const rangos = [];
for (const d of mockOcupacion()) {
  const anterior = rangos.at(-1);
  const siguienteDia = anterior
    ? new Date(new Date(anterior.fin + 'T00:00:00Z').getTime() + 86400000).toISOString().slice(0, 10)
    : null;
  if (anterior && anterior.motivo === d.motivo && siguienteDia === d.fecha) anterior.fin = d.fecha;
  else rangos.push({ ini: d.fecha, fin: d.fecha, motivo: d.motivo });
}

for (const r of rangos) {
  docs.push({
    _id: `ocupacion-${r.ini}`,
    _type: 'ocupacionLocal',
    fechaInicio: r.ini,
    ...(r.fin !== r.ini ? { fechaFin: r.fin } : {}),
    ...(r.motivo ? { motivo: r.motivo } : {}),
  });
}

// 7 · Contactos de interés (teléfonos y webs)
for (const [i, t] of mockTelefonos.entries()) {
  docs.push({
    _id: `telefono-${i + 1}`,
    _type: 'telefono',
    nombre: t.nombre,
    ...(t.numero ? { numero: t.numero } : {}),
    ...(t.web ? { web: t.web } : {}),
    ...(t.nota ? { nota: t.nota } : {}),
  });
}

// ── Escritura ────────────────────────────────────────────────────────────────
const tx = client.transaction();
for (const doc of docs) tx.createOrReplace(doc);
await tx.commit();

const total = await client.fetch('count(*)');
console.log(`\n✓ ${docs.length} documentos escritos. La cuenta tiene ahora ${total} documentos.`);
console.log('Abre el panel en /admin para revisarlos.');
