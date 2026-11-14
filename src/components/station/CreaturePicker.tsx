import { useMemo } from "react";
import { indexar } from "./busca";
import { CreatureSprite } from "./CreatureSprite";
import { PickerBase, type OpcaoPicker } from "./PickerBase";
import { useBosses, useCreatures } from "./useDados";

export interface CreaturePickerProps {
  /** slug da criatura escolhida */
  value: string | null;
  onChange: (slug: string) => void;
  label?: string;
  /** Lista os bosses do Bosstiary em vez das criaturas do bestiário. */
  boss?: boolean;
}

export function CreaturePicker({
  value,
  onChange,
  label = "Criatura",
  boss = false,
}: CreaturePickerProps) {
  const criaturas = useCreatures(!boss);
  const bosses = useBosses(boss);
  const q = boss ? bosses : criaturas;
  const opcoes = useMemo(
    () =>
      indexar<OpcaoPicker>(
        (q.data ?? []).map((c) => ({
          chave: c.slug,
          rotulo: c.name,
          detalhe: c.bestiaryClass ?? c.bosstiaryClass,
          icone: <CreatureSprite slug={c.slug} name={c.name} className="size-16 text-2xl" />,
        })),
        (o) => o.rotulo,
      ),
    [q.data],
  );
  const escolhida = value ? q.data?.find((c) => c.slug === value) : null;
  return (
    <PickerBase
      rotulo={label}
      placeholder={boss ? "Escolha um boss" : "Escolha uma criatura"}
      opcoes={opcoes}
      carregando={q.isPending}
      erro={q.isError}
      onTentar={() => void q.refetch()}
      valor={value}
      valorRotulo={escolhida?.name}
      valorIcone={
        escolhida && (
          <CreatureSprite
            slug={escolhida.slug}
            name={escolhida.name}
            className="size-16 text-2xl"
          />
        )
      }
      onChange={onChange}
    />
  );
}
