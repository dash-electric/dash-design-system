"use client"

import { MarketingProductsCardOpened } from "@/registry/dash/templates/marketing-products-card-opened"
import {
  DocsPageShell,
  DocsHeader,
  DocsSection,
  DocsExample,
  DocsPropsTable,
} from "@/components/docs/page-shell"
import { DocsTemplatePreview } from "@/components/docs/template-preview"
import { DocsCode } from "@/components/docs/code-block"

export default function MarketingProductsCardOpenedDocsPage() {
  return (
    <DocsPageShell>
      <DocsHeader
        category="Templates / Marketing & Sales"
        title="Marketing Products (Card Opened)"
        description="Products grid with one card expanded inline showing detail panel: price + stock + 3-tab analytics + Edit Product CTA. Source: Figma node `164965:34586`."
      />

      <DocsSection title="Install">
        <DocsCode language="bash" code={`dashkit add marketing-products-card-opened`} />
      </DocsSection>

      <DocsSection title="Examples">
        <DocsExample
          bare
          title="Default"
          preview={
            <DocsTemplatePreview>
              <MarketingProductsCardOpened />
            </DocsTemplatePreview>
          }
          code={`<MarketingProductsCardOpened />`}
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
