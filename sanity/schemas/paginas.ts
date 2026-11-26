import {defineArrayMember, defineField, defineType, type ValidationContext} from 'sanity'
import {FileSizeWarning} from '../components/FileSizeWarning'
import {fotosField} from './foto'

// Sanity uses SI units: 1 MB = 1,000,000 bytes.
const MAX_FILE_BYTES = 10 * 1_000_000

// The size is not stored in the file reference: it lives in the asset
// document. Cache it per reference so validation does not repeat the query.
const fileSizeCache = new Map<string, Promise<number | null>>()

const getFileSize = (context: ValidationContext, ref: string) => {
  let request = fileSizeCache.get(ref)
  if (!request) {
    request = context
      .getClient({apiVersion: '2025-01-01'})
      .fetch<number | null>('*[_id == $ref][0].size', {ref})
    fileSizeCache.set(ref, request)
    // Do not cache a failed request; let the next validation retry it.
    request.catch(() => fileSizeCache.delete(ref))
  }
  return request
}

// Prevents publishing documents larger than 10 MB.
const validateFileSize = async (value: unknown, context: ValidationContext) => {
  const ref = (value as {asset?: {_ref?: string}} | undefined)?.asset?._ref
  if (!ref) return true
  try {
    const size = await getFileSize(context, ref)
    if (!size || size <= MAX_FILE_BYTES) return true
    const sizeInMb = (size / 1_000_000).toFixed(1)
    return `El archivo pesa ${sizeInMb} MB y el máximo es 10 MB. Compímalo antes de subirlo y vuelva a intentarlo.`
  } catch {
    // If the size cannot be checked, do not block publishing.
    return true
  }
}

const schedule = (name: string, title: string, example: string) =>
  defineField({
    name,
    title,
    type: 'text',
    rows: 4,
    description: `Escriba los días y las horas, uno por línea. Por ejemplo: ${example}`,
  })

// Quién atiende cada horario y cómo contactar. Todo opcional.
const contact = (name: string, title: string) =>
  defineField({
    name,
    title,
    type: 'object',
    options: {collapsible: true, collapsed: false},
    fields: [
      defineField({
        name: 'responsable',
        title: 'Quién lo gestiona (opcional)',
        type: 'string',
        description: 'Por ejemplo: «Parroquia de Arbejales» o el nombre de la empresa.',
      }),
      defineField({
        name: 'telefono',
        title: 'Teléfono (opcional)',
        type: 'string',
        description: 'Escriba el número tal como quiere que aparezca. Por ejemplo: 613 11 85 29.',
      }),
      defineField({
        name: 'email',
        title: 'Correo electrónico (opcional)',
        type: 'email',
      }),
    ],
  })

// Texto enriquecido con fotos intercaladas entre los párrafos.
const bodyField = (title: string, description: string) =>
  defineField({
    name: 'cuerpo',
    title,
    type: 'array',
    of: [
      defineArrayMember({
        type: 'block',
        title: 'Texto',
        styles: [
          {title: 'Párrafo', value: 'normal'},
          {title: 'Título', value: 'h2'},
          {title: 'Subtítulo', value: 'h3'},
          {title: 'Cita', value: 'blockquote'},
        ],
        lists: [
          {title: 'Lista con viñetas', value: 'bullet'},
          {title: 'Lista numerada', value: 'number'},
        ],
        marks: {
          decorators: [
            {title: 'Negrita', value: 'strong'},
            {title: 'Cursiva', value: 'em'},
          ],
          annotations: [],
        },
      }),
      defineArrayMember({type: 'foto', title: 'Foto'}),
    ],
    description,
  })

// 1 · Historia de Arbejales
export const historia = defineType({
  name: 'historia',
  title: 'Historia de Arbejales',
  type: 'document',
  fields: [
    bodyField(
      'Textos y fotos de la historia',
      'Escriba o pegue los textos que recopila Boni. Con la barra de herramientas puede poner negrita, cursiva, títulos, listas y citas. Para poner una foto entre dos párrafos, haga clic al final del párrafo, pulse el botón «+» y elija «Foto». Las fotos deben estar en formato WebP.',
    ),
  ],
  preview: {prepare: () => ({title: 'Historia de Arbejales'})},
})

