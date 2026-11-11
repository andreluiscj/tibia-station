# Arquitetura e contratos: Tibia Station, Fases 2 a 4 (dados, motor Crypt, telas)

Autor: Joaquim (Arquiteto). Data: 2026-11-11. Plano vigente: `docs/PLANO.md`. Consumidores: Igor (backend/dados: seções 3, 4, 5, 6) e Leonardo (frontend: seções 4, 5, 7). Este documento não contém código de produção.

## 0. Decisões já incorporadas (2026-11-11)

1. Modo `official`: arredondar PARA CIMA a metade do excedente acima de 100 (`Math.ceil(x / 2)`). Decisão do Líder.
2. Hunt: aplicar o pierce criatura a criatura e depois tirar a média (simples, ou ponderada por `weight`). Decisão do Líder.
3. Dados oficiais da wiki: se divergirem do PLANO.md ou deste documento, **a wiki vence**; Igor atualiza JSON e testes e avisa Líder e Joaquim. Perks são DADOS: uma divergência de números não muda nenhuma assinatura.
4. Verificações do Igor na API da wiki (relato dele, 2026-11-11): (a) Elemental Pierce oficial: "no máximo dobra" (Physical 4 + 20 = 8) e "0 nunca aumenta" CONFIRMADOS; (b) elemento do pierce CONFIRMADO: Breaker = Fire, Slicer = Earth, Splitter = Energy; Crypt Strike só Physical; (c) os perks dos níveis 1 a 7 NÃO existem na wiki: a única fonte é `docs/PLANO.md` 5.2 e eles ficam marcados como NÃO CONFIRMADOS em `data/sources.json`.
5. Resistência negativa (a criatura ABSORVE o elemento, ex.: Earl Osam, death -200): comportamento definido nas seções 5.2 e 5.3. O pierce oficial NÃO altera resistência <= 0 (premissa conservadora, ver risco 11); o ranking não trunca valores negativos e sinaliza `absorbs`.
6. A wiki marca valores não confirmados como "100%?": o importador MANTÉM o número (100) e registra o elemento em `Creature.resistUnconfirmed` (seção 3).

## 1. Problema, escopo, premissas

- Problema: oferecer Crypt Calculator, Hunt Finder e ficha de monstro com dados da TibiaWiki, sem depender de rede em tempo de execução e sem tocar nos buckets nem nas tabelas existentes do Supabase.
- Escopo: `data/*.json`, `scripts/import-wiki.ts`, `src/lib/data/`, `src/lib/crypt/`, migration SQL das tabelas novas, props dos componentes compartilhados. Fora de escopo: calculadora geral (`/calculadora`), redesenho do Set Builder, marca.
- Versões lidas em `package.json`: React 19.2, TanStack Start 1.168 / Router 1.170, Vite 8, Tailwind 4.2, `@supabase/supabase-js` 2.110, `@tanstack/react-query` 5.101, `zod` 3.24, `motion` 14, vitest 5.1, TypeScript 5.8, bun. Alias existente: `@/*` -> `./src/*`.
- Configuração a garantir na Fase 2 (área do Igor; pular o que já estiver feito): script `"test": "vitest run"` no `package.json`; `"resolveJsonModule": true` no `tsconfig.json`; alias `@data/*` -> `./data/*` (tsconfig; o projeto usa `vite-tsconfig-paths`); incluir `data/**/*.json` no `include` se o tsc não resolver o import.
- Mapeamento de vocação: o app usa `VocationKey` (`EK`, `RP`, `MS`, `ED`, `EM`) em `src/lib/tibia.ts`. Os dados Crypt usam `'knight' | 'monk'`. Mapa fixo: `EK -> knight`, `EM -> monk`; RP, MS e ED não usam armas Crypt.

## 2. Estrutura de pastas e limites

```
data/
  creatures.json            Creature[]
  hunts.json                Hunt[]
  crypt-weapons.json        CryptWeapon[]
  sources.json              Sources
  relatorio-hunts.md        gerado: hunts sem criaturas detectadas
scripts/
  import-wiki.ts            (bun) escreve data/*.json e supabase/seed.sql
src/lib/data/
  types.ts                  ÚNICA definição dos tipos dos JSON (importador, app e motor importam daqui)
  index.ts                  getCreatures, getHunts, getCryptWeapons, getCreature, getHunt, getCryptWeapon, getSources
src/lib/crypt/
  types.ts                  tipos do motor (somente tipos)
  pierce.ts                 applyPiercing
  engine.ts                 cryptVocation, enumerateCombos, evaluateWeapon, compareModes, rankWeapons, creatureToTarget, huntToTargets, plainElementBaseline
  *.test.ts                 vitest (ao lado dos arquivos)
supabase/migrations/20261111000000_station_data.sql
supabase/seed.sql           gerado pelo importador
```

Limites: `src/lib/crypt/` não importa React, Supabase nem `@/lib/data/index.ts` (só `import type` de `@/lib/data/types` e de `@/lib/tibia`). `src/lib/data/` não importa `src/lib/crypt/`. Telas importam dos dois. Usar o `slugify` de `@/lib/storage` para gerar slugs.

## 3. (a) Tipos dos JSON em `data/` (arquivo: `src/lib/data/types.ts`, literal)

Convenções: arrays simples ordenados por `slug` (diff estável); campos camelCase; `null` = a wiki não informa; `slug = slugify(name)` (o mesmo `slugify` do sprite, para casar com o GIF do bucket); o importador FALHA se houver slug duplicado dentro de um arquivo. Se o Igor já implementou uma forma diferente em algum campo, a implementação dele vale; ele registra a diferença aqui e avisa Leonardo e Joaquim (nenhuma assinatura muda em silêncio).

