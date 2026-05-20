import { defineConfig } from "tsup"

export default defineConfig([
  {
    entry: { bin: "src/bin.ts" },
    format: ["esm"],
    target: "node20",
    clean: true,
    splitting: false,
    sourcemap: false,
    dts: false,
    shims: false,
    banner: {
      js: "#!/usr/bin/env node",
    },
  },
  {
    entry: { index: "src/index.ts" },
    format: ["esm"],
    target: "node20",
    clean: false,
    splitting: false,
    sourcemap: false,
    dts: false,
    shims: false,
  },
  {
    entry: { daemon: "src/daemon/server.ts" },
    format: ["esm"],
    target: "node20",
    clean: false,
    splitting: false,
    sourcemap: false,
    dts: false,
    shims: false,
    banner: {
      js: "#!/usr/bin/env node",
    },
  },
])
