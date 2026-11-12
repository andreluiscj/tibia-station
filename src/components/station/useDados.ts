import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { armasDeHand, armasDeMelee } from "@/lib/data/weapons";
import { fetchTable } from "@/lib/tibia";
import {
  getCreature,
  getCreatures,
  getCryptWeapons,
  getHunt,
  getHunts,
  getSources,
} from "@/lib/data";

// Chaves de query: ["data", recurso, slug], convenção do contrato (.empresa/arquitetura.md).
const opts = { staleTime: Infinity, retry: 1 } as const;

/** enabled=false adia o carregamento do JSON (a busca global só carrega quando abre). */
export const useCreatures = (enabled = true) =>
  useQuery({ queryKey: ["data", "creatures"], queryFn: getCreatures, enabled, ...opts });
export const useHunts = (enabled = true) =>
  useQuery({ queryKey: ["data", "hunts"], queryFn: getHunts, enabled, ...opts });
export const useCreature = (slug: string) =>
  useQuery({ queryKey: ["data", "creature", slug], queryFn: () => getCreature(slug), ...opts });
export const useHunt = (slug: string) =>
  useQuery({ queryKey: ["data", "hunt", slug], queryFn: () => getHunt(slug), ...opts });
export const useCryptWeapons = () =>
  useQuery({ queryKey: ["data", "cryptWeapons"], queryFn: getCryptWeapons, ...opts });
/** Armas para comparar com as Crypt: todas as de weapons_melee (Knight) e weapons_hand (Monk), mesmo cache do Set Builder. */
export function useAltWeapons() {
  const melee = useTabela("weapons_melee");
  const hand = useTabela("weapons_hand");
  const data = useMemo(
    () =>
      melee.data && hand.data
        ? [...armasDeMelee(melee.data), ...armasDeHand(hand.data)]
        : undefined,
    [melee.data, hand.data],
  );
  return {
    data,
    isPending: melee.isPending || hand.isPending,
    isError: melee.isError || hand.isError,
    refetch: () => Promise.all([melee.refetch(), hand.refetch()]),
  };
}
export const useSources = () =>
  useQuery({ queryKey: ["data", "sources"], queryFn: getSources, ...opts });

/** Linhas de uma tabela de armas do banco (somente leitura). A chave é a mesma do Set Builder, então o cache é compartilhado. */
export const useTabela = (table: string) =>
  useQuery({
    queryKey: ["tibia", table],
    queryFn: () => fetchTable(table),
    staleTime: 60_000 * 30,
    retry: 1,
  });
