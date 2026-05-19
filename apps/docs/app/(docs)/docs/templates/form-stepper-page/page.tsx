"use client"

import { useState } from "react"
import { FormStepperPage } from "@/registry/dash/templates/form-stepper-page"
import { Field, FieldGroup } from "@/registry/dash/ui/field"
import { Label } from "@/registry/dash/ui/label"
import { InputRoot, Input } from "@/registry/dash/ui/input"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/registry/dash/ui/select"
import {
  DocsPageShell,
  DocsHeader,
  DocsSection,
  DocsExample,
  DocsPropsTable,
} from "@/components/docs/page-shell"
import { DocsCode } from "@/components/docs/code-block"
import { DocsTemplatePreview } from "@/components/docs/template-preview"

const steps = [
  { id: "identity", label: "Identitas", description: "Data diri" },
  { id: "tribe", label: "Tribe", description: "Pilih jalur" },
  { id: "kyc", label: "KYC", description: "Verifikasi" },
  { id: "review", label: "Review", description: "Konfirmasi" },
]

export default function FormStepperPageDocs() {
  const [i, setI] = useState(0)
  const last = steps.length - 1

  return (
    <DocsPageShell>
      <DocsHeader
        category="Templates / Generic"
        title="Form Stepper Page"
        description="Multi-step form layout for KYC mitra onboarding, dispatch override flows, payout dispute resolution. Step indicator on top, body in a card, Prev/Next footer — you bring the per-step fields."
      />

      <DocsSection title="Install">
        <DocsCode language="bash" code={`dash add form-stepper-page`} />
      </DocsSection>

      <DocsSection
        title="Examples"
        description="Live stepper — click Next / Prev below to see each step's field set."
      >
        <DocsExample
          bare
          title="KYC mitra onboarding"
          description="4-step flow: Identitas → Tribe → KYC docs → Review. Footer Prev/Next handled by the template."
          preview={
            <DocsTemplatePreview>
            <FormStepperPage
              title="Onboarding mitra"
              description="Selesaikan 4 langkah untuk mengaktifkan akun."
              steps={steps}
              currentIndex={i}
              onPrev={() => setI((x) => Math.max(0, x - 1))}
              onNext={() => setI((x) => Math.min(last, x + 1))}
              onComplete={() => setI(0)}
            >
              {i === 0 ? (
                <FieldGroup>
                  <Field>
                    <Label>Nama lengkap</Label>
                    <InputRoot><Input placeholder="Nama sesuai KTP" /></InputRoot>
                  </Field>
                  <Field>
                    <Label>No HP</Label>
                    <InputRoot><Input placeholder="0812-…" /></InputRoot>
                  </Field>
                </FieldGroup>
              ) : i === 1 ? (
                <Field>
                  <Label>Tribe</Label>
                  <Select defaultValue="reservasi">
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="reservasi">Reservasi</SelectItem>
                      <SelectItem value="express">Express</SelectItem>
                      <SelectItem value="bulk">Bulk</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
              ) : i === 2 ? (
                <p className="text-sm text-text-sub-600">
                  Upload KTP + SIM + STNK + selfie liveness. (Composer placeholder — pasang FileUpload + ImageUpload di sini.)
                </p>
              ) : (
                <div className="space-y-2 text-sm text-text-strong-950">
                  <p className="font-semibold">Konfirmasi data</p>
                  <p className="text-text-sub-600">
                    Mitra akan auto-aktif di tribe terpilih setelah Submit. Dispatch akan dimulai dalam 24 jam.
                  </p>
                </div>
              )}
            </FormStepperPage>
            </DocsTemplatePreview>
          }
          code={`<FormStepperPage
  title="Onboarding mitra"
  steps={steps}
  currentIndex={i}
  onPrev={() => setI((x) => Math.max(0, x - 1))}
  onNext={() => setI((x) => Math.min(last, x + 1))}
  onComplete={handleSubmit}
>
  {/* render the step body based on i */}
</FormStepperPage>`}
        />
      </DocsSection>

      <DocsSection
        title="Composition"
        description="Pure layout — the template renders chrome (indicator + footer), you render fields."
      >
        <ul className="text-sm text-text-sub-600 space-y-1.5 list-disc pl-5">
          <li>Step indicator — driven by <code>steps</code> + <code>currentIndex</code>. Use <code>{`step.description`}</code> for the short subtext under each label.</li>
          <li>Body — render whatever fields you want. Inside, prefer <code>FieldGroup</code> + <code>Field</code> + <code>Label</code> + <code>InputRoot</code> stacks.</li>
          <li>Footer — Prev/Next/Complete buttons are auto-disabled at the boundaries. Override labels via <code>nextLabel</code> / <code>prevLabel</code> / <code>completeLabel</code>.</li>
          <li>Pass <code>hideFooter</code> when a step has its own custom CTA (e.g. KYC upload that needs its own progress UI).</li>
          <li>Controlled <code>currentIndex</code> — parent owns the cursor, template owns the chrome. You can persist progress in URL params.</li>
        </ul>
      </DocsSection>

      <DocsSection title="When to use">
        <ul className="text-sm text-text-sub-600 space-y-1.5 list-disc pl-5">
          <li><strong>Use</strong> for any onboarding flow ≥ 3 steps where progress visibility helps completion.</li>
          <li><strong>Use</strong> for dispute / appeal / override flows where the user is committing to a decision.</li>
          <li><strong>Use</strong> when each step has a clear "next" action — not exploratory.</li>
          <li><strong>Don't</strong> use for single-form pages — reach for <code>FieldGroup</code> + a Card directly.</li>
          <li><strong>Don't</strong> use for wizards that branch — Stepper assumes linear progress.</li>
        </ul>
      </DocsSection>

      <DocsSection title="API">
        <DocsPropsTable
          rows={[
            { name: "steps", type: "FormStep[]", description: "{ id, label, description? }[]." },
            { name: "currentIndex", type: "number", description: "Active step index (0-based)." },
            { name: "onPrev / onNext / onComplete", type: "() => void", description: "Footer button handlers." },
            { name: "nextLabel / prevLabel / completeLabel", type: "ReactNode", description: "Button copy override." },
            { name: "hideFooter", type: "boolean", defaultValue: "false", description: "Render your own footer inside children." },
          ]}
        />
      </DocsSection>
    </DocsPageShell>
  )
}
