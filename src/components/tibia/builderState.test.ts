import { describe, expect, it } from "vitest";
import type { Item } from "@/lib/tibia";
import {
  ESTADO_INICIAL,
  acharImbuiment,
  definirImbuiment,
  ekDuasMaos,
  escolherClasse,
  escolherNivel,
  escolherProtecao,
  escolherVocacao,
  espacosDeImbuiment,
  filtrosDe,
  imbuimentosEquipados,
  itensDoSlot,
  layoutDoSet,
  limparSet,
  pickSet,
  setParaStats,
  tabelasDaVocacao,
  trocarItem,
  type BuilderState,
  type DataByTable,
} from "./builderState";

const item = (id: number, item_name: string, extra: Partial<Item> = {}): Item => ({
  id,
  item_name,
  level_minimum: 0,
  vocation: 0,
  ...extra,
});

// Dados mínimos de um EK: 2 armas (uma de 2 mãos), 2 elmos, 1 escudo, 1 mochila, 1 anel.
const dados: DataByTable = {
  weapons_melee: [
    item(1, "Fire Axe", { level_minimum: 35, class: 1, hand: 1, physical_attack: 30 }),
    item(2, "Giant Smithhammer", { level_minimum: 200, class: 2, hand: 2, physical_attack: 60 }),
    item(3, "War Axe", { level_minimum: 200, class: 1, hand: 2, physical_attack: 55 }),
  ],
  helmet: [
    item(10, "Steel Helmet", { level_minimum: 20, arm: 6, fire: 0 }),
    item(11, "Fire Helmet", { level_minimum: 100, arm: 5, fire: 0.1 }),
    item(12, "Mage Hat", { level_minimum: 100, vocation: 4, arm: 9 }),
  ],
  shields_ek: [item(20, "Tower Shield", { level_minimum: 40, def: 30 })],
  backpack: [item(30, "Backpack"), item(31, "Backpack of Holding", { level_minimum: 1 })],
  ring: [item(40, "Axe Ring", { class: 1 }), item(41, "Club Ring", { class: 2 })],
  imbuiment: [],
};

const ek: BuilderState = escolherVocacao(ESTADO_INICIAL, "EK");

describe("tabelasDaVocacao", () => {
  it("sem vocação não pede nenhuma tabela", () => {
    expect(tabelasDaVocacao(null)).toEqual([]);
  });
  it("EK pede armas de corpo a corpo, escudo de EK e a tabela de imbuiments", () => {
    const t = tabelasDaVocacao("EK");
    expect(t).toContain("weapons_melee");
    expect(t).toContain("shields_ek");
    expect(t).toContain("imbuiment");
  });
  it("EM não tem tabela de escudo", () => {
    const t = tabelasDaVocacao("EM");
    expect(t).toContain("weapons_hand");
    expect(t.some((x) => x.startsWith("shields"))).toBe(false);
  });
  it("não repete tabelas", () => {
    const t = tabelasDaVocacao("MS");
    expect(new Set(t).size).toBe(t.length);
  });
});

describe("escolherVocacao", () => {
  it("zera nível, proteção, set e imbuiments; EK começa na classe 1 (Axe)", () => {
    const sujo: BuilderState = {
      ...ek,
      level: 400,
      protection: "fire",
      selected: { helmet: dados.helmet[0] },
      imbuiments: { helmet: ["Void"] },
    };
    expect(escolherVocacao(sujo, "RP")).toEqual({
      vocation: "RP",
      level: 0,
      protection: null,
      ekClass: null,
      selected: {},
      imbuiments: {},
    });
    expect(escolherVocacao(sujo, "EK").ekClass).toBe(1);
  });
});

