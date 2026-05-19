"use client"

import { FinanceResetPassword } from "@/registry/dash/templates/finance-reset-password"
import {
  DocsPageShell,
  DocsHeader,
  DocsSection,
  DocsExample,
  DocsPropsTable,
} from "@/components/docs/page-shell"
import { DocsTemplatePreview } from "@/components/docs/template-preview"
import { DocsCode } from "@/components/docs/code-block"

export default function FinanceResetPasswordDocsPage() {
  return (
    <DocsPageShell>
      <DocsHeader
        category="Templates / Finance & Banking"
        title="Reset Password"
        description="Same chrome as FinanceRegister. Single email field + Reset Password FancyButton + try-another-method fallback. Ported from AlignUI Pro Figma frame 'Reset Password [Finance & Banking]'."
      />
      <DocsSection title="Install">
        <DocsCode language="bash" code={`dash add finance-reset-password`} />
      </DocsSection>
      <DocsSection title="Examples">
        <DocsExample
          bare
          title="Apex — default"
          preview={
            <DocsTemplatePreview>
              <FinanceResetPassword />
            </DocsTemplatePreview>
          }
          code={`<FinanceResetPassword />`}
        />
      </DocsSection>
      <DocsSection title="API">
        <DocsPropsTable
          rows={[
            { name: "brand", type: "ReactNode", description: "Brand mark in top bar. Defaults to Apex monogram." },
            { name: "onSubmit", type: "(email: string) => void", description: "Form submit handler." },
          ]}
        />
      </DocsSection>
    </DocsPageShell>
  )
}
