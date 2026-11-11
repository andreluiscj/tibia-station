// Checagem SOMENTE LEITURA (chave anon): conta as linhas das tabelas que o app lê e lista nomes de arma
// duplicados em weapons_melee/weapons_distance. Só select (count e item_name); nunca imprime o .env, a URL
// do projeto nem chaves. Uso: bun scripts/check-table-sizes.ts   (rodar só com autorização do André).
import { createClient } from "@supabase/supabase-js";
import { PAGE_LIMIT_WARN, duplicateSlugs, sizeVerdict } from "./lib/table-sizes";

const TABLES = [
  "weapons_melee",
  "weapons_distance",
  "weapons_wand",
  "weapons_rod",
  "weapons_hand",
  "shields_ek",
  "shields_quiver",
  "shields_spellbook",
  "armor",
  "helmet",
  "legs",
  "boots",
  "ring",
  "amulet",
  "backpack",
  "trinket",
  "imbuiment",
];
const WEAPON_TABLES = ["weapons_melee", "weapons_distance"];
const url = process.env.VITE_SUPABASE_URL ?? process.env.SUPABASE_URL;
const key = process.env.VITE_SUPABASE_PUBLISHABLE_KEY ?? process.env.SUPABASE_PUBLISHABLE_KEY;
if (!url || !key) {
  console.error("Variáveis ausentes no .env: VITE_SUPABASE_URL e/ou VITE_SUPABASE_PUBLISHABLE_KEY");
  process.exit(2);
}
const client = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
const clean = (m: unknown) => String(m).split(url).join("<url>");

let paginate = false;
for (const table of TABLES) {
  const { count, error } = await client.from(table).select("*", { count: "exact", head: true });
  if (error) {
    console.log(`${table}: erro ao contar (${error.code ?? "erro"}: ${clean(error.message)})`);
    continue;
  }
  const verdict = sizeVerdict(count ?? 0);
  if (verdict === "paginar") paginate = true;
  console.log(
    `${table}: ${count} linhas${verdict === "paginar" ? `  <-- >= ${PAGE_LIMIT_WARN}: paginar` : ""}`,
  );
}

for (const table of WEAPON_TABLES) {
  const names: (string | null)[] = [];
  for (let from = 0; ; from += 1000) {
    const { data, error } = await client
      .from(table)
      .select("item_name")
      .order("item_name")
      .range(from, from + 999);
    if (error) {
      console.log(`${table}: erro ao ler nomes (${error.code ?? "erro"}: ${clean(error.message)})`);
      break;
    }
    names.push(...(data ?? []).map((r) => (r as { item_name: string | null }).item_name));
    if ((data ?? []).length < 1000) break;
  }
  const dups = duplicateSlugs(names);
  console.log(`${table}: ${dups.length} slugs com nomes duplicados (de ${names.length} nomes)`);
  for (const d of dups.slice(0, 10)) console.log(`  ${d.slug}: ${d.names.join(" | ")}`);
}
console.log(
  paginate
    ? "RESULTADO: alguma tabela passa de 900 linhas: propor paginação em fetchTable"
    : "RESULTADO: nenhuma tabela perto do limite de 1000 linhas",
);
