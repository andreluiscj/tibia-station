import { createElement as h } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import type { CryptWeapon } from "@/lib/data/types";
import { ResistanceBar } from "./ResistanceBar";
import { ResultCard } from "./ResultCard";
import { Carregando, Erro } from "./Estados";

const html = (el: Parameters<typeof renderToStaticMarkup>[0]) => renderToStaticMarkup(el);

describe("ResistanceBar", () => {
  it("valor negativo mostra o selo Absorve em texto, com o número", () => {
    const m = html(h(ResistanceBar, { element: "death", value: -200 }));
    expect(m).toContain("Absorve (cura)");
    expect(m).toContain("-200");
    expect(m).toContain("border-bad");
  });
  it("valor normal descreve a resistência", () => {
    expect(html(h(ResistanceBar, { element: "fire", value: 30 }))).toContain("Resiste 70%");
  });
  it("marca valor não confirmado", () => {
    expect(html(h(ResistanceBar, { element: "ice", value: 100, assumed: true }))).toContain(
      "não confirmado",
    );
  });
  it("sem dado não desenha número", () => {
    const m = html(h(ResistanceBar, { element: "holy", value: null }));
    expect(m).toContain("Sem dado");
    expect(m).not.toContain("num text-base");
  });
});

const arma: CryptWeapon = {
  slug: "crypt-splitter",
  name: "Crypt Splitter",
  wikiTitle: "Crypt Splitter",
  vocation: "knight",
  category: "axe",
  attack: 58,
  defense: 33,
  element: "energy",
  levelRequired: 450,
  imbuementSlots: 3,
  attributes: ["axe fighting +4"],
  perks: [],
};

describe("ResultCard", () => {
  const base = {
    rank: 1,
    arma,
    modos: [
      { id: "e45", label: "Elemental 45%", value: 114 },
      { id: "hib", label: "Híbrida", value: 113 },
      { id: "p14", label: "Physical 14%", value: null },
    ],
  };
  it("mostra os 3 modos, formatando em pt-BR e marcando o que não foi calculado", () => {
    const m = html(h(ResultCard, base));
    expect(m).toContain("114,0");
    expect(m).toContain("113,0");
    expect(m).toContain("sem cálculo");
  });
  it("veredito e alvo que absorve saem em texto", () => {
    const m = html(
      h(ResultCard, {
        ...base,
        veredito: { compensa: true, diffPct: 1.5 },
        alvos: [{ name: "Earl Osam", value: -50, absorbs: true }],
      }),
    );
    expect(m).toContain("Compensa");
    expect(m).toContain("+1,5%");
    expect(m).toContain("absorve o elemento");
  });
});

describe("ResultCard empate", () => {
  it("empate (tied) vira texto, não +0%", () => {
    const m = html(
      h(ResultCard, {
        rank: 2,
        arma,
        modos: [{ id: "e45", label: "Elemental 45%", value: 107 }],
        veredito: { compensa: false, diffPct: 0.02, tied: true },
      }),
    );
    expect(m).toContain("empate no ranking");
    expect(m).not.toContain("+0");
  });
});

describe("estados", () => {
  it("carregando anuncia o texto para leitor de tela", () => {
    expect(html(h(Carregando, { rotulo: "Carregando as hunts…" }))).toContain(
      "Carregando as hunts…",
    );
  });
  it("erro usa role alert e oferece nova tentativa", () => {
    const m = html(h(Erro, { onTentar: () => {} }));
    expect(m).toContain('role="alert"');
    expect(m).toContain("Tentar de novo");
  });
});
