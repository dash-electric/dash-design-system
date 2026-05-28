"use client"

import { OrdersTable } from "@/registry/dash/blocks/orders-table"
import {
  DocsPageShell,
  DocsHeader,
  DocsSection,
  DocsExample,
  DocsPropsTable,
  DocsDoDont,
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
        <ul className="text-sm text-text-sub-600 space-y-1.5 list-disc pl-6">
          <li>Toolbar — <code>Checkbox</code> (select all) + bulk action <code>Button</code>s + <code>Filter</code> icon button.</li>
          <li>Header row — sortable columns with sort indicators.</li>
          <li>Body rows — <code>Checkbox</code> + dispatch id + mitra <code>Avatar</code> + route + amount + status <code>Badge</code> + assignee + overflow menu.</li>
          <li>Empty / loading states baked in.</li>
        </ul>
      </DocsSection>

      <DocsSection title="When to use">
        <ul className="text-sm text-text-sub-600 space-y-1.5 list-disc pl-6">
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
      <DocsSection title="Bulk action toolbar">
        <p className="text-sm text-text-sub-600 max-w-2xl">
          Once any row is selected, replace the filter toolbar with a bulk-action bar — assign to mitra, cancel, mark fulfilled. Don't keep stale filters visible.
        </p>
        <DocsDoDont
          do={{
            preview: (
              <div className="w-full max-w-md space-y-2">
                <div className="rounded-lg bg-primary-alpha-16 border border-primary-base px-3 py-2 flex items-center justify-between text-xs"><span><span className="font-medium">3 order</span> dipilih</span><div className="flex gap-2"><button className="text-primary-base underline">Assign mitra</button><button className="text-error-base underline">Batalkan</button></div></div>
                <div className="flex items-center gap-2 rounded-lg border border-stroke-soft-200 bg-bg-white-0 px-3 py-2 text-xs"><div className="size-4 rounded-sm bg-primary-base" /><span>Order #2841 · Sayurbox</span></div>
                <div className="flex items-center gap-2 rounded-lg border border-stroke-soft-200 bg-bg-white-0 px-3 py-2 text-xs"><div className="size-4 rounded-sm bg-primary-base" /><span>Order #2842 · Lili</span></div>
              </div>
            ),
            caption: "Selection toolbar takes over the header. Actions match what's selectable: assign, cancel, fulfill — verbs scoped to the rows.",
          }}
          dont={{
            preview: (
              <div className="w-full max-w-md space-y-2">
                <div className="flex items-center justify-between rounded-lg border border-stroke-soft-200 px-3 py-2 text-xs"><div className="flex items-center gap-2"><div className="h-6 rounded border border-stroke-soft-200 w-32 text-[10px] flex items-center px-2 text-text-sub-600">Search…</div><div className="h-6 rounded border border-stroke-soft-200 w-16 text-[10px] flex items-center px-2 text-text-sub-600">Filter</div></div><div className="text-[10px] text-text-soft-400">3 dipilih</div></div>
                <div className="flex items-center gap-2 rounded-lg border border-stroke-soft-200 bg-bg-white-0 px-3 py-2 text-xs"><div className="size-4 rounded-sm bg-primary-base" /><span>Order #2841</span></div>
              </div>
            ),
            caption: "Don't leave the filter toolbar visible when rows are selected. The user can't tell what's possible to do with their selection.",
          }}
        />
      </DocsSection>

      <DocsSection title="Status column placement">
        <p className="text-sm text-text-sub-600 max-w-2xl">
          Status badge sits in its own column, right side, sortable. Don't bury it inside the description column.
        </p>
        <DocsDoDont
          do={{
            preview: (
              <div className="w-full max-w-md space-y-2">
                <div className="grid grid-cols-[1fr_auto_auto] items-center gap-3 rounded-lg border border-stroke-soft-200 bg-bg-white-0 px-3 py-2 text-xs"><span>#2841 · Sayurbox · 12 item</span><span className="rounded-full bg-success-lighter text-success-dark px-2 py-0.5 text-[10px]">Selesai</span><span>Rp 312k</span></div>
                <div className="grid grid-cols-[1fr_auto_auto] items-center gap-3 rounded-lg border border-stroke-soft-200 bg-bg-white-0 px-3 py-2 text-xs"><span>#2842 · Lili · 4 item</span><span className="rounded-full bg-warning-lighter text-warning-dark px-2 py-0.5 text-[10px]">Dispatch</span><span>Rp 84k</span></div>
              </div>
            ),
            caption: "Status is its own scannable column. Ops can column-sort by status, filter on it, scan visually.",
          }}
          dont={{
            preview: (
              <div className="w-full max-w-md space-y-2">
                <div className="rounded-lg border border-stroke-soft-200 bg-bg-white-0 px-3 py-2 text-xs">Order #2841 · Sayurbox · 12 item · <span className="text-success-base">Selesai</span> · Rp 312k</div>
                <div className="rounded-lg border border-stroke-soft-200 bg-bg-white-0 px-3 py-2 text-xs">Order #2842 · Lili · 4 item · <span className="text-warning-base">Dispatch</span> · Rp 84k</div>
              </div>
            ),
            caption: "Don't run the row as one long sentence. Ops loses scan-ability, can't sort by status, and the status word disappears in the prose.",
          }}
        />
      </DocsSection>
        </DocsPageShell>
  )
}
