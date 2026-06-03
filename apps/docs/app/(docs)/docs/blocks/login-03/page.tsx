"use client"

import { LoginBlock03 } from "@/registry/dash/blocks/login-03"
import {
  DocsPageShell,
  DocsHeader,
  DocsSection,
  DocsExample,
  DocsDoDont,
} from "@/components/docs/page-shell"
import { DocsCode } from "@/components/docs/code-block"

export default function LoginBlock03DocsPage() {
  return (
    <DocsPageShell>
      <DocsHeader
        category="Blocks / Auth"
        title="Login 03"
        description="Split-screen login with a branded hero panel — Halo-dash testimonial on the left, form on the right. The recommended login for public-facing Dash properties."
      />

      <DocsSection title="Install">
        <DocsCode language="bash" code={`dashkit add login-03`} />
      </DocsSection>

      <DocsSection title="Preview">
        <DocsExample
          title="Split — branded"
          description="Gradient hero panel with tribe-lead testimonial. Collapses to a single column on mobile."
          preview={
            <div className="w-full rounded-xl border border-stroke-soft-200 bg-bg-weak-50 p-6 flex items-center justify-center min-h-[640px]">
              <LoginBlock03 />
            </div>
          }
          code={`<LoginBlock03 />`}
        />
      </DocsSection>

      <DocsSection title="Composition">
        <ul className="text-sm text-text-sub-600 space-y-1.5 list-disc pl-6">
          <li>Self-contained — wraps its own rounded card; no <code>AuthShell</code> wrapper needed.</li>
          <li>Hero panel uses Dash purple gradient (<code>--dash-purple-700</code> → <code>--dash-purple-900</code>) with blurred-circle accents.</li>
          <li>Includes a <code>Badge</code> for promo labels (e.g. "Lebaran rate freeze").</li>
          <li>Right pane uses the standard <code>InputRoot</code> + <code>Label</code> + <code>Button</code> stack.</li>
          <li>Hero panel hides on small screens (<code>lg:flex</code>) — form only on mobile.</li>
        </ul>
      </DocsSection>

      <DocsSection title="When to use">
        <ul className="text-sm text-text-sub-600 space-y-1.5 list-disc pl-6">
          <li><strong>Use</strong> for public-facing Dash routes — mitra recruitment landing, partner portal.</li>
          <li><strong>Use</strong> when brand storytelling matters more than speed-to-form.</li>
          <li><strong>Use</strong> when you can ship a testimonial / social proof on the hero.</li>
          <li><strong>Don't</strong> use for internal backoffice login — <code>Login 01</code>/<code>02</code> is faster and cheaper.</li>
          <li><strong>Don't</strong> use inside modals — too tall, breaks the modal envelope.</li>
        </ul>
      </DocsSection>
      <DocsSection title="Magic link vs password">
        <p className="text-sm text-text-sub-600 max-w-2xl">
          Magic-link blocks remove password entry entirely. Don't show password field as 'optional fallback' — the value of magic link is the single-action flow.
        </p>
        <DocsDoDont
          do={{
            preview: (
              <div className="w-full max-w-xs space-y-3">
                <div className="h-10 rounded-lg border border-stroke-soft-200 bg-bg-white-0 px-3 text-xs text-text-sub-600 flex items-center">budi@dash.id</div>
                <div className="h-10 rounded-lg bg-primary-base text-static-white text-xs font-medium flex items-center justify-center">Kirim magic link</div>
                <p className="text-[10px] text-text-soft-400 text-center">Link akan dikirim ke email Anda</p>
              </div>
            ),
            caption: "Single email field + send-link CTA. The next surface is the inbox — clear, fast, one path.",
          }}
          dont={{
            preview: (
              <div className="w-full max-w-xs space-y-2">
                <div className="h-9 rounded-lg border border-stroke-soft-200 bg-bg-white-0 text-xs text-text-sub-600 flex items-center px-3">Email</div>
                <div className="h-9 rounded-lg border border-stroke-soft-200 bg-bg-white-0 text-xs text-text-sub-600 flex items-center px-3">Password (opsional)</div>
                <div className="h-9 rounded-lg bg-primary-base text-static-white text-xs font-medium flex items-center justify-center">Masuk atau kirim link</div>
              </div>
            ),
            caption: "Don't bolt password as an optional field. It collapses the magic-link promise and leaves the user choosing between two flows.",
          }}
        />
      </DocsSection>

      <DocsSection title="Confirmation surface">
        <p className="text-sm text-text-sub-600 max-w-2xl">
          After magic-link send, replace the form with a clear confirmation. Tell the user what to do next, not just that something happened.
        </p>
        <DocsDoDont
          do={{
            preview: (
              <div className="w-full max-w-xs space-y-3 text-center">
                <div className="size-12 rounded-full bg-success-lighter text-success-base mx-auto flex items-center justify-center text-lg">✓</div>
                <p className="text-sm font-medium">Cek email Anda</p>
                <p className="text-xs text-text-sub-600">Kami kirim link ke budi@dash.id. Buka inbox dan klik untuk masuk.</p>
                <button className="text-xs text-primary-base underline">Kirim ulang</button>
              </div>
            ),
            caption: "Confirmation includes the destination email (so user can spot typo), clear next step, and resend escape hatch.",
          }}
          dont={{
            preview: (
              <div className="w-full max-w-xs space-y-3 text-center">
                <p className="text-sm font-medium">Link dikirim</p>
                <p className="text-xs text-text-soft-400">OK</p>
              </div>
            ),
            caption: "Don't terminate the flow with a flat 'Link dikirim' message. The user doesn't know which email, when to check, or how to retry.",
          }}
        />
      </DocsSection>
        </DocsPageShell>
  )
}
