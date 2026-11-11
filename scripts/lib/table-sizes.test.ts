import { describe, expect, it } from "vitest";
import { PAGE_LIMIT_WARN, duplicateSlugs, sizeVerdict } from "./table-sizes";

describe("duplicateSlugs", () => {
  it("conta nomes que compartilham o slug (maiúsculas, acentos e símbolos não distinguem)", () => {
    const r = duplicateSlugs([
      "Magic Sword",
      "magic sword",
      "Crystal Mace",
      "Crystal-Mace!",
      "Spear",
      null,
      "",
    ]);
    expect(r).toEqual([
      { slug: "crystal-mace", names: ["Crystal Mace", "Crystal-Mace!"] },
      { slug: "magic-sword", names: ["Magic Sword", "magic sword"] },
    ]);
  });

  it("sem duplicatas devolve lista vazia", () => {
    expect(duplicateSlugs(["A", "B"])).toEqual([]);
  });
});

describe("sizeVerdict", () => {
  it("alerta a partir de PAGE_LIMIT_WARN linhas (limite padrão do Supabase é 1000)", () => {
    expect(PAGE_LIMIT_WARN).toBe(900);
    expect(sizeVerdict(899)).toBe("ok");
    expect(sizeVerdict(900)).toBe("paginar");
    expect(sizeVerdict(1000)).toBe("paginar");
  });
});
