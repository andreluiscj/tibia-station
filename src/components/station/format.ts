/** Número no formato brasileiro com 1 casa decimal (114 vira "114,0"). */
export const n1 = (x: number) =>
  x.toLocaleString("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 1 });
export const inteiro = (x: number) => x.toLocaleString("pt-BR", { maximumFractionDigits: 0 });

/** "Cidade. Local" sem pontuação sobrando no fim (a wiki deixa vírgulas soltas). */
export const localDaHunt = (city: string | null, location: string | null) =>
  [city, location]
    .map((s) => (s ?? "").replace(/[\s,.;]+$/u, "").trim())
    .filter(Boolean)
    .join(". ");
