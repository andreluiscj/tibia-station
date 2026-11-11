# Tibia Station: plano de execução (aprovado por André em 2026-11-11)

Objetivo: transformar o Tibia Set em **Tibia Station**, uma plataforma nova (identidade, tema, logo, telas), entregue **pronta e funcionando**, com todos os testes e validações aprovados. O projeto **não usa mais Lovable** (já removido). Idioma da interface: português.

Documentos de apoio (somente leitura, no claude.ai):
- Plano original: https://claude.ai/artifact/Pon4mDS5x7yYBwBN2cXrWo
- Pesquisa Crypt e fórmulas: https://claude.ai/artifact/7YLZwWQogEScQBsUGLSrX9

## 0. Regras inegociáveis

1. **Buckets do Supabase intocados.** Buckets: `Itens Sprites` (`<slug>.gif`), `Empty Set`, `Imbuiments`, `Stats`. Não renomear, mover, apagar nem recriar. Nunca escrever em `storage.buckets`/`storage.objects`. Imagens novas vão para arquivos locais em `public/` (logo, ícones). Tabelas de itens existentes (`weapons_melee`, `armor` etc.) também ficam intactas.
2. Nunca imprimir, commitar ou enviar o conteúdo do `.env`. Ele já está no `.gitignore`.
3. Sem Lovable: não reintroduzir `@lovable.dev/*`, `lovable` em nenhum texto, nem CDN do Lovable.
4. Visual com personalidade própria, sem cara de interface gerada por IA (ver seção 6).
5. Só reportar "pronto" quando todos os gates da seção 8 passarem de verdade, rodando os comandos.

## 1. Estado atual do código (já feito)

- Stack: TanStack Start (React 19), Vite 8, Tailwind 4, Radix/shadcn, React Query, `@supabase/supabase-js`. Gerenciador: bun (há `bun.lock`).
- Só existe uma rota (`/`) com `TibiaSetBuilder` e `CharacterStats` (`src/components/tibia/`). Lógica de domínio em `src/lib/tibia.ts` (URLs de bucket, vocações, slots, filtros, `pickBest`).
- Lovable removido, build passa (`bun run build`), servidor sobe com `node .output/server/index.mjs`. Imagens de fundo estão em `public/images/`.
- ESLint/Prettier: o repo original tem ~1.500 erros de formatação do Prettier. Rodar `bunx prettier --write src` uma vez no começo e depois manter limpo.
- **Não há git na pasta**: rode `git init`, faça um commit inicial e trabalhe em commits pequenos por fase.
- Calculadora geral de dano: **não existe**. Será criada do zero (seção 5).

## 2. Estrutura e navegação

Rotas (arquivos em `src/routes/`):
- `/` Início (hub com acesso às ferramentas e atalhos)
- `/set-builder` Montador de sets (o atual, redesenhado, mesmo comportamento)
- `/crypt` Crypt Calculator
- `/hunts` Hunt Finder e `/hunts/$slug` detalhe da hunt
- `/monstros/$slug` ficha do monstro
- `/calculadora` Calculadora geral de dano (seção 5)
- Layout único em `__root.tsx`: header com logo, navegação principal, menu mobile, rodapé com atribuição da TibiaWiki (CC BY-SA) e aviso de que não é afiliado à CipSoft.
- Atualizar `<title>`, meta/OG, favicon.
- Refatorar `TibiaSetBuilder.tsx` (29 KB) em componentes menores sem mudar comportamento. Criar `src/lib/storage.ts` com os nomes dos buckets em constantes e mover as funções de URL (`spriteUrl`, `emptySlotUrl`, `imbuimentImageUrl`, `statIconUrl`) para lá, mantendo reexport em `tibia.ts` se facilitar.

## 3. Identidade visual

- Conceito: "posto avançado de aventureiros": pedra escura, metal envelhecido, runas, brilho de mana e ouro. Sem copiar arte oficial da CipSoft.
- Logo: criar em SVG (símbolo + logotipo "Tibia Station"; versões horizontal, ícone e favicon). Escolher a melhor das 3 propostas que você desenhar e documentar a escolha em `docs/MARCA.md`.
- Tokens no `src/styles.css` (oklch): fundo pedra escura, superfície metal, primária ouro antigo, secundária azul mana. Cores de elemento fixas e reutilizadas em todo o app: Physical, Fire, Energy, Ice, Earth, Death, Holy.
- Tipografia: título com personalidade (serifada medieval legível, ex.: Cinzel) + sans para leitura + mono para números. Fontes autohospedadas ou do Google Fonts.
- Guia de marca curto em `docs/MARCA.md` (logo, cores, tipografia, componentes).

