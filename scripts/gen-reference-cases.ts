// Gera src/lib/crypt/reference-cases.json: casos do motor para conferência manual (gate 9 do plano) contra a
// calculadora de referência (modo reference) e os exemplos oficiais da wiki (modo official).
// Uso: bun scripts/gen-reference-cases.ts   (depois de bun scripts/import-wiki.ts)
import { writeFile } from "node:fs/promises";
import { join } from "node:path";
import creaturesJson from "../data/creatures.json";
import weaponsJson from "../data/crypt-weapons.json";
import type { Creature, CryptWeapon } from "../src/lib/data/types";
import { creatureToTarget, evaluateWeapon } from "../src/lib/crypt/engine";
import { applyPiercing } from "../src/lib/crypt/pierce";
import type { PierceMode } from "../src/lib/crypt/types";

export const CREATURES = [
  "hellflayer",
  "dragon-lord",
  "demon",
  "hydra",
  "juggernaut",
  "medusa",
  "grim-reaper",
  "hellhound",
  "behemoth",
  "undead-dragon",
  "giant-spider",
  "warlock",
];
const PIERCING: [number, number][] = [
  [90, 6],
  [104, 6],
  [96, 8],
  [4, 20],
  [0, 20],
  [90, 45],
  [115, 45],
  [20, 45],
  [100, 7],
  [80, 0],
  [-200, 45],
  [-50, 20],
];
const r4 = (n: number) => Math.round(n * 1e4) / 1e4;

const creatures = creaturesJson as unknown as Creature[];
const weapons = weaponsJson as unknown as CryptWeapon[];
const modes: PierceMode[] = ["official", "reference"];

const cases = CREATURES.flatMap((slug) => {
  const creature = creatures.find((c) => c.slug === slug);
  if (!creature) throw new Error(`criatura ausente: ${slug}`);
  const target = creatureToTarget(creature);
  return weapons.flatMap((weapon) =>
    modes.map((mode) => {
      const e = evaluateWeapon(weapon, [target], { mode });
      return {
        id: `${slug}/${weapon.slug}/${mode}`,
        creature: slug,
        weapon: weapon.slug,
        mode,
        elementalShare: 0.5,
        resist: target.resist,
        expected: {
          elemental: e.presets.elemental ? r4(e.presets.elemental.damagePct) : null,
          hybrid: e.presets.hybrid ? r4(e.presets.hybrid.damagePct) : null,
          physical: r4(e.presets.physical.damagePct),
          best: r4(e.best.damagePct),
          bestPierce: e.best.combo.pierce,
        },
      };
    }),
  );
});

const piercing = PIERCING.flatMap(([resist, pierce]) =>
  modes.map((mode) => ({
    resist,
    pierce,
    mode,
    expected: r4(applyPiercing(resist, pierce, mode)),
  })),
);

const out = {
  note: "SNAPSHOT do próprio motor (não é oráculo independente): só vira gate 9 depois que alguém comparar com o site de referência. Gerado por scripts/gen-reference-cases.ts. Valores = damagePct (100 = neutro). Presets: elemental 45%, híbrida 35% + 6%, physical 14% (Knight); Monk só physical. Divisão 50% físico / 50% elemento (premissa não confirmada).",
  piercing,
  cases,
};
await writeFile(
  join(process.cwd(), "src", "lib", "crypt", "reference-cases.json"),
  JSON.stringify(out, null, 2) + "\n",
);
console.log(`${piercing.length} casos de piercing, ${cases.length} casos de arma`);
