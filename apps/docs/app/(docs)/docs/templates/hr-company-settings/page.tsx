"use client"

import { HrCompanySettings } from "@/registry/dash/templates/hr-company-settings"
import {
  DocsPageShell,
  DocsHeader,
  DocsSection,
  DocsExample,
} from "@/components/docs/page-shell"
import { DocsTemplatePreview } from "@/components/docs/template-preview"
import { DocsCode } from "@/components/docs/code-block"

export default function HrCompanySettingsDocsPage() {
  return (
    <DocsPageShell>
      <DocsHeader
        category="Templates / HR Management / Settings"
        title="HR Company Settings"
        description="Settings page with Company active panel — logo upload + name + website + slogan + description (with char counter). Ported 1:1 (structural parity) from AlignUI Pro Figma node 3892:85576."
      />

      <DocsSection title="Install">
        <DocsCode language="bash" code={`dash add hr-company-settings`} />
      </DocsSection>

      <DocsSection title="Examples">
        <DocsExample
          bare
          title="Company profile form"
          description="Company-level form with avatar upload, paired name+website row, slogan, and description textarea."
          preview={
            <DocsTemplatePreview background="bg-bg-weak-50" padding="p-6">
              <HrCompanySettings />
            </DocsTemplatePreview>
          }
          code={`<HrCompanySettings />`}
        />
      </DocsSection>
    </DocsPageShell>
  )
}
