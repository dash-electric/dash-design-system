"use client"

import { FinanceSendRecipient } from "@/registry/dash/templates/finance-send-recipient"
import {
  DocsPageShell,
  DocsHeader,
  DocsSection,
  DocsExample,
} from "@/components/docs/page-shell"
import { DocsTemplatePreview } from "@/components/docs/template-preview"
import { DocsCode } from "@/components/docs/code-block"

export default function FinanceSendRecipientDocsPage() {
  return (
    <DocsPageShell>
      <DocsHeader
        category="Templates / Finance"
        title="Finance Send · Recipient"
        description="Step 1 of the transfer sequence — pick a saved recipient or add a new one. Pairs with Amount → Method → Confirm steps."
      />

      <DocsSection title="Install">
        <DocsCode language="bash" code={`dash add finance-send-recipient`} />
      </DocsSection>

      <DocsSection title="Examples">
        <DocsExample
          bare
          title="Default"
          preview={
            <DocsTemplatePreview>
              <FinanceSendRecipient />
            </DocsTemplatePreview>
          }
          code={`<FinanceSendRecipient />`}
        />
      </DocsSection>

      <DocsSection title="Composition">
        <ul className="text-sm text-text-sub-600 space-y-1.5 list-disc pl-5">
          <li>Transfer step rail (recipient → amount → method → confirm).</li>
          <li>Saved-recipients <code>Avatar</code> row + 'New Recipient' affordance.</li>
        </ul>
      </DocsSection>
    </DocsPageShell>
  )
}
