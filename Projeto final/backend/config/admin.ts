import type { Core } from '@strapi/strapi';

const admin: Core.Config.Shared.ConfigFunction<Core.Config.Admin> = ({ env }) => ({
  auth: {
    secret: env('ADMIN_JWT_SECRET') as string,
  },
  apiToken: {
    salt: env('API_TOKEN_SALT') as string,
  },
  transfer: {
    token: {
      salt: env('TRANSFER_TOKEN_SALT'),
    },
  },
  secrets: {
    encryptionKey: env('ENCRYPTION_KEY'),
  },
  flags: {
    nps: env.bool('FLAG_NPS', true),
    promoteEE: env.bool('FLAG_PROMOTE_EE', true),
    docLinks: env.bool('FLAG_DOC_LINKS', true),
  },
});

export default admin;
