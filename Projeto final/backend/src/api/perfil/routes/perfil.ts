import type { Core } from '@strapi/strapi';

const routes: Core.RouteInput[] = [
  { method: 'GET', path: '/meu-perfil', handler: 'perfil.find', config: { auth: {} } },
  { method: 'PUT', path: '/meu-perfil', handler: 'perfil.update', config: { auth: {} } },
  { method: 'DELETE', path: '/meu-perfil/foto', handler: 'perfil.removerFoto', config: { auth: {} } },
];

export default { routes };
