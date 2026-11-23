import { apiRequest, uploadImagem } from './api.js';
import { obterMinhaConta, sair } from './auth.js';
import type { Produto } from './types.js';
import { obterElemento, obterMensagemErro } from './util.js';


const mensagem = obterElemento<HTMLElement>('#mensagem-painel');
const conteudo = obterElemento<HTMLElement>('#conteudo-painel');
const botaoSair = obterElemento<HTMLButtonElement>('#botao-sair');

const formularioProduto = obterElemento<HTMLFormElement>('#form-produto');
const mensagemProduto = obterElemento<HTMLElement>('#mensagem-produto');
const listaProdutos = obterElemento<HTMLElement>('#lista-produtos');
const totalProdutos = obterElemento<HTMLElement>('#total-produtos');
const botaoCadastrar = obterElemento<HTMLButtonElement>(
  '#botao-cadastrar-produto'
);

botaoSair.addEventListener('click', sair);

const formatarPreco = (preco: Produto['preco']): string => {
  return Number(preco).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
};

function exibirProdutos(produtos: Produto[]): void {
  listaProdutos.replaceChildren();

  totalProdutos.textContent =
    `${produtos.length} ${produtos.length === 1 ? 'produto' : 'produtos'}`;

  if (produtos.length === 0) {
    const vazio = document.createElement('p');
    vazio.className = 'text-secondary';
    vazio.textContent = 'Você ainda não cadastrou nenhum produto.';
    listaProdutos.appendChild(vazio);
    return;
  }

  produtos.forEach((produto) => {
    const coluna = document.createElement('div');
    coluna.className = 'col-md-6 col-lg-4';

    const card = document.createElement('article');
    card.className = 'card painel-produto h-100';

    const corpo = document.createElement('div');
    corpo.className = 'card-body p-4';

    const nome = document.createElement('h4');
    nome.className = 'h5 fw-bold';
    nome.textContent = produto.nome;

    const descricao = document.createElement('p');
    descricao.className = 'text-secondary';
    descricao.textContent =
      produto.descricao || 'Sem descrição cadastrada.';

    const preco = document.createElement('p');
    preco.className = 'h5 fw-bold text-success';
    preco.textContent = formatarPreco(produto.preco);

    const disponibilidade = document.createElement('span');
    disponibilidade.className = produto.disponivel
      ? 'badge text-bg-success'
      : 'badge text-bg-secondary';

    disponibilidade.textContent = produto.disponivel
      ? 'Disponível'
      : 'Indisponível';

    corpo.append(nome, descricao, preco, disponibilidade);
    card.appendChild(corpo);
    coluna.appendChild(card);
    listaProdutos.appendChild(coluna);
  });
}

async function carregarProdutos(): Promise<void> {
  listaProdutos.textContent = 'Carregando produtos...';

  try {
    const produtos = await apiRequest<Produto[]>('/produtos');
    exibirProdutos(Array.isArray(produtos) ? produtos : []);
  } catch (error) {
    listaProdutos.textContent = 'Não foi possível carregar os produtos.';
    console.error('Erro ao carregar produtos:', error);
  }
}


formularioProduto.addEventListener('submit', async (event: SubmitEvent) => {
  event.preventDefault();

  botaoCadastrar.disabled = true;
  mensagemProduto.textContent = 'Cadastrando produto...';

  const dados = {
    nome: obterElemento<HTMLInputElement>('#produto-nome').value.trim(),
    descricao: obterElemento<HTMLTextAreaElement>('#produto-descricao').value.trim(),
    preco: Number(obterElemento<HTMLInputElement>('#produto-preco').value),
    disponivel: obterElemento<HTMLInputElement>('#produto-disponivel').checked,
  };

  try {
    const arquivo = document.querySelector<HTMLInputElement>(
      '#produto-imagem'
    )?.files?.[0];

    if (arquivo) {
      const imagemId = await uploadImagem(arquivo);

      await apiRequest('/produtos', {
        method: 'POST',
        body: JSON.stringify({
          ...dados,
          imagem: imagemId,
        }),
      });
    } else {
      await apiRequest('/produtos', {
        method: 'POST',
        body: JSON.stringify(dados),
      });
    }

    formularioProduto.reset();
    obterElemento<HTMLInputElement>('#produto-disponivel').checked = true;

    mensagemProduto.textContent = 'Produto cadastrado com sucesso!';

    await carregarProdutos();
  } catch (error) {
    mensagemProduto.textContent = obterMensagemErro(error);
    console.error('Erro ao cadastrar produto:', error);
  } finally {
    botaoCadastrar.disabled = false;
  }
});


async function carregarPainel(): Promise<void> {
  if (!sessionStorage.getItem('jwt')) {
    window.location.href = 'login.html';
    return;
  }

  try {
    const conta = await obterMinhaConta();

    if (conta.tipo !== 'feirante') {
      window.location.href = 'inicio.html';
      return;
    }

    obterElemento<HTMLElement>('#nome-barraca').textContent =
      conta.perfil.nome_da_barraca;

    obterElemento<HTMLElement>('#descricao-barraca').textContent =
      conta.perfil.descricao || 'Nenhuma descrição cadastrada.';

    obterElemento<HTMLElement>('#nome-usuario').textContent =
      conta.usuario.nome;

    obterElemento<HTMLElement>('#email-usuario').textContent =
      conta.usuario.email;

    obterElemento<HTMLElement>('#whatsapp-barraca').textContent = String(
      conta.perfil.whatsapp || 'Não informado'
    );

    mensagem.textContent = '';
    conteudo.hidden = false;

    await carregarProdutos();

  } catch (error) {
    mensagem.textContent =
      'Não foi possível carregar sua conta. Faça login novamente.';

    console.error(error);
  }
}

carregarPainel();
