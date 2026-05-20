"use client"

import { RiAlignLeft as AlignLeft, RiAlignCenter as AlignCenter, RiAlignRight as AlignRight, RiBold as Bold, RiItalic as Italic, RiUnderline as Underline } from "@remixicon/react"
import { ToggleGroup, ToggleGroupItem } from "@/registry/dash/ui/toggle-group"
import {
  DocsPageShell,
  DocsHeader,
  DocsSection,
  DocsExample,
  DocsPropsTable,
  DocsDoDont,
} from "@/components/docs/page-shell"
import { DocsCode } from "@/components/docs/code-block"

export default function ToggleGroupDocsPage() {
  return (
    <DocsPageShell>
      <DocsHeader
        status="stable"
        kind="atom"
        category="Components / Actions"
        title="Toggle Group"
        description="Set of related Toggle buttons sharing one selection state. Single-mode for radio-style picks, multiple-mode for independent toggles."
      />

      <DocsSection title="Install">
        <DocsCode language="bash" code={`dash add toggle-group`} />
      </DocsSection>

      <DocsSection title="Examples">
        <DocsExample
          title="Single (text alignment)"
          preview={
            <ToggleGroup type="single" defaultValue="left" variant="outline">
              <ToggleGroupItem value="left" aria-label="Left"><AlignLeft /></ToggleGroupItem>
              <ToggleGroupItem value="center" aria-label="Center"><AlignCenter /></ToggleGroupItem>
              <ToggleGroupItem value="right" aria-label="Right"><AlignRight /></ToggleGroupItem>
            </ToggleGroup>
          }
          code={`<ToggleGroup type="single" defaultValue="left" variant="outline">
  <ToggleGroupItem value="left"><AlignLeft /></ToggleGroupItem>
  <ToggleGroupItem value="center"><AlignCenter /></ToggleGroupItem>
  <ToggleGroupItem value="right"><AlignRight /></ToggleGroupItem>
</ToggleGroup>`}
        />

        <DocsExample
          title="Multiple (formatting)"
          preview={
            <ToggleGroup type="multiple" defaultValue={["bold"]}>
              <ToggleGroupItem value="bold" aria-label="Bold"><Bold /></ToggleGroupItem>
              <ToggleGroupItem value="italic" aria-label="Italic"><Italic /></ToggleGroupItem>
              <ToggleGroupItem value="underline" aria-label="Underline"><Underline /></ToggleGroupItem>
            </ToggleGroup>
          }
          code={`<ToggleGroup type="multiple" defaultValue={["bold"]}>
  <ToggleGroupItem value="bold"><Bold /></ToggleGroupItem>
  <ToggleGroupItem value="italic"><Italic /></ToggleGroupItem>
  <ToggleGroupItem value="underline"><Underline /></ToggleGroupItem>
</ToggleGroup>`}
        />
      </DocsSection>

      <DocsSection title="Per-item override">
        <DocsExample
          title="Mixed sizes / variants"
          description="Item-level props win over group-level. Useful for highlighting a primary action inside a toolbar cluster."
          preview={
            <ToggleGroup type="single" defaultValue="center">
              <ToggleGroupItem value="left" size="sm" aria-label="Left"><AlignLeft /></ToggleGroupItem>
              <ToggleGroupItem value="center" variant="outline" aria-label="Center"><AlignCenter /></ToggleGroupItem>
              <ToggleGroupItem value="right" size="sm" aria-label="Right"><AlignRight /></ToggleGroupItem>
            </ToggleGroup>
          }
          code={`<ToggleGroup type="single" defaultValue="center">
  <ToggleGroupItem value="left" size="sm"><AlignLeft /></ToggleGroupItem>
  <ToggleGroupItem value="center" variant="outline"><AlignCenter /></ToggleGroupItem>
  <ToggleGroupItem value="right" size="sm"><AlignRight /></ToggleGroupItem>
</ToggleGroup>`}
        />
      </DocsSection>

      <DocsSection title="Do this, not that">
        <p className="text-base text-text-sub-600 leading-relaxed max-w-2xl">
          Pilih <code className="text-xs">type</code> berdasarkan semantik: single = radio-style mutually-exclusive, multiple = independent toggles. Salah type = perilaku salah.
        </p>
        <DocsDoDont
          do={{
            preview: (
              <ToggleGroup type="single" defaultValue="newest">
                <ToggleGroupItem value="newest">Newest</ToggleGroupItem>
                <ToggleGroupItem value="oldest">Oldest</ToggleGroupItem>
                <ToggleGroupItem value="distance">Distance</ToggleGroupItem>
              </ToggleGroup>
            ),
            caption: "Sort order mutually-exclusive (1 pilihan) → type='single'. User pilih satu, lainnya auto-deselect.",
          }}
          dont={{
            preview: (
              <ToggleGroup type="multiple" defaultValue={["newest"]}>
                <ToggleGroupItem value="newest">Newest</ToggleGroupItem>
                <ToggleGroupItem value="oldest">Oldest</ToggleGroupItem>
                <ToggleGroupItem value="distance">Distance</ToggleGroupItem>
              </ToggleGroup>
            ),
            caption: "Sort order pakai type='multiple' = user pilih 'Newest + Oldest' bersamaan, padahal mutually-exclusive. Type harus match semantik.",
          }}
        />
        <DocsDoDont
          do={{
            preview: (
              <ToggleGroup type="multiple" defaultValue={["express"]}>
                <ToggleGroupItem value="reservasi">Reservasi</ToggleGroupItem>
                <ToggleGroupItem value="express">Express</ToggleGroupItem>
                <ToggleGroupItem value="bulk">Bulk</ToggleGroupItem>
              </ToggleGroup>
            ),
            caption: "Filter tribe multi-select (Reservasi + Express boleh aktif sekaligus) → type='multiple'. User dapat kontrol granular.",
          }}
          dont={{
            preview: (
              <ToggleGroup type="single">
                <ToggleGroupItem value="reservasi">Reservasi</ToggleGroupItem>
                <ToggleGroupItem value="express">Express</ToggleGroupItem>
                <ToggleGroupItem value="bulk">Bulk</ToggleGroupItem>
              </ToggleGroup>
            ),
            caption: "Filter multi-tribe pakai type='single' = user paksa pilih satu, tidak bisa Reservasi+Express. Match semantik dengan multiple.",
          }}
        />
      </DocsSection>

      <DocsSection title="API">
        <h3 className="text-sm font-semibold text-text-strong-950 pt-2">ToggleGroup</h3>
        <DocsPropsTable
          rows={[
            { name: "type", type: '"single" | "multiple"', description: "Selection mode. single = radio-style; multiple = independent toggles." },
            { name: "variant", type: '"default" | "outline"', defaultValue: '"default"', description: "Inherited by items unless overridden." },
            { name: "size", type: '"sm" | "md" | "lg"', defaultValue: '"md"', description: "Inherited by items." },
            { name: "value", type: "string | string[]", description: "Controlled value(s)." },
            { name: "defaultValue", type: "string | string[]", description: "Uncontrolled initial value(s)." },
            { name: "onValueChange", type: "(value) => void", description: "Change callback. Signature matches type." },
            { name: "disabled", type: "boolean", description: "Disable all items." },
          ]}
        />
        <h3 className="text-sm font-semibold text-text-strong-950 pt-4">ToggleGroupItem</h3>
        <DocsPropsTable
          rows={[
            { name: "value", type: "string", description: "Item identifier; matched against group value." },
            { name: "variant", type: '"default" | "outline"', description: "Override inherited variant." },
            { name: "size", type: '"sm" | "md" | "lg"', description: "Override inherited size." },
            { name: "disabled", type: "boolean", description: "Disable just this item." },
          ]}
        />
      </DocsSection>

      <DocsSection title="Anatomy">
        <ul className="space-y-2 text-sm text-text-strong-950/90">
          <li>• <code className="text-xs">ToggleGroup</code> — context provider for shared <code className="text-xs">variant</code> + <code className="text-xs">size</code>.</li>
          <li>• <code className="text-xs">ToggleGroupItem</code> — individual press button. Visual identical to standalone Toggle.</li>
          <li>• <code className="text-xs">type=&quot;single&quot;</code> = at most one pressed at a time (allows empty); <code className="text-xs">type=&quot;multiple&quot;</code> = any subset.</li>
        </ul>
      </DocsSection>

      <DocsSection title="Accessibility">
        <ul className="space-y-2 text-sm text-text-strong-950/90">
          <li>• Group exposes <code className="text-xs">role=&quot;group&quot;</code>; single-mode items use <code className="text-xs">role=&quot;radio&quot;</code> and multi-mode items use <code className="text-xs">aria-pressed</code>.</li>
          <li>• Keyboard: <code className="text-xs">Tab</code> enters group; <code className="text-xs">Arrow</code> keys move between items; <code className="text-xs">Space</code> toggles.</li>
          <li>• Always pass <code className="text-xs">aria-label</code> on icon-only items.</li>
          <li>• Optional <code className="text-xs">aria-label</code> on the group describes the toggle&apos;s purpose (e.g., &ldquo;Text alignment&rdquo;).</li>
        </ul>
      </DocsSection>
    </DocsPageShell>
  )
}
