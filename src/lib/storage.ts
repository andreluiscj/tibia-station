// Imagens servidas do próprio projeto (public/img/*, cópia dos buckets do Supabase), para funcionar em qualquer deploy sem variáveis de ambiente.
const PASTAS = {
  sprites: "sprites",
  emptySet: "empty-set",
  imbuiments: "imbuiments",
  stats: "stats",
} as const;

export const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;

const publicUrl = (pasta: string, file: string) => `/img/${pasta}/${file}`;

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
  publicUrl(PASTAS.sprites, `${slugify(itemName)}.gif`);
export const emptySlotUrl = (name: string) => publicUrl(PASTAS.emptySet, `${name}.png`);
export const statIconUrl = (name: string) => publicUrl(PASTAS.stats, `${name}.png`);
export const imbuimentImageUrl = (slug: string) => publicUrl(PASTAS.imbuiments, `${slug}.png`);
export const IMBUIMENT_ICON_URL = emptySlotUrl("imbuiment");
