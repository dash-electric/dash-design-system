"use client"

import * as React from "react"
import { ProgressBar, ProgressBarLabel } from "@/registry/dash/ui/progress-bar"
import { ProgressCircle } from "@/registry/dash/ui/progress-circle"
import {
  DocsPageShell,
  DocsHeader,
  DocsSection,
  DocsExample,
  DocsPropsTable,
} from "@/components/docs/page-shell"
import { DocsCode } from "@/components/docs/code-block"

/**
 * Progress — Figma 1:1 (6 nodes verified 2026-05-18).
 *
 * Two primitives:
 *   - ProgressBar (linear) + ProgressBarLabel composition wrapper
 *   - ProgressCircle (radial)
 *
 * Both share the same 5-tone palette (primary / information / success / warning / error)
 * and bind to the state-* tokens. No indeterminate mode — value is required.
 */

export default function ProgressDocsPage() {
  return (
    <DocsPageShell>
      <DocsHeader
        category="Components / Feedback"
        title="Progress"
        description="Linear and radial progress indicators. ProgressBar fills horizontally; ProgressCircle wraps a 48-80px ring. Both clamp 0-100 and share five semantic tones. Use ProgressBarLabel when you need a label + caption + description composition above and below the bar."
      />

      <DocsSection title="Install">
        <DocsCode language="bash" code={`dash add progress`} />
      </DocsSection>

      <DocsSection title="Value states">
        <p className="text-sm text-text-sub-600 max-w-2xl">
          Bind <code className="text-xs px-1 py-0.5 rounded bg-bg-weak-50">value</code> to a number 0-100. The indicator translates horizontally from <code className="text-xs px-1 py-0.5 rounded bg-bg-weak-50">-100%</code> to <code className="text-xs px-1 py-0.5 rounded bg-bg-weak-50">0%</code> with a 300ms ease-out transition.
        </p>
        <DocsExample
          title="0 / 25 / 50 / 75 / 100"
          preview={
            <div className="space-y-4 max-w-md">
              {[0, 25, 50, 75, 100].map((v) => (
                <div key={v} className="flex items-center gap-3">
                  <span className="text-xs text-text-soft-400 w-10 shrink-0">{v}%</span>
                  <ProgressBar value={v} />
                </div>
              ))}
            </div>
          }
          code={`<ProgressBar value={0} />
<ProgressBar value={25} />
<ProgressBar value={50} />
<ProgressBar value={75} />
<ProgressBar value={100} />`}
        />
      </DocsSection>

      <DocsSection title="Sizes">
        <p className="text-sm text-text-sub-600 max-w-2xl">
          Three heights: <code className="text-xs px-1 py-0.5 rounded bg-bg-weak-50">sm (4px)</code>, <code className="text-xs px-1 py-0.5 rounded bg-bg-weak-50">md (6px Figma default)</code>, <code className="text-xs px-1 py-0.5 rounded bg-bg-weak-50">lg (8px)</code>.
        </p>
        <DocsExample
          title="3 sizes"
          preview={
            <div className="space-y-4 max-w-md">
              <ProgressBar value={62} size="sm" />
              <ProgressBar value={62} size="md" />
              <ProgressBar value={62} size="lg" />
            </div>
          }
          code={`<ProgressBar value={62} size="sm" />
<ProgressBar value={62} size="md" />
<ProgressBar value={62} size="lg" />`}
        />
      </DocsSection>

      <DocsSection title="Tones">
        <p className="text-sm text-text-sub-600 max-w-2xl">
          Five semantic tones — drive the indicator fill color. Track stays neutral stroke-soft-200.
        </p>
        <DocsExample
          title="primary / information / success / warning / error"
          preview={
            <div className="space-y-3 max-w-md">
              {(["primary","information","success","warning","error"] as const).map((t) => (
                <div key={t} className="flex items-center gap-3">
                  <span className="text-xs text-text-sub-600 w-24 shrink-0 capitalize">{t}</span>
                  <ProgressBar value={68} tone={t} />
                </div>
              ))}
            </div>
          }
          code={`<ProgressBar value={68} tone="primary" />
<ProgressBar value={68} tone="information" />
<ProgressBar value={68} tone="success" />
<ProgressBar value={68} tone="warning" />
<ProgressBar value={68} tone="error" />`}
        />
      </DocsSection>

      <DocsSection title="Bar w/ label">
        <p className="text-sm text-text-sub-600 max-w-2xl">
          <code className="text-xs px-1 py-0.5 rounded bg-bg-weak-50">ProgressBarLabel</code> wraps the bar with a label + optional right caption (percent) and an optional description below.
        </p>
        <DocsExample
          title="Three flavours"
          preview={
            <div className="space-y-5 max-w-md">
              <ProgressBarLabel label="Disk usage" value={42} />
              <ProgressBarLabel label="Disk usage" caption="42%" value={42} />
              <ProgressBarLabel
                label="Dispatch capacity"
                caption="68 / 100"
                description="Approaching surge threshold — system will auto-throttle at 80%."
                value={68}
                tone="warning"
              />
            </div>
          }
          code={`<ProgressBarLabel label="Disk usage" value={42} />
<ProgressBarLabel label="Disk usage" caption="42%" value={42} />
<ProgressBarLabel
  label="Dispatch capacity"
  caption="68 / 100"
  description="Approaching surge threshold."
  value={68}
  tone="warning"
/>`}
        />
      </DocsSection>

      <DocsSection title="ProgressCircle">
        <p className="text-sm text-text-sub-600 max-w-2xl">
          Radial variant — five preset sizes (48 / 56 / 64 / 72 / 80 px) plus arbitrary pixel diameter. Centered percent label by default; toggle off via <code className="text-xs px-1 py-0.5 rounded bg-bg-weak-50">showLabel=false</code>. See the dedicated <a href="/docs/components/progress-circle" className="text-primary hover:underline">progress-circle</a> page for full state coverage.
        </p>
        <DocsExample
          title="5 sizes × 4 tones"
          preview={
            <div className="space-y-4">
              <div className="flex items-end gap-4">
                {[48, 56, 64, 72, 80].map((s) => (
                  <div key={s} className="flex flex-col items-center gap-1.5">
                    <ProgressCircle value={68} size={s as 48 | 56 | 64 | 72 | 80} />
                    <span className="text-[10px] text-text-soft-400">{s}px</span>
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-4">
                {(["primary","success","warning","error"] as const).map((t) => (
                  <div key={t} className="flex flex-col items-center gap-1.5">
                    <ProgressCircle value={68} tone={t} />
                    <span className="text-[10px] text-text-soft-400 capitalize">{t}</span>
                  </div>
                ))}
              </div>
            </div>
          }
          code={`<ProgressCircle value={68} size={48} />
<ProgressCircle value={68} size={80} tone="success" />
<ProgressCircle value={68} showLabel={false} />`}
        />
      </DocsSection>

      <DocsSection title="In a card">
        <p className="text-sm text-text-sub-600 max-w-2xl">
          Composed inside a status card — title + caption + bar + secondary description. Pair with tone shifts to mirror the underlying state (warning when nearing capacity, success when complete).
        </p>
        <DocsExample
          title="Storage card + onboarding card"
          preview={
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl">
              <div className="rounded-xl border border-stroke-soft-200 bg-bg-white-0 p-4 shadow-(--shadow-custom-xs)">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <div className="text-sm font-semibold text-text-strong-950">Storage</div>
                    <div className="text-xs text-text-sub-600">68 GB of 100 GB used</div>
                  </div>
                  <ProgressCircle value={68} size={48} tone="warning" />
                </div>
                <ProgressBar value={68} tone="warning" />
                <div className="text-xs text-text-sub-600 mt-2">Upgrade to 250 GB before you hit the limit.</div>
              </div>
              <div className="rounded-xl border border-stroke-soft-200 bg-bg-white-0 p-4 shadow-(--shadow-custom-xs)">
                <div className="text-sm font-semibold text-text-strong-950 mb-1">Onboarding</div>
                <div className="text-xs text-text-sub-600 mb-3">3 of 4 steps complete</div>
                <ProgressBar value={75} tone="success" />
                <ul className="mt-3 space-y-1.5 text-sm text-text-sub-600">
                  <li className="flex items-center gap-2"><span className="size-1.5 rounded-full bg-(--state-success-base)" /> Account created</li>
                  <li className="flex items-center gap-2"><span className="size-1.5 rounded-full bg-(--state-success-base)" /> Profile filled in</li>
                  <li className="flex items-center gap-2"><span className="size-1.5 rounded-full bg-(--state-success-base)" /> Verified email</li>
                  <li className="flex items-center gap-2"><span className="size-1.5 rounded-full bg-stroke-soft-200" /> Add payment method</li>
                </ul>
              </div>
            </div>
          }
          code={`<Card>
  <Header>Storage 68 GB of 100 GB used</Header>
  <ProgressCircle value={68} tone="warning" />
  <ProgressBar value={68} tone="warning" />
  <Hint>Upgrade before limit</Hint>
</Card>`}
        />
      </DocsSection>

      <DocsSection title="API">
        <DocsPropsTable
          rows={[
            { name: "ProgressBar.value", type: "number", description: "0-100 (auto-clamped)." },
            { name: "ProgressBar.size", type: '"sm" | "md" | "lg"', defaultValue: '"md"', description: "Track height — 4 / 6 / 8 px." },
            { name: "ProgressBar.tone", type: '"primary" | "information" | "success" | "warning" | "error"', defaultValue: '"primary"', description: "Indicator color." },
            { name: "ProgressBarLabel.label", type: "ReactNode", description: "Left-aligned label above the bar." },
            { name: "ProgressBarLabel.caption", type: "ReactNode", description: "Right-aligned caption above the bar (often the % or x / y count)." },
            { name: "ProgressBarLabel.description", type: "ReactNode", description: "Sub-line below the bar." },
            { name: "ProgressCircle.value", type: "number", description: "0-100." },
            { name: "ProgressCircle.size", type: '48 | 56 | 64 | 72 | 80 | number', defaultValue: "48", description: "Pixel diameter." },
            { name: "ProgressCircle.strokeWidth", type: "number", defaultValue: "4", description: "Ring stroke thickness." },
            { name: "ProgressCircle.showLabel", type: "boolean", defaultValue: "true", description: "Center percent label." },
            { name: "ProgressCircle.tone", type: "same as ProgressBar.tone", defaultValue: '"primary"', description: "Ring color." },
          ]}
        />
      </DocsSection>
    </DocsPageShell>
  )
}
