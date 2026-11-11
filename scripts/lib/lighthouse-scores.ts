// Avaliação das notas do Lighthouse (gate 8): desempenho, acessibilidade e boas práticas >= 90; SEO é informativo.

export interface Scores {
  performance: number | null;
  accessibility: number | null;
  bestPractices: number | null;
  seo: number | null;
}

export const MIN_SCORE = 90;

/** 0..1 do Lighthouse para inteiro 0..100 (como o relatório exibe); null permanece null. */
export const toPercent = (score: number | null): number | null =>
  score === null ? null : Math.round(score * 100);

const REQUIRED: [keyof Scores, string][] = [
  ["performance", "desempenho"],
  ["accessibility", "acessibilidade"],
  ["bestPractices", "boas práticas"],
];

export function evaluateScores(
  scores: Scores,
  min = MIN_SCORE,
): { pass: boolean; failures: string[] } {
  const failures = REQUIRED.flatMap(([key, label]) => {
    const pct = toPercent(scores[key]);
    if (pct === null) return [`${label} sem nota`];
    return pct < min ? [`${label} ${pct} < ${min}`] : [];
  });
  return { pass: failures.length === 0, failures };
}
