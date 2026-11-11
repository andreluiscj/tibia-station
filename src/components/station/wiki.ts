const BASE = "https://tibia.fandom.com/wiki/";

/** Link da página na TibiaWiki. Usa `sourceUrl` só se for uma página de tibia.fandom.com/wiki/ (https); senão monta pelo título. */
export function wikiUrl(wikiTitle: string, sourceUrl?: string | null): string {
  if (sourceUrl && /^https:\/\/tibia\.fandom\.com\/wiki\//.test(sourceUrl)) return sourceUrl;
  return BASE + encodeURIComponent(wikiTitle.replace(/ /g, "_"));
}
