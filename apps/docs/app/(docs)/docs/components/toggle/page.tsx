"use client"

import { RiBold as Bold, RiItalic as Italic, RiUnderline as Underline } from "@remixicon/react"
import { Toggle } from "@/registry/dash/ui/toggle"
import {
  DocsPageShell,
  DocsHeader,
  DocsSection,
  DocsExample,
  DocsPropsTable,
} from "@/components/docs/page-shell"
import { DocsCode } from "@/components/docs/code-block"

export default function ToggleDocsPage() {
  return (
    <DocsPageShell>
      <DocsHeader
        category="Components / Actions"
        title="Toggle"
        description="Stateful 2-state button. Use for formatting toolbar (bold/italic), feature flags, sticky-pin, or any persistent on/off control."
      />

      <DocsSection title="Install">
        <DocsCode language="bash" code={`dash add toggle`} />
      </DocsSection>

      <DocsSection title="Examples">
        <DocsExample
          title="Default"
          preview={
            <div className="flex gap-1">
              <Toggle aria-label="Bold"><Bold /></Toggle>
              <Toggle aria-label="Italic" defaultPressed><Italic /></Toggle>
              <Toggle aria-label="Underline"><Underline /></Toggle>
            </div>
          }
          code={`<Toggle aria-label="Bold"><Bold /></Toggle>`}
        />

        <DocsExample
          title="Outline variant + sizes"
          preview={
            <div className="flex items-center gap-2">
              <Toggle variant="outline" size="sm" aria-label="sm"><Bold /></Toggle>
              <Toggle variant="outline" size="md" aria-label="md"><Bold /></Toggle>
              <Toggle variant="outline" size="lg" aria-label="lg"><Bold /></Toggle>
            </div>
          }
          code={`<Toggle variant="outline" size="sm"><Bold /></Toggle>
<Toggle variant="outline" size="md"><Bold /></Toggle>
<Toggle variant="outline" size="lg"><Bold /></Toggle>`}
        />
      </DocsSection>

      <DocsSection title="API">
        <DocsPropsTable
          rows={[
            { name: "variant", type: '"default" | "outline"', defaultValue: '"default"', description: "Background style." },
            { name: "size", type: '"sm" | "md" | "lg"', defaultValue: '"md"', description: "Size preset." },
            { name: "pressed", type: "boolean", description: "Controlled pressed state." },
            { name: "defaultPressed", type: "boolean", description: "Uncontrolled initial state." },
            { name: "onPressedChange", type: "(pressed: boolean) => void", description: "Fired when state changes." },
            { name: "disabled", type: "boolean", defaultValue: "false", description: "Disable." },
          ]}
        />
      </DocsSection>

      <DocsSection title="Disabled state">
        <DocsExample
          title="Disabled"
          preview={
            <div className="flex gap-2">
              <Toggle aria-label="Bold" disabled><Bold /></Toggle>
              <Toggle aria-label="Italic" disabled defaultPressed><Italic /></Toggle>
            </div>
          }
          code={`<Toggle disabled><Bold /></Toggle>
<Toggle disabled defaultPressed><Italic /></Toggle>`}
        />
      </DocsSection>

      <DocsSection title="Anatomy">
        <ul className="space-y-2 text-sm text-text-strong-950/90">
          <li>• Built on Radix Toggle — primitive 2-state button with <code className="text-xs">aria-pressed</code>.</li>
          <li>• Default variant blends with toolbar; outline variant stands alone (e.g., feature flag row).</li>
          <li>• For grouped picks (text alignment / formatting cluster) → Toggle Group.</li>
        </ul>
      </DocsSection>

      <DocsSection title="Accessibility">
        <ul className="space-y-2 text-sm text-text-strong-950/90">
          <li>• <code className="text-xs">aria-pressed</code> wired automatically — screen readers announce &ldquo;pressed&rdquo; / &ldquo;not pressed&rdquo;.</li>
          <li>• Always pass <code className="text-xs">aria-label</code> when the only child is an icon (Bold, Italic, etc.).</li>
          <li>• Keyboard: <code className="text-xs">Tab</code> focuses, <code className="text-xs">Space</code> / <code className="text-xs">Enter</code> toggles.</li>
          <li>• Visible focus ring on <code className="text-xs">:focus-visible</code> — do not strip.</li>
          <li>• When pressed state controls a separate region, set <code className="text-xs">aria-controls</code> on the toggle.</li>
        </ul>
      </DocsSection>
    </DocsPageShell>
  )
}
