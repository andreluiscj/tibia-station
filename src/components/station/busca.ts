export const normalizar = (s: string) =>
  s.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase().trim();

export interface Indexado<T> {
  item: T;
  norm: string;
}

export const indexar = <T>(itens: readonly T[], texto: (t: T) => string): Indexado<T>[] =>
  itens.map((item) => ({ item, norm: normalizar(texto(item)) }));

/**
 * Busca sem travar com milhares de itens: devolve no máximo `limite` resultados.
 * Ordem: começa com o termo, depois começa uma palavra, depois contém. Em cada grupo mantém a ordem original.
 */
export function buscar<T>(idx: readonly Indexado<T>[], consulta: string, limite = 50): T[] {
  const q = normalizar(consulta);
  if (!q) return idx.slice(0, limite).map((i) => i.item);
  const g0: T[] = [];
  const g1: T[] = [];
  const g2: T[] = [];
  for (const { item, norm } of idx) {
    const pos = norm.indexOf(q);
    if (pos < 0) continue;
    if (pos === 0) g0.push(item);
    else if (norm[pos - 1] === " ") g1.push(item);
    else g2.push(item);
    if (g0.length >= limite) break;
  }
  return [...g0, ...g1, ...g2].slice(0, limite);
}
