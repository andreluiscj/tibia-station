import { describe, expect, it } from "vitest";
import { buildSeed, sqlNum, sqlText } from "./seed-sql";
import { knightPerks } from "./crypt-weapons";
import type { Creature, CryptWeapon, Hunt, Sources } from "../../src/lib/data/types";

describe("sqlText / sqlNum", () => {
  it("escapa aspas simples, remove NUL e converte null", () => {
    expect(sqlText("Ab'Dendriel")).toBe("'Ab''Dendriel'");
    expect(sqlText("x'; drop table creatures; --")).toBe("'x''; drop table creatures; --'");
    expect(sqlText("a" + String.fromCharCode(0) + "b")).toBe("'ab'");
    expect(sqlText(null)).toBe("NULL");
    expect(sqlNum(null)).toBe("NULL");
    expect(sqlNum(Number.NaN)).toBe("NULL");
    expect(sqlNum(-100)).toBe("-100");
  });
});

const creature: Creature = {
  slug: "foo",
  name: "Foo's",
  wikiTitle: "Foo's",
  sourceUrl: "https://tibia.fandom.com/wiki/Foo%27s",
  resistUnconfirmed: ["fire"],
  hp: 10,
  exp: null,
  bestiaryClass: null,
  bestiaryLevel: null,
  resist: {
    physical: 100,
    earth: null,
    fire: -50,
    energy: null,
    ice: null,
    holy: null,
    death: null,
    hpDrain: null,
    drown: null,
  },
};
const hunt: Hunt = {
  slug: "h",
  name: "H",
  wikiTitle: "H",
  sourceUrl: "https://tibia.fandom.com/wiki/H",
  city: null,
  location: null,
  levelKnights: 450,
  levelPaladins: null,
  levelMages: null,
  levelMonks: null,
  expRaw: null,
  lootRaw: null,
  creatures: [{ creatureSlug: "foo", weight: 2 }],
};
const weapon: CryptWeapon = {
  slug: "w",
  name: "W",
  wikiTitle: "W",
  vocation: "knight",
  category: "club",
  attack: 58,
  defense: 33,
  element: "fire",
  levelRequired: 450,
  imbuementSlots: 3,
  attributes: ["club fighting +4"],
  perks: knightPerks("fire"),
};
const info = {
  endpoint: "e",
  license: "CC-BY-SA",
  licenseUrl: null,
  attribution: "a",
  importedAt: "2026-11-11T00:00:00.000Z",
  count: 1,
  unconfirmedFields: ["perks"],
};
const sources: Sources = {
  schemaVersion: 1,
  importer: { name: "scripts/import-wiki.ts", version: "0.1.0" },
  datasets: { creatures: info, hunts: info, cryptWeapons: info },
};

describe("buildSeed", () => {
  const sql = buildSeed([creature], [hunt], [weapon], sources);
  it("é transacional, re-executável e só mexe em tabelas public novas", () => {
    expect(sql).toContain("begin;");
    expect(sql.trim().endsWith("commit;")).toBe(true);
    expect(sql).toContain("on conflict (slug) do update set");
    expect(sql).not.toMatch(
      /truncate|drop table|delete from|storage[.]|public[.](weapons_melee|armor)/i,
    );
  });
  it("não gera linha de resistência para valor desconhecido; mantém negativos", () => {
    expect(sql).toContain("('foo', 'fire', -50, false)");
    expect(sql).toContain("('foo', 'physical', 100, true)");
    expect(sql).not.toContain("'earth'");
  });
  it("gera hunt_creatures, atributos como array e perks com índice do id", () => {
    expect(sql).toContain("('h', 'foo', 2)");
    expect(sql).toContain("ARRAY['club fighting +4']::text[]");
    expect(sql).toContain("('w', 3, 1, '+10% Fire pierce', 0, 10)");
    expect(sql).toContain("('w', 3, 3, '+6% Physical pierce', 6, 0)");
    expect(sql).toContain("'Foo''s'");
    expect(sql).toContain("'https://tibia.fandom.com/wiki/H'");
    expect(sql).toContain("ARRAY['perks']::text[]");
  });
});
