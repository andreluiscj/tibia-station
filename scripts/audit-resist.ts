// Confere as resistências (7 elementos) de todos os bosses e criaturas do bestiário contra a TibiaWiki em português.
// Uso: bun scripts/audit-resist.ts  ->  data/auditoria-resistencias.json
// Não altera creatures.json: só relata o que bate, o que diverge e o que não foi achado.
// Se a wiki bloquear (Cloudflare), espera e tenta de novo; não tenta contornar o bloqueio.
import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import type { Creature, ElementKey } from "../src/lib/data/types";
import { parsePercent } from "./lib/wikitext";

const API = "https://www.tibiawiki.com.br/api.php";
const UA = "TibiaStationImporter/0.1";
const ELS: ElementKey[] = ["physical", "earth", "fire", "energy", "ice", "holy", "death"];
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
const maiusculas = (t: string) =>
  t.replace(/\s*\(.*\)$/, "").replace(/\b[a-z]/g, (c) => c.toUpperCase());

async function pedir(titulos: string[]): Promise<Map<string, string>> {
  const url = `${API}?action=query&prop=revisions&rvprop=content&rvslots=main&redirects=1&format=json&formatversion=2&titles=${encodeURIComponent(titulos.join("|"))}`;
  for (let tentativa = 1; ; tentativa++) {
    try {
      const res = await fetch(url, { headers: { "User-Agent": UA }, signal: AbortSignal.timeout(30_000) });
      const txt = await res.text();
      if (res.ok && txt.startsWith("{")) return mapear(titulos, JSON.parse(txt).query);
      console.log(`  bloqueio (HTTP ${res.status}), tentativa ${tentativa}; esperando`);
    } catch (e) {
      console.log(`  falha de rede (${(e as Error).message}), tentativa ${tentativa}`);
    }
    if (tentativa >= 30) throw new Error("A wiki continua bloqueando depois de 30 tentativas.");
    await sleep(Math.min(60_000 * tentativa, 300_000));
  }
}

type Q = {
  redirects?: { from: string; to: string }[];
  normalized?: { from: string; to: string }[];
  pages?: { title: string; missing?: boolean; revisions?: { slots?: { main?: { content?: string } } }[] }[];
};
function mapear(titulos: string[], q: Q): Map<string, string> {
  const dest = new Map<string, string>();
  for (const r of [...(q.normalized ?? []), ...(q.redirects ?? [])]) dest.set(r.from, r.to);
  const conteudo = new Map(
    (q.pages ?? []).flatMap((p) => (p.missing ? [] : [[p.title, p.revisions?.[0]?.slots?.main?.content ?? ""] as const])),
  );
  const out = new Map<string, string>();
  for (const t of titulos) {
    let a = t;
    for (let i = 0; i < 3 && dest.has(a); i++) a = dest.get(a)!;
    const c = conteudo.get(a);
    if (c && /DmgMod/.test(c)) out.set(t, c);
  }
  return out;
}

const campo = (txt: string, el: ElementKey) =>
  parsePercent(new RegExp(`^\\s*\\|\\s*${el}DmgMod\\s*=[ \\t]*(.*)$`, "im").exec(txt)?.[1]);

const todas = JSON.parse(await readFile(join(process.cwd(), "data", "creatures.json"), "utf8")) as Creature[];
const alvos = todas.filter((c) => c.bestiaryClass || c.bosstiaryClass);
console.log(`${alvos.length} bosses e criaturas para conferir.`);

const pt = new Map<string, Record<ElementKey, number | null>>();
const TENTATIVAS: ((c: Creature) => string)[] = [
  (c) => c.wikiTitle,
  (c) => maiusculas(c.wikiTitle),
  (c) => `${maiusculas(c.wikiTitle)} (Criatura)`,
];
let pendentes = alvos;
for (const titulo of TENTATIVAS) {
  const faltou: Creature[] = [];
  for (let i = 0; i < pendentes.length; i += 20) {
    const lote = pendentes.slice(i, i + 20);
    const achadas = await pedir(lote.map(titulo));
    for (const c of lote) {
      const txt = achadas.get(titulo(c));
      if (!txt) faltou.push(c);
      else pt.set(c.slug, Object.fromEntries(ELS.map((e) => [e, campo(txt, e)])) as Record<ElementKey, number | null>);
    }
    if (i % 200 === 0) console.log(`  ${titulo === TENTATIVAS[0] ? "" : "(nova tentativa) "}${Math.min(i + 20, pendentes.length)}/${pendentes.length}`);
    await sleep(1000);
  }
  pendentes = faltou;
}

const bate: string[] = [];
const diverge: { slug: string; nome: string; boss: boolean; diferencas: Record<string, { atual: number | null; pt: number | null }>; ptTudo100: boolean }[] = [];
for (const c of alvos) {
  const p = pt.get(c.slug);
  if (!p) continue;
  const diferencas: Record<string, { atual: number | null; pt: number | null }> = {};
  for (const e of ELS) if (p[e] !== null && p[e] !== c.resist[e]) diferencas[e] = { atual: c.resist[e], pt: p[e] };
  if (Object.keys(diferencas).length === 0) bate.push(c.slug);
  else diverge.push({ slug: c.slug, nome: c.name, boss: !!c.bosstiaryClass, diferencas, ptTudo100: ELS.every((e) => p[e] === 100) });
}
const naoAchados = pendentes.map((c) => ({ slug: c.slug, nome: c.name, boss: !!c.bosstiaryClass }));
await writeFile(
  join(process.cwd(), "data", "auditoria-resistencias.json"),
  JSON.stringify({ geradoEm: new Date().toISOString(), total: alvos.length, bate: bate.length, diverge, naoAchados }, null, 2) + "\n",
);
console.log(`Pronto: ${bate.length} batem, ${diverge.length} divergem, ${naoAchados.length} sem página na wiki pt.`);
