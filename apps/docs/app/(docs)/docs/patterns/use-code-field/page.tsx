"use client"

import * as React from "react"
import {
  DocsPageShell,
  DocsHeader,
  DocsSection,
} from "@/components/docs/page-shell"
import { DocsCode } from "@/components/docs/code-block"
import { UseCodeField } from "@/registry/dash/patterns/use-code-field"

function DemoForm() {
  // UseCodeField is self-contained — owns its value + validation via the
  // useCodeField() hook internally. No outer form state needed for the demo.
  return (
    <form className="max-w-sm" onSubmit={(e) => e.preventDefault()}>
      <UseCodeField />
    </form>
  )
}

export default function UseCodeFieldPatternPage() {
  return (
    <DocsPageShell>
      <DocsHeader
        category="Patterns"
        title="Use Code Field"
        description="6-digit alphanumeric one-time code per delivery. Auto-generate, regenerate, copy-to-clipboard, RHF-wired. Single canonical shape so refactors don't reinvent it."
        status="new"
      />

      <DocsSection title="Install">
        <DocsCode language="bash" code={`dash add use-code-field`} />
      </DocsSection>

      <DocsSection
        title="When to use"
        description="Whenever a Dash flow needs a 6-character code to hand to a mitra at pickup."
      >
        <ul className="list-disc pl-6 space-y-1 text-sm text-text-sub-600">
          <li>Delivery creation (Dash Express, Bulk) — one code per delivery</li>
          <li>Halo-dash voucher redemption</li>
          <li>Any frontend-generated code validated server-side at dispatch</li>
        </ul>
      </DocsSection>

      <DocsSection
        title="Live preview"
        description="Auto-filled on mount. Regenerate to roll a new code. Copy puts it on the clipboard with a toast confirmation."
      >
        <div className="rounded-xl border border-stroke-soft-200 bg-bg-weak-50 p-6">
          <DemoForm />
        </div>
      </DocsSection>

      <DocsSection
        title="Anatomy"
        description="Single-file pattern — generator and field live together so AI agents don't invent new generators."
      >
        <ol className="list-decimal pl-6 space-y-2 text-sm text-text-sub-600">
          <li>
            <strong className="text-text-strong-950">Charset</strong> — 31 chars, uppercase, ambiguous{" "}
            <code className="text-xs px-1 py-0.5 rounded bg-bg-weak-50">0 / O / 1 / I / L</code>{" "}
            excluded. Mitra reading the code aloud can&apos;t confuse them.
          </li>
          <li>
            <strong className="text-text-strong-950">genUseCode()</strong> — Uses{" "}
            <code className="text-xs px-1 py-0.5 rounded bg-bg-weak-50">crypto.getRandomValues</code> to avoid
            duplicate codes across tabs / SSR contexts.
          </li>
          <li>
            <strong className="text-text-strong-950">USE_CODE_REGEX</strong> — Exported. Use in your zod schema:{" "}
            <code className="text-xs px-1 py-0.5 rounded bg-bg-weak-50">z.string().regex(USE_CODE_REGEX)</code>.
          </li>
          <li>
            <strong className="text-text-strong-950">name prop</strong> — Default{" "}
            <code className="text-xs px-1 py-0.5 rounded bg-bg-weak-50">&quot;useCode&quot;</code>. Override
            when nested in an array, e.g.{" "}
            <code className="text-xs px-1 py-0.5 rounded bg-bg-weak-50">items.0.useCode</code>.
          </li>
        </ol>
      </DocsSection>

      <DocsSection
        title="Refactor example — 'one use-code per order'"
        description="The single-use-code → per-row-use-code shift, applied to the multi-order delivery refactor."
      >
        <DocsCode
          language="tsx"
          code={`// Before — single shared code at form root
<UseCodeField />

// After — per-row code inside useFieldArray
{fields.map((field, index) => (
  <div key={field.id}>
    {/* ...row inputs */}
    <UseCodeField name={\`items.\${index}.useCode\`} />
  </div>
))}`}
        />
      </DocsSection>

      <DocsSection title="Pair with">
        <ul className="list-disc pl-6 space-y-1 text-sm text-text-sub-600">
          <li>
            <code className="text-xs px-1 py-0.5 rounded bg-bg-weak-50">@dash/multi-item-form</code> — for per-row codes
          </li>
          <li>
            <code className="text-xs px-1 py-0.5 rounded bg-bg-weak-50">@dash/toaster</code> — required at app root for the copy confirmation
          </li>
        </ul>
      </DocsSection>
    </DocsPageShell>
  )
}
