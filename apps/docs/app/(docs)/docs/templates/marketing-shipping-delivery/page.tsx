"use client"

import { MarketingShippingDelivery } from "@/registry/dash/templates/marketing-shipping-delivery"
import {
  DocsPageShell,
  DocsHeader,
  DocsSection,
  DocsExample,
  DocsPropsTable,
} from "@/components/docs/page-shell"
import { DocsTemplatePreview } from "@/components/docs/template-preview"
import { DocsCode } from "@/components/docs/code-block"

export default function MarketingShippingDeliveryDocsPage() {
  return (
    <DocsPageShell>
      <DocsHeader
        category="Templates / Marketing & Sales"
        title="Marketing Shipping & Delivery"
        description="Shipping methods (Standard / Express / Free) with per-method enable toggle + price input + threshold + international toggle. Source: Figma node `164843:41590`."
      />

      <DocsSection title="Install">
        <DocsCode language="bash" code={`dashkit add marketing-shipping-delivery`} />
      </DocsSection>

      <DocsSection title="Examples">
        <DocsExample
          bare
          title="Default"
          preview={
            <DocsTemplatePreview>
              <MarketingShippingDelivery />
            </DocsTemplatePreview>
          }
          code={`<MarketingShippingDelivery />`}
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
