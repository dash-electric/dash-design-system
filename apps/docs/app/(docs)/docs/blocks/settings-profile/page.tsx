"use client"

import { SettingsProfile } from "@/registry/dash/blocks/settings-profile"
import {
  DocsPageShell,
  DocsHeader,
  DocsSection,
  DocsExample,
} from "@/components/docs/page-shell"
import { DocsCode } from "@/components/docs/code-block"

export default function SettingsProfileDocsPage() {
  return (
    <DocsPageShell>
      <DocsHeader
        category="Blocks / Settings"
        title="Settings Profile"
        description="Profile settings form — avatar + name + email + role + bio. Used as the Profile tab content inside SettingsTabsPage. Mitra-account-flavored copy by default."
      />

      <DocsSection title="Install">
        <DocsCode language="bash" code={`dash add settings-profile`} />
      </DocsSection>

      <DocsSection title="Preview">
        <DocsExample
          title="Mitra profile"
          preview={
            <div className="w-full rounded-xl border border-stroke-soft-200 bg-bg-white-0 p-6">
              <SettingsProfile />
            </div>
          }
          code={`<SettingsProfile />`}
        />
      </DocsSection>

      <DocsSection title="Composition">
        <ul className="text-sm text-text-sub-600 space-y-1.5 list-disc pl-5">
          <li>Top — <code>Avatar</code> with Upload/Remove buttons.</li>
          <li><code>FieldGroup</code> + <code>Field</code> + <code>Label</code> + <code>InputRoot</code> stack for name, email, phone, role.</li>
          <li>Bio uses <code>Textarea</code>.</li>
          <li>Footer — Save changes <code>Button</code> + Cancel link.</li>
          <li>Drop directly inside <code>SettingsTabsPage</code> body when <code>activeId === "profile"</code>.</li>
        </ul>
      </DocsSection>

      <DocsSection title="When to use">
        <ul className="text-sm text-text-sub-600 space-y-1.5 list-disc pl-5">
          <li><strong>Use</strong> as the Profile tab of any Settings hub.</li>
          <li><strong>Use</strong> as a standalone "edit profile" page.</li>
          <li><strong>Don't</strong> use for KYC document upload — that's a different flow (FormStepperPage + FileUpload).</li>
        </ul>
      </DocsSection>
    </DocsPageShell>
  )
}
