"use client"

import * as React from "react"
import { ShieldCrown } from "@/registry/dash/ui/shield-crown"
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
 * ShieldCrown — Ported from Dash Next Portal v2 (2026-05-19).
 * Source: components/custom-icon/ShieldCrown.tsx
 *
 * Composite icon: filled shield with a tiny crown centred inside it. Used for
 * "verified VIP / trusted partner" affordances next to a name or row. Two Remix
 * icons stacked — no external SVG asset.
 */

export default function ShieldCrownDocsPage() {
  return (
    <DocsPageShell>
      <DocsHeader
        category="Components / Icons"
        title="Shield Crown"
        description="Composite trust icon — filled shield with a centred crown. Use for verified, VIP, or trusted-partner rows. Stacks two Remix icons; no asset import."
        status="beta"
        kind="specialized"
      />

      <DocsSection title="Install">
        <DocsCode language="bash" code={`dashkit add shield-crown`} />
      </DocsSection>

      <DocsSection title="Usage">
        <DocsCode
          language="tsx"
          code={`<ShieldCrown />          // amber, md
<ShieldCrown tone="feature" size="lg" />`}
        />
      </DocsSection>

      <DocsSection title="Live: tones × sizes">
        <DocsExample
          title="Default amber (away-base)"
          preview={
            <div className="flex items-end gap-6">
              <ShieldCrown size="sm" />
              <ShieldCrown size="md" />
              <ShieldCrown size="lg" />
            </div>
          }
          code={`<ShieldCrown size="sm" />
<ShieldCrown size="md" />
<ShieldCrown size="lg" />`}
        />
        <DocsExample
          title="Tones"
          preview={
            <div className="flex items-center gap-6">
              <ShieldCrown tone="away" />
              <ShieldCrown tone="primary" />
              <ShieldCrown tone="warning" />
              <ShieldCrown tone="feature" />
              <ShieldCrown tone="success" />
            </div>
          }
          code={`<ShieldCrown tone="away" />
<ShieldCrown tone="primary" />
<ShieldCrown tone="feature" />
<ShieldCrown tone="success" />`}
        />
      </DocsSection>

      <DocsSection title="Do this, not that">
        <p className="text-base text-text-sub-600 leading-relaxed max-w-2xl">
          ShieldCrown = trust signal. Pakai untuk mitra VIP/verified-tier. Bukan untuk decorative atau random user. Selalu pair dengan label teks supaya makna jelas, jangan icon-only.
        </p>
        <DocsDoDont
          do={{
            preview: (
              <div className="flex items-center gap-1.5 text-sm">
                <ShieldCrown tone="feature" size="sm" />
                <span className="text-text-strong-950">mtr-9412</span>
                <span className="text-xs text-text-soft-400">VIP partner</span>
              </div>
            ),
            caption: "ShieldCrown disamping nama mitra VIP. Label 'VIP partner' kasih konteks supaya icon tidak berdiri sendiri.",
          }}
          dont={{
            preview: (
              <div className="flex gap-1">
                <ShieldCrown tone="primary" size="sm" />
                <ShieldCrown tone="warning" size="sm" />
                <ShieldCrown tone="feature" size="sm" />
                <ShieldCrown tone="success" size="sm" />
              </div>
            ),
            caption: "ShieldCrown sebagai decorative kombinasi warna = makna trust hilang. ShieldCrown untuk SATU mitra VIP, bukan ornament.",
          }}
        />
        <DocsDoDont
          do={{
            preview: (
              <span className="inline-flex items-center gap-1 rounded-full bg-warning-lighter text-warning-darker px-2 py-0.5 text-xs font-medium">
                <ShieldCrown tone="warning" size="sm" /> Top-rated mitra
              </span>
            ),
            caption: "Di dalam Badge dengan label 'Top-rated mitra'. Audience visual + textual reinforcement.",
          }}
          dont={{
            preview: (
              <ShieldCrown tone="away" size="lg" />
            ),
            caption: "ShieldCrown standalone tanpa konteks user atau label = trust signal misterius. Selalu pair dengan target subject + nama affordance.",
          }}
        />
      </DocsSection>

      <DocsSection title="API">
        <DocsPropsTable
          rows={[
            { name: "tone", type: '"away" | "primary" | "warning" | "feature" | "success"', defaultValue: '"away"', description: "Shield colour. White crown on top is fixed." },
            { name: "size", type: '"sm" | "md" | "lg"', defaultValue: '"md"', description: "Shield = 16/24/32, crown scales proportionally." },
            { name: "className", type: "string", description: "Forwarded to the relative wrapper span." },
          ]}
        />
      </DocsSection>

      <DocsSection title="Pairings">
        <ul className="list-disc pl-6 space-y-1 text-sm text-text-sub-600">
          <li>Inline next to a partner / driver name in a table row.</li>
          <li>Top-right corner of an avatar (compose with Avatar's child slot).</li>
          <li>Inside a Tag or Badge to label "Verified VIP" — increase contrast via tone.</li>
        </ul>
      </DocsSection>
    </DocsPageShell>
  )
}
