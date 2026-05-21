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
    // Bundle workspace @dash/* deps — their `main` points at uncompiled
    // src/*.ts, so leaving them external causes the spawned daemon to crash
    // on `import "./activate.js"` (file is .ts, not .js).
    noExternal: [/^@dash\//],
    banner: {
      js: "#!/usr/bin/env node",
    },
  },
])
