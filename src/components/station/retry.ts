interface Refazivel {
  isError: boolean;
  refetch: () => unknown;
}

/** Refaz todas as consultas que falharam, de uma vez: um clique em "Tentar de novo" recupera a página inteira. */
export function refazerFalhas(consultas: readonly Refazivel[]): number {
  let n = 0;
  for (const c of consultas) {
    if (c.isError) {
      void c.refetch();
      n++;
    }
  }
  return n;
}
