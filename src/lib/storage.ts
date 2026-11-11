// Nomes dos buckets do Supabase Storage (somente leitura: o app nunca escreve neles).
export const BUCKETS = {
  sprites: "Itens Sprites",
  emptySet: "Empty Set",
  imbuiments: "Imbuiments",
  stats: "Stats",
} as const;

export const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;

function publicUrl(bucket: string, file: string): string {
  return `${SUPABASE_URL}/storage/v1/object/public/${encodeURIComponent(bucket)}/${file}`;
}

export function slugify(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/['`´]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export const spriteUrl = (itemName: string) =>
  publicUrl(BUCKETS.sprites, `${slugify(itemName)}.gif`);
export const emptySlotUrl = (name: string) => publicUrl(BUCKETS.emptySet, `${name}.png`);
export const statIconUrl = (name: string) => publicUrl(BUCKETS.stats, `${name}.png`);
export const imbuimentImageUrl = (slug: string) => publicUrl(BUCKETS.imbuiments, `${slug}.png`);
export const IMBUIMENT_ICON_URL = emptySlotUrl("imbuiment");
