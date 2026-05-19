"use client"

import { HrIntegrations } from "@/registry/dash/templates/hr-integrations"
import {
  DocsPageShell,
  DocsHeader,
  DocsSection,
  DocsExample,
} from "@/components/docs/page-shell"
import { DocsTemplatePreview } from "@/components/docs/template-preview"
import { DocsCode } from "@/components/docs/code-block"

export default function HrIntegrationsDocsPage() {
  return (
    <DocsPageShell>
      <DocsHeader
        category="Templates / HR Management / Integrations"
        title="HR Integrations"
        description="Standalone integrations marketplace — filter row (segmented + search + sort) + Available section (6 apps) + Upcoming section (3 SOON apps). Ported 1:1 (structural parity) from AlignUI Pro Figma node 3880:63624."
      />

      <DocsSection title="Install">
        <DocsCode language="bash" code={`dash add hr-integrations`} />
      </DocsSection>

      <DocsSection title="Examples">
        <DocsExample
          bare
          title="Marketplace grid"
          description="3-column grid (md:2 / xl:3) of integration cards with logo + name + description + Manage + Switch."
          preview={
            <DocsTemplatePreview background="bg-bg-weak-50" padding="p-6">
              <HrIntegrations />
            </DocsTemplatePreview>
          }
          code={`<HrIntegrations />`}
        />
      </DocsSection>
    </DocsPageShell>
  )
}
