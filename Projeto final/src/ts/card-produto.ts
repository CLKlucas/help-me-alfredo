import { API_URL } from './api.js';
import type { Produto } from './types.js';

function formatarPreco(preco: Produto['preco']): string {
  return Number(preco).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
}

export function criarCardProduto(produto: Produto): HTMLElement {
  const card = document.createElement('article');
  card.className = 'produto-card';
  if (produto.imagem?.url) {
    const imagem = document.createElement('img');

    imagem.src = produto.imagem.url.startsWith('http')
      ? produto.imagem.url
      : `${API_URL.replace('/api', '')}${produto.imagem.url}`;

    imagem.alt = produto.imagem.alternativeText || produto.nome;
    imagem.className = 'produto-imagem';

    card.appendChild(imagem);
  }

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
