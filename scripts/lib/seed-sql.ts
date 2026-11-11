// Gera supabase/seed.sql a partir dos JSON (re-executável: insert ... on conflict do update).
// Texto vem da wiki (não confiável): escapado por duplicação de aspas simples; NUL removido.
import type {
  Creature,
  CryptWeapon,
  DatasetInfo,
  Element,
  Hunt,
  Sources,
} from "../../src/lib/data/types";

export const sqlText = (v: string | null): string =>
  v === null ? "NULL" : `'${v.split(String.fromCharCode(0)).join("").replace(/'/g, "''")}'`;
export const sqlNum = (v: number | null): string =>
  v === null || !Number.isFinite(v) ? "NULL" : String(v);
const sqlTextArray = (a: string[]): string => `ARRAY[${a.map(sqlText).join(", ")}]::text[]`;

function insert(table: string, columns: string[], keys: string[], rows: string[][]): string {
  if (rows.length === 0) return "";
  const update = columns.filter((c) => !keys.includes(c)).map((c) => `${c} = excluded.${c}`);
  const conflict = update.length
    ? `on conflict (${keys.join(", ")}) do update set ${update.join(", ")}`
    : `on conflict (${keys.join(", ")}) do nothing`;
  const out: string[] = [];
  for (let i = 0; i < rows.length; i += 500) {
    const chunk = rows.slice(i, i + 500).map((r) => `  (${r.join(", ")})`);
    out.push(
      `insert into public.${table} (${columns.join(", ")}) values\n${chunk.join(",\n")}\n${conflict};`,
    );
  }
  return out.join("\n") + "\n";
}

const sourceRow = (key: string, d: DatasetInfo, version: string) => [
  sqlText(key),
  sqlText(d.endpoint),
  sqlText(d.license),
  sqlText(d.licenseUrl),
  sqlText(d.attribution),
  `${sqlText(d.importedAt)}::timestamptz`,
  sqlNum(d.count),
  sqlText(version),
  sqlTextArray(d.unconfirmedFields),
];

const creatureRow = (c: Creature) => [
  sqlText(c.slug),
  sqlText(c.name),
  sqlText(c.wikiTitle),
  sqlText(c.sourceUrl),
  sqlNum(c.hp),
  sqlNum(c.exp),
  sqlText(c.bestiaryClass),
  sqlText(c.bestiaryLevel),
];

const resistRows = (c: Creature) =>
  Object.entries(c.resist)
    .filter(([, v]) => v !== null)
    .map(([el, v]) => [
      sqlText(c.slug),
      sqlText(el),
      sqlNum(v),
      String(!c.resistUnconfirmed.includes(el as Element)),
    ]);

const huntRow = (h: Hunt) => [
  sqlText(h.slug),
  sqlText(h.name),
  sqlText(h.wikiTitle),
  sqlText(h.sourceUrl),
  sqlText(h.city),
  sqlText(h.location),
  sqlNum(h.levelKnights),
  sqlNum(h.levelPaladins),
  sqlNum(h.levelMages),
  sqlNum(h.levelMonks),
  sqlText(h.expRaw),
  sqlText(h.lootRaw),
];

const weaponRow = (w: CryptWeapon) => [
  sqlText(w.slug),
  sqlText(w.name),
  sqlText(w.wikiTitle),
  sqlText(w.vocation),
  sqlText(w.category),
  sqlNum(w.attack),
  sqlNum(w.defense),
  sqlText(w.element),
  sqlNum(w.levelRequired),
  sqlNum(w.imbuementSlots),
  sqlTextArray(w.attributes),
];

const perkRows = (w: CryptWeapon) =>
  w.perks.flatMap((lv) =>
    lv.options.map((o) => [
      sqlText(w.slug),
      sqlNum(lv.level),
      o.id.split(".")[1],
      sqlText(o.text),
      sqlNum(o.pierce.physical),
      sqlNum(o.pierce.elemental),
    ]),
  );

export function buildSeed(
  creatures: Creature[],
  hunts: Hunt[],
  weapons: CryptWeapon[],
  sources: Sources,
): string {
  const { importer, datasets: d } = sources;
  const parts = [
    "-- Gerado por scripts/import-wiki.ts. Não editar à mão. Somente tabelas novas (ver migration).",
    "-- Re-executável: on conflict do update (sobrescreve linhas com o mesmo slug, inclusive pesos de hunts editados no banco).",
    "begin;",
    insert(
      "data_sources",
      [
        "dataset",
        "endpoint",
        "license",
        "license_url",
        "attribution",
        "imported_at",
        "record_count",
        "importer_version",
        "unconfirmed_fields",
      ],
      ["dataset"],
      [
        sourceRow("creatures", d.creatures, importer.version),
        sourceRow("hunts", d.hunts, importer.version),
        sourceRow("crypt_weapons", d.cryptWeapons, importer.version),
      ],
    ),
    insert(
      "creatures",
      ["slug", "name", "wiki_title", "source_url", "hp", "exp", "bestiary_class", "bestiary_level"],
      ["slug"],
      creatures.map(creatureRow),
    ),
    insert(
      "creature_resistances",
      ["creature_slug", "element", "percent", "confirmed"],
      ["creature_slug", "element"],
      creatures.flatMap(resistRows),
    ),
    insert(
      "hunts",
      [
        "slug",
        "name",
        "wiki_title",
        "source_url",
        "city",
        "location",
        "level_knights",
        "level_paladins",
        "level_mages",
        "level_monks",
        "exp_raw",
        "loot_raw",
      ],
      ["slug"],
      hunts.map(huntRow),
    ),
    insert(
      "hunt_creatures",
      ["hunt_slug", "creature_slug", "weight"],
      ["hunt_slug", "creature_slug"],
      hunts.flatMap((h) =>
        h.creatures.map((c) => [sqlText(h.slug), sqlText(c.creatureSlug), sqlNum(c.weight)]),
      ),
    ),
    insert(
      "crypt_weapons",
      [
        "slug",
        "name",
        "wiki_title",
        "vocation",
        "category",
        "attack",
        "defense",
        "element",
        "level_required",
        "imbuement_slots",
        "attributes",
      ],
      ["slug"],
      weapons.map(weaponRow),
    ),
    insert(
      "crypt_weapon_perks",
      ["weapon_slug", "level", "perk_index", "text", "pierce_physical", "pierce_elemental"],
      ["weapon_slug", "level", "perk_index"],
      weapons.flatMap(perkRows),
    ),
    "commit;",
    "",
  ];
  return parts.filter(Boolean).join("\n");
}
