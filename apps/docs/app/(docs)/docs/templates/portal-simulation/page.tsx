"use client"

import * as React from "react"
import {
  RiPlayCircleLine,
  RiCheckboxCircleFill,
  RiCloseCircleFill,
  RiTimeLine,
  RiArrowRightUpLine,
  RiTestTubeLine,
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
import { LinkButton } from "@/registry/dash/ui/link-button"
import { Badge, StatusBadge } from "@/registry/dash/ui/badge"
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/registry/dash/ui/table"
import { Banner } from "@/registry/dash/ui/banner"
import {
  PortalShell,
  PortalHeader,
  PortalInformationBanner,
} from "../_portal-shared"

/**
 * Portal Simulation — ported from
 * next-portal-v2-web/app/[locale]/(dashboard)/simulation/page.tsx.
 *
 * In production simulation pages are redirect stubs to /deliveries — sandbox
 * deliveries appear in the regular delivery list when envMode === 'sandbox'.
 * This docs template recreates the conceptual "Simulation runs" surface ops
 * teams see when toggled into sandbox mode: a list of simulated deliveries
 * with status (queued / picking up / completed / failed / cancelled) and a
 * link back to the full /deliveries view.
 */

const SAMPLE_RUNS = [
  {
    id: "sim-7841",
    name: "Wedding cake delivery — JKT",
    status: "completed",
    createdAt: "Today · 14:22",
    parcelWeight: "8 kg",
  },
  {
    id: "sim-7840",
    name: "Multi-stop bulk 12 orders",
    status: "in-delivery",
    createdAt: "Today · 13:08",
    parcelWeight: "42 kg",
  },
  {
    id: "sim-7839",
    name: "Failure scenario: driver no-show",
    status: "failed",
    createdAt: "Today · 11:45",
    parcelWeight: "2 kg",
  },
  {
    id: "sim-7838",
    name: "Cancellation flow test",
    status: "cancelled",
    createdAt: "Today · 10:12",
    parcelWeight: "5 kg",
  },
  {
    id: "sim-7837",
    name: "Allocating phase test",
    status: "allocating",
    createdAt: "Yesterday · 17:30",
    parcelWeight: "1.5 kg",
  },
]

const STATUS_MAP: Record<
  string,
  { label: string; status: "success" | "warning" | "error" | "information" | "faded" }
> = {
  allocating: { label: "Allocating", status: "information" },
  "picking-up": { label: "Picking up", status: "warning" },
  "in-delivery": { label: "In delivery", status: "warning" },
  completed: { label: "Completed", status: "success" },
  failed: { label: "Failed", status: "error" },
  cancelled: { label: "Cancelled", status: "faded" },
}

function DocsTemplatePreview({ children }: { children: React.ReactNode }) {
  return (
    <div className="w-full overflow-x-auto rounded-2xl border border-stroke-soft-200 bg-bg-weak-50">
      <div className="min-w-[1280px] p-6">{children}</div>
    </div>
  )
}

export default function PortalSimulationPage() {
  return (
    <DocsPageShell>
      <DocsHeader
        category="Templates / Dash Next Portal"
        title="Portal Simulation"
        description="Sandbox simulation runs — used by developers and ops to test the delivery lifecycle without dispatching real drivers. In production this surface is folded into /deliveries; this template documents the dedicated list view ops teams used in v1 and is the parent layout for Portal Simulation Detail."
      />

      <DocsSection title="Full preview">
        <DocsExample
          bare
          title="Simulation runs"
          description="Sandbox banner pinned to the top, list of simulated runs with status badges, and a back-to-deliveries link footer."
          preview={
            <DocsTemplatePreview>
              <PortalShell active="/deliveries" withAnnouncementBar>
                <PortalHeader
                  title="Simulation"
                  subtitle="Test the full delivery lifecycle in a sandbox environment."
                  sandbox
                  actions={
                    <Button tone="primary" style="filled" size="sm">
                      <RiPlayCircleLine className="size-4" />
                      New simulation
                    </Button>
                  }
                />
                <div className="flex flex-col gap-4 px-8 py-6">
                  <Banner
                    status="information"
                    appearance="lighter"
                    title="Sandbox mode active"
                  >
                    Runs created here are isolated. Toggle back to Live from Settings → Account.
                  </Banner>

                  <div className="overflow-hidden rounded-lg border border-stroke-soft-200">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Run ID</TableHead>
                          <TableHead>Scenario</TableHead>
                          <TableHead>Parcel weight</TableHead>
                          <TableHead>Created</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Action</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {SAMPLE_RUNS.map((r) => {
                          const s = STATUS_MAP[r.status] ?? STATUS_MAP.completed
                          return (
                            <TableRow key={r.id}>
                              <TableCell className="font-medium text-text-strong-950">
                                {r.id}
                              </TableCell>
                              <TableCell className="text-text-sub-600">{r.name}</TableCell>
                              <TableCell className="text-text-sub-600">
                                {r.parcelWeight}
                              </TableCell>
                              <TableCell className="text-text-sub-600">
                                {r.createdAt}
                              </TableCell>
                              <TableCell>
                                <StatusBadge status={s.status} variant="dot-light">
                                  {s.label}
                                </StatusBadge>
                              </TableCell>
                              <TableCell className="text-right">
                                <LinkButton size="sm" tone="primary" href="#">
                                  View
                                  <RiArrowRightUpLine className="size-4" />
                                </LinkButton>
                              </TableCell>
                            </TableRow>
                          )
                        })}
                      </TableBody>
                    </Table>
                  </div>

                  <div className="flex items-center justify-between rounded-lg border border-dashed border-stroke-soft-200 p-4 text-sm text-text-sub-600">
                    <span>
                      Looking for live deliveries? Sandbox + live runs share the
                      same dispatch UI.
                    </span>
                    <LinkButton size="sm" tone="primary" href="/deliveries">
                      Go to deliveries
                      <RiArrowRightUpLine className="size-4" />
                    </LinkButton>
                  </div>
                </div>
              </PortalShell>
            </DocsTemplatePreview>
          }
          code={`<PortalShell active="/deliveries" withAnnouncementBar>
  <PortalHeader title="Simulation" sandbox actions={<NewSimButton />} />
  <Banner status="information" appearance="lighter" ... />
  <SimulationRunsTable data={runs} />
  <BackToDeliveriesFooter />
</PortalShell>`}
        />
      </DocsSection>

      <DocsSection title="Anatomy">
        <ul className="text-sm text-text-sub-600 space-y-1.5 list-disc pl-5">
          <li><b>Announcement bar</b> — sticky top, full-width information color, marquee text "Sandbox mode enabled".</li>
          <li><b>Header sandbox pill</b> — small warning-lighter pill next to the locale select. Always visible while sandbox is active.</li>
          <li><b>Info Banner</b> — repeats sandbox messaging inside the content area so it survives if the marquee is dismissed.</li>
          <li><b>Runs table</b> — Run ID, Scenario, Parcel weight, Created, Status badge, View action.</li>
          <li><b>Status set</b> — allocating / picking up / in delivery / completed / failed / cancelled (mirrors <code>showedDeliveryAnalyticsStatus</code> in source).</li>
          <li><b>Footer link</b> — dashed-border CTA back to <code>/deliveries</code> since the production surface is consolidated there.</li>
        </ul>
      </DocsSection>

      <DocsSection title="When to use">
        <ul className="text-sm text-text-sub-600 space-y-1.5 list-disc pl-5">
          <li><b>Use</b> for developer-facing sandbox surfaces where every action needs an explicit "this is not production" reminder.</li>
          <li><b>Use</b> when the production page redirects users elsewhere — the docs page is the historical record of the UX.</li>
          <li><b>Don't</b> reuse the announcement bar marquee for non-sandbox messaging; reserve it for environment switching.</li>
        </ul>
      </DocsSection>

      <DocsSection title="API">
        <DocsPropsTable
          rows={[
            { name: "runs", type: "SimulationRun[]", description: "{ id, name, parcelWeight, status, createdAt }[]." },
            { name: "envMode", type: '"sandbox" | "live"', description: "Controls the announcement bar + sandbox pill visibility." },
            { name: "onNew", type: "() => void", description: "Opens the new-simulation wizard." },
            { name: "onView", type: "(id: string) => void", description: "Navigates to /simulation/[id] (production: /deliveries/[id])." },
          ]}
        />
      </DocsSection>
    </DocsPageShell>
  )
}
