import { describe, expect, it } from "vitest";
import { refazerFalhas } from "./retry";

const consulta = (isError: boolean) => {
  const chamadas = { n: 0 };
  return { isError, refetch: () => void chamadas.n++, chamadas };
};

describe("refazerFalhas", () => {
  it("um clique refaz todas as consultas que falharam (hunt e criaturas)", () => {
    const hunt = consulta(true);
    const criaturas = consulta(true);
    expect(refazerFalhas([hunt, criaturas])).toBe(2);
    expect(hunt.chamadas.n).toBe(1);
    expect(criaturas.chamadas.n).toBe(1);
  });
  it("não refaz o que está bem", () => {
    const hunt = consulta(true);
    const criaturas = consulta(false);
    expect(refazerFalhas([hunt, criaturas])).toBe(1);
    expect(criaturas.chamadas.n).toBe(0);
  });
  it("sem falhas não faz nada", () => {
    const a = consulta(false);
    expect(refazerFalhas([a])).toBe(0);
    expect(a.chamadas.n).toBe(0);
  });
});
