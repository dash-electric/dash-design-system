"use client"

import { MarketingIntegrations } from "@/registry/dash/templates/marketing-integrations"
import {
  DocsPageShell,
  DocsHeader,
  DocsSection,
  DocsExample,
  DocsPropsTable,
} from "@/components/docs/page-shell"
import { DocsTemplatePreview } from "@/components/docs/template-preview"
import { DocsCode } from "@/components/docs/code-block"

export default function MarketingIntegrationsDocsPage() {
  return (
    <DocsPageShell>
      <DocsHeader
        category="Templates / Marketing & Sales"
        title="Marketing Integrations"
        description="Social Media integrations list (Facebook, Instagram, X, TikTok, WhatsApp) with Connect/Disconnect actions. Source: Figma node `164843:35642`."
      />

      <DocsSection title="Install">
        <DocsCode language="bash" code={`dash add marketing-integrations`} />
      </DocsSection>

      <DocsSection title="Examples">
        <DocsExample
          bare
          title="Default"
          preview={
            <DocsTemplatePreview>
              <MarketingIntegrations />
            </DocsTemplatePreview>
          }
          code={`<MarketingIntegrations />`}
        />
      </DocsSection>

      <DocsSection title="API">
        <DocsPropsTable
          rows={[
            { name: "className", type: "string", description: "Optional className to merge with the root wrapper." },
          ]}
        />
      </DocsSection>
    </DocsPageShell>
  )
}
