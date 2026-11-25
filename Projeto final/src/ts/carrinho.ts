import type { ItemCarrinho, Produto } from './types.js';

const CHAVE_CARRINHO = 'feira-carrinho';
const EVENTO_CARRINHO = 'carrinho-atualizado';

export function obterCarrinho(): ItemCarrinho[] {
  try {
    const dados: unknown = JSON.parse(localStorage.getItem(CHAVE_CARRINHO) || '[]');
    if (!Array.isArray(dados)) return [];
    return dados.filter((item): item is ItemCarrinho =>
      typeof item?.produto === 'string' &&
      typeof item?.nome === 'string' &&
      typeof item?.preco === 'number' &&
      Number.isInteger(item?.quantidade) &&
      typeof item?.feirante === 'string' &&
      typeof item?.nomeDaBanca === 'string'
    );
  } catch {
    return [];
  }
}

function salvarCarrinho(itens: ItemCarrinho[]): void {
  localStorage.setItem(CHAVE_CARRINHO, JSON.stringify(itens));
  window.dispatchEvent(new Event(EVENTO_CARRINHO));
}

export function adicionarAoCarrinho(produto: Produto): boolean {
  const produtoId = produto.documentId;
  const feiranteId = produto.feirante?.documentId;
  if (!produtoId || !feiranteId) return false;

  const itens = obterCarrinho();
  const existente = itens.find((item) => item.produto === produtoId);
  if (existente) {
    existente.quantidade = Math.min(99, existente.quantidade + 1);
  } else {
    itens.push({
      produto: produtoId,
      nome: produto.nome,
      preco: Number(produto.preco),
      quantidade: 1,
      feirante: feiranteId,
      nomeDaBanca: produto.feirante?.nome_da_barraca || 'Feirante da feira',
    });
  }
  salvarCarrinho(itens);
  return true;
}

export function alterarQuantidade(produtoId: string, quantidade: number): void {
  const itens = obterCarrinho();
  const item = itens.find((linha) => linha.produto === produtoId);
  if (!item) return;
  item.quantidade = Math.max(1, Math.min(99, Math.floor(quantidade)));
  salvarCarrinho(itens);
}

export function removerDoCarrinho(produtoId: string): void {
  salvarCarrinho(obterCarrinho().filter((item) => item.produto !== produtoId));
}

export function removerPedidoDoCarrinho(produtos: string[]): void {
  const removidos = new Set(produtos);
  salvarCarrinho(obterCarrinho().filter((item) => !removidos.has(item.produto)));
}

export function ouvirCarrinho(atualizar: () => void): void {
  window.addEventListener(EVENTO_CARRINHO, atualizar);
  window.addEventListener('storage', atualizar);
}