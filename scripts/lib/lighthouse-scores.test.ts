import { describe, expect, it } from "vitest";
import { evaluateScores, toPercent } from "./lighthouse-scores";

describe("toPercent", () => {
  it("converte 0..1 em inteiro 0..100 e preserva null", () => {
    expect(toPercent(0.896)).toBe(90);
    expect(toPercent(1)).toBe(100);
    expect(toPercent(null)).toBeNull();
  });
});

describe("evaluateScores", () => {
  const ok = { performance: 0.95, accessibility: 1, bestPractices: 0.92, seo: 0.5 };

  it("passa com desempenho, acessibilidade e boas práticas >= 90 (SEO é só informativo)", () => {
    expect(evaluateScores(ok)).toEqual({ pass: true, failures: [] });
  });

  it("90 exato passa; 89 falha e o nome aparece", () => {
    expect(evaluateScores({ ...ok, performance: 0.9 }).pass).toBe(true);
    const r = evaluateScores({ ...ok, performance: 0.89, bestPractices: 0.5 });
    expect(r.pass).toBe(false);
    expect(r.failures).toEqual(["desempenho 89 < 90", "boas práticas 50 < 90"]);
  });

  it("nota ausente (null) falha", () => {
    expect(evaluateScores({ ...ok, accessibility: null }).failures).toEqual([
      "acessibilidade sem nota",
    ]);
  });
});
