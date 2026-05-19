"use client"

import { MarketingGeneralInformationFilled } from "@/registry/dash/templates/marketing-general-information-filled"
import {
  DocsPageShell,
  DocsHeader,
  DocsSection,
  DocsExample,
  DocsPropsTable,
} from "@/components/docs/page-shell"
import { DocsTemplatePreview } from "@/components/docs/template-preview"
import { DocsCode } from "@/components/docs/code-block"

export default function MarketingGeneralInformationFilledDocsPage() {
  return (
    <DocsPageShell>
      <DocsHeader
        category="Templates / Marketing & Sales"
        title="Marketing Add Product · General (Filled)"
        description="Add Product wizard, Step 1/5 — General Information form pre-filled with Apple Watch sample data. Source: Figma node `164914:73774`."
      />

      <DocsSection title="Install">
        <DocsCode language="bash" code={`dash add marketing-general-information-filled`} />
      </DocsSection>

      <DocsSection title="Examples">
        <DocsExample
          bare
          title="Default"
          preview={
            <DocsTemplatePreview>
              <MarketingGeneralInformationFilled />
            </DocsTemplatePreview>
          }
          code={`<MarketingGeneralInformationFilled />`}
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
