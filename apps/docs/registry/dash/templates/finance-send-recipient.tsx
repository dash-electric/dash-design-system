"use client"

import * as React from "react"
import { RiSearchLine as Search, RiCloseLine as X, RiArrowRightLine as ArrowRight, RiSendPlaneLine as Send, RiAddLine as Plus } from "@remixicon/react"
import { Button } from "@/registry/dash/ui/button"
import { Avatar, AvatarFallback } from "@/registry/dash/ui/avatar"
import { Divider } from "@/registry/dash/ui/divider"
import { InputRoot, Input, InputIcon } from "@/registry/dash/ui/input"
import { Label } from "@/registry/dash/ui/label"
import { Hint } from "@/registry/dash/ui/hint"
import { StepIndicator, Step } from "@/registry/dash/ui/step-indicator"
import { LinkButton } from "@/registry/dash/ui/link-button"
import { cn } from "@/registry/dash/lib/utils"

/**
 * FinanceSendRecipient — port of AlignUI Pro Figma frame
 * "Recipient Selection [Finance & Banking]" (node 3974:9650).
 *
 * Step 1 of 4: pick a saved recipient.
 *
 * Layout:
 *  - Left rail: "Transfer Sequence" + vertical StepIndicator + Contact card
 *    + copyright.
 *  - Center: header (icon + title + description) → search input → recipients
 *    list with avatar + name + sublabel + account-id chip + "Use" CTA per row
 *    → "New Recipient" trailing item.
 *  - Top-right close button.
 */

export type FinanceRecipient = {
  id: string
  name: string
  initials?: string
  contact: string
  accountRef: string
}

export type FinanceSendRecipientProps = {
  recipients?: FinanceRecipient[]
  onSelect?: (id: string) => void
  onClose?: () => void
  onAddNew?: () => void
  className?: string
}

const defaultRecipients: FinanceRecipient[] = [
  { id: "r1", name: "James Brown",      initials: "JB", contact: "james@alignui.com",  accountRef: "A-52112" },
  { id: "r2", name: "Sophia Williams",  initials: "SW", contact: "+44 01 2345 6789",    accountRef: "A-52132" },
  { id: "r3", name: "Emma Wright",      initials: "EW", contact: "emma@alignui.com",    accountRef: "A-52184" },
  { id: "r4", name: "Matthew Johnson",  initials: "MJ", contact: "+1 (456) 789-0123",   accountRef: "A-52114" },
]

export function FinanceSendRecipient({
  recipients = defaultRecipients,
  onSelect,
  onClose,
  onAddNew,
  className,
}: FinanceSendRecipientProps) {
  return (
    <div className={cn("relative min-h-screen bg-bg-weak-50 flex", className)}>
      <TransferSequenceRail currentStep={0} />

      {/* Close button */}
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
                Recipient Selection
              </h1>
              <p className="mt-1 text-sm text-text-sub-600">
                Select who will receive your money transfer.
              </p>
            </div>
          </header>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="recipient-search">Choose Recipient</Label>
            <InputRoot>
              <InputIcon>
                <Search className="size-4" />
              </InputIcon>
              <Input id="recipient-search" placeholder="Search for recipients..." />
            </InputRoot>
            <Hint>Search by name, email, phone, or account reference.</Hint>
          </div>

          <section className="rounded-xl border border-stroke-soft-200 bg-bg-white-0 p-2">
            <p className="px-2 py-2 text-xs uppercase tracking-wider text-text-sub-600">
              Saved Recipients
            </p>
            <ul className="flex flex-col">
              {recipients.map((r, i) => (
                <li key={r.id}>
                  {i > 0 ? <Divider /> : null}
                  <button
                    type="button"
                    onClick={() => onSelect?.(r.id)}
                    className="flex w-full items-center gap-3 px-2 py-2.5 text-left rounded-lg transition-colors hover:bg-bg-weak-50"
                  >
                    <Avatar className="size-9">
                      <AvatarFallback>{r.initials ?? r.name[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-text-strong-950 truncate">{r.name}</p>
                      <p className="text-xs text-text-sub-600 truncate">{r.contact}</p>
                    </div>
                    <span className="rounded-md bg-bg-weak-50 px-2 py-0.5 text-xs text-text-sub-600">
                      {r.accountRef}
                    </span>
                    <ArrowRight className="size-4 text-text-soft-400" />
                  </button>
                </li>
              ))}
              <Divider />
              <li>
                <button
                  type="button"
                  onClick={onAddNew}
                  className="flex w-full items-center gap-3 px-2 py-3 text-left rounded-lg transition-colors hover:bg-bg-weak-50"
                >
                  <span
                    aria-hidden
                    className="inline-flex size-9 items-center justify-center rounded-full bg-(--primary-alpha-10) text-(--primary-base)"
                  >
                    <Plus className="size-4" />
                  </span>
                  <span className="text-sm font-medium text-(--primary-base)">New Recipient</span>
                </button>
              </li>
            </ul>
          </section>
        </div>
      </main>
    </div>
  )
}

/**
 * Shared left rail used by all three send-* templates.
 * Exported so consumers can compose their own send flow.
 */
export function TransferSequenceRail({
  currentStep,
  className,
}: {
  /** 0..3 → which step is "current". */
  currentStep: 0 | 1 | 2 | 3
  className?: string
}) {
  const steps = [
    { label: "Recipient Selection" },
    { label: "Method & Details" },
    { label: "Source & Amount" },
    { label: "Transfer Summary" },
  ]
  return (
    <aside
      className={cn(
        "hidden lg:flex w-[280px] shrink-0 flex-col gap-6 border-r border-stroke-soft-200 bg-bg-white-0 px-6 py-8",
        className,
      )}
    >
      <p className="text-xs font-medium uppercase tracking-wider text-text-sub-600">
        Transfer Sequence
      </p>
      <StepIndicator orientation="vertical">
        {steps.map((s, i) => (
          <Step
            key={s.label}
            orientation="vertical"
            status={i < currentStep ? "completed" : i === currentStep ? "current" : "upcoming"}
            index={i}
            label={s.label}
            withConnector={false}
          />
        ))}
      </StepIndicator>

      <div className="mt-auto rounded-xl border border-stroke-soft-200 p-4">
        <p className="text-xs text-text-sub-600">Having trouble with transfer?</p>
        <LinkButton tone="primary" size="md" className="mt-1">
          Contact
        </LinkButton>
      </div>

      <p className="text-[11px] text-text-sub-600">© 2024 Apex Financial</p>
    </aside>
  )
}
