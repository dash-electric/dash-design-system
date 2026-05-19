"use client"

import { VerificationOtpBlock } from "@/registry/dash/blocks/verification-otp"
import {
  DocsPageShell,
  DocsHeader,
  DocsSection,
  DocsExample,
} from "@/components/docs/page-shell"
import { DocsCode } from "@/components/docs/code-block"

export default function VerificationOtpDocsPage() {
  return (
    <DocsPageShell>
      <DocsHeader
        category="Blocks / Auth"
        title="Verification OTP"
        description="6-digit OTP code entry for SMS / WhatsApp verification flows — mitra signup, sensitive action confirmation, MFA challenge."
      />

      <DocsSection title="Install">
        <DocsCode language="bash" code={`dash add verification-otp`} />
      </DocsSection>

      <DocsSection title="Preview">
        <DocsExample
          title="OTP verifikasi mitra"
          preview={
            <div className="w-full rounded-xl border border-stroke-soft-200 bg-bg-white-0 p-6 flex items-center justify-center min-h-[420px]">
              <VerificationOtpBlock />
            </div>
          }
          code={`<VerificationOtpBlock />`}
        />
      </DocsSection>

      <DocsSection title="Composition">
        <ul className="text-sm text-text-sub-600 space-y-1.5 list-disc pl-5">
          <li>6 segmented input boxes — auto-advance on keystroke, paste-aware.</li>
          <li>Resend code <code>LinkButton</code> with a 30-second cooldown timer.</li>
          <li>Phone number is masked (<code>+62 812-****-9412</code>) above the inputs.</li>
          <li>Submit <code>Button</code> auto-enables when all 6 digits are filled.</li>
        </ul>
      </DocsSection>

      <DocsSection title="When to use">
        <ul className="text-sm text-text-sub-600 space-y-1.5 list-disc pl-5">
          <li><strong>Use</strong> for mitra phone verification during signup.</li>
          <li><strong>Use</strong> for sensitive-action confirmation (large payout, account deletion).</li>
          <li><strong>Use</strong> for MFA challenge on suspicious logins.</li>
          <li><strong>Don't</strong> use for password reset — reach for <code>Forgot Password 01</code> (email link).</li>
          <li><strong>Don't</strong> use for non-time-sensitive verification — email is cheaper than SMS.</li>
        </ul>
      </DocsSection>
    </DocsPageShell>
  )
}
