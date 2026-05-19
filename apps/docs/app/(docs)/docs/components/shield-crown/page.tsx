"use client"

import * as React from "react"
import { ShieldCrown } from "@/registry/dash/ui/shield-crown"
import {
  DocsPageShell,
  DocsHeader,
  DocsSection,
  DocsExample,
  DocsPropsTable,
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
        status="new"
      />

      <DocsSection title="Install">
        <DocsCode language="bash" code={`dash add shield-crown`} />
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
