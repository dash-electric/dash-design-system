"use client"

import { MarketingPricingDetailEmpty } from "@/registry/dash/templates/marketing-pricing-detail-empty"
import {
  DocsPageShell,
  DocsHeader,
  DocsSection,
  DocsExample,
  DocsPropsTable,
} from "@/components/docs/page-shell"
import { DocsTemplatePreview } from "@/components/docs/template-preview"
import { DocsCode } from "@/components/docs/code-block"

export default function MarketingPricingDetailEmptyDocsPage() {
  return (
    <DocsPageShell>
      <DocsHeader
        category="Templates / Marketing & Sales"
        title="Marketing Add Product · Pricing (Empty)"
        description="Add Product wizard, Step 2/5 — empty Product pricing input. Source: Figma node `164914:73264`."
      />

      <DocsSection title="Install">
        <DocsCode language="bash" code={`dashkit add marketing-pricing-detail-empty`} />
      </DocsSection>

      <DocsSection title="Examples">
        <DocsExample
          bare
          title="Default"
          preview={
            <DocsTemplatePreview>
              <MarketingPricingDetailEmpty />
            </DocsTemplatePreview>
          }
          code={`<MarketingPricingDetailEmpty />`}
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
