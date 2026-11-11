import { expect, test } from "@playwright/test";
import { vigiarConsole, abrir } from "./helpers";

// Gate 5: Set Builder (EK, nível 450): slots preenchidos com sprites; nenhuma escrita em storage.
test("EK + Axe + nível 450 gera o set com sprites carregados", async ({ page }) => {
  const erros = vigiarConsole(page);
  const escritas: string[] = [];
  page.on("request", (r) => {
    if (!["GET", "HEAD", "OPTIONS"].includes(r.method())) escritas.push(`${r.method()} ${r.url()}`);
  });
  const gifs: number[] = [];
  page.on("response", (r) => {
    if (/\.gif/i.test(r.url())) gifs.push(r.status());
  });

  await abrir(page, "/set-builder");
  await page.getByRole("button", { name: "Elite Knight" }).click();
  await page.getByRole("button", { name: "Axe", exact: true }).click();
  await page.getByLabel("Nível personalizado").fill("450");
  const gerar = page.getByRole("button", { name: "Gerar melhor set" });
  // o botão fica desabilitado enquanto os dados carregam; o clique só vale depois
  await expect(gerar).toBeEnabled();
  await gerar.click();
  await expect(page.getByText("Preset de nível 450")).toBeVisible();

  const sprites = page.locator('img[src*="Itens%20Sprites"]');
  await expect(sprites.first()).toBeVisible();
  expect(await sprites.count()).toBeGreaterThanOrEqual(6);
  await expect
    .poll(() =>
      sprites.evaluateAll((l) => l.filter((i) => !(i as HTMLImageElement).naturalWidth).length),
    )
    .toBe(0);
  expect(gifs.length).toBeGreaterThan(0);
  expect(gifs.every((s) => s === 200)).toBe(true);
  expect(escritas).toEqual([]);
  expect(erros).toEqual([]);
});
