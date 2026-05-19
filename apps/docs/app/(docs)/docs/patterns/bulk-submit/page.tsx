"use client"

import * as React from "react"
import {
  DocsPageShell,
  DocsHeader,
  DocsSection,
} from "@/components/docs/page-shell"
import { DocsCode } from "@/components/docs/code-block"
import { BulkSubmit, type BulkItem } from "@/registry/dash/patterns/bulk-submit"

const demoItems: BulkItem[] = [
  { id: "dlv-1", label: "Delivery to Bekasi (mtr-1234)" },
  { id: "dlv-2", label: "Delivery to Tangerang (mtr-9876)" },
  { id: "dlv-3", label: "Delivery to Jakarta Pusat (mtr-4521)" },
]

// WHY a deterministic fake: doc preview should reliably show the "partial
// failure → per-row retry" affordance without depending on a backend.
const fakeSubmit = (item: BulkItem) =>
  new Promise<{ ok: true } | { ok: false; reason: string }>((resolve) => {
    window.setTimeout(() => {
      // Middle item fails so all three states are visible at once.
      if (item.id === "dlv-2") {
        resolve({ ok: false, reason: "Mitra offline — retry in 30s" })
      } else {
        resolve({ ok: true })
      }
    }, 600 + Math.random() * 400)
  })

export default function BulkSubmitPatternPage() {
  return (
    <DocsPageShell>
      <DocsHeader
        category="Patterns"
        title="Bulk Submit"
        description="Dispatch N independent items to a batch endpoint. Per-row status, optimistic UI with rollback on individual failure, per-row retry, end-of-run summary."
        status="new"
      />

      <DocsSection title="Install">
        <DocsCode language="bash" code={`dash add bulk-submit`} />
      </DocsSection>

      <DocsSection
        title="When to use"
        description="Reach for this pattern when one user action fans out to N independent backend calls and any subset may fail."
      >
        <ul className="list-disc pl-5 space-y-1 text-sm text-text-sub-600">
          <li>Submitting a multi-order delivery to a batch dispatch endpoint</li>
          <li>Bulk-inviting mitra via email/SMS</li>
          <li>Bulk-updating outlet operating hours</li>
          <li>Anywhere a single &quot;Submit&quot; click triggers parallel requests</li>
        </ul>
      </DocsSection>

      <DocsSection
        title="Live preview"
        description="Click Submit — the middle row fails by design, so retry, success, and pending states are all observable."
      >
        <div className="rounded-xl border border-stroke-soft-200 bg-bg-weak-50 p-6">
          <BulkSubmit items={demoItems} submitOne={fakeSubmit} />
        </div>
      </DocsSection>

      <DocsSection
        title="Anatomy"
        description="The submit function is injected so the pattern works against any batch endpoint."
      >
        <ol className="list-decimal pl-5 space-y-2 text-sm text-text-sub-600">
          <li>
            <strong className="text-text-strong-950">Per-row status map</strong> —{" "}
            <code className="text-xs px-1 py-0.5 rounded bg-bg-weak-50">Record&lt;id, RowStatus&gt;</code>.
            Map-shape keeps each status update O(1) and skips re-renders for unchanged rows.
          </li>
          <li>
            <strong className="text-text-strong-950">Parallel dispatch</strong> — uses{" "}
            <code className="text-xs px-1 py-0.5 rounded bg-bg-weak-50">Promise.all</code>. Sequential dispatch would
            defeat the point of a &quot;bulk&quot; action.
          </li>
          <li>
            <strong className="text-text-strong-950">Per-row retry</strong> — Failed rows surface a retry IconButton.
            On retry, stale error text is cleared first so a recovered row leaves no ghost message.
          </li>
          <li>
            <strong className="text-text-strong-950">Summary toast</strong> — End-of-run, one toast.
            Full success → success tone. Partial → error tone with count.
          </li>
        </ol>
      </DocsSection>

      <DocsSection
        title="Refactor example — 'batch submit deliveries'"
        description="Wiring this pattern onto the output of a multi-item form."
      >
        <DocsCode
          language="tsx"
          code={`const onSubmit = (values: FormValues) => {
  const items = values.items.map((row, i) => ({
    id: \`dlv-\${i}\`,
    label: \`Delivery to \${row.dropoffAddress}\`,
    payload: row,
  }))
  setBatch(items) // stored elsewhere, rendered with <BulkSubmit />
}

<BulkSubmit
  items={batch}
  submitOne={async (item) => {
    const res = await fetch("/api/deliveries", {
      method: "POST",
      body: JSON.stringify(item.payload),
    })
    if (!res.ok) return { ok: false, reason: await res.text() }
    return { ok: true }
  }}
  onComplete={({ failed }) => { if (failed === 0) router.push("/deliveries") }}
/>`}
        />
      </DocsSection>

      <DocsSection title="Pair with">
        <ul className="list-disc pl-5 space-y-1 text-sm text-text-sub-600">
          <li>
            <code className="text-xs px-1 py-0.5 rounded bg-bg-weak-50">@dash/multi-item-form</code> — collect N rows before dispatching
          </li>
          <li>
            <code className="text-xs px-1 py-0.5 rounded bg-bg-weak-50">@dash/toaster</code> — must be mounted at app root for the summary toast
          </li>
        </ul>
      </DocsSection>
    </DocsPageShell>
  )
}