```ts
// src/lib/data/types.ts
export type Element =
  | "physical" | "earth" | "fire" | "energy" | "ice" | "holy" | "death" | "hpDrain" | "drown";

/** Os 7 elementos usados pelo motor Crypt e pela UI de resistência. */
export type ElementKey = "physical" | "earth" | "fire" | "energy" | "ice" | "holy" | "death";

/**
 * Formato da wiki: 100 = neutro, 80 = 20% de resistência, 110 = 10% de fraqueza,
 * 0 = imune, VALOR NEGATIVO = a criatura absorve o elemento (cura; ex.: death -200).
 * null = a wiki não informa.
 */
export type ResistMap = Record<Element, number | null>;

// data/creatures.json  -> Creature[]
export interface Creature {
  slug: string;                 // slugify(name); chave primária
  name: string;                 // "Hellflayer"
  wikiTitle: string;            // título exato da página (para link e atribuição)
  hp: number | null;            // pontos de vida
  exp: number | null;           // experiência por kill
  bestiaryClass: string | null; // ex.: "Demon"
  bestiaryLevel: number | null; // 1..4 (infobox bestiarylevel, se numérico)
  resist: ResistMap;            // as 9 chaves SEMPRE presentes; null quando ausente; pode ser negativo
  resistUnconfirmed: Element[]; // elementos que a wiki marca como "100%?" (valor mantido em resist); [] se nenhum
}

// data/hunts.json  -> Hunt[]
export interface HuntCreature {
  creatureSlug: string;         // DEVE existir em creatures.json (o importador descarta links desconhecidos)
  weight: number;               // > 0; inicial = nº de aparições do link na página; editável (curadoria)
}
export interface Hunt {
  slug: string;
  name: string;
  wikiTitle: string;
  city: string | null;
  location: string | null;
  levelKnights: number | null;
  levelPaladins: number | null;
  levelMages: number | null;
  expRaw: string | null;        // texto cru do infobox (exibição apenas; formato não garantido)
  lootRaw: string | null;       // idem
  creatures: HuntCreature[];    // [] permitido (vai para relatorio-hunts.md); sem duplicatas de creatureSlug
}

// data/crypt-weapons.json  -> CryptWeapon[]  (4 itens)
export type CryptVocation = "knight" | "monk";
export type CryptCategory = "club" | "sword" | "axe" | "fist";
export type CryptElement = "fire" | "earth" | "energy";

export interface PierceSpec {
  physical: number;             // % de pierce físico (>= 0)
  elemental: number;            // % de pierce no elemento da arma (>= 0)
}
export interface PerkOption {
  id: string;                   // "<nível>.<índice 1-based>", ex.: "3.2"
  text: string;                 // texto do perk (inglês), exibido na UI
  pierce: PierceSpec;           // {0,0} para perks que não são pierce
}
export interface ProficiencyLevel {
  level: 1 | 2 | 3 | 4 | 5 | 6 | 7;
  options: PerkOption[];        // só 1 perk ativo por nível; >= 1 opção
}
export interface CryptWeapon {
  slug: string;                 // "crypt-breaker"
  name: string;                 // "Crypt Breaker"
  wikiTitle: string;
  vocation: CryptVocation;
  category: CryptCategory;
  attack: number;
  defense: number;
  element: CryptElement | null; // null para o Monk (sem pierce elemental)
  levelRequired: number;        // 450
  imbuementSlots: number;       // 3
  attributes: string[];         // ex.: ["club fighting +4"]
  perks: ProficiencyLevel[];    // exatamente 7 itens, level 1..7 em ordem
}

// data/sources.json  -> Sources
export interface DatasetInfo {
  endpoint: string;             // "https://tibia.fandom.com/api.php"
  license: string;              // "CC BY-SA" (Igor confirma a versão via meta=siteinfo&siprop=rightsinfo)
  licenseUrl: string | null;
  attribution: string;          // texto para o rodapé
  importedAt: string;           // ISO 8601
  count: number;
  unconfirmedFields: string[];  // campos NÃO confirmados na wiki; para cryptWeapons: ["perks"] (fonte: docs/PLANO.md 5.2); [] se nenhum
}
export interface Sources {
  schemaVersion: 1;
  importer: { name: "scripts/import-wiki.ts"; version: string };
  datasets: { creatures: DatasetInfo; hunts: DatasetInfo; cryptWeapons: DatasetInfo };
}
```

Regras do importador (a resposta da wiki é dado NÃO confiável): validar cada registro com `zod` antes de gravar; números NaN/infinitos viram `null`; resistências negativas são VÁLIDAS e mantidas; valor "N%?" grava N em `resist` e inclui o elemento em `resistUnconfirmed`; texto da wiki é gravado como string simples e NUNCA renderizado como HTML (a UI não usa `dangerouslySetInnerHTML`); 1 requisição por vez com pausa; User-Agent genérico do projeto; só `api.php`.

Armas Crypt: são só 4. O importador lê da API os dados numéricos (ataque, defesa, atributos, nível, elemento) e usa **constantes escritas à mão** para os perks (semente do PLANO.md 5.2; comentário no código: "fonte: docs/PLANO.md 5.2; não consta na wiki"). Não construir parser de perks.

## 4. (b) API da camada `src/lib/data/index.ts` (literal)

Decisão: **assíncronas** (`Promise`). Justificativa: o `import()` dinâmico do JSON mantém as ~2.200 criaturas fora do bundle inicial (Lighthouse) e permite trocar a origem por Supabase sem mudar nenhuma tela.

```ts
import type { Creature, Hunt, CryptWeapon, Sources } from "./types";

export function getCreatures(): Promise<readonly Creature[]>;
export function getHunts(): Promise<readonly Hunt[]>;
export function getCryptWeapons(): Promise<readonly CryptWeapon[]>;
export function getSources(): Promise<Sources>;
/** null se o slug não existir (o loader da rota decide chamar notFound()). Nunca lança por "não encontrado". */
export function getCreature(slug: string): Promise<Creature | null>;
export function getHunt(slug: string): Promise<Hunt | null>;
export function getCryptWeapon(slug: string): Promise<CryptWeapon | null>;
```

Regras de contrato:
- Cada função faz `import("@data/<arquivo>.json")` na primeira chamada e guarda a `Promise` em variável de módulo (cache). Resultados são `readonly`: consumidores nunca mutam.
- `getCreature`/`getHunt`/`getCryptWeapon` usam um `Map<slug, T>` construído na primeira chamada.
- Erro de carga (chunk não baixou) propaga como `Error`; a UI mostra o estado de erro desenhado.
- Chaves do React Query (Leonardo): `["data","creatures"]`, `["data","hunts"]`, `["data","cryptWeapons"]`, `["data","creature",slug]`, `["data","hunt",slug]`, `["data","cryptWeapon",slug]`; `staleTime: Infinity` (dados empacotados).
- Troca futura por Supabase: só `index.ts` muda; a assinatura é a mesma.

## 5. (c) API pública do motor `src/lib/crypt/` (literal)

Funções puras, sem I/O, sem React, sem Supabase. Erro de uso (entrada inválida) lança `RangeError` com mensagem em português; resultado "não encontrado" nunca lança.

### 5.1 `types.ts` (somente tipos)

```ts
import type { CryptWeapon, ElementKey, PierceSpec } from "@/lib/data/types";

export type PierceMode = "official" | "reference";
export type PresetKey = "elemental" | "hybrid" | "physical";

/** Formato wiki, 100 = neutro; sempre numérico; pode ser 0 (imune) ou NEGATIVO (absorve). */
export type Resist7 = Record<ElementKey, number>;

export interface Target {
  id: string;                    // slug da criatura
  name: string;
  resist: Resist7;               // null da wiki já convertido para 100
  weight: number;                // > 0 (1 para criatura única)
  assumedNeutral: ElementKey[];  // elementos que eram null e foram assumidos como 100 (a UI avisa)
}

export interface PerkChoice {
  level: 3 | 5 | 7;
  perkId: string;                // PerkOption.id escolhido ("3.1")
}
export interface Combo {
  choices: PerkChoice[];         // só níveis 3, 5, 7 que têm opção de pierce > 0; ordem crescente de level
  pierce: PierceSpec;            // soma das escolhas
  imbued: boolean;               // true sse weapon.element !== null && pierce.elemental > 0
}

export interface TargetValue {
  targetId: string;
  damagePct: number;             // 100 = neutro; >100 melhor; pode ser <= 0 (imune/absorve)
  absorbs: boolean;              // true se algum componente usado (físico, ou elemento quando imbued) tem resistência < 0
}
export interface ComboResult {
  preset: PresetKey | null;      // preenchido se o combo é exatamente o de um preset
  combo: Combo;
  damagePct: number;             // média ponderada por weight dos perTarget; NÃO truncar nem arredondar no motor
  perTarget: TargetValue[];      // mesma ordem de `targets`
}

export interface EvaluateOptions {
  mode?: PierceMode;             // padrão "official"
  elementalShare?: number;       // 0..1, padrão 0.5 (fração do dano convertida ao elemento quando imbued)
  baseline?: number;             // padrão 100 (dano neutro); o veredito compara com isto
  maxProficiencyLevel?: number;  // inteiro 1..7, padrão 7; níveis acima não entram nas combinações
}

export interface WeaponEvaluation {
  weaponSlug: string;
  mode: PierceMode;
  elementalShare: number;
  baseline: number;
  presets: {
    elemental: ComboResult | null; // null se weapon.element === null ou o preset não existe nos perks
    hybrid: ComboResult | null;
    physical: ComboResult;         // sempre existe
  };
  best: ComboResult;               // melhor entre TODAS as combinações enumeradas
  secondBest: ComboResult | null;  // 2ª melhor combinação distinta (null se só houver 1)
  diffToSecondPct: number | null;  // (best.damagePct / secondBest.damagePct - 1) * 100; null se secondBest null ou secondBest.damagePct <= 0
  verdict: "worth" | "not_worth";  // best.damagePct > baseline ? "worth" : "not_worth" (UI: "compensa" / "não compensa")
  assumedNeutral: ElementKey[];    // união dos assumedNeutral dos targets
}

export interface RankedEvaluation {
  weapon: CryptWeapon;
  evaluation: WeaponEvaluation;
  rank: number;                        // 1-based
  advantageOverNextPct: number | null; // (best / bestDoPróximo - 1) * 100; null para o último ou se o best do próximo for <= 0
  displayRank: number;                 // ranking de competição para exibição (1, 2, 2, 4...); empata se |best do líder do grupo - best| < TIE_DISPLAY_EPS (0.05)
  tied: boolean;                       // true se o grupo de displayRank tem 2 ou mais armas (a UI mostra "empata")
}

export interface ModeComparison {
  official: WeaponEvaluation;
  reference: WeaponEvaluation;
  differs: boolean;                // true se qualquer presets/best diferir em damagePct por mais de 0.005 entre os modos
}
```

