import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";

// ALARME BARATO, não prova de comportamento: só checa de forma estática que client.ts (código do navegador)
// não menciona o prefixo de chave secreta. Não verifica o que acontece com uma chave secreta em tempo de execução.
describe("client.ts (navegador)", () => {
  it("alarme barato: client.ts não menciona sb_secret_", async () => {
    const source = await readFile(new URL("./client.ts", import.meta.url), "utf8");
    expect(source).toContain("sb_publishable_");
    expect(source).not.toContain("sb_secret_");
  });
});
