import { n1 } from "./format";

export interface Melhor {
  weaponName: string;
  averageDamage: number;
}

/** Mesmo conteúdo do cabeçalho do resultado, em texto, para o aviso de leitor de tela. */
export function resumoParaLeitor(alvo: string, melhor: Melhor): string {
  const v = melhor.averageDamage;
  if (v > 0)
    return `Resultado atualizado. Alvo: ${alvo}. Maior dano médio: ${melhor.weaponName}, ${n1(v)}.`;
  if (v < 0)
    return `Resultado atualizado. Nenhuma arma fere ${alvo}: ele absorve o dano. A que cura menos: ${melhor.weaponName}, ${n1(v)}.`;
  return `Resultado atualizado. Nenhuma arma causa dano em ${alvo}.`;
}
