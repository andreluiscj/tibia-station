// Núcleo do check-table-sizes: nomes de arma que compartilham o slug e o veredito de tamanho de tabela.
import { slugify } from "../../src/lib/storage";

/** O Supabase corta respostas em 1000 linhas por padrão; a partir deste tamanho propomos paginar. */
export const PAGE_LIMIT_WARN = 900;

export const sizeVerdict = (rows: number): "ok" | "paginar" =>
  rows >= PAGE_LIMIT_WARN ? "paginar" : "ok";

export function duplicateSlugs(
  names: readonly (string | null)[],
): { slug: string; names: string[] }[] {
  const groups = new Map<string, string[]>();
  for (const name of names) {
    const slug = name ? slugify(name) : "";
    if (slug) groups.set(slug, [...(groups.get(slug) ?? []), name!]);
  }
  return [...groups]
    .filter(([, list]) => list.length > 1)
    .map(([slug, list]) => ({ slug, names: list }))
    .sort((a, b) => a.slug.localeCompare(b.slug));
}
