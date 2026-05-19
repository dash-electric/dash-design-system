"use client"

import { MarketingResetPassword } from "@/registry/dash/templates/marketing-reset-password"
import {
  DocsPageShell,
  DocsHeader,
  DocsSection,
  DocsExample,
  DocsPropsTable,
} from "@/components/docs/page-shell"
import { DocsTemplatePreview } from "@/components/docs/template-preview"
import { DocsCode } from "@/components/docs/code-block"

export default function MarketingResetPasswordDocsPage() {
  return (
    <DocsPageShell>
      <DocsHeader
        category="Templates / Marketing & Sales"
        title="Marketing Reset Password"
        description="Split-screen reset-password page (form + testimonial hero) ported from AlignUI Pro. Source: Figma node `164865:33580`."
      />

      <DocsSection title="Install">
        <DocsCode language="bash" code={`dash add marketing-reset-password`} />
      </DocsSection>

      <DocsSection title="Examples">
        <DocsExample
          bare
          title="Default"
          preview={
            <DocsTemplatePreview>
              <MarketingResetPassword />
            </DocsTemplatePreview>
          }
          code={`<MarketingResetPassword />`}
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
