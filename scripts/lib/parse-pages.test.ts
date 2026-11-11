import { describe, expect, it } from "vitest";
import { parseCreature, parseHunt, uniqueBySlug } from "./parse-pages";

const HELLFLAYER = `{{Infobox Creature|List={{{1|}}}|GetValue={{{GetValue|}}}
| name           = Hellflayer
| hp             = 14000
| exp            = 11720
| bestiaryclass  = Demon
| bestiarylevel  = Hard
| abilities      = {{Ability List
 |{{Melee|0-?}}
 |{{Ability|Death Beam|850-1250|death}}
}}
| physicalDmgMod = 100%
| earthDmgMod    = 80%
| fireDmgMod     = 30%
| deathDmgMod    = 75%
| energyDmgMod   = 105%
| holyDmgMod     = 105%
| iceDmgMod      = 95%
| hpDrainDmgMod  = 0%
| drownDmgMod    = 0%
}}
Texto.`;

describe("parseCreature", () => {
  it("extrai stats e resistências no formato wiki (100 = neutro)", () => {
    const c = parseCreature("Hellflayer", HELLFLAYER);
    expect(c).toMatchObject({
      slug: "hellflayer",
      name: "Hellflayer",
      hp: 14000,
      exp: 11720,
      bestiaryClass: "Demon",
      bestiaryLevel: "Hard",
    });
    expect(c?.resist).toEqual({
      physical: 100,
      earth: 80,
      fire: 30,
      energy: 105,
      ice: 95,
      holy: 105,
      death: 75,
      hpDrain: 0,
      drown: 0,
    });
  });

  it("campos ausentes ou inválidos viram null, sem lançar", () => {
    const c = parseCreature(
      "Foo",
      "{{Infobox Creature\n| name = Foo\n| hp = ?\n| fireDmgMod = abc\n}}",
    );
    expect(c?.hp).toBeNull();
    expect(c?.exp).toBeNull();
    expect(c?.resist.fire).toBeNull();
    expect(c?.bestiaryClass).toBeNull();
  });

  it("ignora redirects, listas e páginas sem infobox", () => {
    expect(parseCreature("Creatures", "{{CreatureList}}")).toBeNull();
    expect(parseCreature("Old name", "#REDIRECT [[Hellflayer]]")).toBeNull();
    expect(parseCreature("Empty", "")).toBeNull();
  });
});

const known = new Map([
  ["lich", "lich"],
  ["hydra", "hydra"],
  ["hellspawn", "hellspawn"],
]);

const HUNT = `{{Infobox Hunt
| name = Asura Palace
| city = Port Hope
| location = Near the [[Kha'zeel Pass]] in [[Tiquanda]].
| lvlknights = 200
| lvlpaladins = 
| lvlmages = ?
| loot = Very Good 
| exp = Very Good 
}}
Prosa com [[Hydra]].
== Creatures ==
{{CreatureList|type=List/Sorted
 |Lich
 |Hydra
}}
{{CreatureList
 |Hellspawn
 |Hydra
 |Desconhecida
}}`;

describe("parseHunt", () => {
  it("usa CreatureList com contagem por aparição e ignora criaturas desconhecidas", () => {
    const h = parseHunt("Asura Palace", HUNT, known);
    expect(h?.slug).toBe("asura-palace");
    expect(h?.city).toBe("Port Hope");
    expect(h?.levelKnights).toBe(200);
    expect(h?.levelPaladins).toBeNull();
    expect(h?.levelMages).toBeNull();
    expect(h?.creatures).toEqual([
      { creatureSlug: "lich", weight: 1 },
      { creatureSlug: "hydra", weight: 2 },
      { creatureSlug: "hellspawn", weight: 1 },
    ]);
  });

  it("sem CreatureList, cai para links que batem com criaturas conhecidas", () => {
    const t = "{{Infobox Hunt\n| name = X\n}}\n[[Lich]] [[Lich]] [[Tiquanda]] [[Hydra|hidras]]";
    expect(parseHunt("X", t, known)?.creatures).toEqual([
      { creatureSlug: "lich", weight: 2 },
      { creatureSlug: "hydra", weight: 1 },
    ]);
  });

  it("hunt sem criaturas detectadas devolve lista vazia; página sem infobox, null", () => {
    expect(parseHunt("Y", "{{Infobox Hunt\n| name = Y\n}}\nnada", known)?.creatures).toEqual([]);
    expect(parseHunt("Z", "Lista de hunts", known)).toBeNull();
  });
});

