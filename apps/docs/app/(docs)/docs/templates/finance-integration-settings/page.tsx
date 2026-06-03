"use client"

import { FinanceIntegrationSettings } from "@/registry/dash/templates/finance-integration-settings"
import {
  DocsPageShell,
  DocsHeader,
  DocsSection,
  DocsExample,
  DocsPropsTable,
} from "@/components/docs/page-shell"
import { DocsTemplatePreview } from "@/components/docs/template-preview"
import { DocsCode } from "@/components/docs/code-block"

export default function FinanceIntegrationSettingsDocsPage() {
  return (
    <DocsPageShell>
      <DocsHeader
        category="Templates / Finance & Banking"
        title="Integration Settings"
        description="Settings shell + SegmentedControl [All Apps|Connected|Disconnected] + Search/Filter/Sort + 3-column app grid (logo, name, status badge, description, Manage CTA). Ported from AlignUI Pro Figma frame 'Integration Settings [Finance & Banking]'."
      />
      <DocsSection title="Install">
        <DocsCode language="bash" code={`dashkit add finance-integration-settings`} />
      </DocsSection>
      <DocsSection title="Examples">
        <DocsExample
          bare
          title="Apex — default"
          preview={
            <DocsTemplatePreview padding="p-6">
              <FinanceIntegrationSettings />
            </DocsTemplatePreview>
          }
          code={`<FinanceIntegrationSettings />`}
        />
      </DocsSection>
      <DocsSection title="API">
        <DocsPropsTable
          rows={[
            { name: "apps", type: "IntegrationApp[]", description: "App list — { id, name, description, status, glyph? }. Default = 6 mock apps (Office 365, Slack, Asana, Zoom, Dropbox, Zendesk)." },
          ]}
        />
      </DocsSection>
    </DocsPageShell>
  )
}
