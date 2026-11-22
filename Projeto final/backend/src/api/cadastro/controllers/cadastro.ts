import type { Core } from '@strapi/strapi';
import type { Context } from 'koa';
import type {
  CorpoCadastro,
  PerfilConsumidorBanco,
  PerfilFeiranteBanco,
  TipoConta,
  UsuarioAutenticado,
  UsuarioBanco,
} from '../../../types/api.js';

const TIPOS_CONTA: readonly string[] = ['feirante', 'consumidor'];

function eObjeto(valor: unknown): valor is Record<string, unknown> {
  return typeof valor === 'object' && valor !== null;
}

function eTipoConta(valor: unknown): valor is TipoConta {
  return typeof valor === 'string' && TIPOS_CONTA.includes(valor);
}

const cadastroController = {
  async create(ctx: Context): Promise<void> {
    const corpo = (ctx.request.body ?? {}) as CorpoCadastro;

    const {
      tipo,
      nome,
      email,
      password,
      whatsapp,
      nome_da_barraca,
      descricao,
      endereco,
    } = corpo;

    if (!eTipoConta(tipo)) {
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

    const settings: unknown = await pluginStore.get({ key: 'advanced' });
    const allowRegister = eObjeto(settings)
      ? (settings as { allow_register?: unknown }).allow_register
      : undefined;

    if (!allowRegister) {
      return ctx.badRequest('Cadastro não está habilitado.');
    }

    const roleName = tipo === 'feirante' ? 'Feirante' : 'Consumidor';

    const role: { id: number } | null = await strapi.db
      .query('plugin::users-permissions.role')
      .findOne({ where: { name: roleName } });

    if (!role) {
      return ctx.internalServerError(`Role ${roleName} não encontrada.`);
    }

    const userService = strapi
      .plugin('users-permissions')
      .service('user');

    const username = String(email).trim().toLowerCase();

    const existingUser: { id: number } | null = await strapi.db
      .query('plugin::users-permissions.user')
      .findOne({
        where: {
          $or: [{ email: username }, { username }],
        },
      });

    if (existingUser) {
      return ctx.badRequest('E-mail já cadastrado.');
    }

    const user: UsuarioBanco = await userService.add({
      username,
      email: username,
      password,
      provider: 'local',
      role: role.id,
      confirmed: true,
      blocked: false,
    });

    try {
      let profile: unknown;

      if (tipo === 'feirante') {
        profile = await strapi.documents('api::feirante.feirante').create({
          data: {
            nome_da_barraca: nome_da_barraca as string,
            whatsapp: String(whatsapp),
            descricao: descricao as string | undefined,
            users_permissions_user: user.documentId,
          },
        });
      } else {
        profile = await strapi.documents('api::consumidor.consumidor').create({
          data: {
            nome: nome as string,
            whatsapp: String(whatsapp),
            endereco: endereco as string,
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

  async me(ctx: Context): Promise<void> {
    const authenticatedUser = (ctx.state as { user?: UsuarioAutenticado }).user;

    if (!authenticatedUser) {
      return ctx.unauthorized('Você precisa estar autenticado.');
    }

    const user: UsuarioBanco | null = await strapi.db
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
      const profile: PerfilFeiranteBanco | null = await strapi.db
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
      const profile: PerfilConsumidorBanco | null = await strapi.db
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
} satisfies Core.Controller;

export default cadastroController;
