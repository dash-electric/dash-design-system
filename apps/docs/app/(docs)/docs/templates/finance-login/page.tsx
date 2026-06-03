"use client"

import { FinanceLogin } from "@/registry/dash/templates/finance-login"
import {
  DocsPageShell,
  DocsHeader,
  DocsSection,
  DocsExample,
} from "@/components/docs/page-shell"
import { DocsTemplatePreview } from "@/components/docs/template-preview"
import { DocsCode } from "@/components/docs/code-block"

export default function FinanceLoginDocsPage() {
  return (
    <DocsPageShell>
      <DocsHeader
        category="Templates / Finance"
        title="Finance Login"
        description="Split-screen sign-in template for the Finance vertical. Brand mark + email/password fields + SSO + side illustration."
      />

      <DocsSection title="Install">
        <DocsCode language="bash" code={`dashkit add finance-login`} />
      </DocsSection>

      <DocsSection title="Examples">
        <DocsExample
          bare
          title="Default"
          preview={
            <DocsTemplatePreview>
              <FinanceLogin />
            </DocsTemplatePreview>
          }
          code={`<FinanceLogin />`}
        />
      </DocsSection>

      <DocsSection title="Composition">
        <ul className="text-sm text-text-sub-600 space-y-1.5 list-disc pl-6">
          <li>Left column — <code>BrandMark</code> + form + SSO buttons.</li>
          <li>Right column — illustration / hero panel.</li>
        </ul>
      </DocsSection>
    </DocsPageShell>
  )
}
