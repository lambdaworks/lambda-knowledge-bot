import { defineConfig } from "vite";
import path from "path";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    commonjsOptions: {
      include: ["tailwind.config.js", "node_modules/**"],
    },
    rollupOptions: {
      input: {
        index: "./index.html",
        custom: "./widget.js",
      },
      output: {
        entryFileNames: ({ name }) => {
          if (name === "custom") {
            return "widget.js";
          }
          return "[name].js";
        },
      },
    },
  },
  optimizeDeps: {
    include: ["tailwind-config"],
  },
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
