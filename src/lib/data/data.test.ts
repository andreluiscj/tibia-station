import { describe, expect, it } from "vitest";
import {
  getCreature,
  getCreatures,
  getCryptWeapon,
  getCryptWeapons,
  getHunt,
  getHunts,
  getSources,
} from "./index";

describe("camada de dados (JSON empacotados)", () => {
  it("slugs são únicos em criaturas, hunts e armas", async () => {
    for (const list of [await getCreatures(), await getHunts(), await getCryptWeapons()]) {
      expect(new Set(list.map((i) => i.slug)).size).toBe(list.length);
    }
  });

  it("getters por slug devolvem o item ou null (nunca lançam por não encontrado)", async () => {
    expect((await getCreature("hellflayer"))?.resist.fire).toBe(30);
    expect(await getCreature("slug-inexistente")).toBeNull();
    expect(await getCreature("")).toBeNull();
    expect((await getHunt("asura-palace"))?.name).toBe("Asura Palace");
    expect(await getHunt("slug-inexistente")).toBeNull();
  });

  it("só há criaturas reais do jogo: todas têm classe no Bestiary", async () => {
    const lista = await getCreatures();
    expect(lista.every((c) => c.bestiaryClass)).toBe(true);
    expect(await getCreature("doctor-marrow")).toBeNull();
  });

  it("toda criatura de hunt existe em creatures.json, sem repetição, com peso > 0", async () => {
    for (const h of await getHunts()) {
      const seen = new Set<string>();
      for (const hc of h.creatures) {
        expect(
          await getCreature(hc.creatureSlug),
          `${h.slug} -> ${hc.creatureSlug}`,
        ).not.toBeNull();
        expect(seen.has(hc.creatureSlug)).toBe(false);
        seen.add(hc.creatureSlug);
        expect(hc.weight).toBeGreaterThan(0);
      }
    }
  });

  it("as 9 chaves de resist sempre existem; valores finitos (negativo = absorve) ou null", async () => {
    for (const c of await getCreatures()) {
      expect(Object.keys(c.resist).sort()).toEqual([
        "death",
        "drown",
        "earth",
        "energy",
        "fire",
        "holy",
        "hpDrain",
        "ice",
        "physical",
      ]);
      for (const v of Object.values(c.resist)) expect(v === null || Number.isFinite(v)).toBe(true);
    }
  });

  it("4 armas Crypt com 7 níveis, batendo com a wiki (atk/def/elemento)", async () => {
    const ws = await getCryptWeapons();
    expect(ws).toHaveLength(4);
    for (const w of ws) expect(w.perks.map((p) => p.level)).toEqual([1, 2, 3, 4, 5, 6, 7]);
    const by = Object.fromEntries(ws.map((x) => [x.slug, x]));
    expect([
      by["crypt-breaker"].attack,
      by["crypt-breaker"].defense,
      by["crypt-breaker"].element,
    ]).toEqual([58, 33, "fire"]);
    expect(by["crypt-slicer"].element).toBe("earth");
    expect(by["crypt-splitter"].element).toBe("energy");
    expect([
      by["crypt-strike"].attack,
      by["crypt-strike"].defense,
      by["crypt-strike"].element,
    ]).toEqual([45, 20, null]);
  });

  it("sources registra licença CC BY-SA, atribuição e contagens dos 3 datasets", async () => {
    const s = await getSources();
    expect(s.schemaVersion).toBe(1);
    expect(s.datasets.creatures.license).toMatch(/CC.?BY.?SA/i);
    expect(s.datasets.cryptWeapons.attribution).toContain("PLANO.md");
    expect(Number.isNaN(Date.parse(s.datasets.hunts.importedAt))).toBe(false);
  });
});

describe("atribuição e dados não confirmados", () => {
  it("toda criatura e hunt tem sourceUrl da wiki; nenhum texto carrega URL externa", async () => {
    for (const c of await getCreatures())
      expect(c.sourceUrl.startsWith("https://tibia.fandom.com/wiki/")).toBe(true);
    for (const h of await getHunts()) {
      expect(h.sourceUrl.startsWith("https://tibia.fandom.com/wiki/")).toBe(true);
      for (const v of [h.location, h.expRaw, h.lootRaw, h.city])
        expect(v ?? "").not.toMatch(/https?:|\/\/|\[http/);
    }
    expect((await getCreature("hellflayer"))?.sourceUrl).toBe(
      "https://tibia.fandom.com/wiki/Hellflayer",
    );
  });

  it("resistUnconfirmed só cita elementos com número em resist", async () => {
    for (const c of await getCreatures())
      for (const el of c.resistUnconfirmed) expect(c.resist[el]).not.toBeNull();
  });

  it("getCryptWeapon devolve a arma ou null", async () => {
    expect((await getCryptWeapon("crypt-strike"))?.element).toBeNull();
    expect(await getCryptWeapon("nao-existe")).toBeNull();
  });

  it("sources: licença CC BY-SA 3.0 com link e perks marcados como não confirmados", async () => {
    const s = (await getSources()).datasets;
    expect(s.creatures.license).toBe("CC BY-SA 3.0");
    expect(s.creatures.licenseUrl).toBe("https://creativecommons.org/licenses/by-sa/3.0/");
    expect(s.cryptWeapons.unconfirmedFields).toEqual(["perks"]);
    expect(s.creatures.unconfirmedFields).toEqual([]);
  });
});
