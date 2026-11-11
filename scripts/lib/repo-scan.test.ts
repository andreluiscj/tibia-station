import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { scanLovable, scanRepo, scanStorageWrites } from "./repo-scan";

// Os padrões proibidos são montados por concatenação para este arquivo não ser achado pelo próprio scanner.
const UPLOAD = ".up" + "load(";
const LOVE = "lov" + "able";

describe("scanStorageWrites", () => {
  it("acha upload em qualquer receptor", () => {
    expect(scanStorageWrites(`await bucket${UPLOAD}"a", file);`)).toEqual([1]);
  });

  it.each(["upload", "remove", "update", "move", "copy"])(
    "acha storage.from(...).%s, inclusive em várias linhas",
    (op) => {
      const text = `const x = 1;\nawait supabase\n  .storage\n  .from("Itens Sprites")\n  .${op}(path);`;
      expect(scanStorageWrites(text).length).toBeGreaterThan(0);
    },
  );

  it("acha operações de bucket e referências de escrita ao schema de storage", () => {
    expect(scanStorageWrites("supabase.storage.deleteBucket('x')")).toEqual([1]);
    expect(scanStorageWrites("insert into storage.objects values (1)")).toEqual([1]);
  });

  it("não acusa uso legítimo: remove/update comuns, getPublicUrl, leitura de URL pública", () => {
    const ok = [
      "el.classList.remove('x');",
      "const r = Route.update({ id: 'a' });",
      "createHash('sha1').update(url).digest('hex');",
      "supabase.storage.from('Itens Sprites').getPublicUrl('a.gif');",
      "supabase.storage.from('Empty Set').download('a.png');",
      "const url = `${base}/storage/v1/object/public/bucket/a.gif`;",
    ];
    for (const line of ok) expect(scanStorageWrites(line), line).toEqual([]);
  });
});

describe("scanLovable", () => {
  it("é case-insensitive e devolve a linha", () => {
    expect(scanLovable(`ok\nimport x from "@${LOVE}.dev/y"\n`)).toEqual([2]);
    expect(scanLovable(`${LOVE.toUpperCase()}`)).toEqual([1]);
    expect(scanLovable("nada aqui")).toEqual([]);
  });
});

describe("scanRepo", () => {
  let root = "";
  beforeEach(async () => {
    root = await mkdtemp(join(tmpdir(), "scan-"));
    for (const d of [
      "src",
      "scripts",
      "node_modules/pkg",
      ".git",
      ".output",
      ".cache",
      "docs",
      ".empresa",
    ]) {
      await mkdir(join(root, d), { recursive: true });
    }
  });
  afterEach(() => rm(root, { recursive: true, force: true }));

  it("limpo: sem achados", async () => {
    await writeFile(join(root, "src/a.ts"), "export const a = 1;\n");
    const r = await scanRepo(root);
    expect(r.storage).toEqual([]);
    expect(r.brand).toEqual([]);
    expect(r.filesScanned).toBeGreaterThan(0);
  });

  it("acha escrita em src/ e scripts/ e a palavra proibida em qualquer lugar, sem devolver o texto da linha", async () => {
    await writeFile(join(root, "src/a.ts"), `bucket${UPLOAD}x);\n`);
    await writeFile(join(root, "scripts/b.ts"), `supabase.storage.from("x").remove(["a"]);\n`);
    await writeFile(join(root, "README.md"), `# ${LOVE}\n`);
    await writeFile(join(root, ".env"), `SEGREDO_${LOVE}=abc123\n`);
    const r = await scanRepo(root);
    expect(r.storage.map((f) => f.file).sort()).toEqual(["scripts/b.ts", "src/a.ts"]);
    expect(r.brand.map((f) => f.file).sort()).toEqual([".env", "README.md"]);
    expect(JSON.stringify(r)).not.toContain("abc123");
    expect(JSON.stringify(r)).not.toContain("SEGREDO");
  });

  it("ignora node_modules, .git, .output, .cache, bun.lock e as regras citadas no plano", async () => {
    const bad = `${LOVE} ${UPLOAD}\n`;
    for (const f of [
      "node_modules/pkg/i.js",
      ".git/x",
      ".output/y.js",
      ".cache/z.json",
      "bun.lock",
      "docs/PLANO.md",
      ".empresa/plano.md",
    ]) {
      await writeFile(join(root, f), bad);
    }
    const r = await scanRepo(root);
    expect(r.storage).toEqual([]);
    expect(r.brand).toEqual([]);
  });

  it("pula arquivos binários", async () => {
    await writeFile(
      join(root, "public.png"),
      Buffer.concat([Buffer.from([0, 1, 2]), Buffer.from(LOVE)]),
    );
    expect((await scanRepo(root)).brand).toEqual([]);
  });
});

describe("scanRepo: artefatos de ferramentas", () => {
  it("ignora graphify-out e .serena, mas continua achando o resto", async () => {
    const root = await mkdtemp(join(tmpdir(), "scan-tools-"));
    try {
      for (const d of ["graphify-out", ".serena", "src"])
        await mkdir(join(root, d), { recursive: true });
      await writeFile(join(root, "graphify-out/graph.json"), `${LOVE}\n`);
      await writeFile(join(root, ".serena/cache.md"), `${LOVE}\n`);
      await writeFile(join(root, "src/a.ts"), `// ${LOVE}\n`);
      const r = await scanRepo(root);
      expect(r.brand.map((f) => f.file)).toEqual(["src/a.ts"]);
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  });
});
