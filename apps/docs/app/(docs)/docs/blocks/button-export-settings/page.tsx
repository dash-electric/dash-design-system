"use client"

import { ButtonExportSettings } from "@/registry/dash/blocks/button-export-settings"
import {
  DocsPageShell,
  DocsHeader,
  DocsSection,
  DocsExample,
  DocsPropsTable,
} from "@/components/docs/page-shell"
import { DocsCode } from "@/components/docs/code-block"

export default function ButtonExportSettingsDocsPage() {
  return (
    <DocsPageShell>
      <DocsHeader
        category="Blocks / Composition Examples"
        title="Button — Export Settings Modal"
        description="Composition example: Export button that opens a settings modal — format selector + scope + Upgrade hint for premium formats."
      />

      <DocsSection title="Install">
        <DocsCode language="bash" code={`dash add button-export-settings`} />
      </DocsSection>

      <DocsSection title="Examples">
        <DocsExample
          title="Export with format picker"
          description="Click 'Export' to open the modal. Free tier exports CSV; paid tiers add XLSX / PDF."
          preview={
            <div className="flex w-full justify-center rounded-xl border border-stroke-soft-200 bg-bg-white-0 p-12">
              <ButtonExportSettings />
            </div>
          }
          code={`<ButtonExportSettings
  onExport={() => {}}
  onUpgrade={() => {}}
/>`}
        />
      </DocsSection>

      <DocsSection title="Composition">
        <ul className="text-sm text-text-sub-600 space-y-1.5 list-disc pl-5">
          <li>Trigger <code>Button</code> + controlled <code>Modal</code>.</li>
          <li>Modal body — format <code>Radio</code> group + scope <code>Select</code> + Upgrade <code>Banner</code>.</li>
          <li>Modal footer — Cancel + Export primary action.</li>
        </ul>
      </DocsSection>

      <DocsSection title="API">
        <DocsPropsTable
          rows={[
            { name: "open", type: "boolean", description: "Controlled open state." },
            { name: "onOpenChange", type: "(next: boolean) => void", description: "Open-state change handler." },
            { name: "trigger", type: "ReactNode", description: "Custom trigger element (defaults to 'Export' button)." },
            { name: "onExport", type: "() => void", description: "Fired on Export confirm." },
            { name: "onUpgrade", type: "() => void", description: "Fired when the upgrade CTA is tapped." },
          ]}
        />
      </DocsSection>
    </DocsPageShell>
  )
}
