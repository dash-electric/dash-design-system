import { defineConfig } from "tsup";

export default defineConfig({
  entry: {
    index: "src/index.ts",
    types: "src/types.ts",
    schemas: "src/schemas.ts",
    validators: "src/validators.ts",
    redact: "src/redact.ts",
    replay: "src/replay.ts",
    wire: "src/wire.ts",
  },
  format: ["esm", "cjs"],
  dts: true,
  splitting: false,
  treeshake: true,
  sourcemap: true,
  clean: true,
  minify: false,
  target: "es2022",
  outDir: "dist",
});
