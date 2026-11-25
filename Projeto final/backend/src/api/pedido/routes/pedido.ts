import type { Core } from '@strapi/strapi';

const routes: Core.RouteInput[] = [
  {
    method: 'GET',
    path: '/pedidos',
    handler: 'pedido.find',
    config: { auth: {} },
  },
  {
    method: 'POST',
    path: '/pedidos',
    handler: 'pedido.create',
    config: { auth: {} },
  },
  {
    method: 'PATCH',
    path: '/pedidos/:documentId/status',
    handler: 'pedido.updateStatus',
    config: { auth: {} },
  },
];

export default { routes };