### 5.2 `pierce.ts`

```ts
/**
 * Aplica pierce elemental a UMA resistência (formato wiki, 100 = neutro).
 * Lança RangeError se resist ou pierce forem não finitos, ou se pierce < 0.
 * resist pode ser 0 ou negativo (não lança).
 */
export function applyPiercing(resist: number, pierce: number, mode?: PierceMode /* padrão "official" */): number;
```

Algoritmo (espec. exata). `half(x) = mode === "official" ? Math.ceil(x / 2) : x / 2`.

```
if (!isFinite(resist) || !isFinite(pierce) || pierce < 0) throw RangeError
if (pierce === 0) return resist
if (mode === "official" && resist <= 0) return resist                   // regra 2 ("0 nunca aumenta"), estendida a r < 0 (absorção): ver risco 11
raw = resist < 100
  ? (pierce <= 100 - resist ? resist + pierce : 100 + half(pierce - (100 - resist)))
  : resist + half(pierce)                                               // regra 1 (acima de 100, metade)
return mode === "official" ? Math.min(raw, 2 * resist) : raw            // regra 3 (no máximo dobra); aqui resist > 0
```
Regra 4 (não afeta Charms) não é do motor: é só aviso na UI. O modo `reference` é a fórmula da calculadora de referência (sem as regras 2 e 3 e sem arredondar); em `reference`, resistência negativa segue a mesma fórmula (ex.: -200 + 45 = -155, o pierce reduz a absorção). A diferença entre os modos nesse caso entra no indicador "official ≠ reference".

### 5.3 `engine.ts`

```ts
export function cryptVocation(v: VocationKey): CryptVocation | null; // EK -> "knight", EM -> "monk", demais -> null
export function enumerateCombos(weapon: CryptWeapon, maxProficiencyLevel?: number /* padrão 7 */): Combo[];
export function evaluateWeapon(weapon: CryptWeapon, targets: readonly Target[], options?: EvaluateOptions): WeaponEvaluation;
export function compareModes(weapon: CryptWeapon, targets: readonly Target[], options?: Omit<EvaluateOptions, "mode">): ModeComparison;
export function rankWeapons(weapons: readonly CryptWeapon[], targets: readonly Target[], options?: EvaluateOptions): RankedEvaluation[];
export function creatureToTarget(creature: Creature, weight?: number /* padrão 1 */): Target;
export function huntToTargets(
  hunt: Hunt,
  creaturesBySlug: ReadonlyMap<string, Creature>,
  options?: { weighting?: "equal" | "weighted" } /* padrão "equal" */,
): Target[];
export function plainElementBaseline(
  targets: readonly Target[],
  elements?: readonly ElementKey[] /* padrão ["fire","earth","energy","ice","holy","death"] */,
): { element: ElementKey; damagePct: number };
```

**enumerateCombos**: considera só os níveis 3, 5 e 7 (os únicos que alteram o pierce) com `level <= maxProficiencyLevel`. Para cada nível, as escolhas são as opções de `perks[level-1].options`, deduplicadas por `pierce` (opções com `{0,0}` colapsam numa só, usando a de menor índice como `perkId`). Produto cartesiano na ordem 3 x 5 x 7; descartar duplicatas de `(pierce.physical, pierce.elemental)` mantendo a primeira ocorrência. `choices` só lista níveis que têm ao menos uma opção de pierce > 0. `imbued = weapon.element !== null && pierce.elemental > 0`. Para os perks do PLANO: Knight = 12 combinações; Monk = 2 (físico 12 e físico 20).

**Valor por alvo** (função interna, igual para todos os combos), com `s = elementalShare`:
```
phys = applyPiercing(t.resist.physical, combo.pierce.physical, mode)
v    = combo.imbued
         ? (1 - s) * phys + s * applyPiercing(t.resist[weapon.element], combo.pierce.elemental, mode)
         : phys
absorbs = t.resist.physical < 0 || (combo.imbued && t.resist[weapon.element] < 0)
```
O modo físico é 100% físico (sem imbuement elemental); os modos com pierce elemental assumem imbuement elemental, dividindo `s` elemento / `1 - s` físico. O `elementalShare` é premissa NÃO confirmada: a UI mostra como "premissa".

**Resistência negativa**: o valor `v` pode ser <= 0 e NÃO é truncado (um alvo que absorve o elemento puxa a média para baixo, que é a leitura honesta de "essa arma cura o monstro"). Quem marca o aviso é `TargetValue.absorbs`; a UI mostra "esta criatura absorve o elemento" na lista por monstro e no `ResultCard`. O ranking e `best`/`secondBest` usam `damagePct` como está (negativo ordena abaixo de qualquer positivo).

**Média do combo**: `damagePct = Σ(weight_i * v_i) / Σ(weight_i)` (pierce aplicado alvo a alvo, depois média). Peso 1 para todos = média simples.

**Presets** (resolvidos sobre os perks do JSON, nunca com números fixos):
- `elemental`: em cada nível 3, 5, 7 escolhe a opção de MAIOR `pierce.elemental`; exige `weapon.element !== null` e `> 0` nos três níveis, senão `null`. Knight: (físico 0, elemental 45).
- `hybrid`: nível 3 escolhe a opção de maior `pierce.physical` (> 0), níveis 5 e 7 as de maior `pierce.elemental` (> 0); senão `null`. Knight: (6, 35).
- `physical`: em cada nível 3, 5, 7 escolhe a opção de maior `pierce.physical` (empate: menor índice). Sempre existe. Knight: (14, 0). Monk: (20, 0).
`ComboResult.preset` indica o preset cujo `pierce` é idêntico, ou `null`.

