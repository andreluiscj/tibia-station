import type { ReactNode } from "react";

/** Placa numerada de um passo do fluxo (os passos são uma sequência de verdade). */
export function Passo({ n, titulo, children }: { n: number; titulo: string; children: ReactNode }) {
  return (
    <section className="frame p-5" aria-labelledby={`passo-${n}`}>
      <h2 id={`passo-${n}`} className="flex items-center gap-3 font-display text-lg font-bold">
        <span className="num flex size-8 shrink-0 items-center justify-center border border-gold-dim bg-stone text-sm text-gold">
          {n}
        </span>
        {titulo}
      </h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}
