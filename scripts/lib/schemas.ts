// Validação de fronteira (dado da wiki é não confiável): nada é gravado sem passar por aqui.
import { z } from "zod";

const slug = z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/);
const text = z.string().min(1).max(2000);
// Resistência no formato wiki. Negativo é dado real (a criatura absorve), então só se corta o absurdo.
const resist = z.number().finite().min(-10000).max(10000).nullable();
const count = z.number().int().min(0).max(1_000_000_000).nullable();
const sourceUrl = z.string().url().startsWith("https://tibia.fandom.com/wiki/").max(2000);
const element = z.enum([
  "physical",
  "earth",
  "fire",
  "energy",
  "ice",
  "holy",
  "death",
  "hpDrain",
  "drown",
]);
const level = z.number().int().min(0).max(5000).nullable();

export const creatureSchema = z.object({
  slug,
  sourceUrl,
  resistUnconfirmed: z.array(element).max(9),
  name: text,
  wikiTitle: text,
  hp: count,
  exp: count,
  bestiaryClass: text.nullable(),
  bestiaryLevel: text.nullable(),
  resist: z.object({
    physical: resist,
    earth: resist,
    fire: resist,
    energy: resist,
    ice: resist,
    holy: resist,
    death: resist,
    hpDrain: resist,
    drown: resist,
  }),
});

export const huntSchema = z.object({
  slug,
  sourceUrl,
  name: text,
  wikiTitle: text,
  city: text.nullable(),
  location: text.nullable(),
  levelKnights: level,
  levelPaladins: level,
  levelMages: level,
  levelMonks: level,
  expRaw: text.nullable(),
  lootRaw: text.nullable(),
  creatures: z.array(z.object({ creatureSlug: slug, weight: z.number().positive().max(100000) })),
});

const pierce = z.object({
  physical: z.number().min(0).max(100),
  elemental: z.number().min(0).max(100),
});

export const cryptWeaponSchema = z.object({
  slug,
  name: text,
  wikiTitle: text,
  vocation: z.enum(["knight", "monk"]),
  category: z.enum(["club", "sword", "axe", "fist"]),
  attack: z.number().int().min(0).max(1000),
  defense: z.number().int().min(0).max(1000),
  element: z.enum(["fire", "earth", "energy"]).nullable(),
  levelRequired: z.number().int().min(1).max(5000),
  imbuementSlots: z.number().int().min(0).max(10),
  attributes: z.array(text).max(20),
  perks: z
    .array(
      z.object({
        level: z.number().int().min(1).max(7),
        options: z.array(z.object({ id: z.string().regex(/^[1-7]\.[1-9]$/), text, pierce })).min(1),
      }),
    )
    .length(7),
});

/** Valida cada item; reúne todos os erros numa mensagem única (sem despejar o registro inteiro). */
export function validateAll<T>(label: string, schema: z.ZodType<T>, items: unknown[]): T[] {
  const errors: string[] = [];
  const ok: T[] = [];
  for (const item of items) {
    const r = schema.safeParse(item);
    if (r.success) ok.push(r.data);
    else {
      const id = (item as { slug?: string }).slug ?? "?";
      errors.push(
        `${label} ${id}: ${r.error.issues.map((i) => `${i.path.join(".")} ${i.message}`).join("; ")}`,
      );
    }
  }
  if (errors.length)
    throw new Error(`Validação falhou (${errors.length}):\n${errors.slice(0, 10).join("\n")}`);
  return ok;
}
