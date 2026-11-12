import { EK_CLASSES, VOCATIONS, type VocationKey } from "@/lib/tibia";
import { Passo } from "@/components/station/Passo";
import { Chip } from "@/components/station/Chip";

export function VocacaoPanel({
  vocation,
  ekClass,
  onVocation,
  onClass,
}: {
  vocation: VocationKey | null;
  ekClass: number | null;
  onVocation: (v: VocationKey) => void;
  onClass: (c: number) => void;
}) {
  return (
    <Passo n={1} titulo="Vocação">
      <div className="flex flex-wrap gap-2">
        {VOCATIONS.map((v) => (
          <Chip key={v.key} ativo={vocation === v.key} onClick={() => onVocation(v.key)}>
            {v.label}
          </Chip>
        ))}
      </div>
      {vocation === "EK" && (
        <div className="mt-5">
          <h3 className="font-display text-base font-bold">Categoria de arma do Elite Knight</h3>
          <div className="mt-3 flex flex-wrap gap-2">
            {EK_CLASSES.map((c) => (
              <Chip key={c.value} ativo={ekClass === c.value} onClick={() => onClass(c.value)}>
                {c.label}
              </Chip>
            ))}
          </div>
        </div>
      )}
    </Passo>
  );
}
