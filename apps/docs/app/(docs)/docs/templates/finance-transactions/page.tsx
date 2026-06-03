"use client"

import { FinanceTransactions } from "@/registry/dash/templates/finance-transactions"
import {
  DocsPageShell,
  DocsHeader,
  DocsSection,
  DocsExample,
} from "@/components/docs/page-shell"
import { DocsTemplatePreview } from "@/components/docs/template-preview"
import { DocsCode } from "@/components/docs/code-block"

export default function FinanceTransactionsDocsPage() {
  return (
    <DocsPageShell>
      <DocsHeader
        category="Templates / Finance"
        title="Finance Transactions"
        description="Full-page transactions log — filterable, searchable, with status pills + sticky totals header. Pairs with the Finance dashboard shell."
      />

      <DocsSection title="Install">
        <DocsCode language="bash" code={`dashkit add finance-transactions`} />
      </DocsSection>

      <DocsSection title="Examples">
        <DocsExample
          bare
          title="Default"
          preview={
            <DocsTemplatePreview>
              <FinanceTransactions />
            </DocsTemplatePreview>
          }
          code={`<FinanceTransactions
  rows={[/* FinanceTxRow[] */]}
/>`}
        />
      </DocsSection>

      <DocsSection title="Composition">
        <ul className="text-sm text-text-sub-600 space-y-1.5 list-disc pl-6">
          <li>Page header + summary stat row.</li>
          <li>Transactions <code>DataTable</code> with merchant + amount + status + date columns.</li>
          <li>Filter + search + export controls in the toolbar.</li>
        </ul>
      </DocsSection>
    </DocsPageShell>
  )
}
