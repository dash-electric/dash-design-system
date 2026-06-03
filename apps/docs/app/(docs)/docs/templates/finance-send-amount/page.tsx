"use client"

import { FinanceSendAmount } from "@/registry/dash/templates/finance-send-amount"
import {
  DocsPageShell,
  DocsHeader,
  DocsSection,
  DocsExample,
} from "@/components/docs/page-shell"
import { DocsTemplatePreview } from "@/components/docs/template-preview"
import { DocsCode } from "@/components/docs/code-block"

export default function FinanceSendAmountDocsPage() {
  return (
    <DocsPageShell>
      <DocsHeader
        category="Templates / Finance"
        title="Finance Send · Amount"
        description="Step 2 of the transfer sequence — pick the amount, source account, and review fees before continuing to method selection."
      />

      <DocsSection title="Install">
        <DocsCode language="bash" code={`dashkit add finance-send-amount`} />
      </DocsSection>

      <DocsSection title="Examples">
        <DocsExample
          bare
          title="Default"
          preview={
            <DocsTemplatePreview>
              <FinanceSendAmount />
            </DocsTemplatePreview>
          }
          code={`<FinanceSendAmount />`}
        />
      </DocsSection>

      <DocsSection title="Composition">
        <ul className="text-sm text-text-sub-600 space-y-1.5 list-disc pl-6">
          <li>Transfer step rail (recipient → amount → method → confirm).</li>
          <li>Amount input + source-account picker + fee summary.</li>
        </ul>
      </DocsSection>
    </DocsPageShell>
  )
}
