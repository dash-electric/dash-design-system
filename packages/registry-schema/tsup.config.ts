import { defineConfig } from "tsup"

// Two entries because the `exports` map exposes both `.` and `./zod`.
// `dts: true` emits .d.ts files so TS consumers keep full type inference
// after the move from src → dist.
export default defineConfig({
  entry: {
    index: "src/index.ts",
    "zod-schemas": "src/zod-schemas.ts",
  },
  format: ["esm"],
  target: "node20",
  clean: true,
  splitting: false,
  sourcemap: false,
  dts: true,
  shims: false,
})
