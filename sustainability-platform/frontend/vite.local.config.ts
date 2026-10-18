import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  root: "local",
  base: "./",
  publicDir: "../public",
  plugins: [react()],
  server: {
    host: "127.0.0.1",
    proxy: {
      "/analyze": "http://127.0.0.1:8000",
      "/health": "http://127.0.0.1:8000",
    },
  },
  build: {
    outDir: "../local-dist",
    emptyOutDir: true,
  },
});
