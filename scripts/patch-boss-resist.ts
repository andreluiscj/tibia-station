// Corrige as resistências "?" dos bosses com a TibiaWiki em português (a wiki em inglês deixa muitas sem confirmar).
// Uso: bun scripts/patch-boss-resist.ts   (rode depois de `bun run import:wiki`: o importador regrava creatures.json)
// Só mexe nos 7 elementos de bosses que a wiki em inglês marca como não confirmados. Para na hora se a wiki bloquear.
import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import type { Creature, ElementKey } from "../src/lib/data/types";
import { isUnconfirmed, parsePercent } from "./lib/wikitext";

const API = "https://www.tibiawiki.com.br/api.php";
const UA = "TibiaStationImporter/0.1";
const FILE = join(process.cwd(), "data", "creatures.json");
const ELEMENTOS: ElementKey[] = ["physical", "earth", "fire", "energy", "ice", "holy", "death"];
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

const campo = (wikitext: string, el: ElementKey) =>
  new RegExp(`^\\s*\\|\\s*${el}DmgMod\\s*=[ \\t]*(.*)$`, "im").exec(wikitext)?.[1];

async function paginas(titulos: string[]): Promise<Map<string, string>> {
  const url = `${API}?action=query&prop=revisions&rvprop=content&rvslots=main&redirects=1&format=json&formatversion=2&titles=${encodeURIComponent(titulos.join("|"))}`;
  const res = await fetch(url, {
    headers: { "User-Agent": UA },
    signal: AbortSignal.timeout(30_000),
  });
  const txt = await res.text();
  // Bloqueio (desafio da Cloudflare ou HTTP 4xx): para sem tentar contornar.
  if (!res.ok || !txt.startsWith("{"))
    throw new Error(`Bloqueio da wiki (HTTP ${res.status}): pare e tente depois.`);
  const q = JSON.parse(txt).query as {
    redirects?: { from: string; to: string }[];
    normalized?: { from: string; to: string }[];
    pages?: {
      title: string;
      missing?: boolean;
      revisions?: { slots?: { main?: { content?: string } } }[];
    }[];
  };
  const dest = new Map<string, string>();
  for (const r of [...(q.normalized ?? []), ...(q.redirects ?? [])]) dest.set(r.from, r.to);
  const conteudo = new Map(
    (q.pages ?? []).flatMap((p) =>
      p.missing ? [] : [[p.title, p.revisions?.[0]?.slots?.main?.content ?? ""] as const],
    ),
  );
  const out = new Map<string, string>();
  for (const t of titulos) {
    let alvo = t;
    for (let i = 0; i < 3 && dest.has(alvo); i++) alvo = dest.get(alvo)!;
    const c = conteudo.get(alvo);
    if (c) out.set(t, c);
  }
  return out;
}

const criaturas = JSON.parse(await readFile(FILE, "utf8")) as Creature[];
const alvos = criaturas.filter(
  (c) => c.bosstiaryClass && ELEMENTOS.some((e) => c.resistUnconfirmed.includes(e)),
);
console.log(`${alvos.length} bosses com resistência não confirmada.`);

// Títulos tentados em ordem: o da wiki em inglês e, se faltar, a versão com maiúsculas e sem qualificador ("Owin (Creature)").
const maiusculas = (t: string) =>
  t.replace(/\s*\(.*\)$/, "").replace(/\b[a-z]/g, (c) => c.toUpperCase());
const TENTATIVAS: ((c: Creature) => string)[] = [
  (c) => c.wikiTitle,
  (c) => maiusculas(c.wikiTitle),
  (c) => `${maiusculas(c.wikiTitle)} (Criatura)`,
];

let corrigidos = 0;
let valores = 0;
let pendentes = alvos;
const aindaIncertos: string[] = [];
for (const titulo of TENTATIVAS) {
  const faltou: Creature[] = [];
  for (let i = 0; i < pendentes.length; i += 20) {
    const lote = pendentes.slice(i, i + 20);
    const achadas = await paginas(lote.map(titulo));
    for (const c of lote) {
      const texto = achadas.get(titulo(c));
      if (!texto || !/DmgMod/.test(texto)) {
        faltou.push(c);
        continue;
      }
      let mudou = false;
      for (const el of ELEMENTOS) {
        if (!c.resistUnconfirmed.includes(el)) continue;
        const bruto = campo(texto, el);
        const v = parsePercent(bruto);
        if (v === null) continue;
        if (v !== c.resist[el]) valores++;
        c.resist[el] = v;
        if (!isUnconfirmed(bruto))
          c.resistUnconfirmed = c.resistUnconfirmed.filter((x) => x !== el);
        mudou = true;
      }
      if (mudou) corrigidos++;
      if (ELEMENTOS.some((e) => c.resistUnconfirmed.includes(e))) aindaIncertos.push(c.name);
    }
    await sleep(1000);
  }
  pendentes = faltou;
}
const semPagina = pendentes.map((c) => c.name);

await writeFile(FILE, JSON.stringify(criaturas, null, 2) + "\n");
console.log(`Pronto: ${corrigidos} bosses lidos na wiki pt, ${valores} valores mudaram.`);
console.log(`Sem página/infobox na wiki pt (${semPagina.length}): ${semPagina.join(", ")}`);
console.log(`Ainda com "?" também na wiki pt (${aindaIncertos.length}).`);
