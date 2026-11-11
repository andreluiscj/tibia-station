import { describe, expect, it } from "vitest";
import {
  buildCryptWeapon,
  knightPerks,
  monkPerks,
  pierceElementFromCategories,
} from "./crypt-weapons";

const BREAKER = `{{Infobox Object|List={{{1|}}}
| name          = Crypt Breaker
| primarytype   = Club Weapons
| attrib        = club fighting +4
| imbueslots    = 3
| attack        = 58
| defense       = 33
| levelrequired = 450
| vocrequired   = knights
}}`;

describe("crypt weapons", () => {
  it("monta o Crypt Breaker com elemento fire vindo das categorias e 7 níveis", () => {
    const w = buildCryptWeapon("Crypt Breaker", BREAKER, [
      "Category:Physical Pierce Perk",
      "Fire Pierce Perk",
    ]);
    expect(w).toMatchObject({
      slug: "crypt-breaker",
      wikiTitle: "Crypt Breaker",
      vocation: "knight",
      category: "club",
      attack: 58,
      defense: 33,
      element: "fire",
      imbuementSlots: 3,
      attributes: ["club fighting +4"],
    });
    expect(w?.perks.map((p) => p.level)).toEqual([1, 2, 3, 4, 5, 6, 7]);
  });

  it("Monk não tem pierce elemental e separa atributos por vírgula", () => {
    const t = BREAKER.replace("Crypt Breaker", "Crypt Strike")
      .replace("Club Weapons", "Fist Fighting Weapons")
      .replace("knights", "monks")
      .replace("58", "45")
      .replace("club fighting +4", "fist fighting +4, magic level +1");
    const w = buildCryptWeapon("Crypt Strike", t, ["Physical Pierce Perk"]);
    expect(w).toMatchObject({ vocation: "monk", category: "fist", attack: 45, element: null });
    expect(w?.attributes).toEqual(["fist fighting +4", "magic level +1"]);
  });

  it("recusa knight sem elemento de pierce e infobox incompleto", () => {
    expect(buildCryptWeapon("x", BREAKER, ["Physical Pierce Perk"])).toBeNull();
    expect(buildCryptWeapon("x", "sem infobox", [])).toBeNull();
  });

  it("só os níveis 3, 5 e 7 têm opções com pierce; knight soma 45% elemental", () => {
    const lv = knightPerks("fire");
    const has = (o: { pierce: { physical: number; elemental: number } }) =>
      o.pierce.physical + o.pierce.elemental > 0;
    expect(lv.filter((l) => l.options.some(has)).map((l) => l.level)).toEqual([3, 5, 7]);
    const elemental = [3, 5, 7].reduce(
      (s, n) => s + Math.max(...lv[n - 1].options.map((o) => o.pierce.elemental)),
      0,
    );
    expect(elemental).toBe(45);
    expect(lv[2].options[0].text).toBe("+10% Fire pierce");
  });

  it("ids seguem nivel.indice e o Monk só tem pierce físico (nível 7 com 1 opção)", () => {
    const m = monkPerks();
    expect(m).toHaveLength(7);
    expect(m[2].options.map((o) => o.id)).toEqual(["3.1", "3.2", "3.3"]);
    expect(m.flatMap((l) => l.options).every((o) => o.pierce.elemental === 0)).toBe(true);
    expect(m[6].options).toHaveLength(1);
  });

  it("pierceElementFromCategories ignora Physical", () => {
    expect(pierceElementFromCategories(["Physical Pierce Perk"])).toBeNull();
  });
});
