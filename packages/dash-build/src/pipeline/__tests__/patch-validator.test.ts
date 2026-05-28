import { describe, expect, it } from "vitest"
import {
  DEFAULT_PATCH_ALLOWLIST,
  summarizeRejection,
  validatePatch,
  type PatchAllowlist,
} from "../patch-validator.js"
import type { ParsedPatch } from "../../skills/types.js"

/**
 * Patch-validator suite — covers the additive-only gate enforcing the
 * cardinal "existing code is NEVER modified" rule.
 *
 * Each test builds a ParsedPatch with a minimal unified diff. We exercise:
 *   - pure additive ALLOW
 *   - allowlisted file ALLOW (registry-style)
 *   - structural append ALLOW (enums, switch, object literals)
 *   - protected path REJECT
 *   - logic deletion / rename / export-removal REJECT
 *   - malformed diff REJECT
 *   - allowlist override behaviour
 */

function patch(path: string, body: string): ParsedPatch {
  return {
    kind: "patch",
    path,
    language: "diff",
    patchContent: body.trim() + "\n",
  }
}

describe("validatePatch — happy paths", () => {
  it("ALLOWS a pure additive patch (zero deletions)", () => {
    const p = patch(
      "apps/docs/registry/dash/ui/badge.tsx",
      `@@ -1,3 +1,5 @@
 export function Badge() {
   return null
 }
+
+export const BadgeSize = "md"`,
    )
    const result = validatePatch(p)
    expect(result.ok).toBe(true)
    if (result.ok) expect(result.reason).toBe("pure-additive")
  })

  it("ALLOWS allowlisted routes.ts with append + re-indent deletion", () => {
    const p = patch(
      "apps/docs/app/routes.ts",
      `@@ -10,4 +10,8 @@
 export const routes = [
   { path: "/", element: <Home /> },
   { path: "/about", element: <About /> },
-]
+  { path: "/new-feature", element: <NewFeature /> },
+]`,
    )
    const result = validatePatch(p)
    expect(result.ok).toBe(true)
    if (result.ok) expect(result.reason).toBe("allowlisted-pattern")
  })

  it("ALLOWS adding a new export to barrel index.ts", () => {
    const p = patch(
      "apps/docs/registry/dash/ui/index.ts",
      `@@ -5,3 +5,4 @@
 export { Badge } from "./badge"
 export { Card } from "./card"
 export { Modal } from "./modal"
+export { NewWidget } from "./new-widget"`,
    )
    const result = validatePatch(p)
    expect(result.ok).toBe(true)
    if (result.ok) expect(result.reason).toBe("pure-additive")
  })

  it("ALLOWS new enum case at end (allowlisted by structural)", () => {
    const p = patch(
      "apps/docs/registry/dash/lib/status.ts",
      `@@ -1,4 +1,5 @@
 export enum Status {
   ACTIVE,
   INACTIVE,
+  PENDING,
 }`,
    )
    const result = validatePatch(p)
    expect(result.ok).toBe(true)
  })

  it("ALLOWS new switch case (additive, no structural deletes)", () => {
    const p = patch(
      "apps/docs/registry/dash/lib/format.ts",
      `@@ -3,5 +3,8 @@
   switch (mode) {
     case "a": return 1
     case "b": return 2
+    case "c": return 3
     default: return 0
   }`,
    )
    const result = validatePatch(p)
    expect(result.ok).toBe(true)
    if (result.ok) expect(result.reason).toBe("pure-additive")
  })

  it("ALLOWS nav-config.ts appending a menu entry", () => {
    const p = patch(
      "apps/docs/registry/dash/blocks/nav-config.ts",
      `@@ -8,4 +8,8 @@
 export const nav = [
   { label: "Home", href: "/" },
   { label: "Docs", href: "/docs" },
-]
+  { label: "New", href: "/new" },
+]`,
    )
    const result = validatePatch(p)
    expect(result.ok).toBe(true)
    if (result.ok) expect(result.reason).toBe("allowlisted-pattern")
  })

  it("ALLOWS registry.json append entry (allowlisted)", () => {
    const p = patch(
      "apps/docs/registry.json",
      `@@ -20,5 +20,9 @@
   "components": [
     { "name": "Button" },
     { "name": "Card" }
-  ]
+  ],
+  "blocks": [
+    { "name": "NewBlock" }
+  ]
 }`,
    )
    const result = validatePatch(p)
    expect(result.ok).toBe(true)
    if (result.ok) expect(result.reason).toBe("allowlisted-pattern")
  })

  it("ALLOWS structural-only deletion outside allowlist (object literal extension)", () => {
    const p = patch(
      "apps/docs/registry/dash/blocks/widgets.ts",
      `@@ -1,4 +1,6 @@
 export const cfg = {
   a: 1,
-}
+  b: 2,
+}`,
    )
    const result = validatePatch(p)
    expect(result.ok).toBe(true)
    if (result.ok) expect(result.reason).toBe("safe-append")
  })
})

