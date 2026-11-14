import { useT } from "@/lib/i18n";
import { useState } from "react";
import { SLOT_LAYOUT, emptySlotUrl, spriteUrl, type Item, type SlotKey } from "@/lib/tibia";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { SLOT_ROTULO } from "./rotulos";

/** Diálogo de troca de item de um slot, com busca por nome. `itens` já vem filtrado por vocação, nível e busca. */
export function SlotPickerDialog({
  slot,
  itens,
  busca,
  onBusca,
  onEscolher,
  onFechar,
}: {
  slot: SlotKey | null;
  itens: Item[];
  busca: string;
  onBusca: (b: string) => void;
  onEscolher: (item: Item | null) => void;
  onFechar: () => void;
}) {
  const [semImagem, setSemImagem] = useState<Set<string>>(new Set());
  const t = useT();
  return (
    <Dialog open={!!slot} onOpenChange={(o) => !o && onFechar()}>
      <DialogContent className="max-w-2xl rounded-none border-gold-dim bg-popover">
        <DialogTitle className="font-display text-xl font-bold text-gold">
          {t("Escolher {x}", { x: slot ? t(SLOT_ROTULO[slot]).toLowerCase() : "" })}
        </DialogTitle>
        <DialogDescription>
          {itens.length} {t(itens.length === 1 ? "item disponível" : "itens disponíveis")}{" "}
          {t("para os filtros atuais.")}
        </DialogDescription>
        <label htmlFor="sb-busca-item" className="sr-only">
          {t("Buscar item pelo nome")}
        </label>
        <Input
          id="sb-busca-item"
          autoFocus
          placeholder={t("Buscar pelo nome…")}
          value={busca}
          onChange={(e) => onBusca(e.target.value)}
          className="h-11 rounded-none bg-background text-base"
        />
        <div className="max-h-[60vh] overflow-auto">
          {itens.length === 0 && (
            <p className="p-4 text-center text-muted-foreground">
              {t("Nenhum item bate com a busca. Tire um filtro ou confira o nome.")}
            </p>
          )}
          <ul className="grid auto-rows-[10rem] grid-cols-2 gap-2 sm:grid-cols-3">
            {slot && (
              <li>
                <button
                  type="button"
                  onClick={() => onEscolher(null)}
                  className="slot-btn flex h-full w-full flex-col items-center justify-center gap-1 border border-dashed border-border p-3"
                >
                  <img
                    src={emptySlotUrl(SLOT_LAYOUT.find((s) => s.key === slot)!.emptyImage)}
                    alt=""
                    className="size-10 opacity-40"
                  />
                  <span className="text-muted-foreground">{t("Remover")}</span>
                </button>
              </li>
            )}
            {itens.map((it) => {
              const k = String(it.id) + it.item_name;
              return (
                <li key={k}>
                  <button
                    type="button"
                    onClick={() => onEscolher(it)}
                    className="slot-btn flex h-full w-full flex-col items-center justify-center gap-1 border border-border bg-card p-3"
                  >
                    <img
                      src={spriteUrl(it.item_name)}
                      alt=""
                      className="size-16 [image-rendering:pixelated]"
                      style={semImagem.has(k) ? { opacity: 0.2 } : undefined}
                      onError={() => setSemImagem((s) => new Set(s).add(k))}
                    />
                    <span className="line-clamp-2 text-center leading-tight" title={it.item_name}>
                      {it.item_name}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      nível {it.level_minimum ?? 0}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      </DialogContent>
    </Dialog>
  );
}
