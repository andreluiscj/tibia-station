// Motor de cálculo Crypt (contrato: .empresa/arquitetura.md, seção 5.3). Funções puras, sem I/O.
import type {
  AltWeapon,
  Creature,
  CryptVocation,
  CryptWeapon,
  ElementKey,
  Hunt,
  PierceSpec,
} from "@/lib/data/types";
import type { VocationKey } from "@/lib/tibia";
import { applyPiercing } from "./pierce";
import type {
  Combo,
  ComboResult,
  EvaluateOptions,
  ModeComparison,
  PierceMode,
  PresetKey,
  RankedEvaluation,
  Resist7,
  Target,
  TargetValue,
  WeaponEvaluation,
} from "./types";

type PierceLevel = 3 | 5 | 7;
interface Pick {
  level: PierceLevel;
  perkId: string;
  pierce: PierceSpec;
}

/** Só os níveis 3, 5 e 7 alteram o pierce. */
const PIERCE_LEVELS: readonly PierceLevel[] = [3, 5, 7];
const ELEMENTS: readonly ElementKey[] = [
  "physical",
  "earth",
  "fire",
  "energy",
  "ice",
  "holy",
  "death",
];
const BASELINE_ELEMENTS: readonly ElementKey[] = [
  "fire",
  "earth",
  "energy",
  "ice",
  "holy",
  "death",
];
const MODE_DIFF_EPS = 0.005;
const TIE_EPS = 1e-9;
/** Diferença de best abaixo da qual a UI trata duas armas como empatadas (só exibição; a ordenação não muda). */
export const TIE_DISPLAY_EPS = 0.05;

const pierceKey = (p: PierceSpec) => `${p.physical}/${p.elemental}`;
const isZero = (p: PierceSpec) => p.physical === 0 && p.elemental === 0;
const samePierce = (a: PierceSpec, b: PierceSpec) =>
  a.physical === b.physical && a.elemental === b.elemental;

export function cryptVocation(v: VocationKey): CryptVocation | null {
  if (v === "EK") return "knight";
  if (v === "EM") return "monk";
  return null;
}

// --- validação ---------------------------------------------------------------------------------

function checkWeapon(weapon: CryptWeapon): void {
  const ok =
    weapon.perks.length === 7 &&
    weapon.perks.every((p, i) => p.level === i + 1 && p.options.length > 0);
  if (!ok)
    throw new RangeError(
      `A arma ${weapon.slug} precisa ter exatamente 7 níveis de proficiência com opções.`,
    );
}

function checkMaxLevel(n: number): void {
  if (!Number.isInteger(n) || n < 1 || n > 7)
    throw new RangeError("O nível máximo de proficiência deve ser um inteiro de 1 a 7.");
}

function checkWeight(weight: number): void {
  if (!Number.isFinite(weight) || weight <= 0)
    throw new RangeError("O peso do alvo deve ser um número finito maior que zero.");
}

function checkTargets(targets: readonly Target[]): void {
  if (targets.length === 0) throw new RangeError("Informe ao menos um alvo.");
  for (const t of targets) {
    checkWeight(t.weight);
    for (const el of ELEMENTS) {
      if (!Number.isFinite(t.resist[el]))
        throw new RangeError(`Resistência inválida em ${t.id} (${el}).`);
    }
  }
}

// --- combinações e presets ---------------------------------------------------------------------

function buildCombo(weapon: CryptWeapon, picks: readonly Pick[]): Combo {
  const pierce = picks.reduce<PierceSpec>(
    (s, p) => ({
      physical: s.physical + p.pierce.physical,
      elemental: s.elemental + p.pierce.elemental,
    }),
    { physical: 0, elemental: 0 },
  );
  return {
    choices: picks
      .filter((p) => !isZero(p.pierce))
      .map((p) => ({ level: p.level, perkId: p.perkId })),
    pierce,
    imbued: weapon.element !== null && pierce.elemental > 0,
  };
}

/** Opções do nível, deduplicadas por pierce (as sem pierce colapsam numa só; vale a de menor índice). */
function levelPicks(weapon: CryptWeapon, level: PierceLevel): Pick[] {
  const seen = new Set<string>();
  const out: Pick[] = [];
  for (const o of weapon.perks[level - 1].options) {
    const k = pierceKey(o.pierce);
    if (seen.has(k)) continue;
    seen.add(k);
    out.push({ level, perkId: o.id, pierce: o.pierce });
  }
  return out;
}

