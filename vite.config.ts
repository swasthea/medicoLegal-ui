import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import federation from "@originjs/vite-plugin-federation";
import path from "path";

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    federation({
      name: "medicoLegalUI",
      filename: "remoteEntry.js",
      exposes: {
        "./routes": "./src/app/router/federatedRoutes.tsx",
        "./manifest": "./src/app/manifest.ts",
      },
      shared: {
        react: { requiredVersion: "^19.2.0" },
        "react-dom": { requiredVersion: "^19.2.0" },
        "react-router-dom": { requiredVersion: "^7.13.1" },
        zustand: { requiredVersion: "^5.0.11" },
        "@tanstack/react-query": { requiredVersion: "^5.90.21" },
      },
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 5176,
  },
  build: {
    target: "esnext",
    minify: false,
    cssCodeSplit: false,
  },
});
