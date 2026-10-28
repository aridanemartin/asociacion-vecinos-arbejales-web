/**
 * Vuelve a subir las imágenes de ejemplo desde public/img/mock y actualiza las
 * referencias de todos los documentos. Se usa cuando se regeneran los WebP
 * (por ejemplo, tras corregir el generador).
 *
 * Uso: node scripts/reupload-images.mjs
 */
import { createClient } from '@sanity/client';
import { createReadStream, existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(fileURLToPath(new URL('..', import.meta.url)));
const env = existsSync(resolve(root, '.env')) ? readFileSync(resolve(root, '.env'), 'utf8') : '';
const token = process.env.SANITY_API_TOKEN ?? env.match(/^SANITY_API_TOKEN=(.*)$/m)?.[1]?.trim();
const client = createClient({ projectId: '9p125sri', dataset: 'production', apiVersion: '2025-01-01', token, useCdn: false });

const docs = await client.fetch(`*[_type in ["novedad", "historia", "ranchoAnimas", "iglesiaCementerio", "paginaDocumentos"]]{
  _id,
  foto,
  "fotoArchivo": foto.imagen.asset->originalFilename,
  fotos[]{..., "archivo": imagen.asset->originalFilename},
  cuerpo[]{..., "archivo": imagen.asset->originalFilename}
}`);

const nuevos = new Map();
const antiguos = new Set();

async function nuevoAsset(ref, archivo) {
  if (nuevos.has(ref)) return nuevos.get(ref);
  const ruta = resolve(root, 'public/img/mock', archivo);
  if (!existsSync(ruta)) throw new Error(`Falta ${ruta}`);
  const asset = await client.assets.upload('image', createReadStream(ruta), { filename: archivo, contentType: 'image/webp' });
  nuevos.set(ref, asset._id);
  antiguos.add(ref);
  console.log(`  ↑ ${archivo}`);
  return asset._id;
}

const ref = (id) => ({ _type: 'reference', _ref: id });

const parches = [];

for (const doc of docs) {
  const set = {};

  if (doc.foto?.imagen?.asset?._ref && doc.fotoArchivo) {
    const id = await nuevoAsset(doc.foto.imagen.asset._ref, doc.fotoArchivo);
    set.foto = { ...doc.foto, imagen: { ...doc.foto.imagen, asset: ref(id) } };
  }

  if (doc.fotos?.length) {
    const fotos = [];
    for (const f of doc.fotos) {
      const id = f.imagen?.asset?._ref ? await nuevoAsset(f.imagen.asset._ref, f.archivo) : null;
      fotos.push({ _key: f._key, _type: 'foto', imagen: { ...f.imagen, ...(id ? { asset: ref(id) } : {}) }, descripcion: f.descripcion });
    }
    set.fotos = fotos;
  }

  if (doc.cuerpo?.length) {
    const cuerpo = [];
    for (const b of doc.cuerpo) {
      if (b._type === 'foto') {
        const id = b.imagen?.asset?._ref ? await nuevoAsset(b.imagen.asset._ref, b.archivo) : null;
        cuerpo.push({
          _key: b._key,
          _type: 'foto',
          imagen: { ...b.imagen, ...(id ? { asset: ref(id) } : {}) },
          descripcion: b.descripcion,
        });
      } else {
        cuerpo.push({
          _key: b._key,
          _type: 'block',
          style: b.style,
          ...(b.listItem ? { listItem: b.listItem, level: b.level ?? 1 } : {}),
          markDefs: b.markDefs ?? [],
          children: b.children ?? [],
        });
      }
    }
    set.cuerpo = cuerpo;
  }

  if (Object.keys(set).length) parches.push({ _id: doc._id, set });
}

if (parches.length) {
  const tx = client.transaction();
  for (const { _id, set } of parches) tx.patch(_id, (p) => p.set(set));
  await tx.commit();
  console.log(`${parches.length} documentos actualizados.`);
}

let borrados = 0;
for (const id of antiguos) {
  const [enUso] = await client.fetch(`*[references($id)][0...1]{_id}`, { id });
  if (!enUso) {
    await client.delete(id);
    borrados++;
  }
}
console.log(`${borrados} imágenes antiguas eliminadas.`);
