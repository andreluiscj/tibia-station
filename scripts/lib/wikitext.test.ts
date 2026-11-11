import { describe, expect, it } from "vitest";
import {
  extractCreatureList,
  extractLinks,
  parseInfobox,
  isUnconfirmed,
  parseInteger,
  parsePercent,
  plain,
  slugify,
} from "./wikitext";

describe("parseInfobox", () => {
  it("lê parâmetros simples e ignora o que não é chave", () => {
    const t =
      "{{Infobox Creature|List={{{1|}}}\n| name = Hellflayer\n| hp = 14000\n| fireDmgMod = 30%\n}}\ntexto";
    expect(parseInfobox(t, "Infobox Creature")).toMatchObject({
      name: "Hellflayer",
      hp: "14000",
      fireDmgMod: "30%",
    });
  });

  it("respeita templates e links aninhados com | dentro", () => {
    const t =
      "{{Infobox Hunt\n| location = Near [[Kha'zeel Pass|pass]] {{Mapper Coords|1|2|7|4|text=here}}.\n| city = Port Hope\n}}";
    const r = parseInfobox(t, "Infobox Hunt");
    expect(r?.city).toBe("Port Hope");
    expect(r?.location).toContain("Mapper Coords|1|2");
  });

  it("retorna null sem infobox ou com infobox truncado", () => {
    expect(parseInfobox("#REDIRECT [[Foo]]", "Infobox Creature")).toBeNull();
    expect(parseInfobox("{{Infobox Creature\n| name = X", "Infobox Creature")).toBeNull();
  });

  it("não confunde Infobox Creature com outro template de nome parecido", () => {
    expect(parseInfobox("{{Infobox Creature List|a=b}}", "Infobox Creature")).toBeNull();
  });
});

describe("parsePercent / parseInteger", () => {
  it.each([
    ["30%", 30],
    [" 105 % ", 105],
    ["0%", 0],
    ["12,5%", 12.5],
    ["100%?", 100],
    ["0%?", 0],
    ["101%>?", 101],
    ["99%<?", 99],
    ["--", null],
    ["", null],
    ["abc", null],
    [undefined, null],
  ])("parsePercent(%j) = %j", (i, o) => expect(parsePercent(i as string | undefined)).toBe(o));

  it.each([
    ["14000", 14000],
    ["14,000", 14000],
    ["35000<!-- estimation -->", 35000],
    ["10000?", 10000],
    ["30000+", 30000],
    ["20000~", 20000],
    ["0 <!-- objectID: 52546-->", 0],
    ["∞", null],
    ["?", null],
    ["", null],
    [undefined, null],
  ])("parseInteger(%j) = %j", (i, o) => expect(parseInteger(i as string | undefined)).toBe(o));
});

describe("extractLinks / extractCreatureList", () => {
  it("extrai alvos de links, com pipe e âncora, sem arquivos/categorias", () => {
    const t =
      "[[Hydra]] e [[Midnight Asura|Midnight Asuri]] [[Foo#bar]] [[File:x.gif]] [[Category:Y]]";
    expect(extractLinks(t)).toEqual(["Hydra", "Midnight Asura", "Foo"]);
  });

  it("conta cada aparição em CreatureList (várias listas, por andar)", () => {
    const t =
      "{{CreatureList|type=List/Sorted\n |Lich\n |Hydra\n}}\n{{CreatureList\n |Hydra\n |Hellspawn\n}}";
    expect(extractCreatureList(t)).toEqual(["Lich", "Hydra", "Hydra", "Hellspawn"]);
  });
});

describe("plain / slugify", () => {
  it("limpa marcação", () => {
    expect(plain("'''Very''' [[Good|good]] <!-- x --> {{foo}}")).toBe("Very good");
  });
  it("gera slug estável", () => {
    expect(slugify("Ab'Dendriel Elf Cave")).toBe("abdendriel-elf-cave");
    expect(slugify("Dawnfire Asura")).toBe("dawnfire-asura");
  });
});

describe("plain: links externos de colchete simples", () => {
  it("troca [url texto] só pelo texto e remove [url] sem texto", () => {
    expect(plain("Near [http://tibia.wikia.com/wiki/Mapper?coords=1,2 here]")).toBe("Near here");
    expect(plain("a [https://x.example/p?q=1 b c] d")).toBe("a b c d");
    expect(plain("a [//x.example/p] d")).toBe("a  d");
    expect(plain("[[Thais]] and [http://x.example link]")).toBe("Thais and link");
  });
  it("nunca deixa uma URL externa no resultado", () => {
    expect(plain("[http://evil.example/x click] [https://evil.example/y]")).not.toMatch(
      /https?:|evil/,
    );
  });
});

describe("isUnconfirmed", () => {
  it.each([
    ["100%?", true],
    ["101%>?", true],
    ["99%<?", true],
    ["100%", false],
    ["30%", false],
    ["", false],
    [undefined, false],
    ["100%<!-- c -->", false],
  ])("isUnconfirmed(%j) = %j", (i, o) => expect(isUnconfirmed(i as string | undefined)).toBe(o));
});
