import { motion } from "motion/react";
import { useState } from "react";
import {
  IMBUIMENT_CATALOG,
  IMBUIMENT_ICON_URL,
  allowedImbuiments,
  emptySlotUrl,
  imbuimentImageUrl,
  slotImbuimentContext,
  spriteUrl,
  SLOT_LAYOUT,
  type VocationKey,
} from "@/lib/tibia";
import { espacosDeImbuiment, type SlotView } from "./builderState";
import { ImbuimentDialog } from "./ImbuimentDialog";
import { SLOT_ROTULO } from "./rotulos";

/** Uma casa da grade de equipamento: sprite do item, nome do slot e, se houver, o botão de imbuiments. */
export function SlotButton({
  view,
  vocation,
  imbuiments,
  onOpen,
  onImbuimentChange,
}: {
  view: SlotView;
  vocation: VocationKey | null;
  imbuiments?: (string | null)[];
  onOpen: () => void;
  onImbuimentChange: (index: number, value: string | null) => void;
}) {
  const { slot, item, blocked, hidden, row, col } = view;
  const locked = !vocation;
  const rotulo = SLOT_ROTULO[slot];
  const emptyImage = SLOT_LAYOUT.find((s) => s.key === slot)!.emptyImage;
  const espacos = espacosDeImbuiment(slot, item, blocked);
  const options = allowedImbuiments(
    item && vocation ? slotImbuimentContext(slot, vocation, item) : null,
  );
  const [imbAberto, setImbAberto] = useState(false);
  const salvos = (imbuiments ?? []).slice(0, espacos);
  const temSalvos = salvos.some(Boolean);
  const nome = blocked
    ? `${rotulo}: bloqueado, a arma de duas mãos ocupa o lugar`
    : `${rotulo}: ${item?.item_name ?? "vazio"}`;

  return (
    <div
      style={{ gridRow: row, gridColumn: col }}
      className={`relative ${hidden ? "invisible" : ""}`}
    >
      <button
        type="button"
        onClick={onOpen}
        disabled={hidden || blocked || locked}
        aria-label={nome}
        title={item?.item_name ?? rotulo}
        className={`slot-btn frame-inset relative flex aspect-square w-full flex-col items-center justify-end p-1 ${
          blocked ? "opacity-40 grayscale" : ""
        } disabled:cursor-not-allowed`}
      >
        <motion.img
          // key: trocar o item reinicia a animação de entrada
          key={item?.item_name ?? "vazio"}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: item ? 1 : 0.7, scale: 1 }}
          transition={{ duration: 0.25, ease: [0.2, 0.7, 0.2, 1] }}
          src={item ? spriteUrl(item.item_name) : emptySlotUrl(emptyImage)}
          alt={item?.item_name ?? ""}
          className="absolute inset-0 m-auto size-14 [image-rendering:pixelated] sm:size-16"
          onError={(e) => {
            const img = e.currentTarget;
            if (item && !img.dataset.fallback) {
              img.dataset.fallback = "1";
              img.src = emptySlotUrl(emptyImage);
              img.style.opacity = "0.35";
            }
          }}
        />
        <span className="relative z-10 bg-background/85 px-1.5 py-0.5 text-sm font-semibold">
          {rotulo}
        </span>
      </button>

      {espacos > 0 && (
        <>
          <button
            type="button"
            onClick={() => setImbAberto(true)}
            aria-label={`Imbuiments de ${item!.item_name}: ${espacos} ${espacos > 1 ? "espaços" : "espaço"}`}
            title={temSalvos ? "Editar imbuiments" : `${espacos} espaço(s) de imbuiment`}
            className="slot-btn absolute right-1 top-1 z-20 flex min-h-9 min-w-9 items-center justify-center gap-0.5 border border-border bg-background/90 p-1"
          >
            {temSalvos ? (
              Array.from({ length: espacos }).map((_, i) => {
                const def = salvos[i] ? IMBUIMENT_CATALOG.find((d) => d.name === salvos[i]) : null;
                return (
                  <img
                    key={i}
                    src={def ? imbuimentImageUrl(def.slug) : IMBUIMENT_ICON_URL}
                    alt=""
                    className={`size-5 [image-rendering:pixelated] ${def ? "" : "opacity-30"}`}
                    onError={(e) => (e.currentTarget.style.opacity = "0.3")}
                  />
                );
              })
            ) : (
              <img src={IMBUIMENT_ICON_URL} alt="" className="size-5 [image-rendering:pixelated]" />
            )}
          </button>
          <ImbuimentDialog
            open={imbAberto}
            onOpenChange={setImbAberto}
            item={item!}
            espacos={espacos}
            salvos={salvos}
            options={options}
            onSave={(lista) => {
              for (let i = 0; i < espacos; i++) onImbuimentChange(i, lista[i] ?? null);
            }}
          />
        </>
      )}
    </div>
  );
}
