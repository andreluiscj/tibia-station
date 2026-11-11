import { useEffect, useState } from "react";
import { statIconUrl } from "@/lib/tibia";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { SKILL_ROTULO } from "./rotulos";
import { SKILL_KEYS, type SkillKey } from "./stats";

/** Edição das skills base do jogador (o que ele já tem, antes dos itens). */
export function BaseSkillsDialog({
  open,
  onOpenChange,
  base,
  onSave,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  base: Record<SkillKey, number>;
  onSave: (v: Record<SkillKey, number>) => void;
}) {
  const [rascunho, setRascunho] = useState(base);
  // Ao abrir, o rascunho parte do que está salvo.
  useEffect(() => {
    if (open) setRascunho(base);
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-none border-gold-dim bg-popover sm:max-w-md">
        <DialogTitle className="font-display text-xl font-bold text-gold">Skills base</DialogTitle>
        <DialogDescription>
          O que o personagem já tem antes dos itens. Fica salvo neste navegador.
        </DialogDescription>
        <div className="grid gap-3">
          {SKILL_KEYS.map((k) => (
            <div key={k} className="flex items-center gap-3">
              <img
                src={statIconUrl(SKILL_ROTULO[k].icon)}
                alt=""
                className="size-5 [image-rendering:pixelated]"
                onError={(e) => (e.currentTarget.style.display = "none")}
              />
              <label htmlFor={`base-${k}`} className="flex-1 text-muted-foreground">
                {SKILL_ROTULO[k].label}
              </label>
              <Input
                id={`base-${k}`}
                type="number"
                inputMode="numeric"
                className="h-11 w-24 rounded-none bg-background text-base tabular-nums"
                value={rascunho[k]}
                onChange={(e) =>
                  setRascunho((prev) => ({ ...prev, [k]: Number(e.target.value) || 0 }))
                }
              />
            </div>
          ))}
        </div>
        <div className="flex flex-wrap justify-end gap-2">
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
              onSave(rascunho);
              onOpenChange(false);
            }}
            className="min-h-11 border border-gold bg-gold px-5 font-semibold text-primary-foreground hover:bg-gold/90"
          >
            Salvar
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
