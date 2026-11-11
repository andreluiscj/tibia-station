// Domain constants + helpers for Tibia Station.
import { supabase } from "@/integrations/supabase/client";

export {
  SUPABASE_URL,
  slugify,
  spriteUrl,
  emptySlotUrl,
  statIconUrl,
  imbuimentImageUrl,
  IMBUIMENT_ICON_URL,
} from "@/lib/storage";

export type VocationKey = "EK" | "RP" | "MS" | "ED" | "EM";

export const VOCATIONS: { key: VocationKey; label: string; bit: number }[] = [
  { key: "EK", label: "Elite Knight", bit: 1 },
  { key: "RP", label: "Royal Paladin", bit: 2 },
  { key: "MS", label: "Master Sorcerer", bit: 4 },
  { key: "ED", label: "Elder Druid", bit: 8 },
  { key: "EM", label: "Exalted Monk", bit: 16 },
];

export const LEVEL_PRESETS = [50, 100, 200, 300, 400, 500, 600, 800, 1000] as const;

export type ProtectionKey = "physical" | "fire" | "energy" | "ice" | "earth" | "death";
export const PROTECTIONS: { key: ProtectionKey; label: string }[] = [
  { key: "physical", label: "Physical" },
  { key: "fire", label: "Fire" },
  { key: "energy", label: "Energy" },
  { key: "ice", label: "Ice" },
  { key: "earth", label: "Earth" },
  { key: "death", label: "Death" },
];

// Background image for the character stats panel.
// Servidas a partir de public/images.
export const STATS_BG_URL = "/images/stats.png";
export const SKILLS_BG_URL = "/images/skills.png";
export const DEFENSE_BG_URL = "/images/defense.png";

export const EK_CLASSES = [
  { value: 1, label: "Axe" },
  { value: 2, label: "Club" },
  { value: 3, label: "Sword" },
] as const;

// Slot identifiers used on the grid
export type SlotKey =
  | "amulet"
  | "helmet"
  | "backpack"
  | "weapon"
  | "armor"
  | "shield"
  | "ring"
  | "legs"
  | "trinket"
  | "boots";

export interface SlotDef {
  key: SlotKey;
  label: string;
  emptyImage: string; // e.g. "amulet"
  row: number;
  col: number;
}

export const SLOT_LAYOUT: SlotDef[] = [
  { key: "amulet", label: "Amulet", emptyImage: "amulet", row: 1, col: 1 },
  { key: "helmet", label: "Helmet", emptyImage: "helmet", row: 1, col: 2 },
  { key: "backpack", label: "Backpack", emptyImage: "backpack", row: 1, col: 3 },
  { key: "weapon", label: "Weapon", emptyImage: "weapon", row: 2, col: 1 },
  { key: "armor", label: "Armor", emptyImage: "armor", row: 2, col: 2 },
  { key: "shield", label: "Shield", emptyImage: "shield", row: 2, col: 3 },
  { key: "ring", label: "Ring", emptyImage: "ring", row: 3, col: 1 },
  { key: "legs", label: "Legs", emptyImage: "legs", row: 3, col: 2 },
  { key: "trinket", label: "Extra", emptyImage: "trinket", row: 3, col: 3 },
  { key: "boots", label: "Boots", emptyImage: "boots", row: 4, col: 2 },
];

// Which table backs each slot for a given vocation
export function tableForSlot(slot: SlotKey, voc: VocationKey): string | null {
  switch (slot) {
    case "amulet":
      return "amulet";
    case "helmet":
      return "helmet";
    case "backpack":
      return "backpack";
    case "armor":
      return "armor";
    case "ring":
      return "ring";
    case "legs":
      return "legs";
    case "trinket":
      return "trinket";
    case "boots":
      return "boots";
    case "weapon":
      return voc === "EK"
        ? "weapons_melee"
        : voc === "RP"
          ? "weapons_distance"
          : voc === "MS"
            ? "weapons_wand"
            : voc === "ED"
              ? "weapons_rod"
              : "weapons_hand";
    case "shield":
      return voc === "EK"
        ? "shields_ek"
        : voc === "RP"
          ? "shields_quiver"
          : voc === "MS" || voc === "ED"
            ? "shields_spellbook"
            : null; // EM has no shield
  }
}

// Generic item shape after normalising rows we care about
export interface Item {
  id: number;
  item_name: string;
  level_minimum?: number | null;
  vocation?: number | null;
  class?: number | null;
  hand?: number | null;
  arm?: number | null;
  def?: number | null;
  defense?: number | null;
  attack?: number | null;
  physical_attack?: number | null;
  imbuiment?: number | null;
  physical?: number | null;
  fire?: number | null;
  energy?: number | null;
  ice?: number | null;
  earth?: number | null;
  death?: number | null;
  holy?: number | null;
  [k: string]: unknown;
}

