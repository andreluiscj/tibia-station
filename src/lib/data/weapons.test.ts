import { describe, expect, it } from "vitest";
import { armasDeHand, armasDeMelee } from "./weapons";

const melee = (extra: Record<string, unknown>) => ({
  imbuiment: 2,
  item_name: "Arma",
  level_minimum: 100,
  class: 1,
  vocation: 1,
  physical_attack: 40,
  ...extra,
});

describe("armasDeMelee (weapons_melee)", () => {
  it("class 1/2/3 viram axe/club/sword e o ataque físico e elementar é mapeado", () => {
    const r = armasDeMelee([
      melee({ item_name: "Machado de Gelo", class: 1, ice_attack: 47 }),
      melee({ item_name: "Maça", class: 2 }),
      melee({ item_name: "Espada", class: 3, fire_attack: 10, earth_attack: 30 }),
    ]);
    expect(r.map((a) => [a.slug, a.category])).toEqual([
      ["machado-de-gelo", "axe"],
      ["maca", "club"],
      ["espada", "sword"],
    ]);
    expect(r[0]).toMatchObject({
      vocation: "knight",
      attack: 40,
      element: "ice",
      levelRequired: 100,
    });
    expect(r[0].elements).toEqual({ ice: 47 });
    expect(r[1].element).toBeNull();
    expect(r[2].element).toBe("earth"); // o maior ataque elementar é o que aparece
    expect(r[2].elements).toEqual({ fire: 10, earth: 30 });
  });
  it("ignora linhas inválidas: sem nome, class desconhecida, sem ataque ou de outra vocação", () => {
    const r = armasDeMelee([
      melee({ item_name: "" }),
      melee({ item_name: "Sem classe", class: null }),
      melee({ item_name: "Classe 9", class: 9 }),
      melee({ item_name: "Sem ataque", physical_attack: null }),
      melee({ item_name: "Só mago", vocation: 4 }),
      melee({ item_name: "Valor ruim", physical_attack: "x" }),
      melee({ item_name: "Boa", vocation: 0 }),
      melee({ item_name: "Boa EK+RP", vocation: 3 }),
    ]);
    expect(r.map((a) => a.name)).toEqual(["Boa", "Boa EK+RP"]);
  });
  it("imbuiment vira o número de espaços; ausente fica null", () => {
    expect(armasDeMelee([melee({})])[0].imbuementSlots).toBe(2);
    expect(armasDeMelee([melee({ imbuiment: null })])[0].imbuementSlots).toBeNull();
    expect(armasDeHand([{ item_name: "L", attack: 5, imbuiment: 3 }])[0].imbuementSlots).toBe(3);
  });
  it("bit 1 (EK) serve ao Knight; linha só de RP/MS/ED/Monk fica de fora; 0 e nulo servem a todos", () => {
    const n = (vocation: unknown) => armasDeMelee([melee({ vocation })]).length;
    expect([n(1), n(3), n(0), n(null)]).toEqual([1, 1, 1, 1]);
    expect([n(2), n(4), n(8), n(16), n(30)]).toEqual([0, 0, 0, 0, 0]);
  });
  it("tira o sufixo de classe do nome e do slug do sprite; outros parênteses ficam", () => {
    const r = armasDeMelee([
      melee({ item_name: "Souleater (Axe)" }),
      melee({ item_name: "Espada Rara (sword)", class: 3 }),
      melee({ item_name: "Maça (Club) ", class: 2 }),
      melee({ item_name: "Arma (Quest)" }),
    ]);
    expect(r.map((a) => [a.name, a.slug])).toEqual([
      ["Souleater", "souleater"],
      ["Espada Rara", "espada-rara"],
      ["Maça", "maca"],
      ["Arma (Quest)", "arma-quest"],
    ]);
  });
  it("nível ausente vira 0", () => {
    expect(armasDeMelee([melee({ level_minimum: null })])[0].levelRequired).toBe(0);
  });
});

describe("armasDeHand (weapons_hand)", () => {
  it("armas do Monk viram fist com o ataque da tabela", () => {
    const r = armasDeHand([
      { item_name: "Luva", attack: 33, level_minimum: 200 },
      { item_name: "Sem ataque", attack: null },
      { item_name: "", attack: 5 },
    ]);
    expect(r).toHaveLength(1);
    expect(r[0]).toMatchObject({
      slug: "luva",
      vocation: "monk",
      category: "fist",
      attack: 33,
      element: null,
      levelRequired: 200,
    });
  });

  it("damage_type 1..5 vira o elemento (todo o ataque é dele); 6, nulo e desconhecido são Physical", () => {
    const casos: [number | null, string | null][] = [
      [1, "fire"],
      [2, "energy"],
      [3, "ice"],
      [4, "earth"],
      [5, "death"],
      [6, null],
      [null, null],
      [99, null],
    ];
    for (const [damage_type, el] of casos) {
      const [a] = armasDeHand([{ item_name: "Luva", attack: 30, damage_type }]);
      expect(a.element).toBe(el);
      if (el) {
        expect(a.elements).toEqual({ [el]: 30 });
        expect(a.attack).toBe(0);
      } else {
        expect(a.elements).toEqual({});
        expect(a.attack).toBe(30);
      }
    }
  });
  it("vocation: bit 16 serve ao Monk; 0, nulo ou ausente servem a todos; EK-only fica de fora", () => {
    const l = (vocation: unknown) => ({ item_name: "L", attack: 5, vocation });
    expect(armasDeHand([l(16), l(31), l(0), l(null)])).toHaveLength(4);
    expect(armasDeHand([l(1), l(2 | 4 | 8)])).toHaveLength(0);
  });
});
