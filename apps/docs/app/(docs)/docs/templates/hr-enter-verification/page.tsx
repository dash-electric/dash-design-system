"use client"

import { HrEnterVerification } from "@/registry/dash/templates/hr-enter-verification"
import {
  DocsPageShell,
  DocsHeader,
  DocsSection,
  DocsExample,
} from "@/components/docs/page-shell"
import { DocsTemplatePreview } from "@/components/docs/template-preview"
import { DocsCode } from "@/components/docs/code-block"

export default function HrEnterVerificationDocsPage() {
  return (
    <DocsPageShell>
      <DocsHeader
        category="Templates / HR Management / Auth"
        title="HR Enter Verification"
        description="Split-screen verification with 4-digit OTP + Verify CTA + Resend link. Right column reuses Time Off promo card. Ported 1:1 (structural parity) from AlignUI Pro Figma node 3903:26321."
      />

      <DocsSection title="Install">
        <DocsCode language="bash" code={`dash add hr-enter-verification`} />
      </DocsSection>

      <DocsSection title="Examples">
        <DocsExample
          bare
          title="OTP verification"
          description="4-slot OTP input wired to controlled value. Submit disabled until 4 digits entered."
          preview={
            <DocsTemplatePreview>
              <div className="relative h-[680px] overflow-hidden">
                <div className="absolute inset-0 [&>*]:!min-h-full">
                  <HrEnterVerification />
                </div>
              </div>
            </DocsTemplatePreview>
          }
          code={`<HrEnterVerification recipientEmail="james@alignui.com" onSubmit={(code) => verify(code)} />`}
        />
      </DocsSection>
    </DocsPageShell>
  )
}