// Where each imbuiment can be applied.
export type ImbuimentContext =
  | "weapon-melee-axe"
  | "weapon-melee-sword"
  | "weapon-melee-club"
  | "weapon-distance"
  | "weapon-wand"
  | "weapon-rod"
  | "weapon-hand"
  | "helmet"
  | "armor"
  | "shield"
  | "spellbook";

const ALL_MELEE: ImbuimentContext[] = [
  "weapon-melee-axe",
  "weapon-melee-sword",
  "weapon-melee-club",
];
const ALL_WEAPONS: ImbuimentContext[] = [
  ...ALL_MELEE,
  "weapon-distance",
  "weapon-wand",
  "weapon-rod",
  "weapon-hand",
];

export interface ImbuimentDef {
  name: string; // matches imbuiment_name in the table
  slug: string; // image file basename in the Imbuiments bucket
  benefit: string; // short label of the benefit
  contexts: ImbuimentContext[];
}

// Catalog of imbuiments supported by the app.
// The `imbuiment` table can enrich `benefit` at runtime; this is the fallback.
export const IMBUIMENT_CATALOG: ImbuimentDef[] = [
  { name: "Strike", slug: "strike", benefit: "Critical Hit", contexts: ALL_WEAPONS },
  { name: "Void", slug: "void", benefit: "Mana Leech", contexts: [...ALL_WEAPONS, "helmet"] },
  {
    name: "Vampirism",
    slug: "vampirism",
    benefit: "Life Leech",
    contexts: [...ALL_WEAPONS, "armor"],
  },
  { name: "Chop", slug: "chop", benefit: "Axe Fighting", contexts: ["weapon-melee-axe", "helmet"] },
  {
    name: "Slash",
    slug: "slash",
    benefit: "Sword Fighting",
    contexts: ["weapon-melee-sword", "helmet"],
  },
  {
    name: "Bash",
    slug: "bash",
    benefit: "Club Fighting",
    contexts: ["weapon-melee-club", "helmet"],
  },
  {
    name: "Precision",
    slug: "precision",
    benefit: "Distance Fighting",
    contexts: ["weapon-distance", "helmet"],
  },
  {
    name: "Epiphany",
    slug: "epiphany",
    benefit: "Magic Level",
    contexts: ["helmet", "weapon-wand", "weapon-rod"],
  },
  { name: "Scorch", slug: "scorch", benefit: "Magic Level", contexts: ["spellbook"] },
  { name: "Punch", slug: "punch", benefit: "Fist Fighting", contexts: ["weapon-hand", "helmet"] },
  { name: "Blockade", slug: "blockade", benefit: "Shielding", contexts: ["shield"] },
  // Elemental defenses — available on armors and shields.
  {
    name: "Cloud Fabric",
    slug: "cloud-fabric",
    benefit: "Energy Protection",
    contexts: ["armor", "shield"],
  },
  {
    name: "Demon Presence",
    slug: "demon-presence",
    benefit: "Holy Protection",
    contexts: ["armor", "shield"],
  },
  {
    name: "Dragon Hide",
    slug: "dragon-hide",
    benefit: "Fire Protection",
    contexts: ["armor", "shield"],
  },
  {
    name: "Lich Shroud",
    slug: "lich-shroud",
    benefit: "Death Protection",
    contexts: ["armor", "shield"],
  },
  {
    name: "Quara Scale",
    slug: "quara-scale",
    benefit: "Ice Protection",
    contexts: ["armor", "shield"],
  },
  {
    name: "Snake Skin",
    slug: "snake-skin",
    benefit: "Earth Protection",
    contexts: ["armor", "shield"],
  },
];

// Resolve which imbuiment context applies to a given slot + vocation + item.
export function slotImbuimentContext(
  slot: SlotKey,
  vocation: VocationKey,
  item?: Item,
): ImbuimentContext | null {
  if (slot === "helmet") return "helmet";
  if (slot === "armor") return "armor";
  if (slot === "weapon") {
    if (vocation === "EK") {
      const c = (item?.class as number | undefined) ?? null;
      if (c === 1) return "weapon-melee-axe";
      if (c === 2) return "weapon-melee-club";
      if (c === 3) return "weapon-melee-sword";
      return "weapon-melee-axe";
    }
    if (vocation === "RP") return "weapon-distance";
    if (vocation === "MS") return "weapon-wand";
    if (vocation === "ED") return "weapon-rod";
    if (vocation === "EM") return "weapon-hand";
  }
  if (slot === "shield") {
    if (vocation === "EK" || vocation === "RP") return "shield";
    if (vocation === "MS" || vocation === "ED") return "spellbook";
  }
  return null;
}

export function allowedImbuiments(ctx: ImbuimentContext | null): ImbuimentDef[] {
  if (!ctx) return [];
  return IMBUIMENT_CATALOG.filter((i) => i.contexts.includes(ctx));
}

// Filter a set of items by vocation bitmask (bit-and > 0, or vocation null/0 = all)
export function matchesVocation(item: Item, vocBit: number): boolean {
  const v = item.vocation ?? null;
  if (v === null || v === 0) return true;
  return (v & vocBit) !== 0;
}