// 2 · Rancho de Ánimas (historia con fotos; los vídeos son documentos aparte)
export const ranchoAnimas = defineType({
  name: 'ranchoAnimas',
  title: 'Rancho de Ánimas Arbejales - Teror',
  type: 'document',
  fields: [
    bodyField(
      'Textos y fotos de la historia del Rancho de Ánimas',
      'Escriba aquí la historia del Rancho de Ánimas. Con la barra de herramientas puede poner negrita, cursiva, títulos, listas y citas. Para poner una foto entre dos párrafos, haga clic al final del párrafo, pulse el botón «+» y elija «Foto». Las fotos deben estar en formato WebP.',
    ),
  ],
  preview: {prepare: () => ({title: 'Rancho de Ánimas: historia'})},
})

export const video = defineType({
  name: 'video',
  title: 'Vídeo del Rancho de Ánimas',
  type: 'document',
  orderings: [
    {
      title: 'Orden de la lista',
      name: 'ordenAsc',
      by: [{field: 'orden', direction: 'asc'}],
    },
  ],
  fields: [
    defineField({
      name: 'titulo',
      title: 'Título del vídeo',
      type: 'string',
      description: 'Por ejemplo: «Actuación del Rancho de Ánimas, Navidad 2025».',
      validation: (r) => r.required().max(100).error('Escriba un título para el vídeo.'),
    }),
    defineField({
      name: 'orden',
      title: 'Orden en la lista',
      type: 'number',
      description:
        'Los vídeos se muestran de menor a mayor: el 1 aparece primero. Si lo deja vacío, el vídeo se coloca al final.',
      initialValue: 10,
      validation: (r) => r.integer().min(0),
    }),
    defineField({
      name: 'enlace',
      title: 'Enlace del vídeo de YouTube',
      type: 'url',
      description:
        'Abra el vídeo en YouTube, copie la dirección que aparece arriba en el navegador y péguela aquí. Debe empezar por https://www.youtube.com/ o por https://youtu.be/',
      validation: (r) =>
        r
          .required()
          .custom((v) =>
            !v || /^https:\/\/(www\.|m\.)?(youtube\.com|youtu\.be)\//.test(v)
              ? true
              : 'La dirección debe ser de YouTube y empezar por https://www.youtube.com/ o https://youtu.be/',
          ),
    }),
  ],
  preview: {select: {title: 'titulo', subtitle: 'enlace'}},
})

// 3 · Nuestras fiestas (descripción con fotos; las fotos de cada año son documentos aparte)
export const nuestrasFiestas = defineType({
  name: 'nuestrasFiestas',
  title: 'Nuestras fiestas',
  type: 'document',
  fields: [
    bodyField(
      'Descripción de las fiestas',
      'Cuente cómo son las fiestas de Arbejales. Con la barra de herramientas puede poner negrita, cursiva, títulos, listas y citas. Para poner una foto entre dos párrafos, haga clic al final del párrafo, pulse el botón «+» y elija «Foto». Las fotos deben estar en formato WebP.',
    ),
  ],
  preview: {prepare: () => ({title: 'Nuestras fiestas: descripción'})},
})

export const fiestaAnio = defineType({
  name: 'fiestaAnio',
  title: 'Fotos de las fiestas de un año',
  type: 'document',
  fields: [
    defineField({
      name: 'anio',
      title: '¿De qué año son las fotos?',
      type: 'number',
      description: 'Escriba el año con cuatro cifras. Por ejemplo: 2025. Solo puede haber un documento por año.',
      validation: (r) => r.required().integer().min(1900).max(2100).error('Escriba un año con cuatro cifras. Por ejemplo: 2025.'),
    }),
    fotosField('Añada aquí las fotos de las fiestas de ese año.', 'Fotos de las fiestas', 20),
  ],
  orderings: [{title: 'Más recientes primero', name: 'anioDesc', by: [{field: 'anio', direction: 'desc'}]}],
  preview: {select: {title: 'anio'}, prepare: ({title}) => ({title: title ? `Fiestas de ${title}` : 'Fiestas (sin año)'})},
})

