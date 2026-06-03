"use client"

import { HrGeneralSettings } from "@/registry/dash/templates/hr-general-settings"
import {
  DocsPageShell,
  DocsHeader,
  DocsSection,
  DocsExample,
} from "@/components/docs/page-shell"
import { DocsTemplatePreview } from "@/components/docs/template-preview"
import { DocsCode } from "@/components/docs/code-block"

export default function HrGeneralSettingsDocsPage() {
  return (
    <DocsPageShell>
      <DocsHeader
        category="Templates / HR Management / Settings"
        title="HR General Settings"
        description="Settings page with vertical tab nav + General active panel (Regional Preferences + Theme Options). Ported 1:1 (structural parity) from AlignUI Pro Figma node 3880:69995."
      />

      <DocsSection title="Install">
        <DocsCode language="bash" code={`dashkit add hr-general-settings`} />
      </DocsSection>

      <DocsSection title="Examples">
        <DocsExample
          bare
          title="Regional + Theme"
          description="4 select inputs (Language / Timezone / Time Format / Date Format) + 3 theme radio cards (Light / Dark / System)."
          preview={
            <DocsTemplatePreview background="bg-bg-weak-50" padding="p-6">
              <HrGeneralSettings />
            </DocsTemplatePreview>
          }
          code={`<HrGeneralSettings />`}
        />
      </DocsSection>
    </DocsPageShell>
  )
}
