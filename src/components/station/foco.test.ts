import { describe, expect, it } from "vitest";
import { ID_BOTAO_BUSCA, alvoDoFoco } from "./foco";

const el = (tagName: string, isConnected = true) => ({ tagName, isConnected, focus: () => {} });

describe("alvoDoFoco", () => {
  const botao = el("BUTTON");
  const doc = { getElementById: (id: string) => (id === ID_BOTAO_BUSCA ? botao : null) };
  it("devolve o elemento que tinha foco ao abrir", () => {
    const campo = el("INPUT");
    expect(alvoDoFoco(campo, doc)).toBe(campo);
  });
  it("sem elemento anterior, cai no botão de busca do cabeçalho", () => {
    expect(alvoDoFoco(null, doc)).toBe(botao);
  });
  it("foco no body (Ctrl+K sem nada focado) também cai no botão", () => {
    expect(alvoDoFoco(el("BODY"), doc)).toBe(botao);
  });
  it("elemento que saiu da página cai no botão", () => {
    expect(alvoDoFoco(el("A", false), doc)).toBe(botao);
  });
});
