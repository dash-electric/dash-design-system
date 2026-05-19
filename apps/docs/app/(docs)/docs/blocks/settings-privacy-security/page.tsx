"use client"

import { SettingsPrivacySecurity } from "@/registry/dash/blocks/settings-privacy-security"
import {
  DocsPageShell,
  DocsHeader,
  DocsSection,
  DocsExample,
} from "@/components/docs/page-shell"
import { DocsCode } from "@/components/docs/code-block"

export default function SettingsPrivacySecurityDocsPage() {
  return (
    <DocsPageShell>
      <DocsHeader
        category="Blocks / Settings"
        title="Settings Privacy & Security"
        description="Password reset, MFA toggle, active session list, account deletion. The serious-business settings tab — destructive actions guarded by AlertDialog."
      />

      <DocsSection title="Install">
        <DocsCode language="bash" code={`dash add settings-privacy-security`} />
      </DocsSection>

      <DocsSection title="Preview">
        <DocsExample
          title="Account security"
          preview={
            <div className="w-full rounded-xl border border-stroke-soft-200 bg-bg-white-0 p-6">
              <SettingsPrivacySecurity />
            </div>
          }
          code={`<SettingsPrivacySecurity />`}
        />
      </DocsSection>

      <DocsSection title="Composition">
        <ul className="text-sm text-text-sub-600 space-y-1.5 list-disc pl-5">
          <li>Password row — current + new + confirm with strength meter.</li>
          <li>MFA — <code>Switch</code> toggle + recovery code download.</li>
          <li>Active sessions — list with device + location + last active + Revoke button per row.</li>
          <li>Danger zone — Delete account button gated by destructive <code>AlertDialog</code>.</li>
        </ul>
      </DocsSection>

      <DocsSection title="When to use">
        <ul className="text-sm text-text-sub-600 space-y-1.5 list-disc pl-5">
          <li><strong>Use</strong> on Settings → Privacy & security tab.</li>
          <li><strong>Use</strong> when GDPR-style user controls are required (data export, deletion).</li>
          <li><strong>Don't</strong> use for org-wide security policies — those are admin-only and belong elsewhere.</li>
          <li><strong>Don't</strong> use for IP allow-list config — different mental model (org-scoped, not user-scoped).</li>
        </ul>
      </DocsSection>
    </DocsPageShell>
  )
}
