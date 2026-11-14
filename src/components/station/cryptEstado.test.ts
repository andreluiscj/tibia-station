import { describe, expect, it } from "vitest";
import creatures from "@data/creatures.json";
import weapons from "@data/crypt-weapons.json";
import altWeapons from "./alt-weapons.fixture.json";
import hunts from "@data/hunts.json";
import { armasDeHand, armasDeMelee } from "@/lib/data/weapons";
import type { AltWeapon, Creature, CryptWeapon, Hunt } from "@/lib/data/types";
import { altDamagePct } from "@/lib/crypt/engine";
import {
  MAX_ALTERNATIVAS,
  calcular,
  labelCombo,
  modosDe,
  parseSearch,
  perksDoCombo,
  proficienciaIdeal,
  quemAbsorve,
  resolver,
  weaponsFor,
} from "./cryptEstado";

const armas = weapons as unknown as CryptWeapon[];
const porSlug = new Map((creatures as unknown as Creature[]).map((c) => [c.slug, c]));
// O fixture guarda as armas num formato próprio; aqui viram linhas das tabelas e passam pelo mapeamento real.
type Fx = {
  name: string;
  vocation: string;
  category: string;
  attack: number;
  element: string | null;
  elementAttack: number;
  levelRequired: number;
  imbuementSlots: number;
};
const CLASSE: Record<string, number> = { axe: 1, club: 2, sword: 3 };
const fx = altWeapons as unknown as Fx[];
const alts: AltWeapon[] = [
  ...armasDeMelee(
    fx
      .filter((a) => a.vocation === "knight")
      .map((a) => ({
        item_name: a.name,
        class: CLASSE[a.category],
        vocation: 1,
        level_minimum: a.levelRequired,
        imbuiment: a.imbuementSlots,
        physical_attack: a.attack,
        ...(a.element ? { [`${a.element}_attack`]: a.elementAttack } : {}),
      })),
  ),
  ...armasDeHand(
    fx
      .filter((a) => a.vocation === "monk")
      .map((a) => ({ item_name: a.name, attack: a.attack, level_minimum: a.levelRequired })),
  ),
];
const todasHunts = hunts as unknown as Hunt[];

describe("parseSearch", () => {
  it("aceita só valores conhecidos e descarta o resto", () => {
    expect(parseSearch({ voc: "ek", cat: "club", lvl: "450", modo: "reference", x: 1 })).toEqual({
      voc: "ek",
      cat: "club",
      lvl: 450,
    });
    expect(parseSearch({ voc: "mage", cat: "wand", lvl: 0, modo: "x" })).toEqual({});
  });
  it("slug inválido não passa; monster vence hunt", () => {
    expect(parseSearch({ monster: "../x" })).toEqual({});
    expect(parseSearch({ monster: "hellflayer", hunt: "crystal-enigma" })).toEqual({
      monster: "hellflayer",
    });
    expect(parseSearch({ hunt: "crystal-enigma", peso: 1 })).toEqual({
      hunt: "crystal-enigma",
      peso: 1,
    });
  });
  it("valores inválidos da URL nunca passam (cat, voc, modo, lvl)", () => {
    const lixo = {
      monster: "hellflayer",
      cat: "zzz",
      voc: "zzz",
      modo: "x",
      lvl: Infinity,
      peso: 2,
    };
    expect(parseSearch(lixo)).toEqual({ monster: "hellflayer" });
    for (const lvl of ["1e999", "abc", "", -1, 5001, 1.5, null])
      expect(parseSearch({ lvl })).toEqual({});
  });
  it("parseSearch é idempotente e trata null do patch como remoção", () => {
    const ok = parseSearch({ voc: "monk", hunt: "crystal-enigma" });
    expect(parseSearch(ok)).toEqual(ok);
    expect(parseSearch({ ...ok, hunt: null })).toEqual({ voc: "monk" });
  });
  it("resolver aplica os padrões", () => {
    expect(resolver({})).toMatchObject({
      voc: "ek",
      cat: "todas",
      lvl: 1000,
      modo: "official",
    });
    expect(resolver({ voc: "monk", cat: "club" }).cat).toBe("fist");
  });
});

describe("weaponsFor", () => {
  it("EK sem categoria: 3 armas; com categoria: 1; Monk: Crypt Strike", () => {
    expect(weaponsFor(armas, "ek", "todas")).toHaveLength(3);
    expect(weaponsFor(armas, "ek", "axe").map((w) => w.slug)).toEqual(["crypt-splitter"]);
    expect(weaponsFor(armas, "monk", "fist").map((w) => w.slug)).toEqual(["crypt-strike"]);
  });
});

