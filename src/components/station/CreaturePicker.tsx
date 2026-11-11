import { useMemo } from "react";
import { indexar } from "./busca";
import { CreatureSprite } from "./CreatureSprite";
import { PickerBase, type OpcaoPicker } from "./PickerBase";
import { useCreatures } from "./useDados";

export interface CreaturePickerProps {
  /** slug da criatura escolhida */
  value: string | null;
  onChange: (slug: string) => void;
  label?: string;
}

export function CreaturePicker({ value, onChange, label = "Criatura" }: CreaturePickerProps) {
  const q = useCreatures();
  const opcoes = useMemo(
    () =>
      indexar<OpcaoPicker>(
        (q.data ?? []).map((c) => ({
          chave: c.slug,
          rotulo: c.name,
          detalhe: c.bestiaryClass,
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
      placeholder="Escolha uma criatura"
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
