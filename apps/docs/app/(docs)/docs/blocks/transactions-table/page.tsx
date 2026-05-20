"use client"

import { TransactionsTable } from "@/registry/dash/blocks/transactions-table"
import {
  DocsPageShell,
  DocsHeader,
  DocsSection,
  DocsExample,
  DocsPropsTable,
  DocsDoDont,
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
      <DocsSection title="Signed amount color coding">
        <p className="text-sm text-text-sub-600 max-w-2xl">
          Inflow = success green. Outflow = neutral soft. Failed/refunded = error. Use color as redundant cue alongside the +/- arrow — never as the only signal.
        </p>
        <DocsDoDont
          do={{
            preview: (
              <div className="w-full max-w-md space-y-2">
                <div className="flex items-center justify-between rounded-lg border border-stroke-soft-200 bg-bg-white-0 px-3 py-2 text-xs"><span>Payout · Kopi Kenangan</span><span className="text-success-base font-medium">+ Rp 4.500.000</span></div>
                <div className="flex items-center justify-between rounded-lg border border-stroke-soft-200 bg-bg-white-0 px-3 py-2 text-xs"><span>Topup saldo mitra</span><span className="text-text-sub-600 font-medium">− Rp 250.000</span></div>
                <div className="flex items-center justify-between rounded-lg border border-stroke-soft-200 bg-bg-white-0 px-3 py-2 text-xs"><span>Refund · order #2841</span><span className="text-error-base font-medium">− Rp 75.000</span></div>
              </div>
            ),
            caption: "Green for in, neutral for out, red for refund/failed. Sign and color reinforce each other.",
          }}
          dont={{
            preview: (
              <div className="w-full max-w-md space-y-2">
                <div className="flex items-center justify-between rounded-lg border border-stroke-soft-200 bg-bg-white-0 px-3 py-2 text-xs"><span>Payout · Kopi Kenangan</span><span className="font-medium">Rp 4.500.000</span></div>
                <div className="flex items-center justify-between rounded-lg border border-stroke-soft-200 bg-bg-white-0 px-3 py-2 text-xs"><span>Topup saldo mitra</span><span className="font-medium">Rp 250.000</span></div>
                <div className="flex items-center justify-between rounded-lg border border-stroke-soft-200 bg-bg-white-0 px-3 py-2 text-xs"><span>Refund · order #2841</span><span className="font-medium">Rp 75.000</span></div>
              </div>
            ),
            caption: "Don't display amounts without sign or color. Ops team scanning a ledger can't tell which way money flowed.",
          }}
        />
      </DocsSection>

      <DocsSection title="Status badge tone">
        <p className="text-sm text-text-sub-600 max-w-2xl">
          Pending = warning. Success = success. Failed = error. Match status badge tone to the same semantic palette as the amount color.
        </p>
        <DocsDoDont
          do={{
            preview: (
              <div className="w-full max-w-md space-y-2">
                <div className="flex items-center justify-between rounded-lg border border-stroke-soft-200 bg-bg-white-0 px-3 py-2 text-xs"><span>Payout #4021</span><span className="rounded-full bg-success-lighter text-success-dark px-2 py-0.5 text-[10px] font-medium">Berhasil</span></div>
                <div className="flex items-center justify-between rounded-lg border border-stroke-soft-200 bg-bg-white-0 px-3 py-2 text-xs"><span>Payout #4022</span><span className="rounded-full bg-warning-lighter text-warning-dark px-2 py-0.5 text-[10px] font-medium">Diproses</span></div>
                <div className="flex items-center justify-between rounded-lg border border-stroke-soft-200 bg-bg-white-0 px-3 py-2 text-xs"><span>Payout #4023</span><span className="rounded-full bg-error-lighter text-error-dark px-2 py-0.5 text-[10px] font-medium">Gagal</span></div>
              </div>
            ),
            caption: "Each status maps to a state token: success/warning/error. Consistent across every Dash table.",
          }}
          dont={{
            preview: (
              <div className="w-full max-w-md space-y-2">
                <div className="flex items-center justify-between rounded-lg border border-stroke-soft-200 bg-bg-white-0 px-3 py-2 text-xs"><span>Payout #4021</span><span className="rounded-full bg-primary-base text-static-white px-2 py-0.5 text-[10px] font-medium">Berhasil</span></div>
                <div className="flex items-center justify-between rounded-lg border border-stroke-soft-200 bg-bg-white-0 px-3 py-2 text-xs"><span>Payout #4022</span><span className="rounded-full bg-feature-base text-static-white px-2 py-0.5 text-[10px] font-medium">Diproses</span></div>
                <div className="flex items-center justify-between rounded-lg border border-stroke-soft-200 bg-bg-white-0 px-3 py-2 text-xs"><span>Payout #4023</span><span className="rounded-full bg-highlighted-base text-static-white px-2 py-0.5 text-[10px] font-medium">Gagal</span></div>
              </div>
            ),
            caption: "Don't paint status badges in arbitrary brand colors. Purple-as-success breaks the state semantic vocabulary across the system.",
          }}
        />
      </DocsSection>
        </DocsPageShell>
  )
}
