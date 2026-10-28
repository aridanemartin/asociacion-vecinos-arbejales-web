/**
 * Genera las imágenes de ejemplo que usan los datos de prueba.
 * Uso: node scripts/mock-images.mjs
 *
 * Escribe un SVG (fuente) y un WebP (el que usa la web) por cada escena en
 * public/img/mock. El WebP se genera con sharp, que viene con Astro.
 * Se pueden borrar cuando el panel de Sanity tenga fotos reales.
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const outDir = resolve(dirname(fileURLToPath(import.meta.url)), '..', 'public', 'img', 'mock');

/** Paletas cálidas inspiradas en el paisaje de Arbejales. */
const palettes = [
  { sky: ['#fbe3c4', '#efa679'], sun: '#fff2cf', back: '#b56b4a', front: '#8c4a33', ground: '#5f3324' },
  { sky: ['#e9e2cd', '#c9c9a6'], sun: '#fdf4d8', back: '#8c9a74', front: '#5f7050', ground: '#3f4a35' },
  { sky: ['#f7dcc9', '#dba38f'], sun: '#ffe9c9', back: '#9d6b58', front: '#6e4638', ground: '#4a2e26' },
  { sky: ['#dde7df', '#a9c2b2'], sun: '#f6f1d6', back: '#7f9a8a', front: '#587263', ground: '#3d5145' },
  { sky: ['#f3e2c3', '#d8b184'], sun: '#fff6dd', back: '#a87a54', front: '#7a5236', ground: '#4f3524' },
];

const scenes = [
  { slug: 'plaza', label: 'Plaza de Arbejales', motif: 'houses' },
  { slug: 'iglesia', label: 'Iglesia de Arbejales', motif: 'church' },
  { slug: 'procesion', label: 'Procesión por la calle principal', motif: 'houses' },
  { slug: 'romeria', label: 'Romería del barrio', motif: 'trees' },
  { slug: 'rancho', label: 'Rancho de Ánimas en Navidad', motif: 'houses' },
  { slug: 'camino', label: 'Camino de Las Mesas', motif: 'trees' },
  { slug: 'vecinos', label: 'Vecinos reunidos en la plaza', motif: 'houses' },
  { slug: 'cementerio', label: 'Cementerio de Arbejales', motif: 'church' },
  { slug: 'local', label: 'Local de la asociación', motif: 'houses' },
  { slug: 'documentos', label: 'Documentos de la asociación', motif: 'plain' },
  { slug: 'asamblea', label: 'Asamblea de vecinos', motif: 'houses' },
  { slug: 'paisaje', label: 'Vistas de Arbejales', motif: 'trees' },
  { slug: 'fiestas', label: 'Fiestas del barrio', motif: 'trees' },
  { slug: 'lavadero', label: 'Lavadero tradicional', motif: 'plain' },
  { slug: 'ermita', label: 'Ermita de Arbejales', motif: 'church' },
  { slug: 'memoria', label: 'Taller de memoria del barrio', motif: 'houses' },
];

const motifs = {
  church: `
    <g fill="{ground}">
      <path d="M210 690V540l90-58 90 58v150z"/>
      <rect x="404" y="470" width="84" height="220"/>
      <path d="M446 424l34 24v22h-68v-22z"/>
      <path d="M446 386v30" stroke="{ground}" stroke-width="10"/>
    </g>
    <g fill="{light}">
      <rect x="270" y="580" width="22" height="42" rx="11"/>
      <rect x="318" y="580" width="22" height="42" rx="11"/>
      <rect x="432" y="520" width="28" height="44" rx="14"/>
    </g>`,
  houses: `
    <g fill="{ground}">
      <path d="M150 690V590l70-48 70 48v100z"/>
      <path d="M330 690V570l86-58 86 58v120z"/>
      <path d="M540 690V606l58-40 58 40v84z"/>
    </g>
    <g fill="{light}">
      <rect x="196" y="620" width="24" height="34"/>
      <rect x="392" y="606" width="26" height="36"/>
      <rect x="578" y="628" width="22" height="30"/>
    </g>`,
  trees: `
    <g fill="{ground}">
      <path d="M230 700c-46 0-78-32-78-72 0-48 38-80 84-80-6-40 30-72 70-72s76 30 76 72c40 2 70 34 70 76 0 42-32 76-76 76z"/>
      <rect x="262" y="690" width="24" height="70"/>
      <path d="M560 700c-38 0-64-26-64-60 0-36 28-62 66-64 2-32 30-56 64-56s62 24 64 56c34 4 58 30 58 62 0 34-28 62-62 62z"/>
      <rect x="612" y="692" width="20" height="66"/>
    </g>`,
  plain: '',
};

mkdirSync(outDir, { recursive: true });

// Los colores van escritos directamente (sin variables CSS) para que tanto el
// navegador como `sharp` al generar el WebP los pinten igual.
const svg = ({ slug, label, motif }, i) => {
  const p = palettes[i % palettes.length];
  const dibujo = (motifs[motif] ?? '')
    .replaceAll('{ground}', p.ground)
    .replaceAll('{light}', p.sky[0]);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1280 800" width="1280" height="800" role="img" aria-label="${label} (imagen de ejemplo)">
  <defs>
    <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="${p.sky[0]}"/>
      <stop offset="1" stop-color="${p.sky[1]}"/>
    </linearGradient>
    <linearGradient id="ground" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="${p.front}"/>
      <stop offset="1" stop-color="${p.ground}"/>
    </linearGradient>
  </defs>
  <rect width="1280" height="800" fill="url(#sky)"/>
  <circle cx="1030" cy="170" r="86" fill="${p.sun}" opacity=".85"/>
  <path d="M0 560 260 430 470 555 700 400 940 570 1120 470 1280 570v230H0z" fill="${p.back}" opacity=".72"/>
  <path d="M0 660 300 555 560 665 830 570 1080 655 1280 600v200H0z" fill="url(#ground)"/>
  ${dibujo}
  <g>
    <rect x="44" y="44" width="196" height="44" rx="22" fill="#3a1a15" opacity=".55"/>
    <text x="142" y="73" text-anchor="middle" font-family="Inter, system-ui, sans-serif" font-size="19" font-weight="600" letter-spacing="1.5" fill="#fbf5ea">FOTO DE EJEMPLO</text>
  </g>
  <text x="48" y="752" font-family="Inter, system-ui, sans-serif" font-size="26" font-weight="600" fill="#fbf5ea" opacity=".9">${label}</text>
</svg>
`;
};

for (const [i, scene] of scenes.entries()) {
  const svgMarkup = svg(scene, i);
  writeFileSync(resolve(outDir, `${scene.slug}.svg`), svgMarkup, 'utf8');
  await sharp(Buffer.from(svgMarkup)).webp({ quality: 84 }).toFile(resolve(outDir, `${scene.slug}.webp`));
}

console.log(`${scenes.length} imágenes de ejemplo (SVG + WebP) generadas en ${outDir}`);
