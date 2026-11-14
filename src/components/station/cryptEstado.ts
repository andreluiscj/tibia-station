import { createContext } from "react";
import {
  creatureToTarget,
  altDamagePct,
  bestAlternative,
  eligibleAlternatives,
  huntToTargets,
  rankWeapons,
} from "@/lib/crypt/engine";
import type { ComboResult, RankedEvaluation, Target, WeaponEvaluation } from "@/lib/crypt/types";
import type { AltWeapon, Creature, CryptWeapon, Hunt, PierceSpec } from "@/lib/data/types";
import { ELEMENTOS } from "./elementos";
import type { ResultMode } from "./ResultCard";

// --- estado na URL -------------------------------------------------------------------------------

export type CryptVoc = "ek" | "monk";
export type CryptCat = "club" | "sword" | "axe" | "todas";

/** Parâmetros da URL (todos opcionais; ausente = padrão). */
export interface CryptSearch {
  voc?: CryptVoc;
  cat?: CryptCat;
  lvl?: number;
  monster?: string;
  hunt?: string;
  /** 1 = média da hunt ponderada pelo peso da criatura; ausente = média simples (padrão). */
  peso?: 1;
}

const SLUG = /^[a-z0-9-]{1,100}$/;
const slug = (v: unknown) => (typeof v === "string" || typeof v === "number" ? String(v) : "");
const inteiro = (v: unknown) => (v === "" || v === null ? NaN : Number(v));

/** Valida a URL: só aceita valores conhecidos; o resto é descartado, nunca quebra a tela. */
export function parseSearch(entrada: object): CryptSearch {
  const raw = entrada as Record<string, unknown>;
  const out: CryptSearch = {};
  if (raw.voc === "ek" || raw.voc === "monk") out.voc = raw.voc;
  if (raw.cat === "club" || raw.cat === "sword" || raw.cat === "axe" || raw.cat === "todas")
    out.cat = raw.cat;
  const lvl = inteiro(raw.lvl);
  if (Number.isInteger(lvl) && lvl >= 1 && lvl <= 5000) out.lvl = lvl;
  const monster = slug(raw.monster);
  const hunt = slug(raw.hunt);
  if (SLUG.test(monster)) out.monster = monster;
  else if (SLUG.test(hunt)) out.hunt = hunt;
  if (raw.peso === 1 || raw.peso === "1") out.peso = 1;
  return out;
}

/** Nível mínimo para usar a Crypt (aviso na tela). */
export const NIVEL_CRYPT = 450;
/** Nível padrão da comparação. */
export const NIVEL_PADRAO = 1000;
/** Alternativas exibidas depois da melhor (melhor + 3 = 4 no total). */
export const MAX_ALTERNATIVAS = 3;

/** Divisão fixa do Elemental Pierce: 50% físico e 50% elemento (sem configuração na tela). */
const elementalShare = 0.5;

export function resolver(s: CryptSearch) {
  const voc = s.voc ?? "ek";
  return {
    voc,
    cat: voc === "monk" ? ("fist" as const) : (s.cat ?? "todas"),
    lvl: s.lvl ?? NIVEL_PADRAO,
    modo: "official" as const,
    usarPeso: s.peso === 1,
  };
}

// --- apresentação --------------------------------------------------------------------------------

type Preset = "elemental" | "hybrid" | "physical";
const PRESET_NOME: Record<Preset, string> = {
  elemental: "Elemental",
  hybrid: "Híbrida",
  physical: "Physical",
};

/** Rótulo do preset com o pierce REAL da combinação: o do Monk (20% físico) difere do do Knight (14%). */
export function rotuloPreset(preset: Preset, p: PierceSpec): string {
  if (preset === "elemental") return `Elemental ${p.elemental}%`;
  if (preset === "hybrid") return `Híbrida ${p.elemental}% + ${p.physical}%`;
  return `Physical ${p.physical}%`;
}

export function labelCombo(r: ComboResult): string {
  if (r.preset) return rotuloPreset(r.preset, r.combo.pierce);
  const { physical, elemental } = r.combo.pierce;
  return `Pierce ${physical}% físico, ${elemental}% elemento`;
}

