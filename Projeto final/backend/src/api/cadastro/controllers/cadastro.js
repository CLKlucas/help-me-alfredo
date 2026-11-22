'use strict';

module.exports = {
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

    const settings = await pluginStore.get({ key: 'advanced' });

    if (!settings?.allow_register) {
      return ctx.badRequest('Cadastro não está habilitado.');
    }

    const roleName = tipo === 'feirante' ? 'Feirante' : 'Consumidor';

    const role = await strapi.db
      .query('plugin::users-permissions.role')
      .findOne({ where: { name: roleName } });

    if (!role) {
      return ctx.internalServerError(`Role ${roleName} não encontrada.`);
    }

    const userService = strapi
      .plugin('users-permissions')
      .service('user');

    const username = email.trim().toLowerCase();

    const existingUser = await strapi.db
      .query('plugin::users-permissions.user')
      .findOne({
        where: {
          $or: [{ email: username }, { username }],
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
        profile = await strapi.documents('api::feirante.feirante').create({
          data: {
            nome_da_barraca,
            whatsapp: String(whatsapp),
            descricao,
            users_permissions_user: user.documentId,
          },
        });
      } else {
        profile = await strapi.documents('api::consumidor.consumidor').create({
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

  async me(ctx) {
    const authenticatedUser = ctx.state.user;

    if (!authenticatedUser) {
      return ctx.unauthorized('Você precisa estar autenticado.');
    }

    const user = await strapi.db
      .query('plugin::users-permissions.user')
      .findOne({
        where: { id: authenticatedUser.id },
        populate: { role: true },
      });

    if (!user || !user.role) {
      return ctx.notFound('Usuário ou papel não encontrado.');
    }

    const roleName = user.role.name;

    if (roleName === 'Feirante') {
      const profile = await strapi.db
        .query('api::feirante.feirante')
        .findOne({
          where: {
            users_permissions_user: { id: user.id },
          },
          select: ['documentId', 'nome_da_barraca', 'whatsapp', 'descricao'],
        });

      if (!profile) {
        return ctx.notFound('Perfil de feirante não encontrado.');
      }

      ctx.body = {
        tipo: 'feirante',
        usuario: {
          id: user.id,
          documentId: user.documentId,
          nome: user.username,
          email: user.email,
        },
        perfil: profile,
      };

      return;
    }

    if (roleName === 'Consumidor') {
      const profile = await strapi.db
        .query('api::consumidor.consumidor')
        .findOne({
          where: {
            users_permissions_user: { id: user.id },
          },
          select: ['documentId', 'nome', 'whatsapp', 'endereco'],
        });

      if (!profile) {
        return ctx.notFound('Perfil de consumidor não encontrado.');
      }

      ctx.body = {
        tipo: 'consumidor',
        usuario: {
          id: user.id,
          documentId: user.documentId,
          nome: user.username,
          email: user.email,
        },
        perfil: profile,
      };

      return;
    }

    return ctx.forbidden('Tipo de conta não reconhecido.');
  },
};
