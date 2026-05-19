"use client"

import { MarketingPricingDetailFilled } from "@/registry/dash/templates/marketing-pricing-detail-filled"
import {
  DocsPageShell,
  DocsHeader,
  DocsSection,
  DocsExample,
  DocsPropsTable,
} from "@/components/docs/page-shell"
import { DocsTemplatePreview } from "@/components/docs/template-preview"
import { DocsCode } from "@/components/docs/code-block"

export default function MarketingPricingDetailFilledDocsPage() {
  return (
    <DocsPageShell>
      <DocsHeader
        category="Templates / Marketing & Sales"
        title="Marketing Add Product · Pricing (Filled)"
        description="Add Product wizard, Step 2/5 — Product pricing filled at $478.80. Source: Figma node `164914:73642`."
      />

      <DocsSection title="Install">
        <DocsCode language="bash" code={`dash add marketing-pricing-detail-filled`} />
      </DocsSection>

      <DocsSection title="Examples">
        <DocsExample
          bare
          title="Default"
          preview={
            <DocsTemplatePreview>
              <MarketingPricingDetailFilled />
            </DocsTemplatePreview>
          }
          code={`<MarketingPricingDetailFilled />`}
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
