// Converte wikitext de criaturas e hunts nos tipos de src/lib/data/types.ts.
import type { Creature, Element, Hunt, HuntCreature, ResistMap } from "../../src/lib/data/types";
import {
  extractCreatureList,
  extractLinks,
  isUnconfirmed,
  parseInfobox,
  parseInteger,
  parsePercent,
  plain,
  slugify,
} from "./wikitext";

const WIKI = "https://tibia.fandom.com/wiki/";

/** URL da página na wiki (espaços viram _; a barra de subpáginas fica). */
export const wikiUrl = (title: string): string =>
  WIKI + encodeURIComponent(title.replace(/ /g, "_")).replace(/%2F/gi, "/");

const RESIST_FIELDS: Record<keyof ResistMap, string> = {
  physical: "physicalDmgMod",
  earth: "earthDmgMod",
  fire: "fireDmgMod",
  energy: "energyDmgMod",
  ice: "iceDmgMod",
  holy: "holyDmgMod",
  death: "deathDmgMod",
  hpDrain: "hpDrainDmgMod",
  drown: "drownDmgMod",
};

/** Criatura real = página com Infobox Creature e nome. Campos ausentes/inválidos viram null. */
export function parseCreature(title: string, wikitext: string): Creature | null {
  const box = parseInfobox(wikitext, "Infobox Creature");
  if (!box) return null;
  const name = plain(box.name) || title;
  const slug = slugify(name);
  if (!slug) return null;
  const resist = {} as ResistMap;
  const resistUnconfirmed: Element[] = [];
  for (const [key, field] of Object.entries(RESIST_FIELDS) as [keyof ResistMap, string][]) {
    resist[key] = parsePercent(box[field]);
    if (resist[key] !== null && isUnconfirmed(box[field])) resistUnconfirmed.push(key);
  }
  return {
    slug,
    name,
    wikiTitle: title,
    hp: parseInteger(box.hp),
    exp: parseInteger(box.exp),
    bestiaryClass: plain(box.bestiaryclass) || null,
    bestiaryLevel: plain(box.bestiarylevel) || null,
    resist,
    resistUnconfirmed,
    sourceUrl: wikiUrl(title),
  };
}

/**
 * Hunt = página com Infobox Hunt. Criaturas: itens de {{CreatureList}} (uma aparição = 1 de peso);
 * se a página não usa CreatureList, cai para links [[...]] que batem com criaturas conhecidas.
 */
export function parseHunt(
  title: string,
  wikitext: string,
  knownCreatures: ReadonlyMap<string, string>,
): Hunt | null {
  const box = parseInfobox(wikitext, "Infobox Hunt");
  if (!box) return null;
  const name = plain(box.name) || title;
  const slug = slugify(name);
  if (!slug) return null;

  const fromList = extractCreatureList(wikitext);
  const mentions = fromList.length > 0 ? fromList : extractLinks(wikitext);
  const counts = new Map<string, number>();
  for (const m of mentions) {
    const creatureSlug = knownCreatures.get(slugify(m));
    if (creatureSlug) counts.set(creatureSlug, (counts.get(creatureSlug) ?? 0) + 1);
  }
  const creatures: HuntCreature[] = [...counts].map(([creatureSlug, weight]) => ({
    creatureSlug,
    weight,
  }));

  return {
    slug,
    name,
    wikiTitle: title,
    city: plain(box.city) || null,
    location: plain(box.location) || null,
    levelKnights: parseInteger(box.lvlknights),
    levelPaladins: parseInteger(box.lvlpaladins),
    levelMages: parseInteger(box.lvlmages),
    levelMonks: parseInteger(box.lvlmonk),
    expRaw: plain(box.exp) || null,
    lootRaw: plain(box.loot) || null,
    creatures,
    sourceUrl: wikiUrl(title),
  };
}

/**
 * Garante slugs únicos: colisão entre nomes iguais (ex.: "Doctor Marrow" e "Doctor Marrow (Podzilla)")
 * troca o slug pelo do título da página. Se ainda colidir, lança (o importador nunca sobrescreve).
 */
export function uniqueBySlug<T extends { slug: string; wikiTitle: string }>(items: T[]): T[] {
  const groups = new Map<string, T[]>();
  for (const i of items) groups.set(i.slug, [...(groups.get(i.slug) ?? []), i]);
  const out: T[] = [];
  const taken = new Set<string>();
  for (const [slug, group] of groups) {
    group.sort((a, b) => a.wikiTitle.localeCompare(b.wikiTitle));
    group.forEach((item, idx) => {
      const s =
        group.length === 1 || (idx === 0 && slugify(item.wikiTitle) === slug)
          ? slug
          : slugify(item.wikiTitle);
      if (!s || taken.has(s))
        throw new Error(`Slug duplicado: ${s || "(vazio)"} (${item.wikiTitle})`);
      taken.add(s);
      out.push({ ...item, slug: s });
    });
  }
  return out.sort((a, b) => a.slug.localeCompare(b.slug));
}
