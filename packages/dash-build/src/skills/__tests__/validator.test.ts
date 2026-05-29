import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { afterEach, beforeEach, describe, expect, it } from "vitest"
import { validateOutput } from "../validator.js"
import { NAV_REGISTRY_REASON_MARKER } from "../path-resolver.js"
import type {
  DesignContext,
  ExistingFilesContext,
  ParsedPatch,
  ParsedResponse,
} from "../types.js"

const EMPTY_DESIGN: DesignContext = {
  designContract: "",
  cardinalRules: "",
  voiceRules: "",
  manifest: null,
  layeredArchitecture: "",
  loadedSources: ["x"],
  missingSources: [],
}

function parsed(files: Array<{ path: string; language?: string; content: string }>): ParsedResponse {
  return {
    files: files.map((f) => ({ language: f.language ?? "tsx", ...f })),
    explanation: "",
  }
}

describe("validateOutput", () => {
  it("passes for clean Dash code", () => {
    const r = validateOutput(
      parsed([
        {
          path: "src/x.tsx",
          content:
            'import { useState } from "react"\nexport const X = () => <div className="bg-primary-500 text-text-strong-950">Anda</div>',
        },
      ]),
      EMPTY_DESIGN,
    )
    expect(r.passed).toBe(true)
    expect(r.score).toBeGreaterThan(80)
    expect(r.errors).toHaveLength(0)
  })

  it("flags react-hook-form as high severity", () => {
    const r = validateOutput(
      parsed([
        {
          path: "src/form.tsx",
          content: 'import { useForm } from "react-hook-form"\nexport const F = () => null',
        },
      ]),
      EMPTY_DESIGN,
    )
    expect(r.passed).toBe(false)
    expect(r.errors.some((e) => e.message.includes("react-hook-form"))).toBe(true)
  })

  it("flags zod, swr, react-query, @hookform/resolvers", () => {
    const r = validateOutput(
      parsed([
        {
          path: "src/bad.ts",
          language: "ts",
          content: [
            'import { z } from "zod"',
            'import useSWR from "swr"',
            'import { useQuery } from "@tanstack/react-query"',
            'import { zodResolver } from "@hookform/resolvers/zod"',
          ].join("\n"),
        },
      ]),
      EMPTY_DESIGN,
    )
    const banned = r.errors.filter((e) => e.severity === "high").map((e) => e.message)
    expect(banned.some((m) => m.includes("zod"))).toBe(true)
    expect(banned.some((m) => m.includes("swr"))).toBe(true)
    expect(banned.some((m) => m.includes("@tanstack/react-query"))).toBe(true)
    expect(banned.some((m) => m.includes("@hookform/resolvers"))).toBe(true)
    expect(r.passed).toBe(false)
  })

  it("flags raw hex with medium severity and blocks validation pass", () => {
    const r = validateOutput(
      parsed([
        {
          path: "src/x.tsx",
          content: 'export const X = () => <div style={{ color: "#5e2aac" }} className="bg-primary-500 text-text-strong-950">X</div>',
        },
      ]),
      EMPTY_DESIGN,
    )
    expect(r.errors.some((e) => e.ruleId === "CR-5" && e.message.includes("hex"))).toBe(true)
    expect(r.passed).toBe(false)
    expect(r.score).toBeLessThan(100)
  })

  it("flags casual voice particle as medium when mitra mentioned", () => {
    const r = validateOutput(
      parsed([
        {
          path: "src/mitra.tsx",
          content:
            'export const M = () => <div className="bg-primary-500 text-text-strong-950">Yuk lengkapin data mitra kamu</div>',
        },
      ]),
      EMPTY_DESIGN,
    )
    expect(r.errors.some((e) => e.ruleId === "CR-4")).toBe(true)
    expect(r.errors.find((e) => e.ruleId === "CR-4")?.severity).toBe("medium")
  })

  it("flags casual voice as low when no mitra context", () => {
    const r = validateOutput(
      parsed([
        {
          path: "src/util.tsx",
          content: 'export const Greet = () => <div className="bg-primary-500 text-text-strong-950">yuk klik</div>',
        },
      ]),
      EMPTY_DESIGN,
    )
    expect(r.errors.find((e) => e.ruleId === "CR-4")?.severity).toBe("low")
  })

  it("warns when no Dash tokens are present in any TSX file", () => {
    const r = validateOutput(
      parsed([
        {
          path: "src/x.tsx",
          content: "export const X = () => <div>plain</div>",
        },
      ]),
      EMPTY_DESIGN,
    )
    expect(r.errors.some((e) => e.message.includes("No Dash semantic tokens"))).toBe(true)
    expect(r.passed).toBe(false)
  })

  it("emits a TODO warning without deducting score", () => {
    const r = validateOutput(
      parsed([
        {
          path: "src/x.tsx",
          content:
            '// TODO: wire endpoint\nexport const X = () => <div className="bg-primary-500 text-text-strong-950">Anda</div>',
        },
      ]),
      EMPTY_DESIGN,
    )
    expect(r.warnings.some((w) => w.includes("TODO"))).toBe(true)
    expect(r.passed).toBe(true)
  })

  it("surfaces degraded design context as a warning", () => {
    const r = validateOutput(
      parsed([
        {
          path: "src/x.tsx",
          content: 'export const X = () => <div className="bg-primary-500 text-text-strong-950">Anda</div>',
        },
      ]),
      { ...EMPTY_DESIGN, missingSources: ["x", "y"] },
    )
    expect(r.warnings.some((w) => w.toLowerCase().includes("degraded"))).toBe(true)
  })

  describe("daemon-self-audit mode (CR-5-DAEMON)", () => {
    let tempRoot: string
    let pkgRoot: string
    let daemonRoot: string

    beforeEach(() => {
      tempRoot = mkdtempSync(join(tmpdir(), "dash-build-validator-"))
      pkgRoot = join(tempRoot, "pkg")
      daemonRoot = join(pkgRoot, "src", "daemon")
      mkdirSync(join(daemonRoot, "templates", "styles"), { recursive: true })
      // Mark pkg as a package root so the validator's walk-up finds it.
      writeFileSync(join(pkgRoot, "package.json"), '{"name":"fixture"}', "utf8")
    })

    afterEach(() => {
      rmSync(tempRoot, { recursive: true, force: true })
    })

    it("catches raw hex inside daemon template literals", () => {
      const file = join(daemonRoot, "templates", "styles", "dashboard.ts")
      writeFileSync(
        file,
        [
          "export const DASHBOARD_CSS = `",
          "  .btn { color: #5e2aac; background: #fff; }",
          "`",
        ].join("\n"),
        "utf8",
      )

      const r = validateOutput(
        { files: [], explanation: "" },
        EMPTY_DESIGN,
        { mode: "daemon-self-audit", daemonRoot },
      )

      const cr5d = r.errors.filter((e) => e.ruleId === "CR-5-DAEMON")
      expect(cr5d.length).toBeGreaterThan(0)
      expect(cr5d[0]!.message).toContain("raw hex")
      expect(r.passed).toBe(false)
    })

    it("ignores hex inside --token: declarations and var() fallbacks", () => {
      const file = join(daemonRoot, "templates", "styles", "dashboard.ts")
      writeFileSync(
        file,
        [
          "export const DASHBOARD_CSS = `",
          "  :root { --primary: #5e2aac; }",
          "  .btn { color: var(--primary, #fff); }",
          "`",
        ].join("\n"),
        "utf8",
      )

      const r = validateOutput(
        { files: [], explanation: "" },
        EMPTY_DESIGN,
        { mode: "daemon-self-audit", daemonRoot },
      )
      expect(r.errors.filter((e) => e.ruleId === "CR-5-DAEMON")).toHaveLength(0)
      expect(r.passed).toBe(true)
    })

    it("respects an allowlist of (file, hex) pairs", () => {
      const file = join(daemonRoot, "templates", "styles", "dashboard.ts")
      writeFileSync(
        file,
        [
          "export const DASHBOARD_CSS = `",
          "  .btn { color: #5e2aac; }",
          "`",
        ].join("\n"),
        "utf8",
      )

      const r = validateOutput(
        { files: [], explanation: "" },
        EMPTY_DESIGN,
        {
          mode: "daemon-self-audit",
          daemonRoot,
          allowlist: [
            { file: "src/daemon/templates/styles/dashboard.ts", hex: "#5e2aac" },
          ],
        },
      )
      expect(r.errors.filter((e) => e.ruleId === "CR-5-DAEMON")).toHaveLength(0)
      expect(r.passed).toBe(true)
    })

    it("is backward compatible — generated mode signature unchanged", () => {
      // Calling the original 2-arg form must still work (no opts).
      const r = validateOutput(
        parsed([
          {
            path: "src/x.tsx",
            content:
              'export const X = () => <div className="bg-primary-500 text-text-strong-950">Anda</div>',
          },
        ]),
        EMPTY_DESIGN,
      )
      expect(r.passed).toBe(true)
    })
  })

  describe("patch validation (Sprint 2B)", () => {
    function patchResponse(patches: ParsedPatch[]): ParsedResponse {
      return { files: [], patches, explanation: "" }
    }

    function existingCtx(filePaths: string[]): ExistingFilesContext {
      return {
        resolutions: filePaths.map((p) => ({
          filePath: p,
          route: "/x",
          confidence: 0.9,
          reason: "test",
        })),
        files: filePaths.map((p) => ({
          filePath: p,
          language: "tsx",
          content: "export const X = () => null",
          truncated: false,
          fullSize: 30,
        })),
      }
    }

    it("accepts a valid patch against a known existing file", () => {
      const patch: ParsedPatch = {
        kind: "patch",
        path: "src/x.tsx",
        language: "diff",
        patchContent: ["@@ -1,2 +1,3 @@", " line a", "+line b", " line c"].join("\n"),
      }
      const r = validateOutput(patchResponse([patch]), EMPTY_DESIGN, {
        existingFiles: existingCtx(["src/x.tsx"]),
      })
      expect(r.errors.filter((e) => e.ruleId?.startsWith("PATCH-"))).toHaveLength(0)
    })

    it("rejects a patch with garbage body (no @@ header)", () => {
      const patch: ParsedPatch = {
        kind: "patch",
        path: "src/x.tsx",
        language: "diff",
        patchContent: "not a diff at all",
      }
      const r = validateOutput(patchResponse([patch]), EMPTY_DESIGN, {
        existingFiles: existingCtx(["src/x.tsx"]),
      })
      expect(r.passed).toBe(false)
      expect(r.errors.some((e) => e.ruleId === "PATCH-FORMAT")).toBe(true)
    })

    it("flags a patch targeting an unknown path with PATCH-UNKNOWN-TARGET", () => {
      const patch: ParsedPatch = {
        kind: "patch",
        path: "src/never-mentioned.tsx",
        language: "diff",
        patchContent: ["@@ -1,1 +1,2 @@", " x", "+y"].join("\n"),
      }
      const r = validateOutput(patchResponse([patch]), EMPTY_DESIGN, {
        existingFiles: existingCtx(["src/x.tsx"]),
      })
      expect(r.errors.some((e) => e.ruleId === "PATCH-UNKNOWN-TARGET")).toBe(true)
      expect(r.passed).toBe(false)
    })

    it("flags hunk header lengths that do not match observed lines", () => {
      const patch: ParsedPatch = {
        kind: "patch",
        path: "src/x.tsx",
        language: "diff",
        // Declares -1,5 +1,5 but only one ' ' context + one '+' line.
        patchContent: ["@@ -1,5 +1,5 @@", " a", "+b"].join("\n"),
      }
      const r = validateOutput(patchResponse([patch]), EMPTY_DESIGN, {
        existingFiles: existingCtx(["src/x.tsx"]),
      })
      expect(r.errors.some((e) => e.ruleId === "PATCH-HUNK-LENGTHS")).toBe(true)
    })

    it("flags banned imports introduced by additions (CR-3)", () => {
      const patch: ParsedPatch = {
        kind: "patch",
        path: "src/x.tsx",
        language: "diff",
        patchContent: [
          "@@ -1,2 +1,3 @@",
          ' import { useState } from "react"',
          '+import { useForm } from "react-hook-form"',
          " export const X = () => null",
        ].join("\n"),
      }
      const r = validateOutput(patchResponse([patch]), EMPTY_DESIGN, {
        existingFiles: existingCtx(["src/x.tsx"]),
      })
      expect(
        r.errors.some(
          (e) => e.ruleId === "CR-3" && e.message.includes("react-hook-form"),
        ),
      ).toBe(true)
      expect(r.passed).toBe(false)
    })

    it("flags raw hex introduced by additions (CR-5)", () => {
      const patch: ParsedPatch = {
        kind: "patch",
        path: "src/x.tsx",
        language: "diff",
        patchContent: [
          "@@ -1,2 +1,3 @@",
          " const x = 1",
          '+const purple = "#5e2aac"',
          " const y = 2",
        ].join("\n"),
      }
      const r = validateOutput(patchResponse([patch]), EMPTY_DESIGN, {
        existingFiles: existingCtx(["src/x.tsx"]),
      })
      expect(r.errors.some((e) => e.ruleId === "CR-5")).toBe(true)
      expect(r.passed).toBe(false)
    })

    it("does NOT flag CR-5 when raw hex is only in a DELETION line", () => {
      const patch: ParsedPatch = {
        kind: "patch",
        path: "src/x.tsx",
        language: "diff",
        patchContent: [
          "@@ -1,3 +1,3 @@",
          " const x = 1",
          '-const purple = "#5e2aac"',
          '+const purple = "var(--primary-base)"',
          " const y = 2",
        ].join("\n"),
      }
      const r = validateOutput(patchResponse([patch]), EMPTY_DESIGN, {
        existingFiles: existingCtx(["src/x.tsx"]),
      })
      expect(r.errors.filter((e) => e.ruleId === "CR-5")).toHaveLength(0)
    })

    it("warns when patch gutting imports en masse (AST integrity)", () => {
      const patch: ParsedPatch = {
        kind: "patch",
        path: "src/x.tsx",
        language: "diff",
        patchContent: [
          "@@ -1,5 +1,3 @@",
          '-import a from "a"',
          '-import b from "b"',
          '-import c from "c"',
          " export const X = () => null",
          " ",
        ].join("\n"),
      }
      const r = validateOutput(patchResponse([patch]), EMPTY_DESIGN, {
        existingFiles: existingCtx(["src/x.tsx"]),
      })
      expect(
        r.warnings.some((w) => /removes\s+\d+\s+import statements/.test(w)),
      ).toBe(true)
    })

    it("does NOT reject an additive nav diff targeting a real sidebar file (P3 — nav registry)", () => {
      // P3 bug: the model wrote a correct additive diff to the real backoffice
      // nav file to register a new tab, but PathResolver only surfaced it as a
      // nav-registry RESOLUTION (the reader's top-N budget didn't read its
      // content into existingFiles.files). The patch must still be accepted so
      // the feature ships REACHABLE instead of being hard-rejected.
      const navPath =
        "/repo/next-backoffice-web/src/components/sidebar/CollapseableSidebar.jsx"
      const patch: ParsedPatch = {
        kind: "patch",
        path: navPath,
        language: "diff",
        patchContent: [
          "@@ -10,2 +10,3 @@",
          " const items = [",
          "   { label: 'Mitra', href: '/provider' },",
          "+  { label: 'Suspensi', href: '/suspension' },",
          " ]",
        ].join("\n"),
      }
      // Nav file present ONLY as a resolution (not read into .files), exactly
      // like the live pipeline when route files outrank nav files in top-N.
      const ctx: ExistingFilesContext = {
        resolutions: [
          {
            filePath: navPath,
            route: "/suspension",
            confidence: 0.4,
            reason: `${NAV_REGISTRY_REASON_MARKER} Nav/sidebar registry file`,
          },
        ],
        files: [
          {
            filePath: "/repo/next-backoffice-web/src/pages/suspension/index.js",
            language: "js",
            content: "export default function SuspensionPage(){return null}",
            truncated: false,
            fullSize: 40,
          },
        ],
      }
      const r = validateOutput(patchResponse([patch]), EMPTY_DESIGN, {
        existingFiles: ctx,
      })
      expect(r.errors.some((e) => e.ruleId === "PATCH-UNKNOWN-TARGET")).toBe(false)
    })

    it("still flags a non-nav unknown path even when a nav resolution is present", () => {
      const navPath =
        "/repo/next-backoffice-web/src/components/sidebar/CollapseableSidebar.jsx"
      const patch: ParsedPatch = {
        kind: "patch",
        path: "/repo/next-backoffice-web/src/components/random/NotNav.jsx",
        language: "diff",
        patchContent: ["@@ -1,1 +1,2 @@", " x", "+y"].join("\n"),
      }
      const ctx: ExistingFilesContext = {
        resolutions: [
          {
            filePath: navPath,
            route: "/suspension",
            confidence: 0.4,
            reason: `${NAV_REGISTRY_REASON_MARKER} Nav/sidebar registry file`,
          },
        ],
        files: [
          {
            filePath: navPath,
            language: "jsx",
            content: "export const Sidebar = () => null",
            truncated: false,
            fullSize: 30,
          },
        ],
      }
      const r = validateOutput(patchResponse([patch]), EMPTY_DESIGN, {
        existingFiles: ctx,
      })
      expect(r.errors.some((e) => e.ruleId === "PATCH-UNKNOWN-TARGET")).toBe(true)
    })

    it("skips PATCH-UNKNOWN-TARGET when no existingFiles context is provided", () => {
      // Backward compat path — when caller doesn't pass existingFiles we
      // can't verify the target, but we still validate the diff shape.
      const patch: ParsedPatch = {
        kind: "patch",
        path: "src/x.tsx",
        language: "diff",
        patchContent: ["@@ -1,1 +1,2 @@", " x", "+y"].join("\n"),
      }
      const r = validateOutput(patchResponse([patch]), EMPTY_DESIGN)
      expect(r.errors.some((e) => e.ruleId === "PATCH-UNKNOWN-TARGET")).toBe(false)
    })
  })

  it("clamps score to 0 floor on heavy violations", () => {
    const r = validateOutput(
      parsed([
        {
          path: "src/x.tsx",
          content: [
            'import { useForm } from "react-hook-form"',
            'import { z } from "zod"',
            'import useSWR from "swr"',
            'import { useQuery } from "@tanstack/react-query"',
            'import { zodResolver } from "@hookform/resolvers/zod"',
            'export const X = () => <div style={{ color: "#fff", background: "#5e2aac" }}>kamu</div>',
          ].join("\n"),
        },
      ]),
      EMPTY_DESIGN,
    )
    expect(r.score).toBe(0)
    expect(r.passed).toBe(false)
  })

  // ── Phase 0D — DS coverage gate ──────────────────────────────────────────
  describe("DS coverage gate (Phase 0D)", () => {
    it("rejects raw-HTML output on a UI-shaped prompt as high severity", () => {
      const r = validateOutput(
        parsed([
          {
            path: "src/dashboard.tsx",
            content: [
              // 3 imports, 0 dash → ratio 0/3 = 0% → fires the Phase 0D
              // import-ratio gate (high severity).
              'import * as React from "react"',
              'import clsx from "clsx"',
              'import { useState } from "react"',
              "export const Dashboard = () => {",
              "  const [open, setOpen] = useState(false)",
              "  return (",
              '    <div className="bg-primary-base text-text-strong-950">',
              '      <div className={clsx("bg-success-light", open && "is-open")}>',
              "        All systems go",
              "      </div>",
              "    </div>",
              "  )",
              "}",
            ].join("\n"),
          },
        ]),
        EMPTY_DESIGN,
        { prompt: "build me a dashboard with mitra stats" },
      )
      const dsErrs = r.errors.filter((e) => e.ruleId === "DS-COVERAGE")
      expect(dsErrs.length).toBeGreaterThan(0)
      // The Phase 0D import-ratio gate is the high-severity blocker. Phase B's
      // raw-utility metric may also fire as a medium DS-COVERAGE finding —
      // both are valid signals.
      expect(dsErrs.some((e) => e.severity === "high")).toBe(true)
      expect(r.passed).toBe(false)
    })

    it("accepts output that imports a Dash DS atom", () => {
      const r = validateOutput(
        parsed([
          {
            path: "src/dashboard.tsx",
            content: [
              'import * as React from "react"',
              'import { Badge } from "@dash/kit/badge"',
              "export const Dashboard = () =>",
              '  <div className="bg-primary-base text-text-strong-950">',
              "    <Badge>active</Badge>",
              "  </div>",
            ].join("\n"),
          },
        ]),
        EMPTY_DESIGN,
        { prompt: "build me a dashboard with mitra stats" },
      )
      expect(r.errors.find((e) => e.ruleId === "DS-COVERAGE")).toBeUndefined()
    })

    it("does not fire on non-UI-shaped prompts", () => {
      const r = validateOutput(
        parsed([
          {
            path: "src/util.ts",
            language: "ts",
            content: 'export function add(a: number, b: number) { return a + b }',
          },
        ]),
        EMPTY_DESIGN,
        { prompt: "write a helper function" },
      )
      expect(r.errors.find((e) => e.ruleId === "DS-COVERAGE")).toBeUndefined()
    })

    it("does not fire when prompt is missing AND output has no TSX", () => {
      const r = validateOutput(
        parsed([
          {
            path: "src/util.ts",
            language: "ts",
            content: 'export function add(a: number, b: number) { return a + b }',
          },
        ]),
        EMPTY_DESIGN,
      )
      expect(r.errors.find((e) => e.ruleId === "DS-COVERAGE")).toBeUndefined()
    })

    it("stays silent when prompt is omitted (Phase B scorer owns the fallback)", () => {
      // Conservative default — without an explicit prompt keyword we cannot
      // confirm the prompt was UI-shaped, so we don't penalize legacy callers
      // (CLI smoke, direct chain tests) that never thread prompt through.
      const r = validateOutput(
        parsed([
          {
            path: "src/dashboard.tsx",
            content: [
              'import * as React from "react"',
              "import clsx from 'clsx'",
              'export const Dashboard = () => <div className="bg-success-light">x</div>',
            ].join("\n"),
          },
        ]),
        EMPTY_DESIGN,
      )
      expect(r.errors.find((e) => e.ruleId === "DS-COVERAGE")).toBeUndefined()
    })
  })

  // ── Phase B Tier 0C — raw utility-class anti-pattern (DS-COVERAGE-RAW-UTILITY) ──
  describe("DS-COVERAGE-RAW-UTILITY (Tier 0C)", () => {
    it("flags raw utility-class status badges as medium-severity", () => {
      const r = validateOutput(
        parsed([
          {
            path: "src/dashboard.tsx",
            content: [
              'import { Card } from "@dash/kit"',
              "export const X = () =>",
              '  <Card><div className="bg-success-light text-success-dark px-3 py-1 rounded-2xl">ON_TRACK</div></Card>',
            ].join("\n"),
          },
        ]),
        EMPTY_DESIGN,
        { prompt: "build a status dashboard" },
      )
      const dsErr = r.errors.find((e) => e.ruleId === "DS-COVERAGE-RAW-UTILITY")
      expect(dsErr).toBeDefined()
      expect(dsErr?.severity).toBe("medium")
      expect(dsErr?.message).toMatch(/Badge variant/i)
    })

    it("stays quiet when output uses a Dash DS Badge atom", () => {
      const r = validateOutput(
        parsed([
          {
            path: "src/dashboard.tsx",
            content: [
              'import { Badge, Card } from "@dash/kit"',
              "export const X = () => <Card><Badge variant=\"success\">ON_TRACK</Badge></Card>",
            ].join("\n"),
          },
        ]),
        EMPTY_DESIGN,
        { prompt: "build a status dashboard" },
      )
      expect(r.errors.find((e) => e.ruleId === "DS-COVERAGE-RAW-UTILITY")).toBeUndefined()
    })
  })

  // ── Phase B Tier 0J — per-repo stack mandate enforcement ───────────────
  describe("Stack mandate enforcement (Tier 0J)", () => {
    function fakeRepoContext(repoSlug: string) {
      return {
        selectedRepo: `dash/${repoSlug}`,
        repoSlug: repoSlug as never,
        theme: "ride" as const,
        audience: "x",
        surface: repoSlug,
        existingShell: true,
        requiresNavOrRoute: false,
        defaultRoute: null,
        targetRoute: null,
        targetNavLabel: null,
        existingNavItems: [],
        routeRequirement: null,
        integrationContract: "",
        dataPolicy: "mock-data-only" as const,
        ambiguity: null,
      }
    }

    it("flags a .tsx file in the backoffice surface (Pages Router + JavaScript)", () => {
      const r = validateOutput(
        parsed([
          {
            path: "src/pages/suspensions.tsx",
            content: 'import { Badge } from "@dash/kit"\nexport default function P() { return <Badge variant="success" className="bg-primary-500 text-text-strong-950">ok</Badge> }',
          },
        ]),
        EMPTY_DESIGN,
        { repoContext: fakeRepoContext("backoffice") },
      )
      const v = r.errors.find((e) => e.ruleId === "STACK-MANDATE")
      expect(v).toBeDefined()
      expect(v?.severity).toBe("high")
      expect(v?.message).toMatch(/backoffice|extension/i)
    })

    it("flags a forbidden state-mgmt import in the wrong surface", () => {
      const r = validateOutput(
        parsed([
          {
            path: "src/pages/x.tsx",
            content: [
              'import { atom } from "jotai"',
              'import { Badge } from "@dash/kit"',
              'export const X = () => <Badge variant="info" className="bg-primary-500 text-text-strong-950">x</Badge>',
            ].join("\n"),
          },
        ]),
        EMPTY_DESIGN,
        { repoContext: fakeRepoContext("basecamp") },
      )
      const v = r.errors.find((e) => e.ruleId === "STACK-MANDATE" && e.message.includes("jotai"))
      expect(v).toBeDefined()
      expect(v?.severity).toBe("high")
      expect(r.passed).toBe(false)
    })

    it("allows preview.tsx escape hatch even on backoffice surface", () => {
      const r = validateOutput(
        parsed([
          {
            path: "preview.tsx",
            content: 'import { Badge } from "@dash/kit"\nexport default function Preview() { return <Badge variant="success" className="bg-primary-500 text-text-strong-950">ok</Badge> }',
          },
        ]),
        EMPTY_DESIGN,
        { repoContext: fakeRepoContext("backoffice") },
      )
      expect(r.errors.find((e) => e.ruleId === "STACK-MANDATE")).toBeUndefined()
    })
  })

  // ── Phase B Tier 0K — voice register enforcement extension ─────────────
  describe("Voice register extension (Tier 0K)", () => {
    it("flags 'kalian' as casual on mitra-facing UI", () => {
      const r = validateOutput(
        parsed([
          {
            path: "src/mitra.tsx",
            content:
              'export const M = () => <div className="bg-primary-500 text-text-strong-950">Selamat datang kalian, mitra Dash!</div>',
          },
        ]),
        EMPTY_DESIGN,
      )
      expect(r.errors.find((e) => e.ruleId === "CR-4")).toBeDefined()
    })

    it("does NOT flag the formal 'Anda' pronoun", () => {
      const r = validateOutput(
        parsed([
          {
            path: "src/mitra.tsx",
            content:
              'export const M = () => <div className="bg-primary-500 text-text-strong-950">Selamat datang Anda, mitra Dash.</div>',
          },
        ]),
        EMPTY_DESIGN,
      )
      expect(r.errors.find((e) => e.ruleId === "CR-4")).toBeUndefined()
    })
  })

  // ── P10 — per-surface voice register (CLAUDE.md cardinal rule 5) ────────
  // portal-v2 mitra-facing DEFAULT is informal "kamu"; flagging it there
  // contradicts the canonical rule. Internal surfaces stay formal "Anda".
  describe("Per-surface voice register (P10)", () => {
    function repoCtx(repoSlug: string) {
      return {
        selectedRepo: `dash/${repoSlug}`,
        repoSlug: repoSlug as never,
        theme: "ride" as const,
        audience: "x",
        surface: repoSlug,
        existingShell: true,
        requiresNavOrRoute: false,
        defaultRoute: null,
        targetRoute: null,
        targetNavLabel: null,
        existingNavItems: [],
        routeRequirement: null,
        integrationContract: "",
        dataPolicy: "mock-data-only" as const,
        ambiguity: null,
      }
    }

    const kamuMitra = parsed([
      {
        path: "src/mitra.tsx",
        content:
          'export const M = () => <div className="bg-primary-500 text-text-strong-950">Lengkapi data kamu, mitra Dash.</div>',
      },
    ])

    it("does NOT flag informal 'kamu' on portal-v2 (informal-default surface)", () => {
      const r = validateOutput(kamuMitra, EMPTY_DESIGN, {
        repoContext: repoCtx("portal-v2"),
      })
      expect(r.errors.find((e) => e.ruleId === "CR-4")).toBeUndefined()
    })

    it("DOES flag 'kamu' on backoffice (formal-Anda surface)", () => {
      const r = validateOutput(kamuMitra, EMPTY_DESIGN, {
        repoContext: repoCtx("backoffice"),
      })
      const cr4 = r.errors.find((e) => e.ruleId === "CR-4")
      expect(cr4).toBeDefined()
      expect(cr4?.severity).toBe("medium")
      expect(cr4?.message).toMatch(/formal "Anda"/)
    })

    it("STILL flags slang particle 'yuk' on portal-v2 (informal != slang)", () => {
      const r = validateOutput(
        parsed([
          {
            path: "src/mitra.tsx",
            content:
              'export const M = () => <div className="bg-primary-500 text-text-strong-950">Yuk lengkapi data kamu, mitra Dash!</div>',
          },
        ]),
        EMPTY_DESIGN,
        { repoContext: repoCtx("portal-v2") },
      )
      const cr4 = r.errors.find((e) => e.ruleId === "CR-4")
      expect(cr4).toBeDefined()
      expect(cr4?.message).toMatch(/[Ss]lang/)
    })

    it("defaults to formal enforcement when repoContext is absent (kamu flagged)", () => {
      const r = validateOutput(kamuMitra, EMPTY_DESIGN)
      expect(r.errors.find((e) => e.ruleId === "CR-4")).toBeDefined()
    })
  })
})
