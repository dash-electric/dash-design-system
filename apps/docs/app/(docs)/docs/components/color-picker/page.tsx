"use client"

import { useState } from "react"
import { ColorPicker, ColorSwatch } from "@/registry/dash/ui/color-picker"
import {
  DocsPageShell,
  DocsHeader,
  DocsSection,
  DocsExample,
  DocsPropsTable,
  DocsDoDont,
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
        status="beta"
        kind="composite"
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

      <DocsSection title="Do this, not that">
        <p className="text-base text-text-sub-600 leading-relaxed max-w-2xl">
          Color picker untuk customization (tribe tag, zone marker). Selalu sediakan preset Dash brand supaya konsisten. Hindari memberikan full hex tanpa guardrail — kontras rendah bikin UI tidak terbaca.
        </p>
        <DocsDoDont
          do={{
            preview: (
              <div className="flex flex-col items-start gap-2">
                <ColorSwatch value="#5e2aac" size="md" onClick={() => {}} />
                <code className="text-xs text-text-sub-600">Reservasi · #5e2aac</code>
              </div>
            ),
            caption: "Pair swatch dengan nama (Reservasi · #5e2aac). Warna saja tidak komunikatif — selalu kasih label.",
          }}
          dont={{
            preview: (
              <div className="flex gap-2">
                <span aria-hidden className="size-5 rounded-md" style={{ background: "#5e2aac" }} />
                <span aria-hidden className="size-5 rounded-md" style={{ background: "#fa7319" }} />
                <span aria-hidden className="size-5 rounded-md" style={{ background: "#1fc16b" }} />
              </div>
            ),
            caption: "Color-only signals untuk color-blind user = unreadable. Selalu pair dengan teks atau icon.",
          }}
        />
        <DocsDoDont
          do={{
            preview: (
              <div className="flex flex-col gap-2">
                <div className="flex gap-1.5">
                  {dashPresets.slice(0, 6).map((c) => (
                    <span key={c} className="size-5 rounded-md border border-stroke-soft-200" style={{ background: c }} />
                  ))}
                </div>
                <span className="text-[10px] text-text-soft-400">12 preset Dash brand</span>
              </div>
            ),
            caption: "Preset 12 warna Dash brand di atas. User pick dari curated set = konsistensi terjaga + kontras passed.",
          }}
          dont={{
            preview: (
              <div className="flex flex-col gap-1">
                <input type="text" defaultValue="#ff0000" className="text-xs px-2 py-1 border border-stroke-soft-200 rounded" />
                <span className="text-[10px] text-text-soft-400">Free-form hex, no presets</span>
              </div>
            ),
            caption: "Free-form hex tanpa preset = user pilih #ffff00 untuk tag, kontras gagal dengan latar putih. Selalu provide presets.",
          }}
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
