import { describe, expect, it } from "vitest";
import { traduzir } from "./i18n";

describe("traduzir", () => {
  it("português devolve o próprio texto, com variáveis", () => {
    expect(traduzir("pt", "Hunts com {nome}", { nome: "Orc" })).toBe("Hunts com Orc");
  });
  it("traduz texto exato e cai no português quando falta tradução", () => {
    expect(traduzir("en", "Alternativas")).toBe("Alternatives");
    expect(traduzir("es", "Alternativas")).toBe("Alternativas");
    expect(traduzir("en", "texto sem tradução")).toBe("texto sem tradução");
  });
  it("traduz padrões com número e texto livre", () => {
    expect(traduzir("en", "Resiste 70%")).toBe("Resists 70%");
    expect(traduzir("es", "Fraco (+10%)")).toBe("Débil (+10%)");
    expect(traduzir("en", "Híbrida 28% + 14%")).toBe("Hybrid 28% + 14%");
    expect(traduzir("en", "Nível 3: Fire Pierce +10%")).toBe("Level 3: Fire Pierce +10%");
    expect(traduzir("en", "absorve o dano físico e o elemento Fire")).toBe(
      "absorbs physical damage and the Fire element",
    );
  });
});
