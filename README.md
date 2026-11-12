# Tibia Station

Plataforma para jogadores de Tibia: montador de sets, calculadoras de dano e
recomendação de armas Crypt por hunt.

## Rodando localmente

```bash
bun install        # ou npm install
bun run dev        # http://localhost:3000
bun run build      # build de produção (saída em .output/)
bun run start      # sobe o build (node .output/server/index.mjs; porta com PORT, padrão 3000)
```

Copie `.env.example` para `.env` e preencha com o seu projeto Supabase (o `.env` não vai para o git; nunca o publique; só chave publicável `sb_publishable_`). Variáveis:

```
VITE_SUPABASE_URL=...
VITE_SUPABASE_PUBLISHABLE_KEY=...
VITE_SUPABASE_PROJECT_ID=...
SUPABASE_URL=...
SUPABASE_PUBLISHABLE_KEY=...
SUPABASE_PROJECT_ID=...
```

## Comandos

| Comando                  | O que faz                                                                                                                                                                                                                                                  |
| ------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `bun run dev`            | servidor de desenvolvimento em `http://localhost:3000`                                                                                                                                                                                                     |
| `bun run build`          | build de produção em `.output/`                                                                                                                                                                                                                            |
| `bun run start`          | sobe o build de produção                                                                                                                                                                                                                                   |
| `bun run test`           | testes unitários (vitest: motor Crypt, calculadora de dano, importador, camada de dados)                                                                                                                                                                   |
| `bun run fetch:sprites`  | baixa/retoma os sprites das criaturas da Tibia Wiki para `public/sprites/`; registra os ausentes em `_sem-sprite.txt` por grupo                                                                                                   |
| `bun run e2e`            | testes de ponta a ponta (Playwright, pasta `e2e/`); sobe o build em `127.0.0.1:4173` (`E2E_PORT` muda a porta), então rode `bun run build` antes                                                                                                           |
| `bunx tsc --noEmit`      | checagem de tipos                                                                                                                                                                                                                                          |
| `bun run lint`           | ESLint com Prettier                                                                                                                                                                                                                                        |
| `bun run verify:repo`    | gates 6b e 7: falha se houver escrita em Storage em `src/`, `scripts/` ou `supabase/`, ou a marca proibida (a busca ignora `node_modules`, `.git`, `.output`, `.cache`, `bun.lock` e as regras citadas em `docs/PLANO.md` e `.empresa/plano.md`)           |
| `bun run lighthouse`     | gate 8: Lighthouse mobile em `/crypt` do build local (porta `LH_PORT`, padrão 4173); imprime as 4 notas e falha se desempenho, acessibilidade ou boas práticas ficarem abaixo de 90. Precisa do Chrome instalado e de `bun run build`                      |
| `bun run import:wiki`    | reimporta criaturas, hunts e armas Crypt da TibiaWiki para `data/` e `supabase/seed.sql`                                                                                                                                                                   |

### Reimportar os dados da TibiaWiki

`bun run import:wiki` usa só a API do MediaWiki (`api.php`), uma requisição por vez, com pausa de 1 s, e
guarda cada resposta em `.cache/wiki/` (ignorada pelo git). Com o cache preenchido a reimportação roda
**offline** e é determinística; para buscar dados novos, apague `.cache/wiki/`. O importador para em
HTTP 402, 403 ou 429 (não tenta contornar bloqueio). Depois de importar, rode `bunx prettier --write data`.
Os dados são da TibiaWiki (CC BY-SA 3.0); o app não é afiliado à CipSoft.

## Stack

TanStack Start (React 19), Vite, Tailwind 4, componentes Radix/shadcn,
React Query e Supabase (banco).

## Supabase

- **Chaves.** Nunca coloque chave secreta ou service role em variáveis `VITE_` ou no navegador: só a chave publicável (`sb_publishable_`) pode chegar ao cliente.
- **Imagens.** Todas ficam no repositório, em `public/sprites/` (`items`, `empty-set`, `imbuiments`, `stats`, `creatures`,); as URLs são montadas em `src/lib/storage.ts`. Não há bucket do Supabase.
- **Migrations NÃO aplicadas.** `supabase/migrations/20261111000000_station_data.sql` cria 7 tabelas novas
  (`creatures`, `creature_resistances`, `hunts`, `hunt_creatures`, `crypt_weapons`, `crypt_weapon_perks`,
  `data_sources`) com RLS de leitura pública. Nenhum agente aplicou nada em banco algum: quem aplica é o
  André, com `supabase db push` ou colando o SQL no painel do projeto. Não toca nas tabelas
  existentes (`weapons_melee`, `armor` etc.). Rollback no cabeçalho do arquivo.
- **Seed.** `supabase/seed.sql` é gerado pelo importador e usa `insert ... on conflict do update`: pode ser
  rodado de novo, mas **sobrescreve** as linhas com o mesmo slug (inclusive pesos de hunt editados no banco).
  Rode só depois da migration e, de preferência, primeiro em um banco local ou de teste.

### Comandos opcionais para o André

```bash
bun scripts/check-table-sizes.ts
```

Somente leitura (`select` com a chave anon; não imprime o `.env`): conta as linhas das tabelas que o app lê e
lista nomes de arma duplicados em `weapons_melee` e `weapons_distance`. Marca **"paginar"** a partir de 900
linhas (o Supabase corta respostas em 1000 por padrão). Rode só quando quiser conferir o tamanho das tabelas.