// 3 · Iglesia y cementerio
export const iglesiaCementerio = defineType({
  name: 'iglesiaCementerio',
  title: 'Iglesia y cementerio',
  type: 'document',
  fields: [
    schedule('horarioMisas', 'Horario de misas', '«Sábados a las 19:00» y en otra línea «Domingos a las 11:00».'),
    contact('contactoMisas', 'Contacto para las misas'),
    schedule('horarioCementerio', 'Horario del cementerio', '«De lunes a domingo, de 9:00 a 18:00».'),
    contact('contactoCementerio', 'Contacto del cementerio'),
    schedule('horarioArchivo', 'Horario del archivo parroquial', '«Martes y jueves, de 10:00 a 12:00».'),
    contact('contactoArchivo', 'Contacto del archivo parroquial'),
    fotosField(
      'Añada aquí las fotos de la iglesia y del cementerio. La primera foto de la lista es la que se muestra junto a los horarios.',
      'Fotos de la iglesia y el cementerio',
    ),
  ],
  preview: {prepare: () => ({title: 'Iglesia y cementerio: horarios y fotos'})},
})

// 4 · Documentos (carpetas y archivos son documentos aparte)
export const carpeta = defineType({
  name: 'carpeta',
  title: 'Carpeta de documentos',
  type: 'document',
  fields: [
    defineField({
      name: 'titulo',
      title: 'Nombre de la carpeta',
      type: 'string',
      description: 'Por ejemplo: «Actas de la asociación».',
      validation: (r) => r.required().max(80).error('Escriba el nombre de la carpeta (máximo 80 letras).'),
    }),
    defineField({
      name: 'descripcion',
      title: 'Descripción (opcional)',
      type: 'text',
      rows: 2,
      description: 'Una frase que explique qué hay en la carpeta. Se muestra debajo del nombre.',
      validation: (r) => r.max(200).error('Máximo 200 letras.'),
    }),
    defineField({
      name: 'orden',
      title: 'Posición (opcional)',
      type: 'number',
      description: 'Las carpetas se ordenan de menor a mayor número (1, 2, 3…). Si lo deja vacío, va al final.',
    }),
    defineField({
      name: 'slug',
      title: 'Dirección en la web (opcional)',
      type: 'slug',
      options: {source: 'titulo'},
      description: 'Si la deja vacía, se crea a partir del nombre de la carpeta. No hace falta tocarla.',
    }),
  ],
  orderings: [
    {
      title: 'Posición',
      name: 'ordenAsc',
      by: [
        {field: 'orden', direction: 'asc'},
        {field: 'titulo', direction: 'asc'},
      ],
    },
  ],
  preview: {select: {title: 'titulo', subtitle: 'descripcion'}},
})

export const documento = defineType({
  name: 'documento',
  title: 'Documento de la asociación',
  type: 'document',
  fields: [
    defineField({
      name: 'carpeta',
      title: '¿En qué carpeta va este documento?',
      type: 'reference',
      to: [{type: 'carpeta'}],
      options: {disableNew: true},
      description: 'Si quiere cambiarlo de carpeta, elija aquí otra.',
      validation: (r) => r.required().error('Elija la carpeta donde debe aparecer el documento.'),
    }),
    defineField({
      name: 'titulo',
      title: 'Nombre del documento',
      type: 'string',
      description: 'Por ejemplo: «Acta de la asamblea de marzo de 2026» o «Cuentas del año 2025».',
      validation: (r) => r.required().max(120).error('Escriba el nombre del documento.'),
    }),
    defineField({
      name: 'fecha',
      title: 'Fecha del documento (opcional)',
      type: 'date',
      description: 'Día en que se firmó o aprobó el documento. Si no lo sabe, déjelo vacío.',
    }),
    defineField({
      name: 'archivo',
      title: 'Archivo',
      type: 'file',
      options: {accept: '.pdf,.doc,.docx,.odt,.xls,.xlsx'},
      components: {input: FileSizeWarning},
      description:
        'Pulse «Subir» y elija el archivo de su ordenador (mejor si es PDF), o arrástrelo hasta este recuadro. El archivo no puede superar los 10 MB.',
      validation: (r) =>
        r
          .required()
          .error('Falta el archivo. Pulse «Subir» y elíjalo.')
          .custom(validateFileSize),
    }),
  ],
  orderings: [{title: 'Más recientes primero', name: 'fechaDesc', by: [{field: 'fecha', direction: 'desc'}]}],
  preview: {select: {title: 'titulo', subtitle: 'fecha'}},
})

