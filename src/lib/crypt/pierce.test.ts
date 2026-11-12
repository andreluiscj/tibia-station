import { describe, expect, it } from "vitest";
import { applyPiercing } from "./pierce";

describe("applyPiercing: exemplos oficiais da wiki (modo official)", () => {
  it.each([
    ["Holy 90 + 6", 90, 6, 96],
    ["Holy 104 + 6", 104, 6, 107],
    ["Holy 96 + 8", 96, 8, 102],
    ["Physical 4 + 20", 4, 20, 8],
    ["Ice 0 + 20", 0, 20, 0],
  ])("%s = %d", (_n, r, p, out) => {
    expect(applyPiercing(r, p, "official")).toBeCloseTo(out, 2);
  });
});

describe("applyPiercing: tabela da arquitetura (5.4)", () => {
  it.each([
    [90, 6, 96, 96],
    [104, 6, 107, 107],
    [96, 8, 102, 102],
    [4, 20, 8, 24],
    [0, 20, 0, 20],
    [90, 45, 118, 117.5],
    [115, 45, 138, 137.5],
    [20, 45, 40, 65],
    [100, 7, 104, 103.5],
    [80, 0, 80, 80],
    [-200, 45, -200, -155],
    [-50, 20, -50, -30],
  ])("resist %d + pierce %d -> official %d / reference %d", (r, p, official, reference) => {
    expect(applyPiercing(r, p, "official")).toBeCloseTo(official, 2);
    expect(applyPiercing(r, p, "reference")).toBeCloseTo(reference, 2);
  });

  it("o modo padrão é official", () => {
    expect(applyPiercing(115, 45)).toBe(138);
  });
});

describe("applyPiercing: bordas", () => {
  it("resist 100: o aumento é pela metade (arredondado para cima no official)", () => {
    expect(applyPiercing(100, 7, "official")).toBe(104);
    expect(applyPiercing(100, 7, "reference")).toBe(103.5);
  });

  it("atravessa o 100: a parte acima de 100 conta pela metade", () => {
    expect(applyPiercing(96, 8, "reference")).toBe(102);
    expect(applyPiercing(99, 3, "reference")).toBe(101);
  });

  it("no máximo dobra: teto 2x só no official", () => {
    expect(applyPiercing(10, 45, "official")).toBe(20);
    expect(applyPiercing(10, 45, "reference")).toBe(55);
  });

  it("pierce 0 devolve a resistência, inclusive negativa", () => {
    expect(applyPiercing(0, 0)).toBe(0);
    expect(applyPiercing(-30, 0, "reference")).toBe(-30);
  });

  it("resist 0 nunca sobe no official, sobe no reference", () => {
    expect(applyPiercing(0, 45, "official")).toBe(0);
    expect(applyPiercing(0, 45, "reference")).toBe(45);
  });

  it("resistência negativa (absorve) não lança e official não altera", () => {
    expect(() => applyPiercing(-1, 5)).not.toThrow();
    expect(applyPiercing(-1, 5, "official")).toBe(-1);
    expect(applyPiercing(-1, 5, "reference")).toBe(4);
  });

  it("valores acima de 100 muito altos seguem a regra da metade", () => {
    expect(applyPiercing(150, 45, "official")).toBe(173);
    expect(applyPiercing(150, 45, "reference")).toBe(172.5);
  });
});

describe("applyPiercing: validação (RangeError)", () => {
  it.each([
    ["resist NaN", Number.NaN, 5],
    ["resist Infinity", Number.POSITIVE_INFINITY, 5],
    ["pierce NaN", 100, Number.NaN],
    ["pierce Infinity", 100, Number.POSITIVE_INFINITY],
    ["pierce negativo", 5, -1],
  ])("%s lança RangeError", (_n, r, p) => {
    expect(() => applyPiercing(r, p)).toThrow(RangeError);
    expect(() => applyPiercing(r, p, "reference")).toThrow(RangeError);
  });
});

describe("exemplo da página Como calculamos", () => {
  it("físico 90 + 14 = 102; earth 70 + 28 = 98; média 100", () => {
    const fis = applyPiercing(90, 14);
    const ele = applyPiercing(70, 28);
    expect([fis, ele, (fis + ele) / 2]).toEqual([102, 98, 100]);
  });
});
