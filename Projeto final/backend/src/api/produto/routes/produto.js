'use strict';

module.exports = {
  routes: [
    {
      method: 'POST',
      path: '/produtos',
      handler: 'produto.create',
      config: {
        auth: {},
      },
    },
    {
      method: 'GET',
      path: '/produtos',
      handler: 'produto.find',
      config: {
        auth: {},
      },
    },
    {
      method: 'GET',
      path: '/catalogo-produtos',
      handler: 'produto.findPublic',
      config: {
        auth: false,
      },
    },
  ],
};
