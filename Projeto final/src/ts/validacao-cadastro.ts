import type { DadosCadastro } from './types.js';

export function normalizarWhatsApp(valor: string): string {
  return valor.replace(/[\s()+.\-]/g, '');
}

export function validarCadastro(dados: DadosCadastro): string | null {
  if (!['consumidor', 'feirante'].includes(dados.tipo)) return 'Selecione um tipo de conta válido.';
  if (!dados.nome || dados.nome.length > 120) return 'Informe seu nome, com até 120 caracteres.';
  if (dados.email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(dados.email)) {
    return 'Informe um e-mail válido.';
  }
  if (dados.password.length < 8 || new TextEncoder().encode(dados.password).length > 72) {
    return 'A senha deve ter ao menos 8 caracteres e no máximo 72 bytes.';
  }
  if (!/^\d{10,15}$/.test(dados.whatsapp)) {
    return 'Informe o WhatsApp com DDD, entre 10 e 15 dígitos. Espaços e pontuação são aceitos.';
  }
  if (dados.tipo === 'feirante') {
    if (!dados.nome_da_barraca || dados.nome_da_barraca.length > 120) return 'Informe o nome da barraca, com até 120 caracteres.';
    if ((dados.descricao || '').length > 2000) return 'A descrição deve ter até 2000 caracteres.';
  } else if (!dados.endereco || dados.endereco.length > 2000) {
    return 'Informe um endereço, com até 2000 caracteres.';
  }
  return null;
}