/** Os 3 modos de uma arma; arma sem elemento (Monk) só tem o físico. */
export function modosDe(ev: WeaponEvaluation, arma: CryptWeapon): ResultMode[] {
  const cor = arma.element ? ELEMENTOS[arma.element].bar : ELEMENTOS.physical.bar;
  const m = (id: Preset, r: ComboResult | null, c: string): ResultMode => ({
    id,
    label: r ? rotuloPreset(id, r.combo.pierce) : PRESET_NOME[id],
    value: r ? r.damagePct : null,
    cor: c,
  });
  return arma.element
    ? [
        m("elemental", ev.presets.elemental, cor),
        m("hybrid", ev.presets.hybrid, cor),
        m("physical", ev.presets.physical, ELEMENTOS.physical.bar),
      ]
    : [m("physical", ev.presets.physical, ELEMENTOS.physical.bar)];
}

/** Diz o que o alvo absorve: o dano físico, o elemento da arma (só se imbuída) ou os dois. */
export function quemAbsorve(alvo: Target, arma: CryptWeapon, r: ComboResult): string {
  const partes: string[] = [];
  if (alvo.resist.physical < 0) partes.push("o dano físico");
  if (r.combo.imbued && arma.element && alvo.resist[arma.element] < 0)
    partes.push(`o elemento ${ELEMENTOS[arma.element].label}`);
  return partes.length ? `absorve ${partes.join(" e ")}` : "absorve o elemento";
}

/** Perks escolhidos na melhor combinação, em texto (os textos vêm da wiki em inglês). */
export function perksDoCombo(arma: CryptWeapon, r: ComboResult): string[] {
  return r.combo.choices.map((c) => {
    const opt = arma.perks.find((p) => p.level === c.level)?.options.find((o) => o.id === c.perkId);
    return `Nível ${c.level}: ${opt?.text ?? c.perkId}`;
  });
}

// --- cálculo -------------------------------------------------------------------------------------

export interface Candidato {
  chave: string;
  /** Nome que também serve para achar o sprite. */
  nome: string;
  categoria: CryptWeapon["category"];
  elemento: CryptWeapon["element"] | AltWeapon["element"];
  damagePct: number;
  /** Crypt (com pierce) ou arma das tabelas do jogo. */
  origem: "crypt" | "arma";
  /** Nível exigido pela arma (Crypt e armas das tabelas). */
  nivel?: number;
  /** Espaços de imbuiment da arma; ausente quando a tabela não informa. */
  imbuiments?: number;
  /** Só nas Crypt: pierce da melhor combinação. */
  pierce?: PierceSpec;
  /** Só nas Crypt: a melhor combinação usa o elemento da arma (imbuement). */
  imbued?: boolean;
  /** Só nas Crypt: a arma e os perks escolhidos pelo cálculo (níveis variáveis da proficiência). */
  arma?: CryptWeapon;
  escolhas?: { level: number; perkId: string }[];
  /** Só nas Crypt com o imbuiment retirado: dano da mesma arma imbuída, para comparar. */
  comImbuiment?: number;
}

/**
 * Perk (id "nível.opção") marcado em cada nível da proficiência. Knight: 1.1, 2.3, 4.1, 6.2 fixos;
 * nível 5 = 5.1 se a melhor combinação imbui, senão 5.3; níveis 3 e 7 vêm do cálculo.
 * Monk: tudo fixo (1.1, 2.3, 3.3, 4.1, 5.1, 6.2, 7.1).
 */
export function proficienciaIdeal(
  vocation: CryptWeapon["vocation"],
  imbued: boolean,
  escolhas: readonly { level: number; perkId: string }[] = [],
): Record<number, string> {
  const doCalculo = (n: number) => escolhas.find((e) => e.level === n)?.perkId;
  const base: Record<number, string | undefined> =
    vocation === "monk"
      ? { 1: "1.1", 2: "2.3", 3: "3.3", 4: "4.1", 5: "5.1", 6: "6.2", 7: "7.1" }
      : {
          1: "1.1",
          2: "2.3",
          3: doCalculo(3),
          4: "4.1",
          5: imbued ? "5.1" : "5.3",
          6: "6.2",
          7: doCalculo(7),
        };
  return Object.fromEntries(Object.entries(base).filter(([, v]) => v)) as Record<number, string>;
}

