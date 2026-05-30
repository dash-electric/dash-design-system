import { defineConfig } from "tsup"

// `noExternal: [/^@dash\//]` inlines workspace deps (e.g. registry-schema
// ships uncompiled src/*.ts). Same pattern as the dash-build daemon entry.
export default defineConfig({
  entry: { index: "src/index.ts" },
  format: ["esm"],
  target: "node20",
  clean: true,
  splitting: false,
  sourcemap: false,
  dts: false,
  shims: false,
  noExternal: [/^@dash\//],
  banner: { js: "#!/usr/bin/env node" },
})
