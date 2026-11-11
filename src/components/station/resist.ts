// Formato da wiki: 100 = neutro, 80 = 20% de resistência, 110 = 10% de fraqueza, 0 = imune, negativo = absorve (cura).
export const ESCALA_RESIST = 150;

export type TipoResist = "sem-dado" | "absorve" | "imune" | "resiste" | "neutro" | "fraco";
export interface ResistInfo {
  tipo: TipoResist;
  /** Texto que dispensa a cor: o significado nunca fica só no tom. */
  texto: string;
  /** 0 a 1: largura do preenchimento na escala 0..ESCALA_RESIST. */
  fill: number;
}

const num = (x: number) => String(Math.round(x * 10) / 10).replace(".", ",");

export function descreverResist(v: number | null): ResistInfo {
  if (v === null || !Number.isFinite(v)) return { tipo: "sem-dado", texto: "Sem dado", fill: 0 };
  if (v < 0) return { tipo: "absorve", texto: "Absorve (cura)", fill: 0 };
  const fill = Math.min(v, ESCALA_RESIST) / ESCALA_RESIST;
  if (v === 0) return { tipo: "imune", texto: "Imune", fill };
  if (v < 100) return { tipo: "resiste", texto: `Resiste ${num(100 - v)}%`, fill };
  if (v === 100) return { tipo: "neutro", texto: "Neutro", fill };
  return { tipo: "fraco", texto: `Fraco (+${num(v - 100)}%)`, fill };
}
