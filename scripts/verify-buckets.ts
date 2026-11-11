// Gate 6: confere que os sprites de 30 itens (10 de weapons_melee, armor e helmet) respondem 200 no bucket
// "Itens Sprites" e que o código não escreve em nenhum bucket. SOMENTE LEITURA: select com a chave anon e HEAD
// em URLs públicas. Nunca imprime o .env, a URL do projeto nem chaves (só tabela, nome do item e bucket/arquivo).
// Uso: bun scripts/verify-buckets.ts   Saída: 0 tudo ok, 1 achados (sprite ausente ou escrita), 2 erro do script.
import { createClient } from "@supabase/supabase-js";
import { spriteUrl } from "../src/lib/storage";
import { scanRepo } from "./lib/repo-scan";
import { checkSprites, summarize, type SpriteItem } from "./lib/verify-buckets-core";

const TABLES = ["weapons_melee", "armor", "helmet"] as const;
const PER_TABLE = 10;
const url = process.env.VITE_SUPABASE_URL ?? process.env.SUPABASE_URL;
const key = process.env.VITE_SUPABASE_PUBLISHABLE_KEY ?? process.env.SUPABASE_PUBLISHABLE_KEY;

function fail(message: string): never {
  console.error(message);
  process.exit(2);
}

if (!url) fail("Variável ausente no .env: VITE_SUPABASE_URL");
if (!key) fail("Variável ausente no .env: VITE_SUPABASE_PUBLISHABLE_KEY");

const client = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });

const items: SpriteItem[] = [];
for (const table of TABLES) {
  const { data, error } = await client
    .from(table)
    .select("item_name")
    .order("item_name")
    .limit(PER_TABLE);
  if (error)
    fail(
      `Falha ao ler ${table}: ${error.code ?? "erro"} (${String(error.message).split(url).join("<url>")})`,
    );
  for (const row of data ?? []) {
    const name = (row as { item_name: string | null }).item_name;
    if (name) items.push({ table, name });
  }
  console.log(`${table}: ${(data ?? []).length} itens lidos`);
}

async function status(target: string): Promise<number> {
  const opts = { redirect: "manual" as const, signal: AbortSignal.timeout(15_000) };
  const head = await fetch(target, { ...opts, method: "HEAD" });
  if (head.status !== 405 && head.status !== 501) return head.status;
  return (await fetch(target, { ...opts, headers: { Range: "bytes=0-0" } })).status === 206
    ? 200
    : head.status;
}

const checks = await checkSprites(items, spriteUrl, status);
const { total, ok, failed } = summarize(checks);
for (const c of failed) {
  console.log(`SPRITE AUSENTE/FALHA  ${c.table}: ${c.name} -> ${c.path} (${c.status ?? c.error})`);
}

const scan = await scanRepo(process.cwd());
for (const f of scan.storage) console.log(`ESCRITA EM STORAGE  ${f.file}:${f.line} (${f.rule})`);
console.log(`Sprites com 200: ${ok} de ${total}`);
console.log(
  `Buckets somente leitura no código: ${scan.storage.length === 0 ? "sim" : `NÃO (${scan.storage.length} achados)`}`,
);

if (total === 0) fail("Nenhum item lido: verifique as tabelas e a chave.");
if (failed.length > 0 || scan.storage.length > 0) {
  console.log("ACHADOS: revisar os itens acima");
  process.exit(1);
}
console.log("OK");
