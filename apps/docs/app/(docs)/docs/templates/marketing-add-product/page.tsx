"use client"

import { MarketingAddProduct } from "@/registry/dash/templates/marketing-add-product"
import {
  DocsPageShell,
  DocsHeader,
  DocsSection,
  DocsExample,
  DocsPropsTable,
} from "@/components/docs/page-shell"
import { DocsTemplatePreview } from "@/components/docs/template-preview"
import { DocsCode } from "@/components/docs/code-block"

export default function MarketingAddProductDocsPage() {
  return (
    <DocsPageShell>
      <DocsHeader
        category="Templates / Marketing"
        title="Marketing Add Product"
        description="Multi-step 'Add Product' shell with a vertical step rail on the left and a swappable form/empty-state column on the right. Drives the 5-step product creation flow (General → Pricing → Image → Stock → Summary)."
      />

      <DocsSection title="Install">
        <DocsCode language="bash" code={`dash add marketing-add-product`} />
      </DocsSection>

      <DocsSection title="Examples">
        <DocsExample
          bare
          title="Default 5-step flow"
          description="Empty-state right column with step 1 active. Pass `emptyState={false}` to render the partial form."
          preview={
            <DocsTemplatePreview>
              <MarketingAddProduct />
            </DocsTemplatePreview>
          }
          code={`<MarketingAddProduct
  steps={[/* AddProductStep[] */]}
  currentStepIndex={0}
  emptyState
/>`}
        />
      </DocsSection>

      <DocsSection
        title="Composition"
        description="Composes the marketing dashboard shell + step rail + form column."
      >
        <ul className="text-sm text-text-sub-600 space-y-1.5 list-disc pl-6">
          <li><strong>Left rail</strong> — vertical <code>StepIndicator</code> walk-through with step label + description.</li>
          <li><strong>Right column</strong> — empty state or partial form (variant per step).</li>
          <li><strong>Footer</strong> — Cancel + Save Draft + Next primary action.</li>
        </ul>
      </DocsSection>

      <DocsSection title="API">
        <DocsPropsTable
          rows={[
            { name: "steps", type: "AddProductStep[]", description: "{ id, label, description }. Defaults to the 5-step Marketing flow." },
            { name: "currentStepIndex", type: "number", defaultValue: "0", description: "Active step (0-based)." },
            { name: "emptyState", type: "boolean", defaultValue: "true", description: "When true, right column renders an empty state instead of the partial form." },
            { name: "className", type: "string", description: "Outer wrapper class." },
          ]}
        />
      </DocsSection>
    </DocsPageShell>
  )
}
