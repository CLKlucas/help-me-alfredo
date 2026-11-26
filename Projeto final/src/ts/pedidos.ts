import { apiRequest } from './api.js';
import {
  alterarQuantidade,
  obterCarrinho,
  ouvirCarrinho,
  removerDoCarrinho,
  removerPedidoDoCarrinho,
} from './carrinho.js';
import type { ItemCarrinho, Pedido } from './types.js';
import { obterElemento, obterMensagemErro } from './util.js';

interface MinhaContaResumo {
  tipo: 'consumidor' | 'feirante';
}

type ProximoStatus = 'aceito' | 'concluido' | 'cancelado';

const listaCarrinho = obterElemento<HTMLElement>('#lista-carrinho');
const mensagemCarrinho = obterElemento<HTMLElement>('#mensagem-carrinho');
const entrarParaPedir = obterElemento<HTMLAnchorElement>('#entrar-para-pedir');
const secaoHistorico = obterElemento<HTMLElement>('#secao-historico');
const tituloHistorico = obterElemento<HTMLElement>('#titulo-historico');
const mensagemPedidos = obterElemento<HTMLElement>('#mensagem-pedidos');
const listaPedidos = obterElemento<HTMLElement>('#lista-pedidos');
const secaoRecebidos = obterElemento<HTMLElement>('#secao-recebidos');
const mensagemRecebidos = obterElemento<HTMLElement>('#mensagem-recebidos');
const listaRecebidos = obterElemento<HTMLElement>('#lista-recebidos');

function dinheiro(valor: number): string {
  return Number(valor).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
}

function elemento<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  classe?: string,
  texto?: string
): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag);
  if (classe) node.className = classe;
  if (texto) node.textContent = texto;
  return node;
}

function agruparItens(itens: ItemCarrinho[]): Map<string, ItemCarrinho[]> {
  const grupos = new Map<string, ItemCarrinho[]>();
  for (const item of itens) {
    const grupo = grupos.get(item.feirante) || [];
    grupo.push(item);
    grupos.set(item.feirante, grupo);
  }
  return grupos;
}

function renderizarCarrinho(): void {
  const itens = obterCarrinho();
  listaCarrinho.replaceChildren();
  entrarParaPedir.hidden = Boolean(sessionStorage.getItem('jwt')) || itens.length === 0;
  mensagemCarrinho.textContent = itens.length
    ? 'Cada banca recebe um pedido separado.'
    : 'Seu carrinho está vazio.';

  for (const grupo of agruparItens(itens).values()) {
    const cartao = elemento('article', 'card shadow-sm');
    const corpo = elemento('div', 'card-body');
    corpo.appendChild(elemento('h3', 'h5 fw-bold', grupo[0].nomeDaBanca));

    let total = 0;
    for (const item of grupo) {
      total += item.preco * item.quantidade;
      const linha = elemento('div', 'd-flex flex-wrap align-items-center gap-3 border-bottom py-3');
      const descricao = elemento('div', 'flex-grow-1');
      descricao.append(
        elemento('strong', '', item.nome),
        elemento('p', 'mb-0 text-secondary', `${dinheiro(item.preco)} cada`)
      );

      const controles = elemento('div', 'd-flex align-items-center gap-2');
      const menos = elemento('button', 'btn btn-outline-secondary');
      menos.type = 'button';
      menos.textContent = '-';
      menos.setAttribute('aria-label', `Diminuir quantidade de ${item.nome}`);
      menos.disabled = item.quantidade <= 1;
      menos.addEventListener('click', () => alterarQuantidade(item.produto, item.quantidade - 1));

      const quantidade = elemento('span', 'fw-semibold text-center');
      quantidade.textContent = String(item.quantidade);
      quantidade.style.minWidth = '2rem';

      const mais = elemento('button', 'btn btn-outline-secondary');
      mais.type = 'button';
      mais.textContent = '+';
      mais.setAttribute('aria-label', `Aumentar quantidade de ${item.nome}`);
      mais.disabled = item.quantidade >= 99;
      mais.addEventListener('click', () => alterarQuantidade(item.produto, item.quantidade + 1));

      const remover = elemento('button', 'btn btn-link text-danger');
      remover.type = 'button';
      remover.textContent = 'Remover';
      remover.addEventListener('click', () => removerDoCarrinho(item.produto));
      controles.append(menos, quantidade, mais, remover);
      linha.append(descricao, controles);
      corpo.appendChild(linha);
    }

    corpo.appendChild(elemento('p', 'fw-bold text-end mt-3', `Subtotal: ${dinheiro(total)}`));
    if (sessionStorage.getItem('jwt')) {
      const finalizar = elemento('button', 'btn btn-success');
      finalizar.type = 'button';
      finalizar.textContent = 'Finalizar pedido';
      finalizar.addEventListener('click', () => finalizarPedido(grupo, finalizar));
      corpo.appendChild(finalizar);
    }
    cartao.appendChild(corpo);
    listaCarrinho.appendChild(cartao);
  }
}

async function finalizarPedido(
  itens: ItemCarrinho[],
  botao: HTMLButtonElement
): Promise<void> {
  botao.disabled = true;
  mensagemCarrinho.textContent = 'Enviando seu pedido...';
  try {
    await apiRequest<Pedido>('/pedidos', {
      method: 'POST',
      body: JSON.stringify({
        itens: itens.map((item) => ({
          produto: item.produto,
          quantidade: item.quantidade,
        })),
      }),
    });
    removerPedidoDoCarrinho(itens.map((item) => item.produto));
    renderizarCarrinho();
    mensagemCarrinho.textContent = `Pedido enviado para ${itens[0].nomeDaBanca}.`;
    await carregarPedidos();
  } catch (erro) {
    mensagemCarrinho.textContent = obterMensagemErro(erro);
    botao.disabled = false;
  }
}

