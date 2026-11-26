import type { Core } from '@strapi/strapi';
import type { Context } from 'koa';

type TipoPedido = 'consumidor' | 'feirante';
type StatusPedido = 'pendente' | 'aceito' | 'concluido' | 'cancelado';

interface PerfilPedido {
  id: number;
  documentId: string;
  nome?: string | null;
  nome_da_barraca?: string | null;
  whatsapp?: string | number | null;
}

interface ContaPedido {
  tipo: TipoPedido;
  perfil: PerfilPedido;
}

interface ProdutoPedido {
  documentId: string;
  nome: string;
  preco: number | string;
  disponivel: boolean;
  feirante?: {
    id: number;
    documentId: string;
    nome_da_barraca?: string | null;
  } | null;
}

interface ItemPedido {
  [key: string]: string | number;
  produto: string;
  nome: string;
  preco: number;
  quantidade: number;
  subtotal: number;
}

interface PedidoBanco {
  id: number;
  documentId: string;
  itens: ItemPedido[];
  total: number;
  status: StatusPedido;
  observacao?: string | null;
  createdAt: string;
  consumidor?: PerfilPedido | null;
  feirante?: PerfilPedido | null;
  feirante_comprador?: PerfilPedido | null;
}

async function obterConta(ctx: Context): Promise<ContaPedido | null> {
  const userId = (ctx.state as { user?: { id?: number } }).user?.id;
  if (!userId) {
    ctx.unauthorized('Entre para acessar os pedidos.');
    return null;
  }

  const usuario: { role?: { name?: string } } | null = await strapi.db
    .query('plugin::users-permissions.user')
    .findOne({ where: { id: userId }, populate: { role: true } });
  const role = usuario?.role?.name;
  if (role !== 'Consumidor' && role !== 'Feirante') {
    ctx.forbidden('Esta conta não pode acessar pedidos.');
    return null;
  }

  const tipo: TipoPedido = role === 'Consumidor' ? 'consumidor' : 'feirante';
  const uid = `api::${tipo}.${tipo}` as
    | 'api::consumidor.consumidor'
    | 'api::feirante.feirante';
  const perfil: PerfilPedido | null = await strapi.db.query(uid).findOne({
    where: { users_permissions_user: { id: userId } },
  });
  if (!perfil) {
    ctx.notFound('Perfil vinculado à conta não encontrado.');
    return null;
  }

  return { tipo, perfil };
}

function paraCentavos(valor: number | string): number {
  return Math.round(Number(valor) * 100);
}

function formatarPedido(pedido: PedidoBanco, tipo: TipoPedido) {
  const comprador = pedido.consumidor || pedido.feirante_comprador;
  return {
    documentId: pedido.documentId,
    itens: pedido.itens,
    total: Number(pedido.total),
    status: pedido.status,
    observacao: pedido.observacao || '',
    createdAt: pedido.createdAt,
    feirante: pedido.feirante
      ? { nome: pedido.feirante.nome_da_barraca || 'Feirante' }
      : null,
    consumidor: tipo === 'feirante' && comprador
      ? {
          nome: comprador.nome || comprador.nome_da_barraca || 'Comprador',
          whatsapp: String(comprador.whatsapp || ''),
        }
      : null,
  };
}

