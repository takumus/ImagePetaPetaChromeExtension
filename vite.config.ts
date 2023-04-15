import { rmSync } from "node:fs";
import { resolve } from "path";
import { defineConfig } from "vite";

export default defineConfig(async ({ command }) => {
  return {
    build: {
      minify: false,
      outDir: resolve("./dist/js"),
      emptyOutDir: true,
      lib: {
        entry: resolve("./src/index.ts"),
        formats: ["es"],
        fileName: "background",
      },
    },
    resolve: {
      alias: [{ find: "@", replacement: resolve("./src/") }],
    },
    plugins: [],
  };
});