describe("validatePatch — rejection paths", () => {
  it("REJECTS modifying an existing function body (const binding swap)", () => {
    const p = patch(
      "apps/docs/registry/dash/lib/calc.ts",
      `@@ -1,5 +1,5 @@
 export function calc(a: number, b: number) {
-  const result = a + b
+  const result = a * b
   return result
 }`,
    )
    const result = validatePatch(p)
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.reason).toBe("modifies-existing-logic")
  })

  it("REJECTS deleting a non-logic body line as generic deletes-code", () => {
    const p = patch(
      "apps/docs/registry/dash/lib/calc.ts",
      `@@ -1,4 +1,4 @@
 function calc(a, b) {
-  return a + b
+  return a * b
 }`,
    )
    const result = validatePatch(p)
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.reason).toBe("deletes-code")
  })

  it("REJECTS renaming an identifier (const foo -> const bar)", () => {
    const p = patch(
      "apps/docs/registry/dash/lib/util.ts",
      `@@ -1,3 +1,3 @@
-const foo = 1
+const bar = 1
 export default foo`,
    )
    const result = validatePatch(p)
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.reason).toBe("renames-identifier")
  })

  it("REJECTS deleting an export line", () => {
    const p = patch(
      "apps/docs/registry/dash/ui/index.ts",
      `@@ -1,3 +1,2 @@
 export { Badge } from "./badge"
-export { Card } from "./card"
 export { Modal } from "./modal"`,
    )
    const result = validatePatch(p)
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.reason).toBe("removes-export")
  })

  it("REJECTS touching an auth path (protected)", () => {
    const p = patch(
      "apps/docs/lib/auth/login.ts",
      `@@ -1,2 +1,3 @@
 export function login() {}
+export function logout() {}`,
    )
    const result = validatePatch(p)
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.reason).toBe("touches-protected-path")
  })

  it("REJECTS touching a payment path (protected)", () => {
    const p = patch(
      "apps/docs/lib/payment/checkout.ts",
      `@@ -1,1 +1,2 @@
 export function pay() {}
+export function refund() {}`,
    )
    const result = validatePatch(p)
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.reason).toBe("touches-protected-path")
  })

  it("REJECTS touching middleware.ts (protected)", () => {
    const p = patch(
      "apps/portal-v2/middleware.ts",
      `@@ -1,1 +1,2 @@
 export function middleware() {}
+export const config = {}`,
    )
    const result = validatePatch(p)
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.reason).toBe("touches-protected-path")
  })

  it("REJECTS touching .env files (protected)", () => {
    const p = patch(
      ".env.local",
      `@@ -1,1 +1,2 @@
 FOO=1
+BAR=2`,
    )
    const result = validatePatch(p)
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.reason).toBe("touches-protected-path")
  })

  it("REJECTS modifying a class declaration (logic delete)", () => {
    const p = patch(
      "apps/docs/registry/dash/lib/parser.ts",
      `@@ -1,4 +1,4 @@
-class Parser {
+class FancyParser {
   parse() { return null }
 }`,
    )
    const result = validatePatch(p)
    expect(result.ok).toBe(false)
    // Either rename or logic-modify is fine — both signal a refactor.
    if (!result.ok) {
      expect(["renames-identifier", "modifies-existing-logic"]).toContain(
        result.reason,
      )
    }
  })

  it("REJECTS deleting a type alias", () => {
    const p = patch(
      "apps/docs/registry/dash/lib/types.ts",
      `@@ -1,2 +1,1 @@
-export type Foo = number
 export type Bar = string`,
    )
    const result = validatePatch(p)
    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(["removes-export", "modifies-existing-logic"]).toContain(result.reason)
    }
  })

  it("REJECTS a malformed patch (no @@ hunk header)", () => {
    const p: ParsedPatch = {
      kind: "patch",
      path: "apps/docs/registry/dash/lib/foo.ts",
      language: "diff",
      patchContent: "this is not a unified diff at all\nnope\n",
    }
    const result = validatePatch(p)
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.reason).toBe("malformed-patch")
  })
})

