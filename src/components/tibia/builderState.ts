// Estado e regras do Set Builder, como funções puras (sem React, sem rede).
// A lógica é a mesma que antes vivia dentro de TibiaSetBuilder.tsx; os testes em builderState.test.ts a descrevem.
import {
  SLOT_LAYOUT,
  applyBaseFilters,
  pickBest,
  tableForSlot,
  type Filters,
  type Item,
  type ProtectionKey,
  type SlotKey,
  type VocationKey,
} from "@/lib/tibia";

export type SelectedSet = Partial<Record<SlotKey, Item>>;
export type ImbuimentMap = Partial<Record<SlotKey, (string | null)[]>>;
export type DataByTable = Record<string, Item[]>;

export interface BuilderState {
  vocation: VocationKey | null;
  /** 0 = sem restrição de nível. */
  level: number;
  protection: ProtectionKey | null;
  ekClass: number | null;
  selected: SelectedSet;
  imbuiments: ImbuimentMap;
}

export const ESTADO_INICIAL: BuilderState = {
  vocation: null,
  level: 0,
  protection: null,
  ekClass: null,
  selected: {},
  imbuiments: {},
};

/** Tabelas que a vocação precisa (uma por slot, mais a de imbuiments). */
export function tabelasDaVocacao(vocation: VocationKey | null): string[] {
  if (!vocation) return [];
  const s = new Set<string>();
  for (const slot of SLOT_LAYOUT) {
    const t = tableForSlot(slot.key, vocation);
    if (t) s.add(t);
  }
  s.add("imbuiment");
  return Array.from(s);
}

export function filtrosDe(s: BuilderState): Filters | null {
  return s.vocation
    ? { vocation: s.vocation, level: s.level, ekClass: s.vocation === "EK" ? s.ekClass : null }
    : null;
}

/** Escolhe o melhor item de cada slot da vocação (o antigo autoPickAll). */
export function pickSet(
  data: DataByTable,
  filters: Filters,
  protection: ProtectionKey | null,
): SelectedSet {
  const next: SelectedSet = {};
  for (const slot of SLOT_LAYOUT) {
    const t = tableForSlot(slot.key, filters.vocation);
    if (!t) continue;
    const best = pickBest(data[t] ?? [], slot.key, filters, protection);
    if (best) next[slot.key] = best;
  }
  return next;
}

export function escolherVocacao(s: BuilderState, v: VocationKey): BuilderState {
  return {
    ...s,
    vocation: v,
    level: 0,
    protection: null,
    ekClass: v === "EK" ? 1 : null,
    selected: {},
    imbuiments: {},
  };
}

/** `carregando`: os dados ainda não chegaram, então o pick sairia vazio e nada muda. */
export function escolherNivel(
  s: BuilderState,
  level: number,
  data: DataByTable,
  carregando: boolean,
): BuilderState {
  if (carregando) return s;
  const filtros = filtrosDe(s);
  return {
    ...s,
    level,
    protection: null,
    selected: filtros ? pickSet(data, { ...filtros, level }, null) : s.selected,
  };
}

export function escolherProtecao(
  s: BuilderState,
  protection: ProtectionKey,
  data: DataByTable,
  carregando: boolean,
): BuilderState {
  if (carregando) return s;
  const filtros = filtrosDe(s);
  return {
    ...s,
    protection,
    selected: filtros ? pickSet(data, { ...filtros, level: s.level }, protection) : s.selected,
  };
}

/** Trocar a classe do EK só muda o filtro; o set já montado fica como está. */
export function escolherClasse(s: BuilderState, ekClass: number): BuilderState {
  return { ...s, ekClass };
}

export function limparSet(s: BuilderState): BuilderState {
  return { ...s, selected: {}, imbuiments: {}, level: 0, protection: null };
}

export function trocarItem(s: BuilderState, slot: SlotKey, item: Item | null): BuilderState {
  const selected = { ...s.selected };
  if (item) selected[slot] = item;
  else delete selected[slot];
  return { ...s, selected };
}

