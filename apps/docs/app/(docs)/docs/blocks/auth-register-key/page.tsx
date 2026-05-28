"use client"

import { AuthRegisterKey } from "@/registry/dash/blocks/auth-register-key"
import {
  DocsPageShell,
  DocsHeader,
  DocsSection,
  DocsExample,
} from "@/components/docs/page-shell"
import { DocsCode } from "@/components/docs/code-block"

export default function AuthRegisterKeyDocsPage() {
  return (
    <DocsPageShell>
      <DocsHeader
        category="Blocks / Auth"
        title="Auth Register (Key icon)"
        description="Register Key pattern. 96×96 key-icon header → first/last/email/password → FancyButton CTA → T&C / privacy legal copy."
      />

      <DocsSection title="Install">
        <DocsCode language="bash" code={`dash add auth-register-key`} />
      </DocsSection>

      <DocsSection title="Preview">
        <DocsExample
          title="Default — Buat akun baru"
          preview={
            <div className="w-full rounded-xl border border-stroke-soft-200 bg-bg-white-0 p-6 flex items-center justify-center min-h-[680px]">
              <AuthRegisterKey />
            </div>
          }
          code={`<AuthRegisterKey />`}
        />
      </DocsSection>

      <DocsSection title="Composition">
        <ul className="text-sm text-text-sub-600 space-y-1.5 list-disc pl-6">
          <li>Legal copy fixed below the CTA — T&C + Privacy links via <code>LinkButton tone="muted"</code>.</li>
          <li>Width fixed 440 px to match the rest of the Key family.</li>
        </ul>
      </DocsSection>
    </DocsPageShell>
  )
}
