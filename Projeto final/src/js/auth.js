import { apiRequest } from './api.js';

export async function cadastrar(dados) {
    return apiRequest('/cadastro', {
        method: 'POST',
        body: JSON.stringify(dados),
    });
}

export async function entrar(email, password) {
    const data = await apiRequest('/auth/local', {
        method: 'POST',
        body: JSON.stringify({
            identifier: email,
            password,
        }),
    });

    sessionStorage.setItem('jwt', data.jwt);
    sessionStorage.setItem('usuario', JSON.stringify(data.user));

    return data.user;
}

export async function obterMinhaConta() {
    return apiRequest('/minha-conta');
}

export function sair() {
    sessionStorage.removeItem('jwt');
    sessionStorage.removeItem('usuario');

    window.location.href = 'login.html';
}

export function obterUsuario() {
    const usuario = sessionStorage.getItem('usuario');

    return usuario ? JSON.parse(usuario) : null;
}
