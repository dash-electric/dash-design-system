"use client"

import * as React from "react"
import {
  DocsPageShell,
  DocsHeader,
  DocsSection,
} from "@/components/docs/page-shell"
import { DocsCode } from "@/components/docs/code-block"
import { MultiItemForm } from "@/registry/dash/patterns/multi-item-form"

export default function MultiItemFormPatternPage() {
  return (
    <DocsPageShell>
      <DocsHeader
        category="Patterns"
        title="Multi-Item Form"
        description="Canonical react-hook-form useFieldArray + per-row card + batch submit. The anchor pattern for refactors like 'single-order delivery → multi-order delivery'."
        status="new"
      />

      <DocsSection title="Install">
        <DocsCode language="bash" code={`dash add multi-item-form`} />
      </DocsSection>

      <DocsSection
        title="When to use"
        description="Reach for this pattern whenever a form needs N variable rows of the same shape with per-row validation and a single batch submit."
      >
        <ul className="list-disc pl-5 space-y-1 text-sm text-text-sub-600">
          <li>Multi-order delivery creation (Dash Express, Bulk)</li>
          <li>Bulk mitra invitation form</li>
          <li>Bulk outlet onboarding</li>
          <li>Anywhere a designer says &quot;add another&quot; or &quot;repeat&quot;</li>
        </ul>
      </DocsSection>

      <DocsSection
        title="Live preview"
        description="One blank row is seeded so the affordance is obvious from first paint. Removing the last row is disabled — schema requires min(1)."
      >
        <div className="rounded-xl border border-stroke-soft-200 bg-bg-weak-50 p-6">
          <MultiItemForm />
        </div>
      </DocsSection>

      <DocsSection
        title="Anatomy"
        description="Three concerns live in one file so refactor prompts don't drift."
      >
        <ol className="list-decimal pl-5 space-y-2 text-sm text-text-sub-600">
          <li>
            <strong className="text-text-strong-950">Zod schema</strong> —{" "}
            <code className="text-xs px-1 py-0.5 rounded bg-bg-weak-50">items: z.array(itemSchema).min(1)</code>.
            One row minimum is enforced at the schema layer; the submit button doesn&apos;t babysit it.
          </li>
          <li>
            <strong className="text-text-strong-950">useFieldArray</strong> — owns add/remove + per-row dirty state. Never mix with{" "}
            <code className="text-xs px-1 py-0.5 rounded bg-bg-weak-50">useState&lt;Item[]&gt;</code> — it breaks FormMessage rendering.
          </li>
          <li>
            <strong className="text-text-strong-950">Row component</strong> — uses{" "}
            <code className="text-xs px-1 py-0.5 rounded bg-bg-weak-50">Card</code> +{" "}
            <code className="text-xs px-1 py-0.5 rounded bg-bg-weak-50">FormField</code> with{" "}
            <code className="text-xs px-1 py-0.5 rounded bg-bg-weak-50">items.${"{"}index{"}"}.fieldName</code>{" "}
            naming for nested validation.
          </li>
        </ol>
      </DocsSection>

      <DocsSection
        title="Refactor example — 'update delivery creation jadi multi-order'"
        description="This is the case the pattern is anchored against. The before / after diff teaches the AI agent what shape to converge on."
      >
        <div className="space-y-4 text-sm text-text-sub-600">
          <div>
            <p className="font-medium text-text-strong-950 mb-2">Before — single-order form</p>
            <DocsCode
              language="tsx"
              code={`const schema = z.object({
  pickupAddress: z.string().min(3),
  dropoffAddress: z.string().min(3),
  useCode: z.string().regex(USE_CODE_REGEX),
})

const form = useForm({ resolver: zodResolver(schema) })`}
            />
          </div>
          <div>
            <p className="font-medium text-text-strong-950 mb-2">After — multi-order via this pattern</p>
            <DocsCode
              language="tsx"
              code={`const itemSchema = z.object({
  pickupAddress: z.string().min(3),
  dropoffAddress: z.string().min(3),
  useCode: z.string().regex(USE_CODE_REGEX),
})
const schema = z.object({ items: z.array(itemSchema).min(1) })

const form = useForm({
  resolver: zodResolver(schema),
  defaultValues: { items: [blankItem()] },
})
const { fields, append, remove } = useFieldArray({
  control: form.control,
  name: "items",
})`}
            />
          </div>
          <p>
            The schema name (<code className="text-xs px-1 py-0.5 rounded bg-bg-weak-50">items</code>),
            the array key, and the field-path prefix (
            <code className="text-xs px-1 py-0.5 rounded bg-bg-weak-50">items.0.useCode</code>) all
            line up. Misalignment is the #1 source of useFieldArray bugs.
          </p>
        </div>
      </DocsSection>

      <DocsSection title="Pair with">
        <ul className="list-disc pl-5 space-y-1 text-sm text-text-sub-600">
          <li>
            <code className="text-xs px-1 py-0.5 rounded bg-bg-weak-50">@dash/use-code-field</code> — per-row 6-digit code
          </li>
          <li>
            <code className="text-xs px-1 py-0.5 rounded bg-bg-weak-50">@dash/bulk-submit</code> — for dispatching the collected rows
          </li>
        </ul>
      </DocsSection>
    </DocsPageShell>
  )
}
