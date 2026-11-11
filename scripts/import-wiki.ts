// Importador da TibiaWiki (só API do MediaWiki). Uso: bun scripts/import-wiki.ts
// Gera data/creatures.json, hunts.json, crypt-weapons.json, sources.json, relatorio-hunts.md e supabase/seed.sql.
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import type { Creature, CryptWeapon, DatasetInfo, Hunt, Sources } from "../src/lib/data/types";
import { CRYPT_PAGES, buildCryptWeapon } from "./lib/crypt-weapons";
import { parseCreature, parseHunt, uniqueBySlug } from "./lib/parse-pages";
import { creatureSchema, cryptWeaponSchema, huntSchema, validateAll } from "./lib/schemas";
import { buildSeed } from "./lib/seed-sql";
import { apiGet, categoryMembers, fetchPages } from "./lib/wiki-client";
import { slugify } from "./lib/wikitext";

const IMPORTER_VERSION = "0.1.0";
const LICENSE = "CC BY-SA 3.0";
const LICENSE_URL = "https://creativecommons.org/licenses/by-sa/3.0/";
const ENDPOINT = "https://tibia.fandom.com/api.php";
const OUT = join(process.cwd(), "data");
const write = (file: string, data: unknown) =>
  writeFile(join(OUT, file), JSON.stringify(data, null, 2) + "\n");
const progress = (label: string) => (d: number, n: number) => {
  if (d % 500 === 0 || d === n) console.log(`  ${label}: ${d}/${n}`);
};
const isNotNull = <T>(v: T | null): v is T => v !== null;

async function importCreatures(): Promise<Creature[]> {
  const pages = await fetchPages(
    await categoryMembers("Category:Creatures"),
    progress("criaturas"),
  );
  const parsed = pages.map((p) => parseCreature(p.title, p.content)).filter(isNotNull);
  console.log(
    `  ${parsed.length} criaturas (${pages.length - parsed.length} páginas sem Infobox Creature ignoradas)`,
  );
  return validateAll("criatura", creatureSchema, uniqueBySlug(parsed));
}

async function importHunts(creatures: Creature[]): Promise<Hunt[]> {
  // Título e nome apontam para a mesma criatura; o título tem prioridade em caso de conflito.
  const known = new Map<string, string>();
  for (const c of creatures) known.set(slugify(c.wikiTitle), c.slug);
  for (const c of creatures) if (!known.has(slugify(c.name))) known.set(slugify(c.name), c.slug);
  const pages = await fetchPages(
    await categoryMembers("Category:Hunting Places"),
    progress("hunts"),
  );
  const parsed = pages.map((p) => parseHunt(p.title, p.content, known)).filter(isNotNull);
  console.log(
    `  ${parsed.length} hunts (${pages.length - parsed.length} páginas sem Infobox Hunt ignoradas)`,
  );
  return validateAll("hunt", huntSchema, uniqueBySlug(parsed));
}

async function importCryptWeapons(): Promise<CryptWeapon[]> {
  const pages = await fetchPages([...CRYPT_PAGES]);
  const cats = await apiGet({
    action: "query",
    prop: "categories",
    cllimit: "max",
    titles: [...CRYPT_PAGES].join("|"),
  });
  const catsByTitle = new Map(
    (cats.query?.pages ?? []).map((p) => [p.title, (p.categories ?? []).map((c) => c.title)]),
  );
  const weapons = CRYPT_PAGES.map((title) => {
    const page = pages.find((p) => p.title === title);
    const w = page && buildCryptWeapon(title, page.content, catsByTitle.get(title) ?? []);
    if (!w) throw new Error(`Arma Crypt não pôde ser montada: ${title}`);
    return w;
  });
  return validateAll("arma", cryptWeaponSchema, weapons) as CryptWeapon[];
}

/** Integridade entre arquivos: falha em vez de gravar dados quebrados. */
function checkIntegrity(creatures: Creature[], hunts: Hunt[], weapons: CryptWeapon[]): void {
  const slugs = new Set(creatures.map((c) => c.slug));
  for (const h of hunts) {
    const seen = new Set<string>();
    for (const hc of h.creatures) {
      if (!slugs.has(hc.creatureSlug))
        throw new Error(`Hunt ${h.slug} cita criatura inexistente: ${hc.creatureSlug}`);
      if (seen.has(hc.creatureSlug))
        throw new Error(`Hunt ${h.slug} repete a criatura ${hc.creatureSlug}`);
      seen.add(hc.creatureSlug);
    }
  }
  if (weapons.length !== 4) throw new Error(`Esperadas 4 armas Crypt, vieram ${weapons.length}`);
}

