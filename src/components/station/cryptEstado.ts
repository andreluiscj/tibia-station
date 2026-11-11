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

export const NIVEL_CRYPT = 450;

/** Diz se vale imbuir a Crypt com o elemento dela (só Fire no Club, Earth na Sword, Energy no Axe; o Monk não imbui). */
export function textoImbuir(arma: CryptWeapon, r: ComboResult): string {
  if (!arma.element) return "Não imbui: esta arma não recebe imbuement de dano elemental.";
  const el = ELEMENTOS[arma.element].label;
  return r.combo.imbued
    ? `Imbuir com dano de ${el}: metade do dano vira ${el} e metade fica Physical.`
    : "Não imbuir: o melhor é só o pierce Physical, sem imbuement de dano elemental.";
}
/** Divisão fixa do Elemental Pierce: 50% físico e 50% elemento (sem configuração na tela). */
const elementalShare = 0.5;

export function resolver(s: CryptSearch) {
  const voc = s.voc ?? "ek";
  return {
    voc,
    cat: voc === "monk" ? ("fist" as const) : (s.cat ?? "todas"),
    lvl: s.lvl ?? NIVEL_CRYPT,
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
  /** Nome que também serve para achar o sprite no bucket. */
  nome: string;
  categoria: CryptWeapon["category"];
  elemento: CryptWeapon["element"] | AltWeapon["element"];
  damagePct: number;
  /** Crypt (com pierce) ou arma da Soul War / Rottenblood. */
  origem: "crypt" | "soul" | "sanguine";
  /** Só nas Crypt: a melhor combinação de perks, em texto. */
  detalhe?: string;
  /** Só nas Crypt: se deve imbuir com o elemento da arma ou usar só o pierce físico. */
  imbuir?: string;
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
      /** Melhor concorrente (Soul War / Sanguine) por arma Crypt; null = nenhuma liberada no nível. O veredito exige superá-la. */
      concorrentes: Record<string, { alt: AltWeapon; damagePct: number } | null>;
      /** Todas as opções (Crypt + Soul War/Sanguine liberadas no nível), da melhor para a pior, na mesma escala de dano. */
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
  /** Armas Soul War / Sanguine; vazio = compara só com o dano neutro (100). */
  alternativas?: readonly AltWeapon[];
  criaturas: ReadonlyMap<string, Creature>;
  hunts: readonly Hunt[];
  estado: CryptSearch;
}): Calculo {
  const { armas, alternativas = [], criaturas, hunts, estado } = args;
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
      if (alvos.length === 0) return { tipo: "sem-criaturas" };
      rotulo = h.name;
    } else {
      return { tipo: "vazio" };
    }
    const lista = weaponsFor(armas, r.voc, r.cat);
    const concorrentes = Object.fromEntries(
      lista.map((w) => [w.slug, bestAlternative(w, alternativas, alvos, r.lvl)]),
    );
    const baseline = (w: CryptWeapon) => concorrentes[w.slug]?.damagePct ?? 100;
    const ranking = rankWeapons(lista, alvos, { mode: r.modo, elementalShare, baseline });
    const refAttack = Object.fromEntries(lista.map((w) => [w.vocation, w.attack]));
    const vistos = new Set<string>();
    const alts = lista
      .flatMap((w) => eligibleAlternatives(w, alternativas, r.lvl))
      .filter((a) => !vistos.has(a.slug) && vistos.add(a.slug));
    const candidatos: Candidato[] = [
      ...ranking.map((x) => ({
        chave: x.weapon.slug,
        nome: x.weapon.name,
        categoria: x.weapon.category,
        elemento: x.weapon.element,
        damagePct: x.evaluation.best.damagePct,
        origem: "crypt" as const,
        detalhe: labelCombo(x.evaluation.best),
        imbuir: textoImbuir(x.weapon, x.evaluation.best),
      })),
      ...alts.map((a) => ({
        chave: a.slug,
        nome: a.name,
        categoria: a.category,
        elemento: a.element,
        damagePct: altDamagePct(a, alvos, refAttack[a.vocation]),
        origem: a.set,
      })),
    ].sort((x, y) => y.damagePct - x.damagePct);
    return { tipo: "ok", rotulo, alvos, concorrentes, candidatos, ranking };
  } catch (e) {
    return { tipo: "erro", mensagem: e instanceof Error ? e.message : "Erro desconhecido." };
  }
}
