"use client"

import * as React from "react"
import { RiCloseLine as X, RiSendPlaneLine as Send, RiArrowRightLine as ArrowRight, RiPencilLine as Edit2, RiFlashlightLine as Zap } from "@remixicon/react"
import { Button } from "@/registry/dash/ui/button"
import { Badge } from "@/registry/dash/ui/badge"
import { Avatar, AvatarFallback } from "@/registry/dash/ui/avatar"
import { Divider } from "@/registry/dash/ui/divider"
import { Label } from "@/registry/dash/ui/label"
import { RadioGroup, RadioItem } from "@/registry/dash/ui/radio"
import { cn } from "@/registry/dash/lib/utils"
import { TransferSequenceRail } from "@/registry/dash/templates/finance-send-recipient"

/**
 * FinanceSendMethod — port of AlignUI Pro Figma frame
 * "Method & Details [Finance & Banking]" (node 3974:37412).
 *
 * Step 2 of 4: pick payment method + confirm recipient bank details.
 *
 * Layout:
 *  - Left rail: TransferSequenceRail (re-used).
 *  - Center: header (icon + title + description) → Recipient summary row
 *    with Edit button → Payment Method select (radio group of 3 methods)
 *    → Recipient's Bank Details row with Edit → Back / Next buttons.
 */

export type FinanceSendMethodProps = {
  recipientName?: string
  recipientContact?: string
  recipientInitials?: string
  bankName?: string
  bankDetails?: string
  defaultMethod?: "wire" | "ach" | "instant"
  onBack?: () => void
  onNext?: () => void
  onClose?: () => void
  onEditRecipient?: () => void
  onEditBank?: () => void
  className?: string
}

const methods = [
  { id: "wire",    label: "Wire",         description: "Same-day transfer, no fees.",         badge: "Recommended" },
  { id: "ach",     label: "ACH",          description: "Up to 3 business days, free.",        badge: null as string | null },
  { id: "instant", label: "Instant Pay",  description: "Settles in seconds. 1.5% fee.",       badge: "New" },
] as const

export function FinanceSendMethod({
  recipientName = "James Brown",
  recipientContact = "james@alignui.com",
  recipientInitials = "JB",
  bankName = "Summit Finance International",
  bankDetails = "Account ••9876 · Routing ••5432",
  defaultMethod = "wire",
  onBack,
  onNext,
  onClose,
  onEditRecipient,
  onEditBank,
  className,
}: FinanceSendMethodProps) {
  const [method, setMethod] = React.useState<string>(defaultMethod)

  return (
    <div className={cn("relative min-h-screen bg-bg-weak-50 flex", className)}>
      <TransferSequenceRail currentStep={1} />

      <Button
        style="ghost"
        tone="neutral"
        size="icon-sm"
        className="absolute right-6 top-6 z-10"
        aria-label="Close"
        onClick={onClose}
      >
        <X className="size-5" />
      </Button>

      <main className="flex-1 px-6 py-10 lg:px-16">
        <div className="mx-auto max-w-[540px] flex flex-col gap-6">
          <header className="flex flex-col items-center text-center gap-3">
            <div
              aria-hidden
              className="inline-flex size-16 items-center justify-center rounded-2xl bg-(--primary-alpha-10) text-(--primary-base) ring-1 ring-stroke-soft-200"
            >
              <Send className="size-7" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-text-strong-950">
                Method &amp; Details
              </h1>
              <p className="mt-1 text-sm text-text-sub-600">
                Select a payment method and see recipient bank details.
              </p>
            </div>
          </header>

          {/* Recipient row */}
          <div className="rounded-xl border border-stroke-soft-200 bg-bg-white-0 p-3 flex items-center gap-3">
            <Avatar className="size-10">
              <AvatarFallback>{recipientInitials}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-text-strong-950 truncate">{recipientName}</p>
              <p className="text-xs text-text-sub-600 truncate">{recipientContact}</p>
            </div>
            <Button style="stroke" tone="neutral" size="xs" onClick={onEditRecipient}>
              <Edit2 className="size-3.5" /> Edit
            </Button>
          </div>

          <Divider />

          {/* Payment method */}
          <div className="flex flex-col gap-2">
            <Label>Payment Method</Label>
            <RadioGroup value={method} onValueChange={setMethod} className="flex flex-col gap-2">
              {methods.map((m) => (
                <label
                  key={m.id}
                  htmlFor={`method-${m.id}`}
                  className={cn(
                    "flex items-start gap-3 rounded-xl border p-3 cursor-pointer transition-colors",
                    method === m.id
                      ? "border-(--primary-base) bg-(--primary-alpha-10)/40"
                      : "border-stroke-soft-200 bg-bg-white-0 hover:bg-bg-weak-50",
                  )}
                >
                  <RadioItem id={`method-${m.id}`} value={m.id} className="mt-0.5" />
                  <span className="flex-1">
                    <span className="flex items-center gap-2">
                      <span className="text-sm font-medium text-text-strong-950">{m.label}</span>
                      {m.badge ? (
                        <Badge
                          appearance="lighter"
                          status={m.badge === "New" ? "feature" : "information"}
                          size="sm"
                        >
                          {m.badge}
                        </Badge>
                      ) : null}
                    </span>
                    <span className="block text-xs text-text-sub-600 mt-0.5">{m.description}</span>
                  </span>
                  {m.id === "instant" ? (
                    <Zap className="size-4 text-(--state-warning-base)" aria-hidden />
                  ) : null}
                </label>
              ))}
            </RadioGroup>
          </div>

          <Divider />

          {/* Recipient bank details */}
          <div className="rounded-xl border border-stroke-soft-200 bg-bg-white-0 p-3 flex items-center gap-3">
            <div className="size-10 rounded-lg bg-bg-weak-50 inline-flex items-center justify-center text-text-sub-600 text-xs font-semibold">
              {bankName.split(" ").map((s) => s[0]).slice(0, 2).join("")}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-text-strong-950 truncate">{bankName}</p>
              <p className="text-xs text-text-sub-600 truncate">{bankDetails}</p>
            </div>
            <Button style="stroke" tone="neutral" size="xs" onClick={onEditBank}>
              <Edit2 className="size-3.5" /> Edit
            </Button>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between gap-3 pt-2">
            <Button style="stroke" tone="neutral" size="md" onClick={onBack}>
              Back
            </Button>
            <Button size="md" onClick={onNext}>
              Next <ArrowRight className="size-4" />
            </Button>
          </div>
        </div>
      </main>
    </div>
  )
}
