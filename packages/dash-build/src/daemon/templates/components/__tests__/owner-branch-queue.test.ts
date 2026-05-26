import { describe, expect, it } from "vitest"
import {
  parseUserIdFromBranch,
  renderOwnerBranchQueue,
  type OwnerBranchRow,
} from "../owner-branch-queue.js"
import { DASHBOARD_CSS } from "../../styles/dashboard.js"

describe("renderOwnerBranchQueue", () => {
  const rows: OwnerBranchRow[] = [
    {
      branch: "dash-build/irfan-prm_abc123",
      repo: "dash/portal-v2",
      status: "approved",
      reviewer: "Owner AI",
      author: "irfan",
      age: "2h",
      ci: "passing",
      lastCommit: "abcdef1234",
    },
    {
      branch: "dash-build/fayzul-prm_xyz789",
      repo: "dash/backoffice",
      status: "pending-review",
      author: "fayzul",
      age: "6h",
      ci: "running",
      lastCommit: "9876543",
    },
    {
      branch: "dash-build/aditya-prm_q",
      repo: "dash/portal-v2",
      status: "blocked",
      author: "aditya",
      age: "1d",
      ci: "failing",
    },
  ]

  it("renders a table with one row per branch", () => {
    const html = renderOwnerBranchQueue({ rows })
    expect(html).toContain("db-branch-queue-table")
    const rowMatches = html.match(/db-branch-queue-row/g) ?? []
    expect(rowMatches.length).toBe(3)
  })

  it("renders status pills with the correct tone tokens", () => {
    const html = renderOwnerBranchQueue({ rows })
    expect(html).toContain('data-tone="good"')
    expect(html).toContain('data-tone="warn"')
    expect(html).toContain('data-tone="error"')
    expect(html).toContain("Approved")
    expect(html).toContain("Pending review")
    expect(html).toContain("Blocked")
  })

  it("renders disabled placeholder action buttons", () => {
    const html = renderOwnerBranchQueue({ rows })
    expect(html).toContain('data-owner-action="approve"')
    expect(html).toContain('data-owner-action="request-changes"')
    expect(html).toContain('data-owner-action="reject"')
    // All three placeholder buttons should be disabled in S3A.
    const disabledCount = (html.match(/disabled aria-disabled="true"/g) ?? []).length
    // 3 per row × 3 rows = 9
    expect(disabledCount).toBe(9)
  })

  it("renders CI chips with tone tokens", () => {
    const html = renderOwnerBranchQueue({ rows })
    expect(html).toContain("CI ✓")
    expect(html).toContain("CI ✗")
    expect(html).toContain("CI …")
  })

  it("falls back to an empty state when no rows are provided", () => {
    const html = renderOwnerBranchQueue({ rows: [] })
    expect(html).toContain("db-branch-queue-empty")
    expect(html).toContain("No dash-build branches")
  })

  it("escapes branch and repo values to prevent injection", () => {
    const malicious: OwnerBranchRow[] = [
      {
        branch: "dash-build/evil<script>",
        repo: "dash/<img>",
        status: "pending-review",
      },
    ]
    const html = renderOwnerBranchQueue({ rows: malicious })
    expect(html).not.toContain("<script>")
    expect(html).toContain("&lt;script&gt;")
  })

  it("CSS bundle includes the Sprint 3 Owner styles", () => {
    expect(DASHBOARD_CSS).toContain("=== Sprint 3 Owner ===")
    expect(DASHBOARD_CSS).toContain(".db-branch-queue-table")
    expect(DASHBOARD_CSS).toContain(".db-activity-feed")
    expect(DASHBOARD_CSS).toContain(".db-cost-card")
    expect(DASHBOARD_CSS).toContain(".db-owner-page")
  })
})

describe("parseUserIdFromBranch", () => {
  it("extracts the user id from a standard dash-build branch", () => {
    expect(parseUserIdFromBranch("dash-build/irfan-prm_abc")).toBe("irfan")
  })

  it("preserves multi-segment user ids (last dash separates runId)", () => {
    expect(parseUserIdFromBranch("dash-build/irfan-prima-prm_abc")).toBe(
      "irfan-prima",
    )
  })

  it("returns null when the branch is not a dash-build branch", () => {
    expect(parseUserIdFromBranch("feature/foo")).toBeNull()
    expect(parseUserIdFromBranch("main")).toBeNull()
  })

  it("returns null on a malformed dash-build branch", () => {
    expect(parseUserIdFromBranch("dash-build/")).toBeNull()
  })
})
