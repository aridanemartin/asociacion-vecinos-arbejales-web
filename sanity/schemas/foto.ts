import {defineField, defineType} from 'sanity'
import {ImagesFieldWarning} from '../components/ImagesFieldWarning'
import {WebPFieldWarning} from '../components/WebPFieldWarning'

// Comprueba que el asset subido sea WebP (el id interno termina en "-webp").
const esWebP = (imagen?: {asset?: {_ref?: string}}) => {
  const ref = imagen?.asset?._ref
  return !ref || ref.endsWith('-webp')
}

// Una foto con su descripción. Se reutiliza en todas las secciones.
export const foto = defineType({
  name: 'foto',
  title: 'Foto',
  type: 'object',
  fields: [
    defineField({
      name: 'imagen',
      title: 'Foto',
      type: 'image',
      options: {hotspot: true, accept: 'image/webp'},
      components: {input: WebPFieldWarning},
      description:
        'Pulse «Subir» y elija la foto de su ordenador, o arrastre la foto hasta este recuadro. Debe estar en formato WebP.',
      validation: (r) =>
        r
          .required()
          .error('Falta la foto. Pulse «Subir» y elíjala.')
          .custom((value) =>
            esWebP(value as {asset?: {_ref?: string}} | undefined)
              ? true
              : 'La foto debe estar en formato WebP. Conviértela antes de subirla (por ejemplo con Squoosh) y vuelve a intentarlo.',
          ),
    }),
    defineField({
      name: 'descripcion',
      title: '¿Qué se ve en la foto?',
      type: 'string',
      description:
        'Escriba una frase corta. Por ejemplo: «Procesión por la calle principal de Arbejales». Sirve para las personas que no pueden ver la imagen.',
      validation: (r) =>
        r.required().max(140).error('Escriba una frase corta (máximo 140 letras) que explique qué se ve en la foto.'),
    }),
  ],
  preview: {select: {title: 'descripcion', media: 'imagen'}},
})

// Lista de fotos que se puede añadir a cualquier página.
export const fotosField = (description: string, title = 'Fotos', max?: number) =>
  defineField({
    name: 'fotos',
    title,
    type: 'array',
    of: [{type: 'foto'}],
    components: {input: ImagesFieldWarning},
    validation: (r) => (max ? r.max(max).error(`Solo se pueden subir ${max} fotos. Elimine alguna para poder publicar.`) : r),
    description: `${description}${max ? ` Máximo ${max} fotos.` : ''} Pulse «Añadir elemento» para cada foto nueva. Para quitar una foto, pulse los tres puntos que hay a su derecha y elija «Eliminar».`,
  })
