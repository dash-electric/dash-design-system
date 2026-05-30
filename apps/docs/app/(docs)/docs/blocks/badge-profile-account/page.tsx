"use client"

import { BadgeProfileAccount } from "@/registry/dash/blocks/badge-profile-account"
import {
  DocsPageShell,
  DocsHeader,
  DocsSection,
  DocsExample,
  DocsPropsTable,
} from "@/components/docs/page-shell"
import { DocsCode } from "@/components/docs/code-block"

export default function BadgeProfileAccountDocsPage() {
  return (
    <DocsPageShell>
      <DocsHeader
        category="Blocks / Composition Examples"
        title="Badge — Profile Account Menu"
        description="Composition example: account-switcher dropdown anchored to an avatar trigger. Shows plan badge + settings / integrations / dark-mode toggle / logout actions."
      />

      <DocsSection title="Install">
        <DocsCode language="bash" code={`dashkit add badge-profile-account`} />
      </DocsSection>

      <DocsSection title="Examples">
        <DocsExample
          title="Default avatar dropdown"
          description="Click the avatar to open the account menu."
          preview={
            <div className="flex w-full justify-center rounded-xl border border-stroke-soft-200 bg-bg-white-0 p-12">
              <BadgeProfileAccount />
            </div>
          }
          code={`<BadgeProfileAccount
  account={{ name: "Sophia", email: "sophia@acme.com", plan: "Pro" }}
  onSettings={() => {}}
  onIntegrations={() => {}}
  onLogout={() => {}}
/>`}
        />
      </DocsSection>

      <DocsSection title="Composition">
        <ul className="text-sm text-text-sub-600 space-y-1.5 list-disc pl-5">
          <li><code>DropdownMenu</code> anchored to an <code>Avatar</code> trigger.</li>
          <li>Header row — avatar + name + plan <code>Badge</code>.</li>
          <li>Menu items — Settings, Integrations, Dark Mode <code>Switch</code>, Logout.</li>
        </ul>
      </DocsSection>

      <DocsSection title="API">
        <DocsPropsTable
          rows={[
            { name: "account", type: "ProfileAccount", description: "{ name, email, avatarSrc?, plan }." },
            { name: "trigger", type: "ReactNode", description: "Custom trigger node (defaults to avatar)." },
            { name: "onSettings", type: "() => void", description: "Settings menu action." },
            { name: "onIntegrations", type: "() => void", description: "Integrations menu action." },
            { name: "onLogout", type: "() => void", description: "Logout menu action." },
            { name: "darkMode", type: "boolean", description: "Controlled dark-mode value." },
            { name: "onDarkModeChange", type: "(next: boolean) => void", description: "Dark-mode toggle change handler." },
          ]}
        />
      </DocsSection>
    </DocsPageShell>
  )
}
