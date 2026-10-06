// @lovable.dev/vite-tanstack-config already provides the TanStack Start, React,
// Tailwind, path aliases, Nitro/Cloudflare and Lovable preview integration.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  tanstackStart: {
    // Use the project's SSR wrapper as the TanStack Start server entry.
    server: { entry: "server" },
  },
});
