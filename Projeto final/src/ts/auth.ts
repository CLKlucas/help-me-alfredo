import { apiRequest } from './api.js';
import type {
  DadosCadastro,
  MinhaConta,
  RespostaAutenticacao,
  RespostaCadastro,
  Sessao,
  Usuario,
} from './types.js';

const CHAVE_JWT = 'jwt';
const CHAVE_USUARIO = 'usuario';

export async function cadastrar(dados: DadosCadastro): Promise<RespostaCadastro> {
  return apiRequest<RespostaCadastro>('/cadastro', {
    method: 'POST',
    body: JSON.stringify(dados),
  });
}

export async function entrar(email: string, password: string): Promise<Usuario> {
  const data = await apiRequest<RespostaAutenticacao>('/auth/local', {
    method: 'POST',
    body: JSON.stringify({
      identifier: email,
      password,
    }),
  });

  const sessao: Sessao = {
    jwt: data.jwt,
    usuario: data.user,
  };

  sessionStorage.setItem(CHAVE_JWT, sessao.jwt);
  sessionStorage.setItem(CHAVE_USUARIO, JSON.stringify(sessao.usuario));

  return sessao.usuario;
}

export async function obterMinhaConta(): Promise<MinhaConta> {
  return apiRequest<MinhaConta>('/minha-conta');
}

export async function sair(): Promise<void> {
  try {
    await apiRequest('/auth/logout', { method: 'POST' });
  } catch {
  }
  sessionStorage.removeItem(CHAVE_JWT);
  sessionStorage.removeItem(CHAVE_USUARIO);

  window.location.href = 'login.html';
}

export function obterUsuario(): Usuario | null {
  const usuario = sessionStorage.getItem(CHAVE_USUARIO);

  if (!usuario) return null;
  try { return JSON.parse(usuario) as Usuario; }
  catch { return null; }
}
