"use client"

import { OrdersTable } from "@/registry/dash/blocks/orders-table"
import {
  DocsPageShell,
  DocsHeader,
  DocsSection,
  DocsExample,
  DocsPropsTable,
} from "@/components/docs/page-shell"
import { DocsCode } from "@/components/docs/code-block"

export default function OrdersTableDocsPage() {
  return (
    <DocsPageShell>
      <DocsHeader
        category="Blocks / Tables"
        title="Orders Table"
        description="Dispatch-log table — row select + bulk actions + status badge + assignee. Reskinned for Tribe-Express dispatch queue context but works for any ops queue."
      />

      <DocsSection title="Install">
        <DocsCode language="bash" code={`dash add orders-table`} />
      </DocsSection>

      <DocsSection title="Preview">
        <DocsExample
          title="Dispatch log — Tribe-Express"
          description="Default 8-row Express dispatch queue. Bulk actions (Email / Delete) appear in toolbar when rows selected."
          preview={
            <div className="w-full rounded-xl border border-stroke-soft-200 bg-bg-white-0 p-6">
              <OrdersTable />
            </div>
          }
          code={`<OrdersTable rows={[/* OrderRow[] */]} />`}
        />
      </DocsSection>

      <DocsSection title="Composition">
        <ul className="text-sm text-text-sub-600 space-y-1.5 list-disc pl-5">
          <li>Toolbar — <code>Checkbox</code> (select all) + bulk action <code>Button</code>s + <code>Filter</code> icon button.</li>
          <li>Header row — sortable columns with sort indicators.</li>
          <li>Body rows — <code>Checkbox</code> + dispatch id + mitra <code>Avatar</code> + route + amount + status <code>Badge</code> + assignee + overflow menu.</li>
          <li>Empty / loading states baked in.</li>
        </ul>
      </DocsSection>

      <DocsSection title="When to use">
        <ul className="text-sm text-text-sub-600 space-y-1.5 list-disc pl-5">
          <li><strong>Use</strong> for any queue-style table where bulk operations are common.</li>
          <li><strong>Use</strong> for dispatch log, payout log, ticket inbox.</li>
          <li><strong>Use</strong> when assignee + status badge are both needed per row.</li>
          <li><strong>Don't</strong> use for transaction history with totals — reach for <code>TransactionsTable</code> which has search + summary.</li>
          <li><strong>Don't</strong> use for read-only data — overhead of select column isn't worth it.</li>
        </ul>
      </DocsSection>

      <DocsSection title="API">
        <DocsPropsTable
          rows={[
            { name: "rows", type: "OrderRow[]", description: "{ id, customer, email, type, status, amount, date }." },
            { name: "className", type: "string", description: "Outer wrapper class." },
          ]}
        />
      </DocsSection>
    </DocsPageShell>
  )
}
