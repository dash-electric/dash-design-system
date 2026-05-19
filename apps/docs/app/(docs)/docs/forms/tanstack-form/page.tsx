"use client"

import Link from "next/link"
import {
  DocsPageShell,
  DocsHeader,
  DocsSection,
  DocsPropsTable,
} from "@/components/docs/page-shell"
import { DocsCode } from "@/components/docs/code-block"

export default function TanstackFormPage() {
  return (
    <DocsPageShell>
      <DocsHeader
        category="Forms"
        title="TanStack Form"
        description="Headless form library with field-level subscriptions. Pick this over React Hook Form when your form has 50+ fields or deeply nested arrays (dispatch-rule builders, BMKG weather DSL editors)."
      />

      <DocsSection title="When to pick TanStack over RHF">
        <DocsPropsTable
          rows={[
            { name: "Field count",      type: "design",  description: "50+ fields, or nested arrays of arrays — TanStack wins on render perf." },
            { name: "Type safety",      type: "design",  description: "Both excellent. TanStack edges ahead on deeply nested types." },
            { name: "Bundle size",      type: "size",    description: "TanStack core ~9kb gz, RHF ~9kb gz — wash." },
            { name: "Schema validators",type: "feature", description: "TanStack supports zod, valibot, yup, arktype natively." },
            { name: "Async validation", type: "feature", description: "TanStack: first-class debounce + async per-field. RHF needs handcoding." },
            { name: "DX defaults",      type: "feature", description: "Dash defaults to RHF — pick TanStack only when you need the perf." },
          ]}
        />
      </DocsSection>

      <DocsSection title="Install">
        <DocsCode
          language="bash"
          code={`pnpm dlx dash add field input label hint
pnpm add @tanstack/react-form zod`}
        />
      </DocsSection>

      <DocsSection title="Setup">
        <DocsCode
          language="tsx"
          code={`"use client"

import { useForm } from "@tanstack/react-form"
import { z } from "zod"
import { Button } from "@/registry/dash/ui/button"
import { Field, FieldLabel, FieldHint } from "@/registry/dash/ui/field"
import { Input } from "@/registry/dash/ui/input"

export function DispatchRuleBuilder() {
  const form = useForm({
    defaultValues: {
      tribe: "Reservasi",
      minDispatch: 3,
      windowDays: 1,
    },
    validators: {
      onChange: z.object({
        tribe:       z.enum(["Reservasi", "Express", "Eats"]),
        minDispatch: z.number().min(1).max(50),
        windowDays:  z.number().min(1).max(30),
      }),
    },
    onSubmit: async ({ value }) => {
      console.log("rule", value)
    },
  })

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        form.handleSubmit()
      }}
      className="space-y-4"
    >
      <form.Field name="minDispatch">
        {(field) => (
          <Field>
            <FieldLabel htmlFor={field.name}>Min dispatch / hari</FieldLabel>
            <Input
              id={field.name}
              type="number"
              value={field.state.value}
              onChange={(e) => field.handleChange(Number(e.target.value))}
            />
            {field.state.meta.errors.length > 0 && (
              <FieldHint state="error">{String(field.state.meta.errors[0])}</FieldHint>
            )}
          </Field>
        )}
      </form.Field>

      <form.Subscribe selector={(s) => s.canSubmit}>
        {(canSubmit) => (
          <Button type="submit" disabled={!canSubmit}>
            Save rule
          </Button>
        )}
      </form.Subscribe>
    </form>
  )
}`}
        />
      </DocsSection>

      <DocsSection
        title="Integration with Dash primitives"
        description="Use Field / Input / Hint as render slots. TanStack hands you state + meta — wire them by hand."
      >
        <ul className="text-sm text-text-sub-600 list-disc pl-5 space-y-1">
          <li><code className="text-xs">field.state.value</code> → <code className="text-xs">Input value</code></li>
          <li><code className="text-xs">field.handleChange</code> → <code className="text-xs">Input onChange</code></li>
          <li><code className="text-xs">field.state.meta.errors</code> → <code className="text-xs">FieldHint state=&quot;error&quot;</code></li>
          <li><code className="text-xs">field.state.meta.isValidating</code> → <code className="text-xs">Input loading prop</code></li>
        </ul>
      </DocsSection>

      <DocsSection title="Limitations vs RHF">
        <ul className="text-sm text-text-sub-600 list-disc pl-5 space-y-1">
          <li><strong className="text-text-strong-950">More verbose</strong> — no implicit <code className="text-xs">register()</code>, each field needs an explicit render prop.</li>
          <li><strong className="text-text-strong-950">No official adapter</strong> for Dash <code className="text-xs">FormField</code> wrapper yet. Roadmap Day 16+.</li>
          <li><strong className="text-text-strong-950">Smaller ecosystem</strong> — fewer Stack Overflow answers, smaller plugin surface than RHF.</li>
          <li><strong className="text-text-strong-950">Newer API</strong> — v1.0.0 only shipped late 2025, so expect minor breaking changes in patch releases until v1.5.</li>
        </ul>
        <p className="text-sm text-text-sub-600 mt-3">
          Default to{" "}
          <Link className="text-(--dash-purple-600) underline-offset-4 hover:underline" href="/docs/forms/react-hook-form">
            React Hook Form
          </Link>
          . Reach for TanStack only when RHF&apos;s re-render volume becomes measurably painful.
        </p>
      </DocsSection>
    </DocsPageShell>
  )
}
