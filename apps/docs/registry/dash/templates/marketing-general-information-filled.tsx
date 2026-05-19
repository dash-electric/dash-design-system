"use client"

import * as React from "react"
import { InputRoot, Input } from "@/registry/dash/ui/input"
import { Textarea } from "@/registry/dash/ui/textarea"
import { Label } from "@/registry/dash/ui/label"
import { Field, FieldGroup, FieldDescription } from "@/registry/dash/ui/field"
import { MarketingAddProductShell } from "@/registry/dash/templates/_internal/marketing-add-product-shell"

export type MarketingGeneralInformationFilledProps = { className?: string }

/**
 * MarketingGeneralInformationFilled — Add Product wizard, Step 1/5 with
 * fields populated. Ported from AlignUI Pro Figma node `164914:73774`.
 */
export function MarketingGeneralInformationFilled({ className }: MarketingGeneralInformationFilledProps) {
  return (
    <MarketingAddProductShell
      currentStepIndex={0}
      preview={{
        category: "Technology",
        name: "Apple Watch S5 GPS 40MM",
        price: "$0.00",
        stockLabel: "0 out of 0 units",
        stockStatus: "warning",
        imageHue: 280,
        sku: "SKU: 000-00-0000",
      }}
      className={className}
    >
      <div>
        <h2 className="text-lg font-semibold tracking-tight text-text-strong-950">
          Add product details
        </h2>
        <p className="text-sm text-text-sub-600 mt-0.5">
          Boost sales with detailed product information.
        </p>
      </div>

      <FieldGroup>
        <Field>
          <Label htmlFor="prod-name">Product name</Label>
          <InputRoot>
            <Input id="prod-name" defaultValue="Apple Watch S5 GPS 40MM" />
          </InputRoot>
        </Field>
        <Field>
          <Label htmlFor="prod-cat">Category</Label>
          <InputRoot>
            <Input id="prod-cat" defaultValue="Technology" />
          </InputRoot>
          <FieldDescription>Choose the closest match.</FieldDescription>
        </Field>
        <Field>
          <Label htmlFor="prod-desc">Description</Label>
          <Textarea
            id="prod-desc"
            defaultValue="Apple Watch Series 5 GPS brings smart features and elegant design for daily convenience."
            rows={5}
          />
        </Field>
      </FieldGroup>
    </MarketingAddProductShell>
  )
}
