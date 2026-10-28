// El id del proyecto y el dataset no son secretos (viajan en cada petición pública).
export const projectId: string = import.meta.env.PUBLIC_SANITY_PROJECT_ID ?? '9p125sri'
export const dataset: string = import.meta.env.PUBLIC_SANITY_DATASET ?? 'production'
