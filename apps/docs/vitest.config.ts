import { defineConfig } from "vitest/config"
import path from "node:path"

export default defineConfig({
  test: {
    include: [
      "tests/prompts/**/*.test.ts",
      "tests/lib/**/*.test.ts",
      "app/api/**/__tests__/**/*.test.ts",
      "registry/dash/scaffolds/__tests__/**/*.test.ts",
    ],
    exclude: ["tests/visual/**", "node_modules/**", ".next/**"],
    environment: "node",
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname),
    },
  },
})
