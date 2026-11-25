import type { Core } from '@strapi/strapi';
import type { Context } from 'koa';
import type {
  CorpoProduto,
  FeiranteBanco,
  ProdutoBanco,
  ProdutoPublico,
  UsuarioAutenticado,
} from '../../../types/api.js';

async function obterFeirante(ctx: Context): Promise<FeiranteBanco | null> {
  const usuario = (ctx.state as { user?: UsuarioAutenticado }).user;

  if (!usuario) {
    ctx.unauthorized('Você precisa estar autenticado.');
    return null;
  }

  const usuarioCompleto: {
    role?: { name?: string };
  } | null = await strapi.db
    .query('plugin::users-permissions.user')
    .findOne({
      where: { id: usuario.id },
      populate: { role: true },
    });

  if (!usuarioCompleto || usuarioCompleto.role?.name !== 'Feirante') {
    ctx.forbidden('Apenas feirantes podem gerenciar produtos.');
    return null;
  }

  const feirante: FeiranteBanco | null = await strapi.db
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
}

const produtoController = {
  async obterFeirante(ctx: Context): Promise<FeiranteBanco | null> {
    return obterFeirante(ctx);
  },

  async create(ctx: Context): Promise<void> {
    const feirante = await obterFeirante(ctx);

    if (!feirante) return;

    const { nome, descricao, preco, disponivel, imagem } =
      (ctx.request.body ?? {}) as CorpoProduto;

    const precoNumerico = Number(preco);

    if (typeof nome !== 'string' || !nome.trim()) {
      return ctx.badRequest('Informe o nome do produto.');
    }

    if (preco === undefined || preco === null ||
        preco === '' || !Number.isFinite(precoNumerico) ||
        precoNumerico < 0) {
      return ctx.badRequest('Informe um preço válido.');
    }

    const dados: {
      nome: string;
      descricao: string;
      preco: number;
      disponivel: boolean;
      feirante: string;
      imagem?: unknown;
    } = {
      nome: nome.trim(),
      descricao: descricao ? String(descricao) : '',
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

  async find(ctx: Context): Promise<void> {
    const feirante = await obterFeirante(ctx);

    if (!feirante) return;

    const produtos: ProdutoBanco[] = await strapi.db
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

  async delete(ctx: Context): Promise<void> {
    const feirante = await obterFeirante(ctx);
    if (!feirante) return;

    const produto: ProdutoBanco | null = await strapi.db
      .query('api::produto.produto')
      .findOne({
        where: {
          documentId: ctx.params.documentId,
          feirante: { id: feirante.id },
        },
      });

    if (!produto) return ctx.notFound('Produto não encontrado na sua barraca.');

    await strapi.documents('api::produto.produto').delete({
      documentId: produto.documentId,
    });
    ctx.body = { message: 'Produto excluído com sucesso.' };
  },

  async findPublic(ctx: Context): Promise<void> {
    const produtos: ProdutoBanco[] = await strapi.db
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

    const catalogo: ProdutoPublico[] = produtos.map((produto) => ({
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
          documentId: produto.feirante.documentId,
            nome_da_barraca: produto.feirante.nome_da_barraca,
            whatsapp: produto.feirante.whatsapp,
          }
        : null,
    }));

    ctx.body = catalogo;
  },
} satisfies Core.Controller;

export default produtoController;
