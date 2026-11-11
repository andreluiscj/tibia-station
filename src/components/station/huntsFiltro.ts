import type { Hunt } from "@/lib/data/types";

export type VocFiltro = "todas" | "knight" | "paladin" | "mage" | "monk";
export const NIVEL_ALVO = 450;

const CAMPO = {
  knight: "levelKnights",
  paladin: "levelPaladins",
  mage: "levelMages",
  monk: "levelMonks",
} as const;

/** Nível recomendado da hunt para a vocação; em "todas", o maior entre as vocações. */
export function nivelDaHunt(h: Hunt, voc: VocFiltro): number | null {
  if (voc !== "todas") return h[CAMPO[voc]];
  const niveis = Object.values(CAMPO)
    .map((c) => h[c])
    .filter((n): n is number => n !== null);
  return niveis.length ? Math.max(...niveis) : null;
}

export interface FiltroHunts {
  voc: VocFiltro;
  so450: boolean;
}

/** Filtra por vocação e (opcional) nível 450+; ordena do nível mais alto para o mais baixo, sem nível por último. */
export function filtrarHunts(hunts: readonly Hunt[], { voc, so450 }: FiltroHunts): Hunt[] {
  return hunts
    .map((h) => ({ h, n: nivelDaHunt(h, voc) }))
    .filter(({ n }) => (voc === "todas" || n !== null) && (!so450 || (n ?? 0) >= NIVEL_ALVO))
    .sort((a, b) => (b.n ?? -1) - (a.n ?? -1) || a.h.name.localeCompare(b.h.name))
    .map(({ h }) => h);
}
