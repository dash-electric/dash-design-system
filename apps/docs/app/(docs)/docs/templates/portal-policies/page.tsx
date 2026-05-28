"use client"

import * as React from "react"
import {
  RiAddFill,
  RiDownload2Line,
  RiCloseLine,
  RiArrowRightUpLine,
} from "@remixicon/react"
import {
  DocsPageShell,
  DocsHeader,
  DocsSection,
  DocsExample,
  DocsPropsTable,
} from "@/components/docs/page-shell"
import { DocsCode } from "@/components/docs/code-block"
import { Button } from "@/registry/dash/ui/button"
import { CompactButton } from "@/registry/dash/ui/compact-button"
import { SegmentedControl, SegmentedItem } from "@/registry/dash/ui/segmented-control"
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/registry/dash/ui/table"
import {
  PortalShell,
  PortalHeader,
  PortalInformationBanner,
} from "../_portal-shared"

/**
 * Portal Policies — ported from
 * next-portal-v2-web/app/[locale]/(dashboard)/policies/page.tsx + PolicyTable.tsx
 * + PolicyFilter.tsx. Information banner + status segmented control + batch
 * code policies table + download row action + Generate Codes primary button.
 * Banner copy verbatim from policies/page.tsx lines 235-272; table columns from
 * PolicyTable.tsx lines 88-189.
 */

const SAMPLE_BATCHES = [
  {
    uuid: "b-2026-05",
    effectiveAt: "2026-05-01",
    createdAt: "2026-04-28 14:22",
    notes: "May 2026 batch",
    used: 412,
    available: 588,
    total: 1000,
  },
  {
    uuid: "b-2026-04",
    effectiveAt: "2026-04-01",
    createdAt: "2026-03-29 09:11",
    notes: "April 2026 batch",
    used: 980,
    available: 20,
    total: 1000,
  },
  {
    uuid: "b-2026-03",
    effectiveAt: "2026-03-01",
    createdAt: "2026-02-26 16:48",
    notes: "March 2026 batch",
    used: 1000,
    available: 0,
    total: 1000,
  },
  {
    uuid: "b-2026-02",
    effectiveAt: "2026-02-01",
    createdAt: "2026-01-28 11:03",
    notes: "Feb 2026 batch",
    used: 750,
    available: 0,
    total: 750,
  },
]

function DocsTemplatePreview({ children }: { children: React.ReactNode }) {
  return (
    <div className="w-full overflow-x-auto rounded-2xl border border-stroke-soft-200 bg-bg-weak-50">
      <div className="min-w-[1280px] p-6">{children}</div>
    </div>
  )
}

