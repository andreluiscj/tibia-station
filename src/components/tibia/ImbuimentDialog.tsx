import { useEffect, useState } from "react";
import {
  IMBUIMENT_CATALOG,
  IMBUIMENT_ICON_URL,
  imbuimentImageUrl,
  spriteUrl,
  type ImbuimentDef,
  type Item,
} from "@/lib/tibia";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";

const MAX_ESPACOS = 3;
const painel = "rounded-none border-gold-dim bg-popover p-0";
const barra =
  "surface-dark border-b border-border px-4 py-3 font-display text-lg font-bold text-gold";

/** Escolha de imbuiments de um item: o diálogo de espaços e, por cima, a lista de opções de um espaço. */
export function ImbuimentDialog({
  open,
  onOpenChange,
  item,
  espacos,
  salvos,
  options,
  onSave,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  item: Item;
  espacos: number;
  salvos: (string | null)[];
  options: ImbuimentDef[];
  onSave: (lista: (string | null)[]) => void;
}) {
  const [rascunho, setRascunho] = useState<(string | null)[]>(salvos);
  const [escolhendo, setEscolhendo] = useState<number | null>(null);

  // Ao abrir, o rascunho volta ao que está salvo.
  useEffect(() => {
    if (open) setRascunho(salvos.slice(0, espacos));
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  function escolher(idx: number, val: string | null) {
    setRascunho((prev) => {
      const next = prev.slice(0, espacos);
      while (next.length < espacos) next.push(null);
      next[idx] = val;
      return next;
    });
    setEscolhendo(null);
  }

  const usados = new Set(
    rascunho.map((v, i) => (i !== escolhendo && v ? v : null)).filter(Boolean) as string[],
  );

  return (
    <>
      <Dialog
        open={open}
        onOpenChange={(o) => {
          onOpenChange(o);
          if (!o) setEscolhendo(null);
        }}
      >
        <DialogContent className={`max-w-lg ${painel}`}>
          <DialogTitle className={barra}>Imbuiments de {item.item_name}</DialogTitle>
          <DialogDescription className="sr-only">
            Escolha o imbuiment de cada espaço e salve.
          </DialogDescription>
          <div className="flex flex-wrap items-center gap-4 px-4 py-4">
            <span className="frame-inset flex size-[4.5rem] items-center justify-center">
              <img
                src={spriteUrl(item.item_name)}
                alt={item.item_name}
                className="size-16 [image-rendering:pixelated]"
              />
            </span>
            <span>Escolha o espaço:</span>
            <div className="flex gap-2">
              {Array.from({ length: MAX_ESPACOS }).map((_, idx) => {
                const habilitado = idx < espacos;
                const def = rascunho[idx]
                  ? IMBUIMENT_CATALOG.find((d) => d.name === rascunho[idx])
                  : null;
                return (
                  <button
                    key={idx}
                    type="button"
                    disabled={!habilitado}
                    onClick={() => setEscolhendo(idx)}
                    aria-label={
                      !habilitado
                        ? `Espaço ${idx + 1}: indisponível`
                        : def
                          ? `Espaço ${idx + 1}: ${def.name}, ${def.benefit}`
                          : `Espaço ${idx + 1}: vazio`
                    }
                    className="slot-btn frame-inset flex size-14 items-center justify-center disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    {def ? (
                      <img
                        src={imbuimentImageUrl(def.slug)}
                        alt=""
                        className="size-10 [image-rendering:pixelated]"
                        onError={(e) => (e.currentTarget.style.opacity = "0.3")}
                      />
                    ) : (
                      <img
                        src={IMBUIMENT_ICON_URL}
                        alt=""
                        className="size-8 opacity-30 [image-rendering:pixelated]"
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border bg-muted px-4 py-3">
            <span className="text-sm text-muted-foreground">
              {espacos} {espacos > 1 ? "espaços disponíveis" : "espaço disponível"}.
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => onOpenChange(false)}
                className="min-h-11 border border-border bg-metal px-4 font-semibold hover:border-gold-dim"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  onSave(rascunho.slice(0, espacos));
                  onOpenChange(false);
                }}
                className="min-h-11 border border-gold bg-accent px-5 font-semibold text-accent-foreground hover:bg-accent/90"
              >
                Salvar
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={escolhendo !== null} onOpenChange={(o) => !o && setEscolhendo(null)}>
        <DialogContent className={`max-w-md ${painel}`}>
          <DialogTitle className={barra}>Escolher imbuiment</DialogTitle>
          <DialogDescription className="sr-only">
            Lista de imbuiments compatíveis.
          </DialogDescription>
          <div className="max-h-[60vh] space-y-2 overflow-auto p-3">
            <button
              type="button"
              onClick={() => escolhendo !== null && escolher(escolhendo, null)}
              className="slot-btn flex min-h-12 w-full items-center gap-3 border border-dashed border-border bg-card px-3 text-left"
            >
              <img
                src={IMBUIMENT_ICON_URL}
                alt=""
                className="size-6 opacity-40 [image-rendering:pixelated]"
              />
              <span className="text-muted-foreground">Remover imbuiment</span>
            </button>
            {options.length === 0 && (
              <p className="p-4 text-center text-muted-foreground">Nenhum imbuiment compatível.</p>
            )}
            {options.map((def) => {
              const emUso = usados.has(def.name);
              return (
                <button
                  key={def.name}
                  type="button"
                  disabled={emUso}
                  onClick={() => escolhendo !== null && escolher(escolhendo, def.name)}
                  title={emUso ? "Já usado em outro espaço deste item" : def.benefit}
                  className="slot-btn flex min-h-12 w-full items-center gap-3 border border-border bg-card px-3 py-2 text-left disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <span className="frame-inset flex size-10 shrink-0 items-center justify-center">
                    <img
                      src={imbuimentImageUrl(def.slug)}
                      alt=""
                      className="size-8 [image-rendering:pixelated]"
                      onError={(e) => (e.currentTarget.style.opacity = "0.3")}
                    />
                  </span>
                  <span className="flex flex-col">
                    <span className="font-semibold">{def.name}</span>
                    <span className="text-sm text-gold">{def.benefit}</span>
                  </span>
                  {emUso && <span className="ml-auto text-sm text-muted-foreground">em uso</span>}
                </button>
              );
            })}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
