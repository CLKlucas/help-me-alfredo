import type { Core } from '@strapi/strapi';

const rotas: Core.RouteInput[] = [
  {
    method: 'POST',
    path: '/cadastro',
    handler: 'cadastro.create',
    config: {
      auth: false,
    },
  },
  {
    method: 'GET',
    path: '/minha-conta',
    handler: 'cadastro.me',
    config: {
      auth: {},
    },
  },
];

export default { routes: rotas };