describe("pickSet", () => {
  const filtros = { vocation: "EK" as const, level: 150, ekClass: 1 };
  it("escolhe o item de maior nível que o filtro permite em cada slot com tabela", () => {
    const s = pickSet(dados, filtros, null);
    expect(s.weapon?.item_name).toBe("Fire Axe"); // War Axe (nível 200) passa do nível 150
  });
  it("ignora itens de outra vocação (bitmask) e acima do nível", () => {
    const s = pickSet(dados, filtros, null);
    expect(s.helmet?.item_name).toBe("Fire Helmet"); // Mage Hat é de MS
  });
  it("mochila: sempre a Backpack of Holding quando existe", () => {
    expect(pickSet(dados, filtros, null).backpack?.item_name).toBe("Backpack of Holding");
  });
  it("com foco de proteção, a maior proteção vence mesmo com armadura menor", () => {
    const s = pickSet(dados, filtros, "fire");
    expect(s.helmet?.item_name).toBe("Fire Helmet");
    const sem = pickSet(
      { ...dados, helmet: [dados.helmet[0], dados.helmet[1]] },
      { ...filtros, level: 20 },
      "fire",
    );
    expect(sem.helmet?.item_name).toBe("Steel Helmet"); // Fire Helmet exige nível 100
  });
  it("slot sem tabela ou sem item compatível fica de fora", () => {
    const s = pickSet(dados, { vocation: "EM", level: 0, ekClass: null }, null);
    expect(s.shield).toBeUndefined();
    expect(s.weapon).toBeUndefined();
  });
});

describe("escolherNivel", () => {
  it("enquanto os dados carregam, nada muda (o botão fica desabilitado e o clique não faz nada)", () => {
    const antes: BuilderState = { ...ek, protection: "fire" };
    expect(escolherNivel(antes, 400, dados, true)).toBe(antes);
  });
  it("define o nível, tira o foco de proteção e monta o set com esse nível", () => {
    const depois = escolherNivel({ ...ek, protection: "fire" }, 400, dados, false);
    expect(depois.level).toBe(400);
    expect(depois.protection).toBeNull();
    expect(depois.selected.weapon?.item_name).toBe("War Axe");
    expect(depois.selected.backpack?.item_name).toBe("Backpack of Holding");
  });
  it("sem vocação só guarda o nível e mantém o set", () => {
    const depois = escolherNivel(ESTADO_INICIAL, 300, dados, false);
    expect(depois.level).toBe(300);
    expect(depois.selected).toEqual({});
  });
  it("não mexe nos imbuiments nem na classe", () => {
    const antes: BuilderState = { ...ek, ekClass: 2, imbuiments: { helmet: ["Void"] } };
    const depois = escolherNivel(antes, 400, dados, false);
    expect(depois.imbuiments).toEqual({ helmet: ["Void"] });
    expect(depois.ekClass).toBe(2);
  });
});

describe("escolherProtecao", () => {
  it("enquanto carrega, nada muda", () => {
    expect(escolherProtecao(ek, "fire", dados, true)).toBe(ek);
  });
  it("mantém o nível e refaz o set com o foco de proteção", () => {
    const depois = escolherProtecao({ ...ek, level: 100 }, "fire", dados, false);
    expect(depois.level).toBe(100);
    expect(depois.protection).toBe("fire");
    expect(depois.selected.helmet?.item_name).toBe("Fire Helmet");
  });
});

describe("escolherClasse, limparSet e trocarItem", () => {
  it("trocar a classe do EK não refaz o set", () => {
    const montado = escolherNivel(ek, 400, dados, false);
    const depois = escolherClasse(montado, 2);
    expect(depois.ekClass).toBe(2);
    expect(depois.selected).toBe(montado.selected);
  });
  it("limpar zera set, imbuiments, nível e proteção, mas mantém vocação e classe", () => {
    const sujo: BuilderState = {
      ...escolherNivel(ek, 400, dados, false),
      protection: "ice",
      imbuiments: { weapon: ["Strike"] },
    };
    expect(limparSet(sujo)).toEqual({
      ...ek,
      selected: {},
      imbuiments: {},
      level: 0,
      protection: null,
    });
  });
  it("trocar coloca o item no slot e null remove", () => {
    const comItem = trocarItem(ek, "helmet", dados.helmet[0]);
    expect(comItem.selected.helmet?.item_name).toBe("Steel Helmet");
    expect(trocarItem(comItem, "helmet", null).selected.helmet).toBeUndefined();
  });
});

