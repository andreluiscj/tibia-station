import { describe, expect, it } from "vitest";
import weaponsJson from "@data/crypt-weapons.json";
import creaturesJson from "@data/creatures.json";
import type { Creature, CryptWeapon, ElementKey } from "@/lib/data/types";
import {
  compareModes,
  creatureToTarget,
  cryptVocation,
  enumerateCombos,
  evaluateWeapon,
  huntToTargets,
  plainElementBaseline,
  rankWeapons,
} from "./engine";
import type { Target } from "./types";

const weapons = weaponsJson as unknown as CryptWeapon[];
const creatures = creaturesJson as unknown as Creature[];
const w = (slug: string) => {
  const found = weapons.find((x) => x.slug === slug);
  if (!found) throw new Error(`arma ausente: ${slug}`);
  return found;
};
const breaker = w("crypt-breaker");
const slicer = w("crypt-slicer");
const splitter = w("crypt-splitter");
const strike = w("crypt-strike");

const neutral = {
  physical: 100,
  earth: 100,
  fire: 100,
  energy: 100,
  ice: 100,
  holy: 100,
  death: 100,
};
const target = (id: string, resist: Partial<Record<ElementKey, number>>, weight = 1): Target => ({
  id,
  name: id,
  resist: { ...neutral, ...resist },
  weight,
  assumedNeutral: [],
});
const hellflayer = target("hellflayer", { physical: 100, earth: 80, fire: 30, energy: 105 });
const allNeutral = target("neutro", {});

describe("cryptVocation", () => {
  it("EK vira knight, EM vira monk, o resto não usa Crypt", () => {
    expect(cryptVocation("EK")).toBe("knight");
    expect(cryptVocation("EM")).toBe("monk");
    for (const v of ["RP", "MS", "ED"] as const) expect(cryptVocation(v)).toBeNull();
  });
});

describe("enumerateCombos", () => {
  const key = (c: { pierce: { physical: number; elemental: number } }) =>
    `${c.pierce.physical}/${c.pierce.elemental}`;

  it("Knight: 12 combinações sem duplicata, contendo (0,45), (6,35) e (14,0)", () => {
    const combos = enumerateCombos(breaker);
    expect(combos).toHaveLength(12);
    expect(new Set(combos.map(key)).size).toBe(12);
    for (const k of ["0/45", "6/35", "14/0"]) expect(combos.map(key)).toContain(k);
  });

  it("Monk: 2 combinações, físico 12 e físico 20, sem imbuement", () => {
    const combos = enumerateCombos(strike);
    expect(combos.map(key).sort()).toEqual(["12/0", "20/0"]);
    expect(combos.every((c) => !c.imbued)).toBe(true);
  });

  it("maxProficiencyLevel = 5 remove o nível 7", () => {
    const combos = enumerateCombos(breaker, 5);
    expect(combos.every((c) => c.choices.every((x) => x.level !== 7))).toBe(true);
    expect(combos.some((c) => c.pierce.elemental === 45)).toBe(false);
    expect(combos).toHaveLength(6);
  });

  it("choices lista só níveis com pierce > 0, em ordem crescente, com o id do perk", () => {
    const elemental = enumerateCombos(breaker).find((c) => key(c) === "0/45");
    expect(elemental?.choices).toEqual([
      { level: 3, perkId: "3.1" },
      { level: 5, perkId: "5.1" },
      { level: 7, perkId: "7.1" },
    ]);
    expect(elemental?.imbued).toBe(true);
  });

  it("rejeita nível máximo inválido e arma sem 7 níveis", () => {
    for (const bad of [0, 8, 2.5, Number.NaN])
      expect(() => enumerateCombos(breaker, bad)).toThrow(RangeError);
    expect(() => enumerateCombos({ ...breaker, perks: breaker.perks.slice(0, 6) })).toThrow(
      RangeError,
    );
  });
});

