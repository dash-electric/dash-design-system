"use client"

import { MyCardsStack } from "@/registry/dash/blocks/my-cards-stack"
import {
  DocsPageShell,
  DocsHeader,
  DocsSection,
  DocsExample,
  DocsPropsTable,
  DocsDoDont,
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
      <DocsSection title="Card visual fidelity">
        <p className="text-sm text-text-sub-600 max-w-2xl">
          Card preview should look like a physical card — issuer logo top-right, last-4 bottom-left, chip + brand mark visible. Don't render a flat rectangle with text.
        </p>
        <DocsDoDont
          do={{
            preview: (
              <div className="w-64 aspect-[1.586/1] rounded-xl bg-[linear-gradient(135deg,#7C4FC4,#5A3596)] text-static-white p-4 flex flex-col justify-between">
                <div className="flex items-start justify-between"><div className="size-6 rounded bg-static-white/30" /><span className="text-[10px] font-medium">VISA</span></div>
                <div className="space-y-1"><p className="font-mono text-sm tracking-widest">•••• 4218</p><p className="text-[10px] opacity-80">BUDI ADITYA</p></div>
              </div>
            ),
            caption: "Gradient surface, chip mark, network badge, last-4, cardholder. Reader recognizes it instantly as their Dash card.",
          }}
          dont={{
            preview: (
              <div className="w-64 aspect-[1.586/1] rounded-xl border border-stroke-soft-200 bg-bg-white-0 p-4 flex items-center justify-center">
                <p className="text-xs text-text-sub-600">Card ending 4218</p>
              </div>
            ),
            caption: "Don't render the card as a plain text label. The visual is the value — instant pattern recognition.",
          }}
        />
      </DocsSection>

      <DocsSection title="Stack depth + active state">
        <p className="text-sm text-text-sub-600 max-w-2xl">
          When multiple cards stack, fan them slightly and highlight the active one. Don't list cards vertically — that loses the wallet metaphor.
        </p>
        <DocsDoDont
          do={{
            preview: (
              <div className="relative w-64 h-40">
                <div className="absolute inset-x-0 top-8 h-32 rounded-xl bg-[linear-gradient(135deg,#7C4FC4,#5A3596)] shadow-md" />
                <div className="absolute inset-x-2 top-4 h-32 rounded-xl bg-[linear-gradient(135deg,#FF6B9D,#C7457D)] shadow-md" />
                <div className="absolute inset-x-4 top-0 h-32 rounded-xl bg-[linear-gradient(135deg,#335CFF,#1E3FB5)] shadow-lg ring-2 ring-primary-base" />
              </div>
            ),
            caption: "Stack fans out, active card is closest to the user with a ring. Wallet metaphor intact.",
          }}
          dont={{
            preview: (
              <div className="w-64 space-y-2">
                <div className="h-12 rounded-lg border border-stroke-soft-200 bg-bg-white-0 px-3 flex items-center text-xs">Visa •••• 4218</div>
                <div className="h-12 rounded-lg border border-stroke-soft-200 bg-bg-white-0 px-3 flex items-center text-xs">Mastercard •••• 7733</div>
                <div className="h-12 rounded-lg border border-stroke-soft-200 bg-bg-white-0 px-3 flex items-center text-xs">Amex •••• 1004</div>
              </div>
            ),
            caption: "Don't list cards as rows. The block is called 'cards stack' for a reason — vertical rows are a settings list, not a wallet.",
          }}
        />
      </DocsSection>
        </DocsPageShell>
  )
}
