"use client"

import { AuthVerificationKey } from "@/registry/dash/blocks/auth-verification-key"
import {
  DocsPageShell,
  DocsHeader,
  DocsSection,
  DocsExample,
} from "@/components/docs/page-shell"
import { DocsCode } from "@/components/docs/code-block"

export default function AuthVerificationKeyDocsPage() {
  return (
    <DocsPageShell>
      <DocsHeader
        category="Blocks / Auth"
        title="Auth Verification (Key icon)"
        description="Verification Key pattern. 96×96 shield-icon header → 4-digit OTP grid → FancyButton CTA (disabled until complete) → resend link."
      />

      <DocsSection title="Install">
        <DocsCode language="bash" code={`dashkit add auth-verification-key`} />
      </DocsSection>

      <DocsSection title="Preview">
        <DocsExample
          title="Default — Verifikasi kode 4 digit"
          preview={
            <div className="w-full rounded-xl border border-stroke-soft-200 bg-bg-white-0 p-6 flex items-center justify-center min-h-[500px]">
              <AuthVerificationKey />
            </div>
          }
          code={`<AuthVerificationKey />`}
        />
      </DocsSection>

      <DocsSection title="Composition">
        <ul className="text-sm text-text-sub-600 space-y-1.5 list-disc pl-5">
          <li>4-digit grid via <code>InputOTP maxLength={4}</code>, slots sized 56×56 with <code>text-lg</code>.</li>
          <li>Submit button disabled until value reaches 4 chars.</li>
          <li>For 6-digit phone OTP use the existing <code>verification-otp</code> block instead.</li>
        </ul>
      </DocsSection>
    </DocsPageShell>
  )
}
