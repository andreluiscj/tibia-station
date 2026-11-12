// Contratos dos JSON em data/ (fonte: .empresa/arquitetura.md, seção 3).
// Formato wiki de resistência: 100 = neutro, 80 = 20% de resistência, 110 = 10% de fraqueza; valor negativo = a criatura absorve.
// null = a wiki não informa o campo.

export type Element =
  "physical" | "earth" | "fire" | "energy" | "ice" | "holy" | "death" | "hpDrain" | "drown";

/** Os 7 elementos usados pelo motor Crypt e pela UI de resistência. */
export type ElementKey = "physical" | "earth" | "fire" | "energy" | "ice" | "holy" | "death";

export type ResistMap = Record<Element, number | null>;

// data/creatures.json -> Creature[]
export interface Creature {
  slug: string;
  name: string;
  wikiTitle: string;
  hp: number | null;
  exp: number | null;
  bestiaryClass: string | null;
  /** Dificuldade do bestiário em texto da wiki (Harmless, Trivial, Easy, Medium, Hard, Challenging). DIVERGE do contrato (number 1..4): a wiki nunca usa número. */
  bestiaryLevel: string | null;
  resist: ResistMap;
  /** Elementos que a wiki marca como não confirmados ("100%?"); o número fica em `resist`. */
  resistUnconfirmed: Element[];
  /** Página da wiki (atribuição CC BY-SA): https://tibia.fandom.com/wiki/<Título>. */
  sourceUrl: string;
}

// data/hunts.json -> Hunt[]
export interface HuntCreature {
  creatureSlug: string;
  /** > 0; inicial = aparições na página; editável (curadoria). */
  weight: number;
}
export interface Hunt {
  slug: string;
  name: string;
  wikiTitle: string;
  city: string | null;
  location: string | null;
  levelKnights: number | null;
  levelPaladins: number | null;
  levelMages: number | null;
  /** Adição aditiva (risco 9 da arquitetura): a wiki tem `lvlmonk`. */
  levelMonks: number | null;
  expRaw: string | null;
  lootRaw: string | null;
  creatures: HuntCreature[];
  /** Página da wiki (atribuição CC BY-SA). */
  sourceUrl: string;
}

// data/crypt-weapons.json -> CryptWeapon[] (4 itens)
export type CryptVocation = "knight" | "monk";
export type CryptCategory = "club" | "sword" | "axe" | "fist";
export type CryptElement = "fire" | "earth" | "energy";

export interface PierceSpec {
  physical: number;
  elemental: number;
}
export interface PerkOption {
  /** "<nível>.<índice 1-based>", ex.: "3.2". */
  id: string;
  text: string;
  pierce: PierceSpec;
}
export interface ProficiencyLevel {
  level: 1 | 2 | 3 | 4 | 5 | 6 | 7;
  options: PerkOption[];
}
export interface CryptWeapon {
  slug: string;
  name: string;
  wikiTitle: string;
  vocation: CryptVocation;
  category: CryptCategory;
  attack: number;
  defense: number;
  element: CryptElement | null;
  levelRequired: number;
  imbuementSlots: number;
  attributes: string[];
  perks: ProficiencyLevel[];
}

// Armas das tabelas weapons_melee (Knight) e weapons_hand (Monk), normalizadas por src/lib/data/weapons.ts.
// Concorrentes das Crypt: ataque físico + ataques elementares, sem pierce.
export interface AltWeapon {
  slug: string;
  name: string;
  vocation: CryptVocation;
  category: CryptCategory;
  /** Ataque físico. */
  attack: number;
  /** Elemento de maior ataque (só para exibição); null = só físico. */
  element: ElementKey | null;
  /** Ataque por elemento (todos os que a arma tem). */
  elements: Partial<Record<ElementKey, number>>;
  levelRequired: number;
  /** Espaços de imbuiment (coluna imbuiment); null = a tabela não informa. */
  imbuementSlots: number | null;
}

// data/sources.json -> Sources
export interface DatasetInfo {
  endpoint: string;
  license: string;
  licenseUrl: string | null;
  attribution: string;
  importedAt: string;
  count: number;
  /** Campos não confirmados na wiki; cryptWeapons: ["perks"] (fonte: docs/PLANO.md 5.2). */
  unconfirmedFields: string[];
}
export interface Sources {
  schemaVersion: 1;
  importer: { name: "scripts/import-wiki.ts"; version: string };
  datasets: { creatures: DatasetInfo; hunts: DatasetInfo; cryptWeapons: DatasetInfo };
}
