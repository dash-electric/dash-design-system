"use client"

import { PageHeader, PageHeaderDefaultActions } from "@/registry/dash/blocks/page-header"
import {
  DocsPageShell,
  DocsHeader,
  DocsSection,
  DocsExample,
  DocsPropsTable,
} from "@/components/docs/page-shell"
import { DocsCode } from "@/components/docs/code-block"

export default function PageHeaderDocsPage() {
  return (
    <DocsPageShell>
      <DocsHeader
        category="Blocks / Layout Headers"
        title="Page Header"
        description="Top-of-page header block — title + description, optional leading slot (avatar / icon / brand / company), and trailing action group. 5 leading variants ported 1:1 from the AlignUI Pro Figma."
      />

      <DocsSection title="Install">
        <DocsCode language="bash" code={`dash add page-header`} />
      </DocsSection>

      <DocsSection title="Examples">
        <DocsExample
          title="Basic"
          description="Title + description + 2-action group on the right."
          preview={
            <div className="w-full rounded-xl border border-stroke-soft-200 bg-bg-white-0 p-6">
              <PageHeader
                title="Settings"
                description="Manage your team and preferences."
                actions={<PageHeaderDefaultActions />}
              />
            </div>
          }
          code={`<PageHeader
  title="Settings"
  description="Manage your team and preferences."
  actions={<PageHeaderDefaultActions />}
/>`}
        />
      </DocsSection>

      <DocsSection
        title="Composition"
        description="Title + description + leading slot + actions slot."
      >
        <ul className="text-sm text-text-sub-600 space-y-1.5 list-disc pl-6">
          <li><strong>leading</strong> — <code>basic</code> | <code>avatar</code> | <code>icon</code> | <code>brand</code> | <code>company</code>.</li>
          <li><strong>actions</strong> — slot for buttons / icon-buttons / dropdowns.</li>
          <li><code>PageHeaderDefaultActions</code> — convenience trailing-actions cluster.</li>
        </ul>
      </DocsSection>

      <DocsSection title="API">
        <DocsPropsTable
          rows={[
            { name: "title", type: "ReactNode", description: "Headline copy." },
            { name: "description", type: "ReactNode", description: "Sub-heading copy below the title." },
            { name: "leading", type: '"basic" | "avatar" | "icon" | "brand" | "company"', defaultValue: '"basic"', description: "Leading visual variant." },
            { name: "leadingSlot", type: "ReactNode", description: "Custom leading content (overrides leading variant)." },
            { name: "avatarSrc", type: "string", description: 'Image URL used when leading="avatar".' },
            { name: "actions", type: "ReactNode", description: "Trailing actions slot." },
          ]}
        />
      </DocsSection>
    </DocsPageShell>
  )
}
