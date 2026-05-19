"use client"

import * as React from "react"
import { RiCloseLine as X, RiSendPlaneLine as Send, RiArrowRightLine as ArrowRight, RiPencilLine as Edit2 } from "@remixicon/react"
import { Button } from "@/registry/dash/ui/button"
import { Badge } from "@/registry/dash/ui/badge"
import { Divider } from "@/registry/dash/ui/divider"
import { InputRoot, Input, InputAffix } from "@/registry/dash/ui/input"
import { Textarea } from "@/registry/dash/ui/textarea"
import { Label } from "@/registry/dash/ui/label"
import { Hint } from "@/registry/dash/ui/hint"
import { Switch } from "@/registry/dash/ui/switch"
import { cn } from "@/registry/dash/lib/utils"
import { TransferSequenceRail } from "@/registry/dash/templates/finance-send-recipient"

/**
 * FinanceSendAmount — port of AlignUI Pro Figma frame
 * "Source & Amount [Finance & Banking]" (node 3974:51735).
 *
 * Step 3 of 4: pick funding source + enter amount + optional description +
 * recurring toggle.
 *
 * Layout:
 *  - Left rail: TransferSequenceRail (re-used).
 *  - Center: header → source account row with Available balance + Edit
 *    → Amount input (currency prefix / target currency suffix) →
 *    "Recipient Receives" preview → Description textarea with char counter →
 *    Recurring payment switch → Back / Next buttons.
 */

export type FinanceSendAmountProps = {
  sourceAccount?: string
  available?: number
  sourceCurrency?: string
  targetCurrency?: string
  rate?: number
  onBack?: () => void
  onNext?: () => void
  onClose?: () => void
  onEditSource?: () => void
  className?: string
}

const fmtMoney = (n: number, currency: string) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency, maximumFractionDigits: 2 }).format(n)

export function FinanceSendAmount({
  sourceAccount = "Checking ••0123",
  available = 15000,
  sourceCurrency = "USD",
  targetCurrency = "EUR",
  rate = 0.94,
  onBack,
  onNext,
  onClose,
  onEditSource,
  className,
}: FinanceSendAmountProps) {
  const [amount, setAmount] = React.useState("")
  const [description, setDescription] = React.useState("")
  const [recurring, setRecurring] = React.useState(false)

  const amountNum = Number.parseFloat(amount) || 0
  const recipientReceives = amountNum * rate

  return (
    <div className={cn("relative min-h-screen bg-bg-weak-50 flex", className)}>
      <TransferSequenceRail currentStep={2} />

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
                Source &amp; Amount
              </h1>
              <p className="mt-1 text-sm text-text-sub-600">
                Choose the funding source and enter the amount to send money.
              </p>
            </div>
          </header>

          {/* Source row */}
          <div className="rounded-xl border border-stroke-soft-200 bg-bg-white-0 p-3 flex items-center gap-3">
            <div
              aria-hidden
              className="size-10 rounded-lg bg-(--primary-alpha-10) inline-flex items-center justify-center text-(--primary-base) text-xs font-semibold"
            >
              {sourceCurrency}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-text-strong-950 truncate">{sourceAccount}</p>
              <p className="text-xs text-text-sub-600 truncate">
                Available: {fmtMoney(available, sourceCurrency)}
              </p>
            </div>
            <Button style="stroke" tone="neutral" size="xs" onClick={onEditSource}>
              <Edit2 className="size-3.5" /> Edit
            </Button>
          </div>

          <Divider />

          {/* Amount input */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="send-amount">Enter Amount</Label>
            <InputRoot>
              <InputAffix>$</InputAffix>
              <Input
                id="send-amount"
                type="number"
                inputMode="decimal"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
              <InputAffix>{targetCurrency}</InputAffix>
            </InputRoot>
            <Hint>
              1 {sourceCurrency} = {rate} {targetCurrency}
            </Hint>
          </div>

          {/* Recipient receives */}
          <div className="rounded-xl bg-bg-weak-50 p-3 flex items-center justify-between">
            <span className="text-xs uppercase tracking-wider text-text-sub-600">
              Recipient Receives
            </span>
            <span className="text-base font-semibold tabular-nums text-text-strong-950">
              {fmtMoney(recipientReceives, targetCurrency)}
            </span>
          </div>

          {/* Description */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="send-description">Description</Label>
            <Textarea
              id="send-description"
              placeholder="The message you wish to send to the recipient..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={200}
              rows={3}
            />
            <div className="flex items-center justify-between">
              <Hint>Help your recipient understand and verify the transfer.</Hint>
              <span className="text-xs text-text-sub-600 tabular-nums">
                {description.length}/200
              </span>
            </div>
          </div>

          {/* Recurring switch */}
          <div className="flex items-center justify-between rounded-xl border border-stroke-soft-200 p-3">
            <div>
              <p className="text-sm font-medium text-text-strong-950 flex items-center gap-2">
                Recurring payment
                <Badge appearance="lighter" status="feature" size="sm">NEW</Badge>
              </p>
              <p className="text-xs text-text-sub-600">
                Schedule this as a repeating transfer.
              </p>
            </div>
            <Switch checked={recurring} onCheckedChange={setRecurring} />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between gap-3 pt-2">
            <Button style="stroke" tone="neutral" size="md" onClick={onBack}>
              Back
            </Button>
            <Button size="md" onClick={onNext} disabled={amountNum <= 0}>
              Next <ArrowRight className="size-4" />
            </Button>
          </div>
        </div>
      </main>
    </div>
  )
}
