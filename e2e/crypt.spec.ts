import { expect, test } from "@playwright/test";
import { lerRanking, semRolagemHorizontal, texto, vigiarConsole, abrir } from "./helpers";

// Gate 5 do plano: fluxo Crypt (escolher vocação, monstro, ver ranking).
test.describe("Crypt Calculator", () => {
  test("fluxo EK + Hellflayer: ranking oficial com empate em 2º", async ({ page }) => {
    const erros = vigiarConsole(page);
    await abrir(page, "/crypt");
    await page.getByRole("button", { name: "Elite Knight" }).click();
    await page.getByRole("combobox", { name: "Monstro" }).click();
    await page.getByPlaceholder("Digite para buscar").fill("hellflayer");
    await page.getByRole("option", { name: /Hellflayer/ }).click();

    await expect(texto(page, "Melhor arma: Crypt Splitter 114,0")).toBeVisible();
    const r = await lerRanking(page);
    expect(r.map((x) => x.nome)).toEqual(["Crypt Splitter", "Crypt Breaker", "Crypt Slicer"]);
    expect(r.map((x) => x.posicao)).toEqual(["1", "2", "2"]);
    expect(r[0].texto).toContain("114,0");
    expect(r[1].texto).toContain("107,0");
    expect(r[2].texto).toContain("107,0");
    expect(r[1].empate && r[2].empate).toBe(true);
    expect(page.url()).toContain("monster=hellflayer");
    await semRolagemHorizontal(page);
    expect(erros).toEqual([]);
  });

  test("modo referência mostra os números da calculadora da comunidade", async ({ page }) => {
    await abrir(page, "/crypt?monster=hellflayer");
    await page.getByRole("button", { name: "Calculadora de referência" }).click();
    await expect(page).toHaveURL(/modo=reference/);
    const r = await lerRanking(page);
    // o cartão exibe 1 casa decimal: 113,75 vira 113,8 e 106,25 vira 106,3
    expect(r[0].texto).toContain("113,8");
    expect(r.find((x) => x.nome === "Crypt Breaker")?.texto).toContain("87,5");
    expect(r.find((x) => x.nome === "Crypt Slicer")?.texto).toContain("106,3");
  });

  test("premissa 50/50 editável e peso da hunt por checkbox", async ({ page }) => {
    await abrir(page, "/crypt?hunt=alchemist-quarter");
    await expect(texto(page, /Melhor arma: Crypt Breaker/)).toBeVisible();
    await page.getByText(/^Premissa:/).click();
    await page.getByLabel(/Parte do dano que vira elemento/).fill("40");
    await expect(page).toHaveURL(/share=40/);
    await page.getByRole("button", { name: "Voltar para 50%" }).click();
    await expect(page).not.toHaveURL(/share=/);
    await page.getByLabel(/Ponderar pelo peso/).check();
    await expect(page).toHaveURL(/peso=1/);
    await expect(texto(page, /Melhor arma: Crypt Splitter/)).toBeVisible();
  });

  test("Monk mostra só o Crypt Strike", async ({ page }) => {
    await abrir(page, "/crypt?monster=hellflayer&voc=monk");
    await expect(texto(page, /Melhor arma: Crypt Strike/)).toBeVisible();
    await expect(page.getByText("Crypt Splitter")).toHaveCount(0);
    await expect(page.getByText("Crypt Breaker")).toHaveCount(0);
  });

  test("nível abaixo de 450 avisa sem esconder o cálculo", async ({ page }) => {
    await abrir(page, "/crypt?monster=hellflayer&lvl=300");
    await expect(page.getByText(/A Crypt exige nível 450/)).toBeVisible();
    await expect(texto(page, /Melhor arma: Crypt Splitter/)).toBeVisible();
  });

  test("estado restaurado a partir da URL", async ({ page }) => {
    await abrir(
      page,
      "/crypt?voc=ek&cat=sword&lvl=450&hunt=claustrophobic-inferno&modo=reference&share=30&peso=1",
    );
    await expect(page.getByLabel("Nível do personagem")).toHaveValue("450");
    await expect(page.getByText(/Premissa: 70% físico e 30% elemento/)).toBeVisible();
    await expect(texto(page, /Alvo: Claustrophobic Inferno/)).toBeVisible();
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
