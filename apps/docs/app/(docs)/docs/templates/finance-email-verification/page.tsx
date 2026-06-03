"use client"

import { FinanceEmailVerification } from "@/registry/dash/templates/finance-email-verification"
import {
  DocsPageShell,
  DocsHeader,
  DocsSection,
  DocsExample,
  DocsPropsTable,
} from "@/components/docs/page-shell"
import { DocsTemplatePreview } from "@/components/docs/template-preview"
import { DocsCode } from "@/components/docs/code-block"

export default function FinanceEmailVerificationDocsPage() {
  return (
    <DocsPageShell>
      <DocsHeader
        category="Templates / Finance & Banking"
        title="Email Verification"
        description="Same chrome as FinanceResetPassword. 4-digit OTP input (via @dash/input-otp) + Submit Code FancyButton + Resend link. Ported from AlignUI Pro Figma frame 'Email Verification [Finance & Banking]'."
      />
      <DocsSection title="Install">
        <DocsCode language="bash" code={`dashkit add finance-email-verification`} />
      </DocsSection>
      <DocsSection title="Examples">
        <DocsExample
          bare
          title="Apex — default"
          preview={
            <DocsTemplatePreview>
              <FinanceEmailVerification />
            </DocsTemplatePreview>
          }
          code={`<FinanceEmailVerification />`}
        />
      </DocsSection>
      <DocsSection title="API">
        <DocsPropsTable
          rows={[
            { name: "brand", type: "ReactNode", description: "Brand mark in top bar." },
            { name: "email", type: "string", defaultValue: '"arthur@alignui.com"', description: "Recipient email shown in the description." },
            { name: "length", type: "4 | 6", defaultValue: "4", description: "Number of OTP digits." },
            { name: "onSubmit", type: "(code: string) => void", description: "Called when submit button is clicked." },
            { name: "onResend", type: "() => void", description: "Called when 'Resend code' is clicked." },
          ]}
        />
      </DocsSection>
    </DocsPageShell>
  )
}
