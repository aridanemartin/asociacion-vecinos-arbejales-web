# asociacion-vecinos-arbejales-web

Web de la Asociación de Vecinos de Arbejales (Teror, Gran Canaria), construida con Astro.
El contenido se edita en el panel de Sanity incrustado en `/admin`.

## Comandos

```sh
npm install
npm run dev      # servidor de desarrollo
npm run build    # genera la web estática en dist/
npm run preview  # sirve dist/
```

## Contenido

La web lee todo el contenido de Sanity en tiempo de compilación:

- Proyecto `9p125sri`, dataset `production` (público para lectura).
- Esquemas en `sanity/schemas/` y menú del panel en `sanity/structure.ts`.
- `PUBLIC_SANITY_PROJECT_ID` y `PUBLIC_SANITY_DATASET` permiten cambiar de proyecto.

En el panel (`/admin`) están creadas las secciones de la web: noticias, historia,
Rancho de Ánimas y sus vídeos, iglesia y cementerio, documentos, días ocupados del
local y contactos de interés (teléfonos y webs).

Las páginas **Historia de Arbejales** e **Historia del Rancho de Ánimas** usan un
editor de texto enriquecido (Portable Text) con un único campo donde se escriben
párrafos, títulos, listas y citas, y donde se pueden insertar fotos entre párrafos
(con el botón «+»). Las fotos se suben siempre en WebP.

## Despliegue

La web no tiene datos de reserva: todo el contenido se consulta a Sanity durante la
construcción. Si el panel no responde, la compilación falla con un error que indica
la consulta afectada; si una sección está vacía, la página muestra su aviso de
«Pronto publicaremos…» o queda sin elementos.

Para publicar con un proyecto o dataset distintos de `9p125sri/production`, define
`PUBLIC_SANITY_PROJECT_ID` y `PUBLIC_SANITY_DATASET` en el entorno de despliegue.
