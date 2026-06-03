"use client"

import * as React from "react"
import { DiscountLineItem } from "@/registry/dash/ui/discount-line-item"
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
 * DiscountLineItem — Ported from Dash Next Portal v2 (2026-05-19).
 * Source: components/price-display/DiscountLineItem.tsx
 *
 * Single row in a payment-breakdown table: "Discount (20%) -Rp12,500". Renders
 * nothing when there's no discount, so callers can drop it in unconditionally.
 * Pairs with PriceWithDiscount (the visual price-pair) for the total row.
 */

export default function DiscountLineItemDocsPage() {
  return (
    <DocsPageShell>
      <DocsHeader
        category="Components / Commerce"
        title="Discount Line Item"
        description="One row in a payment-breakdown table that explains a discount. Renders nothing when discountAmount is 0 — drop it in unconditionally. Pairs with PriceWithDiscount."
        status="beta"
        kind="composite"
      />

      <DocsSection title="Install">
        <DocsCode language="bash" code={`dashkit add discount-line-item`} />
      </DocsSection>

      <DocsSection title="Usage">
        <DocsCode
          language="tsx"
          code={`<DiscountLineItem amount={50000} discountAmount={12500} />
{/* Renders: "Discount (25%)  -Rp12,500" */}

<DiscountLineItem amount={50000} discountAmount={0} />
{/* Renders nothing */}`}
        />
      </DocsSection>

      <DocsSection title="Live: in a breakdown">
        <DocsExample
          title="Payment summary"
          preview={
            <div className="flex w-full max-w-md flex-col gap-2 rounded-xl border border-stroke-soft-200 bg-bg-white-0 p-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-text-sub-600">Subtotal</p>
                <p className="text-sm font-medium text-text-strong-950">Rp50,000</p>
              </div>
              <DiscountLineItem amount={50000} discountAmount={12500} />
              <div className="flex items-center justify-between">
                <p className="text-sm text-text-sub-600">Service fee</p>
                <p className="text-sm font-medium text-text-strong-950">Rp2,500</p>
              </div>
              <div className="my-2 h-px bg-stroke-soft-200" />
              <div className="flex items-center justify-between">
                <p className="text-base font-semibold text-text-strong-950">Total</p>
                <p className="text-base font-semibold text-text-strong-950">Rp40,000</p>
              </div>
            </div>
          }
          code={`<DiscountLineItem amount={subtotal} discountAmount={discount} />`}
        />
      </DocsSection>

      <DocsSection title="Do this, not that">
        <p className="text-base text-text-sub-600 leading-relaxed max-w-2xl">
          DiscountLineItem = satu baris dalam breakdown harga. Pakai untuk diskon kuantitatif (promo, coupon). Jangan duplikat info — kalau breakdown sudah show diskon, hilangkan teks "Hemat Rp X" terpisah.
        </p>
        <DocsDoDont
          do={{
            preview: (
              <div className="flex w-full max-w-xs flex-col gap-1 rounded-xl border border-stroke-soft-200 bg-bg-white-0 p-3 text-xs">
                <div className="flex items-center justify-between">
                  <p className="text-text-sub-600">Subtotal DLV-7821</p>
                  <p className="font-medium text-text-strong-950">Rp50.000</p>
                </div>
                <DiscountLineItem amount={50000} discountAmount={12500} label="Promo DASH42" />
                <div className="my-1 h-px bg-stroke-soft-200" />
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-text-strong-950">Total</p>
                  <p className="font-semibold text-text-strong-950">Rp37.500</p>
                </div>
              </div>
            ),
            caption: "Diskon promo dengan label kode kupon ('Promo DASH42'). User tahu kenapa harga turun + persentase auto-calc. Renders nothing kalau discount=0.",
          }}
          dont={{
            preview: (
              <div className="flex w-full max-w-xs flex-col gap-1 rounded-xl border border-stroke-soft-200 bg-bg-white-0 p-3 text-xs">
                <div className="flex items-center justify-between">
                  <p className="text-text-sub-600">Subtotal</p>
                  <p className="font-medium text-text-strong-950">Rp50.000</p>
                </div>
                <DiscountLineItem amount={50000} discountAmount={12500} />
                <p className="text-success-base font-medium">Hemat Rp12.500!</p>
                <p className="text-success-base font-medium">Anda dapat diskon 25%!</p>
              </div>
            ),
            caption: "Info diskon duplikat 3 kali (line item + 'Hemat' + 'Diskon 25%'). User dianggap tidak bisa baca — noise tinggi, trust turun.",
          }}
        />
        <DocsDoDont
          do={{
            preview: (
              <DiscountLineItem amount={50000} discountAmount={0} label="Promo" />
            ),
            caption: "discountAmount=0 → component otomatis render nothing. Drop in unconditionally, tidak perlu ternary di parent.",
          }}
          dont={{
            preview: (
              <div className="flex w-full max-w-xs items-center justify-between gap-2 text-xs">
                <p className="text-text-sub-600">Promo</p>
                <p className="text-text-soft-400">-Rp0 (0%)</p>
              </div>
            ),
            caption: "Render baris diskon Rp0 (0%) = noise. Sembunyikan kalau tidak ada diskon — biarkan DiscountLineItem handle null branch.",
          }}
        />
      </DocsSection>

      <DocsSection title="API">
        <DocsPropsTable
          rows={[
            { name: "amount", type: "number", description: "Subtotal — denominator for percentage display." },
            { name: "discountAmount", type: "number", description: "Discount value. 0 / negative = renders nothing." },
            { name: "label", type: "ReactNode", defaultValue: '"Discount"', description: "Override the row label (e.g. localised, 'Coupon', 'Promo')." },
            { name: "format", type: "(n: number) => string", defaultValue: "Rp + id-ID", description: "Override the currency formatter." },
          ]}
        />
      </DocsSection>

      <DocsSection title="Edge cases">
        <ul className="list-disc pl-6 space-y-1 text-sm text-text-sub-600">
          <li>discountAmount = 0 → returns null. No conditional needed at the call-site.</li>
          <li>amount = 0 → percentage hidden (avoids division by zero).</li>
          <li>discountAmount &gt; amount → percentage rounds to {">100%"} — usually a server bug. Validate upstream.</li>
        </ul>
      </DocsSection>
    </DocsPageShell>
  )
}
