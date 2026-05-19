"use client"

import { Phase7ResultsPage } from "@/registry/dash/templates/phase7-results-page"
import {
  DocsPageShell,
  DocsHeader,
  DocsSection,
  DocsExample,
  DocsPropsTable,
} from "@/components/docs/page-shell"
import { DocsTemplatePreview } from "@/components/docs/template-preview"
import { DocsCode } from "@/components/docs/code-block"

export default function Phase7ResultsDocsPage() {
  return (
    <DocsPageShell>
      <DocsHeader
        category="Templates / Dash Custom"
        title="Phase 7 Results Dashboard"
        description="Analytics-heavy dashboard for the PT Box phase7 results page. KPI grid header + equity curve + per-session breakdown + pain metrics — designed for traders auditing iteration quality, not casual viewers."
      />

      <DocsSection title="Install">
        <DocsCode language="bash" code={`dash add phase7-results`} />
      </DocsSection>

      <DocsSection title="Examples">
        <DocsExample
          bare
          title="Phase 51 HYBRID per-session"
          description="Default render — current PT Box live config. Total +$2,157/yr across Asia (90min PB), London (30min BO_strong), NY (90min PB)."
          preview={
            <DocsTemplatePreview padding="p-6">
              <Phase7ResultsPage />
            </DocsTemplatePreview>
          }
          code={`<Phase7ResultsPage
  iteration="Phase 51 · HYBRID per-session"
  totalPnl={2157}
  totalTrades={126}
  totalWinRate={42.8}
  totalExpectancy={0.41}
  maxDrawdown={-480}
  worstDay={-116}
  sessions={[/* per-session rows */]}
  equity={[/* weekly snapshots */]}
/>`}
        />
      </DocsSection>

      <DocsSection
        title="Composition"
        description="Recharts AreaChart + @dash Card/Stat/Badge composition. No hidden state — fully driven by props."
      >
        <ul className="text-sm text-text-sub-600 space-y-1.5 list-disc pl-5">
          <li><strong>Hero</strong> — iteration label, holdout-passed badge, iron-law status, last-validated timestamp.</li>
          <li><strong>KPI grid</strong> — 6 <code>Stat</code> tiles (Total PnL, Trades, Win rate, Expectancy R, Max DD, Worst day).</li>
          <li><strong>Equity curve</strong> — <code>AreaChart</code> with gradient fill and zero <code>ReferenceLine</code>.</li>
          <li><strong>Per-session table</strong> — Asia / London / NY rows with totals row pinned at bottom.</li>
          <li><strong>Pain metrics</strong> — worst day + days &gt; $50 loss / win frequency split.</li>
        </ul>
      </DocsSection>

      <DocsSection title="When to use">
        <ul className="text-sm text-text-sub-600 space-y-1.5 list-disc pl-5">
          <li><strong>Use</strong> for PT Box iteration result publishing (internal-only, not user-facing).</li>
          <li><strong>Use</strong> as a reference for any backtest/experiment result page — A/B test, ML eval, growth experiment.</li>
          <li><strong>Use</strong> when "trust the math" matters more than aesthetics — pain metrics are emphasized on purpose.</li>
          <li><strong>Don't</strong> use for live trading screens — those need real-time WebSocket primitives.</li>
          <li><strong>Don't</strong> use for marketing dashboards — reach for <code>MarketingDashboard</code> which has attribution + funnel.</li>
        </ul>
      </DocsSection>

      <DocsSection title="API">
        <DocsPropsTable
          rows={[
            { name: "iteration", type: "string", description: 'Iteration label e.g. "Phase 51 · HYBRID".' },
            { name: "totalPnl", type: "number", description: "Cumulative points." },
            { name: "totalTrades", type: "number", description: "Trade count." },
            { name: "totalWinRate", type: "number", description: "Win rate %." },
            { name: "totalExpectancy", type: "number", description: "Expectancy in R-multiples." },
            { name: "maxDrawdown", type: "number", description: "Max drawdown in pts (negative)." },
            { name: "worstDay", type: "number", description: "Worst single-day pts (negative)." },
            { name: "sessions", type: "SessionRow[]", description: "Per-session breakdown rows." },
            { name: "equity", type: "EquityPoint[]", description: "Weekly equity snapshots powering the area chart." },
          ]}
        />
      </DocsSection>
    </DocsPageShell>
  )
}
