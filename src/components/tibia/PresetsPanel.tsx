import { useState } from "react";
import { ElementIcon } from "@/components/station/ElementIcon";
import { LEVEL_PRESETS, PROTECTIONS, type ProtectionKey } from "@/lib/tibia";
import { Passo } from "@/components/station/Passo";
import { useT } from "@/lib/i18n";
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
  const t = useT();
  const [custom, setCustom] = useState("");
  const n = Number(custom);
  const customValido = Number.isFinite(n) && n > 0;
  const gerar = () => {
    if (customValido) onLevel(Math.floor(n));
  };
  const ehPreset = (LEVEL_PRESETS as readonly number[]).includes(level);

  return (
    // inert: sem vocação nada aqui recebe foco nem clique
    <div className={`space-y-5 ${semVocacao ? "opacity-60" : ""}`} inert={semVocacao}>
      <Passo n={2} titulo="Presets de nível">
        <div className="flex flex-wrap gap-2">
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
              {t("Nível {n}", { n: l })}
            </Chip>
          ))}
        </div>

        <div className="mt-4 flex flex-wrap items-end gap-3">
          <div>
            <label htmlFor="sb-nivel-custom" className="mb-1.5 block text-sm text-muted-foreground">
              {t("Nível personalizado")}
            </label>
            <Input
              id="sb-nivel-custom"
              type="number"
              min={1}
              max={NIVEL_MAX}
              inputMode="numeric"
              placeholder={t("ex.: 275")}
              value={custom}
              onChange={(e) => setCustom(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") gerar();
              }}
              className="h-11 w-36 rounded-none bg-background text-base"
            />
          </div>
          <Chip
            ativo={level > 0 && !ehPreset}
            disabled={carregando || !customValido}
            onClick={gerar}
          >
            {t("Gerar melhor set")}
          </Chip>
        </div>
        <button
          type="button"
          onClick={() => {
            setCustom("");
            onClear();
          }}
          className="mt-4 min-h-11 border border-border bg-metal px-4 font-semibold transition-colors hover:border-gold-dim"
        >
          {t("Limpar set")}
        </button>
      </Passo>

      <Passo n={3} titulo="Presets de proteção">
        <div className="flex flex-wrap gap-2">
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
      </Passo>
    </div>
  );
}
