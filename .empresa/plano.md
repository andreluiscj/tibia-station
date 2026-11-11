# Plano vigente: Tibia Station

1. O plano vigente é `docs/PLANO.md` (aprovado por André Luis Caldeira em 2026-11-11). Em conflito, ele vence qualquer documento de `.empresa/`.
2. Arquitetura e contratos das Fases 2 a 4: `.empresa/arquitetura.md` (nomes e assinaturas valem literalmente para Igor e Leonardo).
3. Inegociável: buckets do Supabase (`Itens Sprites`, `Empty Set`, `Imbuiments`, `Stats`) e tabelas existentes ficam intocados; nunca escrever em `storage.buckets`/`storage.objects`.
4. Inegociável: nunca imprimir, commitar ou enviar o `.env`; sem Lovable (`@lovable.dev/*`, texto "lovable", CDN).
5. Só André faz commit/push; "pronto" só com os gates da seção 8 do plano rodados de verdade.