describe("calcular", () => {
  it("sem alvo: vazio; slug desconhecido: nao-encontrado", () => {
    expect(calcular({ armas, criaturas: porSlug, hunts: todasHunts, estado: {} }).tipo).toBe(
      "vazio",
    );
    expect(
      calcular({ armas, criaturas: porSlug, hunts: todasHunts, estado: { monster: "nao-existe" } }),
    ).toEqual({ tipo: "nao-encontrado", oque: "monster" });
  });
  it("Hellflayer, regras oficiais: Splitter lidera com 114,0 e Breaker/Slicer empatam", () => {
    const c = calcular({
      armas,
      criaturas: porSlug,
      hunts: todasHunts,
      estado: { monster: "hellflayer" },
    });
    if (c.tipo !== "ok") throw new Error("esperava ok");
    const [a, b, d] = c.ranking;
    expect(a.weapon.slug).toBe("crypt-splitter");
    expect(a.evaluation.best.damagePct).toBeCloseTo(114, 5);
    expect(a.displayRank).toBe(1);
    expect(b.tied && d.tied).toBe(true);
    expect(b.displayRank).toBe(2);
    expect(d.displayRank).toBe(2);
  });
  it("modos formam rótulos e perks legíveis", () => {
    const c = calcular({
      armas,
      criaturas: porSlug,
      hunts: todasHunts,
      estado: { monster: "hellflayer" },
    });
    if (c.tipo !== "ok") throw new Error("esperava ok");
    const ev = c.ranking[0].evaluation;
    expect(labelCombo(ev.best)).toMatch(/Elemental 45%|Híbrida|Physical 14%|Pierce/);
    expect(perksDoCombo(c.ranking[0].weapon, ev.best).every((l) => l.startsWith("Nível "))).toBe(
      true,
    );
  });
  it("hunt sem criaturas vira sem-criaturas", () => {
    const vazia = todasHunts.find((h) => h.creatures.length === 0);
    expect(vazia).toBeDefined();
    expect(
      calcular({ armas, criaturas: porSlug, hunts: todasHunts, estado: { hunt: vazia!.slug } })
        .tipo,
    ).toBe("sem-criaturas");
  });
});

describe("calcular: peso da hunt e baseline", () => {
  const neutra = {
    ...(porSlug.get("hellflayer") as Creature),
    slug: "neutra",
    name: "Neutra",
    resist: {
      ...(porSlug.get("hellflayer") as Creature).resist,
      earth: 100,
      fire: 100,
      energy: 100,
      physical: 100,
      ice: 100,
      holy: 100,
      death: 100,
    },
  } as Creature;
  const mapa = new Map([...porSlug, ["neutra", neutra]]);
  const hunt: Hunt = {
    ...todasHunts[0],
    slug: "teste",
    creatures: [
      { creatureSlug: "hellflayer", weight: 3 },
      { creatureSlug: "neutra", weight: 1 },
    ],
  };
  const slicer = (estado: Parameters<typeof calcular>[0]["estado"]) => {
    const c = calcular({
      armas,
      criaturas: mapa,
      hunts: [hunt],
      estado: { hunt: "teste", ...estado },
    });
    if (c.tipo !== "ok") throw new Error("esperava ok");
    return c.ranking.find((r) => r.weapon.slug === "crypt-slicer")!.evaluation.presets.elemental!
      .damagePct;
  };

  it("padrão é média simples: cada criatura conta igual", () => {
    expect(slicer({})).toBeCloseTo(109, 2);
  });
  it("peso=1 pondera pelo weight da criatura (3 e 1)", () => {
    expect(slicer({ peso: 1 })).toBeCloseTo(107.75, 2);
  });
  it("concorrente = melhor Soul War/Sanguine da mesma categoria no nível (Hellflayer, nível 450: só Soul)", () => {
    const c = calcular({
      armas,
      alternativas: alts,
      criaturas: porSlug,
      hunts: todasHunts,
      estado: { monster: "hellflayer", lvl: 450 },
    });
    if (c.tipo !== "ok") throw new Error("esperava ok");
    // Hellflayer: físico 100, ice 95, energy 105, death 75. Dano = (atk físico×100 + atk elem×resist) ÷ 58.
    expect(c.concorrentes["crypt-splitter"]!.alt.slug).toBe("souleater");
    expect(c.concorrentes["crypt-splitter"]!.damagePct).toBeCloseTo(94.22, 2);
    expect(c.concorrentes["crypt-breaker"]!.alt.slug).toBe("soulmaimer");
    expect(c.concorrentes["crypt-breaker"]!.damagePct).toBeCloseTo(102.33, 2);
    expect(c.concorrentes["crypt-slicer"]!.alt.slug).toBe("soulshredder");
    for (const r of c.ranking)
      expect(r.evaluation.baseline).toBe(c.concorrentes[r.weapon.slug]!.damagePct);
  });
  it("fraco a energy: o machado compensa (não existe axe de energy) e o club perde para a Soulmaimer", () => {
    const fraco = {
      ...neutra,
      slug: "fraco-energy",
      resist: { ...neutra.resist, energy: 130 },
    } as Creature;
    const c = calcular({
      armas,
      alternativas: alts,
      criaturas: new Map([["fraco-energy", fraco]]),
      hunts: [],
      estado: { monster: "fraco-energy" },
    });
    if (c.tipo !== "ok") throw new Error("esperava ok");
    const veredito = (slug: string) =>
      c.ranking.find((r) => r.weapon.slug === slug)!.evaluation.verdict;
    expect(veredito("crypt-splitter")).toBe("worth");
    expect(veredito("crypt-breaker")).toBe("not_worth");
  });
  it("Sanguine só entra a partir do nível 600", () => {
    const rodar = (lvl: number) => {
      const c = calcular({
        armas,
        alternativas: alts,
        criaturas: porSlug,
        hunts: todasHunts,
        estado: { monster: "hellflayer", lvl },
      });
      if (c.tipo !== "ok") throw new Error("esperava ok");
      return c.concorrentes["crypt-slicer"]!.alt.slug;
    };
    expect(rodar(450)).toBe("soulshredder");
    expect(rodar(600)).toBe("sanguine-razor"); // (8×100 + 50×105) ÷ 58 = 104,3
  });
  it("sem concorrente liberada o baseline é 100 (Monk abaixo do nível 600)", () => {
    const c = calcular({
      armas,
      alternativas: alts,
      criaturas: porSlug,
      hunts: todasHunts,
      estado: { voc: "monk", monster: "hellflayer", lvl: 450 },
    });
    if (c.tipo !== "ok") throw new Error("esperava ok");
    expect(c.concorrentes["crypt-strike"]).toBeNull();
    expect(c.ranking[0].evaluation.baseline).toBe(100);
  });
});