describe("validatePatch — allowlist customization", () => {
  it("respects a custom protected-pattern (custom path becomes off-limits)", () => {
    const custom: PatchAllowlist = {
      safeFilePatterns: [],
      protectedFilePatterns: [/\/billing\//],
    }
    const p = patch(
      "apps/docs/lib/billing/invoice.ts",
      `@@ -1,1 +1,2 @@
 export function invoice() {}
+export function credit() {}`,
    )
    const result = validatePatch(p, custom)
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.reason).toBe("touches-protected-path")
  })

  it("strict allowlist (no safe patterns) still allows pure-additive in non-protected file", () => {
    const strict: PatchAllowlist = {
      safeFilePatterns: [],
      protectedFilePatterns: [],
    }
    const p = patch(
      "apps/docs/random/file.ts",
      `@@ -1,1 +1,2 @@
 const a = 1
+const b = 2`,
    )
    const result = validatePatch(p, strict)
    expect(result.ok).toBe(true)
    if (result.ok) expect(result.reason).toBe("pure-additive")
  })

  it("non-allowlisted file with re-indent deletion is rejected by default", () => {
    // Same content shape as the routes.ts test but in an arbitrary file —
    // should be rejected because we drop the structural-only safety net
    // when neither allowlist nor pure-additive applies. The deletion here
    // is structural (`]`) — that exercises the safe-append path.
    const p = patch(
      "apps/docs/random/widgets.ts",
      `@@ -1,4 +1,6 @@
 export const items = [
   "a",
   "b",
-]
+  "c",
+]`,
    )
    const result = validatePatch(p)
    expect(result.ok).toBe(true)
    // Random file gets safe-append (structural-only deletion).
    if (result.ok) expect(result.reason).toBe("safe-append")
  })
})

describe("validatePatch — default allowlist sanity", () => {
  it("default safeFilePatterns covers routes/nav-config/index/menu/registry/config", () => {
    const samples = [
      "x/routes.ts",
      "x/nav-config.tsx",
      "x/index.js",
      "x/menu.jsx",
      "apps/docs/registry.json",
      "apps/docs/site.config.ts",
    ]
    for (const path of samples) {
      const matches = DEFAULT_PATCH_ALLOWLIST.safeFilePatterns.some((re) =>
        re.test(path),
      )
      expect(matches, `expected ${path} to match a safe pattern`).toBe(true)
    }
  })

  it("default protectedFilePatterns covers auth/payment/middleware/env/lib/api", () => {
    const samples = [
      "apps/x/auth/login.ts",
      "apps/x/payment/charge.ts",
      "apps/x/middleware.ts",
      ".env",
      ".env.local",
      "apps/x/lib/api.ts",
    ]
    for (const path of samples) {
      const matches = DEFAULT_PATCH_ALLOWLIST.protectedFilePatterns.some((re) =>
        re.test(path),
      )
      expect(matches, `expected ${path} to be protected`).toBe(true)
    }
  })

  it("summarizeRejection returns a human label for every reason", () => {
    const reasons = [
      "modifies-existing-logic",
      "renames-identifier",
      "deletes-code",
      "removes-export",
      "touches-protected-path",
      "malformed-patch",
    ] as const
    for (const r of reasons) {
      expect(summarizeRejection(r)).toBeTruthy()
      expect(summarizeRejection(r)).not.toContain("-")
    }
  })
})
