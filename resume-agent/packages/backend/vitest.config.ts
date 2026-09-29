import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "@resume/retrieval": fileURLToPath(new URL("../retrieval/src/index.ts", import.meta.url)),
    },
  },
  test: {
    environment: "node",
    include: ["test/**/*.test.ts"],
    server: {
      deps: {
        external: [/@lancedb\/lancedb/, /apache-arrow/, /@earendil-works/],
      },
    },
  },
});
