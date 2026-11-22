import type { Core } from '@strapi/strapi';

const server: Core.Config.Shared.ConfigFunction<Core.Config.Server> = ({ env }) => ({
  host: env('HOST', '0.0.0.0'),
  port: env.int('PORT', 1337),
  app: {
    keys: env.array('APP_KEYS') as string[],
  },
  webhooks: {
    populateRelations: env.bool('WEBHOOKS_POPULATE_RELATIONS', false),
  },
});

export default server;
