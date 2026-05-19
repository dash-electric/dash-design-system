"use client"

import { AnalyticsGrid } from "@/registry/dash/blocks/analytics-grid"
import {
  DocsPageShell,
  DocsHeader,
  DocsSection,
  DocsExample,
  DocsPropsTable,
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
        <ul className="text-sm text-text-sub-600 space-y-1.5 list-disc pl-5">
          <li>Top row — 3 <code>Card</code> + <code>Stat</code> KPI tiles with trend indicators.</li>
          <li>Bottom row — recharts <code>AreaChart</code> (dispatch trend) + <code>BarChart</code> (tribe split).</li>
          <li>Recharts <code>ChartConfig</code> typed and themed via Dash CSS variables.</li>
          <li>Wire to live aggregates by composing in your own data hooks at the wrapper level.</li>
        </ul>
      </DocsSection>

      <DocsSection title="When to use">
        <ul className="text-sm text-text-sub-600 space-y-1.5 list-disc pl-5">
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
    </DocsPageShell>
  )
}
