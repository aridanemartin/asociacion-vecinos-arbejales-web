// Datos de ejemplo para poder trabajar en la interfaz mientras el panel de
// Sanity (https://asociacion-vecinos-arbejales.sanity.studio) está vacío.
//
// Se usan automáticamente cuando una consulta no devuelve contenido.
// Para forzarlos:      PUBLIC_SANITY_MOCK=true
// Para desactivarlos:  PUBLIC_SANITY_MOCK=false
//
// Las fotos y los PDF viven en public/img/mock y public/docs. Se generan con
// `node scripts/mock-images.mjs` y `sh scripts/mock-docs.sh`.
import type {
  Archivo,
  BloqueFoto,
  BloqueTexto,
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
} from '../lib/types';

const foto = (slug: string, alt: string): Foto => ({ url: `/img/mock/${slug}.webp`, alt });

/** Párrafo de texto enriquecido para la historia. */
const parrafo = (clave: string, texto: string): BloqueTexto => ({
  _type: 'block',
  _key: clave,
  children: [{ _type: 'span', _key: `${clave}-texto`, text: texto, marks: [] }],
});

/** Foto intercalada entre párrafos. */
const fotoBloque = (clave: string, slug: string, alt: string): BloqueFoto => ({
  _type: 'foto',
  _key: clave,
  ...foto(slug, alt),
});

/** Fecha (AAAA-MM-DD) a partir de hoy, en UTC, para que el calendario tenga días próximos. */
const enDias = (dias: number) => {
  const hoy = new Date();
  const d = new Date(Date.UTC(hoy.getUTCFullYear(), hoy.getUTCMonth(), hoy.getUTCDate()));
  d.setUTCDate(d.getUTCDate() + dias);
  return d.toISOString().slice(0, 10);
};

export const mockNovedades: Novedad[] = [
  {
    etiqueta: 'Convocatoria',
    titulo: 'Asamblea general ordinaria de la asociación',
    fecha: '2026-11-14',
    resumen:
      'El sábado 14 de noviembre, a las 18:00, en el local social. Se tratarán el estado de cuentas del año, el calendario de actividades y la renovación de la junta directiva. Al terminar compartiremos un café con los vecinos que se acerquen.',
    foto: foto('asamblea', 'Vecinos y vecinas reunidos en una asamblea de la asociación'),
  },
  {
    etiqueta: 'Noticia',
    titulo: 'El local de la asociación abre los sábados por la tarde',
    fecha: '2026-10-10',
    resumen:
      'A partir de este mes, el local social permanecerá abierto los sábados de 17:00 a 20:00 para que los vecinos puedan reunirse, leer o jugar a las cartas. La apertura correrá a cargo de los miembros de la junta, que se irán turnando.',
    foto: foto('local', 'Interior del local social de la asociación, con mesas y sillas'),
  },
  {
    etiqueta: 'Evento',
    titulo: 'Nuevo calendario de actividades para el otoño',
    fecha: '2026-09-28',
    resumen:
      'Hemos preparado talleres de memoria, un curso básico de teléfono móvil y dos salidas para conocer los caminos del barrio. Las inscripciones se pueden hacer en el local o escribiendo al correo de la asociación.',
    foto: foto('fiestas', 'Vecinos disfrutando de una actividad al aire libre en el barrio'),
  },
  {
    etiqueta: 'Noticia',
    titulo: 'Limpieza vecinal del entorno de la iglesia',
    fecha: '2026-09-15',
    resumen:
      'Una treintena de vecinos participó en la limpieza del camino y de la plaza de la iglesia. Gracias a todos los que dedicaron su mañana. La asociación solicitará al Ayuntamiento que reponga los contenedores retirados.',
    foto: foto('vecinos', 'Vecinos trabajando juntos en la limpieza de la plaza'),
    enlace: 'https://infonortedigital.com/',
  },
  {
    etiqueta: 'Convocatoria',
    titulo: 'Reunión informativa sobre el camino de Las Mesas',
    fecha: '2026-08-30',
    resumen:
      'El Ayuntamiento ha anunciado el arreglo del camino de Las Mesas. El jueves 3 de septiembre, a las 19:00, nos reuniremos en el local para recoger las aportaciones de los vecinos antes de la reunión con el concejal de Obras.',
    foto: foto('camino', 'Camino de tierra entre castaños y muros de piedra'),
  },
  {
    etiqueta: 'Evento',
    titulo: 'Estrenamos buzón de sugerencias en la web',
    fecha: '2026-08-12',
    resumen:
      'Ya se pueden enviar propuestas a la directiva desde la página de sugerencias. El mensaje llega directamente al correo de la asociación y puede enviarse de forma anónima.',
  },
];

