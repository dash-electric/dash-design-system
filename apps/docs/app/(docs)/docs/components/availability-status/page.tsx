"use client"

import * as React from "react"
import { AvailabilityStatus } from "@/registry/dash/ui/availability-status"
import {
  DocsPageShell,
  DocsHeader,
  DocsSection,
  DocsExample,
  DocsPropsTable,
} from "@/components/docs/page-shell"
import { DocsCode } from "@/components/docs/code-block"

/**
 * AvailabilityStatus — Ported from Dash Next Portal v2 (2026-05-19).
 * Source: components/availability/AvailabilityStatus.tsx
 *
 * Tooltip-augmented pill that signals real-time service availability ("drivers
 * available in your area"). Filled-circle icon + status text on a tinted chip,
 * with an explanation surfaced on hover. Distinct from Badge — this implies a
 * live signal, not a category.
 */

export default function AvailabilityStatusDocsPage() {
  return (
    <DocsPageShell>
      <DocsHeader
        category="Components / Status"
        title="Availability Status"
        description="Live-signal chip with hover-explained context. Use when a UI section's actionability depends on a real-time external state — driver pool, server load, slot availability. Not a Badge — Badge is for categorical labels."
        status="new"
      />

      <DocsSection title="Install">
        <DocsCode language="bash" code={`dash add availability-status`} />
      </DocsSection>

      <DocsSection title="Usage">
        <DocsCode
          language="tsx"
          code={`<AvailabilityStatus status="available" />
<AvailabilityStatus
  status="unavailable"
  tooltipTitle="No drivers in your zone"
  tooltipDescription="We'll alert you in 2-3 min once a driver checks in."
/>`}
        />
      </DocsSection>

      <DocsSection title="Live: both states">
        <DocsExample
          title="Available · Unavailable"
          preview={
            <div className="flex flex-wrap items-center gap-4">
              <AvailabilityStatus status="available" />
              <AvailabilityStatus status="unavailable" />
            </div>
          }
          code={`<AvailabilityStatus status="available" />
<AvailabilityStatus status="unavailable" />`}
        />
      </DocsSection>

      <DocsSection title="API">
        <DocsPropsTable
          rows={[
            { name: "status", type: '"available" | "unavailable"', description: "Drives colour, icon, and default copy." },
            { name: "label", type: "ReactNode", description: "Override the pill text." },
            { name: "tooltipTitle", type: "ReactNode", description: "Bold first line of the tooltip." },
            { name: "tooltipDescription", type: "ReactNode", description: "Tooltip body explaining the signal source." },
            { name: "className", type: "string", description: "Forwarded to the outer chip." },
          ]}
        />
      </DocsSection>

      <DocsSection title="When to use">
        <ul className="list-disc pl-6 space-y-1 text-sm text-text-sub-600">
          <li>Above an action panel whose CTA depends on external availability.</li>
          <li>Near filters that may return zero results based on live state.</li>
          <li>NOT for static categorisation (use Badge or Tag).</li>
          <li>NOT for system-wide outages (use Banner).</li>
        </ul>
      </DocsSection>
    </DocsPageShell>
  )
}