describe("evaluateWeapon: Hellflayer (físico 100, earth 80, fire 30, energy 105)", () => {
  const triple = (weapon: CryptWeapon, mode: "official" | "reference") => {
    const e = evaluateWeapon(weapon, [hellflayer], { mode });
    return [
      e.presets.elemental?.damagePct,
      e.presets.hybrid?.damagePct,
      e.presets.physical.damagePct,
    ];
  };

  it.each([
    ["Crypt Breaker", breaker, [80.0, 81.5, 107.0], [87.5, 84.0, 107.0]],
    ["Crypt Slicer", slicer, [106.5, 105.5, 107.0], [106.25, 105.25, 107.0]],
    ["Crypt Splitter", splitter, [114.0, 113.0, 107.0], [113.75, 112.75, 107.0]],
  ])("%s: elemental / híbrida / physical nos dois modos", (_n, weapon, official, reference) => {
    triple(weapon, "official").forEach((v, i) => expect(v).toBeCloseTo(official[i], 2));
    triple(weapon, "reference").forEach((v, i) => expect(v).toBeCloseTo(reference[i], 2));
  });

  it("Crypt Strike (Monk): sem presets elemental e híbrido, physical 110", () => {
    for (const mode of ["official", "reference"] as const) {
      const e = evaluateWeapon(strike, [hellflayer], { mode });
      expect(e.presets.elemental).toBeNull();
      expect(e.presets.hybrid).toBeNull();
      expect(e.presets.physical.damagePct).toBeCloseTo(110, 2);
    }
  });

  it("presets carregam o pierce certo e são identificados em ComboResult.preset", () => {
    const e = evaluateWeapon(breaker, [hellflayer]);
    expect(e.presets.elemental?.combo.pierce).toEqual({ physical: 0, elemental: 45 });
    expect(e.presets.hybrid?.combo.pierce).toEqual({ physical: 6, elemental: 35 });
    expect(e.presets.physical.combo.pierce).toEqual({ physical: 14, elemental: 0 });
    expect(e.presets.elemental?.preset).toBe("elemental");
    expect(e.presets.hybrid?.preset).toBe("hybrid");
    expect(e.presets.physical.preset).toBe("physical");
    expect(e.presets.physical.combo.imbued).toBe(false);
  });

  it("best >= cada preset e diffToSecondPct = (best/second - 1) * 100", () => {
    for (const weapon of weapons) {
      for (const mode of ["official", "reference"] as const) {
        const e = evaluateWeapon(weapon, [hellflayer], { mode });
        for (const p of [e.presets.elemental, e.presets.hybrid, e.presets.physical]) {
          if (p) expect(e.best.damagePct).toBeGreaterThanOrEqual(p.damagePct - 1e-9);
        }
        if (e.secondBest) {
          expect(e.diffToSecondPct).toBeCloseTo(
            (e.best.damagePct / e.secondBest.damagePct - 1) * 100,
            6,
          );
          expect(e.best.damagePct).toBeGreaterThanOrEqual(e.secondBest.damagePct);
        }
      }
    }
  });

  it("Splitter: a melhor combinação é a elemental (114) e a segunda é a híbrida", () => {
    const e = evaluateWeapon(splitter, [hellflayer], { mode: "official" });
    expect(e.best.damagePct).toBeCloseTo(114, 2);
    expect(e.best.preset).toBe("elemental");
    expect(e.secondBest?.damagePct).toBeCloseTo(113, 2);
    expect(e.diffToSecondPct).toBeCloseTo((114 / 113 - 1) * 100, 6);
  });

  it("Monk tem 2 combinações; com só 1 combinação secondBest e diff são null", () => {
    const e = evaluateWeapon(strike, [hellflayer]);
    expect(e.best.combo.pierce.physical).toBe(20);
    expect(e.secondBest?.combo.pierce.physical).toBe(12);
    const one = evaluateWeapon(strike, [hellflayer], { maxProficiencyLevel: 2 });
    expect(one.secondBest).toBeNull();
    expect(one.diffToSecondPct).toBeNull();
  });
});

describe("evaluateWeapon: veredito, baseline e elementalShare", () => {
  it("worth quando a melhor combinação passa do baseline; not_worth quando não passa", () => {
    expect(evaluateWeapon(splitter, [hellflayer]).verdict).toBe("worth");
    expect(evaluateWeapon(splitter, [hellflayer], { baseline: 200 }).verdict).toBe("not_worth");
    expect(evaluateWeapon(strike, [target("imune", { physical: 0 })]).verdict).toBe("not_worth");
    expect(evaluateWeapon(strike, [allNeutral], { baseline: 110 }).verdict).toBe("not_worth");
  });

  it("elementalShare muda só os combos imbued (padrão 0.5); share 1 = 100% elemento", () => {
    expect(evaluateWeapon(breaker, [hellflayer]).elementalShare).toBe(0.5);
    const full = evaluateWeapon(breaker, [hellflayer], { elementalShare: 1, mode: "official" });
    expect(full.presets.elemental?.damagePct).toBeCloseTo(60, 2);
    expect(full.presets.physical.damagePct).toBeCloseTo(107, 2);
    const none = evaluateWeapon(breaker, [hellflayer], { elementalShare: 0, mode: "official" });
    expect(none.presets.elemental?.damagePct).toBeCloseTo(100, 2);
  });
});

