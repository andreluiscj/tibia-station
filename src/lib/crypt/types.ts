// Tipos do motor Crypt (contrato: .empresa/arquitetura.md, seção 5.1). Somente tipos: sem React, Supabase ou I/O.
import type { CryptWeapon, ElementKey, PierceSpec } from "@/lib/data/types";

export type PierceMode = "official" | "reference";
export type PresetKey = "elemental" | "hybrid" | "hybrid2" | "physical";
export type ImbueMode = "auto" | "on" | "off";

/** Formato wiki, 100 = neutro; sempre numérico; pode ser 0 (imune) ou NEGATIVO (absorve). */
export type Resist7 = Record<ElementKey, number>;

export interface Target {
  /** Slug da criatura. */
  id: string;
  name: string;
  /** null da wiki já convertido para 100. */
  resist: Resist7;
  /** > 0 (1 para criatura única). */
  weight: number;
  /** Elementos que eram null e foram assumidos como 100 (a UI avisa). */
  assumedNeutral: ElementKey[];
}

export interface PerkChoice {
  level: 3 | 5 | 7;
  /** PerkOption.id escolhido ("3.1"). */
  perkId: string;
}

export interface Combo {
  /** Só níveis 3, 5, 7 com opção de pierce > 0; ordem crescente de level. */
  choices: PerkChoice[];
  /** Soma das escolhas. */
  pierce: PierceSpec;
  /** true sse weapon.element !== null && pierce.elemental > 0. */
  imbued: boolean;
}

export interface TargetValue {
  targetId: string;
  /** 100 = neutro; > 100 melhor; pode ser <= 0 (imune/absorve). */
  damagePct: number;
  /** true se algum componente usado (físico, ou elemento quando imbued) tem resistência < 0. */
  absorbs: boolean;
}

export interface ComboResult {
  /** Preenchido se o combo é exatamente o de um preset. */
  preset: PresetKey | null;
  combo: Combo;
  /** Média ponderada por weight dos perTarget; NÃO truncar nem arredondar no motor. */
  damagePct: number;
  /** Mesma ordem de `targets`. */
  perTarget: TargetValue[];
}

export interface EvaluateOptions {
  /** Padrão "official". */
  mode?: PierceMode;
  /** 0..1, padrão 0.5 (fração do dano convertida ao elemento quando imbued). */
  elementalShare?: number;
  /** Padrão 100 (dano neutro); o veredito compara com isto. Pode variar por arma (a melhor concorrente da mesma categoria). */
  baseline?: number | ((weapon: CryptWeapon) => number);
  /** Inteiro 1..7, padrão 7; níveis acima não entram nas combinações. Pode variar por arma (proficiência incompleta). */
  maxProficiencyLevel?: number | ((weapon: CryptWeapon) => number);
  /**
   * Imbuiment elemental da arma: "auto" (padrão) avalia COM e SEM imbuiment e fica com o melhor;
   * "on" força a arma imbuída (mesmo sem pierce elemental); "off" força sem imbuiment.
   */
  imbue?: ImbueMode | ((weapon: CryptWeapon) => ImbueMode);
}

export interface WeaponEvaluation {
  weaponSlug: string;
  mode: PierceMode;
  elementalShare: number;
  baseline: number;
  presets: {
    /** null se weapon.element === null ou o preset não existe nos perks. */
    elemental: ComboResult | null;
    hybrid: ComboResult | null;
    /** Híbrida alternativa: físico no nível 7 em vez do 3. */
    hybrid2: ComboResult | null;
    /** Sempre existe. */
    physical: ComboResult;
  };
  /** Melhor entre TODAS as combinações enumeradas. */
  best: ComboResult;
  /** 2ª melhor combinação distinta (null se só houver 1). */
  secondBest: ComboResult | null;
  /** (best / second - 1) * 100; null se secondBest é null ou secondBest.damagePct <= 0. */
  diffToSecondPct: number | null;
  verdict: "worth" | "not_worth";
  /** União dos assumedNeutral dos targets. */
  assumedNeutral: ElementKey[];
}

export interface RankedEvaluation {
  weapon: CryptWeapon;
  evaluation: WeaponEvaluation;
  /** 1-based. */
  rank: number;
  /** (best / bestDoPróximo - 1) * 100; null para o último ou se o best do próximo for <= 0. */
  advantageOverNextPct: number | null;
  /** Posição de exibição (ranking de competição: 1, 2, 2, 4...). Itens com best a menos de 0.05 do líder do grupo compartilham o número. */
  displayRank: number;
  /** true se o grupo de empate de exibição tem 2 ou mais armas (a UI mostra "empata"). */
  tied: boolean;
}

export interface ModeComparison {
  official: WeaponEvaluation;
  reference: WeaponEvaluation;
  /** true se qualquer presets/best diferir em damagePct por mais de 0.005 entre os modos. */
  differs: boolean;
}