// 5 · Disponibilidad del local
export const ocupacionLocal = defineType({
  name: 'ocupacionLocal',
  title: 'Día ocupado del local',
  type: 'document',
  fields: [
    defineField({
      name: 'fechaInicio',
      title: 'Primer día en que el local está ocupado',
      type: 'date',
      description: 'Pulse el recuadro y elija el día en el calendario.',
      validation: (r) => r.required().error('Elija el día en que el local está ocupado.'),
    }),
    defineField({
      name: 'fechaFin',
      title: 'Último día (solo si son varios días seguidos)',
      type: 'date',
      description: 'Si el local está ocupado un solo día, deje este recuadro vacío.',
      validation: (r) =>
        r.custom((fin, ctx) => {
          const ini = (ctx.document as {fechaInicio?: string})?.fechaInicio
          return !fin || !ini || fin >= ini ? true : 'El último día no puede ser anterior al primer día.'
        }),
    }),
    defineField({
      name: 'motivo',
      title: 'Motivo (opcional)',
      type: 'string',
      description:
        'Por ejemplo: «Reunión de la directiva». Los vecinos verán este texto en la web, así que no escriba nombres ni datos personales.',
      validation: (r) => r.max(80),
    }),
  ],
  orderings: [{title: 'Más recientes primero', name: 'inicioDesc', by: [{field: 'fechaInicio', direction: 'desc'}]}],
  preview: {
    select: {ini: 'fechaInicio', fin: 'fechaFin', motivo: 'motivo'},
    prepare: ({ini, fin, motivo}) => ({title: fin ? `Del ${ini} al ${fin}` : `${ini ?? 'Sin fecha'}`, subtitle: motivo}),
  },
})

// Contacto que aparece en «Disponibilidad del local» para pedir el local.
export const reservasLocal = defineType({
  name: 'reservasLocal',
  title: 'Contacto para reservar el local',
  type: 'document',
  fields: [contact('contactoReservas', 'Contacto para reservar el local')],
  preview: {prepare: () => ({title: 'Contacto para reservar el local'})},
})

// 7 · Contactos de interés (teléfonos y webs)
export const telefono = defineType({
  name: 'telefono',
  title: 'Contacto de interés',
  type: 'document',
  fields: [
    defineField({
      name: 'nombre',
      title: '¿Quién es el contacto?',
      type: 'string',
      description: 'Por ejemplo: «Ayuntamiento de Teror» o «Centro de salud».',
      validation: (r) => r.required().max(80).error('Escriba el nombre.'),
    }),
    defineField({
      name: 'numero',
      title: 'Número de teléfono (opcional)',
      type: 'string',
      description:
        'Escriba solo el número, con números y espacios. Por ejemplo: 928 61 00 00. Si solo quiere poner una página web, déjelo vacío.',
      validation: (r) =>
        r
          .regex(/^\+?[\d\s]{3,20}$/, {name: 'teléfono'})
          .error('Escriba solo números y espacios. Por ejemplo: 928 61 00 00')
          .custom((numero, ctx) =>
            numero || (ctx.document as {web?: string})?.web ? true : 'Escriba un teléfono o una página web (o los dos).',
          ),
    }),
    defineField({
      name: 'web',
      title: 'Página web (opcional)',
      type: 'url',
      description:
        'Abra la página en el navegador, copie la dirección de arriba y péguela aquí. Debe empezar por https://. Por ejemplo: https://teror.es/',
      validation: (r) =>
        r
          .uri({scheme: ['http', 'https']})
          .error('La dirección debe empezar por https://')
          .custom((web, ctx) =>
            web || (ctx.document as {numero?: string})?.numero ? true : 'Escriba un teléfono o una página web (o los dos).',
          ),
    }),
    defineField({
      name: 'nota',
      title: 'Aclaración (opcional)',
      type: 'string',
      description: 'Por ejemplo: «De lunes a viernes, de 8:00 a 15:00».',
      validation: (r) => r.max(120),
    }),
  ],
  preview: {
    select: {title: 'nombre', numero: 'numero', web: 'web'},
    prepare: ({title, numero, web}) => ({title, subtitle: [numero, web].filter(Boolean).join(' · ')}),
  },
})
