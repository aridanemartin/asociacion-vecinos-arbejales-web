#!/bin/sh
# Genera los PDF de ejemplo que usan los datos de prueba de la web.
# Uso: sh scripts/mock-docs.sh   (macOS, usa cupsfilter)
set -eu

cd "$(dirname "$0")/.."
out="public/docs"
mkdir -p "$out"

make_pdf() {
  file="$1"
  title="$2"
  body="$3"
  tmp="$(mktemp -d)"
  {
    printf '%s\n\n' "$title"
    printf '%s\n\n' "$body"
    printf 'Este es un documento de ejemplo para probar la web.\n'
    printf 'Sustitúyalo por el documento real desde el panel de Sanity.\n'
  } > "$tmp/doc.txt"
  cupsfilter "$tmp/doc.txt" > "$out/$file" 2>/dev/null
  rm -rf "$tmp"
  printf '· %s\n' "$out/$file"
}

make_pdf "estatutos-vigentes.pdf" "Estatutos de la Asociación de Vecinos Llano Roque" "Texto de ejemplo de los estatutos aprobados en asamblea."
make_pdf "reglamento-regimen-interno.pdf" "Reglamento de régimen interno" "Normas de uso del local social y del resto de instalaciones."
make_pdf "acta-constitucion.pdf" "Acta de constitución de la asociación" "Acta de la reunión fundacional de la asociación de vecinos."
make_pdf "acta-asamblea-general-2026-03.pdf" "Acta de la asamblea general de marzo de 2026" "Resumen de los acuerdos aprobados por la asamblea."
make_pdf "acta-junta-directiva-2026-06.pdf" "Acta de la reunión de la junta directiva de junio de 2026" "Acuerdos de la junta directiva."
make_pdf "acta-asamblea-general-2025-11.pdf" "Acta de la asamblea general de noviembre de 2025" "Resumen de los acuerdos aprobados por la asamblea."
make_pdf "cuentas-ejercicio-2025.pdf" "Estado de cuentas del ejercicio 2025" "Ingresos y gastos del año 2025."
make_pdf "presupuesto-2026.pdf" "Presupuesto del ejercicio 2026" "Previsión de ingresos y gastos para 2026."
make_pdf "cuentas-ejercicio-2024.pdf" "Estado de cuentas del ejercicio 2024" "Ingresos y gastos del año 2024."
make_pdf "memoria-actividades-2025.pdf" "Memoria de actividades de 2025" "Actividades organizadas por la asociación durante 2025."
make_pdf "memoria-actividades-2024.pdf" "Memoria de actividades de 2024" "Actividades organizadas por la asociación durante 2024."

printf '\nDocumentos de ejemplo generados en %s\n' "$out"
