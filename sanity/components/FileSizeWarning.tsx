import { Card, Stack, Text } from '@sanity/ui'
import type { FileInputProps } from 'sanity'

// Free tools to reduce a PDF's size before uploading it.
const compressionTools = [
  { label: 'iLovePDF', note: 'comprimir PDF', href: 'https://www.ilovepdf.com/es/comprimir_pdf' },
  { label: 'Smallpdf', note: 'comprimir PDF', href: 'https://smallpdf.com/es/comprimir-pdf' },
  { label: 'Adobe Acrobat', note: 'comprimir PDF', href: 'https://www.adobe.com/es/acrobat/online/compress-pdf.html' },
]

// Aviso de tamaño máximo encima del selector de archivo de los documentos.
export function FileSizeWarning(props: FileInputProps) {
  return (
    <Stack gap={4}>
      <Card tone="caution" padding={[3, 4]} radius={2}>
        <Stack gap={3}>
          <Text size={1} weight="semibold">
            ⚠️ Tamaño máximo: 10 MB por documento
          </Text>
          <Text size={1}>
            El archivo no puede pesar más de <strong>10 MB</strong>. Si es más grande, comprímalo antes de subirlo y
            vuelva a intentarlo. Así la web seguirá cargando rápido y los vecinos podrán descargarlo sin esperas.
          </Text>
          <Text size={1}>Herramientas gratuitas para comprimir un PDF:</Text>
          <ul style={{ margin: 0, paddingLeft: 20 }}>
            {compressionTools.map((tool) => (
              <li key={tool.href}>
                <Text size={1}>
                  <a href={tool.href} target="_blank" rel="noopener noreferrer">
                    {tool.label}
                  </a>
                  {tool.note ? ` (${tool.note})` : ''}
                </Text>
              </li>
            ))}
          </ul>
          <Text size={1}>
            Si el documento es de Word, Excel u otro formato, guárdelo primero como PDF: suele ocupar menos y se abre
            igual en cualquier dispositivo.
          </Text>
        </Stack>
      </Card>
      {props.renderDefault(props)}
    </Stack>
  )
}
