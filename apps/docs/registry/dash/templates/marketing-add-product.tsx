"use client"

import * as React from "react"
import { RiArrowLeftLine as ArrowLeft, RiBox3Line as Package, RiImageAddLine as ImagePlus, RiAddLine as Plus } from "@remixicon/react"
import { Card, CardContent } from "@/registry/dash/ui/card"
import { Button } from "@/registry/dash/ui/button"
import { Badge } from "@/registry/dash/ui/badge"
import { Avatar, AvatarFallback } from "@/registry/dash/ui/avatar"
import { InputRoot, Input } from "@/registry/dash/ui/input"
import { Textarea } from "@/registry/dash/ui/textarea"
import { Label } from "@/registry/dash/ui/label"
import { Field, FieldGroup, FieldDescription } from "@/registry/dash/ui/field"
import { StepIndicator, Step, type StepStatus } from "@/registry/dash/ui/step-indicator"
import {
  EmptyState,
  EmptyStateIllustration,
  EmptyStateTitle,
  EmptyStateDescription,
  EmptyStateActions,
} from "@/registry/dash/ui/empty-state"
import { cn } from "@/registry/dash/lib/utils"

/* -------------------------------------------------------------------------- */
/*  Types                                                                     */
/* -------------------------------------------------------------------------- */

export type AddProductStep = {
  id: string
  label: string
  description?: string
}

export type MarketingAddProductProps = {
  steps?: AddProductStep[]
  currentStepIndex?: number
  /** When true, right column renders an empty state instead of the partial form. */
  emptyState?: boolean
  className?: string
}

/* -------------------------------------------------------------------------- */
/*  Defaults                                                                  */
/* -------------------------------------------------------------------------- */

const defaultSteps: AddProductStep[] = [
  { id: "general",  label: "General Information", description: "Step 1/5" },
  { id: "pricing",  label: "Pricing Details",     description: "Step 2/5" },
  { id: "image",    label: "Product Image",       description: "Step 3/5" },
  { id: "stock",    label: "Stock Status",        description: "Step 4/5" },
  { id: "summary",  label: "Summary",             description: "Step 5/5" },
]

/* -------------------------------------------------------------------------- */
/*  Component                                                                 */
/* -------------------------------------------------------------------------- */

/**
 * MarketingAddProduct — Catalyst-style 5-step "Add product" wizard
 * ported from AlignUI Pro Figma. Left = vertical step indicator,
 * center = General Information form (or empty state),
 * right = live preview card.
 *
 * Source: Figma node `164914:73123` ("Add Product / General [Marketing & Sales]").
 */
export function MarketingAddProduct({
  steps = defaultSteps,
  currentStepIndex = 0,
  emptyState = false,
  className,
}: MarketingAddProductProps) {
  const statusFor = (i: number): StepStatus =>
    i < currentStepIndex ? "completed" : i === currentStepIndex ? "current" : "upcoming"

  return (
    <div className={cn("min-h-screen bg-bg-weak-50 flex flex-col", className)}>
      {/* Topbar */}
      <header className="flex items-center justify-between gap-4 px-6 py-3 border-b border-stroke-soft-200 bg-bg-white-0">
        <Button tone="neutral" style="ghost" size="sm">
          <ArrowLeft className="size-4" /> Back to page
        </Button>
        <div className="text-sm text-text-sub-600">SKU: 000-00-0000</div>
      </header>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-[260px_1fr_360px] gap-6 p-6">
        {/* Left: Stepper */}
        <aside>
          <StepIndicator orientation="vertical">
            {steps.map((s, i) => (
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

        {/* Center: Form / Empty state */}
        <section className="space-y-4">
          {emptyState ? (
            <Card>
              <CardContent className="py-16">
                <EmptyState size="md">
                  <EmptyStateIllustration>
                    <div className="size-16 mx-auto rounded-2xl bg-bg-weak-50 flex items-center justify-center text-text-soft-400">
                      <Package className="size-8" />
                    </div>
                  </EmptyStateIllustration>
                  <EmptyStateTitle>Add product details</EmptyStateTitle>
                  <EmptyStateDescription>
                    Boost sales with detailed product information.
                  </EmptyStateDescription>
                  <EmptyStateActions>
                    <Button tone="primary" style="filled">
                      <Plus className="size-4" /> Start adding
                    </Button>
                  </EmptyStateActions>
                </EmptyState>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-6 space-y-6">
                <div>
                  <h2 className="text-lg font-semibold tracking-tight text-text-strong-950">
                    General Information
                  </h2>
                  <p className="text-sm text-text-sub-600 mt-0.5">
                    Boost sales with detailed product information.
                  </p>
                </div>

                <FieldGroup>
                  <Field>
                    <Label htmlFor="prod-name">Product name</Label>
                    <InputRoot>
                      <Input id="prod-name" placeholder="Enter product name..." />
                    </InputRoot>
                  </Field>
                  <Field>
                    <Label htmlFor="prod-cat">Category</Label>
                    <InputRoot>
                      <Input id="prod-cat" placeholder="Select category..." />
                    </InputRoot>
                    <FieldDescription>Choose the closest match.</FieldDescription>
                  </Field>
                  <Field>
                    <Label htmlFor="prod-desc">Description</Label>
                    <Textarea
                      id="prod-desc"
                      placeholder="Enter product description..."
                      rows={5}
                    />
                  </Field>
                </FieldGroup>
              </CardContent>
            </Card>
          )}

          <div className="flex justify-end gap-2">
            <Button tone="neutral" style="stroke">Cancel</Button>
            <Button tone="primary" style="filled">Continue</Button>
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

              <div className="aspect-square rounded-xl bg-gradient-to-br from-(--dash-purple-100) to-(--dash-purple-300) flex items-center justify-center">
                <ImagePlus className="size-10 text-static-white/80" aria-hidden />
              </div>
              <div className="text-center text-xs text-text-soft-400">400x400px</div>

              <div className="space-y-1">
                <div className="text-xs text-text-soft-400 uppercase tracking-wider">Category name</div>
                <div className="text-base font-medium text-text-strong-950">The product name is here.</div>
                <div className="text-lg font-semibold text-text-strong-950">$0.00</div>
              </div>

              <div className="pt-3 border-t border-stroke-soft-200 space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-text-sub-600">Stock Status</span>
                  <Badge appearance="lighter" status="warning">0 out of 0 units</Badge>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-3 border-t border-stroke-soft-200">
                <Avatar size="xs"><AvatarFallback>JB</AvatarFallback></Avatar>
                <span className="text-xs text-text-sub-600">Drafted by James Brown</span>
              </div>
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  )
}
