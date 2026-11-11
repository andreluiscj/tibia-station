import { describe, expect, it } from "vitest";
import type { Item } from "@/lib/tibia";
import { SKILLS_ZERADAS, calcularStats, fmtPct, skillsFromType, somar, toNumber } from "./stats";

const item = (extra: Partial<Item>): Item => ({ id: 1, item_name: "X", ...extra });

describe("toNumber", () => {
  it("aceita número, texto com vírgula decimal e descarta o resto", () => {
    expect(toNumber(3)).toBe(3);
    expect(toNumber("0,25")).toBe(0.25);
    expect(toNumber(" ")).toBe(0);
    expect(toNumber(Infinity)).toBe(0);
    expect(toNumber(null)).toBe(0);
    expect(toNumber("abc")).toBe(0);
  });
});

describe("fmtPct", () => {
  it("zero vira 0% sem sinal", () => expect(fmtPct(0)).toBe("0%"));
  it("positivo ganha +, negativo mantém o -", () => {
    expect(fmtPct(0.1)).toBe("+10%");
    expect(fmtPct(-0.05)).toBe("-5%");
  });
  it("mostra 1 casa só quando não é inteiro", () => {
    expect(fmtPct(0.125)).toBe("+12.5%");
    expect(fmtPct(0.3)).toBe("+30%");
  });
});

describe("skillsFromType", () => {
  it("lê a máscara de bits", () => {
    expect(skillsFromType(1)).toEqual(["axe"]);
    expect(skillsFromType(2 | 8)).toEqual(["club", "shielding"]);
    expect(skillsFromType(64)).toEqual(["magic"]);
    expect(skillsFromType(0)).toEqual([]);
    expect(skillsFromType(null)).toEqual([]);
  });
});

describe("calcularStats", () => {
  const base = { ...SKILLS_ZERADAS, shielding: 3 };
  it("soma defesas, armadura e defence (def tem prioridade sobre defense)", () => {
    const s = calcularStats(
      [
        item({ physical: 0.05, fire: 0.1, arm: 10, def: 20 }),
        item({ physical: 0.03, arm: 4, defense: 7, mantra: 2 }),
      ],
      base,
    );
    expect(s.def.physical).toBeCloseTo(0.08);
    expect(s.def.fire).toBeCloseTo(0.1);
    expect(s.armor).toBe(14);
    expect(s.defence).toBe(27);
    expect(s.mantra).toBe(2);
  });
  it("skills: base do jogador mais bônus das três colunas skill/skill_type", () => {
    const s = calcularStats(
      [
        item({ skill: 4, skill_type: 1 | 8, skill_1: 2, skill_type_1: 64 }),
        item({ skill: 1, skill_type: 0 }),
      ],
      base,
    );
    expect(s.skills.axe).toBe(4);
    expect(s.skills.shielding).toBe(3 + 4);
    expect(s.skills.magic).toBe(2);
  });
  it("magic level por elemento só aparece quando há bônus", () => {
    const s = calcularStats([item({ fire_magic_level: 2 }), item({ ice_magic_level: 0 })], base);
    expect(s.magicSubs).toEqual([{ column: "fire_magic_level", bonus: 2 }]);
  });
  it("augments: coleta bonus_1..bonus_8 com o nome do item e ignora vazios", () => {
    const s = calcularStats(
      [item({ item_name: "Elmo", bonus_1: " Reflexão +13 ", bonus_2: "", bonus_8: "Crítico" })],
      base,
    );
    expect(s.augments).toEqual([
      { text: "Reflexão +13", itemName: "Elmo" },
      { text: "Crítico", itemName: "Elmo" },
    ]);
  });
  it("somar ignora campos que não são número", () => {
    expect(somar([item({ arm: "5,5" as unknown as number }), item({ arm: null })], "arm")).toBe(
      5.5,
    );
  });
});
