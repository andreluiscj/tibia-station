import type { ReactNode } from "react";

/** Placa numerada de um passo do fluxo (os passos são uma sequência de verdade). */
export function Passo({ n, titulo, children }: { n: number; titulo: string; children: ReactNode }) {
  return (
    <section className="frame" aria-labelledby={`passo-${n}`}>
      <h2
        id={`passo-${n}`}
        className="surface-dark flex items-center gap-3 px-4 py-2.5 font-display text-base font-semibold uppercase tracking-wide"
      >
        <span className="num shrink-0 text-base text-white">{n}</span>
        {titulo}
      </h2>
      <div className="p-5">{children}</div>
    </section>
  );
}
