import { entrar, obterMinhaConta } from './auth.js';

const formulario = document.querySelector('#login-form');
const mensagem = document.querySelector('#mensagem');

formulario.addEventListener('submit', async (event) => {
    event.preventDefault();

    const botao = formulario.querySelector('button[type="submit"]');

    botao.disabled = true;
    mensagem.textContent = 'Verificando acesso...';

    const email = document.querySelector('#email').value.trim();
    const senha = document.querySelector('#senha').value;

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
        mensagem.textContent = error.message;
    } finally {
        botao.disabled = false;
    }
});
