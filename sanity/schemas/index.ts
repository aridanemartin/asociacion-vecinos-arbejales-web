import {foto} from './foto'
import {novedad} from './novedad'
import {
  documento,
  fiestaAnio,
  historia,
  iglesiaCementerio,
  nuestrasFiestas,
  ocupacionLocal,
  paginaDocumentos,
  ranchoAnimas,
  telefono,
  video,
} from './paginas'

export const schemaTypes = [
  foto,
  novedad,
  historia,
  ranchoAnimas,
  video,
  nuestrasFiestas,
  fiestaAnio,
  iglesiaCementerio,
  paginaDocumentos,
  documento,
  ocupacionLocal,
  telefono,
]

// Documentos que solo existen una vez (no se pueden crear ni borrar).
export const SINGLETONS = ['historia', 'ranchoAnimas', 'nuestrasFiestas', 'iglesiaCementerio', 'paginaDocumentos']
