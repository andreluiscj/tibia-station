import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import type { Candidato } from "./cryptEstado";
import { Recomendacao } from "./Recomendacao";

const cand = (i: number, categoria: Candidato["categoria"] = "axe"): Candidato => ({
  chave: `${categoria}-${i}`,
  nome: `Arma ${categoria} ${i}`,
  categoria,
  elemento: "fire",
  damagePct: 120 - i * 5,
  origem: i === 0 ? "crypt" : "arma",
  ...(i === 0 ? { nivel: 450, pierce: { physical: 14, elemental: 28 }, imbued: true } : {}),
});
const html = (c: Candidato[]) =>
  renderToStaticMarkup(createElement(Recomendacao, { candidatos: c }));

describe("Recomendacao", () => {
  it("mostra a melhor e só as 3 seguintes, sem o texto '% superior'", () => {
    const out = html(Array.from({ length: 8 }, (_, i) => cand(i)));
    expect(out).toContain("Arma axe 0");
    expect(out).toContain("Arma axe 3");
    expect(out).not.toContain("Arma axe 4");
    expect(out).not.toMatch(/superior/);
    expect(out).toContain("Imbuiment Elemental");
  });
  it("Crypt mostra elemento, nível, imbuiments, combinação e imbuiment elemental", () => {
    const arma = { slug: "x", element: "fire", perks: [] } as never;
    const out = html([{ ...cand(0), imbuiments: 2, arma }, cand(1)]);
    expect(out).toContain("Level 450");
    expect(out).toContain("2 Imbuiments");
    expect(out).toContain("Combinação:");
    expect(out).toContain("Imbuiment Elemental");
    expect(out).toContain('role="switch"');
    expect(out).toContain("Dano calculado");
  });
  it("arma comum mostra nível e imbuiments (singular/plural), sem combinação nem ataques", () => {
    const um = html([{ ...cand(1), nivel: 600, imbuiments: 1 }, cand(2)]);
    expect(um).toContain("Level 600");
    expect(um).toContain("1 Imbuiment<");
    const tres = html([{ ...cand(1), nivel: 600, imbuiments: 3 }, cand(2)]);
    expect(tres).toContain("3 Imbuiments");
    for (const out of [um, tres]) {
      expect(out).not.toContain("Combinação");
      expect(out).not.toContain("Imbuiment Elemental");
      expect(out).not.toContain("Ataque físico");
      expect(out).not.toContain("Ataque elemental");
    }
  });
  it("omite o trecho de imbuiments quando a tabela não informa", () => {
    const out = html([{ ...cand(1), nivel: 600 }, cand(2)]);
    expect(out).toContain("Level 600");
    expect(out).not.toMatch(/Imbuiments?</);
  });
  it("em 'Comparar as 3' cada categoria mostra 4 armas", () => {
    const todas = (["axe", "club", "sword"] as const).flatMap((c) =>
      Array.from({ length: 6 }, (_, i) => cand(i, c)),
    );
    const out = html(todas);
    for (const c of ["axe", "club", "sword"]) {
      expect(out).toContain(`Arma ${c} 3`);
      expect(out).not.toContain(`Arma ${c} 4`);
    }
    expect(out).not.toMatch(/superior/);
  });
});

describe("Recomendacao: alinhamento em 'Comparar as 3'", () => {
  it("as colunas dividem as mesmas linhas (subgrid) e o nome reserva 2 linhas", () => {
    const todas = (["axe", "club", "sword"] as const).flatMap((c) =>
      Array.from({ length: 4 }, (_, i) => cand(i, c)),
    );
    const out = html(todas);
    expect(out).toContain("lg:grid-rows-subgrid");
    expect(out.match(/min-h-\[2\.5em\]/g)).toHaveLength(3);
  });
});