**best / secondBest**: ordenar todas as combinações por `damagePct` desc, depois `pierce.elemental` desc, depois `pierce.physical` desc. `best` = 1º, `secondBest` = 2º.

**Validações** (RangeError): `targets` vazio; `weight <= 0` ou não finito; `elementalShare` fora de 0..1; `maxProficiencyLevel` fora de 1..7 ou não inteiro; arma sem `perks` com 7 níveis; resistência não finita em algum `Target`.

**compareModes**: chama `evaluateWeapon` com `mode: "official"` e `"reference"`; `differs = true` se algum `presets.*.damagePct` ou `best.damagePct` diferir por mais de 0.005. Alimenta o indicador "official ≠ reference".

**rankWeapons**: avalia cada arma, ordena por `evaluation.best.damagePct` desc (empate exato: `weapon.slug` asc), preenche `rank` e `advantageOverNextPct`. Empate de exibição (`TIE_DISPLAY_EPS = 0.05`, separado do `TIE_EPS` de ordenação, que não reordena nada): o líder do grupo define o `displayRank`; um item entra no grupo se `|best do líder - best do item| < 0.05`; `tied` vale true para todo item de grupo com 2 ou mais membros. `rank` e `advantageOverNextPct` não mudam.

**creatureToTarget**: `resist` = os 7 `ElementKey` de `creature.resist` com `null -> 100` e a lista `assumedNeutral`; valores negativos passam como estão; `resistUnconfirmed` NÃO entra no motor (o número já é o mantido pela wiki; a UI avisa via `ResistanceBar.assumed`). `id = creature.slug`.
**huntToTargets**: um `Target` por `hunt.creatures[i]`; `weighting: "equal"` (padrão, decisão do Líder: média simples, cada criatura conta igual, como a calculadora de referência) usa `weight = 1`; `weighting: "weighted"` usa `weight = hunt.creatures[i].weight`; slugs ausentes em `creaturesBySlug` são ignorados (a UI mostra "N criaturas sem dados"); pode devolver `[]` (o chamador trata: mensagem de hunt sem criaturas).
**plainElementBaseline**: "arma alternativa 100% elemental sem pierce": para cada elemento, média ponderada de `resist[element]` dos targets; devolve o maior. Serve como `baseline` opcional (a UI pode passar `baseline: plainElementBaseline(targets).damagePct`; o padrão do veredito continua 100).

### 5.4 Vetores de teste obrigatórios (vitest; `toBeCloseTo(x, 2)`)

`applyPiercing`:

| resist | pierce | official | reference | origem |
|---|---|---|---|---|
| 90 | 6 | 96 | 96 | PLANO 5.3 (oficial) |
| 104 | 6 | 107 | 107 | PLANO 5.3 (oficial) |
| 96 | 8 | 102 | 102 | PLANO 5.3 (oficial) |
| 4 | 20 | 8 | 24 | PLANO 5.3 (oficial: dobra no máximo; confirmado pelo Igor na wiki) |
| 0 | 20 | 0 | 20 | PLANO 5.3 (oficial: 0 nunca sobe; confirmado pelo Igor na wiki) |
| 90 | 45 | 118 | 117.5 | exemplo "Harpy" (comunitário) / ceil |
| 115 | 45 | 138 | 137.5 | ceil(22.5) = 23 |
| 20 | 45 | 40 | 65 | cap 2x (official) |
| 100 | 7 | 104 | 103.5 | borda resist = 100 |
| 80 | 0 | 80 | 80 | pierce 0 |
| -200 | 45 | -200 | -155 | resistência negativa (absorve): official não altera |
| -50 | 20 | -50 | -30 | idem |

Hellflayer (physical 100, earth 80, fire 30, energy 105; demais elementos 100), 1 alvo, `elementalShare` 0.5. Ordem: preset elemental / hybrid / physical.

| Arma | official | reference |
|---|---|---|
| Crypt Breaker (fire) | 80.0 / 81.5 / 107.0 | 87.5 / 84.0 / 107.0 |
| Crypt Slicer (earth) | 106.5 / 105.5 / 107.0 | 106.25 / 105.25 / 107.0 |
| Crypt Splitter (energy) | 114.0 / 113.0 / 107.0 | 113.75 / 112.75 / 107.0 |
| Crypt Strike (Monk, sem elemento) | presets.elemental = null, presets.hybrid = null, physical 110.0 | physical 110.0 |

Outros testes obrigatórios:
- `enumerateCombos`: Knight devolve 12 combos, contendo os pierces (0,45), (6,35), (14,0); Monk devolve 2 combos com pierces (12,0) e (20,0); `maxProficiencyLevel = 5` remove o nível 7; sem duplicatas de `(physical, elemental)`.
- `best.damagePct >=` cada preset, sempre; `diffToSecondPct = (best/second - 1) * 100`.
- Hunt ponderada, alvos A = Hellflayer e B = tudo 100, arma Crypt Slicer, preset elemental: média simples official 109.0 / reference 108.75; pesos A:3, B:1 official 107.75 / reference 107.5 (por alvo: A 106.5 / 106.25, B 111.5 / 111.25).
- `rankWeapons` no Hellflayer, modo official: ordem Splitter, Breaker, Slicer (best 114.0, 107.0, 107.0; Breaker e Slicer empatam no best físico (14,0) e desempatam por slug); `advantageOverNextPct` do Splitter = (114/107 - 1) * 100 ≈ 6.54, do Breaker = 0 (empate com o Slicer), do Slicer = `null` (último). Empate de exibição: Splitter `tied = false`, `displayRank = 1`; Breaker e Slicer `tied = true`, `displayRank = 2`. Casos com diferença de best 0.04 (empate) e 0.06 (não é empate).
- `compareModes`: `differs = true` no Hellflayer com Crypt Slicer; `differs = false` para Crypt Strike (Monk) contra um alvo com todas as resistências em 100 (físico 100 + 20 = 110 nos dois modos).
- Resistência negativa: alvo com fire -100 (demais 100), Crypt Breaker, preset elemental: official 0.0 e reference 22.5 (fórmula: 0.5 * 100 + 0.5 * pierced; official -100, reference -55); em ambos `perTarget[0].absorbs === true`.
- Validações: `targets` vazio, `weight <= 0`, `elementalShare = 1.1`, `applyPiercing(5, -1)` e `applyPiercing(NaN, 5)` lançam `RangeError`; `applyPiercing(-1, 5)` NÃO lança.
- `creatureToTarget`: `null -> 100` preenche `assumedNeutral`; valor negativo é preservado.

## 6. (d) Esquema SQL das tabelas novas

Arquivo: `supabase/migrations/20261111000000_station_data.sql` (uma migration, uma transação). Regras: só `create ... if not exists` em tabelas NOVAS do schema `public`; zero referência ao schema `storage` e às tabelas existentes (`amulet`, `armor`, `backpack`, `boots`, `helmet`, `imbuiment`, `legs`, `ring`, `shields_*`, `trinket`, `weapons_*`); NÃO aplicar no banco remoto (André aplica). `ResistMap` nulo NÃO gera linha em `creature_resistances` (ausência = `null`).

