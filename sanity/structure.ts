import type {StructureBuilder, StructureResolver} from 'sanity/structure'

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
      // Las carpetas se crean, renombran y borran aquí; cada una abre sus datos y sus archivos.
      S.listItem()
        .title('5 · Documentos de la asociación de vecinos')
        .child(
          S.documentTypeList('carpeta')
            .title('Carpetas (pulse + para crear una nueva)')
            .defaultOrdering([
              {field: 'orden', direction: 'asc'},
              {field: 'titulo', direction: 'asc'},
            ])
            .child((carpetaId) =>
              S.list()
                .title('Carpeta')
                .items([
                  S.listItem()
                    .title('Archivos de esta carpeta')
                    .id('archivos')
                    .child(
                      S.documentList()
                        .title('Archivos (pulse + para añadir uno)')
                        .schemaType('documento')
                        .filter('_type == "documento" && carpeta._ref == $carpetaId')
                        .params({carpetaId})
                        .initialValueTemplates([S.initialValueTemplateItem('documento-en-carpeta', {carpetaId})]),
                    ),
                  S.listItem()
                    .title('Nombre y descripción de la carpeta (o borrarla)')
                    .id('datos')
                    .child(S.document().schemaType('carpeta').documentId(carpetaId)),
                ]),
            ),
        ),
      S.listItem()
        .title('6 · Disponibilidad del local')
        .child(
          S.list()
            .title('Disponibilidad del local')
            .items([
              typeList(S, 'ocupacionLocal', 'Días ocupados del local'),
              single(S, 'reservasLocal', 'Contacto para reservar el local (teléfono o correo)'),
            ]),
        ),
      typeList(S, 'telefono', '8 · Contactos (teléfonos y webs)'),
    ])
