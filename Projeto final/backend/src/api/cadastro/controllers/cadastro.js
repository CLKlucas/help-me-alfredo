
'use strict';

module.exports = {
  /** @param {import('koa').Context} ctx */
  async create(ctx) {
    const {
      tipo,
      nome,
      email,
      password,
      whatsapp,
      nome_da_barraca,
      descricao,
      endereco,
    } = ctx.request.body;

    if (!['feirante', 'consumidor'].includes(tipo)) {
      return ctx.badRequest('Tipo de conta inválido.');
    }

    if (!nome || !email || !password || !whatsapp) {
      return ctx.badRequest('Preencha todos os campos obrigatórios.');
    }

    if (tipo === 'feirante' && !nome_da_barraca) {
      return ctx.badRequest('Informe o nome da barraca.');
    }

    if (tipo === 'consumidor' && !endereco) {
      return ctx.badRequest('Informe o endereço.');
    }

 
    const pluginStore = strapi.store({
      type: 'plugin',
      name: 'users-permissions',
    });

    /** @type {{ allow_register: boolean }} */
    const settings = await pluginStore.get({
      key: 'advanced',
    });

    if (!settings?.allow_register) {
      return ctx.badRequest('Cadastro não está habilitado.');
    }

    const roleName = tipo === 'feirante'
      ? 'Feirante'
      : 'Consumidor';

    const role = await strapi.db
      .query('plugin::users-permissions.role')
      .findOne({
        where: { name: roleName },
      });

    if (!role) {
      return ctx.internalServerError(
        `Role ${roleName} não encontrada.`
      );
    }

    const userService = strapi
      .plugin('users-permissions')
      .service('user');

  
    const username = email.trim().toLowerCase();

    const existingUser = await strapi.db
      .query('plugin::users-permissions.user')
      .findOne({
        where: {
          $or: [
            { email: username },
            { username },
          ],
        },
      });

    if (existingUser) {
      return ctx.badRequest('E-mail já cadastrado.');
    }

    const user = await userService.add({
      username,
      email: username,
      password,
      provider: 'local',
      role: role.id,
      confirmed: true,
      blocked: false,
    });

    try {
      let profile;

      if (tipo === 'feirante') {
        profile = await strapi
          .documents('api::feirante.feirante')
          .create({
            data: {
              nome_da_barraca,
              whatsapp: String(whatsapp),
              descricao,
              users_permissions_user: user.documentId,
            },
          });
      } else {
        profile = await strapi
          .documents('api::consumidor.consumidor')
          .create({
            data: {
              nome,
              whatsapp: String(whatsapp),
              endereco,
              users_permissions_user: user.documentId,
            },
          });
      }

      ctx.status = 201;
      ctx.body = {
        message: 'Cadastro realizado com sucesso.',
        user: {
          id: user.id,
          documentId: user.documentId,
          username: user.username,
          email: user.email,
        },
        profile,
      };
    } catch (error) {
      await userService.remove(user.id);

      throw error;
    }
  },
};
