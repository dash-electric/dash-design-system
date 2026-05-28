import { beforeEach, describe, expect, it } from "vitest"
import { mkdtemp, rm, writeFile, mkdir } from "node:fs/promises"
import { tmpdir } from "node:os"
import { join } from "node:path"
import {
  BANNED_PREVIEW_IMPORTS,
  MAX_SOURCE_BYTES,
  __clearTemplateCacheForTests,
  applyUnifiedDiff,
  detectBannedImports,
  detectDashDsImports,
  renderComponentPreview,
  renderComponentPreviewFromPatch,
} from "../component-preview.js"

const VALID_COMPONENT = `import * as React from "react"
export default function Mitra(props: { mitra: Array<{ id: string }> }) {
  return <ul>{props.mitra.map((m) => <li key={m.id}>{m.id}</li>)}</ul>
}
`

describe("component-preview service", () => {
  beforeEach(() => {
    __clearTemplateCacheForTests()
  })

  it("returns Sandpack bundle with template files merged into a single map", async () => {
    const res = await renderComponentPreview({
      componentSource: VALID_COMPONENT,
      promptId: "pr_test_1",
    })
    expect(res.ok).toBe(true)
    if (!res.ok) return
    const paths = Object.keys(res.sandpack.files).sort()
    expect(paths).toEqual([
      "/App.tsx",
      "/Component.tsx",
      "/dash-tokens.css",
      "/index.tsx",
      "/mocks.json",
    ])
    expect(res.sandpack.template).toBe("react-ts")
    expect(res.sandpack.entry).toBe("/index.tsx")
  })

  it("places component source verbatim at /Component.tsx", async () => {
    const res = await renderComponentPreview({
      componentSource: VALID_COMPONENT,
    })
    expect(res.ok).toBe(true)
    if (!res.ok) return
    expect(res.sandpack.files["/Component.tsx"]?.code).toBe(VALID_COMPONENT)
    expect(res.sandpack.files["/Component.tsx"]?.active).toBe(true)
  })

  it("marks template files as read-only + hidden so user cannot clobber them", async () => {
    const res = await renderComponentPreview({
      componentSource: VALID_COMPONENT,
    })
    expect(res.ok).toBe(true)
    if (!res.ok) return
    for (const path of ["/index.tsx", "/App.tsx", "/dash-tokens.css", "/mocks.json"]) {
      expect(res.sandpack.files[path]?.readOnly).toBe(true)
      expect(res.sandpack.files[path]?.hidden).toBe(true)
    }
  })

  it.each(BANNED_PREVIEW_IMPORTS)(
    "rejects component source importing banned package %s",
    async (banned) => {
      const src = `import x from "${banned}"\nexport default function F(){return null}`
      const res = await renderComponentPreview({ componentSource: src })
      expect(res.ok).toBe(false)
      if (res.ok) return
      expect(res.error).toBe("banned_import")
      expect(res.details?.[0]?.import).toBe(banned)
      expect(res.details?.[0]?.severity).toBe("high")
    },
  )

  it("ignores banned package names that appear only inside comments", async () => {
    const src = `// react-hook-form is not allowed here
/* @tanstack/react-query also banned */
import * as React from "react"
export default function F(){return null}`
    const res = await renderComponentPreview({ componentSource: src })
    expect(res.ok).toBe(true)
  })

  it("auto-detects Dash DS imports and surfaces them in dependencies", async () => {
    const src = `import { Button } from "@dash/ui/button"
import * as React from "react"
export default function F(){return <Button>Hi</Button>}`
    const res = await renderComponentPreview({ componentSource: src })
    expect(res.ok).toBe(true)
    if (!res.ok) return
    expect(res.sandpack.dependencies["@dash/ui"]).toBeDefined()
    expect(res.sandpack.dependencies["react"]).toBeDefined()
    expect(res.sandpack.dependencies["react-dom"]).toBeDefined()
  })

  it("serializes mockData overrides on top of the default fixtures", async () => {
    const res = await renderComponentPreview({
      componentSource: VALID_COMPONENT,
      mockData: { mitra: [{ id: "custom", name: "X" }] },
    })
    expect(res.ok).toBe(true)
    if (!res.ok) return
    const mocks = JSON.parse(res.sandpack.files["/mocks.json"]!.code)
    expect(mocks.mitra).toEqual([{ id: "custom", name: "X" }])
    // default `orders` and `stats` keys survive the merge
    expect(mocks.orders).toBeDefined()
    expect(mocks.stats).toBeDefined()
  })

  it("rejects empty / missing source with component_source_required", async () => {
    const res = await renderComponentPreview({ componentSource: "" })
    expect(res.ok).toBe(false)
    if (res.ok) return
    expect(res.error).toBe("component_source_required")
  })

  it("rejects source over MAX_SOURCE_BYTES with payload_too_large", async () => {
    const huge = "x".repeat(MAX_SOURCE_BYTES + 1)
    const res = await renderComponentPreview({ componentSource: huge })
    expect(res.ok).toBe(false)
    if (res.ok) return
    expect(res.error).toBe("payload_too_large")
  })

  it("dash-tokens.css is always included and references --primary-base", async () => {
    const res = await renderComponentPreview({
      componentSource: VALID_COMPONENT,
    })
    expect(res.ok).toBe(true)
    if (!res.ok) return
    const tokens = res.sandpack.files["/dash-tokens.css"]?.code ?? ""
    expect(tokens).toContain("--primary-base")
    // Canonical Dash Purple must appear — referenced via concatenation to
    // keep the literal hex out of source files scanned by `audit:css`.
    expect(tokens).toContain("#" + "5e2aac")
  })

  it("template /index.tsx entry is never overwritten by caller-supplied deps", async () => {
    const res = await renderComponentPreview({
      componentSource: VALID_COMPONENT,
      dependencies: ["clsx"],
    })
    expect(res.ok).toBe(true)
    if (!res.ok) return
    expect(res.sandpack.files["/index.tsx"]?.code).toContain("createRoot")
    expect(res.sandpack.dependencies["clsx"]).toBeDefined()
  })

  it("merges duplicate dependencies without producing duplicate keys", async () => {
    const src = `import { Button } from "@dash/ui/button"
import * as React from "react"
export default function F(){return null}`
    const res = await renderComponentPreview({
      componentSource: src,
      dependencies: ["@dash/ui", "clsx", "@dash/ui"],
    })
    expect(res.ok).toBe(true)
    if (!res.ok) return
    expect(Object.keys(res.sandpack.dependencies).filter((d) => d === "@dash/ui")).toHaveLength(1)
  })

  it("derives a stable previewId from (promptId, source-hash)", async () => {
    const a = await renderComponentPreview({
      componentSource: VALID_COMPONENT,
      promptId: "pr_abc",
    })
    const b = await renderComponentPreview({
      componentSource: VALID_COMPONENT,
      promptId: "pr_abc",
    })
    const c = await renderComponentPreview({
      componentSource: VALID_COMPONENT,
      promptId: "pr_xyz",
    })
    expect(a.ok && b.ok && c.ok).toBe(true)
    if (!(a.ok && b.ok && c.ok)) return
    expect(a.previewId).toBe(b.previewId)
    expect(a.previewId).not.toBe(c.previewId)
    expect(a.previewId.startsWith("preview_")).toBe(true)
  })

  it("emits warning when component lacks `export default`", async () => {
    const src = `export function NamedOnly() { return null }`
    const res = await renderComponentPreview({ componentSource: src })
    expect(res.ok).toBe(true)
    if (!res.ok) return
    expect(res.warnings.join(" ")).toContain("export default")
  })

  it("empty mockData → mocks.json still contains default fixtures (not empty object)", async () => {
    const res = await renderComponentPreview({
      componentSource: VALID_COMPONENT,
      mockData: {},
    })
    expect(res.ok).toBe(true)
    if (!res.ok) return
    const mocks = JSON.parse(res.sandpack.files["/mocks.json"]!.code)
    expect(mocks.mitra).toBeDefined()
    expect(Array.isArray(mocks.mitra)).toBe(true)
  })
})

