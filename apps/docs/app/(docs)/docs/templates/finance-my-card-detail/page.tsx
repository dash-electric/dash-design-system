"use client"

import { FinanceMyCardDetail } from "@/registry/dash/templates/finance-my-card-detail"
import {
  DocsPageShell,
  DocsHeader,
  DocsSection,
  DocsExample,
  DocsPropsTable,
} from "@/components/docs/page-shell"
import { DocsTemplatePreview } from "@/components/docs/template-preview"
import { DocsCode } from "@/components/docs/code-block"

export default function FinanceMyCardDetailDocsPage() {
  return (
    <DocsPageShell>
      <DocsHeader
        category="Templates / Finance & Banking"
        title="My Card Detail"
        description="2-column card preview + info panel (Card Number / Expiry / CVC / Spending Limit) + Unhide / Adjust Limit / More action row + Recent Transactions list. Ported from AlignUI Pro Figma frame 'My Card Detail [Finance & Banking]'."
      />
      <DocsSection title="Install">
        <DocsCode language="bash" code={`dash add finance-my-card-detail`} />
      </DocsSection>
      <DocsSection title="Examples">
        <DocsExample
          bare
          title="Apex — Savings card"
          preview={
            <DocsTemplatePreview padding="p-6">
              <FinanceMyCardDetail />
            </DocsTemplatePreview>
          }
          code={`<FinanceMyCardDetail />`}
        />
      </DocsSection>
      <DocsSection title="API">
        <DocsPropsTable
          rows={[
            { name: "cardLabel", type: "string", defaultValue: '"Savings Card"', description: "Card display name." },
            { name: "balance", type: "number", defaultValue: "16058.94", description: "Current card balance (USD)." },
            { name: "cardLast4", type: "string", defaultValue: '"1234"', description: "Last 4 digits of the card." },
            { name: "expiry", type: "string", defaultValue: '"06/27"', description: "Expiry MM/YY." },
            { name: "spendingLimit", type: "number", defaultValue: "12000", description: "Monthly spending cap." },
            { name: "transactions", type: "MyCardTransaction[]", description: "Recent transactions — { id, title, subtitle, amount, date, direction }." },
          ]}
        />
      </DocsSection>
    </DocsPageShell>
  )
}
