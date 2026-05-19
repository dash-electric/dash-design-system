"use client"

import Link from "next/link"
import {
  DocsPageShell,
  DocsHeader,
  DocsSection,
} from "@/components/docs/page-shell"
import { DocsCode } from "@/components/docs/code-block"

export default function RhfPage() {
  return (
    <DocsPageShell>
      <DocsHeader
        category="Forms"
        title="React Hook Form"
        description="Dash bundles React Hook Form + Zod as the default form stack. Field primitives are RHF-aware out of the box — no Controller boilerplate for native inputs, full zod schema validation, multi-step support."
      />

      <DocsSection
        title="Why RHF in Dash"
        description="Uncontrolled inputs by default, smallest re-render footprint, plays clean with shadcn-style Field composition."
      >
        <ul className="text-sm text-text-sub-600 list-disc pl-5 space-y-1">
          <li>Subscribe-only architecture — only fields that read state re-render on change.</li>
          <li>Zod resolver gives strongly typed <code className="text-xs">errors</code> + <code className="text-xs">values</code> with zero extra glue.</li>
          <li>Halo-dash mitra suspend modal, Auto-Suspend rule builder, and form-stepper-page all use this stack.</li>
        </ul>
      </DocsSection>

      <DocsSection title="Install">
        <DocsCode
          language="bash"
          code={`pnpm dlx dash add form field input label hint
pnpm add react-hook-form zod @hookform/resolvers`}
        />
      </DocsSection>

      <DocsSection title="Schema + form">
        <DocsCode
          language="tsx"
          code={`"use client"

import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/registry/dash/ui/button"
import { FormField, FormLabel, FormControl, FormMessage } from "@/registry/dash/ui/form"
import { Input } from "@/registry/dash/ui/input"

const schema = z.object({
  mitraId: z.string().regex(/^mitra-\\d{4}$/, "Format: mitra-NNNN"),
  reason:  z.string().min(8, "Min 8 karakter alasan suspend"),
})

type FormData = z.infer<typeof schema>

export function MitraSuspendForm() {
  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { mitraId: "", reason: "" },
    mode: "onBlur",
  })

  const onSubmit = (data: FormData) => {
    console.log("suspend", data)
    // → POST /api/mitra/{id}/suspend
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <FormField name="mitraId" control={form.control}>
        <FormLabel>Mitra ID</FormLabel>
        <FormControl as={Input} placeholder="mitra-9412" />
        <FormMessage />
      </FormField>
      <FormField name="reason" control={form.control}>
        <FormLabel>Reason</FormLabel>
        <FormControl as={Input} placeholder="3 dispatch terlewat" />
        <FormMessage />
      </FormField>
      <Button type="submit" disabled={form.formState.isSubmitting}>
        Suspend mitra
      </Button>
    </form>
  )
}`}
        />
      </DocsSection>

      <DocsSection
        title="Validation modes"
        description="Pick when errors fire. Halo-dash convention: onBlur for forms with 2-4 fields, onSubmit for longer flows."
      >
        <DocsCode
          language="tsx"
          code={`useForm({ mode: "onBlur" })       // validate on blur — best UX default
useForm({ mode: "onChange" })     // live — for password meters, OTP
useForm({ mode: "onSubmit" })     // first attempt only — long forms
useForm({ mode: "onTouched" })    // onBlur then onChange — hybrid`}
        />
      </DocsSection>

      <DocsSection
        title="File upload integration"
        description="FileUpload exposes onChange(File[]) — wire it through Controller for RHF visibility."
      >
        <DocsCode
          language="tsx"
          code={`import { Controller } from "react-hook-form"
import { FileUpload } from "@/registry/dash/ui/file-upload"

<Controller
  name="proofOfIncident"
  control={form.control}
  rules={{ required: "Bukti dispatch wajib" }}
  render={({ field, fieldState }) => (
    <FormField name={field.name} control={form.control}>
      <FormLabel>Bukti dispatch</FormLabel>
      <FileUpload
        accept="image/*,application/pdf"
        maxSize={5 * 1024 * 1024}
        onChange={field.onChange}
        value={field.value}
      />
      <FormMessage>{fieldState.error?.message}</FormMessage>
    </FormField>
  )}
/>`}
        />
      </DocsSection>

      <DocsSection
        title="Multi-step forms"
        description="Pair RHF with the form-stepper-page template — each step is its own useForm, parent owns merged state."
      >
        <DocsCode
          language="tsx"
          code={`// each step renders its own <form>, calls onNext(data)
// parent template merges:
const [draft, setDraft] = useState<Partial<FullForm>>({})

const onStepSubmit = (stepData: Partial<FullForm>) => {
  setDraft((prev) => ({ ...prev, ...stepData }))
  goToNextStep()
}

// final step submits draft to API`}
        />
        <p className="text-sm text-text-sub-600 mt-3">
          Reference:{" "}
          <Link className="text-(--dash-purple-600) underline-offset-4 hover:underline" href="/docs/templates/form-stepper-page">
            Templates → Form Stepper
          </Link>
          .
        </p>
      </DocsSection>

      <DocsSection title="When to pick TanStack Form instead">
        <p className="text-sm text-text-sub-600">
          For forms with hundreds of fields (dispatch rule builder, BMKG weather-trigger DSL editor),
          TanStack Form&apos;s field-level subscriptions can outperform RHF. See{" "}
          <Link className="text-(--dash-purple-600) underline-offset-4 hover:underline" href="/docs/forms/tanstack-form">
            Forms → TanStack Form
          </Link>
          .
        </p>
      </DocsSection>
    </DocsPageShell>
  )
}
