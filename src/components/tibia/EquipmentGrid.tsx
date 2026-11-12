import type { SlotKey, VocationKey } from "@/lib/tibia";
import type { ImbuimentMap, SlotView } from "./builderState";
import { SlotButton } from "./SlotButton";

/** Grade 3 colunas com as casas de equipamento. O estado vazio e o carregando ficam por conta de quem usa. */
export function EquipmentGrid({
  views,
  vocation,
  imbuiments,
  onOpen,
  onImbuimentChange,
}: {
  views: SlotView[];
  vocation: VocationKey | null;
  imbuiments: ImbuimentMap;
  onOpen: (slot: SlotKey) => void;
  onImbuimentChange: (slot: SlotKey, index: number, value: string | null) => void;
}) {
  return (
    <div className="mx-auto grid max-w-md grid-cols-3 gap-3 sm:gap-4">
      {views.map((v) => (
        <SlotButton
          key={v.id}
          view={v}
          vocation={vocation}
          imbuiments={v.blocked ? undefined : imbuiments[v.slot]}
          onOpen={() => onOpen(v.slot)}
          onImbuimentChange={(i, val) => onImbuimentChange(v.slot, i, val)}
        />
      ))}
    </div>
  );
}
