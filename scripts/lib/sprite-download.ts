export type SpriteGroup = "creatures" | "crypt-weapons";

/** A Tibia Wiki em português hospeda os GIFs e aceita a consulta automatizada. */
export const SPRITE_API = "https://www.tibiawiki.com.br/api.php";

/** Arquivos candidatos na TibiaWiki; alguns títulos usam um qualificador na página. */
export function spriteCandidates(wikiTitle: string): string[] {
  const semQualificador = wikiTitle.replace(/\s*\(.*\)$/, "");
  // Os arquivos de boss costumam usar "The" maiúsculo (Amenef_The_Burning.gif), e o MediaWiki distingue maiúsculas.
  const maiusculas = (s: string) => s.replace(/\b[a-z]/g, (c) => c.toUpperCase());
  return [
    ...new Set(
      [wikiTitle, semQualificador, maiusculas(wikiTitle), maiusculas(semQualificador)].map(
        (t) => `File:${t}.gif`,
      ),
    ),
  ];
}

/** Caminho público relativo, usado apenas para logs e testes. */
export function spriteOutputPath(group: SpriteGroup, slug: string): string {
  return `public/sprites/${group}/${slug}.gif`;
}
