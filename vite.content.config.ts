import { extname, resolve } from "path";
import vue from "@vitejs/plugin-vue";
import { defineConfig } from "vite";

// https://vitejs.dev/config/
export default defineConfig({
  root: resolve("./src/content"),
  publicDir: resolve("./src/content/public"),
  base: "./",
  build: {
    emptyOutDir: !process.argv.includes("--dev"),
    outDir: resolve("./dist/content"),
    minify: false,
    rollupOptions: {
      output: {
        entryFileNames: `assets/[name].js`,
        chunkFileNames: `assets/[name].js`,
        assetFileNames: `assets/[name].[ext]`,
      },
      plugins: [
        {
          name: "wrap-in-iife",
          generateBundle(outputOptions, bundle) {
            Object.keys(bundle).forEach((fileName) => {
              const file = bundle[fileName];
              if (extname(fileName) === ".js" && "code" in file) {
                file.code = `// (;o;)\n(() => {\n${file.code}})();`;
              }
            });
          },
        },
      ],
    },
  },
  resolve: {
    alias: [{ find: "@", replacement: resolve("./src/") }],
  },
  plugins: [
    vue({
      template: {
        compilerOptions: {
          isCustomElement: (tag) => tag.startsWith("e-"),
        },
      },
    }),
  ],
});
