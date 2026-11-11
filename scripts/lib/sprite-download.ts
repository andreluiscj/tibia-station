export type SpriteGroup = "creatures" | "crypt-weapons";

/** A Tibia Wiki em português hospeda os GIFs e aceita a consulta automatizada. */
export const SPRITE_API = "https://www.tibiawiki.com.br/api.php";

/** Arquivos candidatos na TibiaWiki; alguns títulos usam um qualificador na página. */
export function spriteCandidates(wikiTitle: string): string[] {
  return [...new Set([`File:${wikiTitle}.gif`, `File:${wikiTitle.replace(/\s*\(.*\)$/, "")}.gif`])];
}

/** Caminho público relativo, usado apenas para logs e testes. */
export function spriteOutputPath(group: SpriteGroup, slug: string): string {
  return `public/sprites/${group}/${slug}.gif`;
}