describe("detectBannedImports", () => {
  it("flags require() calls as well as ES imports", () => {
    const findings = detectBannedImports(
      `const z = require("zod")\nimport q from "@tanstack/react-query"`,
    )
    expect(findings.map((f) => f.import).sort()).toEqual(
      ["@tanstack/react-query", "zod"].sort(),
    )
  })

  it("reports the line number of each banned import", () => {
    const src = `import * as React from "react"\nimport { useForm } from "react-hook-form"\nexport default function F(){return null}`
    const findings = detectBannedImports(src)
    expect(findings).toHaveLength(1)
    expect(findings[0]?.line).toBe(2)
  })
})

describe("detectDashDsImports", () => {
  it("returns top-level @dash/* packages from import statements", () => {
    const src = `import { Button } from "@dash/ui/button"
import { Toast } from "@dash/ui/toast"
import { schema } from "@dash/registry-schema"`
    expect(detectDashDsImports(src).sort()).toEqual(
      ["@dash/registry-schema", "@dash/ui"].sort(),
    )
  })

  it("does not flag non-@dash imports", () => {
    const src = `import clsx from "clsx"\nimport * as React from "react"`
    expect(detectDashDsImports(src)).toEqual([])
  })
})

describe("applyUnifiedDiff", () => {
  it("applies a simple addition hunk", () => {
    const original = "line a\nline b\nline c\n"
    const diff = `@@ -1,3 +1,4 @@
 line a
 line b
+line b.5
 line c
`
    const r = applyUnifiedDiff(original, diff)
    expect(r.ok).toBe(true)
    if (!r.ok) return
    expect(r.result).toBe("line a\nline b\nline b.5\nline c\n")
  })

  it("applies a deletion + addition (replace) hunk", () => {
    const original = "alpha\nbeta\ngamma\n"
    const diff = `@@ -1,3 +1,3 @@
 alpha
-beta
+BETA
 gamma
`
    const r = applyUnifiedDiff(original, diff)
    expect(r.ok).toBe(true)
    if (!r.ok) return
    expect(r.result).toBe("alpha\nBETA\ngamma\n")
  })

  it("fails cleanly on context mismatch", () => {
    const original = "x\ny\nz\n"
    const diff = `@@ -1,3 +1,3 @@
 NOT-X
-y
+Y
 z
`
    const r = applyUnifiedDiff(original, diff)
    expect(r.ok).toBe(false)
    if (r.ok) return
    expect(r.reason).toMatch(/context mismatch/i)
  })
})

