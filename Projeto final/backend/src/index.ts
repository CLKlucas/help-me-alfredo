import type { Core } from '@strapi/strapi';

type Lifecycle = (params: { strapi: Core.Strapi }) => void | Promise<void>;

const index: { register: Lifecycle; bootstrap: Lifecycle } = {
  register() {},
  bootstrap() {},
};

export default index;
