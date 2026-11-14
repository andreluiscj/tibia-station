import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useT } from "@/lib/i18n";
import type { Creature, Hunt } from "@/lib/data/types";
import { CreatureSprite } from "./CreatureSprite";
import { ElementIcon } from "./ElementIcon";
import { ELEMENTOS, ELEMENTOS_PRINCIPAIS } from "./elementos";
import { n1 } from "./format";
import { btnPrimario, btnSecundario } from "./estilos";
import { ResistCells } from "./ResistCells";

/** Link + modal: criaturas da hunt com sprite grande, fraquezas e peso editável (recalcula a Crypt ao clicar em Refazer cálculo). */
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
  const t = useT();
  const [aberto, setAberto] = useState(false);
  // Os pesos digitados ficam num rascunho; só viram cálculo em "Refazer cálculo".
  const [rascunho, setRascunho] = useState(pesos);
  const itens = hunt.creatures.flatMap((hc) => {
    const c = criaturas.get(hc.creatureSlug);
    return c ? [c] : [];
  });
  const total = itens.reduce((s, c) => s + (rascunho[c.slug] ?? 0), 0);

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setRascunho(pesos);
          setAberto(true);
        }}
        className="mt-3 block text-left font-bold text-primary underline underline-offset-4 transition-colors hover:text-accent"
      >
        {t("Editar peso das criaturas")}
      </button>
      <Dialog open={aberto} onOpenChange={setAberto}>
        <DialogContent className="max-h-[88vh] w-[calc(100%-2rem)] max-w-3xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="break-words">{hunt.name}</DialogTitle>
            <DialogDescription>
              {t(
                "Fraquezas de cada criatura e o peso dela na média. Peso 0 tira a criatura do cálculo. Depois de editar, clique em Refazer cálculo.",
              )}
            </DialogDescription>
          </DialogHeader>

          {melhor && (
            <p role="status" className="frame-inset px-3 py-2">
              {t("Melhor arma com estes pesos:")} <strong>{melhor.nome}</strong>{" "}
              <span className="num text-gold">{n1(melhor.damagePct)}</span>
            </p>
          )}

          <ul className="space-y-3">
            {itens.map((c) => {
              const fracos = ELEMENTOS_PRINCIPAIS.filter((e) => (c.resist[e] ?? 100) > 100).sort(
                (a, b) => (c.resist[b] ?? 0) - (c.resist[a] ?? 0),
              );
              const peso = rascunho[c.slug] ?? 0;
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
                            : t("HP não informado")}
                        </p>
                      </div>
                      <label className="text-sm">
                        <span className="block text-muted-foreground">
                          {t("Peso")}
                          {total > 0 ? ` (${Math.round((peso / total) * 100)}%)` : ""}
                        </span>
                        <input
                          type="number"
                          min={0}
                          step="any"
                          inputMode="decimal"
                          value={peso}
                          onChange={(e) => {
                            const v = Number(e.target.value);
                            if (Number.isFinite(v) && v >= 0)
                              setRascunho({ ...rascunho, [c.slug]: v });
                          }}
                          className="num h-11 w-24 border border-input bg-background px-2 text-base"
                        />
                      </label>
                    </div>
                    <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
                      <span className="font-semibold">{t("Fraquezas:")}</span>
                      {fracos.length === 0 ? (
                        <span className="text-muted-foreground">{t("nenhuma")}</span>
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

          <div className="flex flex-col items-start gap-3">
            <button
              type="button"
              className={btnPrimario}
              onClick={() => {
                onPesos(rascunho);
                setAberto(false);
              }}
            >
              {t("Refazer cálculo")}
            </button>
            <button
              type="button"
              className={btnSecundario}
              onClick={() => {
                onPesos(null);
                setAberto(false);
              }}
            >
              {t("Restaurar pesos")}
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