/** Proficiência editada de uma arma: nível máximo liberado e o perk marcado em cada nível. */
export interface Proficiencia {
  max: number;
  perks: Record<number, string>;
}
export type Proficiencias = Record<string, Proficiencia>;

/** Proficiências editadas (por arma) e como aplicar uma; sem provedor, a edição não faz nada. */
export const ProficienciaCtx = createContext<{
  profs: Proficiencias;
  aplicar: (slug: string, p: Proficiencia | null) => void;
  /** Armas (slug) com o imbuiment elemental retirado, e como mudar isso. */
  semImb: Record<string, boolean>;
  aplicarImb: (slug: string, sem: boolean) => void;
  /** Troca do imbuiment ainda não calculada (slug → "sem imbuiment" desejado); vale só ao recalcular. */
  imbRasc: Record<string, boolean>;
  rascunharImb: (slug: string, sem: boolean) => void;
  /** Aplica as trocas pendentes e refaz o cálculo. */
  recalcular: () => void;
}>({
  profs: {},
  aplicar: () => {},
  semImb: {},
  aplicarImb: () => {},
  imbRasc: {},
  rascunharImb: () => {},
  recalcular: () => {},
});

/** Cópia da arma só com o perk marcado em cada nível liberado (o motor então não troca de perk). */
function fixarPerks(w: CryptWeapon, p: Proficiencia): CryptWeapon {
  return {
    ...w,
    perks: w.perks.map((n) => {
      const o = n.level <= p.max ? n.options.find((x) => x.id === p.perks[n.level]) : undefined;
      return o ? { ...n, options: [o] } : n;
    }),
  };
}

/** Cópia da arma sem elemento: o pierce elemental dos perks não conta (o imbuiment foi retirado). */
function semElemento(w: CryptWeapon): CryptWeapon {
  return {
    ...w,
    element: null,
    perks: w.perks.map((n) => ({
      ...n,
      options: n.options.map((o) => ({ ...o, pierce: { ...o.pierce, elemental: 0 } })),
    })),
  };
}

export type Calculo =
  | { tipo: "vazio" }
  | { tipo: "nao-encontrado"; oque: "monster" | "hunt" }
  | { tipo: "sem-criaturas" }
  | { tipo: "erro"; mensagem: string }
  | {
      tipo: "ok";
      /** Nome do monstro ou da hunt. */
      rotulo: string;
      alvos: Target[];
      /** Melhor concorrente (outras armas do jogo) por arma Crypt; null = nenhuma liberada no nível. O veredito exige superá-la. */
      concorrentes: Record<string, { alt: AltWeapon; damagePct: number } | null>;
      /** Todas as opções (Crypt + outras armas liberadas no nível), da melhor para a pior, na mesma escala de dano. */
      candidatos: Candidato[];
      ranking: RankedEvaluation[];
    };

export function weaponsFor(
  armas: readonly CryptWeapon[],
  voc: CryptVoc,
  cat: CryptCat | "fist",
): CryptWeapon[] {
  const vocacao = voc === "ek" ? "knight" : "monk";
  return armas.filter(
    (w) => w.vocation === vocacao && (voc === "monk" || cat === "todas" || w.category === cat),
  );
}