describe("definirImbuiment", () => {
  const comArma: BuilderState = trocarItem(ek, "weapon", item(5, "Arma 3 slots", { imbuiment: 3 }));
  it("cria a lista com o tamanho de slots do item e preenche a posição", () => {
    expect(definirImbuiment(comArma, "weapon", 1, "Void").imbuiments.weapon).toEqual([
      null,
      "Void",
      null,
    ]);
  });
  it("mantém os outros e permite remover com null", () => {
    const a = definirImbuiment(comArma, "weapon", 0, "Strike");
    const b = definirImbuiment(a, "weapon", 2, "Vampirism");
    expect(b.imbuiments.weapon).toEqual(["Strike", null, "Vampirism"]);
    expect(definirImbuiment(b, "weapon", 0, null).imbuiments.weapon).toEqual([
      null,
      null,
      "Vampirism",
    ]);
  });
  it("corta a lista quando o item novo tem menos slots", () => {
    const a = definirImbuiment(comArma, "weapon", 2, "Void");
    const menor = { ...a, selected: { weapon: item(6, "Arma 1 slot", { imbuiment: 1 }) } };
    expect(definirImbuiment(menor, "weapon", 0, "Strike").imbuiments.weapon).toEqual(["Strike"]);
  });
});

describe("itensDoSlot (diálogo de troca)", () => {
  const filtros = { vocation: "EK" as const, level: 0, ekClass: null };
  it("sem nível definido lista tudo da vocação, em nível crescente e depois id", () => {
    expect(itensDoSlot(dados, "helmet", filtros, "").map((i) => i.item_name)).toEqual([
      "Steel Helmet",
      "Fire Helmet",
    ]);
  });
  it("busca ignora caixa e espaços nas pontas", () => {
    expect(itensDoSlot(dados, "helmet", filtros, "  FIRE ").map((i) => i.item_name)).toEqual([
      "Fire Helmet",
    ]);
  });
  it("com classe do EK, armas e anéis de outra classe somem", () => {
    const axe = itensDoSlot(dados, "weapon", { ...filtros, ekClass: 1 }, "").map(
      (i) => i.item_name,
    );
    expect(axe).toEqual(["Fire Axe", "War Axe"]);
    expect(
      itensDoSlot(dados, "ring", { ...filtros, ekClass: 2 }, "").map((i) => i.item_name),
    ).toEqual(["Club Ring"]);
  });
  it("o nível filtra itens acima dele", () => {
    expect(
      itensDoSlot(dados, "weapon", { ...filtros, level: 100 }, "").map((i) => i.item_name),
    ).toEqual(["Fire Axe"]);
  });
});