describe("evaluateWeapon: hunt (média por criatura, simples e ponderada)", () => {
  const hunt = [hellflayer, target("B", {})];

  it("média simples: official 109.0, reference 108.75 (Slicer, preset elemental)", () => {
    expect(
      evaluateWeapon(slicer, hunt, { mode: "official" }).presets.elemental?.damagePct,
    ).toBeCloseTo(109, 2);
    expect(
      evaluateWeapon(slicer, hunt, { mode: "reference" }).presets.elemental?.damagePct,
    ).toBeCloseTo(108.75, 2);
  });

  it("ponderada A:3 B:1: official 107.75, reference 107.5, perTarget na ordem dos alvos", () => {
    const weighted = [
      target("hellflayer", { earth: 80, fire: 30, energy: 105 }, 3),
      target("B", {}, 1),
    ];
    const off = evaluateWeapon(slicer, weighted, { mode: "official" }).presets.elemental!;
    const ref = evaluateWeapon(slicer, weighted, { mode: "reference" }).presets.elemental!;
    expect(off.damagePct).toBeCloseTo(107.75, 2);
    expect(ref.damagePct).toBeCloseTo(107.5, 2);
    expect(off.perTarget.map((t) => t.targetId)).toEqual(["hellflayer", "B"]);
    expect(off.perTarget[0].damagePct).toBeCloseTo(106.5, 2);
    expect(off.perTarget[1].damagePct).toBeCloseTo(111.5, 2);
    expect(ref.perTarget[0].damagePct).toBeCloseTo(106.25, 2);
    expect(ref.perTarget[1].damagePct).toBeCloseTo(111.25, 2);
  });

  it("o pierce é aplicado criatura a criatura e depois a média, não sobre a resistência média", () => {
    const perCreature = evaluateWeapon(
      breaker,
      [target("A", { fire: 0 }), target("B", { fire: 200 })],
      { mode: "official" },
    );
    const onAverage = evaluateWeapon(breaker, [target("M", { fire: 100 })], { mode: "official" });
    expect(perCreature.presets.elemental!.damagePct).toBeCloseTo(105.75, 2);
    expect(onAverage.presets.elemental!.damagePct).toBeCloseTo(111.5, 2);
  });
});

describe("evaluateWeapon: resistência negativa (absorve)", () => {
  const absorber = target("absorve", { fire: -100 });

  it("Breaker elemental: official 0.0 e reference 22.5, sem truncar, com absorbs", () => {
    const off = evaluateWeapon(breaker, [absorber], { mode: "official" }).presets.elemental!;
    const ref = evaluateWeapon(breaker, [absorber], { mode: "reference" }).presets.elemental!;
    expect(off.damagePct).toBeCloseTo(0, 2);
    expect(ref.damagePct).toBeCloseTo(22.5, 2);
    expect(off.perTarget[0].absorbs).toBe(true);
    expect(ref.perTarget[0].absorbs).toBe(true);
  });

  it("absorbs só vale para o componente usado: preset physical ignora o fogo negativo", () => {
    const e = evaluateWeapon(breaker, [absorber]);
    expect(e.presets.physical.perTarget[0].absorbs).toBe(false);
    expect(e.presets.physical.damagePct).toBeCloseTo(107, 2);
  });

  it("físico negativo marca absorbs e o dano fica negativo (sem truncar)", () => {
    const e = evaluateWeapon(strike, [target("cura", { physical: -50 })], { mode: "official" });
    expect(e.presets.physical.damagePct).toBeCloseTo(-50, 2);
    expect(e.best.perTarget[0].absorbs).toBe(true);
    expect(e.verdict).toBe("not_worth");
  });

  it("diffToSecondPct é null quando a segunda tem dano <= 0", () => {
    const e = evaluateWeapon(strike, [target("cura", { physical: -50 })]);
    expect(e.secondBest?.damagePct).toBeLessThanOrEqual(0);
    expect(e.diffToSecondPct).toBeNull();
  });
});

