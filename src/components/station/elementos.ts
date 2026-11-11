import type { Element, ElementKey } from "@/lib/data/types";

type Meta = {
  label: string;
  /** Classe estática: o Tailwind precisa ler a string inteira. */
  bar: string;
};

export const ELEMENTOS: Record<Element, Meta> = {
  physical: { label: "Physical", bar: "bg-el-physical" },
  fire: { label: "Fire", bar: "bg-el-fire" },
  energy: { label: "Energy", bar: "bg-el-energy" },
  ice: { label: "Ice", bar: "bg-el-ice" },
  earth: { label: "Earth", bar: "bg-el-earth" },
  death: { label: "Death", bar: "bg-el-death" },
  holy: { label: "Holy", bar: "bg-el-holy" },
  // Sem cor fixa no tema: ficam neutros para não competir com os 7 elementos.
  hpDrain: { label: "Life Drain", bar: "bg-muted-foreground" },
  drown: { label: "Drown", bar: "bg-muted-foreground" },
};

/** Ordem fixa dos 7 elementos em todo o app. */
export const ELEMENTOS_PRINCIPAIS: ElementKey[] = [
  "physical",
  "fire",
  "energy",
  "ice",
  "earth",
  "death",
  "holy",
];
export const ELEMENTOS_EXTRAS: Element[] = ["hpDrain", "drown"];
