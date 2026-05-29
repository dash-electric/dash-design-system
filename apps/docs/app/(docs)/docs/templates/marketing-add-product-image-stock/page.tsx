"use client"

import { MarketingAddProductImageStock } from "@/registry/dash/templates/marketing-add-product-image-stock"
import {
  DocsPageShell,
  DocsHeader,
  DocsSection,
  DocsExample,
  DocsPropsTable,
} from "@/components/docs/page-shell"
import { DocsTemplatePreview } from "@/components/docs/template-preview"
import { DocsCode } from "@/components/docs/code-block"

export default function MarketingAddProductImageStockDocsPage() {
  return (
    <DocsPageShell>
      <DocsHeader
        category="Templates / Marketing & Sales"
        title="Marketing Add Product · Image & Stock"
        description="Steps 3/5 and 4/5 of the Add Product wizard. Collapses 4 Figma empty/filled variants into a single `variant` prop. Source: Figma node `164914:73985 / 164914:77524 / 164914:74884 / 164914:77684`."
      />

      <DocsSection title="Install">
        <DocsCode language="bash" code={`dashkit add marketing-add-product-image-stock`} />
      </DocsSection>

      <DocsSection title="Examples">
        <DocsExample
          bare
          title="Default"
          preview={
            <DocsTemplatePreview>
              <MarketingAddProductImageStock />
            </DocsTemplatePreview>
          }
          code={`<MarketingAddProductImageStock />`}
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
