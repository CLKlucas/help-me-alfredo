import type { OpcoesRequisicao, RespostaErroApi } from './types.js';

export const API_URL = 'http://localhost:1337/api';

const rotasPublicas: string[] = ['/auth/local', '/cadastro'];

function eObjeto(valor: unknown): valor is Record<string, unknown> {
  return typeof valor === 'object' && valor !== null;
}

function obterMensagemResposta(dados: unknown): string {
  const mensagemPadrao = 'Não foi possível realizar a operação.';

  if (!eObjeto(dados)) {
    return mensagemPadrao;
  }

  const resposta = dados as RespostaErroApi;
  const mensagemErro = resposta.error?.message;
  const mensagemApi = resposta.message;

  if (mensagemErro) {
    return mensagemErro;
  }

  if (mensagemApi) {
    return mensagemApi;
  }

  return mensagemPadrao;
}

export async function apiRequest<T>(
  endpoint: string,
  options: OpcoesRequisicao = {}
): Promise<T> {
  const token = sessionStorage.getItem('jwt');

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token && !rotasPublicas.includes(endpoint)) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
    credentials: 'include',
  });

  const dados: unknown = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(obterMensagemResposta(dados));
  }

  return dados as T;
}
