"use client"

import { useState } from "react"
import { ColorPicker, ColorSwatch } from "@/registry/dash/ui/color-picker"
import {
  DocsPageShell,
  DocsHeader,
  DocsSection,
  DocsExample,
  DocsPropsTable,
} from "@/components/docs/page-shell"
import { DocsCode } from "@/components/docs/code-block"

const dashPresets = [
  "#335cff", "#5e2aac", "#1fc16b", "#fa7319", "#fb3748", "#f6b51e",
  "#47c2ff", "#fb4ba3", "#22d3bb", "#171717", "#7b7b7b", "#f5f5f5",
]

export default function ColorPickerDocsPage() {
  const [zoneColor, setZoneColor] = useState("#335cff")
  const [tagColor, setTagColor] = useState("#fa7319")

  return (
    <DocsPageShell>
      <DocsHeader
        category="Components / Form"
        title="Color Picker"
        description="Hex color input with saturation square and hue slider. Use it where users need to pick a custom hex — dispatch zone tags, mitra-tribe color labels, marketing surface accents."
      />

      <DocsSection title="Install">
        <DocsCode language="bash" code={`dash add color-picker`} />
      </DocsSection>

      <DocsSection title="Usage">
        <DocsCode
          language="tsx"
          code={`import { ColorPicker, ColorSwatch } from "@/registry/dash/ui/color-picker"

<ColorPicker value={color} onValueChange={setColor} presets={dashPresets} />`}
        />
      </DocsSection>

      <DocsSection title="Examples">
        <DocsExample
          title="Inline picker with presets"
          preview={
            <div className="flex flex-col items-center gap-4">
              <ColorPicker value={zoneColor} onValueChange={setZoneColor} presets={dashPresets} />
              <div className="flex items-center gap-3 text-sm text-text-sub-600">
                <span>Selected:</span>
                <span
                  aria-hidden
                  className="size-5 rounded-md border border-stroke-soft-200"
                  style={{ background: zoneColor }}
                />
                <code className="uppercase">{zoneColor}</code>
              </div>
            </div>
          }
          code={`<ColorPicker
  value={zoneColor}
  onValueChange={setZoneColor}
  presets={["#335cff", "#5e2aac", "#1fc16b", /* … */]}
/>`}
        />

        <DocsExample
          title="Live preview integration"
          preview={
            <div className="flex flex-col sm:flex-row gap-6 items-start w-full">
              <ColorPicker value={tagColor} onValueChange={setTagColor} presets={dashPresets} />
              <div className="flex-1 space-y-3">
                <div className="text-sm font-medium">Live preview</div>
                <div className="rounded-lg border border-stroke-soft-200 p-4 space-y-2 bg-bg-white-0">
                  <div className="flex items-center gap-2">
                    <span aria-hidden className="size-2.5 rounded-full" style={{ background: tagColor }} />
                    <span className="text-sm font-medium">Reservasi</span>
                  </div>
                  <span
                    className="inline-flex h-5 items-center rounded-full px-2 text-[10px] font-medium text-white"
                    style={{ background: tagColor }}
                  >
                    Tribe tag
                  </span>
                  <div
                    className="h-9 rounded-md flex items-center justify-center text-sm font-medium text-white"
                    style={{ background: tagColor }}
                  >
                    Filled button
                  </div>
                </div>
              </div>
            </div>
          }
          code={`<ColorPicker value={tagColor} onValueChange={setTagColor} presets={dashPresets} />

<span style={{ background: tagColor }} className="...">Tribe tag</span>`}
        />

        <DocsExample
          title="Swatch trigger"
          description="Pair with Popover for compact form layouts."
          preview={
            <div className="flex flex-wrap items-end gap-4">
              <ColorSwatch value={zoneColor} size="sm" onClick={() => {}} />
              <ColorSwatch value={zoneColor} size="md" onClick={() => {}} />
              <ColorSwatch value={zoneColor} size="lg" onClick={() => {}} />
            </div>
          }
          code={`<ColorSwatch value={zoneColor} size="md" onClick={openPopover} />`}
        />
      </DocsSection>

      <DocsSection title="API">
        <DocsPropsTable
          rows={[
            { name: "value", type: "string (hex)", description: "Current color. On ColorPicker / ColorSwatch." },
            { name: "onValueChange", type: "(color: string) => void", description: "Change callback. On ColorPicker." },
            { name: "presets", type: "string[]", description: "Preset hex chips. On ColorPicker." },
            { name: "size", type: '"sm" | "md" | "lg"', defaultValue: '"md"', description: "Swatch dimension. On ColorSwatch." },
          ]}
        />
      </DocsSection>

      <DocsSection title="Rules">
        <ul className="space-y-2 text-sm text-text-strong-950/90">
          <li>• Always provide presets matching Dash brand for product UI.</li>
          <li>• Validate hex on submit — reject contrast failures.</li>
          <li>• Inside dense forms, prefer ColorSwatch + Popover.</li>
          <li>• Hex stored lowercase from react-colorful.</li>
        </ul>
      </DocsSection>

      <DocsSection title="Accessibility">
        <ul className="space-y-2 text-sm text-text-strong-950/90">
          <li>• <strong>Saturation/hue squares</strong> — react-colorful primitives expose <code className="text-xs">role=&quot;slider&quot;</code> with <code className="text-xs">aria-valuetext</code> announcing the current hex.</li>
          <li>• <strong>Keyboard</strong>
            <ul className="ml-5 mt-1 space-y-1 text-text-sub-600 list-disc">
              <li><code className="text-xs">Tab</code> walks: saturation → hue → hex input → preset chips.</li>
              <li><code className="text-xs">Arrow keys</code> nudge the saturation/hue pointer by 1 unit; with <code className="text-xs">Shift</code> by 10 units.</li>
            </ul>
          </li>
          <li>• <strong>Hex input</strong> — accepts paste in any case, normalizes lowercase, validates pattern <code className="text-xs">#[0-9a-f]{`{6}`}</code> on blur.</li>
          <li>• <strong>Preset chips</strong> — each chip is a real button with <code className="text-xs">aria-label=&quot;Color #335cff&quot;</code> and shows <code className="text-xs">aria-pressed</code> when currently selected.</li>
          <li>• <strong>Color-only meaning</strong> — never rely on the swatch alone to communicate intent. Pair with a name (&quot;Reservasi tag · #5e2aac&quot;).</li>
          <li>• <strong>Reduced motion</strong> — pointer move + saturation/hue animations are GPU-accelerated and skip transitions under <code className="text-xs">prefers-reduced-motion</code>.</li>
        </ul>
      </DocsSection>
    </DocsPageShell>
  )
}
