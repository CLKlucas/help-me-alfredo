import { cadastrar, entrar } from './auth.js';

const formulario = document.querySelector('#cadastro-form');
const tipoConta = document.querySelector('#conta_tipo');
const camposPerfil = document.querySelector('#campos-perfil');
const mensagem = document.querySelector('#mensagem');

function atualizarCampos() {
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

formulario.addEventListener('submit', async (event) => {
    event.preventDefault();

    mensagem.textContent = 'Realizando cadastro...';

    const tipo = tipoConta.value;
    const senha = document.querySelector('#senha').value;
    const confirmarSenha = document.querySelector('#confirmar_senha').value;

    if (senha !== confirmarSenha) {
        mensagem.textContent = 'As senhas não coincidem.';
        return;
    }

    const dados = {
        tipo,
        nome: document.querySelector('#nome').value.trim(),
        email: document.querySelector('#email').value.trim(),
        password: senha,
        whatsapp: document.querySelector('#whatsapp').value.trim(),
    };

    if (tipo === 'feirante') {
        dados.nome_da_barraca =
            document.querySelector('#nome_da_barraca').value.trim();

        dados.descricao =
            document.querySelector('#descricao').value.trim();
    } else {
        dados.endereco =
            document.querySelector('#endereco').value.trim();
    }

    const botao = formulario.querySelector('button[type="submit"]');
    botao.disabled = true;

    try {
        await cadastrar(dados);
        await entrar(dados.email, dados.password);

        mensagem.textContent = 'Cadastro realizado com sucesso!';

        window.location.href = 'inicio.html';
    } catch (error) {
        mensagem.textContent = error.message;
    } finally {
        botao.disabled = false;
    }
});
