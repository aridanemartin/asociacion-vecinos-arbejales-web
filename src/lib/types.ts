// Types for the content the website reads from the Sanity Studio.

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

export type Folder = { id: string; slug: string; title: string; description?: string };

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

/** Quién atiende un horario y cómo contactar. */
export type ContactoHorario = { responsable?: string; telefono?: string; email?: string };

export type Iglesia = {
  horarioMisas?: string;
  contactoMisas?: ContactoHorario;
  horarioCementerio?: string;
  contactoCementerio?: ContactoHorario;
  horarioArchivo?: string;
  contactoArchivo?: ContactoHorario;
  fotos: Foto[];
};

export type DiaOcupado = { fecha: string; motivo?: string };

/** Contacto de interés: un teléfono, una web o ambos. */
export type Telefono = { nombre: string; numero?: string; web?: string; nota?: string };
