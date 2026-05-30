"use client"

import * as React from "react"
import {
  RiCheckLine as Check,
  RiArrowRightSLine as ChevronRight,
  RiUser3Line as User,
  RiBriefcaseLine as Briefcase,
  RiLockLine as Lock,
  RiFileListLine as List,
  RiCloseLine as Close,
  RiChat3Line as Chat,
} from "@remixicon/react"
import { StepIndicator, Step } from "@/registry/dash/ui/step-indicator"
import { DotStepper } from "@/registry/dash/ui/dot-stepper"
import { Button } from "@/registry/dash/ui/button"
import { CompactButton } from "@/registry/dash/ui/compact-button"
import { Textarea } from "@/registry/dash/ui/textarea"
import {
  DocsPageShell,
  DocsHeader,
  DocsSection,
  DocsExample,
  DocsPropsTable,
  DocsDoDont,
} from "@/components/docs/page-shell"
import { DocsCode } from "@/components/docs/code-block"

/**
 * Step Indicator — Figma 1:1 (9 nodes verified 2026-05-18).
 *
 *   3507:28      Horizontal numbered chips + chevron separators (Personal > Role > Position …)
 *   3505:3498    Master spec (4 states × 2 orientations)
 *   3507:227     Sizes + states matrix
 *   3507:190     Horizontal variant
 *   3507:560     Vertical variant w/ description
 *   479:14398    DotStepper (dot variant — 3 active positions × 2 sizes)
 *   3508:6488    Use case — onboarding wizard
 *   3508:6882    Use case — settings tabs
 *   3509:8130    DotStepper inside modal footer (Subscription Cancellation Survey)
 */

const wizardSteps = [
  { label: "Personal", description: "Your details" },
  { label: "Role",     description: "Pick a role" },
  { label: "Position", description: "Position info" },
  { label: "Password", description: "Set password" },
  { label: "Summary",  description: "Review + confirm" },
]

