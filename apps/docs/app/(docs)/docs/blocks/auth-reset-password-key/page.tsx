"use client"

import { AuthResetPasswordKey } from "@/registry/dash/blocks/auth-reset-password-key"
import {
  DocsPageShell,
  DocsHeader,
  DocsSection,
  DocsExample,
} from "@/components/docs/page-shell"
import { DocsCode } from "@/components/docs/code-block"

export default function AuthResetPasswordKeyDocsPage() {
  return (
    <DocsPageShell>
      <DocsHeader
        category="Blocks / Auth"
        title="Auth Reset Password (Key icon)"
        description="Reset Password Key pattern. 96×96 key-icon header → email → FancyButton CTA → support link. Single-step send-reset-link flow."
      />

      <DocsSection title="Install">
        <DocsCode language="bash" code={`dashkit add auth-reset-password-key`} />
      </DocsSection>

      <DocsSection title="Preview">
        <DocsExample
          title="Default — Reset password"
          preview={
            <div className="w-full rounded-xl border border-stroke-soft-200 bg-bg-white-0 p-6 flex items-center justify-center min-h-[500px]">
              <AuthResetPasswordKey />
            </div>
          }
          code={`<AuthResetPasswordKey />`}
        />
      </DocsSection>

      <DocsSection title="Composition">
        <ul className="text-sm text-text-sub-600 space-y-1.5 list-disc pl-5">
          <li>One-step request flow — pair with a success state screen after submit.</li>
          <li>Support link sits in the footer for users locked out beyond reset.</li>
        </ul>
      </DocsSection>
    </DocsPageShell>
  )
}
