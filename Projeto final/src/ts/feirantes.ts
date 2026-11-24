import { API_URL, apiRequest } from './api.js';
import type { BancaPublica } from './types.js';
import { obterElemento, obterMensagemErro } from './util.js';

const lista = obterElemento<HTMLElement>('#lista-feirantes');
const mensagem = obterElemento<HTMLElement>('#mensagem-feirantes');

async function carregarFeirantes(): Promise<void> {
  try {
    const bancas = await apiRequest<BancaPublica[]>('/catalogo-feirantes');
    if (!Array.isArray(bancas)) throw new Error('Resposta inválida do catálogo.');
    lista.replaceChildren();
    mensagem.textContent = bancas.length ? '' : 'Ainda não há feirantes cadastrados.';
    for (const banca of bancas) {
      const coluna = document.createElement('div');
      coluna.className = 'col-12 col-md-6 col-lg-4';
      const card = document.createElement('article');
      card.className = 'card h-100';
      if (banca.foto) {
        const foto = document.createElement('img');
        foto.src = new URL(banca.foto.url, API_URL.replace('/api', '')).href;
        foto.alt = banca.foto.alternativeText || `Banca ${banca.nome_da_barraca}`;
        foto.className = 'card-img-top foto-banca';
        foto.loading = 'lazy';
        card.appendChild(foto);
      }
      const corpo = document.createElement('div');
      corpo.className = 'card-body d-flex flex-column p-4';
      const nome = document.createElement('h2');
      nome.className = 'h4 titulo-secao';
      const link = document.createElement('a');
      link.className = 'link-primary';
      link.href = `feirante.html?id=${encodeURIComponent(banca.documentId)}`;
      link.textContent = banca.nome_da_barraca;
      nome.appendChild(link);
      const responsavel = document.createElement('p');
      responsavel.className = 'fw-semibold';
      responsavel.textContent = banca.nome
        ? `Feirante: ${banca.nome}`
        : 'Nome do feirante não informado';
      const descricao = document.createElement('p');
      descricao.textContent = banca.descricao || 'Conheça os produtos desta banca na feira.';
      corpo.append(nome, responsavel, descricao);
      const contato = document.createElement('p');
      contato.className = 'mt-auto';
      contato.textContent = banca.whatsapp
        ? `WhatsApp: ${banca.whatsapp}`
        : 'WhatsApp não informado';
      corpo.appendChild(contato);
      card.appendChild(corpo);
      coluna.appendChild(card);
      lista.appendChild(coluna);
    }
  } catch (erro) {
    mensagem.textContent = `Não foi possível carregar os feirantes. ${obterMensagemErro(erro)}`;
  }
}
carregarFeirantes();
