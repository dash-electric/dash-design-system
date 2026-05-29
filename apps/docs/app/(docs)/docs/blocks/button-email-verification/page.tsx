"use client"

import { ButtonEmailVerification } from "@/registry/dash/blocks/button-email-verification"
import {
  DocsPageShell,
  DocsHeader,
  DocsSection,
  DocsExample,
  DocsPropsTable,
} from "@/components/docs/page-shell"
import { DocsCode } from "@/components/docs/code-block"

export default function ButtonEmailVerificationDocsPage() {
  return (
    <DocsPageShell>
      <DocsHeader
        category="Blocks / Composition Examples"
        title="Button — Email Verification Modal"
        description="Composition example: 'Verify email' button that opens a modal with OTP entry + resend + manual-code links. Pairs with the auth verification flow."
      />

      <DocsSection title="Install">
        <DocsCode language="bash" code={`dashkit add button-email-verification`} />
      </DocsSection>

      <DocsSection title="Examples">
        <DocsExample
          title="Verify email"
          description="Click the trigger to open the OTP modal. Resend and 'enter code manually' affordances baked in."
          preview={
            <div className="flex w-full justify-center rounded-xl border border-stroke-soft-200 bg-bg-white-0 p-12">
              <ButtonEmailVerification />
            </div>
          }
          code={`<ButtonEmailVerification
  email="sophia@acme.com"
  onResend={() => {}}
  onManualCode={() => {}}
  onVerify={(code) => {}}
/>`}
        />
      </DocsSection>

      <DocsSection title="Composition">
        <ul className="text-sm text-text-sub-600 space-y-1.5 list-disc pl-5">
          <li>Trigger <code>Button</code> + controlled <code>Modal</code>.</li>
          <li>Modal body — heading + <code>InputOTP</code> + resend / manual-code links.</li>
          <li>Modal footer — Cancel + Verify primary action.</li>
        </ul>
      </DocsSection>

      <DocsSection title="API">
        <DocsPropsTable
          rows={[
            { name: "open", type: "boolean", description: "Controlled open state." },
            { name: "onOpenChange", type: "(next: boolean) => void", description: "Open-state change handler." },
            { name: "trigger", type: "ReactNode", description: "Custom trigger element." },
            { name: "email", type: "string", defaultValue: '"hi@alignui.com"', description: "Email shown in the modal heading." },
            { name: "onResend", type: "() => void", description: "Fired when 'Resend code' is tapped." },
            { name: "onManualCode", type: "() => void", description: "Fired when 'Enter code manually' is tapped." },
            { name: "onVerify", type: "(code: string) => void", description: "Fired on Verify with the OTP value." },
          ]}
        />
      </DocsSection>
    </DocsPageShell>
  )
}
