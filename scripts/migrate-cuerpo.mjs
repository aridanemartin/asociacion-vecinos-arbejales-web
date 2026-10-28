/**
 * Migración puntual del contenido ya sembrado:
 *  1. Sustituye las fotos SVG de ejemplo por sus versiones WebP.
 *  2. Convierte las secciones con "texto + lista de fotos" (historia de
 *     Arbejales y Rancho de Ánimas) en un cuerpo único con las fotos
 *     intercaladas entre los párrafos.
 *
 * No sobrescribe textos ni otros cambios hechos en el panel: si el documento
 * ya tiene `cuerpo`, no se toca. Se puede volver a ejecutar sin problema.
 *
 * Uso: node scripts/migrate-cuerpo.mjs
 */
import { createClient } from '@sanity/client';
import { createReadStream, existsSync, readFileSync } from 'node:fs';
import { basename, extname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { randomUUID } from 'node:crypto';

const root = resolve(fileURLToPath(new URL('..', import.meta.url)));
const env = existsSync(resolve(root, '.env')) ? readFileSync(resolve(root, '.env'), 'utf8') : '';
const token = process.env.SANITY_API_TOKEN ?? env.match(/^SANITY_API_TOKEN=(.*)$/m)?.[1]?.trim();
const client = createClient({ projectId: '9p125sri', dataset: 'production', apiVersion: '2025-01-01', token, useCdn: false });

console.log('Leyendo documentos…');
const docs = await client.fetch(`*[_type in ["novedad", "historia", "ranchoAnimas", "iglesiaCementerio", "paginaDocumentos"]]{
  _id,
  _type,
  texto,
  historia,
  cuerpo,
  foto,
  fotos,
  "fotosInfo": fotos[]{_key, "archivo": imagen.asset->originalFilename},
  "fotoInfo": foto{..., "archivo": imagen.asset->originalFilename}
}`);

// ── 1. Subir los WebP locales y mapear nombre antiguo → asset nuevo ──────────
const yaSubidos = new Map(
  (
    await client.fetch(`*[_type == "sanity.imageAsset" && originalFilename match "*.webp"]{_id, originalFilename}`)
  ).map((a) => [a.originalFilename, a._id]),
);

async function assetWebP(slug) {
  const nombre = `${slug}.webp`;
  if (yaSubidos.has(nombre)) return yaSubidos.get(nombre);
  const ruta = resolve(root, 'public/img/mock', nombre);
  if (!existsSync(ruta)) throw new Error(`Falta ${ruta}; ejecuta antes: node scripts/mock-images.mjs`);
  const asset = await client.assets.upload('image', createReadStream(ruta), { filename: nombre, contentType: 'image/webp' });
  yaSubidos.set(nombre, asset._id);
  console.log(`  ↑ ${nombre}`);
  return asset._id;
}

async function refWebP(archivo) {
  if (!archivo) return null;
  const slug = basename(archivo, extname(archivo));
  return assetWebP(slug);
}

// ── 2. Preparar parches por documento ────────────────────────────────────────
const parches = [];
const assetsAntiguos = new Set();

const nuevoRef = (id) => ({ _type: 'reference', _ref: id });

for (const doc of docs) {
  const set = {};
  const unset = [];

  // Foto suelta (novedades y página de documentos)
  if (doc.foto?.imagen?.asset?._ref && doc.fotoInfo?.archivo) {
    assetsAntiguos.add(doc.foto.imagen.asset._ref);
    const id = await refWebP(doc.fotoInfo.archivo);
    if (id) set.foto = { ...doc.foto, imagen: { ...doc.foto.imagen, asset: nuevoRef(id) } };
  }

  // Listas de fotos (historia, rancho, iglesia)
  if (doc.fotos?.length && doc.fotosInfo) {
    const fotos = [];
    for (const [i, f] of doc.fotos.entries()) {
      const archivo = doc.fotosInfo[i]?.archivo;
      if (f.imagen?.asset?._ref) assetsAntiguos.add(f.imagen.asset._ref);
      const id = archivo ? await refWebP(archivo) : null;
      fotos.push(id ? { ...f, imagen: { ...f.imagen, asset: nuevoRef(id) } } : f);
    }
    set.fotos = fotos;
  }

  // Texto + fotos → un solo cuerpo intercalado (historia y Rancho de Ánimas)
  const campoTexto = doc._type === 'historia' ? 'texto' : doc._type === 'ranchoAnimas' ? 'historia' : null;
  const prefijo = doc._type === 'historia' ? 'hist' : 'rancho';

  if (campoTexto && !doc.cuerpo?.length && doc[campoTexto]) {
    const parrafos = doc[campoTexto]
      .split(/\n\s*\n/)
      .map((p) => p.trim())
      .filter(Boolean);

    const cuerpo = [];
    parrafos.forEach((texto, i) => {
      cuerpo.push({
        _key: `${prefijo}-p${i + 1}`,
        _type: 'block',
        style: 'normal',
        markDefs: [],
        children: [{ _type: 'span', _key: `${prefijo}-p${i + 1}-texto`, marks: [], text: texto }],
      });
      const foto = set.fotos?.[i];
      if (foto) {
        cuerpo.push({
          _key: foto._key ?? `${prefijo}-f${i + 1}`,
          _type: 'foto',
          imagen: foto.imagen,
          descripcion: foto.descripcion,
        });
      }
    });
    // Las fotos que sobran van al final, para no perder ninguna.
    for (const foto of set.fotos?.slice(parrafos.length) ?? []) {
      cuerpo.push({
        _key: foto._key ?? `${prefijo}-f-${randomUUID().slice(0, 8)}`,
        _type: 'foto',
        imagen: foto.imagen,
        descripcion: foto.descripcion,
      });
    }
    // Reasignar claves duplicadas (texto y foto pueden compartir _key).
    const claves = new Set();
    for (const bloque of cuerpo) {
      let clave = bloque._key;
      while (claves.has(clave)) clave = `${clave}-${randomUUID().slice(0, 6)}`;
      claves.add(clave);
      bloque._key = clave;
    }

    set.cuerpo = cuerpo;
    unset.push(campoTexto, 'fotos');
  }

  if (Object.keys(set).length || unset.length) parches.push({ _id: doc._id, set, unset });
}

// ── 3. Aplicar ───────────────────────────────────────────────────────────────
if (parches.length) {
  const tx = client.transaction();
  for (const { _id, set, unset } of parches) {
    tx.patch(_id, (p) => {
      let patch = p;
      if (Object.keys(set).length) patch = patch.set(set);
      if (unset.length) patch = patch.unset(unset);
      return patch;
    });
  }
  await tx.commit();
  console.log(`${parches.length} documentos actualizados.`);
}

// ── 4. Borrar los assets antiguos que ya no usa nadie ────────────────────────
let borrados = 0;
for (const id of assetsAntiguos) {
  const [enUso] = await client.fetch(`*[references($id)][0...1]{_id}`, { id });
  if (!enUso) {
    await client.delete(id);
    borrados++;
  }
}
console.log(`${borrados} imágenes antiguas eliminadas.`);
console.log('Listo. Comprueba las páginas de historia y el panel.');
