"use client"

import { Spinner } from "@/registry/dash/ui/spinner"
import { Button } from "@/registry/dash/ui/button"
import {
  DocsPageShell,
  DocsHeader,
  DocsSection,
  DocsExample,
  DocsPropsTable,
} from "@/components/docs/page-shell"
import { DocsCode } from "@/components/docs/code-block"

export default function SpinnerDocsPage() {
  return (
    <DocsPageShell>
      <DocsHeader
        category="Components / Feedback"
        title="Spinner"
        description="Indeterminate loading indicator. Use for async work whose duration is unknown — table fetch, file save, mutation in flight. For known-duration progress use Progress Bar."
      />

      <DocsSection title="Install">
        <DocsCode language="bash" code={`dash add spinner`} />
      </DocsSection>

      <DocsSection title="Usage">
        <DocsCode
          language="tsx"
          code={`import { Spinner } from "@/registry/dash/ui/spinner"

<Spinner />`}
        />
      </DocsSection>

      <DocsSection title="Examples" description="Sizes, tones, and inline button use.">
        <DocsExample
          title="Sizes"
          preview={
            <div className="flex items-center gap-6">
              <Spinner size="xs" />
              <Spinner size="sm" />
              <Spinner size="md" />
              <Spinner size="lg" />
              <Spinner size="xl" />
            </div>
          }
          code={`<Spinner size="xs" />
<Spinner size="sm" />
<Spinner size="md" />
<Spinner size="lg" />
<Spinner size="xl" />`}
        />

        <DocsExample
          title="Tones"
          preview={
            <div className="flex items-center gap-6">
              <Spinner tone="primary" />
              <Spinner tone="neutral" />
              <Spinner tone="destructive" />
              <div className="rounded-md bg-bg-strong-950 px-3 py-2">
                <Spinner tone="white" />
              </div>
            </div>
          }
          code={`<Spinner tone="primary" />
<Spinner tone="neutral" />
<Spinner tone="destructive" />
<Spinner tone="white" /> {/* on dark surface */}`}
        />

        <DocsExample
          title="Inside Button"
          description="Replaces left icon while Button has loading state."
          preview={
            <div className="flex gap-3">
              <Button>
                <Spinner size="sm" tone="white" />
                Memproses dispatch…
              </Button>
              <Button tone="neutral" style="stroke" disabled>
                <Spinner size="sm" tone="neutral" />
                Loading mitra
              </Button>
            </div>
          }
          code={`<Button>
  <Spinner size="sm" tone="white" />
  Memproses dispatch…
</Button>`}
        />
      </DocsSection>

      <DocsSection title="API">
        <DocsPropsTable
          rows={[
            { name: "size", type: '"xs" | "sm" | "md" | "lg" | "xl"', defaultValue: '"md"', description: "Diameter preset." },
            { name: "tone", type: '"primary" | "neutral" | "white" | "destructive"', defaultValue: '"primary"', description: "Color token." },
            { name: "label", type: "string", defaultValue: '"Loading"', description: "Screen-reader text for the live region." },
          ]}
        />
      </DocsSection>

      <DocsSection title="Anatomy">
        <ul className="space-y-2 text-sm text-text-strong-950/90">
          <li>• Wraps a Lucide <code className="text-xs">Loader2</code> in a <code className="text-xs">role=&quot;status&quot;</code> live region.</li>
          <li>• Visually hidden <code className="text-xs">label</code> announces to screen readers.</li>
          <li>• Spin animation honors <code className="text-xs">prefers-reduced-motion</code> via Tailwind <code className="text-xs">animate-spin</code>.</li>
        </ul>
      </DocsSection>

      <DocsSection title="Accessibility">
        <ul className="space-y-2 text-sm text-text-strong-950/90">
          <li>• <code className="text-xs">role=&quot;status&quot;</code> + <code className="text-xs">aria-live=&quot;polite&quot;</code> wired automatically — screen readers announce the label.</li>
          <li>• Default <code className="text-xs">label=&quot;Loading&quot;</code>; customize for context (e.g., &ldquo;Memproses dispatch&rdquo;).</li>
          <li>• Pair with skeleton placeholders for layout stability — Spinner alone causes layout shift when data arrives.</li>
          <li>• For very fast loads (&lt; 300 ms), skip the Spinner entirely — the flicker is worse than the gap.</li>
          <li>• Honors <code className="text-xs">prefers-reduced-motion</code>; if user prefers reduced motion, the spin animation is paused by Tailwind&apos;s reduce-motion media query.</li>
        </ul>
      </DocsSection>
    </DocsPageShell>
  )
}
