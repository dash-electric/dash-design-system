"use client"

import { SignupBlock01 } from "@/registry/dash/blocks/signup-01"
import {
  DocsPageShell,
  DocsHeader,
  DocsSection,
  DocsExample,
} from "@/components/docs/page-shell"
import { DocsCode } from "@/components/docs/code-block"

export default function SignupBlock01DocsPage() {
  return (
    <DocsPageShell>
      <DocsHeader
        category="Blocks / Auth"
        title="Signup 01"
        description="Classic signup — name, email, password, terms agreement. The minimum-friction Daftar Dash form for internal account creation."
      />

      <DocsSection title="Install">
        <DocsCode language="bash" code={`dash add signup-01`} />
      </DocsSection>

      <DocsSection title="Preview">
        <DocsExample
          title="Default — Daftar Dash"
          preview={
            <div className="w-full rounded-xl border border-stroke-soft-200 bg-bg-white-0 p-6 flex items-center justify-center min-h-[480px]">
              <SignupBlock01 />
            </div>
          }
          code={`<SignupBlock01 />`}
        />
      </DocsSection>

      <DocsSection title="Composition">
        <ul className="text-sm text-text-sub-600 space-y-1.5 list-disc pl-5">
          <li>Standard <code>InputRoot</code> + <code>Label</code> stack: nama, email kerja, password.</li>
          <li>Terms agreement uses <code>Checkbox</code> with inline <code>LinkButton</code> for ToS + Privacy.</li>
          <li>Submit <code>Button</code> is full width, primary tone.</li>
          <li>Pair with <code>AuthShell variant="centered"</code> for the page chrome.</li>
        </ul>
      </DocsSection>

      <DocsSection title="When to use">
        <ul className="text-sm text-text-sub-600 space-y-1.5 list-disc pl-5">
          <li><strong>Use</strong> for internal Dash account creation (PE invitations).</li>
          <li><strong>Use</strong> when KYC is handled later in a separate flow.</li>
          <li><strong>Don't</strong> use for mitra signup — they need tribe selection inline; reach for <code>FormStepperPage</code>.</li>
          <li><strong>Don't</strong> use when SSO covers 100% of signups — go straight to <code>Signup 02</code>.</li>
        </ul>
      </DocsSection>
    </DocsPageShell>
  )
}