export function enumerateCombos(weapon: CryptWeapon, maxProficiencyLevel = 7): Combo[] {
  checkMaxLevel(maxProficiencyLevel);
  checkWeapon(weapon);
  const lists = PIERCE_LEVELS.filter((l) => l <= maxProficiencyLevel).map((l) =>
    levelPicks(weapon, l),
  );
  let product: Pick[][] = [[]];
  for (const list of lists)
    product = product.flatMap((prefix) => list.map((pick) => [...prefix, pick]));
  const seen = new Set<string>();
  const combos: Combo[] = [];
  for (const picks of product) {
    const combo = buildCombo(weapon, picks);
    const k = pierceKey(combo.pierce);
    if (seen.has(k)) continue;
    seen.add(k);
    combos.push(combo);
  }
  return combos;
}

/** Melhor opção do nível por um critério (empate: menor índice); null se não há valor > 0. */
function bestBy(weapon: CryptWeapon, level: PierceLevel, field: keyof PierceSpec): Pick | null {
  let best: Pick | null = null;
  for (const o of weapon.perks[level - 1].options) {
    if (o.pierce[field] > 0 && (best === null || o.pierce[field] > best.pierce[field])) {
      best = { level, perkId: o.id, pierce: o.pierce };
    }
  }
  return best;
}

/**
 * Presets resolvidos sobre os perks do JSON, nos níveis <= maxProficiencyLevel.
 * elemental/hybrid exigem pierce > 0 em todos os níveis considerados (senão null); physical sempre existe.
 */
// O tipo garante que o preset físico sempre existe (buildCombo devolve um Combo mesmo sem nenhum pierce).
type PresetCombos = Record<Exclude<PresetKey, "physical">, Combo | null> & { physical: Combo };

function presetCombos(weapon: CryptWeapon, max: number): PresetCombos {
  const levels = PIERCE_LEVELS.filter((l) => l <= max);
  const all = (pick: (l: PierceLevel) => Pick | null): Combo | null => {
    if (weapon.element === null || levels.length === 0) return null;
    const picks = levels.map(pick);
    return picks.every((p): p is Pick => p !== null) ? buildCombo(weapon, picks as Pick[]) : null;
  };
  const physicalPicks = levels
    .map((l) => bestBy(weapon, l, "physical"))
    .filter((p): p is Pick => p !== null);
  return {
    elemental: all((l) => bestBy(weapon, l, "elemental")),
    hybrid: all((l) => (l === 3 ? bestBy(weapon, l, "physical") : bestBy(weapon, l, "elemental"))),
    physical: buildCombo(weapon, physicalPicks),
  };
}

// --- avaliação ---------------------------------------------------------------------------------

function targetValue(
  weapon: CryptWeapon,
  combo: Combo,
  t: Target,
  mode: PierceMode,
  share: number,
): TargetValue {
  const phys = applyPiercing(t.resist.physical, combo.pierce.physical, mode);
  let damagePct = phys;
  let absorbs = t.resist.physical < 0;
  if (combo.imbued && weapon.element !== null) {
    const r = t.resist[weapon.element];
    damagePct = (1 - share) * phys + share * applyPiercing(r, combo.pierce.elemental, mode);
    absorbs = absorbs || r < 0;
  }
  return { targetId: t.id, damagePct, absorbs };
}

function evaluateCombo(
  weapon: CryptWeapon,
  combo: Combo,
  targets: readonly Target[],
  mode: PierceMode,
  share: number,
  presets: Record<PresetKey, Combo | null>,
): ComboResult {
  const perTarget = targets.map((t) => targetValue(weapon, combo, t, mode, share));
  const totalWeight = targets.reduce((s, t) => s + t.weight, 0);
  const damagePct =
    perTarget.reduce((s, v, i) => s + targets[i].weight * v.damagePct, 0) / totalWeight;
  const preset = (["elemental", "hybrid", "physical"] as const).find((k) => {
    const p = presets[k];
    return p !== null && samePierce(p.pierce, combo.pierce);
  });
  return { preset: preset ?? null, combo, damagePct, perTarget };
}

