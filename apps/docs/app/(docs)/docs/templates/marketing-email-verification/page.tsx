"use client"

import { MarketingEmailVerification } from "@/registry/dash/templates/marketing-email-verification"
import {
  DocsPageShell,
  DocsHeader,
  DocsSection,
  DocsExample,
  DocsPropsTable,
} from "@/components/docs/page-shell"
import { DocsTemplatePreview } from "@/components/docs/template-preview"
import { DocsCode } from "@/components/docs/code-block"

export default function MarketingEmailVerificationDocsPage() {
  return (
    <DocsPageShell>
      <DocsHeader
        category="Templates / Marketing & Sales"
        title="Marketing Email Verification"
        description="Split-screen 4-digit OTP verification page with resend code action. Source: Figma node `164865:37357`."
      />

      <DocsSection title="Install">
        <DocsCode language="bash" code={`dash add marketing-email-verification`} />
      </DocsSection>

      <DocsSection title="Examples">
        <DocsExample
          bare
          title="Default"
          preview={
            <DocsTemplatePreview>
              <MarketingEmailVerification />
            </DocsTemplatePreview>
          }
          code={`<MarketingEmailVerification />`}
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