describe("layoutDoSet", () => {
  const porId = (s: BuilderState) => Object.fromEntries(layoutDoSet(s).map((v) => [v.id, v]));
  it("mostra 10 slots; o EM troca o escudo pela arma repetida", () => {
    const em = trocarItem(escolherVocacao(ESTADO_INICIAL, "EM"), "weapon", item(7, "Punho"));
    const v = layoutDoSet(em);
    expect(v).toHaveLength(10);
    expect(v.find((x) => x.id === "shield")).toBeUndefined();
    const dup = v.find((x) => x.id === "weapon-2")!;
    expect(dup.slot).toBe("weapon");
    expect([dup.row, dup.col]).toEqual([2, 3]); // onde ficaria o escudo
    expect(dup.item?.item_name).toBe("Punho");
  });
  it("EK com arma de duas mãos bloqueia o escudo e esconde o item dele", () => {
    const duas = trocarItem(
      trocarItem(ek, "shield", dados.shields_ek[0]),
      "weapon",
      dados.weapons_melee[1],
    );
    expect(ekDuasMaos(duas)).toBe(true);
    const escudo = porId(duas).shield;
    expect(escudo.blocked).toBe(true);
    expect(escudo.item).toBeUndefined();
  });
  it("EK com arma de uma mão mantém o escudo livre", () => {
    const uma = trocarItem(
      trocarItem(ek, "shield", dados.shields_ek[0]),
      "weapon",
      dados.weapons_melee[0],
    );
    expect(porId(uma).shield.blocked).toBe(false);
    expect(porId(uma).shield.item?.item_name).toBe("Tower Shield");
  });
  it("vocações com escudo (RP, MS, ED) não escondem nem bloqueiam o slot", () => {
    for (const v of ["RP", "MS", "ED"] as const) {
      const s = porId(escolherVocacao(ESTADO_INICIAL, v)).shield;
      expect(s.hidden).toBe(false);
      expect(s.blocked).toBe(false);
    }
  });
  it("sem vocação a grade aparece completa (e travada pela tela)", () => {
    expect(layoutDoSet(ESTADO_INICIAL).every((x) => !x.hidden && !x.blocked)).toBe(true);
  });
  it("posições seguem a grade 3 colunas com as botas no meio da linha 4", () => {
    const b = porId(ek).boots;
    expect([b.row, b.col]).toEqual([4, 2]);
  });
});

describe("setParaStats", () => {
  it("arma de duas mãos tira o escudo das contas; o resto fica", () => {
    const s = trocarItem(
      trocarItem(ek, "shield", dados.shields_ek[0]),
      "weapon",
      dados.weapons_melee[1],
    );
    const r = setParaStats(s);
    expect(r.shield).toBeUndefined();
    expect(r.weapon?.item_name).toBe("Giant Smithhammer");
  });
  it("sem arma de duas mãos devolve o set como está", () => {
    const s = trocarItem(ek, "shield", dados.shields_ek[0]);
    expect(setParaStats(s)).toBe(s.selected);
  });
});

describe("imbuiments equipados", () => {
  const linhas: Item[] = [
    item(1, "x", { imbuiment_name: "Powerful Void", arm: 1 }),
    item(2, "y", { imbuiment_name: "Intricate Strike" }),
    item(3, "z", { imbuiment_name: "Basic Vampirism" }),
  ];
  it("acha pelo nome do catálogo: igual, terminando com o nome ou contendo, sem ligar para caixa", () => {
    expect(acharImbuiment(linhas, "Void")?.id).toBe(1);
    expect(acharImbuiment(linhas, "strike")?.id).toBe(2);
    expect(acharImbuiment(linhas, "Epiphany")).toBeNull();
  });
  it("junta só os que existem na tabela e ignora espaços vazios", () => {
    const eq = imbuimentosEquipados(
      { weapon: ["Void", null, "Epiphany"], helmet: ["Vampirism"] },
      linhas,
    );
    expect(eq.map((r) => r.id)).toEqual([1, 3]);
  });
});

describe("espacosDeImbuiment", () => {
  const arma = item(1, "A", { imbuiment: 3 });
  it("usa o campo imbuiment do item", () =>
    expect(espacosDeImbuiment("weapon", arma, false)).toBe(3));
  it("botas, slot bloqueado e slot vazio não têm espaços", () => {
    expect(espacosDeImbuiment("boots", arma, false)).toBe(0);
    expect(espacosDeImbuiment("weapon", arma, true)).toBe(0);
    expect(espacosDeImbuiment("weapon", undefined, false)).toBe(0);
  });
});

describe("filtrosDe", () => {
  it("só o EK leva a classe nos filtros", () => {
    expect(filtrosDe({ ...ek, level: 400, ekClass: 2 })).toEqual({
      vocation: "EK",
      level: 400,
      ekClass: 2,
    });
    expect(filtrosDe({ ...escolherVocacao(ESTADO_INICIAL, "RP"), ekClass: 2 })?.ekClass).toBeNull();
    expect(filtrosDe(ESTADO_INICIAL)).toBeNull();
  });
});
