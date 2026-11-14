import { expect, test } from "@playwright/test";
import { semRolagemHorizontal, vigiarConsole, abrir } from "./helpers";

// Gate 5: Hunt Finder, detalhe de hunt, ficha de monstro e busca global.
test.describe("Hunt Finder", () => {
  test("lista, filtra por vocação, só 450+ e busca", async ({ page }) => {
    const erros = vigiarConsole(page);
    await abrir(page, "/hunts");
    await expect(page.getByText("434 hunts")).toBeVisible();

    const so450 = page.getByRole("checkbox", { name: /nível 450 ou mais/ });
    await so450.check();
    await expect(page.getByText("11 hunts")).toBeVisible();
    await so450.uncheck();

    await page.getByRole("button", { name: "Monk", exact: true }).click();
    await expect(page.getByText("1 hunt", { exact: true })).toBeVisible();
    await so450.check();
    await expect(page.getByText("Nenhuma hunt encontrada")).toBeVisible();
    await so450.uncheck();
    await page.getByRole("button", { name: "Todas", exact: true }).click();

    await page.getByLabel("Buscar hunt").fill("dragon");
    await expect(page.getByText("23 hunts")).toBeVisible();
    await page.getByLabel("Buscar hunt").fill("zzzzqq");
    await expect(page.getByText("Nenhuma hunt encontrada")).toBeVisible();
    await semRolagemHorizontal(page);
    expect(erros).toEqual([]);
  });

  test("abre o detalhe da hunt e manda para a Crypt", async ({ page }) => {
    await abrir(page, "/hunts");
    await page.getByRole("link", { name: /Claustrophobic Inferno/ }).click();
    await expect(page).toHaveURL(/\/hunts\/claustrophobic-inferno$/);
    await expect(
      page.getByRole("heading", { level: 1, name: "Claustrophobic Inferno" }),
    ).toBeVisible();
    await page.getByRole("link", { name: "Ver Crypt para esta hunt" }).click();
    await expect(page).toHaveURL(/\/damage-calculator\?.*hunt=claustrophobic-inferno/);
    await expect(page.getByRole("status").filter({ hasText: "Alvo: Claustrophobic Inferno" })).toBeAttached();
  });

  test("hunt inexistente mostra 404 em português", async ({ page }) => {
    await abrir(page, "/hunts/nada");
    await expect(page.getByRole("heading", { name: "Hunt não encontrada" })).toBeVisible();
  });

  test("ficha de monstro: resistência negativa mostra Absorve (cura); slug inexistente = 404 pt-BR", async ({
    page,
  }) => {
    await abrir(page, "/monstros/infected-weeper");
    await expect(page.getByText("Absorve (cura)").first()).toBeVisible();
    await abrir(page, "/monstros/nada");
    await expect(page.getByRole("heading", { name: "Criatura não encontrada" })).toBeVisible();
  });
});
