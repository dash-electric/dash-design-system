"use client"

import { FinanceCards } from "@/registry/dash/templates/finance-cards"
import {
  DocsPageShell,
  DocsHeader,
  DocsSection,
  DocsExample,
  DocsPropsTable,
} from "@/components/docs/page-shell"
import { DocsTemplatePreview } from "@/components/docs/template-preview"
import { DocsCode } from "@/components/docs/code-block"

export default function FinanceCardsDocsPage() {
  return (
    <DocsPageShell>
      <DocsHeader
        category="Templates / Finance & Banking"
        title="My Cards"
        description="Cards-grid page ported from AlignUI Pro Figma frame 'My Cards [Finance & Banking]'. SegmentedControl filter (All/Virtual/Physical) + search/sort row + 3-up responsive card grid with gradient previews."
      />

      <DocsSection title="Install">
        <DocsCode language="bash" code={`dash add finance-cards`} />
      </DocsSection>

      <DocsSection
        title="Examples"
        description="Defaults render 3 cards (2 virtual + 1 physical) mirroring the Figma demo."
      >
        <DocsExample
          bare
          title="Apex — default"
          preview={
            <DocsTemplatePreview padding="p-6">
              <FinanceCards />
            </DocsTemplatePreview>
          }
          code={`<FinanceCards />`}
        />
      </DocsSection>

      <DocsSection title="Composition">
        <ul className="text-sm text-text-sub-600 space-y-1.5 list-disc pl-6">
          <li>Page header with title + subtitle + period select + Schedule / Add Card CTAs.</li>
          <li>Filter row — <code>SegmentedControl</code> (All/Virtual/Physical) + search <code>Input</code> + Filter + Sort by buttons.</li>
          <li>Card grid — each tile = gradient preview (purple for active virtual, neutral for expired, dark for physical) + status <code>Badge</code> + masked number / expiry / CVC footer.</li>
        </ul>
      </DocsSection>

      <DocsSection title="API">
        <DocsPropsTable
          rows={[
            { name: "title", type: "string", defaultValue: '"My Cards"', description: "Page title." },
            { name: "subtitle", type: "string", description: "Subtitle below the title." },
            { name: "cards", type: "FinanceCardItem[]", description: "Card list. Each card = { id, kind, label, status, balance, cardNumberLast4, expiry, cardholderName? }." },
          ]}
        />
      </DocsSection>
    </DocsPageShell>
  )
}
