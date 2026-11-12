import { expect, test, type Page } from "@playwright/test";
import { semRolagemHorizontal, vigiarConsole, abrir } from "./helpers";

// Gate 5 do plano: fluxo Crypt (escolher vocação, monstro, ver ranking).
test.describe("Crypt Calculator", () => {
  const status = (page: Page) => page.getByRole("status").filter({ hasText: "Melhor arma" });

  test("fluxo EK + Hellflayer: 3 categorias, melhor arma de cada uma", async ({ page }) => {
    const erros = vigiarConsole(page);
    await abrir(page, "/crypt");
    await page.getByRole("button", { name: "Elite Knight" }).click();
    await page.getByRole("combobox", { name: "Criatura" }).click();
    await page.getByPlaceholder("Pesquisar criatura…").fill("hellflayer");
    await page.getByRole("option", { name: /Hellflayer/ }).click();

    await expect(status(page)).toContainText("Melhor arma: Crypt Splitter, 114,0");
    for (const nome of ["Crypt Splitter", "Crypt Breaker", "Crypt Slicer"])
      await expect(page.getByText(nome, { exact: true }).first()).toBeVisible();
    await expect(page.getByText(/Combinação:/).first()).toBeVisible();
    await expect(page.getByText(/Imbuiment Elemental (Sim|Não)/).first()).toBeVisible();
    expect(page.url()).toContain("monster=hellflayer");
    await semRolagemHorizontal(page);
    expect(erros).toEqual([]);
  });

  test("botão 'Visualizar hunts da criatura' abre modal centralizado", async ({ page }) => {
    await abrir(page, "/crypt?monster=hellflayer");
    await page.getByRole("button", { name: "Visualizar hunts da criatura" }).click();
    const modal = page.getByRole("dialog");
    await expect(modal).toBeVisible();
    await expect(modal).toContainText("Hunts com Hellflayer");
    const b = (await modal.boundingBox())!;
    const vp = page.viewportSize()!;
    expect(Math.abs(b.x + b.width / 2 - vp.width / 2)).toBeLessThan(4);
    expect(Math.abs(b.y + b.height / 2 - vp.height / 2)).toBeLessThan(4);
  });

  // Regressão: askarak-demon (Moonsilver Claymore / Crypt Breaker / Inferniarch Greataxe) saía com cartões desiguais.
  test("askarak-demon em 'Comparar as 3': melhores cartões e Alternativas alinhados", async ({ page }) => {
    await abrir(page, "/crypt?voc=ek&monster=askarak-demon");
    const melhor = page.getByText("Melhor opção para este alvo");
    await expect(melhor).toHaveCount(3);
    const caixas = await melhor
      .locator("xpath=ancestor::*[contains(concat(' ',normalize-space(@class),' '),' frame ')][1]")
      .evaluateAll((es) =>
        es.map((e) => {
          const r = e.getBoundingClientRect();
          return { y: Math.round(r.top), h: Math.round(r.height) };
        }),
      );
    expect(new Set(caixas.map((c) => c.h)).size).toBe(1);
    expect(new Set(caixas.map((c) => c.y)).size).toBe(1);
    const alt = page.getByText("Alternativas", { exact: true });
    const ys = await alt.evaluateAll((es) => es.map((e) => Math.round(e.getBoundingClientRect().top)));
    expect(ys).toHaveLength(3);
    expect(new Set(ys).size).toBe(1);
  });

  test("Souleater (Axe) como melhor arma não gera sprite quebrado", async ({ page }) => {
    const falhas: string[] = [];
    page.on("response", (r) => {
      if (r.status() >= 400 && r.url().includes("/sprites/items/")) falhas.push(`${r.status()} ${r.url()}`);
    });
    await abrir(page, "/crypt?voc=ek&monster=radiant-templar");
    await expect(page.getByText("Souleater", { exact: true }).first()).toBeVisible();
    await page.waitForLoadState("networkidle");
    expect(falhas).toEqual([]);
  });

  test("peso da hunt por checkbox", async ({ page }) => {
    await abrir(page, "/crypt?hunt=alchemist-quarter");
    await expect(status(page)).toContainText("Melhor arma: Crypt Breaker");
    await page.getByLabel(/Ponderar pelo peso/).check();
    await expect(page).toHaveURL(/peso=1/);
    await expect(status(page)).toContainText("Melhor arma:");
  });

  test("Monk mostra só o Crypt Strike", async ({ page }) => {
    await abrir(page, "/crypt?monster=hellflayer&voc=monk");
    await expect(status(page)).toContainText("Melhor arma: Crypt Strike");
    await expect(page.getByText("Crypt Splitter")).toHaveCount(0);
    await expect(page.getByText("Crypt Breaker")).toHaveCount(0);
  });

  test("nível abaixo de 450 avisa sem esconder o cálculo", async ({ page }) => {
    await abrir(page, "/crypt?monster=hellflayer&lvl=300");
    await expect(page.getByText(/A Crypt exige nível 450/)).toBeVisible();
    await expect(status(page)).toContainText("Melhor arma:");
  });

  test("estado restaurado a partir da URL", async ({ page }) => {
    await abrir(page, "/crypt?voc=ek&cat=sword&lvl=450&hunt=claustrophobic-inferno&peso=1");
    await expect(page.getByLabel("Nível do personagem")).toHaveValue("450");
    await expect(status(page)).toContainText("Alvo: Claustrophobic Inferno");
    await expect(page.getByLabel(/Ponderar pelo peso/)).toBeChecked();
  });

  // Parâmetros inválidos devem ser descartados sem quebrar a tela (critério de aceite da fase 4).
  const invalidos = [
    "cat=zzz",
    "share=NaN",
    "share=abc",
    "share=-5",
    "voc=zzz",
    "modo=x",
    "lvl=1e999",
    "lvl=99999999999",
    "monster=%3Cscript%3Ealert(1)%3C%2Fscript%3E",
    "hunt=%22%3E%3Csvg%20onload%3Dalert(1)%3E",
  ];
  for (const q of invalidos) {
    test(`URL inválida ?${q} não quebra a tela`, async ({ page }) => {
      const erros = vigiarConsole(page);
      let dialogo = false;
      page.on("dialog", (d) => {
        dialogo = true;
        void d.dismiss();
      });
      await abrir(page, `/crypt?monster=hellflayer&${q}`);
      await expect(page.getByRole("heading", { name: "Crypt Calculator" })).toBeVisible();
      await expect(page.getByRole("alert")).toHaveCount(0);
      await expect(page.locator("main")).not.toContainText(/NaN|Infinity|undefined/);
      expect(dialogo).toBe(false);
      expect(erros).toEqual([]);
    });
  }
});
