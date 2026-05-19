"use client"

import { MyCardsStack } from "@/registry/dash/blocks/my-cards-stack"
import {
  DocsPageShell,
  DocsHeader,
  DocsSection,
  DocsExample,
  DocsPropsTable,
} from "@/components/docs/page-shell"
import { DocsCode } from "@/components/docs/code-block"

export default function MyCardsStackDocsPage() {
  return (
    <DocsPageShell>
      <DocsHeader
        category="Blocks / Finance"
        title="My Cards Stack"
        description="Stacked credit-card-style visualization for mitra payout balances + linked bank accounts. Toggle mask on card number, swap brand themes per tribe."
      />

      <DocsSection title="Install">
        <DocsCode language="bash" code={`dash add my-cards-stack`} />
      </DocsSection>

      <DocsSection title="Preview">
        <DocsExample
          title="Mitra wallet — 2 cards"
          description="Defaults: BCA payout card + Dash internal cashback card."
          preview={
            <div className="w-full rounded-xl border border-stroke-soft-200 bg-bg-white-0 p-6">
              <MyCardsStack />
            </div>
          }
          code={`<MyCardsStack cards={[
  { id: "bca-9412", brand: "BCA", last4: "9412", balance: 2_485_000, kind: "payout" },
  { id: "dash-int", brand: "Dash", last4: "0001", balance: 145_000, kind: "cashback" },
]} />`}
        />
      </DocsSection>

      <DocsSection title="Composition">
        <ul className="text-sm text-text-sub-600 space-y-1.5 list-disc pl-5">
          <li>Each card uses gradient + brand color + last-4 digit display.</li>
          <li><code>Eye / EyeOff</code> icon toggles balance/card-number masking.</li>
          <li>Bottom <code>Badge</code> + <code>Button</code> row for kind label + top-up CTA.</li>
          <li>Stack uses CSS translate to overlap cards — first card visible, others peek.</li>
        </ul>
      </DocsSection>

      <DocsSection title="When to use">
        <ul className="text-sm text-text-sub-600 space-y-1.5 list-disc pl-5">
          <li><strong>Use</strong> on the mitra finance landing — pair with <code>FinanceDashboard</code> template.</li>
          <li><strong>Use</strong> for "Wallet" tab in any settings hub.</li>
          <li><strong>Don't</strong> use for full transaction history — that's <code>TransactionsTable</code>.</li>
          <li><strong>Don't</strong> use for receipt/invoice display — different visual idiom.</li>
        </ul>
      </DocsSection>

      <DocsSection title="API">
        <DocsPropsTable
          rows={[
            { name: "cards", type: "PayoutCard[]", description: "{ id, brand, last4, balance, kind: 'payout' | 'cashback' | 'savings' }." },
            { name: "className", type: "string", description: "Outer wrapper class." },
          ]}
        />
      </DocsSection>
    </DocsPageShell>
  )
}