export default function StepIndicatorDocsPage() {
  const [active, setActive] = React.useState(1)

  return (
    <DocsPageShell>
      <DocsHeader
        status="beta"
        kind="composite"
        category="Components / Navigation"
        title="Step Indicator"
        description="Progress through a multi-step flow. Three primitives: StepIndicator + Step (numbered chips with completed-check / current-purple / upcoming-outline states), plus DotStepper (3-dot compact variant for modal footers + carousels)."
      />

      <DocsSection title="Install">
        <DocsCode language="bash" code={`dashkit add step-indicator dot-stepper`} />
      </DocsSection>

      <DocsSection title="Horizontal numbered chips">
        <p className="text-sm text-text-sub-600 max-w-2xl">
          Numbered circles + label + chevron-right separator between siblings. Three states: <strong>completed</strong> (green check), <strong>current</strong> (purple fill + white text), <strong>upcoming</strong> (gray outline).
        </p>
        <DocsExample
          title="5-step wizard"
          preview={
            <StepIndicator>
              {wizardSteps.map((s, i) => (
                <React.Fragment key={s.label}>
                  <Step
                    index={i}
                    label={s.label}
                    status={i < active ? "completed" : i === active ? "current" : "upcoming"}
                  />
                  {i < wizardSteps.length - 1 ? (
                    <ChevronRight aria-hidden className="size-5 text-icon-soft-400 shrink-0" />
                  ) : null}
                </React.Fragment>
              ))}
            </StepIndicator>
          }
          code={`<StepIndicator>
  {steps.map((s, i) => (
    <Fragment key={s.label}>
      <Step index={i} label={s.label} status={i < active ? "completed" : i === active ? "current" : "upcoming"} />
      {i < steps.length - 1 ? <ChevronRight /> : null}
    </Fragment>
  ))}
</StepIndicator>`}
        />
      </DocsSection>

      <DocsSection title="Interactive — wizard control">
        <p className="text-sm text-text-sub-600 max-w-2xl">
          Drive status via active index. Prev / Next buttons advance the wizard.
        </p>
        <DocsExample
          title="Click Next to advance"
          preview={
            <div className="space-y-4">
              <StepIndicator>
                {wizardSteps.map((s, i) => (
                  <React.Fragment key={s.label}>
                    <Step
                      index={i}
                      label={s.label}
                      status={i < active ? "completed" : i === active ? "current" : "upcoming"}
                    />
                    {i < wizardSteps.length - 1 ? (
                      <ChevronRight aria-hidden className="size-5 text-icon-soft-400 shrink-0" />
                    ) : null}
                  </React.Fragment>
                ))}
              </StepIndicator>
              <div className="flex items-center gap-2">
                <Button size="sm" tone="neutral" style="stroke" disabled={active === 0} onClick={() => setActive((v) => Math.max(0, v - 1))}>Previous</Button>
                <Button size="sm" tone="primary" disabled={active === wizardSteps.length - 1} onClick={() => setActive((v) => Math.min(wizardSteps.length - 1, v + 1))}>Next</Button>
                <span className="text-xs text-text-soft-400 ml-auto">{active + 1} / {wizardSteps.length}</span>
              </div>
            </div>
          }
          code={`const [active, setActive] = useState(1)

<StepIndicator>{steps...}</StepIndicator>
<Button onClick={() => setActive(v => v + 1)}>Next</Button>`}
        />
      </DocsSection>

      <DocsSection title="Vertical with description">
        <p className="text-sm text-text-sub-600 max-w-2xl">
          Stack vertically for left-rail flows (sign-up wizard, onboarding checklist). Each step is a full-width pill — current step gets white bg + trailing chevron, others get weak-50 bg.
        </p>
        <DocsExample
          title="Vertical 4-step onboarding"
          preview={
            <StepIndicator orientation="vertical" className="max-w-xs">
              {[
                { label: "Personal info", description: "Name, email, phone" },
                { label: "Pick a role",   description: "Engineer / PM / Designer" },
                { label: "Set password",  description: "8+ chars, 1 number" },
                { label: "Summary",       description: "Review and confirm" },
              ].map((s, i) => (
                <Step
                  key={s.label}
                  orientation="vertical"
                  index={i}
                  label={s.label}
                  description={s.description}
                  status={i < 1 ? "completed" : i === 1 ? "current" : "upcoming"}
                />
              ))}
            </StepIndicator>
          }
          code={`<StepIndicator orientation="vertical">
  <Step orientation="vertical" index={0} label="Personal info" description="..." status="completed" />
  <Step orientation="vertical" index={1} label="Pick a role" description="..." status="current" />
  <Step orientation="vertical" index={2} label="Set password" description="..." status="upcoming" />
</StepIndicator>`}
        />
      </DocsSection>

      <DocsSection title="State matrix">
        <p className="text-sm text-text-sub-600 max-w-2xl">
          3 states × 2 orientations. Status drives marker color + label tone.
        </p>
        <DocsExample
          title="completed / current / upcoming"
          preview={
            <div className="space-y-6">
              <div>
                <div className="text-[10px] uppercase tracking-wider text-text-soft-400 mb-2">Horizontal</div>
                <StepIndicator>
                  <Step index={0} label="completed" status="completed" />
                  <ChevronRight aria-hidden className="size-5 text-icon-soft-400" />
                  <Step index={1} label="current" status="current" />
                  <ChevronRight aria-hidden className="size-5 text-icon-soft-400" />
                  <Step index={2} label="upcoming" status="upcoming" />
                </StepIndicator>
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-wider text-text-soft-400 mb-2">Vertical</div>
                <StepIndicator orientation="vertical" className="max-w-xs">
                  <Step orientation="vertical" index={0} label="completed" status="completed" />
                  <Step orientation="vertical" index={1} label="current"   status="current" />
                  <Step orientation="vertical" index={2} label="upcoming"  status="upcoming" />
                </StepIndicator>
              </div>
            </div>
          }
          code={`<Step index={0} status="completed" label="completed" />
<Step index={1} status="current"   label="current" />
<Step index={2} status="upcoming"  label="upcoming" />`}
        />
      </DocsSection>

      <DocsSection title="DotStepper — 3-dot compact">
        <p className="text-sm text-text-sub-600 max-w-2xl">
          Compact dot indicator for modal footers, image carousels, onboarding sheets. ALL dots same size — active dot = primary fill, inactive = stroke-soft-200.
        </p>
        <DocsExample
          title="4 sizes × active position"
          preview={
            <div className="space-y-4">
              {(["xs","sm","md","lg"] as const).map((s) => (
                <div key={s} className="flex items-center gap-4">
                  <span className="text-[10px] uppercase tracking-wider text-text-soft-400 w-8">{s}</span>
                  <DotStepper steps={3} current={0} size={s} />
                  <DotStepper steps={3} current={1} size={s} />
                  <DotStepper steps={3} current={2} size={s} />
                </div>
              ))}
            </div>
          }
          code={`<DotStepper steps={3} current={0} size="sm" />
<DotStepper steps={3} current={1} size="md" />
<DotStepper steps={5} current={2} size="lg" />`}
        />
      </DocsSection>

      <DocsSection title="DotStepper in modal footer">
        <p className="text-sm text-text-sub-600 max-w-2xl">
          Mounted in modal footer to track multi-step survey / dialog flows. Combine with Cancel / Submit buttons for the final step.
        </p>
        <DocsExample
          title="Subscription Cancellation Survey (page 1 of 3)"
          preview={
            <div className="max-w-md rounded-xl border border-stroke-soft-200 bg-bg-white-0 shadow-(--shadow-custom-md)">
              <header className="flex items-start gap-3 p-4 border-b border-stroke-soft-200">
                <span className="size-9 rounded-full bg-bg-weak-50 text-icon-soft-400 inline-flex items-center justify-center shrink-0">
                  <Chat className="size-4" />
                </span>
                <div className="flex-1">
                  <div className="text-sm font-semibold text-text-strong-950">Subscription Cancellation Survey</div>
                  <div className="text-xs text-text-sub-600">Please choose a reason for canceling.</div>
                </div>
                <CompactButton size="sm" variant="ghost" aria-label="Close"><Close /></CompactButton>
              </header>
              <div className="p-4 space-y-3">
                {[
                  "Not satisfied with services.",
                  "Found an alternative solution.",
                  "Financial reasons.",
                  "Limited availability of sessions.",
                  "Other (please specify).",
                ].map((r, i) => (
                  <label key={r} className="flex items-center gap-2.5 cursor-pointer text-sm">
                    <span className={[
                      "size-4 rounded-full border inline-flex items-center justify-center",
                      i === 4 ? "border-primary" : "border-stroke-soft-200",
                    ].join(" ")}>
                      {i === 4 ? <span className="size-2 rounded-full bg-primary" /> : null}
                    </span>
                    <span className="text-text-strong-950">{r}</span>
                  </label>
                ))}
                <Textarea placeholder="I have recently relocated to a different city..." className="mt-2" maxLength={200} />
              </div>
              <div className="flex items-center justify-between gap-3 px-4 py-3 border-t border-stroke-soft-200">
                <DotStepper steps={3} current={0} size="md" />
                <div className="inline-flex items-center gap-2">
                  <Button size="sm" tone="neutral" style="stroke">Cancel</Button>
                  <Button size="sm" tone="primary">Submit</Button>
                </div>
              </div>
            </div>
          }
          code={`<footer>
  <DotStepper count={3} active={page} />
  <Button>Cancel</Button>
  <Button>Submit</Button>
</footer>`}
        />
      </DocsSection>

      <DocsSection title="Do this, not that">
        <p className="text-base text-text-sub-600 leading-relaxed max-w-2xl">
          Step indicator menunjukkan progress dalam linear flow. Label setiap step secara jelas — mitra tahu apa yang akan terjadi.
        </p>
        <DocsDoDont
          do={{
            preview: (
              <div className="w-full max-w-xs text-xs flex items-center gap-1">
                <div className="flex items-center gap-1">
                  <div className="size-5 rounded-full bg-success-base text-white flex items-center justify-center text-[9px]">✓</div>
                  <span className="text-text-sub-600">Identitas</span>
                </div>
                <div className="flex-1 h-px bg-success-base" />
                <div className="flex items-center gap-1">
                  <div className="size-5 rounded-full bg-(--dash-purple-500) text-white flex items-center justify-center text-[9px]">2</div>
                  <span className="font-medium">Dokumen</span>
                </div>
                <div className="flex-1 h-px bg-stroke-soft-200" />
                <div className="flex items-center gap-1 text-text-soft-400">
                  <div className="size-5 rounded-full border border-stroke-soft-200 flex items-center justify-center text-[9px]">3</div>
                  <span>Review</span>
                </div>
              </div>
            ),
            caption: "Mitra onboarding 3-step: Identitas → Dokumen → Review. Label jelas, status visual (done/current/upcoming).",
          }}
          dont={{
            preview: (
              <div className="w-full max-w-xs text-xs flex items-center gap-1">
                {[1,2,3,4,5,6,7].map(n => (
                  <div key={n} className="size-5 rounded-full border border-stroke-soft-200 flex items-center justify-center text-[9px]">{n}</div>
                ))}
              </div>
            ),
            caption: "Hindari 7+ step tanpa label. Mitra tidak tahu apa yang harus disiapkan, kapan selesai.",
          }}
        />
        <DocsDoDont
          do={{
            caption: "Pakai untuk flow 3-5 step yang serial dan tidak skip-able (mitra onboarding, payout setup, KYC).",
          }}
          dont={{
            caption: "Jangan pakai untuk filter/preference (\"Pilih kategori\"). Itu form biasa, bukan stepper.",
          }}
        />
      </DocsSection>

      <DocsSection title="API">
        <DocsPropsTable
          rows={[
            { name: "StepIndicator.orientation", type: '"horizontal" | "vertical"', defaultValue: '"horizontal"', description: "Stack direction. Horizontal renders inline row; vertical renders stacked pills." },
            { name: "Step.status", type: '"completed" | "current" | "upcoming"', description: "Drives marker color + label tone." },
            { name: "Step.index", type: "number", description: "Numeric position (0-based). Renders inside the upcoming-state circle." },
            { name: "Step.label", type: "ReactNode", description: "Step name." },
            { name: "Step.description", type: "ReactNode", description: "Secondary line (vertical orientation only)." },
            { name: "Step.orientation", type: '"horizontal" | "vertical"', defaultValue: '"horizontal"', description: "Match parent StepIndicator orientation." },
            { name: "DotStepper.count", type: "number", description: "Total dots rendered." },
            { name: "DotStepper.active", type: "number", description: "0-based active index. Active dot = primary fill." },
            { name: "DotStepper.size", type: '"xs" | "sm" | "md" | "lg"', defaultValue: '"sm"', description: "4 / 6 / 8 / 10 px dot size." },
          ]}
        />
      </DocsSection>
    </DocsPageShell>
  )
}
