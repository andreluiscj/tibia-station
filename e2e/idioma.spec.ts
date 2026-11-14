import { expect, test } from "@playwright/test";
import { abrir } from "./helpers";

test.describe("Idioma", () => {
  test("troca para inglês e espanhol, e lembra a escolha ao recarregar", async ({ page }) => {
    await abrir(page, "/damage-calculator?monster=hellflayer");
    // O clique pode chegar antes da hidratação: repete até o idioma mudar.
    await expect(async () => {
      await page.getByRole("button", { name: "English (United States)" }).click();
      await expect(page.getByRole("heading", { name: "Result", exact: true })).toBeVisible({
        timeout: 1000,
      });
    }).toPass();
    await expect(page.getByRole("button", { name: "Reset calculations" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Support the project" }).first()).toBeVisible();
    await page.reload();
    await expect(page.getByRole("heading", { name: "Result", exact: true })).toBeVisible();
    await page.getByRole("button", { name: "Español (España)" }).click();
    await expect(page.getByRole("heading", { name: "Resultado", exact: true })).toBeVisible();
    await expect(page.getByRole("button", { name: "Restablecer cálculos" })).toBeVisible();
    await page.getByRole("button", { name: "Português (Brasil)" }).click();
    await expect(page.getByRole("button", { name: "Resetar cálculos" })).toBeVisible();
  });
});
