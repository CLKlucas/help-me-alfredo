import { obterMinhaConta, sair } from './auth.js';
import { apiRequest } from './api.js';

const mensagem = document.querySelector('#mensagem-painel');
const conteudo = document.querySelector('#conteudo-painel');
const botaoSair = document.querySelector('#botao-sair');

const formularioProduto = document.querySelector('#form-produto');
const mensagemProduto = document.querySelector('#mensagem-produto');
const listaProdutos = document.querySelector('#lista-produtos');
const totalProdutos = document.querySelector('#total-produtos');
const botaoCadastrar = document.querySelector('#botao-cadastrar-produto');

botaoSair.addEventListener('click', sair);

const formatarPreco = (preco) => {
    return Number(preco).toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL',
    });
};

function exibirProdutos(produtos) {
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

async function carregarProdutos() {
    listaProdutos.textContent = 'Carregando produtos...';

    try {
        const produtos = await apiRequest('/produtos');
        exibirProdutos(Array.isArray(produtos) ? produtos : []);
    } catch (error) {
        listaProdutos.textContent = 'Não foi possível carregar os produtos.';
        console.error('Erro ao carregar produtos:', error);
    }
}

formularioProduto.addEventListener('submit', async (event) => {
    event.preventDefault();

    botaoCadastrar.disabled = true;
    mensagemProduto.textContent = 'Cadastrando produto...';

    const dados = {
        nome: document.querySelector('#produto-nome').value.trim(),
        descricao: document.querySelector('#produto-descricao').value.trim(),
        preco: Number(document.querySelector('#produto-preco').value),
        disponivel: document.querySelector('#produto-disponivel').checked,
    };

    try {
        await apiRequest('/produtos', {
            method: 'POST',
            body: JSON.stringify(dados),
        });

        formularioProduto.reset();
        document.querySelector('#produto-disponivel').checked = true;

        mensagemProduto.textContent = 'Produto cadastrado com sucesso!';

        await carregarProdutos();
    } catch (error) {
        mensagemProduto.textContent = error.message;
    } finally {
        botaoCadastrar.disabled = false;
    }
});

async function carregarPainel() {
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

        document.querySelector('#nome-barraca').textContent =
            conta.perfil.nome_da_barraca;

        document.querySelector('#descricao-barraca').textContent =
            conta.perfil.descricao || 'Nenhuma descrição cadastrada.';

        document.querySelector('#nome-usuario').textContent =
            conta.usuario.nome;

        document.querySelector('#email-usuario').textContent =
            conta.usuario.email;

        document.querySelector('#whatsapp-barraca').textContent =
            conta.perfil.whatsapp || 'Não informado';

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
