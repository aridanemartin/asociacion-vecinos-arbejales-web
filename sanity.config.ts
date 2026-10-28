import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'
import {esESLocale} from '@sanity/locale-es-es'
import {schemaTypes, SINGLETONS} from './sanity/schemas'
import {structure} from './sanity/structure'
import {projectId, dataset} from './sanity/env'

export default defineConfig({
  name: 'default',
  title: 'Panel de la Asociación de Vecinos Llano Roque',
  projectId,
  dataset,
  plugins: [structureTool({structure}), esESLocale()],
  schema: {
    types: schemaTypes,
    templates: (prev) => [
      ...prev.filter((t) => t.schemaType !== 'documento'),
      {
        id: 'documento-en-carpeta',
        title: 'Documento',
        schemaType: 'documento',
        parameters: [{name: 'carpeta', type: 'string'}],
        value: (p: {carpeta: string}) => ({carpeta: p.carpeta}),
      },
    ],
  },
  document: {
    // Las páginas únicas no se pueden crear de nuevo, duplicar ni borrar.
    newDocumentOptions: (prev, {creationContext}) =>
      creationContext.type === 'global' ? prev.filter((t) => !SINGLETONS.includes(t.templateId)) : prev,
    actions: (prev, {schemaType}) =>
      SINGLETONS.includes(schemaType)
        ? prev.filter(({action}) => action && !['unpublish', 'delete', 'duplicate'].includes(action))
        : prev,
  },
})
