'use strict';

module.exports = {
  async obterFeirante(ctx) {
    const usuario = ctx.state.user;

    if (!usuario) {
      ctx.unauthorized('Você precisa estar autenticado.');
      return null;
    }

    const usuarioCompleto = await strapi.db
      .query('plugin::users-permissions.user')
      .findOne({
        where: { id: usuario.id },
        populate: { role: true },
      });

    if (!usuarioCompleto || usuarioCompleto.role?.name !== 'Feirante') {
      ctx.forbidden('Apenas feirantes podem gerenciar produtos.');
      return null;
    }

    const feirante = await strapi.db
      .query('api::feirante.feirante')
      .findOne({
        where: {
          users_permissions_user: { id: usuario.id },
        },
      });

    if (!feirante) {
      ctx.notFound('Perfil de feirante não encontrado.');
      return null;
    }

    return feirante;
  },

  async create(ctx) {
    const feirante = await this.obterFeirante(ctx);

    if (!feirante) return;

    const { nome, descricao, preco, disponivel, imagem } =
      ctx.request.body || {};

    const precoNumerico = Number(preco);

    if (!nome || !nome.trim()) {
      return ctx.badRequest('Informe o nome do produto.');
    }

    if (preco === undefined || preco === null ||
        preco === '' || !Number.isFinite(precoNumerico) ||
        precoNumerico < 0) {
      return ctx.badRequest('Informe um preço válido.');
    }

    const dados = {
      nome: nome.trim(),
      descricao: descricao || '',
      preco: precoNumerico,
      disponivel: disponivel === undefined ? true : disponivel === true,
      feirante: feirante.documentId,
    };

    if (imagem) {
      dados.imagem = imagem;
    }

    const produto = await strapi.documents('api::produto.produto').create({
      data: dados,
      populate: {
        imagem: true,
      },
    });

    ctx.status = 201;
    ctx.body = {
      message: 'Produto cadastrado com sucesso.',
      produto,
    };
  },

  async find(ctx) {
    const feirante = await this.obterFeirante(ctx);

    if (!feirante) return;

    const produtos = await strapi.db
      .query('api::produto.produto')
      .findMany({
        where: {
          feirante: { id: feirante.id },
        },
        populate: {
          imagem: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

    ctx.body = produtos;
  },

  async findPublic(ctx) {
    const produtos = await strapi.db
      .query('api::produto.produto')
      .findMany({
        where: {
          disponivel: true,
        },
        populate: {
          imagem: true,
          feirante: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

    ctx.body = produtos.map((produto) => ({
      documentId: produto.documentId,
      nome: produto.nome,
      descricao: produto.descricao,
      preco: produto.preco,
      disponivel: produto.disponivel,
      imagem: produto.imagem
        ? {
            url: produto.imagem.url,
            alternativeText: produto.imagem.alternativeText,
          }
        : null,
      feirante: produto.feirante
        ? {
            nome_da_barraca: produto.feirante.nome_da_barraca,
          }
        : null,
    }));
  },
};
