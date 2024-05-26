import { rmSync } from "node:fs";
import { resolve } from "path";
import { defineConfig } from "vite";

// import nodePolyfills from "vite-plugin-node-stdlib-browser";

export default defineConfig({
  build: {
    minify: false,
    outDir: resolve("./dist/scripts"),
    emptyOutDir: true,
    lib: {
      entry: {
        background: resolve("./src/scripts/background/index.ts"),
        client: resolve("./src/scripts/client/index.ts"),
      },
      formats: ["es"],
      // fileName: "background",
    },
  },
  resolve: {
    alias: [{ find: "@", replacement: resolve("./src/") }],
  },
  // plugins: [nodePolyfills()],
});
