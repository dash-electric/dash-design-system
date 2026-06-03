"use client"

import { SectionHeader, SectionHeaderDefaultActions } from "@/registry/dash/blocks/section-header"
import {
  DocsPageShell,
  DocsHeader,
  DocsSection,
  DocsExample,
  DocsPropsTable,
} from "@/components/docs/page-shell"
import { DocsCode } from "@/components/docs/code-block"

export default function SectionHeaderDocsPage() {
  return (
    <DocsPageShell>
      <DocsHeader
        category="Blocks / Layout Headers"
        title="Section Header"
        description="In-page section heading block — tighter than Page Header, with optional inline compact button next to the title. 5 leading variants (basic / avatar / icon / brand / company) ported 1:1 from AlignUI Pro Figma."
      />

      <DocsSection title="Install">
        <DocsCode language="bash" code={`dashkit add section-header`} />
      </DocsSection>

      <DocsSection title="Examples">
        <DocsExample
          title="Basic"
          description="Title + description + actions row, tighter typography than Page Header."
          preview={
            <div className="w-full rounded-xl border border-stroke-soft-200 bg-bg-white-0 p-6">
              <SectionHeader
                title="Team members"
                description="Invite, manage, and remove members from your workspace."
                actions={<SectionHeaderDefaultActions />}
              />
            </div>
          }
          code={`<SectionHeader
  title="Team members"
  description="Invite, manage, and remove members."
  actions={<SectionHeaderDefaultActions />}
/>`}
        />
      </DocsSection>

      <DocsSection
        title="Composition"
        description="Title row supports an inline compact action (e.g. chevron-down dropdown trigger)."
      >
        <ul className="text-sm text-text-sub-600 space-y-1.5 list-disc pl-6">
          <li><strong>leading</strong> — same axis as <code>PageHeader</code>: basic / avatar / icon / brand / company.</li>
          <li><strong>showTitleAction</strong> — renders inline button next to title.</li>
          <li><strong>actions</strong> — trailing action row.</li>
          <li><code>SectionHeaderDefaultActions</code> — convenience trailing cluster.</li>
        </ul>
      </DocsSection>

      <DocsSection title="API">
        <DocsPropsTable
          rows={[
            { name: "title", type: "ReactNode", description: "Section title." },
            { name: "description", type: "ReactNode", description: "Supporting description." },
            { name: "leading", type: '"basic" | "avatar" | "icon" | "brand" | "company"', defaultValue: '"basic"', description: "Leading visual variant." },
            { name: "leadingSlot", type: "ReactNode", description: "Custom leading content (overrides leading variant)." },
            { name: "showTitleAction", type: "boolean", defaultValue: "false", description: "Render inline compact button next to title." },
            { name: "titleAction", type: "ReactNode", description: "Custom title-row action node (defaults to chevron-down)." },
            { name: "actions", type: "ReactNode", description: "Trailing actions slot." },
            { name: "divider", type: "boolean", defaultValue: "true", description: "Render bottom divider." },
          ]}
        />
      </DocsSection>
    </DocsPageShell>
  )
}
