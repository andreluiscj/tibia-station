# Lições (erros achados por QA, Segurança ou Revisão)

## 2026-11-11: exemplo de ranking do contrato calculado só com os presets
- **Causa:** o Joaquim escreveu a ordem esperada do `rankWeapons` (Splitter, Slicer, Breaker) lendo os presets elementais, sem calcular o `best` de todas as combinações; no Hellflayer/official, Breaker e Slicer têm best 107,0 (combinação só física) e o desempate é por slug. O Igor achou ao implementar o teste.
- **Regra:** todo valor de exemplo ou de teste no contrato é calculado pela própria regra do contrato (planilha ou script, com todas as combinações) antes de ser publicado.

## 2026-11-11: Fase 4, `?cat=zzz` derrubava /crypt
- **Causa:** o router do TanStack mescla o search validado com o search cru herdado, então um valor inválido omitido pelo `validateSearch` continuava chegando à tela. A revisão de código (Lucas) e a de segurança (Pedro), feitas por leitura, não pegaram; o QA no navegador pegou.
- **Regra:** toda validação de URL deve ser reaplicada no componente sobre o que o router entrega e ter teste de regressão com valores inválidos; entrada externa precisa de teste no navegador, não só leitura.