```sql
begin;

create table if not exists public.data_sources (
  dataset            text primary key check (dataset in ('creatures','hunts','crypt_weapons')),
  endpoint           text not null,
  license            text not null,
  license_url        text,
  attribution        text not null,
  imported_at        timestamptz not null,
  record_count       integer not null check (record_count >= 0),
  importer_version   text not null,
  unconfirmed_fields text[] not null default '{}'
);

create table if not exists public.creatures (
  slug           text primary key,
  name           text not null,
  wiki_title     text not null,
  hp             integer check (hp is null or hp >= 0),
  exp            integer check (exp is null or exp >= 0),
  bestiary_class text,
  bestiary_level smallint check (bestiary_level is null or bestiary_level between 1 and 4)
);
create index if not exists creatures_name_idx on public.creatures (name);

create table if not exists public.creature_resistances (
  creature_slug text not null references public.creatures (slug) on delete cascade,
  element       text not null check (element in
                  ('physical','earth','fire','energy','ice','holy','death','hpDrain','drown')),
  percent       numeric(7,2) not null check (percent between -1000 and 1000), -- formato wiki: 100 = neutro, negativo = absorve
  confirmed     boolean not null default true,                                -- false quando a wiki marca "100%?"
  primary key (creature_slug, element)
);

create table if not exists public.hunts (
  slug           text primary key,
  name           text not null,
  wiki_title     text not null,
  city           text,
  location       text,
  level_knights  integer check (level_knights  is null or level_knights  >= 0),
  level_paladins integer check (level_paladins is null or level_paladins >= 0),
  level_mages    integer check (level_mages    is null or level_mages    >= 0),
  exp_raw        text,
  loot_raw       text
);
create index if not exists hunts_level_knights_idx on public.hunts (level_knights);

create table if not exists public.hunt_creatures (
  hunt_slug     text not null references public.hunts (slug)     on delete cascade,
  creature_slug text not null references public.creatures (slug) on delete restrict,
  weight        numeric(8,2) not null check (weight > 0),
  primary key (hunt_slug, creature_slug)
);
create index if not exists hunt_creatures_creature_idx on public.hunt_creatures (creature_slug);

create table if not exists public.crypt_weapons (
  slug             text primary key,
  name             text not null,
  wiki_title       text not null,
  vocation         text not null check (vocation in ('knight','monk')),
  category         text not null check (category in ('club','sword','axe','fist')),
  attack           smallint not null check (attack >= 0),
  defense          smallint not null check (defense >= 0),
  element          text check (element is null or element in ('fire','earth','energy')),
  level_required   smallint not null check (level_required > 0),
  imbuement_slots  smallint not null check (imbuement_slots >= 0),
  attributes       text[] not null default '{}'
);

create table if not exists public.crypt_weapon_perks (
  weapon_slug      text not null references public.crypt_weapons (slug) on delete cascade,
  level            smallint not null check (level between 1 and 7),
  perk_index       smallint not null check (perk_index >= 1),     -- id da UI = level || '.' || perk_index
  text             text not null,
  pierce_physical  numeric(5,2) not null default 0 check (pierce_physical  >= 0),
  pierce_elemental numeric(5,2) not null default 0 check (pierce_elemental >= 0),
  primary key (weapon_slug, level, perk_index)
);

-- RLS: leitura pública; nenhuma policy de escrita => insert/update/delete negados para anon/authenticated.
-- Escrita só pelo dono (migration/seed) ou service_role, nunca pelo app.
do $$
declare t text;
begin
  foreach t in array array['data_sources','creatures','creature_resistances','hunts',
                           'hunt_creatures','crypt_weapons','crypt_weapon_perks']
  loop
    execute format('alter table public.%I enable row level security', t);
    execute format('drop policy if exists "public read" on public.%I', t);
    execute format('create policy "public read" on public.%I for select to anon, authenticated using (true)', t);
    execute format('revoke insert, update, delete, truncate on public.%I from anon, authenticated', t);
  end loop;
end $$;

commit;
```

`supabase/seed.sql`: gerado pelo importador a partir dos JSON, com `insert ... on conflict (...) do update` (re-executável), na ordem: `data_sources`, `creatures`, `creature_resistances`, `hunts`, `hunt_creatures`, `crypt_weapons`, `crypt_weapon_perks`. Texto da wiki é dado não confiável: escapar com aspas dollar-quoted com tag aleatória ou equivalente de `quote_literal` no gerador; nunca concatenar sem escape.
Correspondência JSON -> SQL: `Creature.resist.<el>` não nulo -> linha em `creature_resistances` (`confirmed = false` se `el` estiver em `resistUnconfirmed`); `Hunt.creatures[]` -> `hunt_creatures`; `CryptWeapon.perks[].options[]` -> `crypt_weapon_perks` (`perk_index` = parte após o ponto de `PerkOption.id`, `pierce_*` = `pierce.*`); `DatasetInfo.unconfirmedFields` -> `data_sources.unconfirmed_fields`. A sintaxe de RLS e `revoke` não foi validada contra a documentação oficial nesta sessão (ver Fontes): Igor valida com `supabase db lint`/stack local, se disponível, sem aplicar no remoto.

## 7. (e) Props dos componentes compartilhados (Leonardo; arquivos em `src/components/tibia/`)

Regras comuns: componentes apresentacionais (recebem dados por props, sem fetch); todo texto visível em português, exceto nomes de itens, elementos e perks (inglês do jogo); cores SOMENTE por tokens `--element-physical|earth|fire|energy|ice|holy|death|hpDrain|drown` do `styles.css`; animações respeitam `prefers-reduced-motion`; todos aceitam `className?: string`; tipos de domínio vêm de `@/lib/data/types` e `@/lib/crypt/types`. Sprites via `spriteUrl()`/`emptySlotUrl()` de `@/lib/storage` (só leitura).

