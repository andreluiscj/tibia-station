// Parser mínimo de wikitext para os infoboxes da TibiaWiki. Funções puras, sem rede.

/** Extrai os parâmetros de topo de um `{{Infobox <name> ...}}`, respeitando {{ }} e [[ ]] aninhados. */
export function parseInfobox(wikitext: string, name: string): Record<string, string> | null {
  const re = new RegExp(String.raw`\{\{\s*${name}\s*(?=[|\n}])`, "i");
  const m = re.exec(wikitext);
  if (!m) return null;
  const params: Record<string, string> = {};
  let depth = 0; // nível de {{ }} / [[ ]] dentro do infobox
  let buf = "";
  let i = m.index + m[0].length;
  const flush = () => {
    const eq = buf.indexOf("=");
    if (eq > 0) {
      const key = buf.slice(0, eq).trim();
      if (/^[\w-]+$/.test(key)) params[key] = buf.slice(eq + 1).trim();
    }
    buf = "";
  };
  for (; i < wikitext.length; i++) {
    const two = wikitext.slice(i, i + 2);
    if (two === "{{" || two === "[[") {
      depth++;
      buf += two;
      i++;
    } else if (two === "}}" || two === "]]") {
      if (depth === 0) {
        flush();
        return params;
      }
      depth--;
      buf += two;
      i++;
    } else if (wikitext[i] === "|" && depth === 0) {
      flush();
    } else {
      buf += wikitext[i];
    }
  }
  return null; // infobox sem fechamento: página truncada/malformada
}

/** Remove comentários HTML e o marcador de incerteza da wiki ("?", "~", "+", ">", "<") do fim do valor. */
const cleanValue = (raw: string) =>
  raw
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/[?~+<>\s]+$/g, "")
    .trim();

/** "30%" -> 30. "100%?" (valor não confirmado na wiki) -> 100. "--", vazio ou lixo -> null. */
export function parsePercent(raw: string | undefined): number | null {
  if (raw === undefined) return null;
  const m = /^(-?\d+(?:[.,]\d+)?)\s*%?[?<>~\s]*$/.exec(cleanValue(raw).replace(/%[?<>~\s]*$/, "%"));
  if (!m) return null;
  const n = Number(m[1].replace(",", "."));
  return Number.isFinite(n) ? n : null;
}

/** A wiki marca valor não confirmado com "?" depois do % ("100%?", "101%>?"). */
export function isUnconfirmed(raw: string | undefined): boolean {
  if (raw === undefined) return false;
  return /%\s*[<>]*\?\s*$/.test(raw.replace(/<!--[\s\S]*?-->/g, ""));
}

/** "14,000" -> 14000; "10000?" -> 10000; "?", "∞", vazio -> null. */
export function parseInteger(raw: string | undefined): number | null {
  if (raw === undefined) return null;
  const m = /^(\d[\d,. ]*)$/.exec(cleanValue(raw));
  if (!m) return null;
  const n = Number(m[1].replace(/[,. ]/g, ""));
  return Number.isFinite(n) ? n : null;
}

/** Alvos de [[Alvo]] / [[Alvo|texto]] (sem âncora, sem namespace de arquivo/categoria). */
export function extractLinks(wikitext: string): string[] {
  const out: string[] = [];
  const re = /\[\[([^\]|#]+)(?:#[^\]|]*)?(?:\|[^\]]*)?\]\]/g;
  for (let m = re.exec(wikitext); m; m = re.exec(wikitext)) {
    const t = m[1].trim();
    if (t && !/^(file|image|category|arquivo|categoria):/i.test(t)) out.push(t);
  }
  return out;
}

/** Itens de todos os `{{CreatureList ... |A |B }}` (uma ocorrência por aparição). */
export function extractCreatureList(wikitext: string): string[] {
  const out: string[] = [];
  const re = /\{\{\s*CreatureList\b([\s\S]*?)\}\}/gi;
  for (let m = re.exec(wikitext); m; m = re.exec(wikitext)) {
    for (const part of m[1].split("|").slice(1)) {
      const t = part.trim();
      if (t && !t.includes("=")) out.push(t);
    }
  }
  return out;
}

/** Remove comentários HTML e marcação wiki de uma célula: "[[A|B]]" -> "B", "'''x'''" -> "x". */
export function plain(raw: string | undefined): string {
  if (raw === undefined) return "";
  return raw
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/\[(?:https?:)?\/\/[^\s\]]+(?:\s+([^\]]*))?\]/g, "$1")
    .replace(/\[\[(?:[^\]|]*\|)?([^\]]*)\]\]/g, "$1")
    .replace(/\{\{[^{}]*\}\}/g, "")
    .replace(/<[^>]+>/g, "")
    .replace(/'{2,}/g, "")
    .trim();
}

// Mesmo slugify do sprite (src/lib/storage.ts), para casar slug com o GIF em public/sprites/items.
export { slugify } from "../../src/lib/storage";
