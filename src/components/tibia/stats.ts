// Contas do painel de atributos do personagem (funções puras; a lógica é a do antigo CharacterStats.tsx).
import type { Item } from "@/lib/tibia";

export type SkillKey =
  "level" | "magic" | "fist" | "club" | "sword" | "axe" | "distance" | "shielding";

export type DefKey =
  "physical" | "fire" | "earth" | "energy" | "ice" | "holy" | "death" | "life_drain" | "mana_drain";

export const SKILL_KEYS: SkillKey[] = [
  "level",
  "magic",
  "fist",
  "club",
  "sword",
  "axe",
  "distance",
  "shielding",
];

export const SKILLS_ZERADAS: Record<SkillKey, number> = {
  level: 0,
  magic: 0,
  fist: 0,
  club: 0,
  sword: 0,
  axe: 0,
  distance: 0,
  shielding: 0,
};

/** Colunas de bônus de Magic Level por elemento (somam em cima do Magic Level base). */
export const MAGIC_SUB_COLUMNS = [
  "fire_magic_level",
  "energy_magic_level",
  "ice_magic_level",
  "earth_magic_level",
  "holy_magic_level",
  "death_magic_level",
  "healing_magic_level",
] as const;

// skill_type é uma máscara de bits: cada bit aponta para uma habilidade.
const SKILL_TYPE_BITS: { bit: number; key: SkillKey }[] = [
  { bit: 1, key: "axe" },
  { bit: 2, key: "club" },
  { bit: 4, key: "sword" },
  { bit: 8, key: "shielding" },
  { bit: 16, key: "distance" },
  { bit: 32, key: "fist" },
  { bit: 64, key: "magic" },
];

export function skillsFromType(mask: number | null | undefined): SkillKey[] {
  if (!mask) return [];
  return SKILL_TYPE_BITS.filter((b) => (mask & b.bit) !== 0).map((b) => b.key);
}

export function toNumber(value: unknown): number {
  if (typeof value === "number") return Number.isFinite(value) ? value : 0;
  if (typeof value === "string" && value.trim().length > 0) {
    const n = Number(value.replace(",", "."));
    return Number.isFinite(n) ? n : 0;
  }
  return 0;
}

export function somar(items: Item[], key: string): number {
  let s = 0;
  for (const it of items) s += toNumber(it[key]);
  return s;
}

/** Fração do banco (0 a 1) em porcentagem com sinal: 0.1 vira "+10%". */
export function fmtPct(n: number): string {
  if (!n) return "0%";
  const v = n * 100;
  const rounded = Math.abs(v - Math.round(v)) < 0.05 ? Math.round(v) : Math.round(v * 10) / 10;
  const sign = v > 0 ? "+" : "";
  return `${sign}${rounded}%`;
}

export interface Augment {
  text: string;
  itemName: string;
}

export interface Stats {
  skills: Record<SkillKey, number>;
  def: Record<DefKey, number>;
  armor: number;
  defence: number;
  mantra: number;
  magicSubs: { column: (typeof MAGIC_SUB_COLUMNS)[number]; bonus: number }[];
  augments: Augment[];
}

/** Soma itens equipados e imbuiments sobre as skills base do jogador. */
export function calcularStats(items: Item[], base: Record<SkillKey, number>): Stats {
  const def: Record<DefKey, number> = {
    physical: somar(items, "physical"),
    fire: somar(items, "fire"),
    earth: somar(items, "earth"),
    energy: somar(items, "energy"),
    ice: somar(items, "ice"),
    holy: somar(items, "holy"),
    death: somar(items, "death"),
    life_drain: somar(items, "life_drain"),
    mana_drain: somar(items, "mana_drain"),
  };
  const defence = items.reduce(
    (a, it) =>
      a + ((it.def as number | null | undefined) ?? (it.defense as number | null | undefined) ?? 0),
    0,
  );
  const magicSubs = MAGIC_SUB_COLUMNS.map((column) => ({
    column,
    bonus: somar(items, column),
  })).filter((r) => r.bonus !== 0);

  const skills: Record<SkillKey, number> = { ...SKILLS_ZERADAS, ...base };
  for (const it of items) {
    const pairs: [unknown, unknown][] = [
      [it.skill, it.skill_type],
      [it.skill_1, it.skill_type_1],
      [it.skill_2, it.skill_type_2],
    ];
    for (const [v, t] of pairs) {
      const value = toNumber(v);
      const type = toNumber(t);
      if (!value || !type) continue;
      for (const b of skillsFromType(type)) skills[b] += value;
    }
  }

  const augments: Augment[] = [];
  for (const it of items) {
    for (let i = 1; i <= 8; i++) {
      const raw = it[`bonus_${i}`];
      if (typeof raw === "string" && raw.trim().length > 0) {
        const itemName =
          (it.item_name as string | undefined) ?? (it.imbuiment_name as string | undefined) ?? "";
        augments.push({ text: raw.trim(), itemName });
      }
    }
  }

  return {
    skills,
    def,
    armor: somar(items, "arm"),
    defence,
    mantra: somar(items, "mantra"),
    magicSubs,
    augments,
  };
}
