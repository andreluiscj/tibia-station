// Armas Crypt: atk, def, atributos, slots e elemento do pierce vêm da TibiaWiki (verificados na importação).
// Os perks por nível NÃO constam na wiki (verificado em 2026-11-11: Weapon Proficiency, Elemental Pierce, páginas
// das armas e categorias); fonte: docs/PLANO.md, seção 5.2. São constantes escritas à mão (dados, não código).
import type {
  CryptCategory,
  CryptElement,
  CryptVocation,
  CryptWeapon,
  PerkOption,
  PierceSpec,
  ProficiencyLevel,
} from "../../src/lib/data/types";
import { parseInfobox, parseInteger, plain, slugify } from "./wikitext";

export const CRYPT_PAGES = [
  "Crypt Breaker",
  "Crypt Slicer",
  "Crypt Splitter",
  "Crypt Strike",
] as const;

const CATEGORY_BY_TYPE: Record<string, CryptCategory> = {
  "club weapons": "club",
  "sword weapons": "sword",
  "axe weapons": "axe",
  "fist fighting weapons": "fist",
};

const PIERCE_CATEGORIES: Record<string, CryptElement> = {
  "fire pierce perk": "fire",
  "earth pierce perk": "earth",
  "energy pierce perk": "energy",
};

/** Elemento do pierce pelas categorias da página ("Fire Pierce Perk"). "Physical Pierce Perk" é ignorado (todas têm). */
export function pierceElementFromCategories(categories: string[]): CryptElement | null {
  for (const c of categories) {
    const el =
      PIERCE_CATEGORIES[
        c
          .replace(/^Category:/i, "")
          .trim()
          .toLowerCase()
      ];
    if (el) return el;
  }
  return null;
}

const ZERO: PierceSpec = { physical: 0, elemental: 0 };
const phys = (n: number): PierceSpec => ({ physical: n, elemental: 0 });
const elem = (n: number): PierceSpec => ({ physical: 0, elemental: n });

/** Monta os 7 níveis numerando os ids "<nível>.<índice 1-based>". */
function levels(spec: [string, PierceSpec][][]): ProficiencyLevel[] {
  return spec.map((opts, i) => ({
    level: (i + 1) as ProficiencyLevel["level"],
    options: opts.map(([text, pierce], j): PerkOption => ({
      id: `${i + 1}.${j + 1}`,
      text,
      pierce,
    })),
  }));
}

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

/** Perks do Knight; `x` = elemento do pierce da arma (PLANO.md 5.2). */
export function knightPerks(x: CryptElement): ProficiencyLevel[] {
  const X = cap(x);
  return levels([
    [["+1 weapon skill", ZERO]],
    [
      ["+100% Magic Level extra damage on auto-attack", ZERO],
      ["+5% life leech (Berserk)", ZERO],
      ["+12% armor penetration", ZERO],
    ],
    [
      [`+10% ${X} pierce`, elem(10)],
      ["+2% mana leech (Berserk)", ZERO],
      ["+6% Physical pierce", phys(6)],
    ],
    [
      ["+10% damage against targets above 95% HP", ZERO],
      ["+3% damage against Undead", ZERO],
      ["+2.5% damage against targets below 30% HP", ZERO],
    ],
    [
      [`+15% ${X} pierce`, elem(15)],
      ["+1 attack", ZERO],
      ["+16% armor penetration", ZERO],
    ],
    [
      ["+700% Magic Level extra healing", ZERO],
      ["+20% armor penetration", ZERO],
    ],
    [
      [`+20% ${X} pierce`, elem(20)],
      ["+8% Physical pierce", phys(8)],
    ],
  ]);
}

export function monkPerks(): ProficiencyLevel[] {
  return levels([
    [["+15% armor penetration", ZERO]],
    [
      ["+20% Magic Level extra damage", ZERO],
      ["+5% life leech (Flurry of Blows)", ZERO],
      ["+20% armor penetration", ZERO],
    ],
    [
      ["+4% damage against targets above 95% HP", ZERO],
      ["+2% mana leech", ZERO],
      ["+8% Physical pierce", phys(8)],
    ],
    [
      ["+10% damage against targets above 95% HP", ZERO],
      ["+3% damage against Undead", ZERO],
      ["+2.5% damage against targets below 30% HP", ZERO],
    ],
    [
      ["+1 attack", ZERO],
      ["+70% Magic Level extra healing", ZERO],
    ],
    [
      ["+10% extra critical damage", ZERO],
      ["+25% armor penetration", ZERO],
    ],
    [["+12% Physical pierce", phys(12)]],
  ]);
}

/** Monta a arma a partir do wikitext (Infobox Object) e das categorias; null se faltar dado essencial. */
export function buildCryptWeapon(
  title: string,
  wikitext: string,
  categories: string[],
): CryptWeapon | null {
  const box = parseInfobox(wikitext, "Infobox Object");
  if (!box) return null;
  const name = plain(box.name);
  const category = CATEGORY_BY_TYPE[plain(box.primarytype).toLowerCase()];
  const attack = parseInteger(box.attack);
  const defense = parseInteger(box.defense);
  if (!name || !category || attack === null || defense === null) return null;
  const vocation: CryptVocation = /monk/i.test(box.vocrequired ?? "") ? "monk" : "knight";
  const element = vocation === "monk" ? null : pierceElementFromCategories(categories);
  if (vocation === "knight" && !element) return null;
  return {
    slug: slugify(name),
    name,
    wikiTitle: title,
    vocation,
    category,
    attack,
    defense,
    element,
    levelRequired: parseInteger(box.levelrequired) ?? 450,
    imbuementSlots: parseInteger(box.imbueslots) ?? 3,
    attributes: plain(box.attrib)
      .split(",")
      .map((a) => a.trim())
      .filter(Boolean),
    perks: element ? knightPerks(element) : monkPerks(),
  };
}
