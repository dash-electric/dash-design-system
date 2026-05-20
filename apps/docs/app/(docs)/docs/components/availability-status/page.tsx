"use client"

import * as React from "react"
import { AvailabilityStatus } from "@/registry/dash/ui/availability-status"
import {
  DocsPageShell,
  DocsHeader,
  DocsSection,
  DocsExample,
  DocsPropsTable,
  DocsDoDont,
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
        status="beta"
        kind="specialized"
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

      <DocsSection title="Do this, not that">
        <p className="text-base text-text-sub-600 leading-relaxed max-w-2xl">
          AvailabilityStatus = sinyal real-time. Selalu pair dengan hover explanation supaya user tahu sumber data + ETA recovery saat unavailable.
        </p>
        <DocsDoDont
          do={{
            preview: (
              <AvailabilityStatus
                status="unavailable"
                tooltipTitle="Belum ada mitra Express di Bekasi"
                tooltipDescription="Kami akan notify dalam 2-3 menit setelah mitra check-in."
              />
            ),
            caption: "Unavailable + tooltip jelaskan kenapa + ETA. User tahu harus tunggu, bukan reload page berulang.",
          }}
          dont={{
            preview: (
              <AvailabilityStatus status="unavailable" label="N/A" />
            ),
            caption: "'N/A' tanpa hover context = user tidak tahu apa yang unavailable, kapan available lagi, atau harus apa.",
          }}
        />
        <DocsDoDont
          do={{
            preview: (
              <div className="flex items-center gap-2">
                <AvailabilityStatus status="available" tooltipTitle="42 mitra Express aktif di Tangerang" />
              </div>
            ),
            caption: "Available + jumlah/lokasi spesifik di tooltip. Sinyal real-time, bukan label statis.",
          }}
          dont={{
            preview: (
              <AvailabilityStatus status="available" label="Active" />
            ),
            caption: "Untuk label kategoris statis (Active mitra), pakai Badge atau StatusBadge. AvailabilityStatus implies LIVE state.",
          }}
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
