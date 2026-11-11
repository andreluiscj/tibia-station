import type { Augment } from "./stats";

/** Bônus extras dos itens equipados (colunas bonus_1 a bonus_8). */
export function AugmentsCard({ augments }: { augments: Augment[] }) {
  return (
    <section className="frame sm:col-span-2" aria-labelledby="sb-bonus">
      <h3 id="sb-bonus" className="border-b border-border px-4 py-3 font-display text-lg font-bold">
        Bônus dos itens
      </h3>
      {augments.length === 0 ? (
        <p className="px-4 py-3 text-muted-foreground">Nenhum bônus extra nos itens equipados.</p>
      ) : (
        <ul className="divide-y divide-border/60">
          {augments.map((a, i) => (
            <li
              key={`${a.itemName}-${i}`}
              className="flex flex-wrap items-center gap-x-3 gap-y-1 px-4 py-2.5"
            >
              <span className="flex-1">{a.text}</span>
              <span className="text-muted-foreground">{a.itemName}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
