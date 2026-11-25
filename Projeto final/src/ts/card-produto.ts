import { API_URL } from './api.js';
import { adicionarAoCarrinho } from './carrinho.js';
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

  const botao = document.createElement('button');
  botao.type = 'button';
  botao.className = 'btn btn-success produto-adicionar';
  botao.textContent = 'Adicionar ao carrinho';
  const mensagem = document.createElement('p');
  mensagem.className = 'produto-mensagem';
  mensagem.setAttribute('role', 'status');
  mensagem.setAttribute('aria-live', 'polite');
  botao.addEventListener('click', () => {
    mensagem.textContent = adicionarAoCarrinho(produto)
      ? 'Adicionado ao carrinho.'
      : 'Este produto não está disponível para pedidos.';
  });

  card.append(nome, descricao, preco, barraca, botao, mensagem);

  return card;
}
