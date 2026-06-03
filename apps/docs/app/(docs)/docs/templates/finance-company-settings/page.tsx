"use client"

import { FinanceCompanySettings } from "@/registry/dash/templates/finance-company-settings"
import {
  DocsPageShell,
  DocsHeader,
  DocsSection,
  DocsExample,
} from "@/components/docs/page-shell"
import { DocsTemplatePreview } from "@/components/docs/template-preview"
import { DocsCode } from "@/components/docs/code-block"

export default function FinanceCompanySettingsDocsPage() {
  return (
    <DocsPageShell>
      <DocsHeader
        category="Templates / Finance & Banking"
        title="Company Settings"
        description="Settings shell + Logo / Legal Name / Tax ID / Email / Phone / Address / Web Links field rows. Ported from AlignUI Pro Figma frame 'Company Settings [Finance & Banking]'."
      />
      <DocsSection title="Install">
        <DocsCode language="bash" code={`dashkit add finance-company-settings`} />
      </DocsSection>
      <DocsSection title="Examples">
        <DocsExample
          bare
          title="Apex — default"
          preview={
            <DocsTemplatePreview padding="p-6">
              <FinanceCompanySettings />
            </DocsTemplatePreview>
          }
          code={`<FinanceCompanySettings />`}
        />
      </DocsSection>
    </DocsPageShell>
  )
}
