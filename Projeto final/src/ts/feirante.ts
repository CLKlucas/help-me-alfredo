import { API_URL, apiRequest } from './api.js';
import { criarCardProduto } from './card-produto.js';
import type { BancaPublica, Produto } from './types.js';
import { obterElemento, obterMensagemErro } from './util.js';

interface BancaDetalhada extends BancaPublica {
  produtos: Produto[];
}

const mensagem = obterElemento<HTMLElement>('#mensagem-feirante');
const conteudo = obterElemento<HTMLElement>('#conteudo-feirante');

async function carregarBarraca(): Promise<void> {
  const id = new URLSearchParams(window.location.search).get('id');
  if (!id) {
    mensagem.textContent = 'Escolha uma barraca na página de feirantes.';
    return;
  }

  try {
    const banca = await apiRequest<BancaDetalhada>(`/catalogo-feirantes/${encodeURIComponent(id)}`);
    if (!Array.isArray(banca.produtos)) throw new Error('Resposta inválida da barraca.');

    document.title = `${banca.nome_da_barraca} | Feira Digital de Baturité`;
    obterElemento<HTMLElement>('#nome-barraca').textContent = banca.nome_da_barraca;
    obterElemento<HTMLElement>('#nome-feirante').textContent = banca.nome
      ? `Feirante: ${banca.nome}` : 'Nome do feirante não informado';
    obterElemento<HTMLElement>('#descricao-barraca').textContent = banca.descricao || 'Descrição não informada.';
    obterElemento<HTMLElement>('#whatsapp-barraca').textContent = banca.whatsapp
      ? `WhatsApp: ${banca.whatsapp}` : 'WhatsApp não informado';

    const foto = obterElemento<HTMLImageElement>('#foto-feirante');
    if (banca.foto) {
      foto.src = new URL(banca.foto.url, API_URL.replace('/api', '')).href;
      foto.alt = banca.foto.alternativeText || `Banca ${banca.nome_da_barraca}`;
      foto.classList.remove('foto-banca--logo');
    } else {
      foto.src = '../img/logotipo.jpg';
      foto.alt = `Logo da Feira Digital para ${banca.nome_da_barraca}`;
      foto.classList.add('foto-banca--logo');
    }
    obterElemento<HTMLElement>('#foto-barraca').hidden = false;

    const lista = obterElemento<HTMLElement>('#lista-produtos');
    for (const produto of banca.produtos) lista.appendChild(criarCardProduto(produto));
    obterElemento<HTMLElement>('#mensagem-produtos').textContent = banca.produtos.length
      ? '' : 'Esta barraca ainda não tem produtos disponíveis.';
    mensagem.textContent = '';
    conteudo.hidden = false;
  } catch (erro) {
    mensagem.textContent = `Não foi possível carregar a barraca. ${obterMensagemErro(erro)}`;
  }
}

carregarBarraca();