describe("compareModes", () => {
  it("differs = true no Hellflayer com Crypt Slicer", () => {
    const c = compareModes(slicer, [hellflayer]);
    expect(c.differs).toBe(true);
    expect(c.official.mode).toBe("official");
    expect(c.reference.mode).toBe("reference");
  });

  it("differs = false para o Monk contra alvo neutro (físico 100 + 20 = 110 nos dois modos)", () => {
    expect(compareModes(strike, [allNeutral]).differs).toBe(false);
  });

  it("repassa elementalShare para os dois modos", () => {
    const c = compareModes(breaker, [hellflayer], { elementalShare: 1 });
    expect(c.official.elementalShare).toBe(1);
    expect(c.reference.elementalShare).toBe(1);
  });
});

describe("rankWeapons", () => {
  it("ordena pelo melhor dano (empate por slug) e calcula a vantagem sobre o próximo", () => {
    const ranked = rankWeapons([breaker, slicer, splitter], [hellflayer], { mode: "official" });
    expect(ranked.map((r) => r.weapon.slug)).toEqual([
      "crypt-splitter",
      "crypt-breaker",
      "crypt-slicer",
    ]);
    expect(ranked.map((r) => r.rank)).toEqual([1, 2, 3]);
    expect(ranked[0].advantageOverNextPct).toBeCloseTo((114 / 107 - 1) * 100, 6);
    expect(ranked[1].advantageOverNextPct).toBeCloseTo(0, 6);
    expect(ranked[2].advantageOverNextPct).toBeNull();
  });

  it("lista vazia devolve lista vazia; vantagem é null se o próximo tem dano <= 0", () => {
    expect(rankWeapons([], [hellflayer])).toEqual([]);
    const ranked = rankWeapons([breaker, strike], [target("cura", { physical: -100, fire: -100 })]);
    expect(ranked.at(-1)?.advantageOverNextPct).toBeNull();
    expect(ranked[0].advantageOverNextPct).toBeNull();
  });
});

describe("creatureToTarget / huntToTargets / plainElementBaseline", () => {
  const hell = creatures.find((c) => c.slug === "hellflayer")!;

  it("converte null em 100, registra assumedNeutral e preserva negativos", () => {
    const c: Creature = { ...hell, resist: { ...hell.resist, ice: null, holy: null, death: -200 } };
    const t = creatureToTarget(c);
    expect(t.resist.ice).toBe(100);
    expect(t.resist.death).toBe(-200);
    expect([...t.assumedNeutral].sort()).toEqual(["holy", "ice"]);
    expect(t).toMatchObject({ id: "hellflayer", weight: 1 });
    expect(creatureToTarget(hell, 4).weight).toBe(4);
  });

  it("hpDrain e drown não entram no Target", () => {
    expect(Object.keys(creatureToTarget(hell).resist).sort()).toEqual([
      "death",
      "earth",
      "energy",
      "fire",
      "holy",
      "ice",
      "physical",
    ]);
  });

  it("huntToTargets: padrão equal (peso 1), weighted usa o weight da hunt; ignora criaturas sem dados", () => {
    const map = new Map<string, Creature>([[hell.slug, hell]]);
    const hunt = {
      slug: "h",
      name: "H",
      wikiTitle: "H",
      sourceUrl: "https://tibia.fandom.com/wiki/H",
      city: null,
      location: null,
      levelKnights: null,
      levelPaladins: null,
      levelMages: null,
      levelMonks: null,
      expRaw: null,
      lootRaw: null,
      creatures: [
        { creatureSlug: "hellflayer", weight: 3 },
        { creatureSlug: "nao-existe", weight: 1 },
      ],
    };
    const t = huntToTargets(hunt, map);
    expect(t).toHaveLength(1);
    expect(t[0]).toMatchObject({ id: "hellflayer", weight: 1 });
    expect(huntToTargets(hunt, map, { weighting: "equal" })[0].weight).toBe(1);
    expect(huntToTargets(hunt, map, { weighting: "weighted" })[0]).toMatchObject({
      id: "hellflayer",
      weight: 3,
    });
    expect(huntToTargets({ ...hunt, creatures: [] }, map)).toEqual([]);
  });

  it("plainElementBaseline devolve o elemento mais fraco (maior %) pela média ponderada", () => {
    expect(plainElementBaseline([hellflayer])).toEqual({ element: "energy", damagePct: 105 });
    const mix = [target("A", { fire: 150 }, 1), target("B", { fire: 50 }, 3)];
    expect(plainElementBaseline(mix, ["fire", "ice"])).toEqual({ element: "ice", damagePct: 100 });
    expect(plainElementBaseline(mix, ["fire"]).damagePct).toBeCloseTo(75, 6);
  });
});