const controller = {
  async find(ctx: Context): Promise<void> {
    const conta = await obterConta(ctx);
    if (!conta) return;

    const compras = conta.tipo === 'consumidor' || ctx.query.visao === 'compras';
    const relacao = compras
      ? conta.tipo === 'consumidor' ? 'consumidor' : 'feirante_comprador'
      : 'feirante';
    const pedidos: PedidoBanco[] = await strapi.db
      .query('api::pedido.pedido')
      .findMany({
        where: { [relacao]: { id: conta.perfil.id } },
        populate: { consumidor: true, feirante: true, feirante_comprador: true },
        orderBy: { createdAt: 'desc' },
      });

    ctx.body = pedidos.map((pedido) => formatarPedido(pedido, compras ? 'consumidor' : 'feirante'));
  },

  async create(ctx: Context): Promise<void> {
    const conta = await obterConta(ctx);
    if (!conta) return;

    const body = (ctx.request.body ?? {}) as Record<string, unknown>;
    if (!Array.isArray(body.itens) || body.itens.length === 0 || body.itens.length > 30) {
      return ctx.badRequest('Adicione entre 1 e 30 produtos ao pedido.');
    }

    const quantidades = new Map<string, number>();
    for (const valor of body.itens) {
      if (typeof valor !== 'object' || valor === null) {
        return ctx.badRequest('Os itens do pedido são inválidos.');
      }
      const item = valor as Record<string, unknown>;
      const produto = item.produto;
      const quantidade = item.quantidade;
      if (typeof produto !== 'string' || !produto.trim() ||
          typeof quantidade !== 'number' || !Number.isInteger(quantidade) ||
          quantidade < 1 || quantidade > 99) {
        return ctx.badRequest('Informe produtos e quantidades válidas (1 a 99).');
      }
      const totalQuantidade = (quantidades.get(produto) || 0) + quantidade;
      if (totalQuantidade > 99) {
        return ctx.badRequest('A quantidade máxima por produto é 99.');
      }
      quantidades.set(produto, totalQuantidade);
    }

    const produtos: ProdutoPedido[] = await strapi.db
      .query('api::produto.produto')
      .findMany({
        where: { documentId: { $in: Array.from(quantidades.keys()) } },
        populate: { feirante: true },
      });
    if (produtos.length !== quantidades.size || produtos.some((produto) => !produto.disponivel)) {
      return ctx.badRequest('Um ou mais produtos não estão mais disponíveis. Atualize o carrinho.');
    }

    const feirantes = new Map(
      produtos
        .filter((produto) => produto.feirante)
        .map((produto) => [produto.feirante!.documentId, produto.feirante!])
    );
    if (feirantes.size !== 1 || produtos.some((produto) => !produto.feirante)) {
      return ctx.badRequest('Finalize um pedido por feirante.');
    }
    const feirante = Array.from(feirantes.values())[0];
    if (!feirante) return ctx.badRequest('Não foi possível identificar o feirante.');

    const itens: ItemPedido[] = produtos.map((produto) => {
      const precoCentavos = paraCentavos(produto.preco);
      const quantidade = quantidades.get(produto.documentId) || 0;
      return {
        produto: produto.documentId,
        nome: produto.nome,
        preco: precoCentavos / 100,
        quantidade,
        subtotal: (precoCentavos * quantidade) / 100,
      };
    });
    const totalCentavos = itens.reduce(
      (total, item) => total + Math.round(item.subtotal * 100),
      0
    );
    const observacao = typeof body.observacao === 'string'
      ? body.observacao.trim().slice(0, 1000)
      : '';

    const relacaoComprador = conta.tipo === 'consumidor' ? 'consumidor' : 'feirante_comprador';
    const pedido = await strapi.documents('api::pedido.pedido').create({
      data: {
        [relacaoComprador]: conta.perfil.documentId,
        feirante: feirante.documentId,
        itens,
        total: totalCentavos / 100,
        status: 'pendente',
        observacao,
      },
    });

    ctx.status = 201;
    ctx.body = {
      documentId: pedido.documentId,
      itens,
      total: totalCentavos / 100,
      status: 'pendente',
      createdAt: pedido.createdAt,
      feirante: { nome: feirante.nome_da_barraca || 'Feirante' },
    };
  },

  async updateStatus(ctx: Context): Promise<void> {
    const conta = await obterConta(ctx);
    if (!conta) return;

    const body = (ctx.request.body ?? {}) as Record<string, unknown>;
    const status = body.status;
    if (status !== 'aceito' && status !== 'concluido' && status !== 'cancelado') {
      return ctx.badRequest('Status de pedido inválido.');
    }
    if (conta.tipo === 'consumidor' && status !== 'cancelado') {
      return ctx.forbidden('Consumidores só podem cancelar seus próprios pedidos.');
    }

    const relacaoComprador = conta.tipo === 'consumidor' ? 'consumidor' : 'feirante_comprador';
    const vinculos = [{ [relacaoComprador]: { id: conta.perfil.id } }];
    if (conta.tipo === 'feirante') vinculos.push({ feirante: { id: conta.perfil.id } });
    const pedido: PedidoBanco | null = await strapi.db
      .query('api::pedido.pedido')
      .findOne({
        where: {
          documentId: ctx.params.documentId,
          $or: vinculos,
        },
        populate: { feirante: true },
      });
    if (!pedido) return ctx.notFound('Pedido não encontrado na sua conta.');
    const vendedor = conta.tipo === 'feirante' && pedido.feirante?.id === conta.perfil.id;
    if (!vendedor && status !== 'cancelado') {
      return ctx.forbidden('Compradores só podem cancelar seus próprios pedidos.');
    }

    const transicoes: Record<StatusPedido, StatusPedido[]> = {
      pendente: ['aceito', 'cancelado'],
      aceito: ['concluido', 'cancelado'],
      concluido: [],
      cancelado: [],
    };
    const podeAtualizar = vendedor
      ? transicoes[pedido.status].includes(status)
      : pedido.status === 'pendente' && status === 'cancelado';
    if (!podeAtualizar) {
      return ctx.badRequest('Este pedido não pode receber essa alteração de status.');
    }

    await strapi.documents('api::pedido.pedido').update({
      documentId: pedido.documentId,
      data: { status },
    });
    ctx.body = { documentId: pedido.documentId, status };
  },
} satisfies Core.Controller;

export default controller;
