// @lovable.dev/vite-tanstack-config provides the TanStack Start, React,
// Tailwind, path aliases, Nitro/Cloudflare and Lovable preview integration.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

// Lovable Preview uses its worker runtime; Vercel needs the Vercel Nitro preset.
// Keeping this explicit prevents the deployment target from being inferred from
// the local environment while preserving the Lovable sandbox behavior.
const isVercel = Boolean(process.env.VERCEL);

export default defineConfig({
  nitro: isVercel ? { preset: "vercel" } : true,
  tanstackStart: {
    server: { entry: "server" },
  },
});
