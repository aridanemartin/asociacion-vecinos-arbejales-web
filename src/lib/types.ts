// Tipos del contenido que la web lee del panel de Sanity.
// Se comparten entre `lib/content.ts` (datos reales) y `data/mock.ts` (datos de ejemplo).

export type Etiqueta = 'Noticia' | 'Evento' | 'Convocatoria';

export type Foto = { url: string; alt: string };

export type Novedad = {
  titulo: string;
  fecha: string;
  etiqueta: Etiqueta;
  resumen: string;
  foto?: Foto;
  enlace?: string;
};

export type Archivo = { titulo: string; url: string; fecha?: string; nombre: string };

export type Carpeta = { slug: string; titulo: string; descripcion: string };

export type Historia = { cuerpo: Bloque[] };

/** Bloque de texto enriquecido de Sanity (Portable Text). */
export type BloqueTexto = {
  _type: 'block';
  _key: string;
  style?: string;
  listItem?: 'bullet' | 'number';
  level?: number;
  children: { _type?: string; _key?: string; text: string; marks?: string[] }[];
  markDefs?: { _key: string; _type: string; href?: string }[];
};

/** Foto intercalada entre los párrafos de la historia. */
export type BloqueFoto = { _type: 'foto'; _key: string; url: string; alt: string };

export type Bloque = BloqueTexto | BloqueFoto;

export type Rancho = { cuerpo: Bloque[] };

export type Fiestas = { cuerpo: Bloque[] };

/** Fotos de las fiestas de un año concreto. */
export type FiestaAnio = { anio: number; fotos: Foto[] };

export type Video = { titulo: string; youtubeId: string };

export type Iglesia = {
  horarioMisas?: string;
  horarioCementerio?: string;
  horarioArchivo?: string;
  fotos: Foto[];
};

export type DiaOcupado = { fecha: string; motivo?: string };

/** Contacto de interés: un teléfono, una web o ambos. */
export type Telefono = { nombre: string; numero?: string; web?: string; nota?: string };
