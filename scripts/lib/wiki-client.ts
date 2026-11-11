// Cliente mínimo da API do MediaWiki da TibiaWiki: cache em disco, 1 requisição por vez, pausa de 1 s.
// Só usa api.php. Em 402/403/429 para na hora (não tenta contornar bloqueio).
import { createHash } from "node:crypto";
import { existsSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

const API = "https://tibia.fandom.com/api.php";
const UA = "TibiaStationImporter/0.1";
const CACHE_DIR = join(process.cwd(), ".cache", "wiki");
const PAUSE_MS = 1000;
const TIMEOUT_MS = 30_000;

export class BlockedError extends Error {}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
export interface ApiResponse {
  continue?: Record<string, string>;
  error?: { code: string };
  query?: {
    categorymembers?: { title: string }[];
    pages?: {
      title: string;
      missing?: boolean;
      revisions?: { slots?: { main?: { content?: string } } }[];
      categories?: { title: string }[];
    }[];
  };
}

export const MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED_HOST = "tibia.fandom.com";

/** Redirect só dentro de https://tibia.fandom.com (a API não deve mandar o importador para outro host). */
export function sameHostRedirect(from: string, location: string | null): string {
  if (!location) throw new Error("Redirect sem Location");
  const to = new URL(location, from);
  if (to.protocol !== "https:" || to.host !== ALLOWED_HOST)
    throw new Error(`Redirect para host não permitido: ${to.host}`);
  return to.toString();
}

/** Lê o corpo como JSON com teto de tamanho (Content-Length e bytes realmente recebidos). */
export async function readJsonLimited(res: Response, max = MAX_BYTES): Promise<ApiResponse> {
  const declared = Number(res.headers.get("content-length"));
  if (Number.isFinite(declared) && declared > max) throw new Error("Resposta grande demais");
  const reader = res.body?.getReader();
  if (!reader) throw new Error("Resposta sem corpo");
  const chunks: Uint8Array[] = [];
  let size = 0;
  for (let r = await reader.read(); !r.done; r = await reader.read()) {
    size += r.value.byteLength;
    if (size > max) {
      await reader.cancel();
      throw new Error("Resposta grande demais");
    }
    chunks.push(r.value);
  }
  return JSON.parse(Buffer.concat(chunks).toString("utf8")) as ApiResponse;
}

async function fetchJson(first: string): Promise<ApiResponse> {
  let url = first;
  for (let hop = 0; hop < 4; hop++) {
    const res = await fetch(url, {
      headers: { "User-Agent": UA, Accept: "application/json" },
      redirect: "manual",
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    if ([402, 403, 429].includes(res.status))
      throw new BlockedError(`HTTP ${res.status} em ${API}: pare e reporte`);
    if (res.status >= 300 && res.status < 400) {
      url = sameHostRedirect(url, res.headers.get("location"));
      continue;
    }
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return readJsonLimited(res);
  }
  throw new Error("Redirects demais");
}

export async function apiGet(params: Record<string, string>): Promise<ApiResponse> {
  const qs = new URLSearchParams({ format: "json", formatversion: "2", ...params });
  qs.sort();
  const url = `${API}?${qs.toString()}`;
  const file = join(CACHE_DIR, `${createHash("sha1").update(url).digest("hex")}.json`);
  if (existsSync(file)) return JSON.parse(await readFile(file, "utf8")) as ApiResponse;

  let lastErr: unknown;
  for (let attempt = 0; attempt < 3; attempt++) {
    await sleep(PAUSE_MS * (attempt + 1));
    try {
      const json = await fetchJson(url);
      if (json.error) throw new Error(`API: ${json.error.code}`);
      await mkdir(CACHE_DIR, { recursive: true });
      await writeFile(file, JSON.stringify(json));
      return json;
    } catch (e) {
      if (e instanceof BlockedError) throw e;
      lastErr = e;
    }
  }
  throw new Error(`Falha após 3 tentativas: ${String(lastErr)}`);
}

/** Títulos (namespace 0) de uma categoria, seguindo a paginação. */
export async function categoryMembers(category: string): Promise<string[]> {
  const titles: string[] = [];
  let cont: Record<string, string> | undefined;
  do {
    const json = await apiGet({
      action: "query",
      list: "categorymembers",
      cmtitle: category,
      cmnamespace: "0",
      cmlimit: "500",
      ...cont,
    });
    for (const m of json.query?.categorymembers ?? []) titles.push(m.title);
    cont = json.continue;
  } while (cont);
  return titles;
}

export interface WikiPage {
  title: string;
  content: string;
}

/** Wikitext de várias páginas (lotes de 25; redirects resolvidos; páginas ausentes omitidas). */
export async function fetchPages(
  titles: string[],
  onBatch?: (done: number, total: number) => void,
): Promise<WikiPage[]> {
  const out = new Map<string, WikiPage>();
  for (let i = 0; i < titles.length; i += 25) {
    const batch = titles.slice(i, i + 25);
    const json = await apiGet({
      action: "query",
      prop: "revisions",
      rvprop: "content",
      rvslots: "main",
      redirects: "1",
      titles: batch.join("|"),
    });
    for (const p of json.query?.pages ?? []) {
      const content = p.revisions?.[0]?.slots?.main?.content;
      if (!p.missing && typeof content === "string") out.set(p.title, { title: p.title, content });
    }
    onBatch?.(Math.min(i + 25, titles.length), titles.length);
  }
  return [...out.values()];
}
