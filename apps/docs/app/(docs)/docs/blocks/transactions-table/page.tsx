"use client"

import { TransactionsTable } from "@/registry/dash/blocks/transactions-table"
import {
  DocsPageShell,
  DocsHeader,
  DocsSection,
  DocsExample,
  DocsPropsTable,
} from "@/components/docs/page-shell"
import { DocsCode } from "@/components/docs/code-block"

export default function TransactionsTableDocsPage() {
  return (
    <DocsPageShell>
      <DocsHeader
        category="Blocks / Tables"
        title="Transactions Table"
        description="Payout history table — direction arrow, mitra avatar, status badge, amount. Search + filter row baked in. Used as the canonical Dash payout history block."
      />

      <DocsSection title="Install">
        <DocsCode language="bash" code={`dash add transactions-table`} />
      </DocsSection>

      <DocsSection title="Preview">
        <DocsExample
          title="Mitra payout history"
          description="Defaults: 6-row payout log with in/out direction arrows + status badges."
          preview={
            <div className="w-full rounded-xl border border-stroke-soft-200 bg-bg-white-0 p-6">
              <TransactionsTable />
            </div>
          }
          code={`<TransactionsTable rows={[/* TxRow[] */]} />`}
        />
      </DocsSection>

      <DocsSection title="Composition">
        <ul className="text-sm text-text-sub-600 space-y-1.5 list-disc pl-5">
          <li>Toolbar — <code>InputRoot</code> search + <code>Filter</code> button.</li>
          <li>Row — direction <code>ArrowUpRight</code>/<code>ArrowDownRight</code> + <code>Avatar</code> + description + status <code>Badge</code> + signed amount.</li>
          <li>Amount color-coded: in = success, out = soft neutral, failed = error.</li>
          <li>Footer summary row with running balance optional.</li>
        </ul>
      </DocsSection>

      <DocsSection title="When to use">
        <ul className="text-sm text-text-sub-600 space-y-1.5 list-disc pl-5">
          <li><strong>Use</strong> for mitra payout history page.</li>
          <li><strong>Use</strong> inside <code>FinanceDashboard</code> as the "Recent activity" section.</li>
          <li><strong>Use</strong> for any signed-amount ledger (refunds, adjustments, cashback).</li>
          <li><strong>Don't</strong> use for queue-driven ops tables — reach for <code>OrdersTable</code> with bulk select.</li>
          <li><strong>Don't</strong> use for non-monetary data — the direction arrow + amount pattern only makes sense for ledgers.</li>
        </ul>
      </DocsSection>

      <DocsSection title="API">
        <DocsPropsTable
          rows={[
            { name: "rows", type: "TxRow[]", description: "{ id, kind: 'in' | 'out', counterparty, description, amount, status, date }." },
            { name: "className", type: "string", description: "Outer wrapper class." },
          ]}
        />
      </DocsSection>
    </DocsPageShell>
  )
}
