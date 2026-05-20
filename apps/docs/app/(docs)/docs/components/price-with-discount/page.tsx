"use client"

import * as React from "react"
import { PriceWithDiscount } from "@/registry/dash/ui/price-with-discount"
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
 * PriceWithDiscount — Ported from Dash Next Portal v2 (2026-05-19).
 * Source: components/price-display/PriceWithDiscount.tsx
 *
 * Visual price pair: original (struck-through) + final, or just final when no
 * discount. Three sizes for review-modal totals (xl), inline summaries (lg),
 * per-option lists (md). Discount provenance (the "why") lives in the separate
 * DiscountLineItem — this primitive is purely the price-pair visual.
 */

export default function PriceWithDiscountDocsPage() {
  return (
    <DocsPageShell>
      <DocsHeader
        category="Components / Commerce"
        title="Price With Discount"
        description="Visual price-pair: original struck-through + final. Three sizes for review-modal totals, inline summaries, and per-option lists. The 'why' (percentage, code) belongs to DiscountLineItem — this is the visual only."
        status="beta"
        kind="composite"
      />

      <DocsSection title="Install">
        <DocsCode language="bash" code={`dash add price-with-discount`} />
      </DocsSection>

      <DocsSection title="Usage">
        <DocsCode
          language="tsx"
          code={`<PriceWithDiscount amount={50000} discountAmount={12500} finalAmount={37500} />
<PriceWithDiscount amount={50000} discountAmount={0} finalAmount={50000} />`}
        />
      </DocsSection>

      <DocsSection title="Live: with / without discount">
        <DocsExample
          title="Modes"
          preview={
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <span className="w-32 text-xs uppercase tracking-wider text-text-soft-400">with discount</span>
                <PriceWithDiscount amount={50000} discountAmount={12500} finalAmount={37500} />
              </div>
              <div className="flex items-center gap-3">
                <span className="w-32 text-xs uppercase tracking-wider text-text-soft-400">no discount</span>
                <PriceWithDiscount amount={50000} discountAmount={0} finalAmount={50000} />
              </div>
              <div className="flex items-center gap-3">
                <span className="w-32 text-xs uppercase tracking-wider text-text-soft-400">100% off</span>
                <PriceWithDiscount amount={50000} discountAmount={50000} finalAmount={0} />
              </div>
            </div>
          }
          code={`<PriceWithDiscount amount={50000} discountAmount={12500} finalAmount={37500} />
<PriceWithDiscount amount={50000} discountAmount={0}     finalAmount={50000} />
<PriceWithDiscount amount={50000} discountAmount={50000} finalAmount={0}     />`}
        />
      </DocsSection>

      <DocsSection title="Sizes">
        <DocsExample
          title="xl · lg · md"
          preview={
            <div className="flex flex-col gap-3">
              <PriceWithDiscount amount={50000} discountAmount={12500} finalAmount={37500} size="xl" />
              <PriceWithDiscount amount={50000} discountAmount={12500} finalAmount={37500} size="lg" />
              <PriceWithDiscount amount={50000} discountAmount={12500} finalAmount={37500} size="md" />
            </div>
          }
          code={`<PriceWithDiscount size="xl" ... />  // review-modal total
<PriceWithDiscount size="lg" ... />  // inline summary
<PriceWithDiscount size="md" ... />  // per-option list`}
        />
      </DocsSection>

      <DocsSection title="Do this, not that">
        <p className="text-base text-text-sub-600 leading-relaxed max-w-2xl">
          PriceWithDiscount = visual pair harga original vs final. Original strikethrough (smaller, soft color), final dominant. Untuk konteks 'kenapa diskon' pakai DiscountLineItem terpisah.
        </p>
        <DocsDoDont
          do={{
            preview: (
              <div className="rounded-lg border border-stroke-soft-200 bg-bg-white-0 p-3 max-w-xs">
                <div className="text-xs text-text-sub-600 mb-1">Total DLV-7821</div>
                <PriceWithDiscount amount={50000} discountAmount={12500} finalAmount={37500} size="lg" />
              </div>
            ),
            caption: "Original Rp 50rb strikethrough + final Rp 37.5rb prominent. Visual hierarchy jelas: harga yang dibayar = paling besar/tegas.",
          }}
          dont={{
            preview: (
              <div className="rounded-lg border border-stroke-soft-200 bg-bg-white-0 p-3 max-w-xs">
                <div className="text-xs text-text-sub-600 mb-1">Total</div>
                <div className="text-sm text-text-strong-950">Rp 37.500 (was Rp 50.000)</div>
              </div>
            ),
            caption: "Tanpa strikethrough + final prominence = sulit di-scan. User butuh microsecond untuk paham mana harga akhir.",
          }}
        />
        <DocsDoDont
          do={{
            preview: (
              <PriceWithDiscount amount={50000} discountAmount={0} finalAmount={50000} size="lg" />
            ),
            caption: "discountAmount=0 → render harga final saja, no strikethrough. Component handle no-discount case otomatis.",
          }}
          dont={{
            preview: (
              <div className="text-sm">
                <span className="line-through text-text-soft-400">Rp 50.000</span>
                <span className="ml-2 text-text-strong-950">Rp 50.000</span>
              </div>
            ),
            caption: "Strikethrough harga yang SAMA = misleading. User kira ada diskon padahal tidak. Hindari menampilkan strikethrough kalau diskon = 0.",
          }}
        />
      </DocsSection>

      <DocsSection title="API">
        <DocsPropsTable
          rows={[
            { name: "amount", type: "number", description: "Original price before discount." },
            { name: "discountAmount", type: "number", description: "How much was deducted. 0 = no discount mode." },
            { name: "finalAmount", type: "number", description: "Charged amount. May be 0 for 100% off." },
            { name: "format", type: "(n: number) => string", defaultValue: "Rp + id-ID", description: "Override the currency formatter." },
            { name: "size", type: '"xl" | "lg" | "md"', defaultValue: '"xl"', description: "Type scale." },
          ]}
        />
      </DocsSection>

      <DocsSection title="Pairing with DiscountLineItem">
        <p className="text-sm text-text-sub-600 max-w-2xl">
          For a full payment breakdown, render <code>DiscountLineItem</code> in the rows above this primitive — it provides the "Discount (20%)  -Rp12,500" row that explains the strike-through.
        </p>
      </DocsSection>
    </DocsPageShell>
  )
}