export default function PortalPoliciesPage() {
  const [status, setStatus] = React.useState<"active" | "expired">("active")
  const [bannerOpen, setBannerOpen] = React.useState(true)

  return (
    <DocsPageShell>
      <DocsHeader
        category="Templates / Dash Next Portal"
        title="Portal Policies"
        description="One-time delivery code policies — generate monthly batches, download CSV, and track usage. Mirrors the production route at /policies. Includes information banner, status segmented control, and policy table with codes-used / codes-available / total counters."
      />

      <DocsSection title="Full preview">
        <DocsExample
          bare
          title="Policies page"
          description="Super admin with policy enabled — sees active batches + per-batch download action. Generate Codes opens a wizard modal."
          preview={
            <DocsTemplatePreview>
              <PortalShell active="/policies">
                <PortalHeader title="Policies" />
                <div className="flex flex-col gap-4 px-8 py-6">
                  {bannerOpen ? (
                    <PortalInformationBanner
                      title="Delivery code policies"
                      description="Require recipients to confirm delivery with a one-time code. Generate monthly batches and share via your existing app or system."
                      ctaLabel="Learn more"
                      onDismiss={() => setBannerOpen(false)}
                    />
                  ) : null}

                  <div className="flex items-center justify-between">
                    <div className="flex flex-col gap-1">
                      <p className="text-lg font-medium text-text-strong-950">
                        Delivery code batches
                      </p>
                      <p className="text-sm text-text-sub-600">
                        Manage the codes you generate for each effective month.
                      </p>
                    </div>
                    <Button tone="primary" style="filled" size="sm">
                      <RiAddFill className="size-4" />
                      Generate Codes
                    </Button>
                  </div>

                  <SegmentedControl
                    value={status}
                    onValueChange={(v: string) => setStatus(v as "active" | "expired")}
                    className="w-fit"
                  >
                    <SegmentedItem value="active">Active</SegmentedItem>
                    <SegmentedItem value="expired">Expired</SegmentedItem>
                  </SegmentedControl>

                  <div className="overflow-hidden rounded-lg border border-stroke-soft-200">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Effective month</TableHead>
                          <TableHead>Generated date</TableHead>
                          <TableHead>Notes</TableHead>
                          <TableHead className="text-right">Codes used</TableHead>
                          <TableHead className="text-right">Codes available</TableHead>
                          <TableHead className="text-right">Total codes</TableHead>
                          <TableHead className="w-12" />
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {SAMPLE_BATCHES.map((b) => (
                          <TableRow key={b.uuid}>
                            <TableCell className="font-medium text-text-strong-950">
                              {new Date(b.effectiveAt).toLocaleDateString("en-US", {
                                month: "long",
                                year: "numeric",
                              })}
                            </TableCell>
                            <TableCell className="text-text-sub-600">{b.createdAt}</TableCell>
                            <TableCell className="text-text-sub-600">{b.notes}</TableCell>
                            <TableCell className="text-right text-text-sub-600">
                              {b.used.toLocaleString()}
                            </TableCell>
                            <TableCell className="text-right text-text-sub-600">
                              {b.available.toLocaleString()}
                            </TableCell>
                            <TableCell className="text-right text-text-strong-950">
                              {b.total.toLocaleString()}
                            </TableCell>
                            <TableCell className="text-right">
                              <CompactButton size="md" variant="ghost" aria-label="Download CSV">
                                <RiDownload2Line className="size-4" />
                              </CompactButton>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              </PortalShell>
            </DocsTemplatePreview>
          }
          code={`<PortalShell active="/policies">
  <PortalHeader title="Policies" />
  <PortalInformationBanner title="..." description="..." onDismiss={...} />
  <SegmentedControl value={status} onValueChange={setStatus}>
    <SegmentedItem value="active">Active</SegmentedItem>
    <SegmentedItem value="expired">Expired</SegmentedItem>
  </SegmentedControl>
  <PoliciesTable data={batches} onDownload={downloadCsv} />
</PortalShell>`}
        />
      </DocsSection>

      <DocsSection title="Anatomy">
        <ul className="text-sm text-text-sub-600 space-y-1.5 list-disc pl-6">
          <li><b>Information banner</b> — light-gray panel introducing the policy + "Learn more" external link. Dismissible (state persisted in localStorage in production).</li>
          <li><b>Page header</b> — title + subtitle + Generate Codes primary button. Button is disabled when the one-time-code policy is not enabled under <code>/setting</code>.</li>
          <li><b>SegmentedControl</b> — Active / Expired toggle. Filters batch list server-side.</li>
          <li><b>Policy table</b> — Effective month, Generated date, Notes, Codes used, Codes available, Total, Download action.</li>
          <li><b>Empty state</b> — three variants: <i>policy not enabled</i> (CTA: Go to settings), <i>no active codes</i>, <i>no expired codes</i>.</li>
        </ul>
      </DocsSection>

      <DocsSection title="When to use">
        <ul className="text-sm text-text-sub-600 space-y-1.5 list-disc pl-6">
          <li><b>Use</b> for governance pages where a tenant manages monthly batched assets (delivery codes, vouchers, access tokens).</li>
          <li><b>Use</b> the information banner pattern at the top whenever the feature is gated by an upstream setting — the banner doubles as discoverability.</li>
          <li><b>Don't</b> use this layout for single-resource configuration — use the Settings tabs template instead.</li>
        </ul>
      </DocsSection>

      <DocsSection title="API">
        <DocsPropsTable
          rows={[
            { name: "batches", type: "PolicyBatch[]", description: "{ uuid, effectiveAt, createdAt, notes, stats:{ used, available }, totalCodes }[]." },
            { name: "statusFilter", type: '"active" | "expired"', description: "Server-side filter — defaults to active." },
            { name: "policyEnabled", type: "boolean", description: "When false, empty state CTA = Go to settings." },
            { name: "onGenerate", type: "() => void", description: "Opens the GenerateDeliveryCodeModal." },
            { name: "onDownload", type: "(uuid: string) => Promise<void>", description: "Server downloads a Blob and triggers browser download." },
          ]}
        />
      </DocsSection>
    </DocsPageShell>
  )
}