```ts
import type { ReactNode } from "react";
import type { Creature, Hunt, CryptWeapon, Element } from "@/lib/data/types";
import type { WeaponEvaluation, PierceMode } from "@/lib/crypt/types";

export interface ItemSlotProps {
  itemName?: string | null;      // spriteUrl(itemName); ausente/null = slot vazio
  emptyImage?: string;           // SlotDef.emptyImage; usado via emptySlotUrl() quando vazio ou se o sprite falhar (onError)
  size?: "sm" | "md" | "lg";     // 32 | 48 | 64 px; padrão "md"
  label: string;                 // nome acessível (obrigatório)
  selected?: boolean;
  disabled?: boolean;
  badge?: ReactNode;             // canto inferior direito (ex.: nível)
  onClick?: () => void;          // com onClick => <button>; sem => <div role="img" aria-label>
  className?: string;
}

export interface ElementBadgeProps {
  element: Element;
  variant?: "chip" | "dot";      // padrão "chip"
  size?: "sm" | "md";            // padrão "md"
  showLabel?: boolean;           // padrão true; com false exige aria-label interno com o nome do elemento
  className?: string;
}

export interface ResistanceBarProps {
  element: Element;
  value: number | null;          // formato wiki (100 = neutro, 0 = imune, negativo = absorve); null => estado "sem dado"
  valueAfter?: number | null;    // resistência após o pierce; mostra marca/segmento comparando com value
  max?: number;                  // fundo de escala; padrão 200
  showValue?: boolean;           // padrão true; número em fonte mono, formato pt-BR, 1 casa decimal se não inteiro
  animate?: boolean;             // padrão true (preenche + contagem); false = sem animação
  assumed?: boolean;             // true => estilo hachurado + tooltip "valor assumido ou não confirmado na wiki" (cobre null->100 e "100%?")
  className?: string;
}
// Semântica: preenchimento = dano recebido (value / max, limitado a 0..1); linha fixa em 100 (neutro);
// value < 0 => preenchimento 0 e selo "absorve" com o número (ex.: "-200%"); aria-label diz "absorve (cura)";
// role="meter" com aria-valuenow/min/max e aria-label ("Fire: recebe 30% do dano").

export interface WeaponCardProps {
  weapon: CryptWeapon;           // sprite = spriteUrl(weapon.name); mostra Atk/Def, ElementBadge do pierce, attributes
  rank?: number;                 // opcional: selo de posição
  selected?: boolean;
  onSelect?: (slug: string) => void;  // presente => cartão clicável (button, foco visível)
  showPerks?: boolean;           // padrão false: lista de perks por nível 3/5/7
  className?: string;
}

export interface ResultCardProps {
  weapon: CryptWeapon;
  evaluation: WeaponEvaluation;  // saída de evaluateWeapon
  rank: number;                  // 1-based, de rankWeapons
  advantageOverNextPct: number | null; // de rankWeapons; null => não exibe
  officialDiffers?: boolean;     // de compareModes; true => indicador "official ≠ reference"
  targetNames?: Record<string, string>; // targetId -> nome, para a lista por monstro
  highlight?: boolean;           // vencedora
  className?: string;
}
// Conteúdo: 3 presets (rótulos DERIVADOS de combo.pierce, ex.: "Elemental 45%", "Híbrida 35% + 6%", "Physical 14%";
// preset null => "indisponível para esta arma"), melhor combinação com o texto dos perks (via choices + weapon.perks),
// veredito ("compensa"/"não compensa"), diferença para a 2ª (diffToSecondPct), lista por monstro (ganha/perde vs baseline,
// colapsável; mostra "absorve o elemento" quando perTarget.absorbs), premissa "50% físico / 50% elemento" quando algum combo
// imbued (valor de elementalShare exibido), aviso de assumedNeutral, aviso fixo "cálculo teórico (ignora armadura e mitigação)".

export interface CreaturePickerProps {
  creatures: readonly Creature[];
  value: string | null;          // slug
  onChange: (slug: string | null) => void;
  id?: string;
  label: string;                 // rótulo visível/acessível
  placeholder?: string;
  disabled?: boolean;
  loading?: boolean;             // skeleton desenhado
  error?: string | null;         // estado de erro desenhado
  autoFocus?: boolean;
  className?: string;
}
// Combobox acessível (Radix Popover + cmdk, restilizado): busca sem acento/caixa (via slugify), setas/Enter/Esc,
// no máximo 50 resultados renderizados, item mostra nome + HP + classe do bestiário; sem GIF da criatura (placeholder da marca).

export interface HuntPickerProps {
  hunts: readonly Hunt[];
  value: string | null;          // slug
  onChange: (slug: string | null) => void;
  filter?: { vocation: "knight" | "paladin" | "mage"; level: number }; // mostra só hunts com levelX !== null && levelX <= level
  onlyWithCreatures?: boolean;   // padrão true (esconde hunts com creatures: [])
  id?: string;
  label: string;
  placeholder?: string;
  disabled?: boolean;
  loading?: boolean;
  error?: string | null;
  className?: string;
}
```

Estado da tela `/crypt` na URL (TanStack Router `validateSearch`, `zod` já instalado, todos com `.catch(default)` para nunca quebrar com URL inválida): `voc: "knight"|"monk"` (padrão `knight`), `cat: "club"|"sword"|"axe"|"fist"`, `creature?: string`, `hunt?: string` (mutuamente exclusivos; se ambos, vence `creature`), `mode: "official"|"reference"` (padrão `official`), `share: number` 0..1 (padrão 0.5). Slugs desconhecidos => estado vazio com mensagem, nunca erro 500.

Fluxo de dados da tela: `useQuery` com as chaves da seção 4 -> `creatureToTarget`/`huntToTargets` -> `rankWeapons(armas filtradas por cryptVocation e cat, targets, {mode, elementalShare})` e `compareModes` por arma para o indicador -> `ResultCard` por arma.

## 8. (f) Riscos e decisões

| # | Risco / decisão | Mitigação / dono |
|---|---|---|
| 1 | Perks por nível 1-7 NÃO existem na wiki (relato do Igor); única fonte: `docs/PLANO.md` 5.2. | Marcados como NÃO CONFIRMADOS em `data/sources.json` (`unconfirmedFields: ["perks"]`); constantes à mão no importador; a UI exibe aviso "perks conforme plano, não confirmados na wiki"; se André/Wiki trouxerem outra fonte, trocar só os dados. |
| 2 | Regras oficiais do pierce (dobra no máximo, 0 nunca sobe) e elemento por arma: CONFIRMADOS pelo Igor na API da wiki. A fonte comunitária (TibiaQA 38380, Dragon Lord 20 + 45 = 65) é anterior/diverge; o motor segue a wiki. | Fechado. Manter o teste (20, 45) = 40 em `official`. |
| 3 | `elementalShare = 0.5` não confirmado por fonte pública. | Parâmetro exposto; UI mostra como "premissa"; Physical sem imbuement é 100% físico. |
| 4 | Média da hunt: pierce não é linear; aplicado por criatura e depois média (Líder). Pesos iniciais = nº de aparições do link (heurística). | `weight` editável; `data/relatorio-hunts.md` lista hunts sem criaturas. |
| 5 | Texto e dados da wiki são não confiáveis (injeção/HTML). | `zod` no importador; texto como string simples; sem `dangerouslySetInnerHTML`; SQL do seed escapado. |
| 6 | Campos ausentes nas ~2.200 criaturas. | `null` explícito; motor assume 100 e sinaliza `assumedNeutral`; UI avisa. |
| 7 | Bundle: JSON grande. | `import()` dinâmico por arquivo (seção 4); medir no Lighthouse de `/crypt` (gate 8). |
| 8 | Config do projeto (script `test`, `resolveJsonModule`, alias `@data`). | Igor, Fase 2 (seção 1). |
| 9 | Infobox de Hunt pode ter `lvlmonks` (não consta no PLANO). | Se existir: `levelMonks: number | null` em `Hunt` (mudança aditiva) + coluna `level_monks`; avisar Leonardo. |
| 10 | Slug colide entre criaturas. | Importador falha em slug duplicado (não sobrescreve). |
| 11 | Resistência negativa: a wiki não diz se o Elemental Pierce reduz a absorção. Premissa: em `official`, `r <= 0` não muda (extensão da regra "0 nunca aumenta"); em `reference` aplica a fórmula e reduz a absorção. | Igor verifica na wiki (página Elemental Pierce / Weapon Proficiency); se a regra oficial disser outra coisa, mudar só a linha `resist <= 0` em `pierce.ts` e as 2 linhas negativas da tabela de testes. Resultado nunca truncado; `absorbs` avisa a UI. |
| 12 | A wiki marca valores não confirmados como "100%?". | Importador mantém o número e preenche `resistUnconfirmed`; sem efeito no cálculo; a UI sinaliza via `ResistanceBar.assumed`. |

Reversibilidade: os JSON são regeneráveis; a migration só cria tabelas novas (reversão: `drop table` das 7 tabelas, sem efeito em nada existente); a troca de origem de dados é isolada em `src/lib/data/index.ts`.

## 9. Sequência de implementação

