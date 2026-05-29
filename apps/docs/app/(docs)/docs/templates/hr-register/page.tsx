"use client"

import { HrRegister } from "@/registry/dash/templates/hr-register"
import {
  DocsPageShell,
  DocsHeader,
  DocsSection,
  DocsExample,
} from "@/components/docs/page-shell"
import { DocsTemplatePreview } from "@/components/docs/template-preview"
import { DocsCode } from "@/components/docs/code-block"

export default function HrRegisterDocsPage() {
  return (
    <DocsPageShell>
      <DocsHeader
        category="Templates / HR Management / Auth"
        title="HR Register"
        description="Split-screen register with full name + email + password (live checklist) + social SSO. Ported 1:1 (structural parity) from AlignUI Pro Figma node 3902:26059."
      />

      <DocsSection title="Install">
        <DocsCode language="bash" code={`dashkit add hr-register`} />
      </DocsSection>

      <DocsSection title="Examples">
        <DocsExample
          bare
          title="Register form + promo"
          description="3-field register with live password rule validation (uppercase / number / 8+ chars)."
          preview={
            <DocsTemplatePreview>
              <div className="relative h-[680px] overflow-hidden">
                <div className="absolute inset-0 [&>*]:!min-h-full">
                  <HrRegister />
                </div>
              </div>
            </DocsTemplatePreview>
          }
          code={`<HrRegister onSubmit={({ fullName, email, password }) => signUp(...)} />`}
        />
      </DocsSection>
    </DocsPageShell>
  )
}
