import { describe, expect, it } from "vitest";
import { MAX_BYTES, readJsonLimited, sameHostRedirect } from "./wiki-client";

describe("sameHostRedirect", () => {
  it("aceita redirect relativo e absoluto dentro de tibia.fandom.com", () => {
    expect(sameHostRedirect("https://tibia.fandom.com/api.php?a=1", "/api.php?a=2")).toBe(
      "https://tibia.fandom.com/api.php?a=2",
    );
    expect(sameHostRedirect("https://tibia.fandom.com/api.php", "https://tibia.fandom.com/x")).toBe(
      "https://tibia.fandom.com/x",
    );
  });
  it("recusa outro host, http simples, host parecido e Location ausente", () => {
    for (const loc of [
      "https://evil.example/api.php",
      "http://tibia.fandom.com/x",
      "https://tibia.fandom.com.evil.io/",
    ]) {
      expect(() => sameHostRedirect("https://tibia.fandom.com/api.php", loc)).toThrow(
        /não permitido/,
      );
    }
    expect(() => sameHostRedirect("https://tibia.fandom.com/api.php", null)).toThrow(
      /sem Location/,
    );
  });
});

describe("readJsonLimited", () => {
  it("lê JSON normal", async () => {
    const r = await readJsonLimited(new Response(JSON.stringify({ query: { pages: [] } })));
    expect(r.query?.pages).toEqual([]);
  });
  it("recusa Content-Length acima do teto", async () => {
    const res = new Response("{}", { headers: { "content-length": String(MAX_BYTES + 1) } });
    await expect(readJsonLimited(res)).rejects.toThrow(/grande demais/);
  });
  it("recusa corpo que estoura o teto mesmo sem Content-Length", async () => {
    await expect(
      readJsonLimited(new Response('{"a":"' + "x".repeat(200) + '"}'), 100),
    ).rejects.toThrow(/grande demais/);
  });
  it("JSON inválido lança erro (sem vazar o corpo)", async () => {
    await expect(readJsonLimited(new Response("<html>"))).rejects.toThrow();
  });
});
