import type {StructureBuilder, StructureResolver} from 'sanity/structure'
import {CARPETAS} from './schemas/paginas'

const single = (S: StructureBuilder, type: string, title: string) =>
  S.listItem().title(title).id(type).child(S.document().schemaType(type).documentId(type).title(title))

const lista = (S: StructureBuilder, type: string, title: string) =>
  S.listItem().title(title).child(S.documentTypeList(type).title(title))

// El menú del panel sigue el orden de la web: portada y secciones numeradas.
export const structure: StructureResolver = (S) =>
  S.list()
    .title('¿Qué quiere cambiar?')
    .items([
      lista(S, 'novedad', 'Portada · Noticias, eventos y convocatorias'),
      S.divider(),
      single(S, 'historia', '1 · Historia de Arbejales'),
      S.listItem()
        .title('2 · Rancho de Ánimas Arbejales')
        .child(
          S.list()
            .title('Rancho de Ánimas')
            .items([
              single(S, 'ranchoAnimas', 'Historia del Rancho de Ánimas (textos y fotos)'),
              lista(S, 'video', 'Vídeos del Rancho de Ánimas'),
            ]),
        ),
      S.listItem()
        .title('3 · Nuestras fiestas')
        .child(
          S.list()
            .title('Nuestras fiestas')
            .items([
              single(S, 'nuestrasFiestas', 'Descripción de las fiestas (textos y fotos)'),
              lista(S, 'fiestaAnio', 'Fotos de años anteriores (un documento por año)'),
            ]),
        ),
      single(S, 'iglesiaCementerio', '4 · Iglesia y cementerio (horarios y fotos)'),
      S.listItem()
        .title('5 · Documentos de la asociación de vecinos')
        .child(
          S.list()
            .title('Documentos')
            .items([
              ...CARPETAS.map((c) =>
                S.listItem()
                  .title(`Carpeta: ${c.title}`)
                  .id(c.value)
                  .child(
                    S.documentList()
                      .title(c.title)
                      .schemaType('documento')
                      .filter('_type == "documento" && carpeta == $carpeta')
                      .params({carpeta: c.value})
                      .initialValueTemplates([S.initialValueTemplateItem('documento-en-carpeta', {carpeta: c.value})]),
                  ),
              ),
            ]),
        ),
      lista(S, 'ocupacionLocal', '6 · Disponibilidad del local (días ocupados)'),
      lista(S, 'telefono', '8 · Contactos (teléfonos y webs)'),
    ])
