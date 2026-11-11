// Varredura estática do repositório (gates 6b e 7 do plano): nenhuma escrita em Storage e nenhuma menção à
// marca proibida. Nunca devolve o texto da linha (só arquivo, linha e regra), para não vazar segredos do .env.
import { readdir, readFile, stat } from "node:fs/promises";
import { join, relative, sep } from "node:path";

export interface Finding {
  file: string;
  line: number;
  rule: string;
}

export interface ScanResult {
  storage: Finding[];
  brand: Finding[];
  filesScanned: number;
}

const STORAGE_RULES: { rule: string; re: RegExp }[] = [
  { rule: "upload", re: /\.upload\(/g },
  {
    rule: "storage-chain",
    re: /storage\s*\.\s*from\s*\([^)]*\)\s*\.\s*(?:upload|remove|update|move|copy)\s*\(/g,
  },
  {
    rule: "bucket-admin",
    re: /storage\s*\.\s*(?:createBucket|deleteBucket|emptyBucket|updateBucket)\b/g,
  },
  { rule: "storage-schema", re: /\bstorage\s*\.\s*(?:objects|buckets)\b/g },
];

const lineOf = (text: string, index: number) => text.slice(0, index).split("\n").length;

/** Linhas (1-based) com escrita em Storage. */
export function scanStorageWrites(text: string): number[] {
  return findStorage(text).map((f) => f.line);
}

function findStorage(text: string): { rule: string; line: number }[] {
  const out: { rule: string; line: number }[] = [];
  for (const { rule, re } of STORAGE_RULES) {
    for (const m of text.matchAll(re)) out.push({ rule, line: lineOf(text, m.index ?? 0) });
  }
  return out.sort((a, b) => a.line - b.line);
}

/** Linhas (1-based) que mencionam a marca proibida (sem diferenciar maiúsculas). */
export function scanLovable(text: string): number[] {
  return text.split("\n").flatMap((l, i) => (/lovable/i.test(l) ? [i + 1] : []));
}

const EXCLUDED_DIRS = new Set([
  "node_modules",
  ".git",
  ".output",
  ".cache",
  ".vinxi",
  ".nitro",
  ".tanstack",
  "dist",
  "dist-ssr",
  ".serena",
  "graphify-out",
  ".claude",
  "coverage",
  "playwright-report",
  "test-results",
]);
// Regras que citam a palavra proibida de propósito, o lockfile e o próprio scanner.
const EXCLUDED_FILES = new Set([
  "bun.lock",
  "docs/PLANO.md",
  ".empresa/plano.md",
  "scripts/lib/repo-scan.ts",
  "scripts/lib/repo-scan.test.ts",
]);
const STORAGE_ROOTS = ["src/", "scripts/", "supabase/"];
const MAX_BYTES = 5 * 1024 * 1024;

async function* walk(dir: string): AsyncGenerator<string> {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      if (!EXCLUDED_DIRS.has(entry.name)) yield* walk(join(dir, entry.name));
    } else if (entry.isFile()) {
      yield join(dir, entry.name);
    }
  }
}

export async function scanRepo(root: string): Promise<ScanResult> {
  const result: ScanResult = { storage: [], brand: [], filesScanned: 0 };
  for await (const path of walk(root)) {
    const rel = relative(root, path).split(sep).join("/");
    if (EXCLUDED_FILES.has(rel)) continue;
    if ((await stat(path)).size > MAX_BYTES) continue;
    const buf = await readFile(path);
    if (buf.subarray(0, 8000).includes(0)) continue; // binário
    const text = buf.toString("utf8");
    result.filesScanned++;
    for (const line of scanLovable(text)) result.brand.push({ file: rel, line, rule: "lovable" });
    if (STORAGE_ROOTS.some((r) => rel.startsWith(r))) {
      for (const f of findStorage(text)) result.storage.push({ file: rel, ...f });
    }
  }
  return result;
}