export const mockHistoria: Historia = {
  cuerpo: [
    parrafo(
      'hist-p1',
      'Arbejales es un pago del municipio de Teror, en el norte de Gran Canaria, situado entre laderas de castaños y tierras de cultivo que miran hacia el barranco. Su nombre aparece en documentos antiguos y su paisaje conserva todavía la huella de una vida ligada al agua, al camino y a la tierra.',
    ),
    fotoBloque('hist-f1', 'plaza', 'Plaza del barrio con la iglesia al fondo'),
    parrafo(
      'hist-p2',
      'Durante generaciones, las familias del barrio se organizaron en torno a la iglesia, al lavadero y a las eras compartidas. Muchas de las casas que hoy vemos levantadas con piedra y barro se construyeron con las manos de los propios vecinos, que se ayudaban unos a otros en las tareas más pesadas.',
    ),
    fotoBloque('hist-f2', 'paisaje', 'Vistas de las laderas y los castaños de Arbejales'),
    parrafo(
      'hist-p3',
      'La asociación de vecinos nació para dar voz a ese modo de hacer las cosas: cuidar el barrio entre todos, mantener las tradiciones y reclamar los servicios que hacen falta. Desde entonces ha organizado fiestas, romerías, talleres y reuniones, y ha acompañado a los vecinos en los momentos difíciles.',
    ),
    fotoBloque('hist-f3', 'lavadero', 'Lavadero tradicional de piedra con agua corriente'),
    parrafo(
      'hist-p4',
      'Boni ha recopilado durante años fotografías, recuerdos y testimonios de las personas mayores del barrio. Ese trabajo es el origen de esta página: un lugar donde guardar la memoria de Arbejales y donde las nuevas generaciones puedan reconocerse en ella.',
    ),
    fotoBloque('hist-f4', 'ermita', 'Ermita de Arbejales entre árboles'),
    parrafo(
      'hist-p5',
      'La historia del barrio sigue escribiéndose cada día, con las fiestas de cada año, con las obras que llegan y con la gente que decide quedarse y cuidar lo que hay. Si tienes fotos antiguas o recuerdos que contar, escríbenos: tu aportación ayuda a completar este relato.',
    ),
    fotoBloque('hist-f5', 'memoria', 'Personas mayores del barrio hojeando fotos antiguas'),
    fotoBloque('hist-f6', 'procesion', 'Procesión por la calle principal durante las fiestas'),
  ],
};

export const mockRancho: Rancho = {
  cuerpo: [
    parrafo(
      'rancho-p1',
      'El Rancho de Ánimas de Arbejales es una de las tradiciones más queridas del barrio. Cada Navidad, un grupo de vecinos recorre las casas cantando coplas y villancicos al son de la guitarra, el timple y las panderetas, recordando a quienes ya no están y deseando un buen año a los que abren su puerta.',
    ),
    fotoBloque('rancho-f1', 'rancho', 'Componentes del Rancho de Ánimas cantando en una casa del barrio'),
    parrafo(
      'rancho-p2',
      'La costumbre se ha transmitido de padres a hijos y ha cambiado poco con el tiempo: el mismo repertorio de coplas, la misma forma de llamar a la puerta y la misma ronda de aguinaldos. Los más pequeños participan cada vez más y aprenden las letras de memoria, sentados junto a los mayores.',
    ),
    fotoBloque('rancho-f2', 'romeria', 'Romería de Arbejales con trajes tradicionales'),
    parrafo(
      'rancho-p3',
      'Al terminar la ronda, el barrio se reúne en el local social para compartir la cena que preparan entre todos. Es el momento en que se reparten los papeles del año siguiente y se recuerdan las anécdotas de las rondas pasadas.',
    ),
    fotoBloque('rancho-f3', 'fiestas', 'Vecinos y vecinas cantando juntos durante las fiestas'),
    parrafo(
      'rancho-p4',
      'La asociación de vecinos colabora cada año en la organización del Rancho de Ánimas y mantiene viva la tradición con la ayuda de todos. Si quieres participar en la próxima ronda, acércate a las reuniones que celebramos en noviembre.',
    ),
    fotoBloque('rancho-f4', 'vecinos', 'Grupo de vecinos reunidos después de la ronda de aguinaldos'),
  ],
};

