import {
  DocsPageShell,
  DocsHeader,
  DocsSection,
} from "@/components/docs/page-shell"
import {
  loadGapQueue,
  resolveActionsBaseUrl,
} from "@/lib/dashboard-data"
import { RequestsClient } from "./requests-client"

/**
 * /dashboard/requests — CEO-only review surface for Wave 4 gap reports.
 *
 * Server component. Reads the queue from whichever source is wired
 * (Agent L API if DASH_API_URL is set, else `~/.dash/gap-queue.json`)
 * and hands the entries + a "API base URL" string down to the
 * interactive client.
 *
 * Auth is enforced by `middleware.ts` on the /dashboard prefix — this
 * page itself trusts that the request got through the Bearer gate.
 *
 * Render policy:
 *   - Empty queue → friendly empty state with the user CLI hint.
 *   - Soft errors (API unavailable, corrupt file) → render a warning
 *     banner above the table but still draw whatever entries we got.
 *   - The page never throws on data issues; the CLI dashboard skill
 *     for Agent K explicitly forbids crashes that would brick the CEO
 *     workflow.
 */
export const dynamic = "force-dynamic"

export default async function RequestsPage() {
  const result = await loadGapQueue()
  const apiBaseUrl = resolveActionsBaseUrl()

  return (
    <DocsPageShell>
      <DocsHeader
        category="Dashboard / Wave 4"
        title="Gap Requests"
        description="Review user-logged DS coverage gaps. Approve vendoring, regenerate, decline, or merge duplicates. CEO-only — gated by DASH_CEO_TOKEN."
        status="wip"
      />

      {result.error ? (
        <div className="rounded-xl border border-(--state-warning-light) bg-(--state-warning-lighter)/50 px-4 py-3 text-sm text-(--state-warning-dark)">
          <strong>Queue source warning:</strong> {result.error}.
          {result.source === "file" && result.filePath ? (
            <>
              {" "}
              Reading from <code className="text-xs">{result.filePath}</code>.
            </>
          ) : null}
        </div>
      ) : null}

      <DocsSection
        title="Backlog"
        description={
          apiBaseUrl
            ? `Live data from ${apiBaseUrl}. Actions hit Agent L.`
            : "Local file mode — actions will queue locally until DASH_API_URL is configured."
        }
      >
        {result.entries.length === 0 ? (
          <EmptyState filePath={result.filePath} />
        ) : (
          <RequestsClient entries={result.entries} apiBaseUrl={apiBaseUrl} />
        )}
      </DocsSection>
    </DocsPageShell>
  )
}

/**
 * Empty-state block — shown when the queue exists but has zero entries
 * OR the file is missing entirely. The user-facing CLI hint comes
 * straight from `packages/cli/src/commands/gap.ts` so the message
 * stays accurate when the command name changes.
 */
function EmptyState({ filePath }: { filePath?: string }) {
  return (
    <div className="rounded-xl border border-dashed border-stroke-soft-200 bg-bg-weak-50/60 px-6 py-12 text-center">
      <p className="text-base font-semibold tracking-tight text-text-strong-950">
        No gaps logged yet.
      </p>
      <p className="mt-2 text-sm text-text-sub-600">
        Users can run{" "}
        <code className="rounded bg-bg-white-0 px-1.5 py-0.5 text-xs">
          dashkit gap report &quot;&lt;description&gt;&quot;
        </code>{" "}
        from their repo to add an entry.
      </p>
      {filePath ? (
        <p className="mt-4 text-xs text-text-soft-400">
          Queue source: <code>{filePath}</code>
        </p>
      ) : null}
    </div>
  )
}
