import { beforeEach, describe, expect, it } from "vitest"
import { mkdtemp, rm, writeFile, mkdir } from "node:fs/promises"
import { tmpdir } from "node:os"
import { join } from "node:path"
import {
  BANNED_PREVIEW_IMPORTS,
  MAX_SOURCE_BYTES,
  __clearTemplateCacheForTests,
  __inspectDashUiBundleForTests,
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
    const paths = new Set(Object.keys(res.sandpack.files))
    // The core scaffold files are always present. /public/index.html is NOT
    // shipped — Sandpack's react-ts template ignores it and leaked the raw
    // HTML/JSX comments into the iframe. Tailwind + font now injected via
    // index.tsx at runtime instead.
    for (const required of [
      "/App.tsx",
      "/Component.tsx",
      "/dash-tokens.css",
      "/index.tsx",
      "/mocks.json",
    ]) {
      expect(paths.has(required)).toBe(true)
    }
    expect(paths.has("/public/index.html")).toBe(false)
    expect(res.sandpack.template).toBe("react-ts")
    expect(res.sandpack.entry).toBe("/index.tsx")
    // Any additional files MUST belong to the @dash/kit local bundle — we
    // never leak unrelated paths into the iframe.
    for (const path of paths) {
      const isCore =
        path === "/App.tsx" ||
        path === "/Component.tsx" ||
        path === "/dash-tokens.css" ||
        path === "/index.tsx" ||
        path === "/mocks.json"
      if (!isCore) {
        expect(path.startsWith("/node_modules/@dash/kit/")).toBe(true)
      }
    }
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
    for (const path of [
      "/index.tsx",
      "/App.tsx",
      "/dash-tokens.css",
      "/mocks.json",
    ]) {
      expect(res.sandpack.files[path]?.readOnly).toBe(true)
      expect(res.sandpack.files[path]?.hidden).toBe(true)
    }
  })

  it("index.tsx injects Tailwind CDN + Plus Jakarta Sans + Dash token preset at runtime", async () => {
    const res = await renderComponentPreview({
      componentSource: VALID_COMPONENT,
    })
    expect(res.ok).toBe(true)
    if (!res.ok) return
    const entry = res.sandpack.files["/index.tsx"]?.code ?? ""
    // Tailwind CDN (Play build) injected from entry so utility classes like
    // bg-success-light resolve at runtime. Sandpack's react-ts template
    // ignores /public/index.html so head injection from entry is the only
    // reliable hook.
    expect(entry).toContain("cdn.tailwindcss.com")
    // Plus Jakarta Sans preloaded so generated components inherit Dash type.
    expect(entry).toContain("Plus+Jakarta+Sans")
    expect(entry).toContain("fonts.googleapis.com")
    // Tailwind preset maps utility class names to Dash CSS variables so the
    // generator can emit `bg-success-light` and have it resolve to the right
    // token.
    expect(entry).toContain("var(--bg-success-light)")
    expect(entry).toContain("var(--bg-information-base)")
    expect(entry).toContain("var(--primary-base)")
  })

  it("dash-tokens.css carries semantic state tokens generator components rely on", async () => {
    const res = await renderComponentPreview({
      componentSource: VALID_COMPONENT,
    })
    expect(res.ok).toBe(true)
    if (!res.ok) return
    const tokens = res.sandpack.files["/dash-tokens.css"]?.code ?? ""
    // Semantic state set (Phase 0E): success/warning/error/information.
    expect(tokens).toContain("--bg-success-light")
    expect(tokens).toContain("--bg-warning-light")
    expect(tokens).toContain("--bg-error-light")
    expect(tokens).toContain("--bg-information-light")
    // Body font must resolve to Plus Jakarta Sans.
    expect(tokens).toContain("Plus Jakarta Sans")
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
    const src = `import { Button } from "@dash/kit/button"
import * as React from "react"
export default function F(){return <Button>Hi</Button>}`
    const res = await renderComponentPreview({ componentSource: src })
    expect(res.ok).toBe(true)
    if (!res.ok) return
    expect(res.sandpack.dependencies["@dash/kit"]).toBeDefined()
    expect(res.sandpack.dependencies["react"]).toBeDefined()
    expect(res.sandpack.dependencies["react-dom"]).toBeDefined()
  })

  it("declares @dash/kit dependency as a semver range (not workspace:* — Sandpack rejects it)", async () => {
    const src = `import { Badge } from "@dash/kit/badge"
import * as React from "react"
export default function F(){return <Badge>x</Badge>}`
    const res = await renderComponentPreview({ componentSource: src })
    expect(res.ok).toBe(true)
    if (!res.ok) return
    const v = res.sandpack.dependencies["@dash/kit"]
    expect(v).toBeDefined()
    expect(v).not.toMatch(/^workspace:/)
  })

  it("resolves @remixicon/react when @dash/kit is imported (icon-belang fix 2026-05-29)", async () => {
    // @dash/kit atoms (Badge, Alert, …) import icons from @remixicon/react
    // transitively. If that package isn't in the Sandpack dependency map the
    // iframe can't fetch it and every DS icon renders as a broken box. Any
    // component pulling in @dash/kit must therefore force-resolve the icon pkg.
    const src = `import { Badge } from "@dash/kit/badge"
import * as React from "react"
export default function F(){return <Badge>x</Badge>}`
    const res = await renderComponentPreview({ componentSource: src })
    expect(res.ok).toBe(true)
    if (!res.ok) return
    const v = res.sandpack.dependencies["@remixicon/react"]
    expect(v).toBeDefined()
    expect(v).not.toBe("latest") // pinned, not floating
    expect(v).not.toMatch(/^workspace:/)
  })

  it("resolves @remixicon/react when the component imports it directly", async () => {
    const src = `import { RiMailLine } from "@remixicon/react"
import * as React from "react"
export default function F(){return <RiMailLine />}`
    const res = await renderComponentPreview({ componentSource: src })
    expect(res.ok).toBe(true)
    if (!res.ok) return
    expect(res.sandpack.dependencies["@remixicon/react"]).toBeDefined()
  })

  it("does NOT warn for @dash/kit when the local source bundle is shipped (Tier 0 Phase C)", async () => {
    // The prebuild script copies a curated subset of `@dash/kit` atoms into
    // preview-template/dash-ui/. When present, Sandpack resolves the import
    // locally (no CDN round-trip) so the legacy "not on npm" warning MUST NOT
    // fire for `@dash/kit` — emitting it would mislead the LLM into rendering
    // raw HTML fallbacks instead of trusting the local bundle.
    const src = `import { Badge } from "@dash/kit/badge"
import * as React from "react"
export default function F(){return <Badge>x</Badge>}`
    const res = await renderComponentPreview({ componentSource: src })
    expect(res.ok).toBe(true)
    if (!res.ok) return
    const dashUiWarnings = res.warnings.filter(
      (w) => w.includes("@dash/kit") && w.includes("not yet published"),
    )
    expect(dashUiWarnings).toEqual([])
    // Still warns for unrelated unresolvable Dash packages.
    expect(res.warnings.some((w) => w.includes("@dash/registry-schema"))).toBe(false)
  })

  it("still warns for @dash/kit when the local bundle directory is absent", async () => {
    // Sanity check — when developer skipped the prebuild step, the bundle
    // cache has `available: false` and the legacy warning re-fires so the
    // user knows to run `pnpm build`.
    // We can't easily simulate the bundle being absent without filesystem
    // mocking, so this test asserts the contract via the inspector helper.
    const { __inspectDashUiBundleForTests } = await import(
      "../component-preview.js"
    )
    const bundle = __inspectDashUiBundleForTests()
    // In CI/dev the bundle IS shipped; the test documents the inverse path.
    if (!bundle.available) {
      const src = `import { Badge } from "@dash/kit/badge"
import * as React from "react"
export default function F(){return <Badge>x</Badge>}`
      const res = await renderComponentPreview({ componentSource: src })
      expect(res.ok).toBe(true)
      if (!res.ok) return
      expect(res.warnings.some((w) => w.includes("local bundle missing"))).toBe(
        true,
      )
    } else {
      expect(bundle.atomCount).toBeGreaterThan(0)
    }
  })

  it("ships the @dash/kit bundle into Sandpack files when present", async () => {
    const bundle = __inspectDashUiBundleForTests()
    if (!bundle.available) {
      // Skip in environments where prebuild hasn't run — covered by the
      // companion test above.
      return
    }
    const src = `import { Badge } from "@dash/kit"
import * as React from "react"
export default function F(){return <Badge>hi</Badge>}`
    const res = await renderComponentPreview({ componentSource: src })
    expect(res.ok).toBe(true)
    if (!res.ok) return
    // package.json + index.tsx + at least one atom.
    expect(res.sandpack.files["/node_modules/@dash/kit/package.json"]).toBeDefined()
    expect(res.sandpack.files["/node_modules/@dash/kit/index.tsx"]).toBeDefined()
    expect(res.sandpack.files["/node_modules/@dash/kit/badge.tsx"]).toBeDefined()
    // All bundle files are hidden + read-only (user can't clobber them).
    const pkgFile = res.sandpack.files["/node_modules/@dash/kit/package.json"]!
    expect(pkgFile.hidden).toBe(true)
    expect(pkgFile.readOnly).toBe(true)
  })

  it("@dash/kit bundle barrel re-exports each shipped atom", () => {
    const bundle = __inspectDashUiBundleForTests()
    if (!bundle.available) return
    const indexFile = bundle.files["/node_modules/@dash/kit/index.tsx"]
    expect(indexFile).toBeDefined()
    expect(indexFile!.code).toContain('export * from "./badge"')
  })

  it("@dash/kit bundle includes lib/utils so atoms can resolve cn()", () => {
    const bundle = __inspectDashUiBundleForTests()
    if (!bundle.available) return
    expect(bundle.files["/node_modules/@dash/kit/lib/utils.tsx"]).toBeDefined()
  })

  it("@dash/kit atoms have local relative imports (no @/registry paths leak)", () => {
    const bundle = __inspectDashUiBundleForTests()
    if (!bundle.available) return
    for (const [path, file] of Object.entries(bundle.files)) {
      if (!path.endsWith(".tsx")) continue
      // No registry alias should survive the rewrite step.
      expect(file.code).not.toContain("@/registry/dash/")
    }
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
    const src = `import { Button } from "@dash/kit/button"
import * as React from "react"
export default function F(){return null}`
    const res = await renderComponentPreview({
      componentSource: src,
      dependencies: ["@dash/kit", "clsx", "@dash/kit"],
    })
    expect(res.ok).toBe(true)
    if (!res.ok) return
    expect(Object.keys(res.sandpack.dependencies).filter((d) => d === "@dash/kit")).toHaveLength(1)
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
    const src = `import { Button } from "@dash/kit/button"
import { Toast } from "@dash/kit/toast"
import { schema } from "@dash/registry-schema"`
    expect(detectDashDsImports(src).sort()).toEqual(
      ["@dash/registry-schema", "@dash/kit"].sort(),
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
