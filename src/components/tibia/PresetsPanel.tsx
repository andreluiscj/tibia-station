import { useState } from "react";
import { ElementIcon } from "@/components/station/ElementIcon";
import { LEVEL_PRESETS, PROTECTIONS, type ProtectionKey } from "@/lib/tibia";
import { Chip } from "@/components/station/Chip";
import { ELEMENTOS } from "@/components/station/elementos";
import { Input } from "@/components/ui/input";

const NIVEL_MAX = 5000;

export function PresetsPanel({
  level,
  protection,
  semVocacao,
  carregando,
  onLevel,
  onProtection,
  onClear,
}: {
  level: number;
  protection: ProtectionKey | null;
  semVocacao: boolean;
  /** Os itens ainda estão chegando: os botões ficam desabilitados para não gerar set vazio. */
  carregando: boolean;
  onLevel: (l: number) => void;
  onProtection: (p: ProtectionKey) => void;
  onClear: () => void;
}) {
  const [custom, setCustom] = useState("");
  const n = Number(custom);
  const customValido = Number.isFinite(n) && n > 0;
  const gerar = () => {
    if (customValido) onLevel(Math.floor(n));
  };
  const ehPreset = (LEVEL_PRESETS as readonly number[]).includes(level);

  return (
    // inert: sem vocação nada aqui recebe foco nem clique
    <section
      className={`frame p-5 ${semVocacao ? "opacity-60" : ""}`}
      aria-labelledby="sb-presets"
      inert={semVocacao}
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 id="sb-presets" className="font-display text-xl font-bold">
            Presets de nível
          </h2>
        </div>
        <button
          type="button"
          onClick={() => {
            setCustom("");
            onClear();
          }}
          className="min-h-11 border border-border bg-metal px-4 font-semibold transition-colors hover:border-gold-dim"
        >
          Limpar set
        </button>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {LEVEL_PRESETS.map((l) => (
          <Chip
            key={l}
            ativo={level === l}
            disabled={carregando}
            onClick={() => {
              setCustom("");
              onLevel(l);
            }}
          >
            Nível {l}
          </Chip>
        ))}
      </div>

      <div className="mt-4 flex flex-wrap items-end gap-3">
        <div>
          <label htmlFor="sb-nivel-custom" className="mb-1.5 block text-sm text-muted-foreground">
            Nível personalizado
          </label>
          <Input
            id="sb-nivel-custom"
            type="number"
            min={1}
            max={NIVEL_MAX}
            inputMode="numeric"
            placeholder="ex.: 275"
            value={custom}
            onChange={(e) => setCustom(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") gerar();
            }}
            className="h-11 w-36 rounded-none bg-background text-base"
          />
        </div>
        <Chip ativo={level > 0 && !ehPreset} disabled={carregando || !customValido} onClick={gerar}>
          Gerar melhor set
        </Chip>
      </div>

      <div className="mt-7">
        <h2 className="font-display text-xl font-bold">Presets de proteção</h2>
        <div className="mt-4 flex flex-wrap gap-2">
          {PROTECTIONS.map((p) => (
            <Chip
              key={p.key}
              ativo={protection === p.key}
              disabled={carregando}
              onClick={() => onProtection(p.key)}
            >
              <ElementIcon element={p.key} className="size-5" />
              {ELEMENTOS[p.key].label}
            </Chip>
          ))}
        </div>
      </div>
    </section>
  );
}
