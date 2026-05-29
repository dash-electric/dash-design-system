"use client"

import { LoginBlock01 } from "@/registry/dash/blocks/login-01"
import {
  DocsPageShell,
  DocsHeader,
  DocsSection,
  DocsExample,
  DocsDoDont,
} from "@/components/docs/page-shell"
import { DocsCode } from "@/components/docs/code-block"

export default function LoginBlock01DocsPage() {
  return (
    <DocsPageShell>
      <DocsHeader
        category="Blocks / Auth"
        title="Login 01"
        description="Classic email + password centered form with remember-me checkbox and forgot-password link. The default Dash login experience — fast, no friction, no SSO."
      />

      <DocsSection title="Install">
        <DocsCode language="bash" code={`dashkit add login-01`} />
      </DocsSection>

      <DocsSection title="Preview">
        <DocsExample
          title="Default — Masuk ke Dash"
          description="Render standalone or compose inside AuthShell (centered variant)."
          preview={
            <div className="w-full rounded-xl border border-stroke-soft-200 bg-bg-white-0 p-6 flex items-center justify-center min-h-[420px]">
              <LoginBlock01 />
            </div>
          }
          code={`<LoginBlock01 />`}
        />
      </DocsSection>

      <DocsSection title="Composition">
        <ul className="text-sm text-text-sub-600 space-y-1.5 list-disc pl-5">
          <li>Uses @dash primitives: <code>InputRoot</code> + <code>Input</code> + <code>InputIcon</code>, <code>Label</code>, <code>Checkbox</code>, <code>Button</code>.</li>
          <li>Icon-prefixed inputs — <code>Mail</code> and <code>Lock</code> from lucide.</li>
          <li>"Lupa password?" link wired to <code>/forgot-password</code>; swap with your route.</li>
          <li>Submit button uses <code>tone="primary"</code> + <code>style="filled"</code> — full width.</li>
          <li>Drop inside <code>AuthShell</code> for the full page chrome, or render standalone for embedded auth modals.</li>
        </ul>
      </DocsSection>

      <DocsSection title="When to use">
        <ul className="text-sm text-text-sub-600 space-y-1.5 list-disc pl-5">
          <li><strong>Use</strong> for internal Dash login (developers, Halo-dash Ops, tribe leadership).</li>
          <li><strong>Use</strong> when you have no SSO / IdP and email+password is the only path.</li>
          <li><strong>Don't</strong> use when SSO is preferred — reach for <code>Login 02</code> with social buttons.</li>
          <li><strong>Don't</strong> use for public signup — pair <code>Signup 01</code> with the split <code>AuthShell</code> variant.</li>
        </ul>
      </DocsSection>

      <DocsSection title="Action hierarchy">
        <p className="text-sm text-text-sub-600 max-w-2xl">
          The form should have exactly one primary CTA. Forgot-password lives as a secondary link, never another button.
        </p>
        <DocsDoDont
          do={{
            preview: (
              <div className="w-full max-w-xs space-y-3">
                <div className="h-10 rounded-lg border border-stroke-soft-200 bg-bg-white-0 px-3 text-xs text-text-sub-600 flex items-center">budi@dash.id</div>
                <div className="h-10 rounded-lg border border-stroke-soft-200 bg-bg-white-0 px-3 text-xs text-text-sub-600 flex items-center">••••••••</div>
                <div className="h-10 rounded-lg bg-primary-base text-static-white text-xs font-medium flex items-center justify-center">Masuk ke Dash</div>
                <div className="text-center"><span className="text-xs text-primary-base underline">Lupa password?</span></div>
              </div>
            ),
            caption: "One filled primary CTA. Forgot-password is a small text link below — never competes visually with the submit action.",
          }}
          dont={{
            preview: (
              <div className="w-full max-w-xs space-y-3">
                <div className="h-10 rounded-lg border border-stroke-soft-200 bg-bg-white-0 px-3 text-xs text-text-sub-600 flex items-center">budi@dash.id</div>
                <div className="h-10 rounded-lg border border-stroke-soft-200 bg-bg-white-0 px-3 text-xs text-text-sub-600 flex items-center">••••••••</div>
                <div className="h-10 rounded-lg bg-primary-base text-static-white text-xs font-medium flex items-center justify-center">Masuk</div>
                <div className="h-10 rounded-lg border border-stroke-strong-950 text-xs font-medium flex items-center justify-center">Lupa password?</div>
              </div>
            ),
            caption: "Don't promote forgot-password to a button. Two equally-weighted actions make the user pause and read both — kills the primary path.",
          }}
        />
      </DocsSection>

      <DocsSection title="Email-first, SSO if any">
        <p className="text-sm text-text-sub-600 max-w-2xl">
          Login 01 is the email + password block. Don't bolt social SSO buttons larger than the primary form — that's what Login 02 exists for.
        </p>
        <DocsDoDont
          do={{
            preview: (
              <div className="w-full max-w-xs space-y-2">
                <div className="h-9 rounded-lg border border-stroke-soft-200 bg-bg-white-0 text-xs text-text-sub-600 flex items-center px-3">Email</div>
                <div className="h-9 rounded-lg border border-stroke-soft-200 bg-bg-white-0 text-xs text-text-sub-600 flex items-center px-3">Password</div>
                <div className="h-9 rounded-lg bg-primary-base text-static-white text-xs font-medium flex items-center justify-center">Masuk ke Dash</div>
              </div>
            ),
            caption: "Email + password form sits at full width. Submit button is the only filled element. Matches the Halo-dash Ops login experience.",
          }}
          dont={{
            preview: (
              <div className="w-full max-w-xs space-y-2">
                <div className="h-12 rounded-lg border border-stroke-strong-950 text-xs font-medium flex items-center justify-center">Continue with Google</div>
                <div className="h-12 rounded-lg border border-stroke-strong-950 text-xs font-medium flex items-center justify-center">Continue with Apple</div>
                <div className="text-center text-[10px] text-text-soft-400">or</div>
                <div className="h-7 rounded border border-stroke-soft-200 bg-bg-white-0 text-[10px] text-text-soft-400 flex items-center px-2">Email</div>
              </div>
            ),
            caption: "Don't dwarf the email form with oversized SSO buttons. If SSO is the primary path, switch to Login 02 — Login 01 is email-first by contract.",
          }}
        />
      </DocsSection>
    </DocsPageShell>
  )
}
