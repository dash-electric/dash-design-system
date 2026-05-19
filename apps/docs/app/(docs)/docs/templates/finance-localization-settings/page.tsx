"use client"

import { FinanceLocalizationSettings } from "@/registry/dash/templates/finance-localization-settings"
import {
  DocsPageShell,
  DocsHeader,
  DocsSection,
  DocsExample,
} from "@/components/docs/page-shell"
import { DocsTemplatePreview } from "@/components/docs/template-preview"
import { DocsCode } from "@/components/docs/code-block"

export default function FinanceLocalizationSettingsDocsPage() {
  return (
    <DocsPageShell>
      <DocsHeader
        category="Templates / Finance & Banking"
        title="Localization Settings"
        description="Settings shell + Language / Currency / Timezone / Date Format field rows. Ported from AlignUI Pro Figma frame 'Localization Settings [Finance & Banking]'."
      />
      <DocsSection title="Install">
        <DocsCode language="bash" code={`dash add finance-localization-settings`} />
      </DocsSection>
      <DocsSection title="Examples">
        <DocsExample
          bare
          title="Apex — default"
          preview={
            <DocsTemplatePreview padding="p-6">
              <FinanceLocalizationSettings />
            </DocsTemplatePreview>
          }
          code={`<FinanceLocalizationSettings />`}
        />
      </DocsSection>
    </DocsPageShell>
  )
}
