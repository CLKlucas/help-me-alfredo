export type TipoConta = 'feirante' | 'consumidor';

export interface CorpoCadastro {
  tipo?: unknown;
  nome?: unknown;
  email?: unknown;
  password?: unknown;
  whatsapp?: unknown;
  nome_da_barraca?: unknown;
  descricao?: unknown;
  endereco?: unknown;
}

export interface UsuarioBanco {
  id: number;
  documentId: string;
  username: string;
  email: string;
  role?: {
    id: number;
    name: string;
  };
}

export interface UsuarioAutenticado {
  id?: number;
}

export interface PerfilFeiranteBanco {
  nome?: string | null;
  id: number;
  documentId: string;
  nome_da_barraca: string | null;
  whatsapp: string | null;
  descricao: string | null;
}

export interface PerfilConsumidorBanco {
  id: number;
  documentId: string;
  nome: string | null;
  whatsapp: string | null;
  endereco: string | null;
}

export interface FeiranteBanco {
  id: number;
  documentId: string;
}

export interface CorpoProduto {
  nome?: unknown;
  descricao?: unknown;
  preco?: unknown;
  disponivel?: unknown;
  imagem?: unknown;
}

export interface ImagemBanco {
  url: string;
  alternativeText?: string | null;
}

export interface ProdutoBanco {
  id: number;
  documentId: string;
  nome: string;
  descricao: string | null;
  preco: number;
  disponivel: boolean;
  imagem?: ImagemBanco | null;
  feirante?: {
    nome_da_barraca?: string | null;
  } | null;
}

export interface ProdutoPublico {
  documentId: string;
  nome: string;
  descricao: string | null;
  preco: number;
  disponivel: boolean;
  imagem: ImagemBanco | null;
  feirante: {
    nome_da_barraca?: string | null;
  } | null;
}
