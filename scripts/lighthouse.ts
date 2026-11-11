// Gate 8: Lighthouse em modo mobile contra /crypt do build local. Sobe o servidor de produção
// (node .output/server/index.mjs) numa porta local, mede, imprime as 4 notas e falha se desempenho,
// acessibilidade ou boas práticas ficarem abaixo de 90. Tudo roda em 127.0.0.1: nada é enviado para fora.
// Pré-requisito: bun run build. Uso: bun scripts/lighthouse.ts   (porta: LH_PORT, padrão 4173)
import { type ChildProcess, spawn } from "node:child_process";
import { existsSync } from "node:fs";
import * as chromeLauncher from "chrome-launcher";
import lighthouse from "lighthouse";
import { evaluateScores, toPercent, type Scores } from "./lib/lighthouse-scores";

const PORT = process.env.LH_PORT ?? "4173";
const ROUTE = process.env.LH_PATH ?? "/crypt";
const PAGE = `http://127.0.0.1:${PORT}${ROUTE}`;
const SERVER = ".output/server/index.mjs";

async function waitFor(url: string, timeoutMs: number): Promise<void> {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    try {
      if ((await fetch(url, { signal: AbortSignal.timeout(2000) })).ok) return;
    } catch {
      // servidor ainda subindo
    }
    await new Promise((r) => setTimeout(r, 500));
  }
  throw new Error(`O servidor não respondeu 200 em ${url} em ${timeoutMs / 1000}s`);
}

if (!existsSync(SERVER)) {
  console.error(`Build não encontrado (${SERVER}). Rode: bun run build`);
  process.exit(2);
}

let server: ChildProcess | undefined;
let chrome: chromeLauncher.LaunchedChrome | undefined;
let code = 0;
try {
  server = spawn("node", [SERVER], {
    env: { ...process.env, PORT, HOST: "127.0.0.1" },
    stdio: "ignore",
  });
  await waitFor(PAGE, 30_000);
  chrome = await chromeLauncher.launch({ chromeFlags: ["--headless=new"] });
  const run = await lighthouse(PAGE, {
    port: chrome.port,
    output: "json",
    logLevel: "error",
    formFactor: "mobile",
    onlyCategories: ["performance", "accessibility", "best-practices", "seo"],
  });
  if (!run) throw new Error("O Lighthouse não devolveu resultado");
  const c = run.lhr.categories;
  const scores: Scores = {
    performance: c.performance?.score ?? null,
    accessibility: c.accessibility?.score ?? null,
    bestPractices: c["best-practices"]?.score ?? null,
    seo: c.seo?.score ?? null,
  };
  console.log(`Lighthouse mobile em ${ROUTE} (build local)`);
  console.log(`  desempenho:     ${toPercent(scores.performance) ?? "sem nota"}`);
  console.log(`  acessibilidade: ${toPercent(scores.accessibility) ?? "sem nota"}`);
  console.log(`  boas práticas:  ${toPercent(scores.bestPractices) ?? "sem nota"}`);
  console.log(`  SEO:            ${toPercent(scores.seo) ?? "sem nota"} (informativo)`);
  const verdict = evaluateScores(scores);
  if (verdict.pass) console.log("OK");
  else {
    console.log(`FALHOU: ${verdict.failures.join("; ")}`);
    code = 1;
  }
} catch (e) {
  console.error(e instanceof Error ? e.message : "erro inesperado");
  code = 2;
} finally {
  await chrome?.kill();
  server?.kill();
}
process.exit(code);
