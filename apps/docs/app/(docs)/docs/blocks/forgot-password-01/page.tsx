"use client"

import { ForgotPasswordBlock01 } from "@/registry/dash/blocks/forgot-password-01"
import {
  DocsPageShell,
  DocsHeader,
  DocsSection,
  DocsExample,
} from "@/components/docs/page-shell"
import { DocsCode } from "@/components/docs/code-block"

export default function ForgotPasswordBlock01DocsPage() {
  return (
    <DocsPageShell>
      <DocsHeader
        category="Blocks / Auth"
        title="Forgot Password 01"
        description="Single-field email submit for password reset. Honest copy — tells the user a link will be sent if the email is registered, without leaking which emails exist."
      />

      <DocsSection title="Install">
        <DocsCode language="bash" code={`dash add forgot-password-01`} />
      </DocsSection>

      <DocsSection title="Preview">
        <DocsExample
          title="Reset password"
          preview={
            <div className="w-full rounded-xl border border-stroke-soft-200 bg-bg-white-0 p-6 flex items-center justify-center min-h-[360px]">
              <ForgotPasswordBlock01 />
            </div>
          }
          code={`<ForgotPasswordBlock01 />`}
        />
      </DocsSection>

      <DocsSection title="Composition">
        <ul className="text-sm text-text-sub-600 space-y-1.5 list-disc pl-5">
          <li>Single <code>InputRoot</code> + <code>Label</code> stack for email.</li>
          <li>Submit <code>Button</code> full-width primary.</li>
          <li>Back-to-login <code>LinkButton</code> in the footer.</li>
          <li>Drop inside <code>AuthShell variant="centered"</code> for the page chrome.</li>
        </ul>
      </DocsSection>

      <DocsSection title="When to use">
        <ul className="text-sm text-text-sub-600 space-y-1.5 list-disc pl-5">
          <li><strong>Use</strong> on <code>/forgot-password</code> in any Dash auth surface.</li>
          <li><strong>Use</strong> when the reset flow is email-link (not SMS OTP).</li>
          <li><strong>Don't</strong> use for SMS-based recovery — pair <code>Verification OTP</code> with a phone-input variant.</li>
          <li><strong>Don't</strong> leak which emails are registered — keep the success message generic.</li>
        </ul>
      </DocsSection>
    </DocsPageShell>
  )
}
