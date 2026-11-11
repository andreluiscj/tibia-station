import { describe, expect, it } from "vitest";
import creaturesJson from "@data/creatures.json";
import weaponsJson from "@data/crypt-weapons.json";
import type { Creature, CryptWeapon } from "@/lib/data/types";
import { creatureToTarget, evaluateWeapon } from "./engine";
import { applyPiercing } from "./pierce";
import refs from "./reference-cases.json";

const creatures = creaturesJson as unknown as Creature[];
const weapons = weaponsJson as unknown as CryptWeapon[];
const r4 = (n: number) => Math.round(n * 1e4) / 1e4;

// ATENÇÃO: reference-cases.json é um SNAPSHOT do próprio motor (gerado por scripts/gen-reference-cases.ts).
// Este teste só impede que o arquivo fique defasado; ele NÃO prova que os números estão certos. O arquivo só vira
// gate 9 do plano depois que o Luis Felipe comparar os casos com o site de referência. O oráculo independente são
// os valores fixos do Hellflayer e as tabelas de pierce.test.ts e engine.test.ts.
describe("reference-cases.json (snapshot do motor, conferência manual do gate 9)", () => {
  it("tem 20+ casos de arma e os casos de piercing nos dois modos", () => {
    expect(refs.cases.length).toBeGreaterThanOrEqual(20);
    expect(refs.piercing.length).toBeGreaterThanOrEqual(20);
  });

  it("cada caso de piercing bate com applyPiercing", () => {
    for (const c of refs.piercing) {
      expect(
        applyPiercing(c.resist, c.pierce, c.mode as "official" | "reference"),
        JSON.stringify(c),
      ).toBeCloseTo(c.expected, 4);
    }
  });

  it("cada caso de arma bate com o motor atual (o arquivo não pode ficar defasado)", () => {
    for (const c of refs.cases) {
      const creature = creatures.find((x) => x.slug === c.creature)!;
      const weapon = weapons.find((x) => x.slug === c.weapon)!;
      const e = evaluateWeapon(weapon, [creatureToTarget(creature)], {
        mode: c.mode as "official" | "reference",
      });
      expect(c.resist, c.id).toEqual(creatureToTarget(creature).resist);
      expect(e.presets.elemental ? r4(e.presets.elemental.damagePct) : null, c.id).toBe(
        c.expected.elemental,
      );
      expect(e.presets.hybrid ? r4(e.presets.hybrid.damagePct) : null, c.id).toBe(
        c.expected.hybrid,
      );
      expect(r4(e.presets.physical.damagePct), c.id).toBe(c.expected.physical);
      expect(r4(e.best.damagePct), c.id).toBe(c.expected.best);
    }
  });

  it("inclui o Hellflayer com os valores do plano (reference e official)", () => {
    const get = (w: string, m: string) =>
      refs.cases.find((c) => c.id === `hellflayer/${w}/${m}`)!.expected;
    expect([
      get("crypt-breaker", "reference").elemental,
      get("crypt-breaker", "reference").hybrid,
      get("crypt-breaker", "reference").physical,
    ]).toEqual([87.5, 84, 107]);
    expect([
      get("crypt-splitter", "official").elemental,
      get("crypt-splitter", "official").hybrid,
      get("crypt-splitter", "official").physical,
    ]).toEqual([114, 113, 107]);
  });
});
