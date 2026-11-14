import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { TRADUCOES } from "./i18n-dict";

export type Lang = "pt" | "en" | "es";
export const IDIOMAS: Lang[] = ["pt", "en", "es"];
const CHAVE = "tibia-station-lang";

const Ctx = createContext<{ lang: Lang; setLang: (l: Lang) => void }>({
  lang: "pt",
  setLang: () => {},
});

const valido = (v: unknown): v is Lang => v === "pt" || v === "en" || v === "es";

/** O servidor e a primeira renderização usam português (sem divergência de hidratação); depois vale a escolha salva. */
export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("pt");
  useEffect(() => {
    try {
      const salvo = localStorage.getItem(CHAVE);
      if (valido(salvo)) setLangState(salvo);
    } catch {
      // sem armazenamento: fica no padrão
    }
  }, []);
  useEffect(() => {
    document.documentElement.lang = { pt: "pt-BR", en: "en", es: "es" }[lang];
  }, [lang]);
  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    try {
      localStorage.setItem(CHAVE, l);
    } catch {
      // ignora
    }
  }, []);
  return <Ctx.Provider value={{ lang, setLang }}>{children}</Ctx.Provider>;
}

export const useLang = () => useContext(Ctx);

export type Vars = Record<string, string | number>;

// Chaves com {x} valem como padrão: "Resiste {n}%" casa com "Resiste 70%" e devolve o texto traduzido com o 70.
type Padrao = { re: RegExp; nomes: string[]; texto: string };
const padroes = new Map<Lang, Padrao[]>();
const PH = /\{(\w+)\}/g;

function achar(lang: Exclude<Lang, "pt">, pt: string): string | undefined {
  const exato = TRADUCOES[lang].get(pt);
  if (exato !== undefined) return exato;
  let lista = padroes.get(lang);
  if (!lista) {
    lista = [...TRADUCOES[lang]]
      .filter(([k]) => k.includes("{"))
      .sort((a, b) => b[0].length - a[0].length)
      .map(([k, texto]) => {
        const nomes = [...k.matchAll(PH)].map((m) => m[1]);
        const fonte = k
          .split(/\{\w+\}/)
          .map((p) => p.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
          .join("(.+?)");
        return { re: new RegExp("^" + fonte + "$"), nomes, texto };
      });
    padroes.set(lang, lista);
  }
  for (const { re, nomes, texto } of lista) {
    const m = re.exec(pt);
    if (!m) continue;
    const vals = Object.fromEntries(nomes.map((n, i) => [n, m[i + 1]]));
    return texto.replace(PH, (all, k: string) => vals[k] ?? all);
  }
  return undefined;
}

/** Texto em português (a chave) → texto no idioma atual; sem tradução, mostra o português. {nome} é substituído por vars. */
export function traduzir(lang: Lang, pt: string, vars?: Vars): string {
  const texto = lang === "pt" ? pt : (achar(lang, pt) ?? pt);
  return vars ? texto.replace(PH, (m, k: string) => String(vars[k] ?? m)) : texto;
}

export function useT() {
  const { lang } = useContext(Ctx);
  return useCallback((pt: string, vars?: Vars) => traduzir(lang, pt, vars), [lang]);
}
