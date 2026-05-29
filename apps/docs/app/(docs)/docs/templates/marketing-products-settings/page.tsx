"use client"

import { MarketingProductsSettings } from "@/registry/dash/templates/marketing-products-settings"
import {
  DocsPageShell,
  DocsHeader,
  DocsSection,
  DocsExample,
  DocsPropsTable,
} from "@/components/docs/page-shell"
import { DocsTemplatePreview } from "@/components/docs/template-preview"
import { DocsCode } from "@/components/docs/code-block"

export default function MarketingProductsSettingsDocsPage() {
  return (
    <DocsPageShell>
      <DocsHeader
        category="Templates / Marketing & Sales"
        title="Marketing Products Settings"
        description="Inventory + display settings panel (Track Inventory toggle, Out-of-Stock display, Compare-at-Price, Stock Threshold). Source: Figma node `164843:40671`."
      />

      <DocsSection title="Install">
        <DocsCode language="bash" code={`dashkit add marketing-products-settings`} />
      </DocsSection>

      <DocsSection title="Examples">
        <DocsExample
          bare
          title="Default"
          preview={
            <DocsTemplatePreview>
              <MarketingProductsSettings />
            </DocsTemplatePreview>
          }
          code={`<MarketingProductsSettings />`}
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