async function main() {
  await mkdir(OUT, { recursive: true });

  console.log("Licença...");
  const rights = (await apiGet({ action: "query", meta: "siteinfo", siprop: "rightsinfo" })) as {
    query?: { rightsinfo?: { text?: string; url?: string } };
  };
  // Decisão do Líder: registrar a versão 3.0 e o link da licença CC; a wiki só confirma que é CC-BY-SA.
  if (!/CC.?BY.?SA/i.test(rights.query?.rightsinfo?.text ?? ""))
    throw new Error("A licença da wiki mudou: revisar a atribuição");
  const license = LICENSE;
  const licenseUrl = LICENSE_URL;

  console.log("Criaturas...");
  const creatures = await importCreatures();
  console.log("Hunts...");
  const hunts = await importHunts(creatures);
  console.log("Armas Crypt...");
  const weapons = await importCryptWeapons();
  checkIntegrity(creatures, hunts, weapons);

  const importedAt = new Date().toISOString();
  const base = { endpoint: ENDPOINT, license, licenseUrl, importedAt };
  const attribution =
    "Dados da TibiaWiki (https://tibia.fandom.com/), licença CC BY-SA. Não afiliado à CipSoft.";
  const info = (count: number, extra = "", unconfirmedFields: string[] = []): DatasetInfo => ({
    ...base,
    attribution: attribution + extra,
    count,
    unconfirmedFields,
  });
  const sources: Sources = {
    schemaVersion: 1,
    importer: { name: "scripts/import-wiki.ts", version: IMPORTER_VERSION },
    datasets: {
      creatures: info(creatures.length),
      hunts: info(hunts.length, " Pesos das criaturas = aparições na página (editáveis)."),
      cryptWeapons: info(
        weapons.length,
        " Perks por nível: docs/PLANO.md 5.2 (não constam na wiki em 2026-11-11); atk, def, atributos e elemento do pierce vêm da wiki.",
        ["perks"],
      ),
    },
  };

  await write("creatures.json", creatures);
  await write("hunts.json", hunts);
  await write("crypt-weapons.json", weapons);
  await write("sources.json", sources);
  await mkdir(join(process.cwd(), "supabase"), { recursive: true });
  await writeFile(
    join(process.cwd(), "supabase", "seed.sql"),
    buildSeed(creatures, hunts, weapons, sources),
  );

  const maxLevel = (h: Hunt) =>
    Math.max(h.levelKnights ?? 0, h.levelPaladins ?? 0, h.levelMages ?? 0, h.levelMonks ?? 0);
  const without = hunts.filter((h) => h.creatures.length === 0);
  const high = without.filter((h) => maxLevel(h) >= 450);
  const line = (h: Hunt) =>
    `- ${h.name} (\`${h.slug}\`, nível ${maxLevel(h) || "?"}, ${h.city ?? "cidade desconhecida"})`;
  const deviated = [
    ...creatures.map((c) => ({ kind: "criatura", ...c })),
    ...hunts.map((h) => ({ kind: "hunt", ...h })),
  ].filter((x) => x.slug !== slugify(x.name));
  const report = [
    "# Hunts sem criaturas detectadas",
    "",
    `Gerado em ${importedAt}. Hunts: ${hunts.length}; sem criaturas: ${without.length}. Para curadoria manual (editar \`data/hunts.json\`).`,
    "",
    `## Nível 450+ (${high.length})`,
    "",
    ...high.map(line),
    "",
    `## Demais (${without.length - high.length})`,
    "",
    ...without.filter((h) => maxLevel(h) < 450).map(line),
    "",
    `## Slugs desviados (${deviated.length})`,
    "",
    "Nome repetido na wiki: o slug usa o título da página em vez do nome.",
    "",
    ...deviated.map((x) => `- ${x.kind} ${x.name}: ${x.slug} (página ${x.wikiTitle})`),
    "",
  ].join("\n");
  await writeFile(join(OUT, "relatorio-hunts.md"), report);

  const high450 = hunts.filter((h) => maxLevel(h) >= 450);
  console.log(
    `Pronto: ${creatures.length} criaturas, ${hunts.length} hunts (${hunts.length - without.length} com criaturas), ` +
      `${high450.length} hunts 450+ (${high.length} sem criaturas), ${weapons.length} armas.`,
  );
}

main().catch((e) => {
  console.error(e instanceof Error ? e.message : e);
  process.exit(1);
});
