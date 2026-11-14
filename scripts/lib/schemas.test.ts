import { describe, expect, it } from "vitest";
import { creatureSchema, cryptWeaponSchema, validateAll } from "./schemas";
import { knightPerks } from "./crypt-weapons";

const resist = {
  physical: 100,
  earth: -100,
  fire: null,
  energy: 80,
  ice: 100,
  holy: 100,
  death: 100,
  hpDrain: 0,
  drown: 0,
};
const creature = {
  slug: "foo",
  name: "Foo",
  wikiTitle: "Foo",
  sourceUrl: "https://tibia.fandom.com/wiki/Foo",
  resistUnconfirmed: ["fire"],
  hp: 10,
  exp: null,
  bestiaryClass: null,
  bestiaryLevel: "Hard",
  bosstiaryClass: null,
  resist,
};

describe("schemas", () => {
  it("aceita criatura válida, inclusive resistência negativa", () => {
    expect(validateAll("c", creatureSchema, [creature])).toHaveLength(1);
  });
  it("rejeita slug inválido, NaN e valores absurdos", () => {
    for (const bad of [
      { ...creature, slug: "Foo Bar" },
      { ...creature, hp: -1 },
      { ...creature, resist: { ...resist, fire: Number.NaN } },
      { ...creature, resist: { ...resist, fire: 1e9 } },
      { ...creature, name: "x".repeat(5000) },
      { ...creature, sourceUrl: "https://evil.example/wiki/Foo" },
      { ...creature, sourceUrl: "javascript:alert(1)" },
      { ...creature, resistUnconfirmed: ["lava"] },
      { ...creature, resist: { ...resist, fire: 10001 } },
    ]) {
      expect(() => validateAll("c", creatureSchema, [bad])).toThrow(/Validação falhou/);
    }
  });
  it("arma Crypt exige exatamente 7 níveis", () => {
    const w = {
      slug: "w",
      name: "W",
      wikiTitle: "W",
      vocation: "knight",
      category: "club",
      attack: 58,
      defense: 33,
      element: "fire",
      levelRequired: 450,
      imbuementSlots: 3,
      attributes: [],
      perks: knightPerks("fire"),
    };
    expect(validateAll("w", cryptWeaponSchema, [w])).toHaveLength(1);
    expect(() =>
      validateAll("w", cryptWeaponSchema, [{ ...w, perks: w.perks.slice(0, 6) }]),
    ).toThrow();
  });
});
