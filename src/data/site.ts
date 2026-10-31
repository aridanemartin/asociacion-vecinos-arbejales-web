export const site = {
  name: 'Asociación de Vecinos Llano Roque',
  place: 'Arbejales',
  description:
    'Web de la Asociación de Vecinos Llano Roque, en Arbejales (Teror, Gran Canaria): noticias, historia, documentos y servicios para el vecindario.',
  facebook: 'https://www.facebook.com/p/Avv-Llano-Roque-Arbejales-100015420938821/',
  // Buzón que recibe las sugerencias (se envía con formsubmit.co).
  suggestionsEmail: 'asv.arbejales@gmail.com',
};

export const developer = { name: 'Aridane Martín', url: 'https://www.aridanemartin.dev', year: 2026 };

export type NavItem = { href: string; label: string; short: string; icon: string; blurb: string };

export const nav: NavItem[] = [
  { href: '/historia', label: 'Historia de Arbejales', short: 'Historia', icon: 'history', blurb: 'Textos, fotos y recuerdos del barrio.' },
  { href: '/rancho-de-animas', label: 'Rancho de Ánimas', short: 'Rancho de Ánimas', icon: 'music', blurb: 'Historia y vídeos del Rancho de Ánimas de Arbejales.' },
  { href: '/nuestras-fiestas', label: 'Nuestras fiestas', short: 'Fiestas', icon: 'party', blurb: 'Cómo celebramos las fiestas y fotos de años anteriores.' },
  { href: '/iglesia-y-cementerio', label: 'Iglesia y cementerio', short: 'Iglesia y cementerio', icon: 'church', blurb: 'Horarios de misas, cementerio y archivo parroquial.' },
  { href: '/documentos', label: 'Documentos de la asociación', short: 'Documentos', icon: 'file', blurb: 'Estatutos, actas y memorias anuales.' },
  { href: '/disponibilidad-local', label: 'Disponibilidad del local', short: 'Local', icon: 'calendar', blurb: 'Consulta qué días está ocupado el local.' },
  { href: '/sugerencias', label: 'Sugerencias', short: 'Sugerencias', icon: 'message', blurb: 'Haz llegar tus propuestas a la directiva.' },
  { href: '/contactos', label: 'Contactos', short: 'Contactos', icon: 'phone', blurb: 'Teléfonos y webs de servicios municipales.' },
];
