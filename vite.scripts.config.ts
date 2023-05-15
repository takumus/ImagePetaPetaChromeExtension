import { rmSync } from "node:fs";
import { resolve } from "path";
import { defineConfig } from "vite";

// import nodePolyfills from "vite-plugin-node-stdlib-browser";

export default defineConfig(async ({ command }) => {
  return {
    build: {
      minify: false,
      outDir: resolve("./dist/scripts"),
      emptyOutDir: true,
      lib: {
        entry: [resolve("./src/background.ts"), resolve("./src/client.ts")],
        formats: ["es"],
        // fileName: "background",
      },
    },
    resolve: {
      alias: [{ find: "@", replacement: resolve("./src/") }],
    },
    // plugins: [nodePolyfills()],
  };
});
