import vue from "@vitejs/plugin-vue";
import { resolve } from "path";
import { defineConfig } from "vite";

// https://vitejs.dev/config/
export default defineConfig({
  root: resolve("./src/popup"),
  publicDir: resolve("./src/popup/public"),
  base: "./",
  build: {
    emptyOutDir: true,
    outDir: resolve("./dist/popup"),
    rollupOptions: {},
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
