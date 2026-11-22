export function obterElemento<T extends Element>(
  seletor: string,
  raiz: ParentNode = document
): T {
  const elemento = raiz.querySelector<T>(seletor);

  if (!elemento) {
    throw new Error(`Elemento não encontrado: ${seletor}`);
  }

  return elemento;
}

export function obterMensagemErro(erro: unknown): string {
  if (erro instanceof Error) {
    return erro.message;
  }

  return 'Não foi possível realizar a operação.';
}