export function definirImbuiment(
  s: BuilderState,
  slot: SlotKey,
  index: number,
  value: string | null,
): BuilderState {
  const slots = (s.selected[slot]?.imbuiment as number | undefined) ?? 0;
  const current = (s.imbuiments[slot] ?? new Array(slots).fill(null)).slice(0, slots);
  while (current.length < slots) current.push(null);
  current[index] = value;
  return { ...s, imbuiments: { ...s.imbuiments, [slot]: current } };
}

/** Itens que o diálogo de um slot oferece: filtros base, busca por nome, nível crescente e id. */
export function itensDoSlot(
  data: DataByTable,
  slot: SlotKey,
  filtros: Filters,
  busca: string,
): Item[] {
  const t = tableForSlot(slot, filtros.vocation);
  if (!t) return [];
  const base = applyBaseFilters(data[t] ?? [], slot, filtros);
  const q = busca.trim().toLowerCase();
  const filtrados = q ? base.filter((i) => i.item_name.toLowerCase().includes(q)) : base;
  return [...filtrados].sort(
    (a, b) => (a.level_minimum ?? 0) - (b.level_minimum ?? 0) || (a.id ?? 0) - (b.id ?? 0),
  );
}

export interface SlotView {
  /** Chave de React (o EM mostra a arma duas vezes). */
  id: string;
  slot: SlotKey;
  row: number;
  col: number;
  item?: Item;
  /** O slot some da grade (vocação sem tabela de escudo, exceto o EM). */
  hidden: boolean;
  /** EK com arma de duas mãos: o escudo aparece apagado e sem clique. */
  blocked: boolean;
}

export const ekDuasMaos = (s: BuilderState) => s.vocation === "EK" && s.selected.weapon?.hand === 2;

/** Monta os slots da grade: o EM não tem escudo (a arma aparece de novo no lugar), o EK de duas mãos bloqueia o escudo. */
export function layoutDoSet(s: BuilderState): SlotView[] {
  const temEscudo = !!s.vocation && !!tableForSlot("shield", s.vocation);
  const duasMaos = ekDuasMaos(s);
  return SLOT_LAYOUT.map((def): SlotView => {
    if (def.key === "shield" && s.vocation === "EM") {
      return {
        id: "weapon-2",
        slot: "weapon",
        row: def.row,
        col: def.col,
        item: s.selected.weapon,
        hidden: false,
        blocked: false,
      };
    }
    const hidden = def.key === "shield" && !!s.vocation && !temEscudo && s.vocation !== "EM";
    const blocked = def.key === "shield" && duasMaos;
    return {
      id: def.key,
      slot: def.key,
      row: def.row,
      col: def.col,
      item: blocked ? undefined : s.selected[def.key],
      hidden,
      blocked,
    };
  });
}

/** O que entra nas contas de atributos: com arma de duas mãos o escudo não conta. */
export function setParaStats(s: BuilderState): SelectedSet {
  if (!ekDuasMaos(s)) return s.selected;
  const resto = { ...s.selected };
  delete resto.shield;
  return resto;
}

/** Acha a linha da tabela `imbuiment` pelo nome do catálogo (as linhas são "Powerful Void" etc.). */
export function acharImbuiment(rows: Item[], catalogName: string): Item | null {
  const needle = catalogName.toLowerCase();
  for (const r of rows) {
    const name = (
      (r.imbuiment_name as string | undefined) ??
      (r.item_name as string | undefined) ??
      ""
    ).toLowerCase();
    if (name === needle || name.endsWith(` ${needle}`) || name.includes(needle)) return r;
  }
  return null;
}

/** Linhas de imbuiment equipadas, para somar nos atributos. */
export function imbuimentosEquipados(imbuiments: ImbuimentMap, rows: Item[]): Item[] {
  const out: Item[] = [];
  for (const list of Object.values(imbuiments)) {
    if (!list) continue;
    for (const name of list) {
      if (!name) continue;
      const row = acharImbuiment(rows, name);
      if (row) out.push(row);
    }
  }
  return out;
}

/** Quantos espaços de imbuiment o slot mostra (botas e slots bloqueados não têm). */
export function espacosDeImbuiment(slot: SlotKey, item: Item | undefined, blocked: boolean) {
  return item && !blocked && slot !== "boots" ? ((item.imbuiment as number | undefined) ?? 0) : 0;
}
