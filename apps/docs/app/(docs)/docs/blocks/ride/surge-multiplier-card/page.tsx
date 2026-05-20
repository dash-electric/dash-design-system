"use client"

import * as React from "react"
import { SurgeMultiplierCard } from "@/registry/dash/blocks/ride/surge-multiplier-card"
import {
  DocsPageShell,
  DocsHeader,
  DocsSection,
  DocsExample,
  DocsPropsTable,
} from "@/components/docs/page-shell"
import { DocsCode } from "@/components/docs/code-block"

const FUTURE = (mins: number) =>
  new Date(Date.now() + mins * 60 * 1000).toISOString()

export default function SurgeMultiplierCardDocsPage() {
  return (
    <DocsPageShell>
      <DocsHeader
        category="Blocks / Ride"
        kind="specialized"
        status="beta"
        title="Surge Multiplier Card"
        description="Real-time surge indicator for the mitra mobile app. Hero multiplier, ride-theme accent band, expiry countdown, earning projection, waiting-orders signal. Layer 3 — Dash Ride only."
      />

      <DocsSection title="Install">
        <DocsCode language="bash" code={`dash add surge-multiplier-card`} />
      </DocsSection>

      <DocsSection title="Preview (High surge — Sudirman 2.0×)">
        <DocsExample
          title="Mitra view, 4 minutes remaining"
          description="High surge level lights the ride-green accent ramp at full --theme-accent-base. Countdown re-renders every second; pulse ring re-keys whenever level changes."
          preview={
            <div className="w-full max-w-sm">
              <SurgeMultiplierCard
                zoneName="Sudirman"
                multiplier={2.0}
                level="high"
                validUntil={FUTURE(4)}
                estimatedEarning={{ min: 4500000, max: 7800000 }}
                waitingOrders={12}
              />
            </div>
          }
          code={`<SurgeMultiplierCard
  zoneName="Sudirman"
  multiplier={2.0}
  level="high"
  validUntil={surgeWindow.endsAt}
  estimatedEarning={{ min: 4500000, max: 7800000 }}
  waitingOrders={12}
/>`}
        />
      </DocsSection>

      <DocsSection title="Preview (Extreme — Senayan 2.5×)">
        <DocsExample
          title="Concert / weather spike"
          description="Extreme escalates to error/red tone — high-attention signal that overrides the green ramp. Use sparingly: extreme surge for >2× multiplier or known city-wide demand events."
          preview={
            <div className="w-full max-w-sm">
              <SurgeMultiplierCard
                zoneName="Senayan"
                multiplier={2.5}
                level="extreme"
                validUntil={FUTURE(8)}
                estimatedEarning={{ min: 6200000, max: 9500000 }}
                waitingOrders={24}
              />
            </div>
          }
          code={`<SurgeMultiplierCard
  zoneName="Senayan"
  multiplier={2.5}
  level="extreme"
  validUntil={surgeWindow.endsAt}
  estimatedEarning={{ min: 6200000, max: 9500000 }}
  waitingOrders={24}
/>`}
        />
      </DocsSection>

      <DocsSection title="Preview (Medium — Kemang 1.3×)">
        <DocsExample
          title="Steady weekend demand"
          description="Medium surge tints the card with the lighter end of the ride-accent ramp, keeping the green family without shouting."
          preview={
            <div className="w-full max-w-sm">
              <SurgeMultiplierCard
                zoneName="Kemang"
                multiplier={1.3}
                level="medium"
                validUntil={FUTURE(15)}
                estimatedEarning={{ min: 2200000, max: 3800000 }}
                waitingOrders={5}
              />
            </div>
          }
          code={`<SurgeMultiplierCard
  zoneName="Kemang"
  multiplier={1.3}
  level="medium"
  validUntil={surgeWindow.endsAt}
/>`}
        />
      </DocsSection>

      <DocsSection title="API">
        <DocsPropsTable
          rows={[
            {
              name: "zoneName",
              type: "string",
              description: "Human-readable zone label (Sudirman, Kemang, Senayan, …).",
            },
            {
              name: "multiplier",
              type: "number",
              description: "Numeric multiplier applied to the base fare. 1.0 = no surge.",
            },
            {
              name: "level",
              type: '"off" | "low" | "medium" | "high" | "extreme"',
              description: "Semantic level — drives color band + copy. Caller maps multiplier range to level.",
            },
            {
              name: "validUntil",
              type: "string (ISO8601)",
              description: "When this surge window expires. Drives the countdown locally.",
            },
            {
              name: "estimatedEarning",
              type: "{ min: number, max: number }",
              description: "Optional earning projection in IDR cents. Formatted to Rp at render time.",
            },
            {
              name: "waitingOrders",
              type: "number",
              description: "Optional demand signal — orders currently waiting in the zone.",
            },
            {
              name: "className",
              type: "string",
              description: "Outer Card wrapper className.",
            },
          ]}
        />
      </DocsSection>

      <DocsSection title="Theme integration">
        <p className="text-sm text-text-sub-600 max-w-3xl">
          The hero band consumes Layer 2 ride-theme variables:
          {" "}<code>--theme-accent-lighter</code>, <code>--theme-accent-light</code>,
          {" "}<code>--theme-accent-base</code>, <code>--theme-accent-dark</code>,
          {" "}<code>--theme-accent-darker</code>, <code>--theme-accent-on</code>.
          Drop this block into any product theme and the band picks up that
          product's accent automatically — though copy + voice are tuned for
          Ride and would need a rewrite before reuse elsewhere.
        </p>
      </DocsSection>

      <DocsSection title="Voice">
        <p className="text-sm text-text-sub-600 max-w-3xl">
          Mitra-facing, formal Indonesian "Anda" register. "Estimasi pendapatan
          Anda" — not "kamu". The card never sets expectations the system can't
          honor: <em>estimasi</em>, not <em>jaminan</em>; <em>berlaku Xm lagi</em>,
          not "guaranteed for X minutes".
        </p>
      </DocsSection>
    </DocsPageShell>
  )
}
