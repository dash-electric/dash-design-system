"use client"

import { RiBold as Bold, RiItalic as Italic, RiUnderline as Underline } from "@remixicon/react"
import { Toggle } from "@/registry/dash/ui/toggle"
import {
  DocsPageShell,
  DocsHeader,
  DocsSection,
  DocsExample,
  DocsPropsTable,
  DocsDoDont,
} from "@/components/docs/page-shell"
import { DocsCode } from "@/components/docs/code-block"

export default function ToggleDocsPage() {
  return (
    <DocsPageShell>
      <DocsHeader
        status="stable"
        kind="atom"
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

      <DocsSection title="Do this, not that">
        <p className="text-base text-text-sub-600 leading-relaxed max-w-2xl">
          Toggle = single 2-state button (pressed/unpressed). Untuk toolbar formatting atau filter pin. Bukan global on/off setting (pakai Switch). Bukan multi-select (pakai Checkbox).
        </p>
        <DocsDoDont
          do={{
            preview: (
              <div className="flex items-center gap-1">
                <Toggle size="sm" aria-label="Pin filter mitra Express" defaultPressed><Bold /></Toggle>
                <span className="text-xs text-text-sub-600">Pin filter Express</span>
              </div>
            ),
            caption: "Toggle single state untuk persist filter pin. Pressed = filter aktif. Visual state jelas, action reversible.",
          }}
          dont={{
            preview: (
              <div className="flex items-center gap-1">
                <Toggle aria-label="Notif"><Bold /></Toggle>
                <span className="text-xs text-text-sub-600">Notifikasi delivery</span>
              </div>
            ),
            caption: "Untuk setting on/off yang instant-apply (notifikasi global) pakai Switch — affordance lebih clear. Toggle untuk per-item state inline.",
          }}
        />
        <DocsDoDont
          do={{
            preview: (
              <div className="flex gap-1">
                <Toggle size="sm" aria-label="Bold"><Bold /></Toggle>
                <Toggle size="sm" aria-label="Italic" defaultPressed><Italic /></Toggle>
                <Toggle size="sm" aria-label="Underline"><Underline /></Toggle>
              </div>
            ),
            caption: "Formatting toolbar dengan Toggle independent (B+I aktif boleh, tidak mutual exclusive). Setiap toggle punya state sendiri.",
          }}
          dont={{
            preview: (
              <div className="flex gap-1">
                <Toggle size="sm" aria-label="List view"><Bold /></Toggle>
                <Toggle size="sm" aria-label="Grid view"><Italic /></Toggle>
                <Toggle size="sm" aria-label="Map view"><Underline /></Toggle>
              </div>
            ),
            caption: "View switcher mutually-exclusive (cuma 1 view aktif) = WAJIB ToggleGroup type='single' atau SegmentedControl. Toggle individual = 2 view bisa aktif.",
          }}
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