describe("campos do contrato", () => {
  it("criatura e hunt guardam wikiTitle; hunt lê lvlmonk, exp e loot crus", () => {
    expect(
      parseCreature("Doctor Marrow (Podzilla)", "{{Infobox Creature\n| name = Doctor Marrow\n}}")
        ?.wikiTitle,
    ).toBe("Doctor Marrow (Podzilla)");
    const h = parseHunt(
      "Hunt X",
      "{{Infobox Hunt\n| name = X\n| lvlmonk = 300\n| exp = Good\n| loot = Bad\n}}",
      new Map(),
    );
    expect(h).toMatchObject({
      wikiTitle: "Hunt X",
      levelMonks: 300,
      expRaw: "Good",
      lootRaw: "Bad",
    });
  });
});

describe("uniqueBySlug", () => {
  const item = (slug: string, wikiTitle: string) => ({ slug, wikiTitle });
  it("mantém slug do título igual ao nome e diferencia os demais pelo título", () => {
    const r = uniqueBySlug([
      item("doctor-marrow", "Doctor Marrow (Podzilla)"),
      item("doctor-marrow", "Doctor Marrow"),
      item("hydra", "Hydra"),
    ]);
    expect(r.map((i) => i.slug)).toEqual(["doctor-marrow", "doctor-marrow-podzilla", "hydra"]);
  });
  it("sub-páginas com o mesmo nome usam o título inteiro", () => {
    const r = uniqueBySlug([
      item("poacher-caves", "Poacher Caves/Game"),
      item("poacher-caves", "Poacher Caves/Gloomy"),
    ]);
    expect(r.map((i) => i.slug)).toEqual(["poacher-caves-game", "poacher-caves-gloomy"]);
  });
  it("lança se ainda colidir (nunca sobrescreve)", () => {
    expect(() => uniqueBySlug([item("a", "A B"), item("a", "A-B"), item("a-b", "a b")])).toThrow(
      /duplicado/,
    );
  });
});

describe("atribuição, não confirmados e links externos", () => {
  it("marca resistUnconfirmed só para valores com ? e mantém o número", () => {
    const c = parseCreature(
      "Foo",
      "{{Infobox Creature\n| name = Foo\n| fireDmgMod = 100%?\n| iceDmgMod = 80%\n| earthDmgMod = ?\n}}",
    );
    expect(c?.resist.fire).toBe(100);
    expect(c?.resistUnconfirmed).toEqual(["fire"]);
    expect(c?.resist.ice).toBe(80);
    expect(c?.resist.earth).toBeNull();
  });

  it("sourceUrl aponta para a página da wiki (espaço vira _, subpágina mantém a barra)", () => {
    const box = "{{Infobox Creature\n| name = X\n}}";
    expect(parseCreature("Doctor Marrow (Podzilla)", box)?.sourceUrl).toBe(
      "https://tibia.fandom.com/wiki/Doctor_Marrow_(Podzilla)",
    );
    expect(
      parseHunt("Poacher Caves/Game", "{{Infobox Hunt\n| name = P\n}}", new Map())?.sourceUrl,
    ).toBe("https://tibia.fandom.com/wiki/Poacher_Caves/Game");
  });

  it("location não carrega link externo, só o texto", () => {
    const t =
      "{{Infobox Hunt\n| name = H\n| location = Near [http://tibia.wikia.com/wiki/Mapper?coords=1,2 here] now\n}}";
    expect(parseHunt("H", t, new Map())?.location).toBe("Near here now");
  });
});
