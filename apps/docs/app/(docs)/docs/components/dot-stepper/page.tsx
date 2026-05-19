"use client"

import { useState } from "react"
import { DotStepper } from "@/registry/dash/ui/dot-stepper"
import { Button } from "@/registry/dash/ui/button"
import {
  DocsPageShell,
  DocsHeader,
  DocsSection,
  DocsExample,
  DocsPropsTable,
} from "@/components/docs/page-shell"
import { DocsCode } from "@/components/docs/code-block"

export default function DotStepperDocsPage() {
  const [step, setStep] = useState(1)
  const total = 5

  return (
    <DocsPageShell>
      <DocsHeader
        category="Components / Navigation"
        title="Dot Stepper"
        description="Minimal dot-based progress indicator for short flows — onboarding, multi-screen tutorial, carousel progress. For full step-by-step UI use Step Indicator."
      />

      <DocsSection title="Install">
        <DocsCode language="bash" code={`dash add dot-stepper`} />
      </DocsSection>

      <DocsSection title="Example">
        <DocsExample
          title="Onboarding tutorial"
          preview={
            <div className="flex flex-col items-center gap-4">
              <DotStepper steps={total} current={step} />
              <p className="text-sm text-text-sub-600">Step {step + 1} of {total}</p>
              <div className="flex gap-2">
                <Button
                  tone="neutral"
                  style="stroke"
                  size="sm"
                  disabled={step === 0}
                  onClick={() => setStep((s) => Math.max(0, s - 1))}
                >
                  Prev
                </Button>
                <Button
                  size="sm"
                  disabled={step === total - 1}
                  onClick={() => setStep((s) => Math.min(total - 1, s + 1))}
                >
                  Next
                </Button>
              </div>
            </div>
          }
          code={`<DotStepper steps={5} current={step} />`}
        />

        <DocsExample
          title="Sizes"
          preview={
            <div className="flex flex-col items-center gap-3">
              <DotStepper steps={5} current={2} size="sm" />
              <DotStepper steps={5} current={2} size="md" />
              <DotStepper steps={5} current={2} size="lg" />
            </div>
          }
          code={`<DotStepper steps={5} current={2} size="sm" />
<DotStepper steps={5} current={2} size="md" />
<DotStepper steps={5} current={2} size="lg" />`}
        />

        <DocsExample
          title="Tied to a Carousel"
          description="Pair with Carousel.setApi to sync the active dot with the visible slide."
          preview={
            <div className="text-sm text-text-sub-600">
              See <a href="/docs/components/carousel" className="underline">Carousel</a> external-controls example for the wiring.
            </div>
          }
          code={`const [api, setApi] = useState<CarouselApi>()
const [current, setCurrent] = useState(0)

useEffect(() => {
  if (!api) return
  setCurrent(api.selectedScrollSnap())
  api.on("select", () => setCurrent(api.selectedScrollSnap()))
}, [api])

<Carousel setApi={setApi}>…</Carousel>
<DotStepper steps={api?.scrollSnapList().length ?? 0} current={current} />`}
        />

        <DocsExample
          title="Long flow (8 steps)"
          preview={
            <div className="flex flex-col items-center gap-2">
              <DotStepper steps={8} current={4} />
              <p className="text-xs text-text-sub-600">Step 5 of 8 — KYC verification</p>
            </div>
          }
          code={`<DotStepper steps={8} current={4} />`}
        />
      </DocsSection>

      <DocsSection title="When to use vs Step Indicator">
        <ul className="space-y-2 text-sm text-text-strong-950/90">
          <li>• <strong>Dot Stepper</strong> — short flows (3–8 steps), labels not needed. Onboarding intros, carousel position.</li>
          <li>• <strong>Step Indicator</strong> — long structured flows where each step has a name (KYC submission, dispatch wizard).</li>
        </ul>
      </DocsSection>

      <DocsSection title="API">
        <DocsPropsTable
          rows={[
            { name: "steps", type: "number", description: "Total dot count." },
            { name: "current", type: "number", description: "Active dot index (0-based)." },
            { name: "size", type: '"sm" | "md" | "lg"', defaultValue: '"md"', description: "Dot size preset." },
          ]}
        />
      </DocsSection>

      <DocsSection title="Accessibility">
        <ul className="space-y-2 text-sm text-text-strong-950/90">
          <li>• <strong>Role</strong> — renders <code className="text-xs">role=&quot;progressbar&quot;</code> with <code className="text-xs">aria-valuemin=&quot;0&quot;</code>, <code className="text-xs">aria-valuemax</code> = total, <code className="text-xs">aria-valuenow</code> = current + 1.</li>
          <li>• <strong>ARIA you add</strong> — pair with a visible &quot;Step X of Y&quot; line, or pass <code className="text-xs">aria-label=&quot;Onboarding step&quot;</code>.</li>
          <li>• <strong>Keyboard</strong> — non-interactive by default. If used as a tab strip, wrap each dot in a button and add <code className="text-xs">role=&quot;tab&quot;</code> / <code className="text-xs">aria-selected</code>.</li>
          <li>• <strong>Reduced motion</strong> — dot-grow transition respects <code className="text-xs">prefers-reduced-motion</code>.</li>
        </ul>
      </DocsSection>
    </DocsPageShell>
  )
}
