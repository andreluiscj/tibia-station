// Aplica em creatures.json os valores da TibiaWiki em português achados por audit-resist.ts.
// Ignora páginas pt com 100 em tudo (não preenchidas): ali fica o valor da wiki inglesa.
// Uso: bun scripts/audit-resist.ts && bun scripts/apply-audit-resist.ts && bunx prettier --write data/creatures.json
import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

const dir = join(process.cwd(), "data");
const audit = JSON.parse(await readFile(join(dir, "auditoria-resistencias.json"), "utf8"));
const arq = join(dir, "creatures.json");
const criaturas = JSON.parse(await readFile(arq, "utf8"));
const porSlug = new Map(criaturas.map((c: { slug: string }) => [c.slug, c]));
let n = 0;
for (const d of audit.diverge) {
  if (d.ptTudo100) continue;
  const c = porSlug.get(d.slug) as { resist: Record<string, number> };
  for (const [el, v] of Object.entries(d.diferencas as Record<string, { pt: number }>)) c.resist[el] = v.pt;
  n++;
}
await writeFile(arq, JSON.stringify(criaturas, null, 2) + "\n");
console.log(`${n} criaturas corrigidas pela wiki pt.`);