## 4. Dados

Os dados novos vêm da **API do MediaWiki da TibiaWiki**: `https://tibia.fandom.com/api.php`. As páginas normais do Fandom e o tibia.com bloqueiam robôs (Cloudflare): **não tente burlar**, use só a API (`action=query&prop=revisions&rvprop=content&rvslots=main` e `list=categorymembers`). Identifique-se com um User-Agent genérico do projeto, respeite limites e faça pausas entre requisições.

### 4.1 Criaturas
- Categoria `Category:Creatures` (~2.200 páginas). Do `Infobox Creature` extrair: `name`, `hp`, `exp`, `bestiaryclass`, `bestiarylevel` e `physicalDmgMod`, `earthDmgMod`, `fireDmgMod`, `energyDmgMod`, `iceDmgMod`, `holyDmgMod`, `deathDmgMod`, `hpDrainDmgMod`, `drownDmgMod`. Valores em % onde 100 = neutro (ex.: `fireDmgMod = 30%`). Sprite: nome da página (o GIF existe na wiki, mas não precisa ser baixado agora; use placeholder se faltar).
- Ignorar páginas que não são criaturas reais (listas, redirects) e tratar campos ausentes.

### 4.2 Hunts
- Categoria `Category:Hunting Places` (463 páginas). `Infobox Hunt`: `name`, `city`, `location`, `lvlknights`, `lvlpaladins`, `lvlmages`, `loot`, `exp`, etc. A lista de criaturas está no texto da página (links `[[Criatura]]`): extrair os links que batem com criaturas conhecidas, com contagem de aparições como peso inicial (editável).
- Priorizar hunts para nível 450+ (Crypt exige nível 450). Gerar relatório `data/relatorio-hunts.md` com hunts sem criaturas detectadas para curadoria manual.

### 4.3 Saída do importador
- Script `scripts/import-wiki.ts` (bun) gera JSON versionado em `data/`: `creatures.json`, `hunts.json`, `crypt-weapons.json` e `sources.json` (fonte, data da importação, licença CC BY-SA).
- O app carrega **esses JSON empacotados** como fonte principal (rápido e sem depender de rede). Há uma camada `src/lib/data/` com funções `getCreatures()`, `getHunts()`, `getCryptWeapons()` para que a origem possa virar Supabase depois sem mudar as telas.
- Além disso, gerar migrations em `supabase/migrations/` (somente tabelas novas, com RLS e leitura pública): `creatures`, `creature_resistances`, `hunts`, `hunt_creatures`, `crypt_weapons`, `crypt_weapon_perks`, `data_sources`. Também um `supabase/seed.sql`. **Não aplique no banco**: o acesso ao projeto Supabase remoto não está disponível neste fluxo; André aplica depois. As migrations não podem tocar em storage nem em tabelas existentes.

## 5. Crypt Calculator e motor de cálculo

### 5.1 Armas (dados da TibiaWiki, nível 450, 3 slots de imbuement)

| Arma | Vocação | Tipo | Atk | Def | Atributos | Elemento do pierce |
|---|---|---|---|---|---|---|
| Crypt Breaker | Knight | Club | 58 | 33 | club fighting +4 | Fire |
| Crypt Slicer | Knight | Sword | 58 | 33 | sword fighting +4 | Earth |
| Crypt Splitter | Knight | Axe | 58 | 33 | axe fighting +4 | Energy |
| Crypt Strike | Monk | Fist | 45 | 20 | fist fighting +4, magic level +1 | só Physical |

### 5.2 Weapon Proficiency (só um perk por nível)

Knights (X = elemento da arma):
- N1: +1 skill. N2: +100% ML dano extra auto-ataque | +5% life leech Berserk | +12% armor penetration.
- **N3: +10% X pierce | +2% mana leech Berserk | +6% Physical pierce.**
- N4: +10% dano em alvos >95% HP | +3% vs Undead | +2,5% em alvos <30% HP.
- **N5: +15% X pierce | +1 ataque | +16% armor penetration.**
- N6: +700% ML cura extra | +20% armor penetration.
- **N7: +20% X pierce | +8% Physical pierce.**

