# Validação final: Tibia Station

Data das execuções: 2026-11-11 (Windows, Git Bash, bun 1.4.2). Os gates 1 a 4, 6b, 7 e 8 foram repetidos no build final, depois da mudança de retry da hunt (Leonardo), do `.env.example` e do ajuste do `client.ts` (seção "Mudanças da rodada final"). Gates da seção 8 de `docs/PLANO.md`, rodados em ordem com comandos novos. Onde o gate depende de trabalho já feito pelo QA, o texto cita o relatório em vez de refazer.

## Resumo

| #   | Gate                                                                       | Resultado                                                                                |
| --- | -------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| 1   | `bunx tsc --noEmit`                                                        | passou (exit 0)                                                                          |
| 2   | `bun run lint`                                                             | passou (0 erros, 6 warnings antigos de fast refresh em `components/ui`)                  |
| 3   | `bun run test`                                                             | passou (377 testes em 27 arquivos)                                                       |
| 4   | build e servidor de produção: 200 em todas as rotas                        | passou (7 rotas com 200)                                                                 |
| 5   | Playwright e capturas                                                      | passou (22/22 no build final pelo QA e 22/22 meu, anterior); capturas conferidas pelo QA |
| 6   | buckets de Storage (`verify:buckets`) e código sem escrita (`verify:repo`) | passou (30 de 30 com 200; 0 escritas)                                                    |
| 7   | nenhuma menção à marca proibida                                            | passou (coberto por `verify:repo`)                                                       |
| 8   | Lighthouse mobile em `/crypt`                                              | passou (98 / 100 / 100 / 100)                                                            |
| 9   | conferência numérica do motor Crypt                                        | passou com limite (ver abaixo)                                                           |

## Detalhe por gate

### 1. Tipos

- Comando: `bunx tsc --noEmit`. Saída: sem erros. Exit 0.

### 2. Lint

- Comando: `bun run lint`. Saída: `6 problems (0 errors, 6 warnings)`. Exit 0. Os warnings são `react-refresh/only-export-components` nos componentes shadcn restilizados.

### 3. Testes

- Comando: `bun run test` (vitest). Saída: `Test Files 27 passed (27)`, `Tests 377 passed (377)`.
- Cobertura do motor Crypt nos casos da seção 5.3 do plano: `bunx vitest run src/lib/crypt` dá 76 testes em 3 arquivos (`pierce.test.ts`, `engine.test.ts`, `reference-cases.test.ts`). Cobrem os exemplos oficiais (Holy 90+6=96, Holy 104+6=107, Holy 96+8=102, Physical 4+20=8, Ice 0+20=0), o Hellflayer nos dois modos para as 4 armas, as bordas (0, 100, acima de 100, teto do dobro, resistência negativa, NaN e pierce negativo), a média de hunt simples e ponderada, as 12 combinações do Knight e as 2 do Monk, `elementalShare`, o veredito e o empate de exibição.

### 4. Build e servidor

- Comandos: `bun run build` (exit 0, `built in 2.08s`) e `PORT=4190 HOST=127.0.0.1 node .output/server/index.mjs`, com `curl` em cada rota.
- Resultado: `/` 200, `/set-builder` 200, `/crypt` 200, `/hunts` 200, `/hunts/asura-palace` 200, `/monstros/hellflayer` 200, `/calculadora` 200. O servidor foi derrubado no fim (a porta deixou de responder).

### 5. Playwright e capturas

- **22/22 no build final** (QA, 2026-11-11, build das 13:50:23, cópia do `.output` na porta 4183, 1,2 min, 0 falhas): o retry de `/hunts/claustrophobic-inferno` recuperou a hunt e a seção "Criaturas" com um clique, sem regressão em `/monstros/hellflayer`, `/hunts` e `/crypt`. Meu 22/22 anterior, rodado antes da mudança de retry em `/hunts/$slug`, segue registrado abaixo. Comando: `E2E_PORT=4191 bun run e2e`. Saída: `22 passed (1.5m)`, em `e2e/crypt.spec.ts` (fluxo EK + Hellflayer, modo referência, Monk, nível abaixo de 450, URL restaurada, 11 URLs inválidas incluindo `?cat=zzz` e payloads de XSS), `e2e/hunts.spec.ts` (lista, filtros, detalhe, monstro com resistência negativa, 404 em português, Ctrl+K) e `e2e/set-builder.spec.ts` (EK + Axe + nível 450 com sprites carregados).
- Capturas em 1440, 768 e 390 px: foram geradas e olhadas pelo QA (Luis Felipe); o relatório dele é a evidência e elas não foram refeitas nesta rodada.
- **Novas conclusões do QA no build final:** 14 URLs inválidas em `/crypt` e 14 cenários da `/calculadora` sem falha; "Tentar de novo" funciona nas 5 telas.
- **Observação (HTTP 500 em `/hunts/claustrophobic-inferno`):** visto uma vez e não reproduzido em 50 de 50 requisições no build de produção; causa provável: corrida entre build e servidor de desenvolvimento. Registrado como observação, sem correção.

### 6. Buckets e escrita em Storage

- Comando: `bun run verify:buckets` (somente leitura: `select` com a chave anon, 10 itens de `weapons_melee`, `armor` e `helmet`, e HEAD nas URLs públicas do bucket `Itens Sprites`). Saída: `Sprites com 200: 30 de 30`, `Buckets somente leitura no código: sim`, `OK`. Nada do `.env` foi impresso.
- Comando: `bun run verify:repo`. Saída: `215 arquivos verificados: 0 achados de escrita em Storage, 0 da marca proibida`, `OK`. Procura `.upload(`, `storage.from(...).(upload|remove|update|move|copy)`, administração de bucket e `storage.objects|buckets` em `src/`, `scripts/` e `supabase/`.

