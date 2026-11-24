import type { Core } from '@strapi/strapi';

const routes: Core.RouteInput[] = [
  {
    method: 'GET',
    path: '/catalogo-feirantes',
    handler: 'feirante.findPublic',
    config: { auth: false },
  },
  {
    method: 'GET',
    path: '/catalogo-feirantes/:documentId',
    handler: 'feirante.findPublicOne',
    config: { auth: false },
  },
];

export default { routes };
