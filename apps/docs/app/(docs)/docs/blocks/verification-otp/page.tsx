"use client"

import { VerificationOtpBlock } from "@/registry/dash/blocks/verification-otp"
import {
  DocsPageShell,
  DocsHeader,
  DocsSection,
  DocsExample,
  DocsDoDont,
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
      <DocsSection title="OTP input shape">
        <p className="text-sm text-text-sub-600 max-w-2xl">
          6 separate boxes, monospaced, auto-advance. Don't use a single text input — segmented boxes signal 'paste a code' to the user.
        </p>
        <DocsDoDont
          do={{
            preview: (
              <div className="w-full max-w-xs space-y-3">
                <p className="text-xs text-text-sub-600 text-center">Kami kirim 6-digit kode ke +62 812 •••• 1234</p>
                <div className="flex justify-center gap-2">{[1,2,3,4,5,6].map(i => null)}<div className="size-10 rounded-lg border border-stroke-soft-200 bg-bg-white-0 flex items-center justify-center text-base font-medium font-mono">7</div><div className="size-10 rounded-lg border border-stroke-soft-200 bg-bg-white-0 flex items-center justify-center text-base font-medium font-mono">3</div><div className="size-10 rounded-lg border border-stroke-soft-200 bg-bg-white-0 flex items-center justify-center text-base font-medium font-mono">9</div><div className="size-10 rounded-lg border border-primary-base bg-bg-white-0" /><div className="size-10 rounded-lg border border-stroke-soft-200 bg-bg-white-0" /><div className="size-10 rounded-lg border border-stroke-soft-200 bg-bg-white-0" /></div>
                <p className="text-xs text-text-soft-400 text-center">Kirim ulang dalam <span className="text-text-strong-950">0:42</span></p>
              </div>
            ),
            caption: "Six segmented boxes, monospaced digits, auto-advance focus. Pasting an SMS code lights up all six boxes at once.",
          }}
          dont={{
            preview: (
              <div className="w-full max-w-xs space-y-3">
                <p className="text-xs text-text-sub-600 text-center">Masukkan kode verifikasi</p>
                <div className="h-10 rounded-lg border border-stroke-soft-200 bg-bg-white-0 text-xs text-text-sub-600 flex items-center px-3">123456</div>
                <div className="h-9 rounded-lg bg-primary-base text-static-white text-xs font-medium flex items-center justify-center">Verifikasi</div>
              </div>
            ),
            caption: "Don't use a generic text input for OTP. No auto-advance, no paste handoff, no visual cue that it's a 6-digit code.",
          }}
        />
      </DocsSection>

      <DocsSection title="Resend countdown">
        <p className="text-sm text-text-sub-600 max-w-2xl">
          Show a real countdown timer for the resend button. Don't let the user spam-tap and trigger SMS cost.
        </p>
        <DocsDoDont
          do={{
            preview: (
              <div className="w-full max-w-xs space-y-2 text-center">
                <p className="text-xs text-text-sub-600">Belum terima kode?</p>
                <div className="h-8 rounded-lg border border-stroke-soft-200 bg-bg-weak-50 text-xs text-text-soft-400 flex items-center justify-center">Kirim ulang dalam 0:38</div>
              </div>
            ),
            caption: "Resend button is disabled with a live countdown. The user knows exactly when retry becomes available.",
          }}
          dont={{
            preview: (
              <div className="w-full max-w-xs space-y-2 text-center">
                <p className="text-xs text-text-sub-600">Belum terima kode?</p>
                <div className="h-8 rounded-lg bg-primary-base text-static-white text-xs font-medium flex items-center justify-center">Kirim ulang</div>
                <p className="text-[10px] text-text-soft-400">(button works immediately, every tap)</p>
              </div>
            ),
            caption: "Don't leave the resend button always-enabled. One impatient user generates 12 SMS in 30 seconds — that's your Twilio bill on fire.",
          }}
        />
      </DocsSection>
        </DocsPageShell>
  )
}
