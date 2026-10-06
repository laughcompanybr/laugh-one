// @lovable.dev/vite-tanstack-config provides the TanStack Start, React,
// Tailwind, path aliases, Nitro/Cloudflare and Lovable preview integration.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  // Explicitly enable Nitro so the SSR Worker bundle is emitted during
  // non-sandbox builds as well as Lovable Preview deployments.
  nitro: true,
  tanstackStart: {
    // Use the project's SSR wrapper as the TanStack Start server entry.
    server: { entry: "server" },
  },
});
