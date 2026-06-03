"use client"

import { useEffect, useState } from "react"
import { ProgressCircle } from "@/registry/dash/ui/progress-circle"
import {
  DocsPageShell,
  DocsHeader,
  DocsSection,
  DocsExample,
  DocsPropsTable,
  DocsDoDont,
} from "@/components/docs/page-shell"
import { DocsCode } from "@/components/docs/code-block"

export default function ProgressCircleDocsPage() {
  const [v, setV] = useState(28)
  useEffect(() => {
    const t = setInterval(() => setV((x) => (x >= 100 ? 28 : x + 4)), 600)
    return () => clearInterval(t)
  }, [])

  return (
    <DocsPageShell>
      <DocsHeader
        status="beta"
        kind="atom"
        category="Components / Feedback"
        title="Progress Circle"
        description="Compact circular progress for inline indicators — KPI tiles, upload progress per row, mitra rating ring. For full-width progress use Progress Bar."
      />

      <DocsSection title="Install">
        <DocsCode language="bash" code={`dashkit add progress-circle`} />
      </DocsSection>

      <DocsSection title="Examples">
        <DocsExample
          title="Animated value"
          preview={<ProgressCircle value={v} />}
          code={`<ProgressCircle value={value} />`}
        />

        <DocsExample
          title="Sizes + tones"
          preview={
            <div className="flex items-center gap-6">
              <ProgressCircle value={60} size={32} tone="primary" />
              <ProgressCircle value={45} size={48} tone="success" />
              <ProgressCircle value={75} size={64} tone="warning" />
              <ProgressCircle value={90} size={80} tone="error" />
            </div>
          }
          code={`<ProgressCircle value={60} size={32} tone="primary" />
<ProgressCircle value={45} size={48} tone="success" />
<ProgressCircle value={75} size={64} tone="warning" />
<ProgressCircle value={90} size={80} tone="error" />`}
        />

        <DocsExample
          title="Without label"
          preview={<ProgressCircle value={70} showLabel={false} />}
          code={`<ProgressCircle value={70} showLabel={false} />`}
        />
      </DocsSection>

      <DocsSection title="Do this, not that">
        <p className="text-base text-text-sub-600 leading-relaxed max-w-2xl">
          ProgressCircle untuk progress determinate yang compact (KPI tile, per-row upload). Tone harus match severity. Untuk indeterminate work (loading tanpa kemajuan), pakai Spinner.
        </p>
        <DocsDoDont
          do={{
            preview: (
              <div className="flex flex-col items-center gap-2 rounded-lg border border-stroke-soft-200 bg-bg-white-0 p-3 max-w-[140px]">
                <ProgressCircle value={72} size={48} tone="success" />
                <div className="text-xs text-text-strong-950 text-center">72% mitra aktif</div>
              </div>
            ),
            caption: "KPI compact dengan tone success (target tercapai). Label di bawah jelas: 72% dari apa. Progress determinate + label = self-explanatory.",
          }}
          dont={{
            preview: (
              <ProgressCircle value={0} size={48} tone="primary" />
            ),
            caption: "Loading indeterminate pakai ProgressCircle value=0 = visual flat ring, user kira broken. Pakai Spinner.",
          }}
        />
        <DocsDoDont
          do={{
            preview: (
              <div className="flex items-center gap-3 rounded-lg border border-stroke-soft-200 bg-bg-white-0 p-2 max-w-xs">
                <ProgressCircle value={92} size={32} tone="warning" />
                <div className="text-xs">
                  <div className="font-medium text-text-strong-950">SLA Bekasi</div>
                  <div className="text-text-sub-600">92% — mendekati threshold</div>
                </div>
              </div>
            ),
            caption: "92% threshold dengan tone='warning' (mendekati overlimit). Color match severity → dispatcher tahu butuh perhatian.",
          }}
          dont={{
            preview: (
              <div className="flex items-center gap-3 rounded-lg border border-stroke-soft-200 bg-bg-white-0 p-2 max-w-xs">
                <ProgressCircle value={92} size={32} tone="error" />
                <div className="text-xs">
                  <div className="font-medium text-text-strong-950">SLA Bekasi</div>
                  <div className="text-text-sub-600">92% — masih aman</div>
                </div>
              </div>
            ),
            caption: "92% 'masih aman' tapi tone='error' (merah) = dispatcher panik tanpa sebab. Tone harus sinkron dengan teks kondisi.",
          }}
        />
      </DocsSection>

      <DocsSection title="API">
        <DocsPropsTable
          rows={[
            { name: "value", type: "number", description: "Progress percent (0-100). Auto-clamped." },
            { name: "size", type: "number", defaultValue: "48", description: "Diameter in px." },
            { name: "strokeWidth", type: "number", defaultValue: "4", description: "Ring stroke thickness in px." },
            { name: "tone", type: '"primary" | "success" | "warning" | "error" | "information"', defaultValue: '"primary"', description: "Track color." },
            { name: "showLabel", type: "boolean", defaultValue: "true", description: "Show centered percent label." },
            { name: "className", type: "string", description: "Extend SVG classes." },
          ]}
        />
      </DocsSection>

      <DocsSection title="Anatomy">
        <ul className="space-y-2 text-sm text-text-strong-950/90">
          <li>• SVG with two concentric circles — background track (soft) + tone-colored arc.</li>
          <li>• Rotated -90deg so progress starts at 12 o&apos;clock.</li>
          <li>• Stroke-dashoffset animates over 300ms ease-out; honors <code className="text-xs">prefers-reduced-motion</code>.</li>
        </ul>
      </DocsSection>

      <DocsSection title="Accessibility">
        <ul className="space-y-2 text-sm text-text-strong-950/90">
          <li>• Wires <code className="text-xs">role=&quot;progressbar&quot;</code> + <code className="text-xs">aria-valuenow</code> / <code className="text-xs">aria-valuemin</code> / <code className="text-xs">aria-valuemax</code>.</li>
          <li>• For indeterminate work use Spinner instead (drops <code className="text-xs">aria-valuenow</code>).</li>
          <li>• When used inside a labelled context (KPI tile, file upload row), the surrounding label is sufficient — no extra <code className="text-xs">aria-label</code> needed.</li>
          <li>• Use a tone-meaningful color paired with the label (don&apos;t rely on color alone — 90% warning ring + 90% text both communicate state).</li>
        </ul>
      </DocsSection>
    </DocsPageShell>
  )
}
