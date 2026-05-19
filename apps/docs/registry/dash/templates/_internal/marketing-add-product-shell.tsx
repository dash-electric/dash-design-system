"use client"

import * as React from "react"
import { RiArrowLeftLine as ArrowLeft, RiImageAddLine as ImagePlus, RiEditLine as Edit } from "@remixicon/react"
import { Card, CardContent } from "@/registry/dash/ui/card"
import { Button } from "@/registry/dash/ui/button"
import { Badge } from "@/registry/dash/ui/badge"
import { Avatar, AvatarFallback } from "@/registry/dash/ui/avatar"
import { StepIndicator, Step, type StepStatus } from "@/registry/dash/ui/step-indicator"
import { cn } from "@/registry/dash/lib/utils"

const defaultSteps = [
  { id: "general", label: "General Information", description: "Step 1/5" },
  { id: "pricing", label: "Pricing Details",     description: "Step 2/5" },
  { id: "image",   label: "Product Image",       description: "Step 3/5" },
  { id: "stock",   label: "Stock Status",        description: "Step 4/5" },
  { id: "summary", label: "Summary",             description: "Step 5/5" },
] as const

export type AddProductPreview = {
  category?: string
  name?: string
  price?: string
  stockLabel?: string
  stockStatus?: "warning" | "success" | "information"
  imageHue?: number
  imageUrl?: string
  sku?: string
}

export type MarketingAddProductShellProps = {
  currentStepIndex: 0 | 1 | 2 | 3 | 4
  preview?: AddProductPreview
  primaryCta?: string
  children: React.ReactNode
  className?: string
}

export function MarketingAddProductShell({
  currentStepIndex,
  preview = {},
  primaryCta = "Continue",
  children,
  className,
}: MarketingAddProductShellProps) {
  const statusFor = (i: number): StepStatus =>
    i < currentStepIndex ? "completed" : i === currentStepIndex ? "current" : "upcoming"

  const {
    category = "Technology",
    name = "Apple Watch S5 GPS 40MM",
    price = "$0.00",
    stockLabel = "0 out of 0 units",
    stockStatus = "warning",
    imageHue = 280,
    imageUrl,
    sku = "SKU: MWVE2LL/A",
  } = preview

  return (
    <div className={cn("min-h-screen bg-bg-weak-50 flex flex-col", className)}>
      {/* Topbar */}
      <header className="flex items-center justify-between gap-4 px-6 py-3 border-b border-stroke-soft-200 bg-bg-white-0">
        <Button tone="neutral" style="ghost" size="sm">
          <ArrowLeft className="size-4" /> Back to page
        </Button>
        <div className="text-sm text-text-sub-600">{sku}</div>
      </header>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-[260px_1fr_360px] gap-6 p-6">
        {/* Left: Stepper */}
        <aside>
          <StepIndicator orientation="vertical">
            {defaultSteps.map((s, i) => (
              <Step
                key={s.id}
                status={statusFor(i)}
                index={i + 1}
                label={s.label}
                description={s.description}
              />
            ))}
          </StepIndicator>
        </aside>

        {/* Center: step content */}
        <section className="space-y-4">
          <Card>
            <CardContent className="p-6 space-y-6">{children}</CardContent>
          </Card>

          <div className="flex justify-end gap-2">
            <Button tone="neutral" style="stroke">Cancel</Button>
            <Button tone="primary" style="filled">{primaryCta}</Button>
          </div>
        </section>

        {/* Right: Preview */}
        <aside>
          <Card className="sticky top-6">
            <CardContent className="p-5 space-y-4">
              <div>
                <h3 className="text-sm font-semibold text-text-strong-950">Preview</h3>
                <p className="text-xs text-text-sub-600">This is how your product will appear.</p>
              </div>

              <div
                className="aspect-square rounded-xl overflow-hidden flex items-center justify-center text-static-white/80"
                style={
                  imageUrl
                    ? { backgroundImage: `url(${imageUrl})`, backgroundSize: "cover", backgroundPosition: "center" }
                    : {
                        background: `linear-gradient(135deg, hsl(${imageHue} 80% 60%), hsl(${imageHue + 30} 70% 75%))`,
                      }
                }
              >
                {!imageUrl ? <ImagePlus className="size-10" aria-hidden /> : null}
              </div>
              <div className="text-center text-xs text-text-soft-400">400x400px</div>

              <div className="space-y-1">
                <div className="text-xs text-text-soft-400 uppercase tracking-wider">{category}</div>
                <div className="text-base font-medium text-text-strong-950">{name}</div>
                <div className="text-lg font-semibold text-text-strong-950">{price}</div>
              </div>

              <div className="pt-3 border-t border-stroke-soft-200 space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-text-sub-600">Stock Status</span>
                  <Badge appearance="lighter" status={stockStatus}>{stockLabel}</Badge>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-3 border-t border-stroke-soft-200">
                <Avatar size="xs"><AvatarFallback>JB</AvatarFallback></Avatar>
                <span className="text-xs text-text-sub-600">Drafted by James Brown</span>
                <Edit className="size-3 text-text-soft-400 ml-auto" />
              </div>
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  )
}
