/// <reference types="node" />
import { defineConfig } from "vite";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const host = process.env.TAURI_DEV_HOST;

// dirname en módulos ESM:
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig(async () => ({
  clearScreen: false,

  // importante para app://
  base: "./",

  server: {
    port: 1420,
    strictPort: true,
    host: host || false,
    hmr: host ? { protocol: "ws", host, port: 1421 } : undefined,
    watch: { ignored: ["/src-tauri/"] },
  },

  build: {
    rollupOptions: {
      input: {
        main:     resolve(__dirname, "index.html"),
        creanota: resolve(__dirname, "src/creanota.html"),
        vernota:  resolve(__dirname, "src/vernota.html"),
      },
    },
  },
}));