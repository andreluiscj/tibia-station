import type { Lang } from "./i18n";
import { LINHAS } from "./i18n-core";
import "./i18n-dict-geral";
import "./i18n-dict-calc";
import "./i18n-dict-paginas";
import "./i18n-dict-como";
import "./i18n-dict-hunts";
import "./i18n-dict-set";

const mapa = (i: 1 | 2) => new Map(LINHAS.map((l) => [l[0], l[i]]));
export const TRADUCOES: Record<Exclude<Lang, "pt">, Map<string, string>> = {
  en: mapa(1),
  es: mapa(2),
};
