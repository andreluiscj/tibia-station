// Camada de dados: JSON empacotados em data/ (gerados por scripts/import-wiki.ts). Contrato: .empresa/arquitetura.md, seção 4.
// Assíncrona de propósito: import() dinâmico mantém os JSON fora do bundle inicial e a origem pode virar Supabase sem mudar telas.
import { once } from "./once";
import type { Creature, CryptWeapon, Hunt, Sources } from "./types";

export type * from "./types";

const indexed = <T extends { slug: string }>(list: readonly T[]) => ({
  list,
  bySlug: new Map(list.map((i) => [i.slug, i])),
});

// Só entram criaturas reais do jogo: as que têm classe no Bestiary. Fora ficam bosses, NPCs, eventos e monstros extintos.
const creatures = once(async () =>
  indexed(
    ((await import("@data/creatures.json")).default as unknown as readonly Creature[]).filter(
      (c) => c.bestiaryClass,
    ),
  ),
);
// Hunts perdem as criaturas excluídas; a hunt que ficar sem nenhuma some.
const hunts = once(async () => {
  const reais = new Set((await creatures()).list.map((c) => c.slug));
  const todas = (await import("@data/hunts.json")).default as unknown as readonly Hunt[];
  return indexed(
    todas
      .map((h) => ({ ...h, creatures: h.creatures.filter((c) => reais.has(c.creatureSlug)) }))
      .filter((h) => h.creatures.length > 0),
  );
});
const cryptWeapons = once(async () =>
  indexed((await import("@data/crypt-weapons.json")).default as unknown as readonly CryptWeapon[]),
);
const sources = once(
  async () => (await import("@data/sources.json")).default as unknown as Sources,
);

export const getCreatures = async (): Promise<readonly Creature[]> => (await creatures()).list;
export const getHunts = async (): Promise<readonly Hunt[]> => (await hunts()).list;
export const getCryptWeapons = async (): Promise<readonly CryptWeapon[]> =>
  (await cryptWeapons()).list;
export const getSources = (): Promise<Sources> => sources();
export const getCryptWeapon = async (slug: string): Promise<CryptWeapon | null> =>
  (await cryptWeapons()).bySlug.get(slug) ?? null;
export const getCreature = async (slug: string): Promise<Creature | null> =>
  (await creatures()).bySlug.get(slug) ?? null;
export const getHunt = async (slug: string): Promise<Hunt | null> =>
  (await hunts()).bySlug.get(slug) ?? null;
