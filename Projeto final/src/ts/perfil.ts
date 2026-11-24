import { API_URL, apiRequest } from './api.js';
import { obterElemento, obterMensagemErro } from './util.js';

interface ContaPerfil {
  tipo: 'feirante' | 'consumidor';
  email: string;
  perfil: {
    nome?: string;
    nome_da_barraca?: string;
    whatsapp: string;
    descricao?: string;
    endereco?: string;
    foto?: { url: string; alternativeText?: string | null } | null;
  };
}
const form = obterElemento<HTMLFormElement>('#form-perfil');
const mensagem = obterElemento<HTMLElement>('#mensagem-perfil');
const nome = obterElemento<HTMLInputElement>('#perfil-nome');
const barraca = obterElemento<HTMLInputElement>('#perfil-barraca');
const telefone = obterElemento<HTMLInputElement>('#perfil-whatsapp');
const complemento = obterElemento<HTMLTextAreaElement>('#perfil-complemento');
const arquivo = obterElemento<HTMLInputElement>('#perfil-foto');
const removerFoto = obterElemento<HTMLButtonElement>('#remover-foto');
const botao = obterElemento<HTMLButtonElement>('#salvar-perfil');
let tipo: ContaPerfil['tipo'];

function mostrarFoto(foto: ContaPerfil['perfil']['foto']): void {
  const imagem = obterElemento<HTMLImageElement>('#foto-atual');
  imagem.hidden = !foto;
  removerFoto.hidden = !foto;
  if (foto) imagem.src = new URL(foto.url, API_URL.replace('/api', '')).href;
  else imagem.removeAttribute('src');
}

function preencher(conta: ContaPerfil): void {
  tipo = conta.tipo;
  obterElemento<HTMLInputElement>('#perfil-email').value = conta.email;
  nome.value = conta.perfil.nome || '';
  barraca.value = conta.perfil.nome_da_barraca || '';
  barraca.required = tipo === 'feirante';
  obterElemento<HTMLElement>('#campo-barraca').hidden = tipo !== 'feirante';
  telefone.value = String(conta.perfil.whatsapp || '');
  complemento.value = conta.perfil.descricao || conta.perfil.endereco || '';
  obterElemento<HTMLLabelElement>('#label-nome').textContent = 'Nome completo';
  obterElemento<HTMLLabelElement>('#label-complemento').textContent =
    tipo === 'feirante' ? 'Descrição da barraca' : 'Endereço';
  complemento.rows = tipo === 'feirante' ? 8 : 4;
  complemento.required = tipo === 'consumidor';
  obterElemento<HTMLElement>('#foto-barraca').hidden = tipo !== 'feirante';
  mostrarFoto(conta.perfil.foto);
  form.hidden = false;
}

async function carregarPerfil(): Promise<void> {
  if (!sessionStorage.getItem('jwt')) {
    window.location.href = 'login.html';
    return;
  }
  try {
    preencher(await apiRequest<ContaPerfil>('/meu-perfil'));
    mensagem.textContent = '';
  } catch (erro) {
    mensagem.textContent = obterMensagemErro(erro);
    obterElemento<HTMLElement>('#entrar-novamente').hidden = false;
  }
}

removerFoto.addEventListener('click', async () => {
  removerFoto.disabled = true;
  botao.disabled = true;
  mensagem.textContent = 'Removendo foto...';
  try {
    const conta = await apiRequest<ContaPerfil>('/meu-perfil/foto', { method: 'DELETE' });
    mostrarFoto(conta.perfil.foto);
    arquivo.value = '';
    mensagem.textContent = 'Foto removida da banca.';
  } catch (erro) {
    mensagem.textContent = obterMensagemErro(erro);
  } finally {
    removerFoto.disabled = false;
    botao.disabled = false;
  }
});

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  const dados = new FormData();
  dados.append('nome', nome.value.trim());
  if (tipo === 'feirante') dados.append('nome_da_barraca', barraca.value.trim());
  dados.append('whatsapp', telefone.value.trim());
  dados.append(tipo === 'feirante' ? 'descricao' : 'endereco', complemento.value.trim());
  if (tipo === 'feirante' && arquivo.files?.[0]) dados.append('foto', arquivo.files[0]);
  botao.disabled = true;
  removerFoto.disabled = true;
  mensagem.textContent = 'Salvando seu perfil...';
  try {
    const conta = await apiRequest<ContaPerfil>('/meu-perfil', { method: 'PUT', body: dados });
    preencher(conta);
    arquivo.value = '';
    mensagem.textContent = tipo === 'feirante'
      ? 'Perfil atualizado! As alterações da banca também aparecem em Feirantes.'
      : 'Perfil atualizado!';
  } catch (erro) {
    mensagem.textContent = obterMensagemErro(erro);
  } finally {
    botao.disabled = false;
    removerFoto.disabled = false;
  }
});

carregarPerfil();
