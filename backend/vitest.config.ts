import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    setupFiles: ["./src/tests/vitest.setup.ts"],
    coverage: {
      reporter: ["text", "json", "html"],
    },
  },
});
