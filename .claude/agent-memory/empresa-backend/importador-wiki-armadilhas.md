---
name: importador-wiki-armadilhas
description: Armadilhas do importador da TibiaWiki e do ambiente do Igor (Bash sem Edit/Write, backslash)
metadata:
  type: project
---

- Neste ambiente só há Bash para escrever arquivos: um `\` no comando vira `\` no arquivo. Em regex use heredoc com barra simples; para `new RegExp` use `String.raw`. Para trocar linhas, `sed -i 'Nr arquivo'`.
- Wiki marca valor não confirmado com `?` (ex.: `100%?`, `101%>?`, `35000<!-- estimation -->`): parsePercent/parseInteger aceitam e devolvem o número. `hp = ?` vira null (489 criaturas).
- Resistências podem ser negativas (criatura absorve): o motor Crypt precisa tratar r < 0.
- Perks por nível das armas Crypt NÃO existem na wiki (só no PLANO.md); elemento do pierce vem das categorias da página ("Fire Pierce Perk").
- Cache em .cache/wiki (ignorado pelo git); `bun scripts/import-wiki.ts` reimporta sem rede se o cache existir.
- Docker local estava desligado: migrations SQL não foram validadas em Postgres real.
- Comandos Bash grandes (> ~7 KB, ou com heredoc enorme) falham com "unexpected EOF"; divida em blocos de ~5 KB com `cat >>`.
- Colisão de slug (nomes repetidos na wiki) resolve com slugify(wikiTitle), ver uniqueBySlug em scripts/lib/parse-pages.ts. Contrato completo em .empresa/arquitetura.md (seção 12 lista divergências).
