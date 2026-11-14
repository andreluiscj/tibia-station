// [português (chave), inglês, espanhol]. Texto sem entrada aparece em português.
export type Linha = readonly [string, string, string];
export const LINHAS: Linha[] = [];
export const add = (...l: Linha[]) => void LINHAS.push(...l);
