"use client"

import { FinanceRegister } from "@/registry/dash/templates/finance-register"
import {
  DocsPageShell,
  DocsHeader,
  DocsSection,
  DocsExample,
  DocsPropsTable,
} from "@/components/docs/page-shell"
import { DocsTemplatePreview } from "@/components/docs/template-preview"
import { DocsCode } from "@/components/docs/code-block"

export default function FinanceRegisterDocsPage() {
  return (
    <DocsPageShell>
      <DocsHeader
        category="Templates / Finance & Banking"
        title="Register"
        description="Centered card on patterned background. Apex top bar + brand icon + Full Name + Email + Password with live 3-rule checklist + strength bar + FancyButton submit. Ported from AlignUI Pro Figma frame 'Register Page [Finance & Banking]'."
      />
      <DocsSection title="Install">
        <DocsCode language="bash" code={`dash add finance-register`} />
      </DocsSection>
      <DocsSection title="Examples">
        <DocsExample
          bare
          title="Apex — default"
          preview={
            <DocsTemplatePreview>
              <FinanceRegister />
            </DocsTemplatePreview>
          }
          code={`<FinanceRegister />`}
        />
      </DocsSection>
      <DocsSection title="API">
        <DocsPropsTable
          rows={[
            { name: "brand", type: "ReactNode", description: "Brand mark in top bar. Defaults to Apex monogram." },
            { name: "onSubmit", type: "(data) => void", description: "Form submit handler — receives { fullName, email, password }." },
          ]}
        />
      </DocsSection>
    </DocsPageShell>
  )
}
