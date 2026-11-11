import type { PierceMode } from "./types";

/**
 * Aplica pierce elemental a UMA resistência (formato wiki, 100 = neutro).
 * Lança RangeError se resist ou pierce forem não finitos, ou se pierce < 0.
 * resist pode ser 0 ou negativo (a criatura absorve): não lança.
 *
 * Modo "official" (regras da TibiaWiki, Elemental Pierce): acima de 100 o aumento é pela metade
 * (arredondada para cima); 0% nunca aumenta (estendido a negativo: premissa conservadora, risco 11
 * da arquitetura); no máximo dobra a sensibilidade. Modo "reference": fórmula da calculadora de referência,
 * sem arredondar e sem as regras 2 e 3.
 */
export function applyPiercing(
  resist: number,
  pierce: number,
  mode: PierceMode = "official",
): number {
  if (!Number.isFinite(resist) || !Number.isFinite(pierce)) {
    throw new RangeError("Resistência e pierce precisam ser números finitos.");
  }
  if (pierce < 0) throw new RangeError("O pierce não pode ser negativo.");
  if (pierce === 0) return resist;

  const official = mode === "official";
  if (official && resist <= 0) return resist;

  const half = (x: number) => (official ? Math.ceil(x / 2) : x / 2);
  const gapTo100 = 100 - resist;
  const raw =
    resist < 100
      ? pierce <= gapTo100
        ? resist + pierce
        : 100 + half(pierce - gapTo100)
      : resist + half(pierce);
  return official ? Math.min(raw, 2 * resist) : raw;
}
