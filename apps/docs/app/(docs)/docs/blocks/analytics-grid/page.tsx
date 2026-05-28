"use client"

import { AnalyticsGrid } from "@/registry/dash/blocks/analytics-grid"
import {
  DocsPageShell,
  DocsHeader,
  DocsSection,
  DocsExample,
  DocsPropsTable,
  DocsDoDont,
} from "@/components/docs/page-shell"
import { DocsCode } from "@/components/docs/code-block"

export default function AnalyticsGridDocsPage() {
  return (
    <DocsPageShell>
      <DocsHeader
        category="Blocks / Analytics"
        title="Analytics Grid"
        description="KPI cards + AreaChart + BarChart grid for tribe-level analytics. Drop-in dashboard fragment — dispatch trend, mitra growth, conversion stack."
      />

      <DocsSection title="Install">
        <DocsCode language="bash" code={`dash add analytics-grid`} />
      </DocsSection>

      <DocsSection title="Preview">
        <DocsExample
          title="Tribe analytics — 30d"
          preview={
            <div className="w-full rounded-xl border border-stroke-soft-200 bg-bg-white-0 p-6">
              <AnalyticsGrid />
            </div>
          }
          code={`<AnalyticsGrid />`}
        />
      </DocsSection>

      <DocsSection title="Composition">
        <ul className="text-sm text-text-sub-600 space-y-1.5 list-disc pl-6">
          <li>Top row — 3 <code>Card</code> + <code>Stat</code> KPI tiles with trend indicators.</li>
          <li>Bottom row — recharts <code>AreaChart</code> (dispatch trend) + <code>BarChart</code> (tribe split).</li>
          <li>Recharts <code>ChartConfig</code> typed and themed via Dash CSS variables.</li>
          <li>Wire to live aggregates by composing in your own data hooks at the wrapper level.</li>
        </ul>
      </DocsSection>

      <DocsSection title="When to use">
        <ul className="text-sm text-text-sub-600 space-y-1.5 list-disc pl-6">
          <li><strong>Use</strong> as a dashboard section above more detailed tables.</li>
          <li><strong>Use</strong> for tribe lead's weekly review snapshot.</li>
          <li><strong>Use</strong> on overview/home routes where breadth beats depth.</li>
          <li><strong>Don't</strong> use for single-metric deep-dive — show one big chart instead.</li>
          <li><strong>Don't</strong> use for trader-style metrics — reach for <code>Phase7ResultsPage</code> template.</li>
        </ul>
      </DocsSection>

      <DocsSection title="API">
        <DocsPropsTable
          rows={[
            { name: "className", type: "string", description: "Outer wrapper class." },
          ]}
        />
      </DocsSection>
      <DocsSection title="Chart-type to data-shape match">
        <p className="text-sm text-text-sub-600 max-w-2xl">
          Time-series → line chart. Categorical comparison → bar chart. Composition → stacked bar or donut. Don't force a pie chart on time-series.
        </p>
        <DocsDoDont
          do={{
            preview: (
              <div className="rounded-lg border border-stroke-soft-200 bg-bg-white-0 p-3 w-full max-w-sm">
                <p className="text-xs text-text-sub-600">Order per hari · 7 hari terakhir</p>
                <svg className="w-full h-20" viewBox="0 0 200 80"><polyline fill="none" stroke="var(--dash-purple-500)" strokeWidth="2" points="0,60 30,40 60,50 90,30 120,35 150,20 180,15 200,25" /></svg>
              </div>
            ),
            caption: "Time-series gets a line chart. Trend, peak, dip are all immediately visible.",
          }}
          dont={{
            preview: (
              <div className="rounded-lg border border-stroke-soft-200 bg-bg-white-0 p-3 w-full max-w-sm">
                <p className="text-xs text-text-sub-600">Order per hari · 7 hari terakhir</p>
                <div className="size-20 rounded-full mx-auto" style={{background: "conic-gradient(var(--dash-purple-500) 0 14%, #F75D5F 14% 28%, #38C793 28% 42%, #FFA500 42% 56%, #335CFF 56% 70%, #6E3FF3 70% 86%, #C7D5E9 86% 100%)"}} />
              </div>
            ),
            caption: "Don't pie-chart time-series. Reader can't see Wednesday's dip vs Friday's spike — pie destroys temporal structure.",
          }}
        />
      </DocsSection>

      <DocsSection title="Tooltip on hover">
        <p className="text-sm text-text-sub-600 max-w-2xl">
          Hover over any data point should reveal the exact value + date. Don't make the user squint at gridlines.
        </p>
        <DocsDoDont
          do={{
            preview: (
              <div className="rounded-lg border border-stroke-soft-200 bg-bg-white-0 p-3 w-full max-w-sm relative">
                <p className="text-xs text-text-sub-600">GMV mingguan</p>
                <svg className="w-full h-20" viewBox="0 0 200 80"><polyline fill="none" stroke="var(--dash-purple-500)" strokeWidth="2" points="0,60 30,40 60,50 90,20 120,35 150,30 180,15" /><circle cx="90" cy="20" r="4" fill="var(--dash-purple-500)" /></svg>
                <div className="absolute top-4 left-1/2 -translate-x-1/2 rounded-md bg-static-black text-static-white px-2 py-1 text-[10px]">17 Mei · Rp 102 jt</div>
              </div>
            ),
            caption: "Hover surfaces the date + exact value in a tooltip. Drill-down is one click away.",
          }}
          dont={{
            preview: (
              <div className="rounded-lg border border-stroke-soft-200 bg-bg-white-0 p-3 w-full max-w-sm">
                <p className="text-xs text-text-sub-600">GMV mingguan</p>
                <svg className="w-full h-20" viewBox="0 0 200 80"><polyline fill="none" stroke="var(--dash-purple-500)" strokeWidth="2" points="0,60 30,40 60,50 90,20 120,35 150,30 180,15" /></svg>
                <p className="text-[9px] text-text-soft-400">(hover does nothing)</p>
              </div>
            ),
            caption: "Don't ship charts without tooltips. The reader can see the shape but never the exact value for a given day.",
          }}
        />
      </DocsSection>
        </DocsPageShell>
  )
}