export const mockVideos: Video[] = [
  { titulo: 'Actuación del Rancho de Ánimas · Navidad 2025', youtubeId: 'aqz-KE-bpKQ' },
  { titulo: 'Ronda de aguinaldos por las casas del barrio', youtubeId: 'ScMzIvxBSi4' },
  { titulo: 'Encuentro de ranchos de la comarca en Teror', youtubeId: 'M7lc1UVf-VE' },
];

export const mockFiestas: Fiestas = {
  cuerpo: [
    parrafo(
      'fiestas-p1',
      'Las fiestas de Arbejales son el momento del año en que todo el barrio se reúne. Durante unos días, la plaza y la iglesia se llenan de vecinos, de familias que regresan para la ocasión y de visitantes que se acercan desde otros pagos de Teror.',
    ),
    fotoBloque('fiestas-f1', 'fiestas', 'Vecinos disfrutando de las fiestas en la plaza del barrio'),
    parrafo(
      'fiestas-p2',
      'El programa incluye la misa y la procesión con la imagen por las calles del barrio, la romería con trajes tradicionales, juegos para los más pequeños y una comida compartida. La música y el baile ponen el punto final a cada jornada.',
    ),
    fotoBloque('fiestas-f2', 'romeria', 'Romería con carretas y trajes tradicionales'),
    parrafo(
      'fiestas-p3',
      'Las fiestas se preparan entre todos: la directiva de la asociación coordina el programa y decenas de vecinos echan una mano con el montaje, la cocina y la limpieza. Cada año se publica el programa en la sección de noticias de la portada.',
    ),
  ],
};

export const mockFiestasAnios: FiestaAnio[] = [
  {
    anio: 2025,
    fotos: [
      foto('procesion', 'Procesión por la calle principal en las fiestas de 2025'),
      foto('romeria', 'Romería de las fiestas de 2025'),
      foto('plaza', 'Plaza llena de vecinos durante las fiestas de 2025'),
    ],
  },
  {
    anio: 2024,
    fotos: [
      foto('fiestas', 'Vecinos en las fiestas de 2024'),
      foto('rancho', 'Actuación del Rancho de Ánimas en las fiestas de 2024'),
    ],
  },
  {
    anio: 2023,
    fotos: [
      foto('vecinos', 'Vecinos preparando las fiestas de 2023'),
      foto('iglesia', 'Iglesia engalanada en las fiestas de 2023'),
      foto('paisaje', 'Vista del barrio durante las fiestas de 2023'),
      foto('ermita', 'Ermita durante las fiestas de 2023'),
    ],
  },
];

export const mockIglesia: Iglesia = {
  horarioMisas: 'Sábados a las 19:00\nDomingos y festivos a las 11:00',
  horarioCementerio: 'De lunes a domingo, de 9:00 a 18:00\nEn verano, hasta las 19:00',
  horarioArchivo: 'Martes y jueves, de 10:00 a 12:00\nCita previa en la parroquia',
  fotos: [
    foto('iglesia', 'Fachada de la iglesia de Arbejales'),
    foto('cementerio', 'Cementerio con muros de piedra blanca'),
    foto('ermita', 'Ermita situada junto al cementerio'),
    foto('procesion', 'Salida de la imagen durante la procesión de la fiesta'),
  ],
};

export const mockFotoDocumentos: Foto = foto('documentos', 'Mesa con carpetas y documentos de la asociación');

