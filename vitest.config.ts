import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";

// Config separada do vite.config.ts: os plugins do TanStack Start/Nitro não servem para testes unitários.
export default defineConfig({
  resolve: {
    alias: {
      "@data": fileURLToPath(new URL("./data", import.meta.url)),
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  test: { include: ["scripts/**/*.test.ts", "src/**/*.test.ts"], environment: "node" },
});
