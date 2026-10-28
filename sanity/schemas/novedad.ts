import {defineField, defineType} from 'sanity'

export const novedad = defineType({
  name: 'novedad',
  title: 'Noticia, evento o convocatoria',
  type: 'document',
  fields: [
    defineField({
      name: 'etiqueta',
      title: '¿Qué tipo de publicación es?',
      type: 'string',
      options: {
        layout: 'radio',
        list: [
          {title: 'Noticia (algo que ha ocurrido)', value: 'Noticia'},
          {title: 'Evento (una fiesta, actividad o acto del barrio o de la asociación)', value: 'Evento'},
          {title: 'Convocatoria (invitación a una reunión o a un acto)', value: 'Convocatoria'},
        ],
      },
      initialValue: 'Noticia',
      validation: (r) => r.required().error('Elija una de las tres opciones.'),
    }),
    defineField({
      name: 'titulo',
      title: 'Título',
      type: 'string',
      description: 'Escriba el título como quiere que lo lean los vecinos. Por ejemplo: «Asamblea general de vecinos».',
      validation: (r) => r.required().max(90).error('Escriba un título (máximo 90 letras).'),
    }),
    defineField({
      name: 'fecha',
      title: 'Fecha',
      type: 'date',
      description:
        'Día de la publicación. Si es una convocatoria, ponga el día en que se celebra el acto. Pulse el recuadro y elija el día en el calendario.',
      initialValue: () => new Date().toISOString().slice(0, 10),
      validation: (r) => r.required().error('Elija una fecha.'),
    }),
    defineField({
      name: 'resumen',
      title: 'Texto',
      type: 'text',
      rows: 5,
      description:
        'Explique en dos o tres frases de qué trata. Si es una convocatoria, escriba también la hora y el lugar.',
      validation: (r) => r.required().max(400).error('Escriba el texto (máximo 400 letras).'),
    }),
    defineField({
      name: 'foto',
      title: 'Imagen (opcional)',
      type: 'foto',
      description: 'Foto o cartel que acompaña a la publicación. Si no tiene ninguna, puede dejarlo vacío.',
    }),
    defineField({
      name: 'enlace',
      title: 'Enlace a otra página (opcional)',
      type: 'url',
      description:
        'Solo si quiere que al pulsar el título se abra otra página web. Copie la dirección completa, que empieza por https://. Si no, déjelo vacío.',
      validation: (r) => r.uri({scheme: ['http', 'https']}).error('La dirección debe empezar por https://'),
    }),
  ],
  orderings: [{title: 'Más recientes primero', name: 'fechaDesc', by: [{field: 'fecha', direction: 'desc'}]}],
  preview: {
    select: {title: 'titulo', etiqueta: 'etiqueta', fecha: 'fecha', media: 'foto.imagen'},
    prepare: ({title, etiqueta, fecha, media}) => ({title, subtitle: `${etiqueta ?? ''} · ${fecha ?? ''}`, media}),
  },
})
