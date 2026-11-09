import type {StructureBuilder, StructureResolver} from 'sanity/structure'
import {FOLDERS} from './schemas/paginas'

const single = (S: StructureBuilder, type: string, title: string) =>
  S.listItem().title(title).id(type).child(S.document().schemaType(type).documentId(type).title(title))

const typeList = (S: StructureBuilder, type: string, title: string) =>
  S.listItem().title(title).child(S.documentTypeList(type).title(title))

// El menú del panel sigue el orden de la web: portada y secciones numeradas.
export const structure: StructureResolver = (S) =>
  S.list()
    .title('¿Qué quiere cambiar?')
    .items([
      typeList(S, 'novedad', 'Portada · Noticias, eventos y convocatorias'),
      S.divider(),
      single(S, 'historia', '1 · Historia de Arbejales'),
      S.listItem()
        .title('2 · Rancho de Ánimas Arbejales - Teror')
        .child(
          S.list()
            .title('Rancho de Ánimas')
            .items([
              single(S, 'ranchoAnimas', 'Historia del Rancho de Ánimas (textos y fotos)'),
              typeList(S, 'video', 'Vídeos del Rancho de Ánimas'),
            ]),
        ),
      S.listItem()
        .title('3 · Nuestras fiestas')
        .child(
          S.list()
            .title('Nuestras fiestas')
            .items([
              single(S, 'nuestrasFiestas', 'Descripción de las fiestas (textos y fotos)'),
              typeList(S, 'fiestaAnio', 'Fotos de años anteriores (un documento por año)'),
            ]),
        ),
      single(S, 'iglesiaCementerio', '4 · Iglesia y cementerio (horarios y fotos)'),
      S.listItem()
        .title('5 · Documentos de la asociación de vecinos')
        .child(
          S.list()
            .title('Documentos')
            .items([
              ...FOLDERS.map((folder) =>
                S.listItem()
                  .title(`Carpeta: ${folder.title}`)
                  .id(folder.value)
                  .child(
                    S.documentList()
                      .title(folder.title)
                      .schemaType('documento')
                      .filter('_type == "documento" && carpeta == $carpeta')
                      .params({carpeta: folder.value})
                      .initialValueTemplates([S.initialValueTemplateItem('documento-en-carpeta', {carpeta: folder.value})]),
                  ),
              ),
            ]),
        ),
      typeList(S, 'ocupacionLocal', '6 · Disponibilidad del local (días ocupados)'),
      typeList(S, 'telefono', '8 · Contactos (teléfonos y webs)'),
    ])
