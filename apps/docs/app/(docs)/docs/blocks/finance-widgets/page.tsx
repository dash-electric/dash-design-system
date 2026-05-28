"use client"

import {
  MyCardsWidget,
  RecentTransactionsWidget,
  TotalBalanceWidget,
  QuickTransferWidget,
  BudgetOverviewWidget,
  MySubscriptionsWidget,
} from "@/registry/dash/blocks/finance-widgets"
import {
  DocsPageShell,
  DocsHeader,
  DocsSection,
  DocsExample,
} from "@/components/docs/page-shell"
import { DocsCode } from "@/components/docs/code-block"

export default function FinanceWidgetsDocsPage() {
  return (
    <DocsPageShell>
      <DocsHeader
        category="Blocks / Sector Widgets"
        title="Finance Widgets"
        description="Six self-contained widgets used to compose Finance dashboards — My Cards, Recent Transactions, Total Balance, Quick Transfer, Budget Overview, and My Subscriptions. Each works standalone; all fixtures default to AlignUI Pro Figma data."
      />

      <DocsSection title="Install">
        <DocsCode language="bash" code={`dash add finance-widgets`} />
      </DocsSection>

      <DocsSection title="Examples">
        <DocsExample
          title="Total Balance + My Cards pair"
          preview={
            <div className="grid w-full gap-4 lg:grid-cols-2 rounded-xl border border-stroke-soft-200 bg-bg-white-0 p-6">
              <TotalBalanceWidget />
              <MyCardsWidget />
            </div>
          }
          code={`<TotalBalanceWidget />
<MyCardsWidget />`}
        />

        <DocsExample
          title="Recent Transactions + Quick Transfer"
          preview={
            <div className="grid w-full gap-4 lg:grid-cols-2 rounded-xl border border-stroke-soft-200 bg-bg-white-0 p-6">
              <RecentTransactionsWidget />
              <QuickTransferWidget />
            </div>
          }
          code={`<RecentTransactionsWidget transactions={[/* Transaction[] */]} />
<QuickTransferWidget contacts={[/* Contact[] */]} />`}
        />

        <DocsExample
          title="Budget Overview + My Subscriptions"
          preview={
            <div className="grid w-full gap-4 lg:grid-cols-2 rounded-xl border border-stroke-soft-200 bg-bg-white-0 p-6">
              <BudgetOverviewWidget />
              <MySubscriptionsWidget />
            </div>
          }
          code={`<BudgetOverviewWidget />
<MySubscriptionsWidget subscriptions={[/* Subscription[] */]} />`}
        />
      </DocsSection>

      <DocsSection title="Composition">
        <ul className="text-sm text-text-sub-600 space-y-1.5 list-disc pl-6">
          <li><code>MyCardsWidget</code> — gradient card stack + balance + IBAN + actions row.</li>
          <li><code>RecentTransactionsWidget</code> — compact transactions list with amount + status.</li>
          <li><code>TotalBalanceWidget</code> — hero stat with month-over-month delta + sparkline.</li>
          <li><code>QuickTransferWidget</code> — avatar contact picker + amount + transfer CTA.</li>
          <li><code>BudgetOverviewWidget</code> — per-category bars with planned vs spent.</li>
          <li><code>MySubscriptionsWidget</code> — subscription list with renewal status badges.</li>
        </ul>
      </DocsSection>
    </DocsPageShell>
  )
}
