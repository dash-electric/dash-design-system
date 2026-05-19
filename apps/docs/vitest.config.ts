import { defineConfig } from "vitest/config"

export default defineConfig({
  test: {
    include: ["tests/prompts/**/*.test.ts", "tests/lib/**/*.test.ts"],
    exclude: ["tests/visual/**", "node_modules/**", ".next/**"],
    environment: "node",
  },
})
