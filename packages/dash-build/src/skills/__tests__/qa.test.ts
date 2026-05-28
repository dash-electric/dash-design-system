import { describe, expect, it } from "vitest"
import { runDashQa } from "../qa.js"
import type {
  IntakeContext,
  ParsedResponse,
  RepoContextPack,
} from "../types.js"

function file(path: string, language: string, content: string) {
  return { path, language, content }
}

function patch(path: string, patchContent: string) {
  return {
    kind: "patch" as const,
    path,
    language: "diff",
    patchContent,
  }
}

function backofficeContext(): RepoContextPack {
  return {
    selectedRepo: "dash/backoffice",
    repoSlug: "backoffice",
    theme: "shared",
    audience: "internal",
    surface: "backoffice",
    existingShell: true,
    requiresNavOrRoute: false,
    defaultRoute: null,
    targetRoute: null,
    targetNavLabel: null,
    existingNavItems: [],
    routeRequirement: null,
    integrationContract: "",
    dataPolicy: "mock-data-only",
    ambiguity: null,
  }
}

function intakeWithAudit(): IntakeContext {
  return {
    beCatalog: { endpoints: [], framework: "none", totalEndpoints: 0 },
    dbCatalog: { tables: [], source: "none" },
    classification: {
      scenario: "fe-only",
      confidence: 0.9,
      reasoning: "stub",
      affectedFiles: { fe: [], be: [], db: [] },
    },
    auditTrail: {
      required: true,
      reason: "stub: payment field present",
      pattern: "inline-edit-with-audit",
      fieldsToLog: ["amount"],
    },
  }
}

function emptyResponse(opts: {
  files?: ReturnType<typeof file>[]
  patches?: ReturnType<typeof patch>[]
}): ParsedResponse {
  return {
    files: opts.files ?? [],
    patches: opts.patches,
    explanation: "",
  }
}

describe("runDashQa", () => {
  it("passes a clean output with empty issues", () => {
    const out = runDashQa({
      parsed: emptyResponse({
        files: [file("src/x.tsx", "tsx", "export default function X(){return null}")],
      }),
    })
    expect(out.passed).toBe(true)
    expect(out.issues).toEqual([])
  })

  it("flags banned imports in generated files", () => {
    const out = runDashQa({
      parsed: emptyResponse({
        files: [
          file(
            "src/form.tsx",
            "tsx",
            'import { useForm } from "react-hook-form"\nexport default function F(){return null}',
          ),
        ],
      }),
    })
    expect(out.passed).toBe(false)
    expect(out.issues.some((i) => i.ruleId === "QA-BANNED-IMPORT")).toBe(true)
  })

  it("flags banned imports introduced by patches", () => {
    const out = runDashQa({
      parsed: emptyResponse({
        patches: [
          patch(
            "src/form.tsx",
            "@@ -1,1 +1,2 @@\n line\n+import { useForm } from 'react-hook-form'\n",
          ),
        ],
      }),
    })
    expect(out.passed).toBe(false)
    expect(out.issues.some((i) => i.ruleId === "QA-BANNED-IMPORT")).toBe(true)
  })

  it("enforces stack mandate when repoContext present (backoffice .tsx blocked)", () => {
    const out = runDashQa({
      parsed: emptyResponse({
        files: [
          file("src/page.tsx", "tsx", "export default function P(){return null}"),
        ],
      }),
      repoContext: backofficeContext(),
    })
    expect(out.passed).toBe(false)
    expect(out.issues.some((i) => i.ruleId === "QA-STACK-MANDATE")).toBe(true)
  })

  it("does NOT enforce stack mandate without repoContext", () => {
    const out = runDashQa({
      parsed: emptyResponse({
        files: [
          file("src/page.tsx", "tsx", "export default function P(){return null}"),
        ],
      }),
    })
    expect(out.issues.some((i) => i.ruleId === "QA-STACK-MANDATE")).toBe(false)
  })

  it("flags missing audit-trail reference when intake requires it", () => {
    const out = runDashQa({
      parsed: emptyResponse({
        files: [
          file(
            "src/pay.tsx",
            "tsx",
            "export default function Pay(){return null}",
          ),
        ],
      }),
      intake: intakeWithAudit(),
    })
    expect(out.passed).toBe(false)
    expect(out.issues.some((i) => i.ruleId === "QA-AUDIT-TRAIL")).toBe(true)
  })

  it("accepts audit-trail when an audit block token is present", () => {
    const out = runDashQa({
      parsed: emptyResponse({
        files: [
          file(
            "src/pay.tsx",
            "tsx",
            'import { InlineEditWithAudit } from "@dash/blocks/inline-edit-with-audit"\nexport default function P(){return <InlineEditWithAudit/>}',
          ),
        ],
      }),
      intake: intakeWithAudit(),
    })
    expect(out.issues.some((i) => i.ruleId === "QA-AUDIT-TRAIL")).toBe(false)
  })

  it("flags brace-balance issues as medium severity", () => {
    const out = runDashQa({
      parsed: emptyResponse({
        files: [
          file("src/broken.ts", "ts", "export function broken() { return 1"),
        ],
      }),
    })
    expect(out.issues.some((i) => i.ruleId === "QA-BRACE-BALANCE")).toBe(true)
    // Medium severity should NOT flip passed.
    expect(out.passed).toBe(true)
  })

  it("flags patches without hunk headers", () => {
    const out = runDashQa({
      parsed: emptyResponse({
        patches: [patch("src/x.ts", "this is not a unified diff")],
      }),
    })
    expect(out.passed).toBe(false)
    expect(out.issues.some((i) => i.ruleId === "QA-PATCH-SHAPE")).toBe(true)
  })
})