1. **Igor, Fase 2:** config (script `test`, `resolveJsonModule`, alias `@data`) -> `src/lib/data/types.ts` (**avisar Leonardo assim que existir**) -> `scripts/import-wiki.ts` + `data/*.json` + `relatorio-hunts.md` -> `src/lib/data/index.ts` -> migration + `seed.sql`.
2. **Igor, Fase 3:** `src/lib/crypt/` com os testes da seção 5.4 verdes (pode começar em paralelo: só precisa de `types.ts`; usar as 4 armas montadas à mão a partir do PLANO 5.1 e 5.2 como fixture de teste até o JSON real chegar).
3. **Leonardo, Fase 4 (em paralelo):** componentes da seção 7 contra os tipos (fixtures inline com o Hellflayer da seção 5.4) -> telas `/crypt`, `/hunts`, `/hunts/$slug`, `/monstros/$slug` consumindo `src/lib/data` e `src/lib/crypt` quando prontos.
4. Divergência de contrato: quem achar manda mensagem a Joaquim e ao Líder; ninguém altera assinatura em silêncio.

## 10. Critérios de aceite arquitetural (mensuráveis)

- `bunx tsc --noEmit` e `bun run lint` sem erros; `bun run test` verde incluindo TODOS os vetores da seção 5.4 (Hellflayer nos 2 modos, 12 linhas de `applyPiercing`, enumeração 12/2, hunt ponderada, resistência negativa).
- `grep -rn "from \"react\"\|supabase" src/lib/crypt` sem resultados (motor puro).
- `grep -rn "storage\|\.upload(" supabase/migrations` sem resultados; a migration só cria as 7 tabelas novas; nenhuma tabela existente citada.
- Toda tabela nova com RLS habilitada, policy de leitura pública e sem policy de escrita.
- `getCreature("slug-inexistente")`, `getHunt(...)` e `getCryptWeapon(...)` resolvem `null` (teste).
- Cada `creatureSlug` de `hunts.json` existe em `creatures.json`; nenhum slug duplicado; `crypt-weapons.json` tem 4 armas com 7 níveis cada; `sources.json` marca `perks` como não confirmados (teste de integridade do importador).
- Props da seção 7 usadas literalmente (revisão do Lucas confere nomes).

## 11. Fontes consultadas