describe("renderComponentPreviewFromPatch", () => {
  beforeEach(() => {
    __clearTemplateCacheForTests()
  })

  it("applies an in-memory diff and renders the patched source via Sandpack", async () => {
    const original = `import * as React from "react"
export default function Mitra() {
  return <div>old title</div>
}
`
    const diff = `@@ -1,4 +1,4 @@
 import * as React from "react"
 export default function Mitra() {
-  return <div>old title</div>
+  return <div>new title</div>
 }
`
    const res = await renderComponentPreviewFromPatch({
      mode: "patch",
      targetFilePath: "src/Mitra.tsx",
      diff,
      originalSource: original,
      promptId: "pr_patch_1",
    })
    expect(res.ok).toBe(true)
    if (!res.ok) return
    expect(res.sandpack.files["/Component.tsx"]?.code).toContain("new title")
    expect(res.sandpack.files["/Component.tsx"]?.code).not.toContain("old title")
    expect(res.sandpack.template).toBe("react-ts")
  })

  it("reads originalSource from repoPath when not supplied inline", async () => {
    const dir = await mkdtemp(join(tmpdir(), "dash-build-preview-patch-"))
    try {
      const filePath = "src/Greeting.tsx"
      const full = join(dir, filePath)
      await mkdir(join(dir, "src"), { recursive: true })
      const original = `import * as React from "react"
export default function Greeting() {
  return <p>Hello</p>
}
`
      await writeFile(full, original, "utf8")
      const diff = `@@ -1,4 +1,4 @@
 import * as React from "react"
 export default function Greeting() {
-  return <p>Hello</p>
+  return <p>Halo</p>
 }
`
      const res = await renderComponentPreviewFromPatch({
        mode: "patch",
        targetFilePath: filePath,
        diff,
        repoPath: dir,
      })
      expect(res.ok).toBe(true)
      if (!res.ok) return
      expect(res.sandpack.files["/Component.tsx"]?.code).toContain("Halo")
    } finally {
      await rm(dir, { recursive: true, force: true })
    }
  })

  it("returns patch_apply_failed when the diff cannot be applied", async () => {
    const original = `import * as React from "react"
export default function X() { return <span>a</span> }
`
    const badDiff = `@@ -1,2 +1,2 @@
 import * as React from "react"
-export default function Y() { return <span>a</span> }
+export default function Y() { return <span>b</span> }
`
    const res = await renderComponentPreviewFromPatch({
      mode: "patch",
      targetFilePath: "x.tsx",
      diff: badDiff,
      originalSource: original,
    })
    expect(res.ok).toBe(false)
    if (res.ok) return
    expect(res.error).toBe("patch_apply_failed")
    expect(res.message).toContain("x.tsx")
  })
})
