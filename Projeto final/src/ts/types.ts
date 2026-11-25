export type TipoConta = 'feirante' | 'consumidor';

export interface Usuario {
  id: number;
  documentId?: string;
  username: string;
  email: string;
  provider?: string;
  confirmed?: boolean;
  blocked?: boolean;
  role?: {
    id: number;
    name: string;
    type?: string;
  };
}

export interface UsuarioResumo {
  id: number;
  documentId?: string;
  nome: string;
  email: string;
}

export interface Feirante {
  nome?: string | null;
  id?: number;
  documentId?: string;
  nome_da_barraca: string;
  whatsapp: string | number;
  descricao?: string | null;
  uid?: string | null;
  users_permissions_user?: Usuario | number;
  produtos?: Produto[];
}

export interface ItemCarrinho {
  produto: string;
  nome: string;
  preco: number;
  quantidade: number;
  feirante: string;
  nomeDaBanca: string;
}

export interface ItemPedido {
  produto: string;
  nome: string;
  preco: number;
  quantidade: number;
  subtotal: number;
}

export interface Pedido {
  documentId: string;
  itens: ItemPedido[];
  total: number;
  status: 'pendente' | 'aceito' | 'concluido' | 'cancelado';
  observacao: string;
  createdAt: string;
  feirante: { nome: string } | null;
  consumidor: { nome: string; whatsapp: string } | null;
}

export interface Consumidor {
  id?: number;
  documentId?: string;
  nome: string;
  whatsapp: string | number;
  endereco?: string;
  users_permissions_user?: Usuario | number;
}

export interface ImagemProduto {
  url: string;
  alternativeText?: string | null;
}

export interface Produto {
  id?: number;
  documentId?: string;
  nome: string;
  descricao?: string | null;
  preco: number | string;
  disponivel: boolean;
  imagem?: ImagemProduto | null;
  feirante?: Pick<Feirante, 'documentId' | 'nome_da_barraca' | 'whatsapp'> | null;
}

export interface BancaPublica {
  nome: string;
  documentId: string;
  nome_da_barraca: string;
  descricao: string;
  whatsapp: string;
  foto: ImagemProduto | null;
}

export interface RespostaAutenticacao {
  jwt: string;
  user: Usuario;
}

export type MinhaConta =
  | {
      tipo: 'feirante';
      usuario: UsuarioResumo;
      perfil: Feirante;
    }
  | {
      tipo: 'consumidor';
      usuario: UsuarioResumo;
      perfil: Consumidor;
    };

export interface Sessao {
  jwt: string;
  usuario: Usuario;
}

export interface DadosCadastro {
  tipo: TipoConta;
  nome: string;
  email: string;
  password: string;
  whatsapp: string;
  nome_da_barraca?: string;
  descricao?: string;
  endereco?: string;
}

export interface RespostaCadastro {
  message: string;
  user: UsuarioResumo;
  profile: Feirante | Consumidor;
}

export interface RespostaErroApi {
  error?: { message?: string };
  message?: string;
}

export interface OpcoesRequisicao extends Omit<RequestInit, 'headers'> {
  headers?: Record<string, string>;
}
