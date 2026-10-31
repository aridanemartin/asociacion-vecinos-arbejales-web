// Datos de ejemplo para poder trabajar en la interfaz mientras el panel de
// Sanity (https://asociacion-vecinos-arbejales.sanity.studio) está vacío.
//
// Se usan automáticamente cuando una consulta no devuelve contenido.
// Para forzarlos:      PUBLIC_SANITY_MOCK=true
// Para desactivarlos:  PUBLIC_SANITY_MOCK=false
//
// Los datos de ejemplo no llevan fotos. Los PDF viven en public/docs
// (se generan con `sh scripts/mock-docs.sh`).
import type {
  BloqueTexto,
  DiaOcupado,
  FiestaAnio,
  Fiestas,
  Historia,
  Iglesia,
  Novedad,
  Rancho,
  Telefono,
  Video,
} from '../lib/types';

/** Párrafo de texto enriquecido para la historia. */
const parrafo = (clave: string, texto: string): BloqueTexto => ({
  _type: 'block',
  _key: clave,
  children: [{ _type: 'span', _key: `${clave}-texto`, text: texto, marks: [] }],
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
  },
  {
    etiqueta: 'Noticia',
    titulo: 'El local de la asociación abre los sábados por la tarde',
    fecha: '2026-10-10',
    resumen:
      'A partir de este mes, el local social permanecerá abierto los sábados de 17:00 a 20:00 para que los vecinos puedan reunirse, leer o jugar a las cartas. La apertura correrá a cargo de los miembros de la junta, que se irán turnando.',
  },
  {
    etiqueta: 'Evento',
    titulo: 'Nuevo calendario de actividades para el otoño',
    fecha: '2026-09-28',
    resumen:
      'Hemos preparado talleres de memoria, un curso básico de teléfono móvil y dos salidas para conocer los caminos del barrio. Las inscripciones se pueden hacer en el local o escribiendo al correo de la asociación.',
  },
  {
    etiqueta: 'Noticia',
    titulo: 'Limpieza vecinal del entorno de la iglesia',
    fecha: '2026-09-15',
    resumen:
      'Una treintena de vecinos participó en la limpieza del camino y de la plaza de la iglesia. Gracias a todos los que dedicaron su mañana. La asociación solicitará al Ayuntamiento que reponga los contenedores retirados.',
    enlace: 'https://infonortedigital.com/',
  },
  {
    etiqueta: 'Convocatoria',
    titulo: 'Reunión informativa sobre el camino de Las Mesas',
    fecha: '2026-08-30',
    resumen:
      'El Ayuntamiento ha anunciado el arreglo del camino de Las Mesas. El jueves 3 de septiembre, a las 19:00, nos reuniremos en el local para recoger las aportaciones de los vecinos antes de la reunión con el concejal de Obras.',
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
    parrafo(
      'hist-p2',
      'Durante generaciones, las familias del barrio se organizaron en torno a la iglesia, al lavadero y a las eras compartidas. Muchas de las casas que hoy vemos levantadas con piedra y barro se construyeron con las manos de los propios vecinos, que se ayudaban unos a otros en las tareas más pesadas.',
    ),
    parrafo(
      'hist-p3',
      'La asociación de vecinos nació para dar voz a ese modo de hacer las cosas: cuidar el barrio entre todos, mantener las tradiciones y reclamar los servicios que hacen falta. Desde entonces ha organizado fiestas, romerías, talleres y reuniones, y ha acompañado a los vecinos en los momentos difíciles.',
    ),
    parrafo(
      'hist-p4',
      'Boni ha recopilado durante años fotografías, recuerdos y testimonios de las personas mayores del barrio. Ese trabajo es el origen de esta página: un lugar donde guardar la memoria de Arbejales y donde las nuevas generaciones puedan reconocerse en ella.',
    ),
    parrafo(
      'hist-p5',
      'La historia del barrio sigue escribiéndose cada día, con las fiestas de cada año, con las obras que llegan y con la gente que decide quedarse y cuidar lo que hay. Si tienes fotos antiguas o recuerdos que contar, escríbenos: tu aportación ayuda a completar este relato.',
    ),
  ],
};

