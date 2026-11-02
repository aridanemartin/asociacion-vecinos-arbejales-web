import { Stack } from '@sanity/ui'
import type { ArrayOfObjectsInputProps } from 'sanity'
import { WebPInstructions } from './WebPInstructions'

// Aviso WebP encima de las listas de fotos (historia, Rancho de Ánimas,
// iglesia y cementerio).
export function ImagesFieldWarning(props: ArrayOfObjectsInputProps) {
  return (
    <Stack gap={4}>
      <WebPInstructions />
      {props.renderDefault(props)}
    </Stack>
  )
}