describe("validações (RangeError)", () => {
  it("targets vazio, peso inválido, elementalShare, resist não finita, baseline e nível", () => {
    expect(() => evaluateWeapon(breaker, [])).toThrow(RangeError);
    for (const weight of [0, -1, Number.NaN, Number.POSITIVE_INFINITY]) {
      expect(() => evaluateWeapon(breaker, [target("x", {}, weight)])).toThrow(RangeError);
    }
    for (const elementalShare of [1.1, -0.1, Number.NaN]) {
      expect(() => evaluateWeapon(breaker, [allNeutral], { elementalShare })).toThrow(RangeError);
    }
    expect(() => evaluateWeapon(breaker, [target("x", { fire: Number.NaN })])).toThrow(RangeError);
    expect(() => evaluateWeapon(breaker, [allNeutral], { baseline: Number.NaN })).toThrow(
      RangeError,
    );
    expect(() => evaluateWeapon(breaker, [allNeutral], { maxProficiencyLevel: 9 })).toThrow(
      RangeError,
    );
    expect(() => creatureToTarget(creatures[0], 0)).toThrow(RangeError);
    expect(() => plainElementBaseline([])).toThrow(RangeError);
  });

  it("arma com perks incompletos lança em evaluateWeapon", () => {
    expect(() => evaluateWeapon({ ...breaker, perks: [] }, [allNeutral])).toThrow(RangeError);
  });
});

describe("rankWeapons: empate de exibição (TIE_DISPLAY_EPS = 0.05)", () => {
  /** Clone do Breaker com mais pierce físico no nível 7 (best = combinação só física). */
  const clone = (slug: string, extraPhysical: number): CryptWeapon => ({
    ...breaker,
    slug,
    perks: breaker.perks.map((lv) =>
      lv.level === 7
        ? {
            ...lv,
            options: lv.options.map((o) =>
              o.pierce.physical > 0
                ? { ...o, pierce: { physical: o.pierce.physical + extraPhysical, elemental: 0 } }
                : o,
            ),
          }
        : lv,
    ),
  });
  // Fogo 0 deixa os combos elementais fracos: o best de cada clone é o físico (14 + extra), em reference.
  const dryFire = target("fogo-zero", { fire: 0 });
  const rank = (ws: CryptWeapon[]) => rankWeapons(ws, [dryFire], { mode: "reference" });

  it("Hellflayer/official: Splitter lidera sozinho; Breaker e Slicer empatam em displayRank 2", () => {
    const r = rankWeapons([breaker, slicer, splitter], [hellflayer], { mode: "official" });
    expect(r.map((x) => [x.weapon.slug, x.rank, x.displayRank, x.tied])).toEqual([
      ["crypt-splitter", 1, 1, false],
      ["crypt-breaker", 2, 2, true],
      ["crypt-slicer", 3, 2, true],
    ]);
  });

  it("diferença de 0.04 é empate: mesma posição de exibição, ordenação intacta", () => {
    const r = rank([breaker, clone("clone-a", 0.08)]);
    expect(r.map((x) => x.weapon.slug)).toEqual(["clone-a", "crypt-breaker"]);
    expect(r[0].evaluation.best.damagePct - r[1].evaluation.best.damagePct).toBeCloseTo(0.04, 6);
    expect(r.map((x) => [x.rank, x.displayRank, x.tied])).toEqual([
      [1, 1, true],
      [2, 1, true],
    ]);
  });

  it("diferença de 0.06 não é empate", () => {
    const r = rank([breaker, clone("clone-b", 0.12)]);
    expect(r[0].evaluation.best.damagePct - r[1].evaluation.best.damagePct).toBeCloseTo(0.06, 6);
    expect(r.map((x) => [x.rank, x.displayRank, x.tied])).toEqual([
      [1, 1, false],
      [2, 2, false],
    ]);
  });

  it("o grupo é definido pelo líder: 107.08, 107.04 empatam; 107.00 (0.08 do líder) abre outro grupo", () => {
    const r = rank([breaker, clone("clone-c", 0.08), clone("clone-d", 0.16)]);
    expect(r.map((x) => x.weapon.slug)).toEqual(["clone-d", "clone-c", "crypt-breaker"]);
    expect(r.map((x) => [x.displayRank, x.tied])).toEqual([
      [1, true],
      [1, true],
      [3, false],
    ]);
  });

  it("rank e advantageOverNextPct não mudam por causa do empate de exibição", () => {
    const r = rank([breaker, clone("clone-a", 0.08)]);
    expect(r.map((x) => x.rank)).toEqual([1, 2]);
    expect(r[0].advantageOverNextPct).toBeCloseTo((107.04 / 107 - 1) * 100, 6);
    expect(r[1].advantageOverNextPct).toBeNull();
  });
});

