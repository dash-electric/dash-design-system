"use client"

import { ForgotPasswordBlock01 } from "@/registry/dash/blocks/forgot-password-01"
import {
  DocsPageShell,
  DocsHeader,
  DocsSection,
  DocsExample,
  DocsDoDont,
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
        <ul className="text-sm text-text-sub-600 space-y-1.5 list-disc pl-6">
          <li>Single <code>InputRoot</code> + <code>Label</code> stack for email.</li>
          <li>Submit <code>Button</code> full-width primary.</li>
          <li>Back-to-login <code>LinkButton</code> in the footer.</li>
          <li>Drop inside <code>AuthShell variant="centered"</code> for the page chrome.</li>
        </ul>
      </DocsSection>

      <DocsSection title="When to use">
        <ul className="text-sm text-text-sub-600 space-y-1.5 list-disc pl-6">
          <li><strong>Use</strong> on <code>/forgot-password</code> in any Dash auth surface.</li>
          <li><strong>Use</strong> when the reset flow is email-link (not SMS OTP).</li>
          <li><strong>Don't</strong> use for SMS-based recovery — pair <code>Verification OTP</code> with a phone-input variant.</li>
          <li><strong>Don't</strong> leak which emails are registered — keep the success message generic.</li>
        </ul>
      </DocsSection>
      <DocsSection title="Generic confirmation">
        <p className="text-sm text-text-sub-600 max-w-2xl">
          Don't reveal whether an email is registered. Always show the same confirmation surface to prevent account enumeration.
        </p>
        <DocsDoDont
          do={{
            preview: (
              <div className="w-full max-w-xs space-y-3 text-center">
                <div className="size-12 rounded-full bg-success-lighter text-success-base mx-auto flex items-center justify-center text-lg">✓</div>
                <p className="text-sm font-medium">Cek email Anda</p>
                <p className="text-xs text-text-sub-600">Jika ada akun untuk budi@dash.id, kami sudah kirim link reset password.</p>
              </div>
            ),
            caption: "'Jika ada akun…' phrasing — same response regardless of whether the email is registered. Blocks enumeration attack.",
          }}
          dont={{
            preview: (
              <div className="w-full max-w-xs space-y-3 text-center">
                <div className="size-12 rounded-full bg-error-lighter text-error-base mx-auto flex items-center justify-center text-lg">✕</div>
                <p className="text-sm font-medium">Email tidak terdaftar</p>
                <p className="text-xs text-text-sub-600">budi@dash.id tidak ada di sistem. Daftar dulu?</p>
              </div>
            ),
            caption: "Don't confirm whether an email exists. Attackers will probe for valid accounts via the forgot-password endpoint.",
          }}
        />
      </DocsSection>

      <DocsSection title="Send-link CTA hierarchy">
        <p className="text-sm text-text-sub-600 max-w-2xl">
          Forgot-password is one job: send the reset link. Keep the form minimal — email field + send button.
        </p>
        <DocsDoDont
          do={{
            preview: (
              <div className="w-full max-w-xs space-y-3">
                <div className="space-y-1"><p className="text-sm font-medium">Lupa password</p><p className="text-xs text-text-sub-600">Masukkan email Anda. Kami kirim link reset.</p></div>
                <div className="h-10 rounded-lg border border-stroke-soft-200 bg-bg-white-0 text-xs text-text-sub-600 flex items-center px-3">budi@dash.id</div>
                <div className="h-10 rounded-lg bg-primary-base text-static-white text-xs font-medium flex items-center justify-center">Kirim link reset</div>
                <div className="text-center"><span className="text-xs text-primary-base underline">Kembali ke masuk</span></div>
              </div>
            ),
            caption: "One field, one primary CTA, one secondary text link back. No friction, single purpose surface.",
          }}
          dont={{
            preview: (
              <div className="w-full max-w-xs space-y-2">
                <div className="h-9 rounded-lg border border-stroke-soft-200 bg-bg-white-0 text-xs text-text-sub-600 flex items-center px-3">Email</div>
                <div className="h-9 rounded-lg border border-stroke-soft-200 bg-bg-white-0 text-xs text-text-sub-600 flex items-center px-3">Konfirmasi email</div>
                <div className="h-9 rounded-lg border border-stroke-soft-200 bg-bg-white-0 text-xs text-text-sub-600 flex items-center px-3">Nomor HP</div>
                <div className="h-9 rounded-lg bg-primary-base text-static-white text-xs font-medium flex items-center justify-center">Verify identity</div>
              </div>
            ),
            caption: "Don't gate forgot-password behind 'identity verification' questions. The reset link IS the verification.",
          }}
        />
      </DocsSection>
        </DocsPageShell>
  )
}
