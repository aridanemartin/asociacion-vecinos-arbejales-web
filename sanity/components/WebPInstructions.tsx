import { Card, Stack, Text } from '@sanity/ui'

// Texto único para el aviso de "subir en WebP" que se muestra en todos los
// campos donde se pueden subir fotos. Así el mensaje y los enlaces de
// conversión solo se mantienen en un sitio.
const converterPages = [
  { label: 'Squoosh', note: 'de Google, sin subir la imagen', href: 'https://squoosh.app/' },
  { label: 'CloudConvert', note: 'JPG → WebP', href: 'https://cloudconvert.com/jpg-to-webp' },
  { label: 'iLoveIMG', note: 'cualquier formato → WebP', href: 'https://www.iloveimg.com/convert-to-webp' },
]

export function WebPInstructions() {
  return (
    <Card tone="caution" padding={[3, 4]} radius={2}>
      <Stack space={3}>
        <Text size={1} weight="semibold">
          ⚠️ Formato requerido: WebP
        </Text>
        <Text size={1}>
          Sube siempre las fotos en formato <strong>WebP</strong> (el archivo termina en <code>.webp</code>).
          Pesan mucho menos que JPG o PNG y hacen que la web cargue más rápido, con la misma calidad visual.
        </Text>
        <Text size={1}>¿La tienes en JPG o PNG? Conviértela gratis aquí antes de subirla:</Text>
        <ul style={{ margin: 0, paddingLeft: 20 }}>
          {converterPages.map((page) => (
            <li key={page.href}>
              <Text size={1}>
                <a href={page.href} target="_blank" rel="noopener noreferrer">
                  {page.label}
                </a>
                {page.note ? ` (${page.note})` : ''}
              </Text>
            </li>
          ))}
        </ul>
        <Text size={1}>
          El panel solo acepta archivos WebP. Si eliges otro formato, la foto no se podrá subir ni publicar.
        </Text>
      </Stack>
    </Card>
  )
}