export function matchesLevel(item: Item, level: number): boolean {
  return (item.level_minimum ?? 0) <= level;
}

// Return the "protection score" of an item for a chosen element
export function protectionScore(item: Item, key: ProtectionKey): number {
  return (item[key] as number | null | undefined) ?? 0;
}

// Rank by generic power (used for level presets when no protection is chosen)
export function powerScore(item: Item, slot: SlotKey): number {
  if (slot === "weapon") {
    return (item.physical_attack as number | undefined) ?? (item.attack as number | undefined) ?? 0;
  }
  if (slot === "shield") {
    return (item.def as number | undefined) ?? (item.defense as number | undefined) ?? 0;
  }
  return (item.arm as number | undefined) ?? 0;
}

export async function fetchTable(table: string): Promise<Item[]> {
  const { data, error } = await supabase.from(table as never).select("*");
  if (error) throw error;
  const rows = (data ?? []) as unknown as Record<string, unknown>[];
  return rows.map((r) => {
    // normalise id column
    const idKey = Object.keys(r).find((k) => k.startsWith("id_"));
    return { ...r, id: idKey ? (r[idKey] as number) : 0 } as Item;
  });
}

export interface Filters {
  vocation: VocationKey;
  level: number; // 0 = no level constraint
  ekClass?: number | null; // only for EK weapons/rings
}

export function applyBaseFilters(items: Item[], slot: SlotKey, filters: Filters): Item[] {
  const voc = VOCATIONS.find((v) => v.key === filters.vocation)!;
  return items.filter((it) => {
    if (!matchesVocation(it, voc.bit)) return false;
    if (filters.level > 0 && !matchesLevel(it, filters.level)) return false;
    // EK class filter applies to weapons_melee and ring (which have class column)
    if (
      filters.vocation === "EK" &&
      filters.ekClass &&
      (slot === "weapon" || slot === "ring") &&
      it.class != null &&
      it.class !== filters.ekClass
    ) {
      return false;
    }
    return true;
  });
}

export const FIXED_AMULET_BY_VOCATION: Record<VocationKey, string> = {
  EK: "Enchanted Turtle Amulet",
  RP: "Enchanted Pendulet",
  MS: "Enchanted Theurgic Amulet",
  ED: "Enchanted Theurgic Amulet",
  EM: "Enchanted Merudri Amulet",
};

// Level-50 ring overrides. For EK the ring depends on the chosen weapon class.
const EK_CLASS_RING: Record<number, string> = {
  1: "Axe Ring",
  2: "Club Ring",
  3: "Sword Ring",
};
function level50Ring(filters: Filters): string | null {
  if (filters.level !== 50) return null;
  if (filters.vocation === "EM") return "Power Ring";
  if (filters.vocation === "EK" && filters.ekClass) {
    return EK_CLASS_RING[filters.ekClass] ?? null;
  }
  return null;
}

// Physical-protection armor overrides for RP and EM.
const PHYSICAL_ARMOR_BY_VOCATION: Partial<Record<VocationKey, string>> = {
  RP: "Soulshell",
  EM: "Soulgarb",
};

// Pick the best single item for a slot given filters + optional protection focus.
export function pickBest(
  items: Item[],
  slot: SlotKey,
  filters: Filters,
  protection: ProtectionKey | null,
): Item | null {
  // Backpack slot: always use Backpack of Holding for presets.
  if (slot === "backpack") {
    const match = items.find((it) => it.item_name === "Backpack of Holding");
    if (match) return match;
  }
  // Level-50 ring override: fixed rings per vocation (and EK weapon class).
  if (slot === "ring") {
    const target = level50Ring(filters);
    if (target) {
      const match = items.find((it) => it.item_name === target);
      if (match) return match;
    }
  }
  // Physical armor override for RP (Soulshell) and EM (Soulgarb) when level allows.
  if (slot === "armor" && protection === "physical") {
    const target = PHYSICAL_ARMOR_BY_VOCATION[filters.vocation];
    if (target) {
      const match = items.find((it) => it.item_name === target);
      if (match && (filters.level === 0 || matchesLevel(match, filters.level))) {
        return match;
      }
    }
  }
  // RP + Physical: bow should be the strongest one the level permits,
  // ignoring protection focus for the weapon slot.
  if (slot === "weapon" && protection === "physical" && filters.vocation === "RP") {
    return pickBest(items, slot, filters, null);
  }
  const pool = applyBaseFilters(items, slot, filters);
  if (pool.length === 0) return null;
  const scored = pool
    .map((it) => {
      // Ordering: prefer higher level_minimum, then higher ID.
      // When a protection focus is set, that score takes precedence.
      const primary = protection ? protectionScore(it, protection) : 0;
      const level = it.level_minimum ?? 0;
      const id = it.id ?? 0;
      return { it, primary, level, id };
    })
    .sort((a, b) => b.primary - a.primary || b.level - a.level || b.id - a.id);
  return scored[0]?.it ?? null;
}