function statusLegivel(status: Pedido['status']): string {
  const nomes: Record<Pedido['status'], string> = {
    pendente: 'Pendente',
    aceito: 'Aceito',
    concluido: 'Concluído',
    cancelado: 'Cancelado',
  };
  return nomes[status];
}

function renderizarPedido(pedido: Pedido, tipo: 'consumidor' | 'feirante'): HTMLElement {
  const cartao = elemento('article', 'card shadow-sm');
  const corpo = elemento('div', 'card-body');
  const topo = elemento('div', 'd-flex flex-wrap justify-content-between gap-2');
  topo.appendChild(elemento(
    'h3',
    'h5 fw-bold',
    tipo === 'consumidor'
      ? pedido.feirante?.nome || 'Feirante'
      : pedido.consumidor?.nome || 'Consumidor'
  ));
  topo.appendChild(elemento('span', 'badge text-bg-primary align-self-start', statusLegivel(pedido.status)));
  corpo.appendChild(topo);

  const data = new Date(pedido.createdAt);
  corpo.appendChild(elemento(
    'p',
    'small text-secondary',
    `Pedido em ${Number.isNaN(data.getTime()) ? 'data não informada' : data.toLocaleString('pt-BR')}`
  ));

  const listaItens = elemento('ul', 'list-group list-group-flush mb-3');
  for (const item of pedido.itens) {
    listaItens.appendChild(elemento(
      'li',
      'list-group-item px-0',
      `${item.nome} x ${item.quantidade} - ${dinheiro(item.subtotal)}`
    ));
  }
  corpo.appendChild(listaItens);
  corpo.appendChild(elemento('p', 'fw-bold', `Total: ${dinheiro(pedido.total)}`));

  if (tipo === 'feirante' && pedido.consumidor?.whatsapp) {
    const contato = elemento('button', 'btn btn-outline-primary me-2', 'Falar com comprador');
    contato.type = 'button';
    corpo.appendChild(contato);
  }

  const acoes: { status: ProximoStatus; texto: string }[] = tipo === 'feirante'
    ? pedido.status === 'pendente'
      ? [
          { status: 'aceito', texto: 'Aceitar pedido' },
          { status: 'cancelado', texto: 'Cancelar pedido' },
        ]
      : pedido.status === 'aceito'
        ? [
            { status: 'concluido', texto: 'Marcar como concluído' },
            { status: 'cancelado', texto: 'Cancelar pedido' },
          ]
        : []
    : pedido.status === 'pendente'
      ? [{ status: 'cancelado', texto: 'Cancelar pedido' }]
      : [];

  for (const acao of acoes) {
    const botao = elemento(
      'button',
      acao.status === 'cancelado' ? 'btn btn-outline-danger me-2' : 'btn btn-success me-2',
      acao.texto
    );
    botao.type = 'button';
    botao.addEventListener('click', () => atualizarStatus(pedido, acao.status, botao));
    corpo.appendChild(botao);
  }

  cartao.appendChild(corpo);
  return cartao;
}

async function atualizarStatus(
  pedido: Pedido,
  status: ProximoStatus,
  botao: HTMLButtonElement
): Promise<void> {
  botao.disabled = true;
  mensagemPedidos.textContent = 'Atualizando pedido...';
  try {
    await apiRequest(`/pedidos/${encodeURIComponent(pedido.documentId)}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
    await carregarPedidos();
  } catch (erro) {
    mensagemPedidos.textContent = obterMensagemErro(erro);
    botao.disabled = false;
  }
}

async function carregarListaPedidos(
  rota: string,
  lista: HTMLElement,
  mensagem: HTMLElement,
  tipo: 'consumidor' | 'feirante'
): Promise<void> {
  mensagem.textContent = 'Carregando pedidos...';
  try {
    const pedidos = await apiRequest<Pedido[]>(rota);
    lista.replaceChildren();
    mensagem.textContent = pedidos.length ? '' : tipo === 'feirante'
      ? 'Você ainda não recebeu pedidos.' : 'Você ainda não fez pedidos.';
    pedidos.forEach((pedido) => lista.appendChild(renderizarPedido(pedido, tipo)));
  } catch (erro) {
    mensagem.textContent = obterMensagemErro(erro);
  }
}

async function carregarPedidos(): Promise<void> {
  try {
    const conta = await apiRequest<MinhaContaResumo>('/minha-conta');
    const tipo = conta.tipo;
    secaoHistorico.hidden = false;
    tituloHistorico.textContent = 'Meus pedidos';
    secaoRecebidos.hidden = tipo !== 'feirante';
    await carregarListaPedidos('/pedidos?visao=compras', listaPedidos, mensagemPedidos, 'consumidor');
    if (tipo === 'feirante') {
      await carregarListaPedidos('/pedidos', listaRecebidos, mensagemRecebidos, 'feirante');
    }
  } catch (erro) {
    mensagemPedidos.textContent = obterMensagemErro(erro);
  }
}

async function iniciar(): Promise<void> {
  renderizarCarrinho();
  ouvirCarrinho(renderizarCarrinho);
  if (!sessionStorage.getItem('jwt')) {
    secaoHistorico.hidden = true;
    mensagemCarrinho.textContent = obterCarrinho().length
      ? 'Entre na sua conta para finalizar o pedido.'
      : 'Adicione produtos pelo catálogo para começar.';
    return;
  }
  await carregarPedidos();
}

iniciar();
