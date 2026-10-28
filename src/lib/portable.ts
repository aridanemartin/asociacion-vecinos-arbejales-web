import type { Bloque, BloqueFoto, BloqueTexto } from './types';

const ESCAPES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
};

const escapar = (texto: string) => texto.replace(/[&<>"']/g, (c) => ESCAPES[c]);

/** Etiqueta HTML que corresponde al estilo elegido en el editor. */
export const etiquetaDeBloque = (estilo?: string): 'p' | 'h2' | 'h3' | 'blockquote' =>
  estilo === 'h2' || estilo === 'h3' || estilo === 'blockquote' ? estilo : 'p';

/**
 * Convierte un bloque de texto de Sanity (Portable Text) a HTML seguro.
 * Se admiten negrita y cursiva; el resto de marcas se ignoran.
 */
export function bloqueAHtml(bloque: BloqueTexto): string {
  return (bloque.children ?? [])
    .map((span) => {
      let html = escapar(span.text ?? '');
      const marcas = span.marks ?? [];
      if (marcas.includes('strong')) html = `<strong>${html}</strong>`;
      if (marcas.includes('em')) html = `<em>${html}</em>`;
      return html;
    })
    .join('');
}

export type GrupoCuerpo =
  | { tipo: 'texto'; etiqueta: 'p' | 'h2' | 'h3' | 'blockquote'; html: string }
  | { tipo: 'lista'; ordenada: boolean; items: string[] }
  | { tipo: 'foto'; bloque: BloqueFoto };

/**
 * Agrupa los bloques del editor para poder pintarlos: los elementos de una
 * misma lista seguida se juntan en un único grupo.
 */
export function agruparCuerpo(cuerpo: Bloque[]): GrupoCuerpo[] {
  const grupos: GrupoCuerpo[] = [];

  for (const bloque of cuerpo) {
    if (bloque._type === 'foto') {
      grupos.push({ tipo: 'foto', bloque });
      continue;
    }

    const html = bloqueAHtml(bloque);
    if (bloque.listItem) {
      const ordenada = bloque.listItem === 'number';
      const anterior = grupos.at(-1);
      if (anterior?.tipo === 'lista' && anterior.ordenada === ordenada) anterior.items.push(html);
      else grupos.push({ tipo: 'lista', ordenada, items: [html] });
    } else {
      grupos.push({ tipo: 'texto', etiqueta: etiquetaDeBloque(bloque.style), html });
    }
  }

  return grupos;
}
