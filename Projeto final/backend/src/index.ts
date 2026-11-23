import type { Core } from '@strapi/strapi';
import { setup } from './bootstrap/setup';

type Lifecycle = (params: { strapi: Core.Strapi }) => void | Promise<void>;

const index: { register: Lifecycle; bootstrap: Lifecycle } = {
  register() {},
  async bootstrap({ strapi }) {
    await setup(strapi);
  },
};

export default index;
