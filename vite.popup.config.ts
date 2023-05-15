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
