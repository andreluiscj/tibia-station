// Núcleo testável do gate 6 (buckets): consulta as URLs de sprite e resume o resultado. Sem rede própria:
// quem chama injeta `head`. Nada aqui imprime URL completa (só bucket/arquivo).

export interface SpriteItem {
  table: string;
  name: string;
}

export interface SpriteCheck extends SpriteItem {
  /** bucket/arquivo, sem host. */
  path: string;
  /** Status HTTP, ou null se a requisição falhou. */
  status: number | null;
  error?: string;
}

export function spritePath(url: string): string {
  const m = /\/object\/public\/(.+)$/.exec(url);
  if (!m) return "(url fora do padrão)";
  try {
    return decodeURIComponent(m[1]);
  } catch {
    return m[1];
  }
}

/** Consulta todos os itens com no máximo `concurrency` requisições ao mesmo tempo, mantendo a ordem. */
export async function checkSprites(
  items: readonly SpriteItem[],
  urlFor: (name: string) => string,
  head: (url: string) => Promise<number>,
  concurrency = 5,
): Promise<SpriteCheck[]> {
  const out: SpriteCheck[] = new Array(items.length);
  let next = 0;
  const worker = async () => {
    for (let i = next++; i < items.length; i = next++) {
      const url = urlFor(items[i].name);
      const base = { ...items[i], path: spritePath(url) };
      try {
        out[i] = { ...base, status: await head(url) };
      } catch {
        out[i] = { ...base, status: null, error: "falha de rede" }; // a mensagem original pode conter a URL
      }
    }
  };
  await Promise.all(
    Array.from({ length: Math.max(1, Math.min(concurrency, items.length)) }, worker),
  );
  return out;
}

export function summarize(checks: readonly SpriteCheck[]) {
  const failed = checks.filter((c) => c.status !== 200);
  return { total: checks.length, ok: checks.length - failed.length, failed };
}
