"use client"

import { LoginBlock03 } from "@/registry/dash/blocks/login-03"
import {
  DocsPageShell,
  DocsHeader,
  DocsSection,
  DocsExample,
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
        <DocsCode language="bash" code={`dash add login-03`} />
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
        <ul className="text-sm text-text-sub-600 space-y-1.5 list-disc pl-5">
          <li>Self-contained — wraps its own rounded card; no <code>AuthShell</code> wrapper needed.</li>
          <li>Hero panel uses Dash purple gradient (<code>--dash-purple-700</code> → <code>--dash-purple-900</code>) with blurred-circle accents.</li>
          <li>Includes a <code>Badge</code> for promo labels (e.g. "Lebaran rate freeze").</li>
          <li>Right pane uses the standard <code>InputRoot</code> + <code>Label</code> + <code>Button</code> stack.</li>
          <li>Hero panel hides on small screens (<code>lg:flex</code>) — form only on mobile.</li>
        </ul>
      </DocsSection>

      <DocsSection title="When to use">
        <ul className="text-sm text-text-sub-600 space-y-1.5 list-disc pl-5">
          <li><strong>Use</strong> for public-facing Dash routes — mitra recruitment landing, partner portal.</li>
          <li><strong>Use</strong> when brand storytelling matters more than speed-to-form.</li>
          <li><strong>Use</strong> when you can ship a testimonial / social proof on the hero.</li>
          <li><strong>Don't</strong> use for internal backoffice login — <code>Login 01</code>/<code>02</code> is faster and cheaper.</li>
          <li><strong>Don't</strong> use inside modals — too tall, breaks the modal envelope.</li>
        </ul>
      </DocsSection>
    </DocsPageShell>
  )
}
