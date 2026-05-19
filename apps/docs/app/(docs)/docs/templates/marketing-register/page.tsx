"use client"

import { MarketingRegister } from "@/registry/dash/templates/marketing-register"
import {
  DocsPageShell,
  DocsHeader,
  DocsSection,
  DocsExample,
  DocsPropsTable,
} from "@/components/docs/page-shell"
import { DocsTemplatePreview } from "@/components/docs/template-preview"
import { DocsCode } from "@/components/docs/code-block"

export default function MarketingRegisterDocsPage() {
  return (
    <DocsPageShell>
      <DocsHeader
        category="Templates / Marketing & Sales"
        title="Marketing Register"
        description="Split-screen registration page with social buttons, password rules checklist, and testimonial hero. Source: Figma node `164865:33467`."
      />

      <DocsSection title="Install">
        <DocsCode language="bash" code={`dash add marketing-register`} />
      </DocsSection>

      <DocsSection title="Examples">
        <DocsExample
          bare
          title="Default"
          preview={
            <DocsTemplatePreview>
              <MarketingRegister />
            </DocsTemplatePreview>
          }
          code={`<MarketingRegister />`}
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