- `docs/PLANO.md` (fonte de verdade), `src/lib/tibia.ts`, `src/lib/storage.ts`, `package.json`, `tsconfig.json`, `src/integrations/supabase/types.ts` (lista de tabelas existentes, sem conflito de nomes com as 7 novas).
- Verificação do Igor na API da wiki (https://tibia.fandom.com/api.php), 2026-11-11: regras do Elemental Pierce (dobra no máximo, 0 nunca aumenta), elemento do pierce por arma, perks ausentes, resistências negativas e marcador "100%?". Relato recebido por mensagem; a evidência (consulta e data) deve ficar registrada em `data/sources.json`.
- TibiaWiki, páginas Crypt Strike e Crypt Set (https://tibia.fandom.com/wiki/Crypt_Strike, https://tibia.fandom.com/wiki/Crypt_Set): lidas só via resumo de busca; confirmam ataque, defesa, atributos, nível e nomes.
- TibiaQA, resposta 38380 (https://www.tibiaqa.com/38380/what-does-the-pierce-proficiency-do-exactly): fonte comunitária, sem data; confirma a regra por faixa (1:1 abaixo de 100, 0,5 acima) e o exemplo Harpy 117.5; o exemplo Dragon Lord diverge da wiki (risco 2).
- UNVERIFIED (não consultado nesta sessão, conhecimento prévio): sintaxe de RLS/policies/`revoke` do Supabase (https://supabase.com/docs/guides/database/postgres/row-level-security) e `validateSearch` do TanStack Router (https://tanstack.com/router/latest/docs/framework/react/guide/search-params). Validar na implementação.

## 12. Decisões do Líder

Registro mantido pelo Igor (2026-11-11), a pedido do Líder. As seções 0 a 11 são o texto do Joaquim; esta seção só acrescenta.

1. **Arredondamento (`official`):** arredondar PARA CIMA a metade do excedente acima de 100 (`Math.ceil(x / 2)`).
2. **Média da hunt:** aplicar o pierce criatura a criatura e DEPOIS tirar a média simples (cada criatura conta igual, como na calculadora de referência); a ponderada por `weight` continua opção do motor.
3. **Wiki oficial vence o PLANO.md:** conferido em 2026-11-11 na API do MediaWiki. "No máximo dobra" e "0 nunca aumenta" confirmados; Dragon Lord earth 20 + 45 = 40 no `official` (risco 2 fechado). Armas: Breaker club 58/33 Fire, Slicer sword 58/33 Earth, Splitter axe 58/33 Energy, Crypt Strike (nome exato do Monk) fist 45/20 só Physical; 3 slots e nível 450 em todas.
4. **Resistência negativa:** a criatura absorve; mantida nos dados (faixa -10000 a 10000) e tratada no motor conforme as seções 5.2 e 5.3 (risco 11, premissa conservadora).
5. **Perks não confirmados:** os perks 1 a 7 não constam na wiki; fonte única `docs/PLANO.md` 5.2, constantes em `scripts/lib/crypt-weapons.ts` e `sources.json` com `datasets.cryptWeapons.unconfirmedFields = ["perks"]`.
6. **Achados do Pedro (segurança da Fase 2), decididos pelo Líder:**
   - (médio) `plain()` em `scripts/lib/wikitext.ts` agora troca `[http://... texto]` só pelo texto e remove `[http://...]` sem texto; os 378 `hunts.location` com URL foram regenerados (0 restantes, teste em `data.test.ts`).
   - (baixo) `scripts/lib/wiki-client.ts`: `fetch` com `redirect: "manual"`, só segue redirect para `https://tibia.fandom.com`, resposta limitada a 5 MB (Content-Length e bytes lidos); testes em `wiki-client.test.ts`.
   - (baixo) Atribuição CC BY-SA: `license: "CC BY-SA 3.0"`, `licenseUrl: "https://creativecommons.org/licenses/by-sa/3.0/"` em `sources.json`; cada criatura e hunt tem `sourceUrl` (`https://tibia.fandom.com/wiki/<Título>`); SQL com `creatures.source_url` e `hunts.source_url`. O importador valida que o `sourceUrl` começa com o domínio da wiki.

### Divergências entre este contrato e a implementação (a wiki vence; todas avisadas a Joaquim e Leonardo)

| Contrato | Implementação | Motivo |
|---|---|---|
| `Creature.bestiaryLevel: number \| null` (1..4) e coluna `smallint` | `string \| null` ("Easy", "Hard"...) e coluna `text` | A wiki usa texto (Harmless a Challenging), nunca número |
| `Creature` sem `sourceUrl`; `Hunt` sem `sourceUrl` | Campo `sourceUrl` obrigatório nos dois | Decisão do Líder (atribuição), item 6 |
| `creature_resistances.percent` entre -1000 e 1000 | Entre -10000 e 10000 | A wiki tem valores reais fora disso (The Armored Voidborn drown 1500) |
| `Hunt` sem nível de Monk | `Hunt.levelMonks: number \| null`, coluna `level_monks` | A wiki tem `lvlmonk` (risco 9, aditivo) |
| Slug único = `slugify(name)` | Em colisão, `slugify(wikiTitle)` (`doctor-marrow-podzilla`, `poacher-caves-game`); se ainda colidir, o importador falha | Nomes repetidos na wiki |
| Valor `N%?` | Número mantido, elemento em `resistUnconfirmed`, `confirmed = false` no SQL | Contrato seção 3 |

Números da importação: 2203 criaturas, 444 hunts (441 com criaturas, 99,3%), 11 hunts de nível 450+ (todas com criaturas), 4 armas Crypt, 9260 resistências marcadas como não confirmadas.

### Fase 3 (motor Crypt): decisões e observações do Igor

- **Resistência negativa (decisão do Líder, igual às seções 5.2 e 5.3):** `applyPiercing` não lança para `resist` 0 ou negativa; só lança RangeError para valor não finito ou `pierce < 0`. Em `official`, `resist <= 0` volta inalterada; em `reference` vale a fórmula normal. O resultado nunca é truncado e `TargetValue.absorbs` marca o alvo.
- **Ranking em empate é válido e esperado (não é bug):** no Hellflayer/official, Splitter tem best 114,0 e Breaker e Slicer têm best 107,0 (a combinação só física (14,0) vence os presets elementais 80 e 106,5). A ordem Splitter, Breaker, Slicer (desempate por slug) e o `tied = true` com `displayRank = 2` de Breaker e Slicer estão corretos; o exemplo antigo da seção 5.4 foi corrigido pelo Joaquim. A regra "best = melhor entre todas as combinações" fica, para o veredito "compensa / não compensa" não esconder que a opção física é melhor contra o monstro. O `ResultCard` mostra "empata com a próxima" quando `advantageOverNextPct === 0` e trata `best.preset === "physical"` como vencedor mesmo em arma elemental.
- **Empate de exibição (decisão do Líder):** `RankedEvaluation.tied` e `displayRank` (ver 5.1 e 5.3), com `TIE_DISPLAY_EPS = 0.05` em `engine.ts`.
- **Presets com `maxProficiencyLevel` menor que 7:** resolvem só os níveis considerados (elemental/híbrida exigem pierce > 0 em todos eles; `physical` sempre existe).
- **`reference-cases.json`:** 24 casos de `applyPiercing` e 96 casos de arma (12 criaturas reais x 4 armas x 2 modos), gerados por `scripts/gen-reference-cases.ts`; `reference-cases.test.ts` falha se o arquivo ficar defasado em relação ao motor.
- **Relatório do importador:** `data/relatorio-hunts.md` agora lista os slugs desviados (4: `doctor-marrow-podzilla`, `poacher-caves-game`, `poacher-caves-gloomy`, `poacher-caves-poachers`).
- **SQL:** a faixa de `creature_resistances.percent` ficou em -10000..10000 (o arquiteto sugeriu -1000..1000, mas The Armored Voidborn tem drown 1500 na wiki).
- **Peso da hunt (decisão do Líder):** o padrão de `huntToTargets` é MÉDIA SIMPLES (`weighting: "equal"`, peso 1 para todas as criaturas, como o site de referência); `weighting: "weighted"` usa o `weight` da hunt. Valores de teste no Slicer, preset elemental: simples official 109,0 / reference 108,75; ponderada (3 e 1) official 107,75 / reference 107,5. A tela deve oferecer a ponderada só como opção explícita.
- **`reference-cases.json` é um SNAPSHOT do próprio motor:** só vira gate 9 depois que o Luis Felipe comparar os casos com o site de referência. O oráculo independente são os valores fixos do Hellflayer e as tabelas de `pierce.test.ts` e `engine.test.ts`.
- **Veredito da Crypt na tela (decisão do Líder, 2026-11-11, após revisão do Lucas):** a melhor combinação precisa superar o maior entre 100 (dano neutro) e a melhor arma elemental simples sem pierce (`plainElementBaseline` do contrato, passada como `baseline`).

## 13. Calculadora geral de dano (`src/lib/damage/`, contrato para o Leonardo)

Funções puras (sem React, Supabase ou rede). Fórmulas e fontes: `docs/CALCULADORA.md`. Tipos: `src/lib/damage/types.ts` (reusa `ElementKey` e `Creature` de `@/lib/data/types`). Erro de uso lança `RangeError` em português. Resultado = dano MÉDIO por golpe, antes de armadura, mitigação, crítico e charms.

```ts
// engine.ts
export function baseDamage(level: number): number;
export function meleeAttackValue(weaponAttack: number, skill: number, level: number, stance: FightStance): number;
export function distanceAttackValue(attack: number, skill: number, level: number, extraDamage?: number): number;
export function calculateDamage(weapon: Weapon, ctx: CharacterContext, target: DamageTarget, imbuement?: Imbuement): DamageResult;
export function compareDamage(entries: readonly WeaponEntry[], ctx: CharacterContext, target: DamageTarget): ComparedWeapon[]; // 1 a 3 armas, ids únicos
export function meleeWeaponFromRow(row: MeleeWeaponRow): MeleeWeapon;                 // weapons_melee: item_name, physical_attack, earth/fire/energy/ice/holy/death_attack (null -> 0)
export function distanceWeaponFromRow(row: DistanceWeaponRow, ammoAttack: number): DistanceWeapon; // weapons_distance: item_name, attack
```

- `CharacterContext`: `level` (inteiro >= 1), `skill` (>= 0), `stance?` (padrão `"balanced"`, ignorada em distância), `extraDamage?` (>= 0, padrão 0).
- `Weapon`: `{ kind: "melee", name, attack: Partial<Record<ElementKey, number>> }` ou `{ kind: "distance", name, attack, ammoAttack }`. `Imbuement`: `{ element: terra | fogo | energia | gelo | morte, convertedPct: 0..100 }` (Basic 10, Intricate 25, Powerful 50). Arma melee com ataque elemental nativo + imbuement lança `RangeError`.
- `DamageTarget` = `Pick<Creature, "slug" | "name" | "resist">`: passe a criatura de `getCreature`. `null` vira 100 e o elemento entra em `assumedNeutral`; negativo é mantido.
- `DamageResult`: `attackValue`, `components[]` (`element`, `baseDamage`, `resistPct`, `damage`, `absorbs`), `averageDamage` (soma, SEM arredondar; pode ser <= 0), `assumedNeutral`, `estimates`: flags de estimativa que a tela deve avisar: `"native_elemental_split"` (ataque elemental nativo repartido pela proporção das colunas), `"melee_extra_damage"` (corpo a corpo com `extraDamage > 0`) e `"distance_imbuement"` (arma de distância com imbuement). "Multiplicar por resistência" e "mínimo e máximo" não são flags: são AVISOS FIXOS da tela (docs/CALCULADORA.md, seção 2). `extraDamage` entra arredondado para baixo; `meleeAttackValue` e `distanceAttackValue` validam as entradas (RangeError).
- `ComparedWeapon`: `id`, `result`, `rank` (1-based; empate exato: `id` asc), `relativeToBestPct` (null se o melhor for <= 0).
- Fora do escopo: armadura, mitigação, crítico, charms, Elemental Pierce, PvP, chance de acertar, varinhas, rods e `weapons_hand`.
- Valores de teste (calculados à mão, em `engine.test.ts`): nível 450 e skill 100 com arma de ataque 58: balanced 305, offensive 346, defensive 220; Powerful Scorch (50%) contra o Hellflayer 198,25; Grand Sanguine Battleaxe (8 físico + 50 morte) contra o Hellflayer 239,2672 (estimativa).
