"use client"

import { HrLogin } from "@/registry/dash/templates/hr-login"
import {
  DocsPageShell,
  DocsHeader,
  DocsSection,
  DocsExample,
} from "@/components/docs/page-shell"
import { DocsTemplatePreview } from "@/components/docs/template-preview"
import { DocsCode } from "@/components/docs/code-block"

export default function HrLoginDocsPage() {
  return (
    <DocsPageShell>
      <DocsHeader
        category="Templates / HR Management / Auth"
        title="HR Login"
        description="Split-screen login with brand mark + form + Time Off promo card on right. Ported 1:1 (structural parity) from AlignUI Pro Figma node 3901:15361."
      />

      <DocsSection title="Install">
        <DocsCode language="bash" code={`dash add hr-login`} />
      </DocsSection>

      <DocsSection title="Examples">
        <DocsExample
          bare
          title="Login form + promo"
          description="Email + password with checklist (uppercase / number / 8+ chars), remember toggle, forgot link, social SSO row, register link."
          preview={
            <DocsTemplatePreview>
              <div className="relative h-[680px] overflow-hidden">
                <div className="absolute inset-0 [&>*]:!min-h-full">
                  <HrLogin />
                </div>
              </div>
            </DocsTemplatePreview>
          }
          code={`<HrLogin onSubmit={({ email, password, remember }) => signIn(...)} />`}
        />
      </DocsSection>

      <DocsSection title="When to use">
        <ul className="text-sm text-text-sub-600 space-y-1.5 list-disc pl-5">
          <li><strong>Use</strong> for full-page HR / employee portal login.</li>
          <li><strong>Use</strong> the centered <code>AuthShell</code> variant if you need a single card layout.</li>
          <li>Illustration column = placeholder gradient + Time Off promo card (real Figma asset on hold).</li>
        </ul>
      </DocsSection>
    </DocsPageShell>
  )
}
