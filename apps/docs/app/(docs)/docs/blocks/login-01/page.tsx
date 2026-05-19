"use client"

import { LoginBlock01 } from "@/registry/dash/blocks/login-01"
import {
  DocsPageShell,
  DocsHeader,
  DocsSection,
  DocsExample,
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
        <DocsCode language="bash" code={`dash add login-01`} />
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
          <li><strong>Use</strong> for internal Dash login (PE, Halo-dash Ops, tribe leadership).</li>
          <li><strong>Use</strong> when you have no SSO / IdP and email+password is the only path.</li>
          <li><strong>Don't</strong> use when SSO is preferred — reach for <code>Login 02</code> with social buttons.</li>
          <li><strong>Don't</strong> use for public signup — pair <code>Signup 01</code> with the split <code>AuthShell</code> variant.</li>
        </ul>
      </DocsSection>
    </DocsPageShell>
  )
}
