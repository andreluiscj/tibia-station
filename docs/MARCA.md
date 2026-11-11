# Tibia Station: guia de marca

Conceito: **posto avançado de aventureiros**. Pedra escura, metal envelhecido, ouro antigo e o brilho azul da mana. Nada de arte da CipSoft.

## Logo

Três propostas desenhadas em SVG e comparadas em fundo escuro, em 64, 32 e 16 px:

| Proposta             | Ideia                                                 | Leitura em tamanho pequeno                 | Por que ficou ou saiu                                                                                   |
| -------------------- | ----------------------------------------------------- | ------------------------------------------ | ------------------------------------------------------------------------------------------------------- |
| A. Marco rúnico      | Marco de pedra em arco, com um T talhado em azul mana | Boa: silhueta de arco e T continuam claros | **Escolhida.** Liga o símbolo ao nome (T de Tibia), lembra um portal de caminho e funciona como favicon |
| B. Lanterna do posto | Lanterna de ouro com chama de mana                    | Média: a chama some em 16 px               | Silhueta mais original, mas não tem o T. Fica como alternativa para ilustrações                         |
| C. Torre de vigia    | Torre com ameias e janela em T                        | Média                                      | Parece o ícone genérico de castelo. Descartada                                                          |

Arquivos em `public/brand/`:

- `logo-horizontal.svg`: símbolo + "TIBIA" (branco quente) e "STATION" (ouro). O texto está convertido em curvas (Cinzel 700 e 600), então não depende de fonte instalada. Usado no cabeçalho.
- `logo-icon.svg`: só o símbolo.
- `favicon.svg`, `favicon-32.png`, `apple-touch-icon.png` e `public/favicon.ico` (16, 32 e 48 px): versão simplificada, arco de ouro cheio com o T vazado, para ter contraste em 16 px.
- `og.png`: imagem de compartilhamento 1200x630. O `og:image` usa caminho relativo; troque por URL absoluta quando o domínio existir.

Uso: fundo escuro (`--background` ou `--stone`). Área livre mínima de metade da altura do arco em volta. Altura mínima de 32 px na horizontal. Não girar, não aplicar sombra, não trocar as cores.

## Cores

Todas em oklch, definidas em `src/styles.css`. Componentes usam os tokens (classes `bg-gold`, `text-muted-foreground`, `bg-el-fire`), nunca valor solto.

| Token                      | oklch                        | Uso                                                 |
| -------------------------- | ---------------------------- | --------------------------------------------------- |
| `--background`             | 0.155 0.012 65               | fundo de pedra escura                               |
| `--stone`                  | 0.2 0.014 65                 | cabeçalho, rodapé, menu                             |
| `--metal` / `--metal-high` | 0.27 / 0.36                  | superfícies de metal, botões secundários            |
| `--foreground`             | 0.93 0.018 85                | texto principal                                     |
| `--muted-foreground`       | 0.74 0.02 82                 | texto de apoio (contraste AA sobre o fundo)         |
| `--gold` / `--gold-dim`    | 0.79 0.125 82 / 0.55 0.09 78 | primária: títulos, ação principal, foco, divisórias |
| `--mana`                   | 0.7 0.13 235                 | secundária: destaques de interação e o T do logo    |
| `--good` / `--bad`         | verde / vermelho             | ganho e perda nos resultados                        |

Elementos (fixos no app inteiro): `--el-physical` cinza pedra, `--el-fire` laranja, `--el-energy` violeta, `--el-ice` azul gelo, `--el-earth` verde, `--el-death` roxo apagado, `--el-holy` amarelo claro. Sempre acompanhados do nome do elemento, nunca só a cor.

## Tipografia

Carregada do Google Fonts no `<head>` do `__root.tsx`.

- **Cinzel** (600, 700), `font-display`: títulos e navegação. Serifada de inspiração romana, legível; as minúsculas saem em versalete, então não use em parágrafos.
- **Source Sans 3** (400, 600, 700), `font-sans`: leitura e interface. Mínimo de 16 px no corpo.
- **JetBrains Mono** (500), `font-mono` / classe `.num`: números e percentuais, com algarismos tabulares.

## Componentes e padrões

- `.frame`: placa de metal com rebites de ouro nos cantos, para blocos principais. `.frame-link` soma realce de ouro ao passar o mouse e ao focar por teclado.
- `.frame-inset`: vão fundo, para dados e gráficos.
- `.rune-divider`, `.text-gold-glow`, `.stone-texture`, `.rise-in` (entrada dos cartões, um momento por página), `.res-fill` (barra que preenche), `.skeleton`.
- Marcador em losango (quadrado girado 45 graus) para status e legendas. Cantos retos (raio de 4 px), nada de cartões arredondados.
- Cartão clicável: o link fica no título e estica por `after:absolute after:inset-0`, assim há um único alvo de teclado por cartão.
- Estados de ferramenta em construção: componente `EmConstrucao` (`src/components/station/`).
- Acessibilidade: foco visível em ouro (2 px), alvos de 44 px ou mais, `prefers-reduced-motion` respeitado em `styles.css`, link "Ir para o conteúdo".
