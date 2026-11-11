import { describe, expect, it } from "vitest";
import { once } from "./once";

describe("once (cache de carga que não guarda falha)", () => {
  it("a primeira chamada rejeita; a segunda tenta de novo e resolve", async () => {
    let calls = 0;
    const load = once(async () => {
      calls++;
      if (calls === 1) throw new Error("chunk não baixou");
      return "dados";
    });
    await expect(load()).rejects.toThrow("chunk não baixou");
    await expect(load()).resolves.toBe("dados");
    expect(calls).toBe(2);
  });

  it("o sucesso é cacheado: o loader roda uma só vez", async () => {
    let calls = 0;
    const load = once(async () => ++calls);
    expect(await load()).toBe(1);
    expect(await load()).toBe(1);
    expect(calls).toBe(1);
  });

  it("chamadas simultâneas dividem a mesma carga em andamento", async () => {
    let calls = 0;
    const load = once(async () => {
      calls++;
      await new Promise((r) => setTimeout(r, 5));
      return "ok";
    });
    expect(await Promise.all([load(), load(), load()])).toEqual(["ok", "ok", "ok"]);
    expect(calls).toBe(1);
  });

  it("falhas simultâneas rejeitam todas e a próxima chamada tenta de novo", async () => {
    let calls = 0;
    const load = once(async () => {
      calls++;
      if (calls === 1) throw new Error("falhou");
      return "ok";
    });
    const results = await Promise.allSettled([load(), load()]);
    expect(results.map((r) => r.status)).toEqual(["rejected", "rejected"]);
    expect(await load()).toBe("ok");
  });
});
