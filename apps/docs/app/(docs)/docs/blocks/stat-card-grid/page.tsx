"use client"

import { StatCardGrid } from "@/registry/dash/blocks/stat-card-grid"
import {
  DocsPageShell,
  DocsHeader,
  DocsSection,
  DocsExample,
  DocsPropsTable,
  DocsDoDont,
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
        <DocsCode language="bash" code={`dashkit add stat-card-grid`} />
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
        <ul className="text-sm text-text-sub-600 space-y-1.5 list-disc pl-6">
          <li>Wraps a configurable-column grid of <code>Card</code> + <code>Stat</code> tiles.</li>
          <li>Each tile: <code>StatLabel</code> + <code>StatValue</code> + <code>StatTrend</code> (up/down/flat).</li>
          <li>Trend values support <code>+12</code>, <code>+12.4%</code>, raw absolute strings.</li>
          <li>Use <code>cols={`{4}`}</code> for hero, <code>cols={`{3}`}</code> for sidebar, <code>cols={`{2}`}</code> for compact splits.</li>
        </ul>
      </DocsSection>

      <DocsSection title="When to use">
        <ul className="text-sm text-text-sub-600 space-y-1.5 list-disc pl-6">
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
      <DocsSection title="Delta direction + tone">
        <p className="text-sm text-text-sub-600 max-w-2xl">
          Up-and-positive (orders up) = success. Down-and-negative (refunds down) = success. Direction alone is misleading — pair arrow with semantic tone.
        </p>
        <DocsDoDont
          do={{
            preview: (
              <div className="grid grid-cols-3 gap-2 w-full max-w-md">
                <div className="rounded-lg border border-stroke-soft-200 bg-bg-white-0 p-3 space-y-1"><p className="text-[10px] text-text-sub-600">Order hari ini</p><p className="text-xl font-semibold">2.412</p><span className="text-[10px] text-success-dark">↑ 12% vs kemarin</span></div>
                <div className="rounded-lg border border-stroke-soft-200 bg-bg-white-0 p-3 space-y-1"><p className="text-[10px] text-text-sub-600">Refund rate</p><p className="text-xl font-semibold">0.8%</p><span className="text-[10px] text-success-dark">↓ 0.3pt vs kemarin</span></div>
                <div className="rounded-lg border border-stroke-soft-200 bg-bg-white-0 p-3 space-y-1"><p className="text-[10px] text-text-sub-600">SLA breach</p><p className="text-xl font-semibold">14</p><span className="text-[10px] text-error-dark">↑ 6 vs kemarin</span></div>
              </div>
            ),
            caption: "Down-refund and down-SLA tell opposite stories. Tone communicates the business interpretation, not just the math.",
          }}
          dont={{
            preview: (
              <div className="grid grid-cols-3 gap-2 w-full max-w-md">
                <div className="rounded-lg border border-stroke-soft-200 bg-bg-white-0 p-3 space-y-1"><p className="text-[10px] text-text-sub-600">Order</p><p className="text-xl font-semibold">2.412</p><span className="text-[10px] text-success-dark">↑ 12%</span></div>
                <div className="rounded-lg border border-stroke-soft-200 bg-bg-white-0 p-3 space-y-1"><p className="text-[10px] text-text-sub-600">Refund rate</p><p className="text-xl font-semibold">0.8%</p><span className="text-[10px] text-error-dark">↓ 0.3pt</span></div>
                <div className="rounded-lg border border-stroke-soft-200 bg-bg-white-0 p-3 space-y-1"><p className="text-[10px] text-text-sub-600">SLA breach</p><p className="text-xl font-semibold">14</p><span className="text-[10px] text-success-dark">↑ 6</span></div>
              </div>
            ),
            caption: "Don't auto-tone deltas by arrow direction. 'SLA breach ↑6' painted green tells Ops the wrong story.",
          }}
        />
      </DocsSection>

      <DocsSection title="Comparison context">
        <p className="text-sm text-text-sub-600 max-w-2xl">
          Every metric needs a reference point — vs yesterday, vs last week, vs target. Otherwise the number is unanchored.
        </p>
        <DocsDoDont
          do={{
            preview: (
              <div className="rounded-lg border border-stroke-soft-200 bg-bg-white-0 p-3 space-y-1 w-48"><p className="text-[10px] text-text-sub-600">GMV hari ini</p><p className="text-2xl font-semibold">Rp 84,2 jt</p><span className="text-[10px] text-success-dark">↑ 8% vs target Rp 78 jt</span></div>
            ),
            caption: "Number paired with the comparator (target Rp 78 jt). Reader sees not just movement, but performance.",
          }}
          dont={{
            preview: (
              <div className="rounded-lg border border-stroke-soft-200 bg-bg-white-0 p-3 space-y-1 w-48"><p className="text-[10px] text-text-sub-600">GMV</p><p className="text-2xl font-semibold">Rp 84,2 jt</p></div>
            ),
            caption: "Don't show a bare number. Is Rp 84 jt good? Bad? Half of target? The card answers nothing without context.",
          }}
        />
      </DocsSection>
        </DocsPageShell>
  )
}
