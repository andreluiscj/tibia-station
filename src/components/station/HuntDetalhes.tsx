import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { Creature, Hunt } from "@/lib/data/types";
import { CreatureSprite } from "./CreatureSprite";
import { ElementIcon } from "./ElementIcon";
import { ELEMENTOS, ELEMENTOS_PRINCIPAIS } from "./elementos";
import { n1 } from "./format";
import { ResistCells } from "./ResistCells";

/** Link + modal: criaturas da hunt com sprite grande, fraquezas e peso editável (recalcula a Crypt na hora). */
export function HuntDetalhes({
  hunt,
  criaturas,
  pesos,
  onPesos,
  melhor,
}: {
  hunt: Hunt;
  criaturas: ReadonlyMap<string, Creature>;
  /** Peso em uso por criatura (slug → peso). */
  pesos: Record<string, number>;
  /** null restaura o padrão. */
  onPesos: (p: Record<string, number> | null) => void;
  /** Melhor arma com os pesos atuais. */
  melhor?: { nome: string; damagePct: number };
}) {
  const [aberto, setAberto] = useState(false);
  const itens = hunt.creatures.flatMap((hc) => {
    const c = criaturas.get(hc.creatureSlug);
    return c ? [c] : [];
  });
  const total = itens.reduce((s, c) => s + (pesos[c.slug] ?? 0), 0);

  return (
    <>
      <button
        type="button"
        onClick={() => setAberto(true)}
        className="mt-3 block text-left font-bold text-primary underline underline-offset-4 transition-colors hover:text-accent"
      >
        Visualizar detalhes
      </button>
      <Dialog open={aberto} onOpenChange={setAberto}>
        <DialogContent className="max-h-[88vh] w-[calc(100%-2rem)] max-w-3xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="break-words">{hunt.name}</DialogTitle>
            <DialogDescription>
              Fraquezas de cada criatura e o peso dela na média. Peso 0 tira a criatura do cálculo.
            </DialogDescription>
          </DialogHeader>

          {melhor && (
            <p role="status" className="frame-inset px-3 py-2">
              Melhor arma com estes pesos: <strong>{melhor.nome}</strong>{" "}
              <span className="num text-gold">{n1(melhor.damagePct)}</span>
            </p>
          )}

          <ul className="space-y-3">
            {itens.map((c) => {
              const fracos = ELEMENTOS_PRINCIPAIS.filter((e) => (c.resist[e] ?? 100) > 100).sort(
                (a, b) => (c.resist[b] ?? 0) - (c.resist[a] ?? 0),
              );
              const peso = pesos[c.slug] ?? 0;
              return (
                <li key={c.slug} className="frame-inset grid gap-4 p-4 sm:grid-cols-[auto_1fr]">
                  <CreatureSprite slug={c.slug} name={c.name} className="size-24 text-3xl" />
                  <div className="min-w-0 space-y-3">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <h3 className="font-display text-lg font-bold">{c.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {c.hp !== null
                            ? `${c.hp.toLocaleString("pt-BR")} HP`
                            : "HP não informado"}
                        </p>
                      </div>
                      <label className="text-sm">
                        <span className="block text-muted-foreground">
                          Peso{total > 0 ? ` (${Math.round((peso / total) * 100)}%)` : ""}
                        </span>
                        <input
                          type="number"
                          min={0}
                          step="any"
                          inputMode="decimal"
                          value={peso}
                          onChange={(e) => {
                            const v = Number(e.target.value);
                            if (Number.isFinite(v) && v >= 0) onPesos({ ...pesos, [c.slug]: v });
                          }}
                          className="num h-11 w-24 border border-input bg-background px-2 text-base"
                        />
                      </label>
                    </div>
                    <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
                      <span className="font-semibold">Fraquezas:</span>
                      {fracos.length === 0 ? (
                        <span className="text-muted-foreground">nenhuma</span>
                      ) : (
                        fracos.map((e) => (
                          <span key={e} className="inline-flex items-center gap-1 text-good">
                            <ElementIcon element={e} className="size-5" />
                            {ELEMENTOS[e].label} <span className="num">{c.resist[e]}%</span>
                          </span>
                        ))
                      )}
                    </p>
                    <ResistCells criatura={c} />
                  </div>
                </li>
              );
            })}
          </ul>

          <button
            type="button"
            onClick={() => onPesos(null)}
            className="min-h-11 self-start border border-border bg-metal px-5 font-semibold transition-colors hover:border-gold-dim"
          >
            Restaurar pesos
          </button>
        </DialogContent>
      </Dialog>
    </>
  );
}