describe("candidatos", () => {
  it("compara contra todas as armas registradas e a Crypt traz nível, pierce e imbuement", () => {
    const c = calcular({
      armas,
      alternativas: alts,
      criaturas: porSlug,
      hunts: todasHunts,
      estado: { monster: "hellflayer" },
    });
    if (c.tipo !== "ok") throw new Error("esperava ok");
    const axes = c.candidatos.filter((x) => x.categoria === "axe");
    expect(axes).toHaveLength(
      1 + alts.filter((a) => a.category === "axe" && a.vocation === "knight").length,
    );
    const crypt = c.candidatos.find((x) => x.origem === "crypt")!;
    expect(crypt.nivel).toBe(armas.find((w) => w.slug === crypt.chave)!.levelRequired);
    expect(typeof crypt.imbued).toBe("boolean");
    expect(crypt.pierce!.physical + crypt.pierce!.elemental).toBeGreaterThan(0);
  });
});

describe("candidatos do Monk", () => {
  it("Crypt Strike e as armas fist liberadas entram em candidatos", () => {
    const c = calcular({
      armas,
      alternativas: alts,
      criaturas: porSlug,
      hunts: todasHunts,
      estado: { voc: "monk", monster: "hellflayer" },
    });
    if (c.tipo !== "ok") throw new Error("esperava ok");
    expect(c.candidatos.every((x) => x.categoria === "fist")).toBe(true);
    expect(c.candidatos.map((x) => x.chave)).toContain("crypt-strike");
    const fists = alts.filter((a) => a.vocation === "monk" && a.category === "fist");
    expect(c.candidatos).toHaveLength(1 + fists.length);
  });
});

describe("quemAbsorve", () => {
  const splitter = armas.find((w) => w.slug === "crypt-splitter")!;
  const alvo = (resist: Partial<Record<string, number>>) => ({
    id: "x",
    name: "X",
    weight: 1,
    assumedNeutral: [],
    resist: {
      physical: 100,
      earth: 100,
      fire: 100,
      energy: 100,
      ice: 100,
      holy: 100,
      death: 100,
      ...resist,
    },
  });
  const combo = (imbued: boolean) =>
    ({
      preset: null,
      damagePct: 0,
      perTarget: [],
      combo: { choices: [], pierce: { physical: 0, elemental: 0 }, imbued },
    }) as never;
  it("nomeia o físico, o elemento da arma ou os dois", () => {
    expect(quemAbsorve(alvo({ physical: -10 }) as never, splitter, combo(false))).toBe(
      "absorve o dano físico",
    );
    expect(quemAbsorve(alvo({ energy: -50 }) as never, splitter, combo(true))).toBe(
      "absorve o elemento Energy",
    );
    expect(quemAbsorve(alvo({ physical: -1, energy: -1 }) as never, splitter, combo(true))).toBe(
      "absorve o dano físico e o elemento Energy",
    );
  });
  it("elemento só conta se a combinação for imbuída", () => {
    expect(quemAbsorve(alvo({ energy: -50 }) as never, splitter, combo(false))).toBe(
      "absorve o elemento",
    );
  });
});

