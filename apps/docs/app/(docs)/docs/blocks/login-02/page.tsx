"use client"

import { LoginBlock02 } from "@/registry/dash/blocks/login-02"
import {
  DocsPageShell,
  DocsHeader,
  DocsSection,
  DocsExample,
} from "@/components/docs/page-shell"
import { DocsCode } from "@/components/docs/code-block"

export default function LoginBlock02DocsPage() {
  return (
    <DocsPageShell>
      <DocsHeader
        category="Blocks / Auth"
        title="Login 02"
        description="SSO-first login — Google + Apple social buttons above the email/password fallback. The recommended Dash login for any team using Google Workspace."
      />

      <DocsSection title="Install">
        <DocsCode language="bash" code={`dash add login-02`} />
      </DocsSection>

      <DocsSection title="Preview">
        <DocsExample
          title="With SSO"
          description="Lanjut dengan Google / Apple di atas form email+password."
          preview={
            <div className="w-full rounded-xl border border-stroke-soft-200 bg-bg-white-0 p-6 flex items-center justify-center min-h-[480px]">
              <LoginBlock02 />
            </div>
          }
          code={`<LoginBlock02 />`}
        />
      </DocsSection>

      <DocsSection title="Composition">
        <ul className="text-sm text-text-sub-600 space-y-1.5 list-disc pl-5">
          <li>Uses <code>SocialButton</code> for Google + Apple brand-correct CTAs.</li>
          <li><code>Divider</code> with absolute-positioned "atau" caption separates SSO from credentials.</li>
          <li>Same <code>InputRoot</code> + <code>Label</code> + <code>Button</code> stack as Login 01 for the fallback.</li>
          <li>Swap <code>brand</code> prop on <code>SocialButton</code> to add Microsoft, GitHub, Slack as needed.</li>
        </ul>
      </DocsSection>

      <DocsSection title="When to use">
        <ul className="text-sm text-text-sub-600 space-y-1.5 list-disc pl-5">
          <li><strong>Use</strong> when Dash users are on Google Workspace (default for PE + Ops).</li>
          <li><strong>Use</strong> when password fatigue is a known support issue — SSO cuts password reset tickets.</li>
          <li><strong>Don't</strong> use when SSO infra isn't yet wired — show only what works.</li>
          <li><strong>Don't</strong> use for public mitra recruitment — they don't have <code>@dash.id</code> Google accounts.</li>
        </ul>
      </DocsSection>
    </DocsPageShell>
  )
}
