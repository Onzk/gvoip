import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { "@": path.resolve(__dirname, "./src") },
  },
  server: {
    host: true,
    port: 8080,
    proxy: {
      "/api": {
        target: "http://192.168.1.157:8081",
        changeOrigin: true,
      },
    },
  },
});
