import { createClient } from '@sanity/client';
import { projectId, dataset } from '../../sanity/env';
import {
  mockArchivos,
  mockFiestas,
  mockFiestasAnios,
  mockFotoDocumentos,
  mockHistoria,
  mockIglesia,
  mockNovedades,
  mockOcupacion,
  mockRancho,
  mockTelefonos,
  mockVideos,
} from '../data/mock';
import type {
  Archivo,
  Carpeta,
  DiaOcupado,
  FiestaAnio,
  Fiestas,
  Foto,
  Historia,
  Iglesia,
  Novedad,
  Rancho,
  Telefono,
  Video,
} from './types';

export type { Archivo, Bloque, BloqueFoto, BloqueTexto, Carpeta, DiaOcupado, FiestaAnio, Fiestas, Foto, Historia, Iglesia, Novedad, Rancho, Telefono, Video } from './types';

// Se lee el contenido del panel (Sanity) al construir la web.
const client = createClient({ projectId, dataset, apiVersion: '2025-01-01', useCdn: false });

/**
 * Datos de ejemplo (src/data/mock.ts).
 * - Por defecto se usan cuando el panel está vacío o no responde.
 * - PUBLIC_SANITY_MOCK=true  → se usan siempre.
 * - PUBLIC_SANITY_MOCK=false → nunca se usan.
 */
const modo = import.meta.env.PUBLIC_SANITY_MOCK;
export const mockForzado = modo === 'true';
export const mockPermitido = modo !== 'false';

let avisoMostrado = false;

async function conRespaldo<T>(
  que: string,
  query: string,
  params: Record<string, unknown>,
  ejemplo: () => T,
  estaVacio: (valor: T) => boolean,
): Promise<T> {
  if (mockForzado) return ejemplo();

  let real: T;
  try {
    real = await client.fetch<T>(query, params);
  } catch (e) {
    if (!mockPermitido) {
      throw new Error(
        `No se pudo leer el contenido del panel (Sanity, proyecto ${projectId}): ${(e as Error).message}`,
      );
    }
    if (!avisoMostrado) {
      avisoMostrado = true;
      console.warn(
        `[contenido] Sanity no responde (${(e as Error).message}). Se muestran datos de ejemplo; define PUBLIC_SANITY_MOCK=false para desactivarlos.`,
      );
    }
    return ejemplo();
  }

  if (mockPermitido && estaVacio(real)) {
    if (!avisoMostrado) {
      avisoMostrado = true;
      console.info(
        `[contenido] El panel no tiene "${que}" todavía. Se muestran datos de ejemplo; define PUBLIC_SANITY_MOCK=false para desactivarlos.`,
      );
    }
    return ejemplo();
  }

  return real;
}

export const carpetas: Carpeta[] = [
  { slug: 'estatutos', titulo: 'Estatutos de la asociación', descripcion: 'Normas que regulan el funcionamiento de la asociación.' },
  { slug: 'actas', titulo: 'Actas de la asociación', descripcion: 'Actas de las asambleas y reuniones de la directiva.' },
  { slug: 'cuentas', titulo: 'Estado de cuentas anual', descripcion: 'Ingresos y gastos de cada ejercicio.' },
  { slug: 'memorias', titulo: 'Memoria de actividades anual', descripcion: 'Resumen de las actividades realizadas cada año.' },
];

const FOTO = `{ "url": imagen.asset->url, "alt": descripcion }`;
const FOTOS = `fotos[defined(imagen.asset)]${FOTO}`;
// Proyección del texto enriquecido con las fotos resueltas a URL.
const CUERPO = `cuerpo[]{
  _type, _key, style, listItem, level, children, markDefs,
  "url": select(_type == "foto" => imagen.asset->url),
  "alt": select(_type == "foto" => descripcion)
}`;

/** Adapta una foto a una URL con tamaño máximo y formato moderno (solo en el CDN de Sanity). */
export const imgUrl = (f: Foto, w = 1200) =>
  f.url.includes('cdn.sanity.io') ? `${f.url}?w=${w}&auto=format` : f.url;

export async function getNovedades(): Promise<Novedad[]> {
  const novedades = await conRespaldo<Novedad[]>(
    'noticias, eventos y convocatorias',
    `*[_type == "novedad" && !(_id in path("drafts.**"))] | order(fecha desc) {
      titulo, fecha, etiqueta, resumen, enlace,
      "foto": select(defined(foto.imagen.asset) => foto${FOTO})
    }`,
    {},
    () => mockNovedades,
    (rows) => rows.length === 0,
  );

  return novedades.map((n) => ({ ...n, foto: n.foto ?? undefined, enlace: n.enlace ?? undefined }));
}

export const getHistoria = () =>
  conRespaldo<Historia | null>(
    'la historia de Arbejales',
    `*[_id == "historia"][0]{ "cuerpo": ${CUERPO} }`,
    {},
    () => mockHistoria,
    (historia) => !historia?.cuerpo?.length,
  );

