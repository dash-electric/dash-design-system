"use client"

import * as React from "react"
import { InputRoot, Input, InputAffix } from "@/registry/dash/ui/input"
import { Label } from "@/registry/dash/ui/label"
import { Field, FieldGroup, FieldDescription } from "@/registry/dash/ui/field"
import { MarketingAddProductShell } from "@/registry/dash/templates/_internal/marketing-add-product-shell"

export type MarketingPricingDetailEmptyProps = { className?: string }

/**
 * MarketingPricingDetailEmpty — Add Product wizard, Step 2/5 empty state.
 * Ported from AlignUI Pro Figma node `164914:73264`.
 */
export function MarketingPricingDetailEmpty({ className }: MarketingPricingDetailEmptyProps) {
  return (
    <MarketingAddProductShell
      currentStepIndex={1}
      preview={{
        category: "Technology",
        name: "Apple Watch S5 GPS 40MM",
        price: "$0.00",
        stockLabel: "0 out of 0 units",
        stockStatus: "warning",
        imageHue: 280,
        sku: "SKU: MWVE2LL/A",
      }}
      className={className}
    >
      <div>
        <h2 className="text-lg font-semibold tracking-tight text-text-strong-950">
          Set product price
        </h2>
        <p className="text-sm text-text-sub-600 mt-0.5">
          Define strategic pricing for market success.
        </p>
      </div>

      <FieldGroup>
        <Field>
          <Label htmlFor="prod-price">Product pricing</Label>
          <InputRoot>
            <InputAffix>$</InputAffix>
            <Input id="prod-price" placeholder="0.00" />
          </InputRoot>
          <FieldDescription>
            Similar products in the market are priced $999–1499.
          </FieldDescription>
        </Field>
      </FieldGroup>
    </MarketingAddProductShell>
  )
}
