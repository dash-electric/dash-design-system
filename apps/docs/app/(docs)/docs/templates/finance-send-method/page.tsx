"use client"

import { FinanceSendMethod } from "@/registry/dash/templates/finance-send-method"
import {
  DocsPageShell,
  DocsHeader,
  DocsSection,
  DocsExample,
} from "@/components/docs/page-shell"
import { DocsTemplatePreview } from "@/components/docs/template-preview"
import { DocsCode } from "@/components/docs/code-block"

export default function FinanceSendMethodDocsPage() {
  return (
    <DocsPageShell>
      <DocsHeader
        category="Templates / Finance"
        title="Finance Send · Method"
        description="Step 3 of the transfer sequence — pick the delivery method (Instant / Standard / Wire) with fee + ETA per row."
      />

      <DocsSection title="Install">
        <DocsCode language="bash" code={`dashkit add finance-send-method`} />
      </DocsSection>

      <DocsSection title="Examples">
        <DocsExample
          bare
          title="Default"
          preview={
            <DocsTemplatePreview>
              <FinanceSendMethod />
            </DocsTemplatePreview>
          }
          code={`<FinanceSendMethod />`}
        />
      </DocsSection>

      <DocsSection title="Composition">
        <ul className="text-sm text-text-sub-600 space-y-1.5 list-disc pl-6">
          <li>Transfer step rail + method <code>Radio</code> group.</li>
          <li>Per row — title + ETA + fee + selected badge.</li>
        </ul>
      </DocsSection>
    </DocsPageShell>
  )
}