describe("rotulo dos presets vem do pierce real da arma", () => {
  const rotulos = (estado: Parameters<typeof calcular>[0]["estado"]) => {
    const c = calcular({ armas, criaturas: porSlug, hunts: todasHunts, estado });
    if (c.tipo !== "ok") throw new Error("esperava ok");
    return c.ranking.map((r) => ({
      arma: r.weapon.slug,
      rotulos: modosDe(r.evaluation, r.weapon).map((m) => m.label),
      physical: r.evaluation.presets.physical.combo.pierce.physical,
    }));
  };
  it("Knight: Elemental 45%, Híbrida 35% + 6% e Physical 14%", () => {
    for (const r of rotulos({ monster: "hellflayer" })) {
      expect(r.rotulos).toEqual(["Elemental 45%", "Híbrida 35% + 6%", "Physical 14%"]);
    }
  });
  it("Monk: o rótulo físico mostra o pierce físico real da combinação, não 14%", () => {
    const [strike] = rotulos({ voc: "monk", monster: "hellflayer" });
    expect(strike.physical).toBe(20);
    expect(strike.rotulos).toEqual(["Physical 20%"]);
  });
  it("combinação vencedora fora dos presets descreve o pierce em números", () => {
    const c = calcular({
      armas,
      criaturas: porSlug,
      hunts: todasHunts,
      estado: { monster: "hellflayer" },
    });
    if (c.tipo !== "ok") throw new Error("esperava ok");
    for (const r of c.ranking)
      expect(labelCombo(r.evaluation.best)).toMatch(/^(Elemental|Híbrida|Physical|Pierce) /);
  });
});

describe("comparação com as tabelas do jogo", () => {
  const rodar = (estado: Parameters<typeof calcular>[0]["estado"], extra: AltWeapon[] = []) => {
    const c = calcular({
      armas,
      alternativas: [...alts, ...extra],
      criaturas: porSlug,
      hunts: todasHunts,
      estado,
    });
    if (c.tipo !== "ok") throw new Error("esperava ok");
    return c;
  };
  it("Knight por categoria: só as armas daquela categoria entram", () => {
    for (const cat of ["axe", "club", "sword"] as const) {
      const c = rodar({ monster: "hellflayer", cat });
      expect(new Set(c.candidatos.map((x) => x.categoria))).toEqual(new Set([cat]));
    }
  });
  it("filtra pelo nível: arma de nível 600 só aparece a partir do 600", () => {
    const nomes = (lvl: number) =>
      rodar({ monster: "hellflayer", lvl }).candidatos.map((x) => x.nome);
    expect(nomes(599)).not.toContain("Sanguine Razor");
    expect(nomes(600)).toContain("Sanguine Razor");
  });
  it("linhas das tabelas que repetem uma Crypt não duplicam o candidato", () => {
    const dup = armasDeMelee([
      { item_name: "Crypt Slicer", class: 3, vocation: 1, level_minimum: 450, physical_attack: 99 },
    ]);
    const c = rodar({ monster: "hellflayer" }, dup);
    expect(c.candidatos.filter((x) => x.nome === "Crypt Slicer")).toHaveLength(1);
  });
  it("arma com dois elementos soma os dois ataques contra o alvo", () => {
    const dupla = armasDeMelee([
      {
        item_name: "Dupla",
        class: 1,
        vocation: 1,
        level_minimum: 1,
        physical_attack: 10,
        fire_attack: 20,
        ice_attack: 30,
      },
    ])[0];
    const solo = armasDeMelee([
      {
        item_name: "Solo",
        class: 1,
        vocation: 1,
        level_minimum: 1,
        physical_attack: 10,
        fire_attack: 20,
      },
    ])[0];
    const alvo = {
      id: "x",
      name: "x",
      weight: 1,
      assumedNeutral: [],
      resist: { physical: 100, fire: 100, ice: 50, earth: 100, energy: 100, holy: 100, death: 100 },
    };
    expect(altDamagePct(dupla, [alvo], 50) - altDamagePct(solo, [alvo], 50)).toBeCloseTo(
      (30 * 50) / 50,
    );
  });
  it("Monk usa as armas de weapons_hand", () => {
    const mao = armasDeHand([{ item_name: "Luva Forte", attack: 500, level_minimum: 100 }]);
    const c = rodar({ voc: "monk", monster: "hellflayer" }, mao);
    expect(c.candidatos.map((x) => x.nome)).toContain("Luva Forte");
    expect(c.candidatos.every((x) => x.categoria === "fist")).toBe(true);
  });
  it("a lista de candidatos traz mais de 4; o limite de 4 é da exibição", () => {
    expect(1 + MAX_ALTERNATIVAS).toBe(4);
    expect(rodar({ monster: "hellflayer", cat: "axe" }).candidatos.length).toBeGreaterThan(0);
  });
});

