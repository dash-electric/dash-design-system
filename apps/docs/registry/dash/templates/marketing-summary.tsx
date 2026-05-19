"use client"

import * as React from "react"
import { RiCheckLine as Check } from "@remixicon/react"
import { Divider } from "@/registry/dash/ui/divider"
import { MarketingAddProductShell } from "@/registry/dash/templates/_internal/marketing-add-product-shell"

export type MarketingSummaryProps = { className?: string }

/**
 * MarketingSummary — Add Product wizard, Step 5/5 summary screen.
 * Ported from AlignUI Pro Figma node `164926:19943`.
 */
export function MarketingSummary({ className }: MarketingSummaryProps) {
  return (
    <MarketingAddProductShell
      currentStepIndex={4}
      primaryCta="Complete"
      preview={{
        category: "Technology",
        name: "Apple Watch S5 GPS 40MM",
        price: "$478.80",
        stockLabel: "200 out of 400 units",
        stockStatus: "success",
        imageHue: 280,
        sku: "SKU: MWVE2LL/A",
      }}
      className={className}
    >
      <div>
        <h2 className="text-lg font-semibold tracking-tight text-text-strong-950">Summary</h2>
        <p className="text-sm text-text-sub-600 mt-0.5">
          Quick overview of product details and inventory.
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <div className="text-xs uppercase tracking-wider text-text-soft-400">Name</div>
          <div className="text-base font-medium text-text-strong-950 mt-1">
            Apple Watch S5 GPS 40MM
          </div>
        </div>

        <div>
          <div className="text-xs uppercase tracking-wider text-text-soft-400">Description</div>
          <div className="text-sm text-text-strong-950 mt-1 leading-relaxed">
            Apple Watch Series 5 GPS brings smart features and elegant design for daily convenience.
          </div>
        </div>

        <Divider />

        <div className="grid grid-cols-3 gap-4">
          <div>
            <div className="text-xs uppercase tracking-wider text-text-soft-400">Category</div>
            <div className="text-base font-medium text-text-strong-950 mt-1">Technology</div>
          </div>
          <div>
            <div className="text-xs uppercase tracking-wider text-text-soft-400">Price</div>
            <div className="text-base font-semibold text-text-strong-950 mt-1">$478.80</div>
          </div>
          <div>
            <div className="text-xs uppercase tracking-wider text-text-soft-400">Stock</div>
            <div className="text-base font-medium text-text-strong-950 mt-1">200 units</div>
          </div>
        </div>

        <Divider />

        <div>
          <div className="text-xs uppercase tracking-wider text-text-soft-400 mb-2">Product Images</div>
          <div className="grid grid-cols-4 gap-2">
            {[280, 200, 140, 30].map((hue) => (
              <div
                key={hue}
                className="aspect-square rounded-lg"
                style={{
                  background: `linear-gradient(135deg, hsl(${hue} 80% 60%), hsl(${hue + 30} 70% 75%))`,
                }}
              />
            ))}
          </div>
        </div>

        <Divider />

        <div className="flex items-center gap-2 text-sm text-text-sub-600">
          <Check className="size-4 text-(--dash-green-600)" />
          All required fields are complete.
        </div>
      </div>
    </MarketingAddProductShell>
  )
}
