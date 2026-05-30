"use client"

import { useState } from "react"
import { Slider } from "@/registry/dash/ui/slider"
import {
  DocsPageShell,
  DocsHeader,
  DocsSection,
  DocsExample,
  DocsPropsTable,
  DocsDoDont,
} from "@/components/docs/page-shell"
import { DocsCode } from "@/components/docs/code-block"

export default function SliderDocsPage() {
  const [single, setSingle] = useState([35])
  const [range, setRange] = useState([15, 75])

  return (
    <DocsPageShell>
      <DocsHeader
        status="stable"
        kind="atom"
        category="Components / Form"
        title="Slider"
        description="Numeric range input with one or more thumbs. Use for continuous controls — surge price factor, max dispatch radius, payout cap."
      />

      <DocsSection title="Install">
        <DocsCode language="bash" code={`dashkit add slider`} />
      </DocsSection>

      <DocsSection title="Usage">
        <DocsCode
          language="tsx"
          code={`import { Slider } from "@/registry/dash/ui/slider"

<Slider value={[35]} onValueChange={setValue} min={0} max={100} step={5} />
<Slider value={[15, 75]} onValueChange={setRange} />`}
        />
      </DocsSection>

      <DocsSection title="Examples">
        <DocsExample
          title="Single thumb"
          preview={
            <div className="w-full">
              <div className="flex justify-between text-sm mb-2">
                <span className="font-medium">Surge factor</span>
                <span className="tabular-nums text-text-sub-600">{single[0]}%</span>
              </div>
              <Slider value={single} onValueChange={setSingle} min={0} max={100} step={5} />
            </div>
          }
          code={`<Slider value={single} onValueChange={setSingle} min={0} max={100} step={5} />`}
        />

        <DocsExample
          title="Range thumbs"
          preview={
            <div className="w-full">
              <div className="flex justify-between text-sm mb-2">
                <span className="font-medium">Dispatch radius (km)</span>
                <span className="tabular-nums text-text-sub-600">{range[0]} – {range[1]}</span>
              </div>
              <Slider value={range} onValueChange={setRange} min={0} max={100} step={1} />
            </div>
          }
          code={`<Slider value={[15, 75]} onValueChange={setRange} min={0} max={100} />`}
        />
      </DocsSection>

      <DocsSection title="Do this, not that">
        <p className="text-base text-text-sub-600 leading-relaxed max-w-2xl">
          Slider untuk continuous range. SELALU tampilkan current value + unit di samping. Tanpa label numerik, slider hanya estetika tanpa fungsi. Step harus realistic (radius 1km, bukan 0.1km).
        </p>
        <DocsDoDont
          do={{
            preview: (
              <div className="w-full max-w-xs">
                <div className="flex justify-between text-xs mb-2">
                  <span className="font-medium">Radius dispatch</span>
                  <span className="tabular-nums text-text-sub-600">5 km</span>
                </div>
                <Slider defaultValue={[5]} min={1} max={20} step={1} />
                <div className="flex justify-between text-[10px] text-text-soft-400 mt-1.5">
                  <span>1 km</span><span>20 km</span>
                </div>
              </div>
            ),
            caption: "Slider radius dispatch + value '5 km' di kanan + min/max marker. User tahu sekarang berapa, batas berapa, scale apa.",
          }}
          dont={{
            preview: (
              <div className="w-full max-w-xs">
                <Slider defaultValue={[5]} min={1} max={20} />
              </div>
            ),
            caption: "Slider tanpa label = drag handle anonim. User tidak tahu unit apa, sekarang nilai berapa, range berapa. Wajib pair dengan label + current value.",
          }}
        />
        <DocsDoDont
          do={{
            preview: (
              <div className="w-full max-w-xs">
                <div className="flex justify-between text-xs mb-2">
                  <span className="font-medium">Surge factor</span>
                  <span className="tabular-nums text-text-sub-600">1.5×</span>
                </div>
                <Slider defaultValue={[150]} min={100} max={300} step={10} />
              </div>
            ),
            caption: "Step 10 (0.1× factor) realistic untuk surge price control. Dispatcher tidak butuh granularity 0.01×.",
          }}
          dont={{
            preview: (
              <div className="w-full max-w-xs">
                <div className="flex justify-between text-xs mb-2">
                  <span className="font-medium">Lat</span>
                  <span className="tabular-nums text-text-sub-600">-6.21500</span>
                </div>
                <Slider defaultValue={[-621500]} min={-900000} max={900000} step={1} />
              </div>
            ),
            caption: "Slider untuk koordinat presisi tinggi = tool salah. Pakai Input number atau Map picker. Slider efektif untuk range 10-100 step diskrit.",
          }}
        />
      </DocsSection>

      <DocsSection title="API">
        <DocsPropsTable
          rows={[
            { name: "value", type: "number[]", description: "Thumb positions. Multiple values = range." },
            { name: "onValueChange", type: "(value: number[]) => void", description: "Change callback." },
            { name: "min", type: "number", defaultValue: "0", description: "Lower bound." },
            { name: "max", type: "number", defaultValue: "100", description: "Upper bound." },
            { name: "step", type: "number", defaultValue: "1", description: "Increment." },
            { name: "disabled", type: "boolean", defaultValue: "false", description: "Disable." },
          ]}
        />
      </DocsSection>

      <DocsSection title="More examples">
        <DocsExample
          title="Surge factor with marker labels"
          description="Pair tick labels under the track to anchor the scale (normal / 1.5× / 2× / max)."
          preview={
            <SliderMarkersExample />
          }
          code={`<Slider value={value} onValueChange={setValue} min={0} max={200} step={10} />
<div className="flex justify-between text-xs text-text-soft-400 mt-2">
  <span>Normal</span>
  <span>1.5×</span>
  <span>2×</span>
  <span>Max</span>
</div>`}
        />

        <DocsExample
          title="Disabled"
          preview={
            <div className="w-full">
              <Slider defaultValue={[40]} disabled />
            </div>
          }
          code={`<Slider defaultValue={[40]} disabled />`}
        />

        <DocsExample
          title="Vertical orientation"
          preview={
            <div className="flex justify-center">
              <Slider defaultValue={[60]} orientation="vertical" className="h-32" />
            </div>
          }
          code={`<Slider defaultValue={[60]} orientation="vertical" className="h-32" />`}
        />
      </DocsSection>

      <DocsSection title="Anatomy">
        <ul className="space-y-2 text-sm text-text-strong-950/90">
          <li>• Built on Radix Slider — pass <code className="text-xs">value</code> as <strong>array</strong> always (single thumb = 1-element array, range = 2+).</li>
          <li>• Thumb count = array length; track auto-renders.</li>
          <li>• Step value snaps thumbs to multiples of <code className="text-xs">step</code>.</li>
        </ul>
      </DocsSection>

      <DocsSection title="Accessibility">
        <ul className="space-y-2 text-sm text-text-strong-950/90">
          <li>• Each thumb is a <code className="text-xs">role=&quot;slider&quot;</code> with <code className="text-xs">aria-valuemin</code> / <code className="text-xs">aria-valuemax</code> / <code className="text-xs">aria-valuenow</code>.</li>
          <li>• Keyboard: <code className="text-xs">Arrow</code> = step; <code className="text-xs">PgUp</code> / <code className="text-xs">PgDn</code> = 10×step; <code className="text-xs">Home</code> / <code className="text-xs">End</code> = min / max.</li>
          <li>• For range sliders the two thumbs cannot cross.</li>
          <li>• Pair with a visible label + current-value text (<code className="text-xs">tabular-nums</code>) so SR users get context.</li>
          <li>• Honors <code className="text-xs">prefers-reduced-motion</code> on Radix internal transitions.</li>
        </ul>
      </DocsSection>
    </DocsPageShell>
  )
}

function SliderMarkersExample() {
  const [v, setV] = useState([60])
  return (
    <div className="w-full">
      <div className="flex justify-between text-sm mb-2">
        <span className="font-medium">Surge factor</span>
        <span className="tabular-nums text-text-sub-600">{v[0]}%</span>
      </div>
      <Slider value={v} onValueChange={setV} min={0} max={200} step={10} />
      <div className="flex justify-between text-xs text-text-soft-400 mt-2">
        <span>Normal</span>
        <span>1.5×</span>
        <span>2×</span>
        <span>Max</span>
      </div>
    </div>
  )
}