describe("proficienciaIdeal", () => {
  const esc = [
    { level: 3, perkId: "3.1" },
    { level: 7, perkId: "7.2" },
  ];
  it("Knight: fixos, nível 5 depende do imbuement, 3 e 7 vêm do cálculo", () => {
    expect(proficienciaIdeal("knight", true, esc)).toEqual({
      1: "1.1",
      2: "2.3",
      3: "3.1",
      4: "4.1",
      5: "5.1",
      6: "6.2",
      7: "7.2",
    });
    expect(proficienciaIdeal("knight", false, esc)[5]).toBe("5.3");
  });
  it("Monk: tudo fixo", () => {
    expect(Object.values(proficienciaIdeal("monk", false))).toEqual([
      "1.1",
      "2.3",
      "3.3",
      "4.1",
      "5.1",
      "6.2",
      "7.1",
    ]);
  });
});

describe("proficiência editada", () => {
  const base = { armas, criaturas: porSlug, hunts: hunts as unknown as Hunt[] };
  const crypt = (c: ReturnType<typeof calcular>) =>
    c.tipo === "ok" ? c.candidatos.filter((x) => x.origem === "crypt") : [];
  const estado = { voc: "ek", cat: "sword", monster: "hellflayer" } as const;

  it("sem os níveis 3, 5 e 7 liberados o pierce some e o dano não sobe", () => {
    const cheia = crypt(calcular({ ...base, estado }))[0];
    const slug = cheia.chave;
    const curta = crypt(
      calcular({ ...base, estado, proficiencias: { [slug]: { max: 2, perks: {} } } }),
    ).find((x) => x.chave === slug)!;
    expect(curta.pierce).toEqual({ physical: 0, elemental: 0 });
    expect(curta.damagePct).toBeLessThanOrEqual(cheia.damagePct);
  });

  it("fixa o perk escolhido e mantém todas as opções para a tela", () => {
    const slug = crypt(calcular({ ...base, estado }))[0].chave;
    const arma = armas.find((a) => a.slug === slug)!;
    const o = arma.perks[2].options[0];
    const r = crypt(
      calcular({ ...base, estado, proficiencias: { [slug]: { max: 7, perks: { 3: o.id } } } }),
    ).find((x) => x.chave === slug)!;
    expect(r.escolhas?.find((e) => e.level === 3)?.perkId ?? o.id).toBe(o.id);
    expect(r.arma?.perks[2].options.length).toBe(arma.perks[2].options.length);
  });
});

describe("imbuiment elemental retirado", () => {
  const base = { armas, criaturas: porSlug, hunts: hunts as unknown as Hunt[] };
  const estado = { voc: "ek", cat: "todas", monster: "hellflayer" } as const;
  const crypt = (c: ReturnType<typeof calcular>) =>
    c.tipo === "ok" ? c.candidatos.filter((x) => x.origem === "crypt") : [];

  it("tira o elemento, guarda o dano imbuído e não ganha dano", () => {
    const com = crypt(calcular({ ...base, estado }));
    const sem = crypt(
      calcular({
        ...base,
        estado,
        semImbuiment: Object.fromEntries(armas.map((a) => [a.slug, true])),
      }),
    );
    expect(sem.every((x) => !x.imbued && x.pierce!.elemental === 0)).toBe(true);
    for (const x of sem) {
      const antes = com.find((c) => c.chave === x.chave)!;
      expect(x.damagePct).toBeLessThanOrEqual(antes.damagePct + 1e-9);
      if (antes.imbued) expect(x.comImbuiment).toBeCloseTo(antes.damagePct);
    }
    expect(com.every((x) => x.comImbuiment === undefined)).toBe(true);
  });
});
