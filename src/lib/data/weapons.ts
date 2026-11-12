// Mapeia as linhas das tabelas weapons_melee (Knight) e weapons_hand (Monk) para o formato que o motor Crypt compara.
// Sem I/O: quem chama busca as linhas (useTabela). Linhas inválidas são ignoradas, nunca quebram a tela.
import { nomeDaArma, slugify } from "@/lib/storage";
import type { AltWeapon, ElementKey } from "./types";

type Linha = Record<string, unknown>;

const CLASSES = { 1: "axe", 2: "club", 3: "sword" } as const;
const ELEMENTOS_ATAQUE = ["earth", "fire", "energy", "ice", "holy", "death"] as const;
// Dicionário do banco. vocation (bitmask): 1 EK, 2 RP, 4 MS, 8 ED, 16 Exalted Monk. class: 1 Axe, 2 Club, 3 Sword.
const BIT_KNIGHT = 1;
const BIT_MONK = 16;
/** damage_type de weapons_hand: 1 Fire, 2 Energy, 3 Ice, 4 Earth, 5 Death, 6 Physical (outro valor ou nulo = Physical). */
const DANO_HAND: Partial<Record<number, ElementKey>> = {
  1: "fire",
  2: "energy",
  3: "ice",
  4: "earth",
  5: "death",
};

/** vocation nulo, ausente ou 0 = todas as vocações; senão o bit da vocação precisa estar ligado. */
const serveVocacao = (l: Linha, bit: number) => {
  const v = typeof l.vocation === "number" ? l.vocation : 0;
  return v === 0 || (v & bit) !== 0;
};

const num = (v: unknown) => (typeof v === "number" && Number.isFinite(v) && v > 0 ? v : 0);

const slots = (v: unknown) => (typeof v === "number" && Number.isInteger(v) && v >= 0 ? v : null);

function base(l: Linha) {
  const name = typeof l.item_name === "string" ? nomeDaArma(l.item_name) : "";
  return name ? { name, slug: slugify(name), levelRequired: num(l.level_minimum) } : null;
}

export function armasDeMelee(linhas: readonly object[]): AltWeapon[] {
  const out: AltWeapon[] = [];
  for (const x of linhas) {
    const l = x as Linha;
    const b = base(l);
    const category = CLASSES[l.class as keyof typeof CLASSES];
    if (!b || !category || !serveVocacao(l, BIT_KNIGHT)) continue;
    const attack = num(l.physical_attack);
    const elements: Partial<Record<ElementKey, number>> = {};
    for (const el of ELEMENTOS_ATAQUE) {
      const v = num(l[`${el}_attack`]);
      if (v > 0) elements[el] = v;
    }
    const dominante = (Object.entries(elements) as [ElementKey, number][]).sort(
      (x, y) => y[1] - x[1],
    )[0];
    if (attack === 0 && !dominante) continue;
    out.push({
      ...b,
      vocation: "knight",
      category,
      attack,
      element: dominante?.[0] ?? null,
      elements,
      imbuementSlots: slots(l.imbuiment),
    });
  }
  return out;
}

/** Monk: o ataque da arma é do tipo dado por damage_type (elemento ou Physical). */
export function armasDeHand(linhas: readonly object[]): AltWeapon[] {
  const out: AltWeapon[] = [];
  for (const x of linhas) {
    const l = x as Linha;
    const b = base(l);
    const ataque = num(l.attack);
    if (!b || ataque === 0 || !serveVocacao(l, BIT_MONK)) continue;
    const element = DANO_HAND[l.damage_type as number] ?? null;
    out.push({
      ...b,
      vocation: "monk",
      category: "fist",
      attack: element ? 0 : ataque,
      element,
      elements: element ? { [element]: ataque } : {},
      imbuementSlots: slots(l.imbuiment),
    });
  }
  return out;
}