export const getRancho = () =>
  conRespaldo<Rancho | null>(
    'la historia del Rancho de Ánimas',
    `*[_id == "ranchoAnimas"][0]{ "cuerpo": ${CUERPO} }`,
    {},
    () => mockRancho,
    (rancho) => !rancho?.cuerpo?.length,
  );

export const getFiestas = () =>
  conRespaldo<Fiestas | null>(
    'la descripción de Nuestras fiestas',
    `*[_id == "nuestrasFiestas"][0]{ "cuerpo": ${CUERPO} }`,
    {},
    () => mockFiestas,
    (fiestas) => !fiestas?.cuerpo?.length,
  );

export const getFiestasAnios = () =>
  conRespaldo<FiestaAnio[]>(
    'las fotos de años anteriores de las fiestas',
    `*[_type == "fiestaAnio" && defined(anio)] | order(anio desc){ anio, "fotos": coalesce(${FOTOS}, []) }`,
    {},
    () => mockFiestasAnios,
    (filas) => filas.length === 0,
  );

const youtubeId = (url: string) =>
  url.match(/(?:youtu\.be\/|[?&]v=|\/embed\/|\/shorts\/)([\w-]{11})/)?.[1];

export async function getVideos(): Promise<Video[]> {
  const rows = await conRespaldo<{ titulo: string; enlace: string }[]>(
    'vídeos del Rancho de Ánimas',
    `*[_type == "video"] | order(_createdAt desc){ titulo, enlace }`,
    {},
    () => mockVideos.map((v) => ({ titulo: v.titulo, enlace: `https://youtu.be/${v.youtubeId}` })),
    (filas) => filas.length === 0,
  );

  return rows.flatMap((v) => {
    const id = youtubeId(v.enlace);
    return id ? [{ titulo: v.titulo, youtubeId: id }] : [];
  });
}

export const getIglesia = () =>
  conRespaldo<Iglesia | null>(
    'los horarios y las fotos de la iglesia y el cementerio',
    `*[_id == "iglesiaCementerio"][0]{ horarioMisas, horarioCementerio, horarioArchivo, "fotos": coalesce(${FOTOS}, []) }`,
    {},
    () => mockIglesia,
    (iglesia) => !iglesia,
  );

export async function getFotoDocumentos(): Promise<Foto | undefined> {
  const r = await conRespaldo<{ foto?: Foto } | null>(
    'la foto de la página de documentos',
    `*[_id == "paginaDocumentos"][0]{ "foto": select(defined(foto.imagen.asset) => foto${FOTO}) }`,
    {},
    () => ({ foto: mockFotoDocumentos }),
    (fila) => !fila?.foto,
  );
  return r?.foto ?? undefined;
}

export async function getArchivos(carpeta: string): Promise<Archivo[]> {
  const rows = await conRespaldo<Archivo[]>(
    'los documentos de la asociación',
    `*[_type == "documento" && carpeta == $carpeta && defined(archivo.asset)] | order(fecha desc, _createdAt desc){
      titulo, fecha, "url": archivo.asset->url, "nombre": archivo.asset->originalFilename
    }`,
    { carpeta },
    () => mockArchivos(carpeta),
    (filas) => filas.length === 0,
  );

  return rows.map((r) => ({ ...r, fecha: r.fecha ?? undefined }));
}

export async function getOcupacion(): Promise<DiaOcupado[]> {
  const rows = await conRespaldo<{ fechaInicio: string; fechaFin?: string; motivo?: string }[]>(
    'los días ocupados del local',
    `*[_type == "ocupacionLocal" && defined(fechaInicio)] | order(fechaInicio asc){ fechaInicio, fechaFin, motivo }`,
    {},
    () => mockOcupacion().map((d) => ({ fechaInicio: d.fecha, motivo: d.motivo })),
    (filas) => filas.length === 0,
  );

  // Se expande cada intervalo a días sueltos (AAAA-MM-DD).
  const dias: DiaOcupado[] = [];
  for (const r of rows) {
    const fin = r.fechaFin && r.fechaFin >= r.fechaInicio ? r.fechaFin : r.fechaInicio;
    for (let d = new Date(r.fechaInicio + 'T00:00:00Z'); d.toISOString().slice(0, 10) <= fin; d.setUTCDate(d.getUTCDate() + 1)) {
      dias.push({ fecha: d.toISOString().slice(0, 10), motivo: r.motivo ?? undefined });
    }
  }
  return dias;
}

export const getTelefonos = () =>
  conRespaldo<Telefono[]>(
    'los contactos de interés',
    `*[_type == "telefono"] | order(_createdAt asc, nombre asc){ nombre, numero, web, nota }`,
    {},
    () => mockTelefonos,
    (filas) => filas.length === 0,
  );

/** Conserva los saltos de línea simples (para horarios). */
export const lineas = (t?: string) => (t ?? '').split('\n').map((p) => p.trim()).filter(Boolean);