Monk (Crypt Strike): N1 +15% armor pen; N2 +20% ML dano extra | +5% life leech Flurry | +20% armor pen; **N3 +4% dano >95% HP | +2% mana leech | +8% Physical pierce**; N4 igual dos knights; N5 +1 ataque | +70% ML cura; N6 +10% crítico extra | +25% armor pen; **N7 +12% Physical pierce**. O Monk não tem pierce elemental.

Só os níveis 3, 5 e 7 alteram o pierce. O motor enumera **todas as combinações** desses níveis. Os 3 modos clássicos são atalhos: **Elemental 45%** = 10+15+20 elemental; **Híbrida 35% + 6%** = 6 físico (N3) + 15 + 20 elemental; **Physical 14%** = 6 (N3) + 8 (N7) físico.

### 5.3 Fórmulas (resistência no formato wiki: 100 = neutro, 80 = 20% de resistência, 110 = 10% de fraqueza)

Calculadora de referência (https://calculadoracrypt.netlify.app/), modo `reference`:
```
applyPiercing(r, p):
  se r < 100: falta = 100 - r; se p <= falta: r + p; senão 100 + (p - falta) * 0.5
  senão: r + p * 0.5
Elemental45 = 0.5*fisico + 0.5*applyPiercing(elem, 45)
Hibrida     = 0.5*applyPiercing(fisico, 6) + 0.5*applyPiercing(elem, 35)
Physical14  = applyPiercing(fisico, 14)
```
Hunt: média simples das criaturas (ou ponderada por peso/kills/h). Arma alternativa 100% elemental sem pierce: o valor é a sensibilidade do monstro àquele elemento. Vantagem relativa = (vencedora / perdedora - 1) × 100. 100% = dano neutro.

Regras **oficiais** do Elemental Pierce (TibiaWiki), modo `official` (o padrão do app):
1. Acima de 100% de sensibilidade, o aumento é pela metade (arredondar para cima).
2. Sensibilidade 0% nunca aumenta.
3. No máximo dobra a sensibilidade.
4. Não afeta Charms.
Exemplos oficiais (usar como testes): Holy 90 + 6 = 96; Holy 104 + 6 = 107; Holy 96 + 8 = 102; Physical 4 + 20 = 8; Ice 0 + 20 = 0.

Pontos em aberto:
- Os modos elementais assumem **50% físico / 50% elemento** (como a referência) e o modo físico 100% físico. Não há fonte pública que confirme: deixar a divisão como **parâmetro** (`elementalShare`, padrão 0.5) e mostrar no UI como "premissa".
- André ainda pode enviar uma calculadora com "3 resultados". Se enviar, comparar com o motor e ajustar; por ora os 3 resultados exibidos por arma são os 3 modos (Elemental 45%, Híbrida, Physical 14%), mais "melhor combinação" calculada.

Exemplo de verificação (Hellflayer: físico 100, earth 80, fire 30, energy 105): modo `official`: Breaker 80,0 / 81,5 / 107,0; Slicer 106,5 / 105,5 / 107,0; Splitter 114,0 / 113,0 / 107,0. Modo `reference`: Breaker 87,5 / 84,0 / 107,0; Slicer 106,25 / 105,25 / 107,0; Splitter 113,75 / 112,75 / 107,0.

### 5.4 Implementação
- Funções puras em `src/lib/crypt/` (`pierce.ts`, `engine.ts`, `types.ts`), sem dependência de UI, com testes (vitest) para: os exemplos oficiais, os valores acima, bordas (resist 0, 100, >100, limite do dobro), médias de hunt (simples e ponderada) e a enumeração de combinações.
- Saída por arma: os 3 modos, a melhor combinação, o veredito ("compensa / não compensa") e a diferença percentual para a segunda colocada.
- Interface: escolha vocação (EK/Monk), categoria (Club/Sword/Axe; Fist para Monk), nível; escolha monstro **ou** hunt; ranking animado; destaque por monstro de onde cada arma ganha/perde; indicador quando official ≠ reference; aviso de que o cálculo é teórico (ignora armadura e mitigação).

### 5.5 Calculadora geral de dano (`/calculadora`)
Escopo enxuto e honesto, construído do zero a partir da pesquisa: o usuário escolhe vocação, nível, skill, arma (das tabelas `weapons_*` existentes: ataque físico e por elemento) e monstro; o app mostra dano médio estimado por golpe considerando resistências por elemento, e compara 2 a 3 armas lado a lado. Documentar na tela as premissas e as fórmulas (inclusive as limitações) e pesquisar as fórmulas de dano melee/distance/magic do Tibia na TibiaWiki antes de implementar (fonte citada em `docs/CALCULADORA.md`). Se alguma fórmula não tiver fonte confiável, não inventar: marcar como "estimativa" e explicar.

## 6. Diretrizes de front-end (Leonardo)

- Trabalhar a partir dos tokens do `styles.css`; nunca cor ou fonte solta no componente.
- shadcn/Radix só como base de acessibilidade, **sempre restilizado**. Componentes próprios: `ItemSlot`, `ElementBadge`, `ResistanceBar`, `WeaponCard`, `ResultCard`, `CreaturePicker`, `HuntPicker`.
- UX: fluxo da Crypt em poucos passos visíveis na mesma tela, resultado ao vivo; busca com autocomplete e teclado (Ctrl+K global); estados vazio, carregando (skeleton) e erro desenhados; mobile primeiro (360 px).
- Animações (Motion/Framer Motion ou CSS): transições de página, entrada de cartões, reordenação do ranking, barras de resistência que preenchem, contagem animada de porcentagens, hover com brilho nos slots. Respeitar `prefers-reduced-motion`.
- Evitar visual genérico: nada de gradiente roxo/azul aleatório, cartões arredondados idênticos, emoji como ícone, "glassmorphism" gratuito. Usar sprites do jogo (buckets), texturas e molduras próprias da marca.
- Acessibilidade: contraste AA, foco visível, rótulos.

## 7. Fases

1. **Base:** `git init`, Prettier, `lib/storage.ts`, rotas e layout vazios, tokens do tema, logo/favicon.
2. **Dados:** importador, JSON, camada `lib/data`, migrations/seed SQL, relatório de hunts.
3. **Motor Crypt:** `lib/crypt` + testes verdes.
4. **Telas:** Início, Crypt Calculator, Hunt Finder, detalhe de hunt e monstro.
5. **Calculadora geral** + **redesign do Set Builder**.
6. **Polimento:** animações, responsividade, acessibilidade, desempenho.
7. **Validação final** (seção 8).

## 8. Gates de validação (todos precisam passar)

1. `bunx tsc --noEmit` sem erros.
2. `bun run lint` sem erros (após Prettier).
3. `bun run test` (vitest) 100% verde; cobertura do motor Crypt nos casos da seção 5.3.
4. `bun run build` passa; `node .output/server/index.mjs` sobe e responde 200 em todas as rotas.
5. Playwright (já instalado no ambiente do usuário, ou instalar como dev dependency): testes e2e do fluxo Crypt (escolher vocação, monstro, ver ranking), Hunt Finder, Set Builder (gerar set de EK nível 450 e ver os slots com sprites). Capturar screenshots em 1440, 768 e 390 px e **olhar** cada uma para conferir o visual.
6. Verificação dos buckets: script que confirma que as URLs de sprites de uma amostra (30 itens de `weapons_melee`, `armor`, `helmet`) respondem 200 e que o código não escreve em storage (`grep` por `.upload(`, `storage.from(...).remove`, etc. sem resultados).
7. `grep -ri lovable` (exceto `node_modules`, `bun.lock` zerada) sem resultados.
8. Lighthouse (mobile) ≥ 90 em desempenho, acessibilidade e boas práticas na rota `/crypt`.
9. Checagem manual dos números: ao menos 20 casos do motor Crypt conferidos contra a calculadora de referência no modo `reference` e contra os exemplos oficiais no modo `official`.

## 9. Entrega

Ao final: `README.md` atualizado (como rodar, variáveis, comandos de teste, como reimportar dados), `docs/MARCA.md`, `docs/CALCULADORA.md`, relatório `docs/VALIDACAO.md` com o resultado de cada gate (comando, saída resumida, data) e a lista de pendências conhecidas (ex.: hunts sem criaturas detectadas, divisão 50/50 não confirmada, migrations ainda não aplicadas no Supabase).
