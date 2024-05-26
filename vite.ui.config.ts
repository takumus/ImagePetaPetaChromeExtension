import { resolve } from "path";
import vue from "@vitejs/plugin-vue";
import { defineConfig } from "vite";

// https://vitejs.dev/config/
export default defineConfig({
  root: resolve("./src/scripts/content"),
  publicDir: resolve("./src/content/public"),
  base: "./",
  build: {
    emptyOutDir: true,
    outDir: resolve("./dist/content"),
    minify: false,
    rollupOptions: {
      output: {
        entryFileNames: `assets/[name].js`,
        chunkFileNames: `assets/[name].js`,
        assetFileNames: `assets/[name].[ext]`,
      },
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