describe("huntToTargets: média simples (padrão) x ponderada, ponta a ponta", () => {
  const hell = creatures.find((c) => c.slug === "hellflayer")!;
  const flat: Creature = {
    ...hell,
    slug: "neutra",
    name: "Neutra",
    resist: {
      physical: 100,
      earth: 100,
      fire: 100,
      energy: 100,
      ice: 100,
      holy: 100,
      death: 100,
      hpDrain: 100,
      drown: 100,
    },
  };
  const map = new Map<string, Creature>([
    [hell.slug, hell],
    [flat.slug, flat],
  ]);
  const hunt = {
    slug: "h",
    name: "H",
    wikiTitle: "H",
    sourceUrl: "https://tibia.fandom.com/wiki/H",
    city: null,
    location: null,
    levelKnights: null,
    levelPaladins: null,
    levelMages: null,
    levelMonks: null,
    expRaw: null,
    lootRaw: null,
    creatures: [
      { creatureSlug: "hellflayer", weight: 3 },
      { creatureSlug: "neutra", weight: 1 },
    ],
  };
  const elemental = (mode: "official" | "reference", weighting?: "equal" | "weighted") =>
    evaluateWeapon(slicer, huntToTargets(hunt, map, weighting ? { weighting } : undefined), {
      mode,
    }).presets.elemental!.damagePct;

  it("padrão = equal: cada criatura conta igual (official 109.0, reference 108.75)", () => {
    expect(elemental("official")).toBeCloseTo(109, 2);
    expect(elemental("reference")).toBeCloseTo(108.75, 2);
    expect(elemental("official", "equal")).toBeCloseTo(109, 2);
  });

  it("weighted: pesos 3 e 1 (official 107.75, reference 107.5)", () => {
    expect(elemental("official", "weighted")).toBeCloseTo(107.75, 2);
    expect(elemental("reference", "weighted")).toBeCloseTo(107.5, 2);
  });

  it("weight inválido na hunt só lança no modo weighted", () => {
    const bad = { ...hunt, creatures: [{ creatureSlug: "hellflayer", weight: 0 }] };
    expect(() => huntToTargets(bad, map)).not.toThrow();
    expect(() => huntToTargets(bad, map, { weighting: "weighted" })).toThrow(RangeError);
  });
});

describe("imbuiment elemental: auto, on e off", () => {
  const weapons = weaponsJson as unknown as CryptWeapon[];
  const all = (creaturesJson as unknown as Creature[]).filter(
    (c) => c.bestiaryClass || c.bosstiaryClass,
  );
  const best = (w: CryptWeapon, t: Target[], imbue: "auto" | "on" | "off") =>
    evaluateWeapon(w, t, { imbue }).best;

  it("auto nunca é pior que forçar com ou sem imbuiment, em todas as criaturas e bosses", () => {
    for (const c of all) {
      const t = [creatureToTarget(c)];
      for (const w of weapons) {
        const auto = best(w, t, "auto").damagePct;
        const on = best(w, t, "on").damagePct;
        const off = best(w, t, "off").damagePct;
        expect(auto).toBeGreaterThanOrEqual(Math.max(on, off) - 1e-9);
      }
    }
  });

  it("forçar 'off' tira o elemento e forçar 'on' imbui mesmo sem pierce elemental", () => {
    const w = weapons.find((x) => x.element !== null)!;
    const t = [creatureToTarget(all[0])];
    expect(best(w, t, "off").combo.imbued).toBe(false);
    expect(best(w, t, "off").combo.pierce.elemental).toBe(0);
    expect(best(w, t, "on").combo.imbued).toBe(true);
  });

  it("criatura fraca ao elemento: imbuir sem pierce elemental pode superar o cálculo antigo", () => {
    const w = weapons.find((x) => x.element === "fire")!;
    const fraca = {
      ...creatureToTarget(all[0]),
      resist: {
        physical: 100,
        earth: 100,
        fire: 300,
        energy: 100,
        ice: 100,
        holy: 100,
        death: 100,
      },
    };
    const velho = evaluateWeapon(w, [fraca], { imbue: "off" }).best.damagePct;
    const auto = evaluateWeapon(w, [fraca], { imbue: "auto" }).best;
    expect(auto.damagePct).toBeGreaterThan(velho);
    expect(auto.combo.imbued).toBe(true);
  });
});
