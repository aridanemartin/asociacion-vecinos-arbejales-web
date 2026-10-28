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

La web lee el contenido de Sanity en tiempo de compilación:

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

### Datos iniciales

El contenido de arranque (textos, fotos de ejemplo, PDF descargables, días ocupados
y teléfonos) se cargó en la cuenta con:

```sh
npm run seed   # requiere SANITY_API_TOKEN con permiso de escritura en .env
```

El script `scripts/seed-sanity.mjs` es idempotente: reutiliza las imágenes y archivos
ya subidos y sobrescribe los documentos con los mismos ids. La fuente de esos datos es
`src/data/mock.ts`, que sigue sirviendo de **respaldo** si el panel se queda sin
contenido (ver más abajo).

Los teléfonos y algunos documentos del contenido inicial son ficticios: sustitúyelos
por los reales desde el panel.

### Respaldo con datos de ejemplo

`src/lib/content.ts` usa los datos de `src/data/mock.ts` **solo cuando la consulta a
Sanity no devuelve nada** (o no responde). En cuanto hay contenido real en el panel,
la web muestra ese contenido.

| Variable | Efecto |
| --- | --- |
| sin definir | Usa los datos de ejemplo solo si Sanity está vacío o no responde. |
| `PUBLIC_SANITY_MOCK=true` | Fuerza los datos de ejemplo (no consulta Sanity). |
| `PUBLIC_SANITY_MOCK=false` | Desactiva los datos de ejemplo por completo. |

Para publicar con contenido real, define `PUBLIC_SANITY_MOCK=false` en el entorno de
despliegue.

Las imágenes de ejemplo son SVG en `public/img/mock/` (`npm run mock:images`) y los PDF
en `public/docs/` (`npm run mock:docs`, solo macOS).
