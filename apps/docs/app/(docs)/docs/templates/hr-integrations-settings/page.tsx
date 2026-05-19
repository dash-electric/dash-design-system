"use client"

import { HrIntegrationsSettings } from "@/registry/dash/templates/hr-integrations-settings"
import {
  DocsPageShell,
  DocsHeader,
  DocsSection,
  DocsExample,
} from "@/components/docs/page-shell"
import { DocsTemplatePreview } from "@/components/docs/template-preview"
import { DocsCode } from "@/components/docs/code-block"

export default function HrIntegrationsSettingsDocsPage() {
  return (
    <DocsPageShell>
      <DocsHeader
        category="Templates / HR Management / Settings"
        title="HR Integrations Settings"
        description="Settings page with Integrations active panel — 4 connected apps + sub-tabs (Connected / Upcoming / Make a Suggestion) + Add Integration CTA. Ported 1:1 (structural parity) from AlignUI Pro Figma node 3895:91151."
      />

      <DocsSection title="Install">
        <DocsCode language="bash" code={`dash add hr-integrations-settings`} />
      </DocsSection>

      <DocsSection title="Examples">
        <DocsExample
          bare
          title="Connected apps panel"
          description="Compact integration rows (logo / name / description / Manage button) with sub-tab navigation."
          preview={
            <DocsTemplatePreview background="bg-bg-weak-50" padding="p-6">
              <HrIntegrationsSettings />
            </DocsTemplatePreview>
          }
          code={`<HrIntegrationsSettings />`}
        />
      </DocsSection>
    </DocsPageShell>
  )
}
