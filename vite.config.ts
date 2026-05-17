import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import tailwindcss from "@tailwindcss/vite";
import viteReact from "@vitejs/plugin-react";
import { nitro } from "nitro/vite";
import { defineConfig } from "vite";
import tsConfigPaths from "vite-tsconfig-paths";

const nitroConfig = process.env.VERCEL ? { preset: "vercel" as const } : {};

export default defineConfig({
  plugins: [tanstackStart(), nitro(nitroConfig), viteReact(), tailwindcss(), tsConfigPaths()],
});
