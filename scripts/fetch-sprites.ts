// Baixa sprites de todas as criaturas para public/sprites/<grupo>/<slug>.gif.
// Usa apenas a API do MediaWiki (prop=imageinfo) e o CDN de imagens da wiki. É retomável: pula arquivos existentes.
// Uso: bun scripts/fetch-sprites.ts
import { existsSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { SPRITE_API, spriteCandidates, type SpriteGroup } from "./lib/sprite-download";

const UA = "TibiaStationImporter/0.1";
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

interface SpriteItem {
  slug: string;
  wikiTitle: string;
}

interface SpriteBatch {
  group: SpriteGroup;
  source: string;
}

const get = async (url: string) => {
  const response = await fetch(url, {
    headers: { "User-Agent": UA },
    signal: AbortSignal.timeout(30_000),
  });
  // Bloqueio: parar na hora, sem tentar contornar.
  if ([402, 403, 429].includes(response.status))
    throw new Error(`HTTP ${response.status}: pare e reporte`);
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return response;
};

async function downloadSprites({ group, source }: SpriteBatch) {
  const output = join(process.cwd(), "public", "sprites", group);
  const items = JSON.parse(
    await readFile(join(process.cwd(), "data", source), "utf8"),
  ) as SpriteItem[];
  await mkdir(output, { recursive: true });

  const pending = items.filter((item) => !existsSync(join(output, `${item.slug}.gif`)));
  const missing: string[] = [];
  let downloaded = 0;

  for (let i = 0; i < pending.length; i += 25) {
    const batch = pending.slice(i, i + 25);
    const titles = [...new Set(batch.flatMap((item) => spriteCandidates(item.wikiTitle)))].join(
      "|",
    );
    const response = await get(
      `${SPRITE_API}?action=query&prop=imageinfo&iiprop=url&redirects=1&format=json&formatversion=2&titles=${encodeURIComponent(titles)}`,
    );
    const query = ((await response.json()) as { query?: Record<string, unknown> }).query ?? {};
    const redirects = new Map<string, string>();
    for (const key of ["normalized", "redirects"])
      for (const redirect of (query[key] as { from: string; to: string }[] | undefined) ?? [])
        redirects.set(redirect.from, redirect.to);
    const resolvedTitle = (title: string) => {
      let result = title;
      for (let n = 0; n < 3 && redirects.has(result); n++) result = redirects.get(result)!;
      return result;
    };
    const urls = new Map(
      ((query.pages as { title: string; imageinfo?: { url: string }[] }[] | undefined) ?? []).map(
        (page) => [page.title, page.imageinfo?.[0]?.url],
      ),
    );

    for (const item of batch) {
      const sourceUrl = spriteCandidates(item.wikiTitle)
        .map((title) => urls.get(resolvedTitle(title)))
        .find(Boolean);
      if (!sourceUrl) {
        missing.push(item.slug);
        continue;
      }
      try {
        const image = await get(sourceUrl);
        await writeFile(join(output, `${item.slug}.gif`), Buffer.from(await image.arrayBuffer()));
        downloaded++;
      } catch (error) {
        if (error instanceof Error && error.message.startsWith("HTTP 4")) throw error;
        missing.push(item.slug);
      }
      await sleep(150);
    }
    console.log(
      `[${group}] ${Math.min(i + 25, pending.length)}/${pending.length} (baixados ${downloaded}, sem sprite ${missing.length})`,
    );
    await sleep(1000);
  }

  await writeFile(join(output, "_sem-sprite.txt"), missing.join("\n") + "\n");
  console.log(`[${group}] pronto: ${downloaded} baixados agora, ${missing.length} sem sprite.`);
}

await downloadSprites({ group: "creatures", source: "creatures.json" });
