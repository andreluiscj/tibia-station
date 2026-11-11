import { useQueries } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import {
  fetchTable,
  type Item,
  type ProtectionKey,
  type SlotKey,
  type VocationKey,
} from "@/lib/tibia";
import {
  ESTADO_INICIAL,
  definirImbuiment,
  escolherClasse,
  escolherNivel,
  escolherProtecao,
  escolherVocacao,
  filtrosDe,
  imbuimentosEquipados,
  limparSet,
  tabelasDaVocacao,
  trocarItem,
  type BuilderState,
  type DataByTable,
} from "./builderState";

/** Estado do Set Builder + carga das tabelas do banco (somente leitura). As regras ficam em builderState.ts. */
export function useSetBuilder() {
  const [state, setState] = useState<BuilderState>(ESTADO_INICIAL);
  const tables = useMemo(() => tabelasDaVocacao(state.vocation), [state.vocation]);

  const queries = useQueries({
    queries: tables.map((t) => ({
      queryKey: ["tibia", t],
      queryFn: () => fetchTable(t),
      staleTime: 60_000 * 30,
    })),
  });
  const data = useMemo(() => {
    const m: DataByTable = {};
    tables.forEach((t, i) => {
      m[t] = queries[i]?.data ?? [];
    });
    return m;
  }, [tables, queries]);

  const carregando = queries.some((q) => q.isLoading);
  const erro = queries.some((q) => q.isError);
  const imbuimentRows = data["imbuiment"];
  const imbuimentItems = useMemo(
    () => imbuimentosEquipados(state.imbuiments, imbuimentRows ?? []),
    [state.imbuiments, imbuimentRows],
  );

  return {
    state,
    data,
    carregando,
    erro,
    filtros: filtrosDe(state),
    imbuimentItems,
    tentarDeNovo: () => queries.forEach((q) => void q.refetch()),
    escolherVocacao: (v: VocationKey) => setState((s) => escolherVocacao(s, v)),
    escolherClasse: (c: number) => setState((s) => escolherClasse(s, c)),
    escolherNivel: (l: number) => setState((s) => escolherNivel(s, l, data, carregando)),
    escolherProtecao: (p: ProtectionKey) =>
      setState((s) => escolherProtecao(s, p, data, carregando)),
    limpar: () => setState(limparSet),
    trocarItem: (slot: SlotKey, item: Item | null) => setState((s) => trocarItem(s, slot, item)),
    definirImbuiment: (slot: SlotKey, i: number, v: string | null) =>
      setState((s) => definirImbuiment(s, slot, i, v)),
  };
}
