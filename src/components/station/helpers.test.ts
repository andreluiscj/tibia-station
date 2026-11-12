import { describe, expect, it } from "vitest";
import { buscar, indexar, normalizar } from "./busca";
import { filtrarHunts, huntsDaCriatura, nivelDaHunt } from "./huntsFiltro";
import { localDaHunt } from "./format";
import { descreverResist } from "./resist";
import { wikiUrl } from "./wiki";
import type { Hunt } from "@/lib/data/types";

describe("busca", () => {
  const idx = indexar(["Demon", "Hellflayer", "Hell Hound", "Dark Hellion", "Rat"], (s) => s);
  it("ignora acento e caixa", () => expect(normalizar("  Ráscunho ")).toBe("rascunho"));
  it("começo do nome vem antes de palavra no meio e de trecho solto", () => {
    expect(buscar(idx, "hell")).toEqual(["Hellflayer", "Hell Hound", "Dark Hellion"]);
  });
  it("palavra no meio vem antes de trecho solto", () => {
    expect(
      buscar(
        indexar(["Xhell", "A Hell"], (s) => s),
        "hell",
      ),
    ).toEqual(["A Hell", "Xhell"]);
  });
  it("consulta vazia devolve o começo da lista, limitado", () => {
    expect(buscar(idx, "", 2)).toEqual(["Demon", "Hellflayer"]);
  });
  it("limita o resultado", () => expect(buscar(idx, "e", 2)).toHaveLength(2));
});

const hunt = (name: string, k: number | null, m: number | null = null): Hunt => ({
  slug: name.toLowerCase(),
  name,
  wikiTitle: name,
  city: null,
  location: null,
  levelKnights: k,
  levelPaladins: null,
  levelMages: null,
  levelMonks: m,
  sourceUrl: "",
  expRaw: null,
  lootRaw: null,
  creatures: [],
});

describe("filtrarHunts", () => {
  const lista = [hunt("B", 200), hunt("A", 500), hunt("C", null, 450), hunt("D", null)];
  it("nível da hunt em 'todas' é o maior entre as vocações", () => {
    expect(nivelDaHunt(lista[2], "todas")).toBe(450);
    expect(nivelDaHunt(lista[3], "todas")).toBeNull();
  });
  it("ordena do nível maior para o menor, sem nível por último", () => {
    const nomes = filtrarHunts(lista, { voc: "todas", so450: false }).map((h) => h.name);
    expect(nomes).toEqual(["A", "C", "B", "D"]);
  });
  it("filtra por vocação e por 450+", () => {
    const nomes = (voc: "knight" | "todas" | "monk", so450: boolean) =>
      filtrarHunts(lista, { voc, so450 }).map((h) => h.name);
    expect(nomes("knight", false)).toEqual(["A", "B"]);
    expect(nomes("todas", true)).toEqual(["A", "C"]);
    expect(nomes("monk", true)).toEqual(["C"]);
  });
});

describe("descreverResist", () => {
  it("negativo absorve e a barra fica vazia", () => {
    expect(descreverResist(-200)).toEqual({ tipo: "absorve", texto: "Absorve (cura)", fill: 0 });
  });
  it("0 é imune, 100 é neutro", () => {
    expect(descreverResist(0).tipo).toBe("imune");
    expect(descreverResist(100).tipo).toBe("neutro");
  });
  it("abaixo de 100 resiste, acima é fraco", () => {
    expect(descreverResist(30).texto).toBe("Resiste 70%");
    expect(descreverResist(105).texto).toBe("Fraco (+5%)");
  });
  it("trunca a barra em 150 e trata null", () => {
    expect(descreverResist(400).fill).toBe(1);
    expect(descreverResist(null).tipo).toBe("sem-dado");
  });
});

describe("wikiUrl", () => {
  it("monta pelo título", () => {
    expect(wikiUrl("Earl Osam")).toBe("https://tibia.fandom.com/wiki/Earl_Osam");
  });
  it("só aceita sourceUrl de https://tibia.fandom.com/wiki/", () => {
    expect(wikiUrl("X", "javascript:alert(1)")).toBe("https://tibia.fandom.com/wiki/X");
    expect(wikiUrl("X", "https://exemplo.org/x")).toBe("https://tibia.fandom.com/wiki/X");
    expect(wikiUrl("X", "http://tibia.fandom.com/wiki/Y")).toBe("https://tibia.fandom.com/wiki/X");
    expect(wikiUrl("X", "https://tibia.fandom.com/wiki/Y_Z")).toBe(
      "https://tibia.fandom.com/wiki/Y_Z",
    );
  });
});

describe("localDaHunt", () => {
  it("tira pontuação solta do fim e junta cidade e local", () => {
    expect(localDaHunt("Marapur", "Inside Asura Citadel, ")).toBe("Marapur. Inside Asura Citadel");
    expect(localDaHunt(null, null)).toBe("");
  });
});

describe("huntsDaCriatura", () => {
  const com = (h: Hunt, ...slugs: string[]): Hunt => ({
    ...h,
    creatures: slugs.map((creatureSlug) => ({ creatureSlug, weight: 1 })),
  });
  const lista = [
    com(hunt("Baixa", 200), "demon"),
    com(hunt("Alta", 500), "demon", "rat"),
    com(hunt("Outra", 300), "rat"),
  ];
  it("só as hunts que têm a criatura, do nível mais alto para o mais baixo", () => {
    expect(huntsDaCriatura(lista, "demon").map((h) => h.name)).toEqual(["Alta", "Baixa"]);
  });
  it("criatura sem hunt devolve lista vazia", () => {
    expect(huntsDaCriatura(lista, "hellflayer")).toEqual([]);
  });
});
