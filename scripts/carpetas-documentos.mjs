#!/usr/bin/env node
/**
 * Migración puntual: convierte las tres carpetas fijas de «Documentos» en
 * documentos «carpeta» editables desde el panel y enlaza cada documento con
 * la suya (el campo `carpeta` pasa de texto a referencia).
 *
 * Uso: node scripts/carpetas-documentos.mjs [--dry-run]
 * Requiere SANITY_API_TOKEN con permiso de escritura (en .env). Es idempotente:
 * no toca las carpetas ya creadas ni los documentos ya enlazados.
 */
import { createClient } from '@sanity/client';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(fileURLToPath(new URL('..', import.meta.url)));
const env = readFileSync(resolve(root, '.env'), 'utf8');
const token = env.match(/^SANITY_API_TOKEN=(.*)$/m)?.[1]?.trim();
if (!token) {
  console.error('Falta SANITY_API_TOKEN en .env (necesita permiso de escritura).');
  process.exit(1);
}

const dryRun = process.argv.includes('--dry-run');
const client = createClient({ projectId: '9p125sri', dataset: 'production', apiVersion: '2025-01-01', token, useCdn: false });

// Same slugs as the old fixed folders, so /documentos/<slug> keeps working.
const FOLDERS = [
  { slug: 'estatutos', titulo: 'Estatutos de la asociación', descripcion: 'Normas que regulan el funcionamiento de la asociación.' },
  { slug: 'actas', titulo: 'Actas de la asociación', descripcion: 'Actas de las asambleas y reuniones de la directiva.' },
  { slug: 'memorias', titulo: 'Memoria de actividades anual', descripcion: 'Resumen de las actividades realizadas cada año.' },
];

const tx = client.transaction();
FOLDERS.forEach((folder, index) => {
  tx.createIfNotExists({
    _id: `carpeta-${folder.slug}`,
    _type: 'carpeta',
    titulo: folder.titulo,
    descripcion: folder.descripcion,
    orden: index + 1,
    slug: { _type: 'slug', current: folder.slug },
  });
});

// Published documents and drafts still holding the old text value.
const docs = await client.fetch(
  `*[_type == "documento" && defined(carpeta) && !defined(carpeta._ref)]{ _id, carpeta, titulo }`,
  {},
  { perspective: 'raw' },
);
for (const doc of docs) {
  if (!FOLDERS.some((folder) => folder.slug === doc.carpeta)) {
    console.warn(`Se omite «${doc.titulo}» (${doc._id}): carpeta desconocida «${doc.carpeta}».`);
    continue;
  }
  tx.patch(doc._id, { set: { carpeta: { _type: 'reference', _ref: `carpeta-${doc.carpeta}` } } });
  console.log(`${doc._id}: ${doc.carpeta} → carpeta-${doc.carpeta}`);
}

const result = await tx.commit({ dryRun, visibility: 'sync' });
console.log(`${dryRun ? '[prueba] ' : ''}Hecho: ${result.results.length} cambios.`);
