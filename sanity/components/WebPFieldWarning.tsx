import { Stack } from '@sanity/ui'
import type { ImageInputProps } from 'sanity'
import { WebPInstructions } from './WebPInstructions'

// Aviso WebP encima del selector de una foto suelta. Se envuelve `input`
// (no `field`) para que la etiqueta y la descripción de Sanity queden arriba
// y el aviso justo debajo.
export function WebPFieldWarning(props: ImageInputProps) {
  return (
    <Stack space={4}>
      <WebPInstructions />
      {props.renderDefault(props)}
    </Stack>
  )
}
