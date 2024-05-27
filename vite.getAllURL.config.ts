import { rmSync } from "node:fs";
import { resolve } from "path";
import { defineConfig } from "vite";

// import nodePolyfills from "vite-plugin-node-stdlib-browser";

export default defineConfig({
  build: {
    minify: false,
    outDir: resolve("./dist/"),
    emptyOutDir: false,
    rollupOptions: {
      output: {
        entryFileNames: `[name].js`,
      },
    },
    lib: {
      entry: {
        getAllURL: resolve("./src/getAllURL.ts"),
      },
      name: "getAllURL",
      formats: ["iife"],
      // fileName: "background",
    },
  },
  resolve: {
    alias: [{ find: "@", replacement: resolve("./src/") }],
  },
  // plugins: [nodePolyfills()],
});
