import { createClient } from '@sanity/client';
import { projectId, dataset } from '../../sanity/env';
import type {
  Archivo,
  DiaOcupado,
  FiestaAnio,
  Fiestas,
  Folder,
  Foto,
  Historia,
  Iglesia,
  Novedad,
  Rancho,
  Telefono,
  Video,
} from './types';

export type { Archivo, Bloque, BloqueFoto, BloqueTexto, DiaOcupado, FiestaAnio, Fiestas, Folder, Foto, Historia, Iglesia, Novedad, Rancho, Telefono, Video } from './types';

// All content is read from the Sanity Studio at build time.
const client = createClient({ projectId, dataset, apiVersion: '2025-01-01', useCdn: false });

/** Queries Sanity and throws a clear error when the Studio cannot be reached. */
async function fetchSanity<T>(resource: string, query: string, params: Record<string, unknown> = {}): Promise<T> {
  try {
    return await client.fetch<T>(query, params);
  } catch (e) {
    throw new Error(`No se pudo leer ${resource} del panel (Sanity, proyecto ${projectId}): ${(e as Error).message}`);
  }
}


const PHOTO = `{ "url": imagen.asset->url, "alt": descripcion }`;
const PHOTOS = `fotos[defined(imagen.asset)]${PHOTO}`;
// Rich-text projection with each inline photo resolved to its URL.
const BODY = `cuerpo[]{
  _type, _key, style, listItem, level, children, markDefs,
  "url": select(_type == "foto" => imagen.asset->url),
  "alt": select(_type == "foto" => descripcion)
}`;

/** Resizes a photo through Sanity's CDN and serves it in a modern format. */
export const imageUrl = (photo: Foto, width = 1200) =>
  photo.url.includes('cdn.sanity.io') ? `${photo.url}?w=${width}&auto=format` : photo.url;

export async function getNews(): Promise<Novedad[]> {
  const news = await fetchSanity<Novedad[]>(
    'las noticias, eventos y convocatorias',
    `*[_type == "novedad" && !(_id in path("drafts.**"))] | order(fecha desc) {
      titulo, fecha, etiqueta, resumen, enlace,
      "foto": select(defined(foto.imagen.asset) => foto${PHOTO})
    }`,
  );

  return news.map((item) => ({ ...item, foto: item.foto ?? undefined, enlace: item.enlace ?? undefined }));
}

export async function getHistory(): Promise<Historia | null> {
  const history = await fetchSanity<Historia | null>(
    'la historia de Arbejales',
    `*[_id == "historia"][0]{ "cuerpo": ${BODY} }`,
  );
  return history?.cuerpo?.length ? history : null;
}

export async function getRanchoStory(): Promise<Rancho | null> {
  const ranchoContent = await fetchSanity<Rancho | null>(
    'la historia del Rancho de Ánimas',
    `*[_id == "ranchoAnimas"][0]{ "cuerpo": ${BODY} }`,
  );
  return ranchoContent?.cuerpo?.length ? ranchoContent : null;
}

export async function getFestivities(): Promise<Fiestas | null> {
  const festivities = await fetchSanity<Fiestas | null>(
    'la descripción de Nuestras fiestas',
    `*[_id == "nuestrasFiestas"][0]{ "cuerpo": ${BODY} }`,
  );
  return festivities?.cuerpo?.length ? festivities : null;
}

export const getFestivityYears = () =>
  fetchSanity<FiestaAnio[]>(
    'las fotos de años anteriores de las fiestas',
    `*[_type == "fiestaAnio" && defined(anio)] | order(anio desc){ anio, "fotos": coalesce(${PHOTOS}, []) }`,
  );

const youtubeId = (url: string) =>
  url.match(/(?:youtu\.be\/|[?&]v=|\/embed\/|\/shorts\/)([\w-]{11})/)?.[1];

export async function getVideos(): Promise<Video[]> {
  const rows = await fetchSanity<{ titulo: string; enlace: string }[]>(
    'los vídeos del Rancho de Ánimas',
    `*[_type == "video"] | order(coalesce(orden, 9999) asc, _createdAt asc){ titulo, enlace }`,
  );

  return rows.flatMap((video) => {
    const id = youtubeId(video.enlace);
    return id ? [{ titulo: video.titulo, youtubeId: id }] : [];
  });
}

export const getChurch = () =>
  fetchSanity<Iglesia | null>(
    'los horarios y las fotos de la iglesia y el cementerio',
    `*[_id == "iglesiaCementerio"][0]{ horarioMisas, contactoMisas, horarioCementerio, contactoCementerio, horarioArchivo, contactoArchivo, "fotos": coalesce(${PHOTOS}, []) }`,
  );

/** Turns a folder name into a URL segment: «Actas de 2026» → actas-de-2026. */
const slugify = (text: string) =>
  text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '') || 'carpeta';

export async function getFolders(): Promise<Folder[]> {
  const rows = await fetchSanity<{ id: string; titulo: string; descripcion?: string; slug?: string }[]>(
    'las carpetas de documentos',
    `*[_type == "carpeta" && defined(titulo)] | order(coalesce(orden, 9999) asc, titulo asc){
      "id": _id, titulo, descripcion, "slug": slug.current
    }`,
  );

  // Folders without a slug get one from their name; repeated slugs get a numeric suffix.
  const used = new Set<string>();
  return rows.map((row) => {
    const base = slugify(row.slug || row.titulo);
    let slug = base;
    for (let n = 2; used.has(slug); n++) slug = `${base}-${n}`;
    used.add(slug);
    return { id: row.id, slug, title: row.titulo, description: row.descripcion ?? undefined };
  });
}

export async function getFiles(folderId: string): Promise<Archivo[]> {
  const rows = await fetchSanity<Archivo[]>(
    'los documentos de la asociación',
    `*[_type == "documento" && carpeta._ref == $carpetaId && defined(archivo.asset)] | order(fecha desc, _createdAt desc){
      titulo, fecha, "url": archivo.asset->url, "nombre": archivo.asset->originalFilename
    }`,
    { carpetaId: folderId },
  );

  return rows.map((file) => ({ ...file, fecha: file.fecha ?? undefined }));
}

export async function getOccupancy(): Promise<DiaOcupado[]> {
  const rows = await fetchSanity<{ fechaInicio: string; fechaFin?: string; motivo?: string }[]>(
    'los días ocupados del local',
    `*[_type == "ocupacionLocal" && defined(fechaInicio)] | order(fechaInicio asc){ fechaInicio, fechaFin, motivo }`,
  );

  // Expand each range into individual days (YYYY-MM-DD).
  const days: DiaOcupado[] = [];
  for (const row of rows) {
    const end = row.fechaFin && row.fechaFin >= row.fechaInicio ? row.fechaFin : row.fechaInicio;
    for (
      let day = new Date(row.fechaInicio + 'T00:00:00Z');
      day.toISOString().slice(0, 10) <= end;
      day.setUTCDate(day.getUTCDate() + 1)
    ) {
      days.push({ fecha: day.toISOString().slice(0, 10), motivo: row.motivo ?? undefined });
    }
  }
  return days;
}

export const getContacts = () =>
  fetchSanity<Telefono[]>(
    'los contactos de interés',
    `*[_type == "telefono"] | order(_createdAt asc, nombre asc){ nombre, numero, web, nota }`,
  );

/** Keeps single line breaks (used for schedules). */
export const splitLines = (text?: string) => (text ?? '').split('\n').map((line) => line.trim()).filter(Boolean);
