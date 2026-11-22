'use strict';

module.exports = {
  routes: [
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
  ],
};
