"use client"

import { StatCardGrid } from "@/registry/dash/blocks/stat-card-grid"
import {
  DocsPageShell,
  DocsHeader,
  DocsSection,
  DocsExample,
  DocsPropsTable,
} from "@/components/docs/page-shell"
import { DocsCode } from "@/components/docs/code-block"

export default function StatCardGridDocsPage() {
  return (
    <DocsPageShell>
      <DocsHeader
        category="Blocks / Analytics"
        title="Stat Card Grid"
        description="Responsive grid of KPI tiles — Dash dispatch / mitra / payout snapshot. The simplest analytics fragment in @dash; perfect for any dashboard hero."
      />

      <DocsSection title="Install">
        <DocsCode language="bash" code={`dash add stat-card-grid`} />
      </DocsSection>

      <DocsSection title="Preview">
        <DocsExample
          title="Tribe KPIs — 4 tiles"
          description="Defaults: Mitra aktif, Dispatch terkirim, Payout outstanding, Suspended."
          preview={
            <div className="w-full rounded-xl border border-stroke-soft-200 bg-bg-white-0 p-6">
              <StatCardGrid />
            </div>
          }
          code={`<StatCardGrid cols={4} tiles={[/* StatTile[] */]} />`}
        />

        <DocsExample
          title="3-tile compact"
          description="Tighter grid for sidebar use — fewer KPIs, more density."
          preview={
            <div className="w-full rounded-xl border border-stroke-soft-200 bg-bg-white-0 p-6">
              <StatCardGrid cols={3} />
            </div>
          }
          code={`<StatCardGrid cols={3} />`}
        />
      </DocsSection>

      <DocsSection title="Composition">
        <ul className="text-sm text-text-sub-600 space-y-1.5 list-disc pl-5">
          <li>Wraps a configurable-column grid of <code>Card</code> + <code>Stat</code> tiles.</li>
          <li>Each tile: <code>StatLabel</code> + <code>StatValue</code> + <code>StatTrend</code> (up/down/flat).</li>
          <li>Trend values support <code>+12</code>, <code>+12.4%</code>, raw absolute strings.</li>
          <li>Use <code>cols={`{4}`}</code> for hero, <code>cols={`{3}`}</code> for sidebar, <code>cols={`{2}`}</code> for compact splits.</li>
        </ul>
      </DocsSection>

      <DocsSection title="When to use">
        <ul className="text-sm text-text-sub-600 space-y-1.5 list-disc pl-5">
          <li><strong>Use</strong> at the top of any backoffice dashboard.</li>
          <li><strong>Use</strong> as a quick KPI snapshot inside a settings detail pane.</li>
          <li><strong>Don't</strong> use for trend visualization — pair with <code>AnalyticsGrid</code> which has chart panels.</li>
          <li><strong>Don't</strong> use for &gt; 6 tiles — split into rows or use a different layout.</li>
        </ul>
      </DocsSection>

      <DocsSection title="API">
        <DocsPropsTable
          rows={[
            { name: "tiles", type: "StatTile[]", description: "{ label, value, trend: 'up'|'down'|'flat', delta, sub? }." },
            { name: "cols", type: "2 | 3 | 4", defaultValue: "4", description: "Grid columns on desktop. Mobile collapses to 1." },
            { name: "className", type: "string", description: "Outer wrapper class." },
          ]}
        />
      </DocsSection>
    </DocsPageShell>
  )
}
