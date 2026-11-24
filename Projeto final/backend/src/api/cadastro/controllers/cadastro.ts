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

    if (typeof nome !== 'string' || !nome.trim() || nome.trim().length > 120) {
      return ctx.badRequest('Informe seu nome, com até 120 caracteres.');
    }
    if (typeof email !== 'string' || email.trim().length > 254 ||
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      return ctx.badRequest('Informe um e-mail válido.');
    }
    if (typeof password !== 'string' || password.length < 8 || Buffer.byteLength(password, 'utf8') > 72) {
      return ctx.badRequest('A senha deve ter ao menos 8 caracteres e no máximo 72 bytes.');
    }
    if (typeof whatsapp !== 'string') {
      return ctx.badRequest('Informe o WhatsApp com DDD.');
    }
    const telefone = whatsapp.replace(/[\s()+.\-]/g, '');
    if (!/^\d{10,15}$/.test(telefone)) {
      return ctx.badRequest('Informe o WhatsApp com DDD, entre 10 e 15 dígitos. Espaços e pontuação são aceitos.');
    }
    if (tipo === 'feirante' &&
        (typeof nome_da_barraca !== 'string' || !nome_da_barraca.trim() || nome_da_barraca.trim().length > 120)) {
      return ctx.badRequest('Informe o nome da barraca, com até 120 caracteres.');
    }
    if (tipo === 'feirante' && descricao !== undefined &&
        (typeof descricao !== 'string' || descricao.length > 2000)) {
      return ctx.badRequest('A descrição deve ser um texto de até 2000 caracteres.');
    }
    if (tipo === 'consumidor' &&
        (typeof endereco !== 'string' || !endereco.trim() || endereco.length > 2000)) {
      return ctx.badRequest('Informe um endereço, com até 2000 caracteres.');
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

    const { user, profile } = await strapi.db.transaction(async () => {
      const user: UsuarioBanco = await userService.add({
        username,
        email: username,
        password,
        provider: 'local',
        role: role.id,
        confirmed: true,
        blocked: false,
      });

      const profile = tipo === 'feirante'
        ? await strapi.documents('api::feirante.feirante').create({
            data: {
              nome: nome.trim(),
              nome_da_barraca: (nome_da_barraca as string).trim(),
              whatsapp: telefone,
              descricao: (descricao as string | undefined)?.trim(),
              users_permissions_user: user.documentId,
            },
          })
        : await strapi.documents('api::consumidor.consumidor').create({
            data: {
              nome: nome.trim(),
              whatsapp: telefone,
              endereco: (endereco as string).trim(),
              users_permissions_user: user.documentId,
            },
          });

      return { user, profile };
    });

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
          select: ['documentId', 'nome', 'nome_da_barraca', 'whatsapp', 'descricao'],
        });

      if (!profile) {
        return ctx.notFound('Perfil de feirante não encontrado.');
      }

      ctx.body = {
        tipo: 'feirante',
        usuario: {
          id: user.id,
          documentId: user.documentId,
          nome: profile.nome || user.username,
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
          nome: profile.nome || user.username,
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