export function calcular(args: {
  armas: readonly CryptWeapon[];
  /** Armas de weapons_melee / weapons_hand; vazio = compara só com o dano neutro (100). */
  alternativas?: readonly AltWeapon[];
  criaturas: ReadonlyMap<string, Creature>;
  hunts: readonly Hunt[];
  estado: CryptSearch;
  /** Pesos editados na tela (slug → peso) para a hunt; peso 0 tira a criatura. Ausente = padrão. */
  pesos?: Record<string, number> | null;
  /** Proficiência editada por arma (slug); ausente = completa, com a melhor combinação. */
  proficiencias?: Proficiencias;
  /** Armas Crypt (slug) cujo imbuiment elemental o jogador retirou (só pierce físico). */
  semImbuiment?: Record<string, boolean>;
}): Calculo {
  const {
    armas,
    alternativas = [],
    criaturas,
    hunts,
    estado,
    pesos,
    proficiencias = {},
    semImbuiment = {},
  } = args;
  const r = resolver(estado);
  try {
    let alvos: Target[];
    let rotulo: string;
    if (estado.monster) {
      const c = criaturas.get(estado.monster);
      if (!c) return { tipo: "nao-encontrado", oque: "monster" };
      alvos = [creatureToTarget(c)];
      rotulo = c.name;
    } else if (estado.hunt) {
      const h = hunts.find((x) => x.slug === estado.hunt);
      if (!h) return { tipo: "nao-encontrado", oque: "hunt" };
      alvos = huntToTargets(h, criaturas, { weighting: r.usarPeso ? "weighted" : "equal" });
      if (pesos) {
        alvos = alvos
          .map((a) => ({ ...a, weight: pesos[a.id] ?? a.weight }))
          .filter((a) => a.weight > 0);
      }
      if (alvos.length === 0) return { tipo: "sem-criaturas" };
      rotulo = h.name;
    } else {
      return { tipo: "vazio" };
    }
    const comImbuiment = weaponsFor(armas, r.voc, r.cat).map((w) =>
      proficiencias[w.slug] ? fixarPerks(w, proficiencias[w.slug]) : w,
    );
    const lista = comImbuiment.map((w) => (semImbuiment[w.slug] ? semElemento(w) : w));
    const original = new Map(armas.map((w) => [w.slug, w]));
    const concorrentes = Object.fromEntries(
      lista.map((w) => [w.slug, bestAlternative(w, alternativas, alvos, r.lvl)]),
    );
    const baseline = (w: CryptWeapon) => concorrentes[w.slug]?.damagePct ?? 100;
    const opcoes = {
      mode: r.modo,
      elementalShare,
      baseline,
      maxProficiencyLevel: (w: CryptWeapon) => proficiencias[w.slug]?.max ?? 7,
    };
    const ranking = rankWeapons(lista, alvos, opcoes);
    const imbuida = new Map<string, number | undefined>();
    if (Object.values(semImbuiment).some(Boolean))
      for (const x of rankWeapons(comImbuiment, alvos, opcoes))
        if (semImbuiment[x.weapon.slug] && x.evaluation.best.combo.imbued)
          imbuida.set(x.weapon.slug, x.evaluation.best.damagePct);
    const refAttack = Object.fromEntries(lista.map((w) => [w.vocation, w.attack]));
    const vistos = new Set<string>();
    const slugsCrypt = new Set(armas.map((w) => w.slug));
    const alts = lista
      .flatMap((w) => eligibleAlternatives(w, alternativas, r.lvl))
      .filter((a) => !slugsCrypt.has(a.slug))
      .filter((a) => !vistos.has(a.slug) && vistos.add(a.slug));
    const candidatos: Candidato[] = [
      ...ranking.map((x) => ({
        chave: x.weapon.slug,
        nome: x.weapon.name,
        categoria: x.weapon.category,
        elemento: x.weapon.element,
        damagePct: x.evaluation.best.damagePct,
        origem: "crypt" as const,
        nivel: x.weapon.levelRequired,
        imbuiments: x.weapon.imbuementSlots,
        pierce: x.evaluation.best.combo.pierce,
        imbued: x.evaluation.best.combo.imbued,
        arma: original.get(x.weapon.slug) ?? x.weapon,
        escolhas: x.evaluation.best.combo.choices,
        comImbuiment: imbuida.get(x.weapon.slug),
      })),
      ...alts.map((a) => ({
        chave: a.slug,
        nome: a.name,
        categoria: a.category,
        elemento: a.element,
        damagePct: altDamagePct(a, alvos, refAttack[a.vocation]),
        origem: "arma" as const,
        nivel: a.levelRequired,
        imbuiments: a.imbuementSlots ?? undefined,
      })),
    ].sort((x, y) => y.damagePct - x.damagePct);
    return { tipo: "ok", rotulo, alvos, concorrentes, candidatos, ranking };
  } catch (e) {
    return { tipo: "erro", mensagem: e instanceof Error ? e.message : "Erro desconhecido." };
  }
}
