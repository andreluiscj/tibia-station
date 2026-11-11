import { describe, expect, it } from "vitest";
import { checkSprites, spritePath, summarize } from "./verify-buckets-core";

const items = [
  { table: "weapons_melee", name: "Sword" },
  { table: "armor", name: "Plate Armor" },
  { table: "helmet", name: "Ghost Helmet" },
];
const urlFor = (name: string) =>
  `https://proj.example/storage/v1/object/public/Itens%20Sprites/${name.toLowerCase().replace(/ /g, "-")}.gif`;

describe("spritePath", () => {
  it("devolve só bucket/arquivo, sem o host", () => {
    expect(spritePath(urlFor("Plate Armor"))).toBe("Itens Sprites/plate-armor.gif");
    expect(spritePath("https://x.example/outra-coisa")).toBe("(url fora do padrão)");
  });
});

describe("checkSprites", () => {
  it("consulta cada item e mantém a ordem; 200 é ok", async () => {
    const seen: string[] = [];
    const head = async (url: string) => {
      seen.push(url);
      return url.includes("plate") ? 404 : 200;
    };
    const out = await checkSprites(items, urlFor, head, 2);
    expect(out.map((c) => [c.name, c.status])).toEqual([
      ["Sword", 200],
      ["Plate Armor", 404],
      ["Ghost Helmet", 200],
    ]);
    expect(seen).toHaveLength(3);
  });

  it("erro de rede vira status null com mensagem curta, sem a URL", async () => {
    const out = await checkSprites(items.slice(0, 1), urlFor, async () => {
      throw new Error("boom https://proj.example/secret");
    });
    expect(out[0].status).toBeNull();
    expect(out[0].error).toBe("falha de rede");
    expect(JSON.stringify(out)).not.toContain("proj.example");
  });

  it("respeita o limite de concorrência", async () => {
    let active = 0;
    let peak = 0;
    const head = async () => {
      active++;
      peak = Math.max(peak, active);
      await new Promise((r) => setTimeout(r, 5));
      active--;
      return 200;
    };
    const many = Array.from({ length: 12 }, (_, i) => ({ table: "armor", name: `i${i}` }));
    await checkSprites(many, urlFor, head, 3);
    expect(peak).toBeLessThanOrEqual(3);
  });
});

describe("summarize", () => {
  it("conta ok e lista os que falharam pelo nome", () => {
    const s = summarize([
      { table: "armor", name: "A", path: "p/a.gif", status: 200 },
      { table: "armor", name: "B", path: "p/b.gif", status: 404 },
      { table: "helmet", name: "C", path: "p/c.gif", status: null, error: "falha de rede" },
    ]);
    expect(s).toMatchObject({ total: 3, ok: 1 });
    expect(s.failed.map((f) => f.name)).toEqual(["B", "C"]);
  });
});
