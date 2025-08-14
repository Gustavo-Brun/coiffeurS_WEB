import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'coiffeurS',
    short_name: 'coiffeurS',
    description: 'Sistema para Barbearias',
    lang: 'pt-BR',
    start_url: '/login',
    display: 'standalone'
  };
}
