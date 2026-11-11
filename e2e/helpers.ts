import { expect, type Page } from "@playwright/test";

/** Coleta erros de console e exceções da página (ignora o 404 do próprio documento). */
export function vigiarConsole(page: Page): string[] {
  const erros: string[] = [];
  page.on("console", (m) => {
    if (m.type() === "error" && !/status of 404/.test(m.text())) erros.push(m.text());
  });
  page.on("pageerror", (e) => erros.push(`pageerror: ${e.message}`));
  return erros;
}

export async function semRolagemHorizontal(page: Page) {
  const r = await page.evaluate(() => ({
    sw: document.documentElement.scrollWidth,
    cw: document.documentElement.clientWidth,
  }));
  expect(r.sw).toBeLessThanOrEqual(r.cw);
}

/** Lê o ranking: um item por cartão de arma, na ordem da tela. */
export async function lerRanking(page: Page) {
  const cartoes = page
    .getByRole("article")
    .filter({ hasText: /Crypt (Splitter|Breaker|Slicer|Strike)/ });
  const n = await cartoes.count();
  const out: { posicao: string; nome: string; empate: boolean; texto: string }[] = [];
  for (let i = 0; i < n; i++) {
    const c = cartoes.nth(i);
    const texto = (await c.innerText()).replace(/\n+/g, " | ");
    const pos = c.getByLabel(/^Posição/).first();
    out.push({
      posicao: (await pos.count()) ? (await pos.innerText()).trim() : "",
      nome: texto.match(/Crypt \w+/)?.[0] ?? "",
      empate: /empate no ranking/.test(texto),
      texto,
    });
  }
  return out;
}

/** Parágrafo visível com o texto (ignora o aviso sr-only que repete o resultado para leitor de tela). */
export const texto = (page: Page, re: RegExp | string) =>
  page.locator("p:not(.sr-only)").filter({ hasText: re }).first();

/** Abre a rota e espera a hidratação do React (cliques antes dela se perdem); não depende de rede externa. */
export async function abrir(page: Page, url: string) {
  await page.goto(url, { waitUntil: "domcontentloaded" });
  await page.waitForFunction(() => {
    const e = document.querySelector("main *");
    return !!e && Object.keys(e).some((k) => k.startsWith("__reactFiber"));
  });
}
