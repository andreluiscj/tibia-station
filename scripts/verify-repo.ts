// Gates 6b e 7: nenhuma escrita em Storage em src/, scripts/ e supabase/, e nenhuma menção à marca proibida.
// Uso: bun scripts/verify-repo.ts  (sai com código 1 se houver achados). Só imprime arquivo:linha:regra.
import { scanRepo } from "./lib/repo-scan";

const r = await scanRepo(process.cwd());
for (const f of r.storage) console.log(`ESCRITA EM STORAGE  ${f.file}:${f.line} (${f.rule})`);
for (const f of r.brand) console.log(`MARCA PROIBIDA      ${f.file}:${f.line}`);
console.log(
  `${r.filesScanned} arquivos verificados: ${r.storage.length} achados de escrita em Storage, ${r.brand.length} da marca proibida.`,
);
if (r.storage.length + r.brand.length > 0) {
  console.log("FALHOU");
  process.exit(1);
}
console.log("OK");