export const mockRancho: Rancho = {
  cuerpo: [
    parrafo(
      'rancho-p1',
      'El Rancho de Ánimas de Arbejales es una de las tradiciones más queridas del barrio. Cada Navidad, un grupo de vecinos recorre las casas cantando coplas y villancicos al son de la guitarra, el timple y las panderetas, recordando a quienes ya no están y deseando un buen año a los que abren su puerta.',
    ),
    parrafo(
      'rancho-p2',
      'La costumbre se ha transmitido de padres a hijos y ha cambiado poco con el tiempo: el mismo repertorio de coplas, la misma forma de llamar a la puerta y la misma ronda de aguinaldos. Los más pequeños participan cada vez más y aprenden las letras de memoria, sentados junto a los mayores.',
    ),
    parrafo(
      'rancho-p3',
      'Al terminar la ronda, el barrio se reúne en el local social para compartir la cena que preparan entre todos. Es el momento en que se reparten los papeles del año siguiente y se recuerdan las anécdotas de las rondas pasadas.',
    ),
    parrafo(
      'rancho-p4',
      'La asociación de vecinos colabora cada año en la organización del Rancho de Ánimas y mantiene viva la tradición con la ayuda de todos. Si quieres participar en la próxima ronda, acércate a las reuniones que celebramos en noviembre.',
    ),
  ],
};

export const mockVideos: Video[] = [
  { titulo: 'Rancho de Ánimas de Arbejales-Teror, F. Cárdenes y P. Herrera, 1968-1969', youtubeId: 'iJnZJuWOnjE' },
  { titulo: 'Rancho de Ánimas de Arbejales-Teror, Raíces, 1974', youtubeId: 'ZMGOOGA0Cqo' },
  { titulo: 'Rancho de Ánimas de Arbejales-Teror, Pino Santo, 6/2/1982', youtubeId: 'ATmt-mGxN8w' },
  { titulo: 'Rancho de Ánimas de Arbejales-Teror, Suso Ríos, 28/2/2026', youtubeId: 'mr_YEbFgC5Q' },
  { titulo: 'Rancho de Ánimas de Arbejales-Teror: Con el timple a cuestas (6-07-2026)', youtubeId: 'UYq2bFe979I' },
];

export const mockFiestas: Fiestas = {
  cuerpo: [
    parrafo(
      'fiestas-p1',
      'Las fiestas de Arbejales son el momento del año en que todo el barrio se reúne. Durante unos días, la plaza y la iglesia se llenan de vecinos, de familias que regresan para la ocasión y de visitantes que se acercan desde otros pagos de Teror.',
    ),
    parrafo(
      'fiestas-p2',
      'El programa incluye la misa y la procesión con la imagen por las calles del barrio, la romería con trajes tradicionales, juegos para los más pequeños y una comida compartida. La música y el baile ponen el punto final a cada jornada.',
    ),
    parrafo(
      'fiestas-p3',
      'Las fiestas se preparan entre todos: la directiva de la asociación coordina el programa y decenas de vecinos echan una mano con el montaje, la cocina y la limpieza. Cada año se publica el programa en la sección de noticias de la portada.',
    ),
  ],
};

export const mockFiestasAnios: FiestaAnio[] = [];

export const mockIglesia: Iglesia = {
  horarioMisas: 'Sábados a las 19:00\nDomingos y festivos a las 11:00',
  horarioCementerio: 'De lunes a domingo, de 9:00 a 18:00\nEn verano, hasta las 19:00',
  horarioArchivo: 'Martes y jueves, de 10:00 a 12:00\nCita previa en la parroquia',
  fotos: [],
};

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
