"use client"

import { Skeleton } from "@/registry/dash/ui/skeleton"
import {
  DocsPageShell,
  DocsHeader,
  DocsSection,
  DocsExample,
  DocsPropsTable,
} from "@/components/docs/page-shell"
import { DocsCode } from "@/components/docs/code-block"

export default function SkeletonDocsPage() {
  return (
    <DocsPageShell>
      <DocsHeader
        category="Components / Feedback"
        title="Skeleton"
        description="Shape placeholder during fetch. Mirrors the eventual content layout so the page does not jump when data arrives. Pair with Spinner only when wait is long enough to need both."
      />

      <DocsSection title="Install">
        <DocsCode language="bash" code={`dash add skeleton`} />
      </DocsSection>

      <DocsSection title="Usage">
        <DocsCode
          language="tsx"
          code={`import { Skeleton } from "@/registry/dash/ui/skeleton"

<Skeleton className="h-9 w-48" />`}
        />
      </DocsSection>

      <DocsSection title="Examples">
        <DocsExample
          title="Shapes"
          preview={
            <div className="flex items-center gap-6">
              <Skeleton className="size-12" shape="circle" />
              <div className="space-y-2">
                <Skeleton className="w-40" shape="text" />
                <Skeleton className="w-32" shape="text" />
              </div>
              <Skeleton className="h-20 w-32" shape="rect" />
            </div>
          }
          code={`<Skeleton shape="circle" className="size-12" />
<Skeleton shape="text"   className="w-40" />
<Skeleton shape="rect"   className="h-20 w-32" />`}
        />

        <DocsExample
          title="Mitra row skeleton"
          description="Mirrors a real Reservasi list row — avatar + name/city stack + status pill + trip count."
          preview={
            <div className="w-full max-w-md divide-y divide-stroke-soft-200 rounded-xl border border-stroke-soft-200 bg-bg-white-0">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-3 px-4 py-3">
                  <Skeleton className="size-9" shape="circle" />
                  <div className="flex-1 space-y-1.5">
                    <Skeleton className="w-32" shape="text" />
                    <Skeleton className="w-20 h-3" shape="text" />
                  </div>
                  <Skeleton className="h-5 w-14 rounded-full" />
                  <Skeleton className="w-8" shape="text" />
                </div>
              ))}
            </div>
          }
          code={`<div className="flex items-center gap-3 px-4 py-3">
  <Skeleton shape="circle" className="size-9" />
  <div className="flex-1 space-y-1.5">
    <Skeleton shape="text" className="w-32" />
    <Skeleton shape="text" className="w-20 h-3" />
  </div>
  <Skeleton className="h-5 w-14 rounded-full" />
  <Skeleton shape="text" className="w-8" />
</div>`}
        />
      </DocsSection>

      <DocsSection title="API">
        <DocsPropsTable
          rows={[
            { name: "shape", type: '"rect" | "circle" | "text"', defaultValue: '"rect"', description: "Preset border-radius + default height. text = thinner (text-line height); circle = full radius; rect = soft 6px." },
            { name: "className", type: "string", description: "Set width / height / radius to match real content." },
          ]}
        />
      </DocsSection>

      <DocsSection title="Stat card skeleton">
        <DocsExample
          title="KPI tile placeholder"
          description="Mirrors a Card + Stat tile while metrics are loading."
          preview={
            <div className="grid grid-cols-3 gap-4 w-full max-w-xl">
              {[1, 2, 3].map((i) => (
                <div key={i} className="rounded-xl border border-stroke-soft-200 bg-bg-white-0 p-4 space-y-2">
                  <Skeleton shape="text" className="w-20 h-3" />
                  <Skeleton shape="text" className="w-16 h-7" />
                  <Skeleton shape="text" className="w-24 h-3" />
                </div>
              ))}
            </div>
          }
          code={`<div className="rounded-xl border p-4 space-y-2">
  <Skeleton shape="text" className="w-20 h-3" />
  <Skeleton shape="text" className="w-16 h-7" />
  <Skeleton shape="text" className="w-24 h-3" />
</div>`}
        />

        <DocsExample
          title="Paragraph block"
          preview={
            <div className="w-full max-w-md space-y-1.5">
              <Skeleton shape="text" />
              <Skeleton shape="text" />
              <Skeleton shape="text" className="w-2/3" />
            </div>
          }
          code={`<Skeleton shape="text" />
<Skeleton shape="text" />
<Skeleton shape="text" className="w-2/3" />`}
        />
      </DocsSection>

      <DocsSection title="Anatomy">
        <ul className="space-y-2 text-sm text-text-strong-950/90">
          <li>• Soft pulsing background — pure decoration, no layout impact beyond width / height.</li>
          <li>• Match real content dimensions to prevent post-fetch layout shift.</li>
          <li>• Render alongside real content in conditional <code className="text-xs">{`{loading ? <Skeleton /> : data}`}</code> patterns; do not render a Spinner on top.</li>
        </ul>
      </DocsSection>

      <DocsSection title="Accessibility">
        <ul className="space-y-2 text-sm text-text-strong-950/90">
          <li>• Skeletons are <code className="text-xs">aria-hidden</code> by default — screen readers should announce &ldquo;Loading&hellip;&rdquo; via the surrounding region&apos;s <code className="text-xs">aria-busy</code> state.</li>
          <li>• Wrap the loading region in <code className="text-xs">aria-busy=&quot;true&quot;</code> while data is in flight; remove when content arrives.</li>
          <li>• For very fast loads (under 300ms) skip the skeleton entirely — the flicker is worse than the gap.</li>
          <li>• Honors <code className="text-xs">prefers-reduced-motion</code> — pulse animation pauses on supported OSes.</li>
        </ul>
      </DocsSection>
    </DocsPageShell>
  )
}