export const mockDocumentos: Record<string, Archivo[]> = {
  estatutos: [
    {
      titulo: 'Estatutos vigentes de la asociación',
      url: '/docs/estatutos-vigentes.pdf',
      fecha: '2019-02-16',
      nombre: 'estatutos-vigentes.pdf',
    },
    {
      titulo: 'Reglamento de régimen interno',
      url: '/docs/reglamento-regimen-interno.pdf',
      fecha: '2022-05-21',
      nombre: 'reglamento-regimen-interno.pdf',
    },
    {
      titulo: 'Acta de constitución de la asociación',
      url: '/docs/acta-constitucion.pdf',
      fecha: '1998-06-14',
      nombre: 'acta-constitucion.pdf',
    },
  ],
  actas: [
    {
      titulo: 'Acta de la asamblea general de marzo de 2026',
      url: '/docs/acta-asamblea-general-2026-03.pdf',
      fecha: '2026-03-07',
      nombre: 'acta-asamblea-general-2026-03.pdf',
    },
    {
      titulo: 'Acta de la junta directiva de junio de 2026',
      url: '/docs/acta-junta-directiva-2026-06.pdf',
      fecha: '2026-06-12',
      nombre: 'acta-junta-directiva-2026-06.pdf',
    },
    {
      titulo: 'Acta de la asamblea general de noviembre de 2025',
      url: '/docs/acta-asamblea-general-2025-11.pdf',
      fecha: '2025-11-15',
      nombre: 'acta-asamblea-general-2025-11.pdf',
    },
  ],
  cuentas: [
    {
      titulo: 'Estado de cuentas del ejercicio 2025',
      url: '/docs/cuentas-ejercicio-2025.pdf',
      fecha: '2026-01-31',
      nombre: 'cuentas-ejercicio-2025.pdf',
    },
    {
      titulo: 'Presupuesto del ejercicio 2026',
      url: '/docs/presupuesto-2026.pdf',
      fecha: '2026-01-31',
      nombre: 'presupuesto-2026.pdf',
    },
    {
      titulo: 'Estado de cuentas del ejercicio 2024',
      url: '/docs/cuentas-ejercicio-2024.pdf',
      fecha: '2025-02-01',
      nombre: 'cuentas-ejercicio-2024.pdf',
    },
  ],
  memorias: [
    {
      titulo: 'Memoria de actividades de 2025',
      url: '/docs/memoria-actividades-2025.pdf',
      fecha: '2026-01-31',
      nombre: 'memoria-actividades-2025.pdf',
    },
    {
      titulo: 'Memoria de actividades de 2024',
      url: '/docs/memoria-actividades-2024.pdf',
      fecha: '2025-02-01',
      nombre: 'memoria-actividades-2024.pdf',
    },
  ],
};

export const mockArchivos = (carpeta: string): Archivo[] => mockDocumentos[carpeta] ?? [];

/** Días ocupados de ejemplo, siempre alrededor de la fecha de hoy. */
export const mockOcupacion = (): DiaOcupado[] => [
  { fecha: enDias(-7), motivo: 'Reunión de la junta directiva' },
  { fecha: enDias(2), motivo: 'Taller de memoria del barrio' },
  { fecha: enDias(5), motivo: 'Montaje de la exposición de fotos antiguas' },
  { fecha: enDias(6), motivo: 'Montaje de la exposición de fotos antiguas' },
  { fecha: enDias(12), motivo: 'Reunión de la junta directiva' },
  { fecha: enDias(19), motivo: 'Fiestas del barrio: local reservado' },
  { fecha: enDias(20), motivo: 'Fiestas del barrio: local reservado' },
  { fecha: enDias(21), motivo: 'Fiestas del barrio: local reservado' },
];

export const mockTelefonos: Telefono[] = [
  { nombre: 'Ayuntamiento de Teror', numero: '928 61 00 00', web: 'https://teror.es/', nota: 'De lunes a viernes, de 8:00 a 15:00' },
  { nombre: 'Centro de Salud de Teror', numero: '928 61 04 00', nota: 'Cita previa en el 012' },
  { nombre: 'Farmacia de guardia', numero: '928 61 03 12', nota: 'Consulte la farmacia de turno' },
  { nombre: 'Taxi de Teror', numero: '928 61 12 12', nota: 'Servicio de 7:00 a 22:00' },
  { nombre: 'Biblioteca municipal', numero: '928 61 08 08', nota: 'De lunes a viernes, de 9:00 a 20:00' },
  { nombre: 'Protección Civil de Teror', numero: '928 61 10 10', nota: 'Solo para emergencias' },
  { nombre: 'Servicios municipales de Teror', web: 'https://teror.es/servicios-municipales/', nota: 'Catálogo de servicios del Ayuntamiento' },
];
