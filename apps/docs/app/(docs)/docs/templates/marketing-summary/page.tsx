"use client"

import { MarketingSummary } from "@/registry/dash/templates/marketing-summary"
import {
  DocsPageShell,
  DocsHeader,
  DocsSection,
  DocsExample,
  DocsPropsTable,
} from "@/components/docs/page-shell"
import { DocsTemplatePreview } from "@/components/docs/template-preview"
import { DocsCode } from "@/components/docs/code-block"

export default function MarketingSummaryDocsPage() {
  return (
    <DocsPageShell>
      <DocsHeader
        category="Templates / Marketing & Sales"
        title="Marketing Add Product · Summary"
        description="Add Product wizard, Step 5/5 — quick overview of product details, pricing, stock, and uploaded images. Source: Figma node `164926:19943`."
      />

      <DocsSection title="Install">
        <DocsCode language="bash" code={`dash add marketing-summary`} />
      </DocsSection>

      <DocsSection title="Examples">
        <DocsExample
          bare
          title="Default"
          preview={
            <DocsTemplatePreview>
              <MarketingSummary />
            </DocsTemplatePreview>
          }
          code={`<MarketingSummary />`}
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
