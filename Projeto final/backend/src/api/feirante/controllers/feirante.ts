import { factories } from '@strapi/strapi';
import type { ProdutoBanco, ProdutoPublico } from '../../../types/api.js';

interface Midia {
  url: string;
  mime?: string;
  alternativeText?: string | null;
}

interface Banca {
  nome?: string;
  documentId: string;
  nome_da_barraca?: string;
  descricao?: string;
  whatsapp?: string;
  media?: Midia[];
  users_permissions_user?: { blocked?: boolean } | null;
}

function dadosPublicos(banca: Banca) {
  const foto = banca.media?.find((arquivo) => arquivo.mime?.startsWith('image/'));
  return {
    documentId: banca.documentId,
    nome: banca.nome || '',
    nome_da_barraca: banca.nome_da_barraca || 'Banca da feira',
    descricao: banca.descricao || '',
    whatsapp: banca.whatsapp || '',
    foto: foto ? { url: foto.url, alternativeText: foto.alternativeText } : null,
  };
}

export default factories.createCoreController('api::feirante.feirante', ({ strapi }) => ({
  async findPublic(ctx) {
    const bancas: Banca[] = await strapi.db.query('api::feirante.feirante').findMany({
      populate: { media: true, users_permissions_user: { select: ['blocked'] } },
      orderBy: { nome_da_barraca: 'asc' },
    });

    ctx.body = bancas
      .filter((banca) => !banca.users_permissions_user?.blocked)
      .map(dadosPublicos);
  },

  async findPublicOne(ctx) {
    const banca: Banca | null = await strapi.db.query('api::feirante.feirante').findOne({
      where: { documentId: ctx.params.documentId },
      populate: { media: true, users_permissions_user: { select: ['blocked'] } },
    });

    if (!banca || banca.users_permissions_user?.blocked) {
      return ctx.notFound('Feirante não encontrado.');
    }

    const produtos: ProdutoBanco[] = await strapi.db.query('api::produto.produto').findMany({
      where: {
        feirante: { documentId: banca.documentId },
        disponivel: true,
      },
      populate: { imagem: true },
      orderBy: { createdAt: 'desc' },
    });

    const catalogo: ProdutoPublico[] = produtos.map((produto) => ({
      documentId: produto.documentId,
      nome: produto.nome,
      descricao: produto.descricao,
      preco: produto.preco,
      disponivel: produto.disponivel,
      imagem: produto.imagem
        ? { url: produto.imagem.url, alternativeText: produto.imagem.alternativeText }
        : null,
      feirante: { nome_da_barraca: banca.nome_da_barraca || 'Banca da feira' },
    }));

    ctx.body = { ...dadosPublicos(banca), produtos: catalogo };
  },
}));
