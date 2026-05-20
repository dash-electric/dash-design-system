"use client"

import { SettingsPrivacySecurity } from "@/registry/dash/blocks/settings-privacy-security"
import {
  DocsPageShell,
  DocsHeader,
  DocsSection,
  DocsExample,
  DocsDoDont,
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
      <DocsSection title="2FA prominence">
        <p className="text-sm text-text-sub-600 max-w-2xl">
          Two-factor auth is the highest-impact security control. Surface it at the top with clear status, not buried in a list of toggles.
        </p>
        <DocsDoDont
          do={{
            preview: (
              <div className="w-full max-w-sm space-y-3">
                <div className="rounded-lg border border-warning-base bg-warning-lighter/30 p-3 space-y-2"><p className="text-xs font-medium text-warning-dark">2FA belum diaktifkan</p><p className="text-[10px] text-text-sub-600">Lindungi akun Dash Anda dengan kode dari authenticator app.</p><button className="h-7 px-3 rounded-md bg-primary-base text-static-white text-[10px] font-medium">Aktifkan 2FA</button></div>
              </div>
            ),
            caption: "2FA gets a hero card at the top, color-coded by status (warning when off, success when on).",
          }}
          dont={{
            preview: (
              <div className="w-full max-w-sm space-y-1.5 text-xs">
                <div className="flex justify-between p-2"><span>Receive newsletter</span><div className="w-8 h-4 rounded-full bg-primary-base" /></div>
                <div className="flex justify-between p-2"><span>Allow analytics</span><div className="w-8 h-4 rounded-full bg-primary-base" /></div>
                <div className="flex justify-between p-2"><span>Two-factor authentication</span><div className="w-8 h-4 rounded-full bg-bg-soft-200" /></div>
                <div className="flex justify-between p-2"><span>Email notifications</span><div className="w-8 h-4 rounded-full bg-primary-base" /></div>
              </div>
            ),
            caption: "Don't bury 2FA between newsletter and email toggles. Critical security control deserves prominent placement.",
          }}
        />
      </DocsSection>

      <DocsSection title="Active session visibility">
        <p className="text-sm text-text-sub-600 max-w-2xl">
          List active sessions with device + location + last-active. Let the user revoke any session they don't recognize.
        </p>
        <DocsDoDont
          do={{
            preview: (
              <div className="w-full max-w-sm space-y-2">
                <div className="rounded-lg border border-stroke-soft-200 bg-bg-white-0 p-2 flex items-center justify-between text-xs"><div><p className="font-medium">MacBook Pro · Chrome</p><p className="text-[10px] text-text-sub-600">Jakarta, ID · Aktif sekarang</p></div><span className="text-[9px] rounded-full bg-success-lighter text-success-dark px-2 py-0.5">Sesi ini</span></div>
                <div className="rounded-lg border border-stroke-soft-200 bg-bg-white-0 p-2 flex items-center justify-between text-xs"><div><p className="font-medium">iPhone 15 · Dash app</p><p className="text-[10px] text-text-sub-600">Bandung, ID · 2 jam lalu</p></div><button className="text-[9px] text-error-base underline">Keluar</button></div>
              </div>
            ),
            caption: "Each session card shows device, location, last activity, and a revoke button. Current session is labelled but not revokable.",
          }}
          dont={{
            preview: (
              <div className="w-full max-w-sm space-y-1 text-xs">
                <div className="rounded-lg border border-stroke-soft-200 bg-bg-white-0 p-2">Session 1</div>
                <div className="rounded-lg border border-stroke-soft-200 bg-bg-white-0 p-2">Session 2</div>
                <div className="rounded-lg border border-stroke-soft-200 bg-bg-white-0 p-2">Session 3</div>
              </div>
            ),
            caption: "Don't list sessions as bare 'Session 1, 2, 3'. The user can't recognize which one is theirs vs which one is suspicious.",
          }}
        />
      </DocsSection>
        </DocsPageShell>
  )
}
