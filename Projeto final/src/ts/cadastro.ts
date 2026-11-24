import { cadastrar } from './auth.js';
import type { DadosCadastro } from './types.js';
import { obterElemento, obterMensagemErro } from './util.js';
import { normalizarWhatsApp, validarCadastro } from './validacao-cadastro.js';

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
            <input class="form-control mb-1" type="tel" inputmode="tel"
                id="whatsapp" autocomplete="tel" aria-describedby="ajuda-whatsapp" required>
            <p id="ajuda-whatsapp" class="form-text mb-3">Informe o DDD. Pode usar espaços, parênteses e traços: (85) 99999-9999.</p>

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
            <input class="form-control mb-1" type="tel" inputmode="tel"
                id="whatsapp" autocomplete="tel" aria-describedby="ajuda-whatsapp" required>
            <p id="ajuda-whatsapp" class="form-text mb-3">Informe o DDD. Pode usar espaços, parênteses e traços: (85) 99999-9999.</p>

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

  mensagem.textContent = '';
  if (!formulario.reportValidity()) return;

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
    whatsapp: normalizarWhatsApp(obterElemento<HTMLInputElement>('#whatsapp').value),
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

  const erroValidacao = validarCadastro(dados);
  if (erroValidacao) {
    mensagem.textContent = erroValidacao;
    return;
  }
  mensagem.textContent = 'Realizando cadastro...';

  const botao = obterElemento<HTMLButtonElement>(
    'button[type="submit"]',
    formulario
  );
  botao.disabled = true;

  try {
    await cadastrar(dados);
    sessionStorage.removeItem('jwt');
    sessionStorage.removeItem('usuario');

    mensagem.textContent = 'Cadastro realizado com sucesso!';

    window.location.href = 'login.html?cadastro=sucesso';
  } catch (error) {
    mensagem.textContent = obterMensagemErro(error);
  } finally {
    botao.disabled = false;
  }
});
