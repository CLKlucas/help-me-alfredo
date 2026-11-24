import { API_URL } from './api.js';
import { criarCardProduto } from './card-produto.js';
import type { Produto } from './types.js';
import { obterElemento } from './util.js';

const listaProdutos = obterElemento<HTMLElement>('#lista-produtos');
const mensagem = obterElemento<HTMLElement>('#mensagem-produtos');

async function carregarCatalogo(): Promise<void> {
  try {
    const response = await fetch(`${API_URL}/catalogo-produtos`);

    if (!response.ok) {
      throw new Error('Não foi possível consultar os produtos.');
    }

    const dados: unknown = await response.json();

    listaProdutos.replaceChildren();

    if (!Array.isArray(dados) || dados.length === 0) {
      mensagem.textContent =
        'Ainda não existem produtos disponíveis na feira.';
      return;
    }

    const produtos = dados as Produto[];

    produtos.forEach((produto) => {
      listaProdutos.appendChild(criarCardProduto(produto));
    });

    mensagem.textContent =
      `${produtos.length} produtos disponíveis na feira.`;

  } catch (error) {
    mensagem.textContent =
      'Não foi possível carregar os produtos. Tente novamente mais tarde.';
    console.error('Erro ao carregar catálogo:', error);
  }
}

carregarCatalogo();
