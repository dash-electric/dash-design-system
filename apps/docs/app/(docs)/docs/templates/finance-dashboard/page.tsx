"use client"

import { FinanceDashboard } from "@/registry/dash/templates/finance-dashboard"
import {
  DocsPageShell,
  DocsHeader,
  DocsSection,
  DocsExample,
  DocsPropsTable,
  DocsDoDont,
} from "@/components/docs/page-shell"
import { DocsTemplatePreview } from "@/components/docs/template-preview"
import { DocsCode } from "@/components/docs/code-block"

export default function FinanceDashboardDocsPage() {
  return (
    <DocsPageShell>
      <DocsHeader
        category="Templates / Finance & Banking"
        title="Finance Dashboard"
        description="Banking-style dashboard ported from AlignUI Pro Figma frame 'Dashboard [Finance & Banking]'. Composes My Cards + Recent Transactions + Budget Overview chart + Spending Summary + Exchange widget."
      />

      <DocsSection title="Install">
        <DocsCode language="bash" code={`dashkit add finance-dashboard`} />
      </DocsSection>

      <DocsSection
        title="Examples"
        description="Defaults render the Figma 'Arthur Taylor / Apex' demo data. Override any prop to wire it to live data."
      >
        <DocsExample
          bare
          title="Apex Financial — default"
          description="Mirrors the Figma frame: Savings Card with $16,058.94, $1,800 spent of $2,000 weekly cap, 3 recent transactions, USD→EUR exchange."
          preview={
            <DocsTemplatePreview padding="p-6">
              <FinanceDashboard />
            </DocsTemplatePreview>
          }
          code={`<FinanceDashboard />`}
        />

        <DocsExample
          bare
          title="Higher balance, EUR base"
          description="Override balance + exchange config for a EUR-base customer."
          preview={
            <DocsTemplatePreview padding="p-6">
              <FinanceDashboard
                userName="Sophia Williams"
                cardLabel="Premium Card"
                cardBalance={42_180.55}
                income={148_000}
                expenses={36_200}
                spendThisWeek={1_240}
                weeklyCap={1_800}
              />
            </DocsTemplatePreview>
          }
          code={`<FinanceDashboard
  userName="Sophia Williams"
  cardLabel="Premium Card"
  cardBalance={42_180.55}
  income={148_000}
  expenses={36_200}
  spendThisWeek={1_240}
  weeklyCap={1_800}
/>`}
        />
      </DocsSection>

      <DocsSection
        title="Composition"
        description="A 3-column dashboard composed entirely from @dash primitives."
      >
        <ul className="text-sm text-text-sub-600 space-y-1.5 list-disc pl-6">
          <li>Col 1 — My Cards: gradient virtual card preview with mask toggle (Eye/EyeOff) + Adjust Limit + More. Below: Recent Transactions list.</li>
          <li>Col 2 — Budget Overview: <code>Stat</code> tiles for Income / Expenses / Scheduled with deltas + lightweight 12-month stacked bar ghost.</li>
          <li>Col 3 — Spending Summary: <code>Stat</code> + <code>ProgressBar</code> + per-category list bound to weekly cap. Below: Exchange widget with USD→EUR rate, tax/fee breakdown, Exchange CTA.</li>
          <li>Footer strip — <code>Avatar</code> identity row mirroring the Figma sidebar footer.</li>
        </ul>
      </DocsSection>

      <DocsSection title="When to use">
        <ul className="text-sm text-text-sub-600 space-y-1.5 list-disc pl-6">
          <li><strong>Use</strong> as the landing page for a personal/SMB banking product.</li>
          <li><strong>Use</strong> as the "Finance" tab inside a consolidated workspace.</li>
          <li><strong>Don&apos;t</strong> use for ops-level financial reconciliation — reach for a dense table template instead (see <code>finance-transactions</code>).</li>
        </ul>
      </DocsSection>

      <DocsSection title="API">
        <DocsPropsTable
          rows={[
            { name: "userName", type: "string", defaultValue: '"Arthur Taylor"', description: "Greeting + sidebar footer name." },
            { name: "cardBalance", type: "number", defaultValue: "16_058.94", description: "Featured card balance in USD." },
            { name: "cardNumberLast4", type: "string", defaultValue: '"1234"', description: "Last 4 digits of the masked card." },
            { name: "spendingLimit", type: "number", defaultValue: "12_000", description: "Card spending limit shown under preview." },
            { name: "income", type: "number", defaultValue: "96_000", description: "Budget Overview — annual income." },
            { name: "expenses", type: "number", defaultValue: "24_000", description: "Budget Overview — annual expenses." },
            { name: "scheduled", type: "number", defaultValue: "14_000", description: "Budget Overview — scheduled outflows." },
            { name: "spendThisWeek", type: "number", defaultValue: "1_800", description: "Spending Summary — current week spend." },
            { name: "weeklyCap", type: "number", defaultValue: "2_000", description: "Spending Summary — weekly cap (drives gauge)." },
            { name: "spendCategories", type: "FinanceSpendCategory[]", description: "Per-category split shown under the gauge." },
            { name: "transactions", type: "FinanceTransaction[]", description: "Recent transactions list (3-row default)." },
            { name: "exchangeFrom / exchangeTo", type: "string", defaultValue: '"USD" / "EUR"', description: "Currency pair shown in the Exchange widget." },
            { name: "exchangeAmount", type: "number", defaultValue: "100", description: "Amount being exchanged." },
            { name: "exchangeRate", type: "number", defaultValue: "0.94", description: "From→To conversion rate." },
          ]}
        />
      </DocsSection>
      <DocsSection title="Money-first KPI bar">
        <p className="text-sm text-text-sub-600 max-w-2xl">
          Finance dashboard leads with the cash KPIs: balance, payout-due, gross volume. Don't lead with vanity counters like 'total transactions'.
        </p>
        <DocsDoDont
          do={{
            preview: (
              <div className="w-full max-w-md grid grid-cols-3 gap-2">
                <div className="rounded-lg border border-stroke-soft-200 bg-bg-white-0 p-2"><p className="text-[10px] text-text-sub-600">Saldo</p><p className="text-base font-semibold">Rp 184 jt</p></div>
                <div className="rounded-lg border border-stroke-soft-200 bg-bg-white-0 p-2"><p className="text-[10px] text-text-sub-600">Payout pending</p><p className="text-base font-semibold">Rp 42 jt</p></div>
                <div className="rounded-lg border border-stroke-soft-200 bg-bg-white-0 p-2"><p className="text-[10px] text-text-sub-600">GMV bulan ini</p><p className="text-base font-semibold">Rp 1,2 M</p></div>
              </div>
            ),
            caption: "Three cash-flow KPIs anchor the page. Reader sees position in 3 seconds.",
          }}
          dont={{
            preview: (
              <div className="w-full max-w-md grid grid-cols-3 gap-2">
                <div className="rounded-lg border border-stroke-soft-200 bg-bg-white-0 p-2"><p className="text-[10px] text-text-sub-600">Total trx</p><p className="text-base font-semibold">12.482</p></div>
                <div className="rounded-lg border border-stroke-soft-200 bg-bg-white-0 p-2"><p className="text-[10px] text-text-sub-600">Active users</p><p className="text-base font-semibold">734</p></div>
                <div className="rounded-lg border border-stroke-soft-200 bg-bg-white-0 p-2"><p className="text-[10px] text-text-sub-600">Login count</p><p className="text-base font-semibold">2.412</p></div>
              </div>
            ),
            caption: "Don't lead a finance dashboard with vanity counts. Money-makers don't open the page to check login count.",
          }}
        />
      </DocsSection>

      <DocsSection title="Currency formatting">
        <p className="text-sm text-text-sub-600 max-w-2xl">
          Indonesian rupiah uses dot thousands separator and 'Rp' prefix. Don't mix locale formats inside one dashboard.
        </p>
        <DocsDoDont
          do={{
            preview: (
              <div className="space-y-1 text-xs"><p>Saldo: <span className="font-semibold">Rp 184.250.000</span></p><p>Payout: <span className="font-semibold">Rp 42.500.000</span></p><p>Margin: <span className="font-semibold">12,4%</span></p></div>
            ),
            caption: "Rp prefix, dot thousands, comma decimal — consistent Indonesian locale across every number on the page.",
          }}
          dont={{
            preview: (
              <div className="space-y-1 text-xs"><p>Balance: <span className="font-semibold">IDR 184,250,000</span></p><p>Payout: <span className="font-semibold">Rp184.250.000</span></p><p>Margin: <span className="font-semibold">12.4%</span></p></div>
            ),
            caption: "Don't mix 'IDR', 'Rp', no-space, comma-thousand, period-decimal. Looks like a system that doesn't know its own locale.",
          }}
        />
      </DocsSection>
        </DocsPageShell>
  )
}
