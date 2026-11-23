import { cadastrar, entrar } from './auth.js';
import type { DadosCadastro } from './types.js';
import { obterElemento, obterMensagemErro } from './util.js';
import { API_URL, apiRequest, uploadImagem } from './api.js';

const formulario = obterElemento<HTMLFormElement>('#cadastro-form');
const tipoConta = obterElemento<HTMLSelectElement>('#conta_tipo');
const camposPerfil = obterElemento<HTMLElement>('#campos-perfil');
const mensagem = obterElemento<HTMLElement>('#mensagem');

function atualizarCampos(): void {
  if (tipoConta.value === 'feirante') {
    camposPerfil.innerHTML = `
            <label class="form-label fw-semibold" for="whatsapp">
                WhatsApp
            </label>
            <input class="form-control mb-3" type="tel"
                id="whatsapp" required>

            <label class="form-label fw-semibold" for="nome_da_barraca">
                Nome da barraca
            </label>
            <input class="form-control mb-3" type="text"
                id="nome_da_barraca" required>

            <label class="form-label fw-semibold" for="descricao">
                Descrição da barraca (opcional)
            </label>
            <textarea class="form-control mb-3"
                id="descricao"></textarea>
        `;
  } else {
    camposPerfil.innerHTML = `
            <label class="form-label fw-semibold" for="whatsapp">
                WhatsApp
            </label>
            <input class="form-control mb-3" type="tel"
                id="whatsapp" required>

            <label class="form-label fw-semibold" for="endereco">
                Endereço
            </label>
            <textarea class="form-control mb-3"
                id="endereco" required></textarea>
        `;
  }
}

tipoConta.addEventListener('change', atualizarCampos);
atualizarCampos();

formulario.addEventListener('submit', async (event: SubmitEvent) => {
  event.preventDefault();

  mensagem.textContent = 'Realizando cadastro...';

  const tipo = tipoConta.value as DadosCadastro['tipo'];
  const senha = obterElemento<HTMLInputElement>('#senha').value;
  const confirmarSenha =
    obterElemento<HTMLInputElement>('#confirmar_senha').value;

  if (senha !== confirmarSenha) {
    mensagem.textContent = 'As senhas não coincidem.';
    return;
  }

  const dados: DadosCadastro = {
    tipo,
    nome: obterElemento<HTMLInputElement>('#nome').value.trim(),
    email: obterElemento<HTMLInputElement>('#email').value.trim(),
    password: senha,
    whatsapp: obterElemento<HTMLInputElement>('#whatsapp').value.trim(),
  };

  if (tipo === 'feirante') {
    dados.nome_da_barraca = obterElemento<HTMLInputElement>(
      '#nome_da_barraca'
    ).value.trim();

    dados.descricao = obterElemento<HTMLTextAreaElement>(
      '#descricao'
    ).value.trim();
  } else {
    dados.endereco = obterElemento<HTMLTextAreaElement>(
      '#endereco'
    ).value.trim();
  }

  const botao = obterElemento<HTMLButtonElement>(
    'button[type="submit"]',
    formulario
  );
  botao.disabled = true;

  try {
    await cadastrar(dados);
    await entrar(dados.email, dados.password);

    mensagem.textContent = 'Cadastro realizado com sucesso!';

    window.location.href = 'inicio.html';
  } catch (error) {
    mensagem.textContent = obterMensagemErro(error);
  } finally {
    botao.disabled = false;
  }
});

const formularioProduto = document.querySelector<HTMLFormElement>(
    '#form-produto'
);

formularioProduto?.addEventListener('submit', async (event) => {
    event.preventDefault();

    const nome = document.querySelector<HTMLInputElement>('#nome-produto');
    const descricao = document.querySelector<HTMLTextAreaElement>('#descricao-produto');
    const preco = document.querySelector<HTMLInputElement>('#preco-produto');
    const imagem = document.querySelector<HTMLInputElement>('#imagem-produto');

    try {
        let imagemId: number | undefined;

        const arquivo = imagem?.files?.[0];

        if (arquivo) {
            imagemId = await uploadImagem(arquivo);
        }

        const produto = {
            nome: nome?.value.trim(),
            descricao: descricao?.value.trim(),
            preco: Number(preco?.value),
            disponivel: true,
            ...(imagemId !== undefined && { imagem: imagemId }),
        };

        await apiRequest('/produtos', {
            method: 'POST',
            body: JSON.stringify(produto),
        });

        alert('Produto cadastrado com sucesso!');
        formularioProduto.reset();

    } catch (error) {
        console.error(error);
        alert('Não foi possível cadastrar o produto.');
    }
});