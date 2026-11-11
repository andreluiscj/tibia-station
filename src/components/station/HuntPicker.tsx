import { useMemo } from "react";
import { indexar } from "./busca";
import { filtrarHunts, nivelDaHunt, type VocFiltro } from "./huntsFiltro";
import { PickerBase, type OpcaoPicker } from "./PickerBase";
import { useHunts } from "./useDados";

export interface HuntPickerProps {
  /** slug da hunt escolhida */
  value: string | null;
  onChange: (slug: string) => void;
  label?: string;
  filter?: { vocation?: Exclude<VocFiltro, "todas">; minLevel?: number };
}

export function HuntPicker({ value, onChange, label = "Hunt", filter }: HuntPickerProps) {
  const q = useHunts();
  const voc = filter?.vocation ?? "todas";
  const minLevel = filter?.minLevel ?? 0;
  const lista = useMemo(
    () =>
      filtrarHunts(q.data ?? [], { voc, so450: false }).filter(
        (h) => (nivelDaHunt(h, voc) ?? 0) >= minLevel,
      ),
    [q.data, voc, minLevel],
  );
  const opcoes = useMemo(
    () =>
      indexar<OpcaoPicker>(
        lista.map((h) => ({ chave: h.slug, rotulo: h.name, detalhe: h.city })),
        (o) => `${o.rotulo} ${o.detalhe ?? ""}`,
      ),
    [lista],
  );
  const escolhida = value ? q.data?.find((h) => h.slug === value) : null;
  return (
    <PickerBase
      rotulo={label}
      placeholder="Escolha uma hunt"
      opcoes={opcoes}
      carregando={q.isPending}
      erro={q.isError}
      onTentar={() => void q.refetch()}
      valor={value}
      valorRotulo={escolhida?.name}
      onChange={onChange}
    />
  );
}
