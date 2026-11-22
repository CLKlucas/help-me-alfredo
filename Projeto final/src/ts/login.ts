import { entrar, obterMinhaConta } from './auth.js';
import { obterElemento, obterMensagemErro } from './util.js';

const formulario = obterElemento<HTMLFormElement>('#login-form');
const mensagem = obterElemento<HTMLElement>('#mensagem');

formulario.addEventListener('submit', async (event: SubmitEvent) => {
  event.preventDefault();

  const botao = obterElemento<HTMLButtonElement>(
    'button[type="submit"]',
    formulario
  );

  botao.disabled = true;
  mensagem.textContent = 'Verificando acesso...';

  const email = obterElemento<HTMLInputElement>('#email').value.trim();
  const senha = obterElemento<HTMLInputElement>('#senha').value;

  try {
    await entrar(email, senha);

    mensagem.textContent = 'Carregando sua conta...';

    const conta = await obterMinhaConta();

    if (conta.tipo === 'feirante') {
      window.location.href = 'painel-feirante.html';
      return;
    }

    if (conta.tipo === 'consumidor') {
      window.location.href = 'inicio.html';
      return;
    }

    throw new Error('Tipo de conta não reconhecido.');
  } catch (error) {
    mensagem.textContent = obterMensagemErro(error);
  } finally {
    botao.disabled = false;
  }
});
