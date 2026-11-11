# Calculadora geral de dano: fórmulas, fontes e limites

Pesquisa de 2026-11-11 na API do MediaWiki da TibiaWiki (somente `api.php`, uma requisição por vez, cache em `.cache/`). Código: `src/lib/damage/` (funções puras). Resultado: **dano médio por golpe**, antes de armadura, mitigação, crítico e charms. Contrato para a tela: `.empresa/arquitetura.md`, seção 13.

## 1. Fórmulas com fonte

Convenções: `L` = nível, `S` = skill da arma, `W` = ataque da arma, `B` = dano base. Todos os `floor`/`ceil` abaixo são os da wiki.

### 1.1 Dano base por nível (`baseDamage`)
- `step = floor((sqrt(2L + 2025) + 5) / 10)` e `B = floor((L + 1000) / step) + 50 * step - 450`.
- Equivale a +1 de dano base a cada 5 níveis até o 500, a cada 6 de 501 a 1100, e assim por diante.
- Fonte: https://tibia.fandom.com/wiki/Formulae#Base_Damage_and_Healing

### 1.2 Valor de ataque corpo a corpo (`meleeAttackValue`)
- Ofensiva: `B + floor(floor(6W/5) * (S + 4) / 28)`.
- Balanceada: `B + floor(W * (S + 4) / 28)`.
- Defensiva: `B + floor(ceil(3W/5) * (S + 4) / 28)` (a parte da arma usa `ceil`, não `floor`).
- A wiki descreve o valor como "o dano médio que você causaria em uma criatura sem defesa". **A fórmula de dano mínimo e máximo não é conhecida** (palavras da wiki), então a calculadora só dá a média.
- Fonte: https://tibia.fandom.com/wiki/Formulae#Attack_Value

### 1.3 Valor de ataque à distância (`distanceAttackValue`)
- `floor(d * atk * (S + 4) / 28) + (dano e cura base) + dano extra`, com `d = 1,2` e `atk` = ataque da munição + modificador de ataque da arma.
- A wiki cita o fator 1,2 como o estado da "2026 Vocation Adjustments Release". O dano extra (proficiência) entra arredondado para baixo: a calculadora aplica `floor` ao `extraDamage` informado.
- PvP divide por 2: fora do escopo (a calculadora é contra monstros).
- Fonte: https://tibia.fandom.com/wiki/Formulae#Distance

### 1.4 Imbuement de ataque elemental
- "Parte do dano físico é convertida" no elemento: Basic 10%, Intricate 25%, Powerful 50% (fogo, terra, gelo, energia e morte; **não existe para sagrado**).
- Em armas corpo a corpo, cada golpe divide o dano entre físico e elemental e depois aplicam-se as resistências de cada tipo. Em arco e besta o imbuement entra sobre o dano total calculado; não funciona com munição de área nem munição elemental nativa.
- Armas com ataque elemental nativo normalmente não aceitam imbuement elemental (a calculadora lança erro nesse caso).
- Fontes: https://tibia.fandom.com/wiki/Imbuing#Attack_Imbuements e as tabelas "Amount converted" da mesma página.

### 1.5 Resistências do alvo
- Formato da wiki usado nos dados: 100 = neutro, 80 = 20% de resistência, 110 = 10% de fraqueza, 0 = imune, **negativo = a criatura absorve (cura)**. Fonte dos números: infobox de cada criatura (`physicalDmgMod`, `fireDmgMod`...), importados em `data/creatures.json`.
- Dano de cada componente = `parte do ataque * resistência / 100`. Fonte do princípio (resistências e sensibilidades aplicadas ao dano de cada tipo): https://tibia.fandom.com/wiki/Imbuing#Attack_Imbuements e https://tibia.fandom.com/wiki/Formulae#Distance ("target's Damage Taken From Elements"). A fórmula multiplicativa em si é a leitura direta da definição, não uma fórmula publicada.

## 2. Pontos sem fonte direta (marcados como estimativa)

Como a tela avisa: os pontos 1, 3 e 5 geram flags em `DamageResult.estimates` (`native_elemental_split`, `melee_extra_damage`, `distance_imbuement`). Os pontos 2 e 4 são **avisos fixos da tela** (valem para todo cálculo), não flags.

| # | Ponto | O que a calculadora faz | Limitação |
|---|---|---|---|
| 1 | **Ataque elemental nativo** (colunas `*_attack` de `weapons_melee`, ex.: Grand Sanguine Battleaxe com ataque 8 e morte 50, https://tibia.fandom.com/wiki/Grand_Sanguine_Battleaxe) | **ESTIMATIVA.** A wiki diz que o golpe se divide em físico e elemental, mas não publica como o valor de ataque entra na fórmula. Usa `W` = soma dos ataques, calcula o valor de ataque 1.2 e reparte na proporção dos ataques de cada coluna. | A proporção real pode ser outra. A tela deve exibir o aviso (flag `native_elemental_split`). |
| 2 | **Multiplicação por resistência** | `dano * resistência / 100` por componente. | Leitura direta da definição de sensibilidade; sem página que publique a conta. Aviso fixo da tela. |
| 3 | **Dano extra (`extraDamage`) em melee** | Soma simples ao valor de ataque. A wiki só tem o termo de dano extra na fórmula de distância. | Não verificado para corpo a corpo. Padrão 0. Flag `melee_extra_damage` quando `extraDamage > 0` em corpo a corpo. |
| 4 | **Min e max** | Não calculados. | A wiki afirma que a fórmula é desconhecida. Aviso fixo da tela ("dano médio, sem mínimo e máximo"). |
| 5 | **Imbuement em distância** | Mesma conversão do melee, sobre o valor de ataque total. | A wiki só descreve em texto. Flag `distance_imbuement` quando uma arma de distância tem imbuement. |

## 3. Premissas e fora do escopo

- Ignora armadura e mitigação do alvo (a wiki publica a redução de armadura em https://tibia.fandom.com/wiki/Formulae#Armor, mas `Creature` não guarda armadura nem mitigação), bloqueio, crítico, onslaught, charms, Elemental Pierce, proficiência, Wheel of Destiny (só via `extraDamage`) e PvP.
- Distância: calcula o dano por **acerto**; a chance de acertar (https://tibia.fandom.com/wiki/Formulae#Chance_to_hit) fica fora, assim como o modificador `hit_percent` da arma.
- Varinhas e rods (`weapons_wand`, `weapons_rod`) não entram: o dano mágico depende de magic level e de faixas por arma, sem fórmula pesquisada aqui. `weapons_hand` também fica de fora.
- A postura só vale para corpo a corpo. Sem dados sobre `Charm`/`Elemental Bond`.
- Resistência `null` da wiki vira 100 e o elemento aparece em `assumedNeutral`. Resistência negativa é mantida e sinalizada com `absorbs`; o dano médio pode ficar negativo (a arma cura o monstro).