/** Maior dano primeiro; empate: mais pierce elemental, depois mais físico. */
const byBest = (a: ComboResult, b: ComboResult) =>
  Math.abs(a.damagePct - b.damagePct) > TIE_EPS
    ? b.damagePct - a.damagePct
    : b.combo.pierce.elemental - a.combo.pierce.elemental ||
      b.combo.pierce.physical - a.combo.pierce.physical;

export function evaluateWeapon(
  weapon: CryptWeapon,
  targets: readonly Target[],
  options: EvaluateOptions = {},
): WeaponEvaluation {
  const {
    mode = "official",
    elementalShare = 0.5,
    baseline: baselineOpt = 100,
    maxProficiencyLevel = 7,
  } = options;
  const baseline = typeof baselineOpt === "function" ? baselineOpt(weapon) : baselineOpt;
  if (!Number.isFinite(elementalShare) || elementalShare < 0 || elementalShare > 1) {
    throw new RangeError("elementalShare deve estar entre 0 e 1.");
  }
  if (!Number.isFinite(baseline)) throw new RangeError("O baseline deve ser um número finito.");
  checkTargets(targets);

  const combos = enumerateCombos(weapon, maxProficiencyLevel);
  const presets = presetCombos(weapon, maxProficiencyLevel);
  const evaluate = (c: Combo) => evaluateCombo(weapon, c, targets, mode, elementalShare, presets);
  const ranked = combos.map(evaluate).sort(byBest);
  const [best, secondBest = null] = ranked;
  const neutralElements = new Set(targets.flatMap((t) => t.assumedNeutral));

  return {
    weaponSlug: weapon.slug,
    mode,
    elementalShare,
    baseline,
    presets: {
      elemental: presets.elemental && evaluate(presets.elemental),
      hybrid: presets.hybrid && evaluate(presets.hybrid),
      physical: evaluate(presets.physical),
    },
    best,
    secondBest,
    diffToSecondPct:
      secondBest && secondBest.damagePct > 0
        ? (best.damagePct / secondBest.damagePct - 1) * 100
        : null,
    verdict: best.damagePct > baseline ? "worth" : "not_worth",
    assumedNeutral: ELEMENTS.filter((e) => neutralElements.has(e)),
  };
}

export function compareModes(
  weapon: CryptWeapon,
  targets: readonly Target[],
  options: Omit<EvaluateOptions, "mode"> = {},
): ModeComparison {
  const official = evaluateWeapon(weapon, targets, { ...options, mode: "official" });
  const reference = evaluateWeapon(weapon, targets, { ...options, mode: "reference" });
  const apart = (a: ComboResult | null, b: ComboResult | null) =>
    a === null || b === null ? a !== b : Math.abs(a.damagePct - b.damagePct) > MODE_DIFF_EPS;
  const differs =
    apart(official.best, reference.best) ||
    (["elemental", "hybrid", "physical"] as const).some((k) =>
      apart(official.presets[k], reference.presets[k]),
    );
  return { official, reference, differs };
}

export function rankWeapons(
  weapons: readonly CryptWeapon[],
  targets: readonly Target[],
  options: EvaluateOptions = {},
): RankedEvaluation[] {
  const evaluated = weapons
    .map((weapon) => ({ weapon, evaluation: evaluateWeapon(weapon, targets, options) }))
    .sort((a, b) => {
      const d = b.evaluation.best.damagePct - a.evaluation.best.damagePct;
      return Math.abs(d) > TIE_EPS ? d : a.weapon.slug.localeCompare(b.weapon.slug);
    });
  // Grupos de empate de exibição: o líder do grupo define o displayRank (competição: 1, 2, 2, 4...).
  const leaderOf: number[] = [];
  evaluated.forEach((e, i) => {
    const leader = i === 0 ? 0 : leaderOf[i - 1];
    const sameGroup =
      i > 0 &&
      Math.abs(evaluated[leader].evaluation.best.damagePct - e.evaluation.best.damagePct) <
        TIE_DISPLAY_EPS;
    leaderOf.push(sameGroup ? leader : i);
  });
  return evaluated.map((e, i) => {
    const next = evaluated[i + 1]?.evaluation.best.damagePct;
    return {
      ...e,
      rank: i + 1,
      displayRank: leaderOf[i] + 1,
      tied: leaderOf.filter((l) => l === leaderOf[i]).length > 1,
      advantageOverNextPct:
        next !== undefined && next > 0 ? (e.evaluation.best.damagePct / next - 1) * 100 : null,
    };
  });
}

