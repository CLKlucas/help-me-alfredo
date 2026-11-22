import { API_URL } from './api.js';
import type { Produto } from './types.js';
import { obterElemento } from './util.js';

const listaProdutos = obterElemento<HTMLElement>('#lista-produtos');
const mensagem = obterElemento<HTMLElement>('#mensagem-produtos');

function formatarPreco(preco: Produto['preco']): string {
  return Number(preco).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
}

function criarCard(produto: Produto): HTMLElement {
  const card = document.createElement('article');
  card.className = 'produto-card';

  const nome = document.createElement('h3');
  nome.className = 'titulo-item';
  nome.textContent = produto.nome;

  const descricao = document.createElement('p');
  descricao.className = 'texto';
  descricao.textContent =
    produto.descricao || 'Produto disponível na feira.';

  const preco = document.createElement('p');
  preco.className = 'produto-preco';
  preco.textContent = formatarPreco(produto.preco);

  const barraca = document.createElement('p');
  barraca.className = 'produto-feirante';
  barraca.textContent =
    `Vendido por: ${produto.feirante?.nome_da_barraca || 'Feirante da feira'}`;

  const link = document.createElement('a');
  link.href = 'pedidos.html';
  link.textContent = 'Fazer pedido';

  card.append(nome, descricao, preco, barraca, link);

  return card;
}

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
      listaProdutos.appendChild(criarCard(produto));
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
