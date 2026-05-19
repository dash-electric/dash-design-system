"use client"

import * as React from "react"
import { RiUploadLine as Upload, RiCloseLine as X } from "@remixicon/react"
import { Button } from "@/registry/dash/ui/button"
import { InputRoot, Input } from "@/registry/dash/ui/input"
import { Label } from "@/registry/dash/ui/label"
import { Field, FieldGroup, FieldDescription } from "@/registry/dash/ui/field"
import { Slider } from "@/registry/dash/ui/slider"
import { cn } from "@/registry/dash/lib/utils"
import { MarketingAddProductShell } from "@/registry/dash/templates/_internal/marketing-add-product-shell"

export type MarketingAddProductImageStockProps = {
  /** "image-empty" | "image-filled" | "stock-empty" | "stock-filled" */
  variant?: "image-empty" | "image-filled" | "stock-empty" | "stock-filled"
  className?: string
}

/**
 * MarketingAddProductImageStock — collapses 4 Figma variants:
 *  - Add Product Image Empty (`164914:73985`)
 *  - Add Product Image Filled (`164914:77524`)
 *  - Stock Status Empty (`164914:74884`)
 *  - Stock Status Filled (`164914:77684`)
 *
 * Steps 3/5 and 4/5 of the Add Product wizard. Hold-list flag: these were
 * collapsed into a single template because empty/filled pairs duplicate the
 * shell + form structure and only differ in input state.
 */
export function MarketingAddProductImageStock({
  variant = "image-empty",
  className,
}: MarketingAddProductImageStockProps) {
  const isImage = variant.startsWith("image-")
  const isFilled = variant.endsWith("-filled")
  const stepIndex = isImage ? 2 : 3

  return (
    <MarketingAddProductShell
      currentStepIndex={stepIndex as 2 | 3}
      preview={{
        category: "Technology",
        name: "Apple Watch S5 GPS 40MM",
        price: "$478.80",
        stockLabel: isFilled && !isImage ? "200 out of 400 units" : "0 out of 0 units",
        stockStatus: isFilled && !isImage ? "success" : "warning",
        imageHue: 280,
        sku: "SKU: MWVE2LL/A",
      }}
      className={className}
    >
      {isImage ? <ImageStep filled={isFilled} /> : <StockStep filled={isFilled} />}
    </MarketingAddProductShell>
  )
}

function ImageStep({ filled }: { filled: boolean }) {
  return (
    <>
      <div>
        <h2 className="text-lg font-semibold tracking-tight text-text-strong-950">
          Add product images
        </h2>
        <p className="text-sm text-text-sub-600 mt-0.5">
          Showcase products with quality visuals.
        </p>
      </div>

      <div
        className={cn(
          "border-2 border-dashed rounded-xl p-8 text-center",
          filled ? "border-(--dash-purple-300) bg-(--dash-purple-50)/40" : "border-stroke-soft-200 bg-bg-weak-50/40",
        )}
      >
        <Upload className="size-8 mx-auto text-text-soft-400" aria-hidden />
        <div className="mt-3 text-sm font-medium text-text-strong-950">
          Choose a file or drag &amp; drop it here.
        </div>
        <div className="text-xs text-text-sub-600 mt-1">
          JPEG, PNG, PDF, and MP4 formats, up to 50 MB.
        </div>
        <Button tone="neutral" style="stroke" size="sm" className="mt-4">
          Browse files
        </Button>
      </div>

      {filled ? (
        <div className="grid grid-cols-3 gap-3">
          {[280, 200, 140].map((hue, i) => (
            <div key={hue} className="relative aspect-square rounded-lg overflow-hidden">
              <div
                className="absolute inset-0"
                style={{
                  background: `linear-gradient(135deg, hsl(${hue} 80% 60%), hsl(${hue + 30} 70% 75%))`,
                }}
              />
              <button
                aria-label={`Remove image ${i + 1}`}
                className="absolute top-1.5 right-1.5 size-5 rounded-full bg-bg-white-0/90 backdrop-blur flex items-center justify-center text-text-sub-600 hover:text-text-strong-950"
              >
                <X className="size-3" />
              </button>
            </div>
          ))}
        </div>
      ) : null}
    </>
  )
}

function StockStep({ filled }: { filled: boolean }) {
  const [stock, setStock] = React.useState(filled ? 200 : 0)
  return (
    <>
      <div>
        <h2 className="text-lg font-semibold tracking-tight text-text-strong-950">
          Add stock status
        </h2>
        <p className="text-sm text-text-sub-600 mt-0.5">
          Highlight stock status with dynamic indicators.
        </p>
      </div>

      <FieldGroup>
        <Field>
          <Label htmlFor="stock-label">Set Custom Stock Status</Label>
          <InputRoot>
            <Input
              id="stock-label"
              value={String(stock)}
              onChange={(e) => setStock(Number(e.target.value) || 0)}
              type="number"
            />
          </InputRoot>
          <FieldDescription>Set the available units in inventory.</FieldDescription>
        </Field>

        <Field>
          <Label>Stock slider</Label>
          <Slider
            value={[stock]}
            min={0}
            max={400}
            step={10}
            onValueChange={(v) => setStock(v[0])}
          />
          <div className="flex justify-between text-xs text-text-soft-400">
            <span>0</span>
            <span>200</span>
            <span>400</span>
          </div>
        </Field>
      </FieldGroup>
    </>
  )
}