// --- adaptadores de dados ----------------------------------------------------------------------

export function creatureToTarget(creature: Creature, weight = 1): Target {
  checkWeight(weight);
  const assumedNeutral: ElementKey[] = [];
  const resist = {} as Resist7;
  for (const el of ELEMENTS) {
    const v = creature.resist[el];
    if (v === null) assumedNeutral.push(el);
    resist[el] = v ?? 100;
  }
  return { id: creature.slug, name: creature.name, resist, weight, assumedNeutral };
}

export interface HuntTargetsOptions {
  /** "equal" (padrão): cada criatura conta igual, como a calculadora de referência; "weighted": usa o weight da hunt. */
  weighting?: "equal" | "weighted";
}

export function huntToTargets(
  hunt: Hunt,
  creaturesBySlug: ReadonlyMap<string, Creature>,
  options: HuntTargetsOptions = {},
): Target[] {
  const { weighting = "equal" } = options;
  return hunt.creatures.flatMap((hc) => {
    const c = creaturesBySlug.get(hc.creatureSlug);
    return c ? [creatureToTarget(c, weighting === "weighted" ? hc.weight : 1)] : [];
  });
}

/** Arma alternativa 100% elemental sem pierce: o elemento mais fraco (maior %) pela média ponderada. */
export function plainElementBaseline(
  targets: readonly Target[],
  elements: readonly ElementKey[] = BASELINE_ELEMENTS,
): { element: ElementKey; damagePct: number } {
  checkTargets(targets);
  if (elements.length === 0) throw new RangeError("Informe ao menos um elemento.");
  const totalWeight = targets.reduce((s, t) => s + t.weight, 0);
  const mean = (el: ElementKey) =>
    targets.reduce((s, t) => s + t.weight * t.resist[el], 0) / totalWeight;
  return elements.reduce<{ element: ElementKey; damagePct: number }>(
    (best, el) => {
      const damagePct = mean(el);
      return damagePct > best.damagePct ? { element: el, damagePct } : best;
    },
    { element: elements[0], damagePct: mean(elements[0]) },
  );
}

/**
 * Dano de uma arma Soul War / Sanguine na mesma escala do dano da Crypt: (ataque físico × resist. física +
 * ataque elemental × resist. do elemento) ÷ `refAttack` (ataque da Crypt), média ponderada dos alvos. Sem pierce.
 */
export function altDamagePct(a: AltWeapon, targets: readonly Target[], refAttack: number): number {
  checkTargets(targets);
  const totalWeight = targets.reduce((s, t) => s + t.weight, 0);
  return (
    targets.reduce(
      (s, t) =>
        s +
        (t.weight *
          (a.attack * t.resist.physical +
            (a.element ? a.elementAttack * t.resist[a.element] : 0))) /
          refAttack,
      0,
    ) / totalWeight
  );
}

/** Concorrentes elegíveis: mesma vocação e categoria da Crypt, e que o nível do jogador já permite usar. */
export const eligibleAlternatives = (
  weapon: CryptWeapon,
  alts: readonly AltWeapon[],
  playerLevel: number,
) =>
  alts.filter(
    (a) =>
      a.vocation === weapon.vocation &&
      a.category === weapon.category &&
      a.levelRequired <= playerLevel,
  );

/** Melhor concorrente (Soul War / Sanguine) da mesma vocação e categoria que o jogador já pode usar; null se nenhuma serve. */
export function bestAlternative(
  weapon: CryptWeapon,
  alts: readonly AltWeapon[],
  targets: readonly Target[],
  playerLevel: number,
): { alt: AltWeapon; damagePct: number } | null {
  return eligibleAlternatives(weapon, alts, playerLevel)
    .map((alt) => ({ alt, damagePct: altDamagePct(alt, targets, weapon.attack) }))
    .reduce<{ alt: AltWeapon; damagePct: number } | null>(
      (best, c) => (best === null || c.damagePct > best.damagePct ? c : best),
      null,
    );
}
