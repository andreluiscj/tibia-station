import { describe, expect, it } from "vitest";
import { SPRITE_API, spriteCandidates, spriteOutputPath } from "./sprite-download";

it("consulta uma origem de imagens que aceita downloads automatizados", () => {
  expect(SPRITE_API).toBe("https://www.tibiawiki.com.br/api.php");
});

describe("spriteCandidates", () => {
  it("tenta o título da wiki e sua versão sem qualificador", () => {
    expect(spriteCandidates("Midnight Asura (Creature)")).toEqual([
      "File:Midnight Asura (Creature).gif",
      "File:Midnight Asura.gif",
    ]);
  });

  it("não repete candidatos idênticos", () => {
    expect(spriteCandidates("Crypt Breaker")).toEqual(["File:Crypt Breaker.gif"]);
  });
});

describe("spriteOutputPath", () => {
  it("mantém criaturas e armas Crypt em diretórios distintos", () => {
    expect(spriteOutputPath("creatures", "midnight-asura")).toBe(
      "public/sprites/creatures/midnight-asura.gif",
    );
    expect(spriteOutputPath("crypt-weapons", "crypt-breaker")).toBe(
      "public/sprites/crypt-weapons/crypt-breaker.gif",
    );
  });
});
