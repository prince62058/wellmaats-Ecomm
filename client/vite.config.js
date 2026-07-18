import path from "path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const apiProxy = {
  "/api": {
    target: "http://localhost:5001",
    changeOrigin: true,
    secure: false,
  },
};

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    allowedHosts: true,
    proxy: apiProxy,
  },
  preview: {
    host: true,
    port: 5173,
    strictPort: true,
    allowedHosts: true,
    proxy: apiProxy,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