### 7. Marca proibida

- Coberto por `bun run verify:repo` (varre o repositório todo, exceto `node_modules`, `.git`, `.output`, `.cache`, `bun.lock`, `graphify-out/`, `.serena/`, `.claude/` e as regras citadas em `docs/PLANO.md` e `.empresa/plano.md`). Resultado: 0 achados.

### 8. Lighthouse

- Comando: `bun run lighthouse` (mobile, `/crypt`, build local em `127.0.0.1:4173`, nada enviado para fora). Saída: desempenho 98, acessibilidade 100, boas práticas 100, SEO 100 (informativo). Rotas `/` (98), `/hunts` (96) e `/calculadora` (98) também passaram, só como comparação. Notas de uma execução por rota, com variação de poucos pontos entre rodadas.

### 9. Números do motor Crypt

- Modo `reference`: o QA (Luis Felipe) conferiu 36 casos de Knight e 6 sintéticos contra o site de referência (https://calculadoracrypt.netlify.app/), com 0 divergências. O relatório dele é a evidência.
- Modo `official`: conferido contra os exemplos da página Elemental Pierce da TibiaWiki (testes em `src/lib/crypt/pierce.test.ts`).
- Limites: o Monk e o modo `official` não têm referência externa além da wiki. `src/lib/crypt/reference-cases.json` é um snapshot do próprio motor (só detecta defasagem), não um oráculo independente.

## Mudanças da rodada final (auditoria de segurança do Pedro, sem achado crítico, alto ou médio)

- **`.env.example`** criado na raiz com as 6 variáveis do README e placeholders (nada real; o `.env` não foi lido). `git check-ignore` confirma que ele é rastreável (a regra `!.env.example` do `.gitignore` já o libera) e que `.env` continua ignorado. O README manda copiar o arquivo.
- **`src/integrations/supabase/client.ts`:** `isNewSupabaseApiKey` agora reconhece só `sb_publishable_`, apenas para decidir o tratamento do cabeçalho Authorization; **não bloqueia** uma chave secreta (não lança erro, para não quebrar o SSR): a proteção real é nunca colocar chave secreta em variável `VITE_` ou no navegador (`.env.example` e README). `client.server.ts` e `auth-middleware.ts` ficaram como estavam. O teste `src/integrations/supabase/client.test.ts` é só um alarme estático barato (client.ts não menciona `sb_secret_`), não prova de comportamento.
- **Mudança do Leonardo** em `/hunts/$slug` (retry): coberta pelos gates 1 a 4 acima; a recheca no navegador é do QA.

## Pendências conhecidas

1. **Perks por nível das armas Crypt** vêm só de `docs/PLANO.md` 5.2: não constam na TibiaWiki (`data/sources.json` marca `unconfirmedFields: ["perks"]`).
2. **Divisão 50% físico / 50% elemento** (`elementalShare`) não tem fonte pública; é parâmetro editável mostrado como premissa.
3. **Monk** sem referência externa (a calculadora de referência não cobre a arma).
4. **Migrations não aplicadas** em nenhum banco (André aplica) e **SQL não validado em Postgres** (Docker desligado). O `supabase/seed.sql` usa `on conflict do update` e sobrescreve linhas com o mesmo slug.
5. **Vulnerabilidades de dependências (decisão do Líder: não atualizar agora; decide o André):** `zod` 3.25.76 (severidade alta) e `minimatch` (moderada). Proposta do Pedro: para o `zod`, remover a dependência direta se não houver uso ou subir para `^4.6.6` testando `@hookform/resolvers` e o TanStack Router; para o `minimatch`, `overrides` com `>=11.0.1`.
6. **Cabeçalhos de segurança (recomendação, não implementada):** CSP em modo Report-Only, `frame-ancestors 'none'`, `X-Content-Type-Options: nosniff` e `Referrer-Policy`.
7. **`og:image` relativo:** previews de redes sociais podem não carregar a imagem sem URL absoluta.
8. **404 de slug com HTTP 200:** os dados são lidos no cliente, então `/hunts/<slug inexistente>` e `/monstros/<slug inexistente>` mostram a tela 404 em português, mas o servidor responde 200.
9. **`.claude/` fora do `.gitignore`:** decisão do André; a varredura da marca proibida a ignora.
10. **Tabelas `weapons_*` (RESOLVIDA pelo QA):** o QA leu as respostas que o próprio app já faz: todas as tabelas têm menos de 90 linhas (`weapons_melee` 88, `armor` 52, `helmet` 45, `weapons_distance` 18...); nenhuma chega perto de 1000, então a falta de paginação em `fetchTable` não trunca dados hoje, e não há `item_name` duplicado em `weapons_melee` nem `weapons_distance`. O comando opcional `bun scripts/check-table-sizes.ts` (somente leitura, marca "paginar" a partir de 900 linhas) continua disponível para o André conferir depois que as tabelas crescerem.
11. **Hunts sem criaturas detectadas:** 3 de 444, listadas em `data/relatorio-hunts.md` para curadoria manual (nenhuma de nível 450+).
12. **Capturas de tela:** não refeitas aqui; a evidência é o relatório do QA.
13. **Calculadora geral:** o ataque elemental nativo é estimativa (flag `native_elemental_split`); varinhas, rods e `weapons_hand` ficaram fora do escopo (`docs/CALCULADORA.md`).
