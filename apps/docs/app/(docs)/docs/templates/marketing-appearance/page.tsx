"use client"

import { MarketingAppearance } from "@/registry/dash/templates/marketing-appearance"
import {
  DocsPageShell,
  DocsHeader,
  DocsSection,
  DocsExample,
  DocsPropsTable,
} from "@/components/docs/page-shell"
import { DocsTemplatePreview } from "@/components/docs/template-preview"
import { DocsCode } from "@/components/docs/code-block"

export default function MarketingAppearanceDocsPage() {
  return (
    <DocsPageShell>
      <DocsHeader
        category="Templates / Marketing & Sales"
        title="Marketing Appearance"
        description="Theme selector (Light/Dark/System), brand color swatches, sidebar feature select, compact-mode toggle. Source: Figma node `164843:36252`."
      />

      <DocsSection title="Install">
        <DocsCode language="bash" code={`dashkit add marketing-appearance`} />
      </DocsSection>

      <DocsSection title="Examples">
        <DocsExample
          bare
          title="Default"
          preview={
            <DocsTemplatePreview>
              <MarketingAppearance />
            </DocsTemplatePreview>
          }
          code={`<MarketingAppearance />`}
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
