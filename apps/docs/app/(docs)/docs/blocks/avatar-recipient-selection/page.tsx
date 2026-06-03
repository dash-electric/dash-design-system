"use client"

import { AvatarRecipientSelection } from "@/registry/dash/blocks/avatar-recipient-selection"
import {
  DocsPageShell,
  DocsHeader,
  DocsSection,
  DocsExample,
  DocsPropsTable,
} from "@/components/docs/page-shell"
import { DocsCode } from "@/components/docs/code-block"

export default function AvatarRecipientSelectionDocsPage() {
  return (
    <DocsPageShell>
      <DocsHeader
        category="Blocks / Composition Examples"
        title="Avatar — Recipient Selection"
        description="Composition example: saved-recipients picker for transfer / send-money flows. Avatar grid + 'New Recipient' affordance."
      />

      <DocsSection title="Install">
        <DocsCode language="bash" code={`dashkit add avatar-recipient-selection`} />
      </DocsSection>

      <DocsSection title="Examples">
        <DocsExample
          title="Saved Recipients"
          description="Tap a recipient avatar or 'New Recipient' to start a transfer."
          preview={
            <div className="w-full max-w-md rounded-xl border border-stroke-soft-200 bg-bg-white-0 p-6">
              <AvatarRecipientSelection />
            </div>
          }
          code={`<AvatarRecipientSelection
  recipients={[/* Recipient[] */]}
  onSelect={(id) => {}}
  onNewRecipient={() => {}}
/>`}
        />
      </DocsSection>

      <DocsSection title="Composition">
        <ul className="text-sm text-text-sub-600 space-y-1.5 list-disc pl-6">
          <li>Section heading + horizontal scroll row of <code>Avatar</code>s.</li>
          <li>First slot = 'New Recipient' <code>IconButton</code> with dashed border.</li>
        </ul>
      </DocsSection>

      <DocsSection title="API">
        <DocsPropsTable
          rows={[
            { name: "recipients", type: "Recipient[]", description: "{ id, name, avatarSrc?, initials? }." },
            { name: "title", type: "string", defaultValue: '"Saved Recipients"', description: "Section heading." },
            { name: "onSelect", type: "(id: string) => void", description: "Recipient tap handler." },
            { name: "onNewRecipient", type: "() => void", description: "'New Recipient' tap handler." },
            { name: "className", type: "string", description: "Outer wrapper class." },
          ]}
        />
      </DocsSection>
    </DocsPageShell>
  )
}
