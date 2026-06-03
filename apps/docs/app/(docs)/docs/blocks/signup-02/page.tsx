"use client"

import { SignupBlock02 } from "@/registry/dash/blocks/signup-02"
import {
  DocsPageShell,
  DocsHeader,
  DocsSection,
  DocsExample,
  DocsDoDont,
} from "@/components/docs/page-shell"
import { DocsCode } from "@/components/docs/code-block"

export default function SignupBlock02DocsPage() {
  return (
    <DocsPageShell>
      <DocsHeader
        category="Blocks / Auth"
        title="Signup 02"
        description="Signup with SSO buttons above the email/password fallback. Matches Login 02 visual pattern so users see consistent auth chrome across login and signup."
      />

      <DocsSection title="Install">
        <DocsCode language="bash" code={`dashkit add signup-02`} />
      </DocsSection>

      <DocsSection title="Preview">
        <DocsExample
          title="With SSO"
          preview={
            <div className="w-full rounded-xl border border-stroke-soft-200 bg-bg-white-0 p-6 flex items-center justify-center min-h-[520px]">
              <SignupBlock02 />
            </div>
          }
          code={`<SignupBlock02 />`}
        />
      </DocsSection>

      <DocsSection title="Composition">
        <ul className="text-sm text-text-sub-600 space-y-1.5 list-disc pl-6">
          <li>Top: <code>SocialButton brand="google"</code> + <code>SocialButton brand="apple"</code>.</li>
          <li><code>Divider</code> with "atau" caption.</li>
          <li>Bottom: name + email + password + terms checkbox + submit.</li>
          <li>Pair with the centered or split <code>AuthShell</code> variant — both work.</li>
        </ul>
      </DocsSection>

      <DocsSection title="When to use">
        <ul className="text-sm text-text-sub-600 space-y-1.5 list-disc pl-6">
          <li><strong>Use</strong> when SSO is the preferred signup path but you still accept fallback emails.</li>
          <li><strong>Use</strong> for tribe leadership and developer invitations (Google Workspace).</li>
          <li><strong>Don't</strong> use for mitra mass-recruitment — they don't have SSO; use <code>Signup 01</code> or stepper.</li>
        </ul>
      </DocsSection>
      <DocsSection title="SSO signup parity">
        <p className="text-sm text-text-sub-600 max-w-2xl">
          If the user can sign up with Google, also let them sign in with Google. Don't split signup-only and login-only SSO surfaces.
        </p>
        <DocsDoDont
          do={{
            preview: (
              <div className="w-full max-w-xs space-y-2">
                <div className="h-10 rounded-lg border border-stroke-strong-950 text-xs font-medium flex items-center justify-center">Daftar dengan Google</div>
                <div className="text-center text-[10px] text-text-soft-400">Sudah punya akun? <span className="text-primary-base underline">Masuk</span></div>
              </div>
            ),
            caption: "Same SSO providers across signup + login. User who signs up with Google can sign in with Google without confusion.",
          }}
          dont={{
            preview: (
              <div className="w-full max-w-xs space-y-2">
                <div className="h-10 rounded-lg border border-stroke-strong-950 text-xs font-medium flex items-center justify-center">Daftar dengan Google</div>
                <div className="h-10 rounded-lg border border-stroke-strong-950 text-xs font-medium flex items-center justify-center">Daftar dengan Apple</div>
                <div className="h-10 rounded-lg border border-stroke-strong-950 text-xs font-medium flex items-center justify-center">Daftar dengan Microsoft</div>
                <div className="h-10 rounded-lg border border-stroke-strong-950 text-xs font-medium flex items-center justify-center">Daftar dengan Slack</div>
              </div>
            ),
            caption: "Don't list four SSO providers if your login surface only supports two. Users will signup via the provider they can't log in with later.",
          }}
        />
      </DocsSection>

      <DocsSection title="Legal consent placement">
        <p className="text-sm text-text-sub-600 max-w-2xl">
          Terms + privacy checkbox sits above the submit button, never hidden in fine print after.
        </p>
        <DocsDoDont
          do={{
            preview: (
              <div className="w-full max-w-xs space-y-2">
                <div className="h-9 rounded-lg border border-stroke-soft-200 bg-bg-white-0 text-xs text-text-sub-600 flex items-center px-3">budi@dash.id</div>
                <div className="flex items-start gap-2"><div className="size-4 rounded border border-stroke-strong-950 mt-0.5" /><p className="text-[10px] text-text-sub-600">Saya menyetujui <span className="text-primary-base underline">Syarat</span> dan <span className="text-primary-base underline">Privasi</span>.</p></div>
                <div className="h-9 rounded-lg bg-primary-base text-static-white text-xs font-medium flex items-center justify-center">Daftar</div>
              </div>
            ),
            caption: "Consent checkbox is visible, required, and right above the submit. The user actively opts in before the action.",
          }}
          dont={{
            preview: (
              <div className="w-full max-w-xs space-y-2">
                <div className="h-9 rounded-lg border border-stroke-soft-200 bg-bg-white-0 text-xs text-text-sub-600 flex items-center px-3">budi@dash.id</div>
                <div className="h-9 rounded-lg bg-primary-base text-static-white text-xs font-medium flex items-center justify-center">Daftar</div>
                <p className="text-[8px] text-text-soft-400">Dengan klik Daftar Anda menyetujui Syarat dan Privasi kami.</p>
              </div>
            ),
            caption: "Don't pre-consent silently in a 6pt footnote. Implicit consent is fragile legally and unfair to the user.",
          }}
        />
      </DocsSection>
        </DocsPageShell>
  )
}
