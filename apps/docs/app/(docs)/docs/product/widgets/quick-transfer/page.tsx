"use client"

import * as React from "react"
import {
  RiSettings3Line as Settings,
  RiArrowLeftRightLine as SwapH,
  RiArrowLeftSLine as ChevLeft,
  RiArrowRightSLine as ChevRight,
  RiArrowDownSLine as ChevronDown,
  RiAddLine as Plus,
  RiMastercardFill as Mastercard,
} from "@remixicon/react"
import { Avatar, AvatarFallback, AvatarImage } from "@/registry/dash/ui/avatar"
import { Button } from "@/registry/dash/ui/button"
import {
  DocsPageShell,
  DocsHeader,
  DocsSection,
  DocsExample,
  DocsPropsTable,
} from "@/components/docs/page-shell"
import { cn } from "@/registry/dash/lib/utils"
import { EmptyStateIllustration } from "@/registry/dash/ui/empty-state-illustration"

/**
 * Quick Transfer widget — Figma verified 2026-05-19.
 *
 *   3949:25613   Quick Transfer — loaded (My Contacts carousel + card selector + amount + Save action CTA)
 *   3963:9863    Quick Transfer — empty state
 *
 * Drift notes (re-verify 2026-05-19): 3927:3349 (Currency List), 3698:3425
 * (Recent Transactions), 3963:7179 + 3963:11119 (Budget Overview) ALL INVALID
 * for this family — they belong to other widget pages.
 *
 * Real Figma anatomy: header "Quick Transfer" + "Advanced" stroke button with
 * gear icon. Below: "My Contacts (n)" label + carousel arrows + horizontally
 * scrolling pill avatars (avatar + name). Then a card selector dropdown row,
 * a big "ENTER AMOUNT" headline with "$0.00" + Available subtitle. Bottom CTA
 * is full-width "Save a New Action" (NOT a Send button).
 */

type Contact = { id: string; name: string }

const CONTACTS: Contact[] = [
  { id: "natalia", name: "Natalia" },
  { id: "james", name: "James" },
  { id: "laura", name: "Laura" },
  { id: "wei", name: "Wei" },
]

export default function QuickTransferWidgetPage() {
  const [amount, setAmount] = React.useState("0.00")

  return (
    <DocsPageShell>
      <DocsHeader
        category="Product Components / Widgets"
        title="Quick Transfer"
        description="Saved-contacts transfer shortcut — header Advanced action, horizontal contact carousel with avatar + name pills, source-card dropdown, big amount entry, and a Save a New Action footer CTA. Empty state covers the no-funds case."
      />

      <DocsSection title="Loaded state">
        <p className="text-sm text-text-sub-600 max-w-2xl">
          Default render — 12 saved contacts (4 visible), Mastercard as the source card, amount entry seeded to
          $0.00. Available balance ($16,058.94) renders beneath the amount.
        </p>
        <DocsExample
          title="Full widget"
          preview={
            <div className="max-w-sm">
              <QuickTransferLoaded
                contacts={CONTACTS}
                total={12}
                amount={amount}
                onAmountChange={setAmount}
              />
            </div>
          }
          code={`<QuickTransfer
  contacts={[/* Natalia, James, Laura, Wei */]}
  total={12}
  card={{ brand: "mastercard", label: "My Physical Card" }}
  amount="0.00"
  available="$16,058.94"
/>`}
        />
      </DocsSection>

      <DocsSection title="Empty state">
        <p className="text-sm text-text-sub-600 max-w-2xl">
          Renders when the account has no transferable funds. Header trailing collapses, body shows muted
          illustration + Add Funds stroke CTA.
        </p>
        <DocsExample
          title="No funds to transfer"
          preview={
            <div className="max-w-sm">
              <QuickTransferEmpty />
            </div>
          }
          code={`<QuickTransfer state="empty" />`}
        />
      </DocsSection>

      <DocsSection title="Contact carousel">
        <p className="text-sm text-text-sub-600 max-w-2xl">
          Standalone view of the My Contacts row — left/right arrows, label + count, pill avatars (avatar + name)
          inside soft chips.
        </p>
        <DocsExample
          title="4 visible contacts"
          preview={
            <div className="max-w-sm">
              <ContactCarousel contacts={CONTACTS} total={12} />
            </div>
          }
          code={`<ContactCarousel contacts={contacts} total={12} />`}
        />
      </DocsSection>

      <DocsSection title="API">
        <DocsPropsTable
          rows={[
            { name: "contacts", type: "Contact[]", description: "Saved contacts shown in the horizontal carousel — { id, name }." },
            { name: "total", type: "number", description: "Total contact count rendered in the \"My Contacts (n)\" label." },
            { name: "card", type: "{ brand: string; label: string }", description: "Source card shown in the dropdown row." },
            { name: "amount", type: "string", description: "Controlled amount value (string for input fidelity)." },
            { name: "available", type: "string", defaultValue: '"$16,058.94"', description: "Subtitle line under the amount." },
            { name: "onAmountChange", type: "(v: string) => void", description: "Fires on every input keystroke." },
            { name: "onSubmit", type: "() => void", description: "Fires when the Save a New Action footer CTA is pressed." },
            { name: "state", type: '"loaded" | "empty"', defaultValue: '"loaded"', description: "Loaded shows the form; empty replaces body with illustration + Add Funds CTA." },
          ]}
        />
      </DocsSection>

      <DocsSection title="Anatomy">
        <ul className="space-y-2 text-sm text-text-strong-950/90 list-disc pl-6">
          <li><strong>Header</strong> — swap icon + title + Advanced stroke button with gear icon.</li>
          <li><strong>Contact row</strong> — "My Contacts (n)" label + ChevLeft/ChevRight carousel controls.</li>
          <li><strong>Contact pill</strong> — soft chip with avatar (sm) + name; visually distinct from raw avatar grid.</li>
          <li><strong>Card row</strong> — brand glyph + card label + chevron-down, inside a soft pill container.</li>
          <li><strong>Amount block</strong> — "ENTER AMOUNT" caption + headline value + "Available: $X" subtitle.</li>
          <li><strong>Footer CTA</strong> — full-width "+ Save a New Action" stroke button (disabled until valid).</li>
          <li><strong>Empty</strong> — muted illustration + 2-line copy + Add Funds stroke button.</li>
        </ul>
      </DocsSection>
    </DocsPageShell>
  )
}

/* ---------------------------------------------------------------------------- */

function WidgetShell({
  title,
  trailing,
  children,
  className,
}: {
  title: React.ReactNode
  trailing?: React.ReactNode
  children: React.ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-stroke-soft-200 bg-bg-white-0 p-3 shadow-sm space-y-3",
        className,
      )}
    >
      <div className="flex items-center gap-2">
        <div className="text-sm font-medium text-text-strong-950 flex-1 inline-flex items-center gap-1.5">
          {title}
        </div>
        {trailing}
      </div>
      {children}
    </div>
  )
}

function ContactPill({ contact }: { contact: Contact }) {
  return (
    <button
      type="button"
      className="inline-flex items-center gap-1.5 rounded-full border border-stroke-soft-200 bg-bg-white-0 pl-1 pr-2.5 py-1 text-xs font-medium text-text-strong-950 shrink-0"
    >
      <Avatar size="xs">
        <AvatarImage src={`https://i.pravatar.cc/40?u=${contact.id}`} />
        <AvatarFallback>{contact.name[0]}</AvatarFallback>
      </Avatar>
      {contact.name}
    </button>
  )
}

function ContactCarousel({
  contacts,
  total,
}: {
  contacts: Contact[]
  total: number
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-2">
        <div className="flex-1 text-xs text-text-sub-600">My Contacts ({total})</div>
        <button
          type="button"
          aria-label="Previous contacts"
          className="inline-flex size-6 items-center justify-center rounded-md border border-stroke-soft-200 bg-bg-white-0 text-text-sub-600"
        >
          <ChevLeft className="size-3.5" />
        </button>
        <button
          type="button"
          aria-label="Next contacts"
          className="inline-flex size-6 items-center justify-center rounded-md border border-stroke-soft-200 bg-bg-white-0 text-text-sub-600"
        >
          <ChevRight className="size-3.5" />
        </button>
      </div>
      <div className="flex items-center gap-2 overflow-x-auto pb-1 -mx-1 px-1">
        {contacts.map((c) => (
          <ContactPill key={c.id} contact={c} />
        ))}
      </div>
    </div>
  )
}

function CardSelector() {
  return (
    <button
      type="button"
      className="flex w-full items-center gap-2 rounded-lg border border-stroke-soft-200 bg-bg-white-0 px-2.5 h-10"
    >
      <span className="inline-flex size-6 items-center justify-center rounded-full bg-[#F59E0B] text-white">
        <Mastercard className="size-3.5" />
      </span>
      <span className="flex-1 text-left text-sm font-medium text-text-strong-950">
        My Physical Card
      </span>
      <ChevronDown className="size-4 text-text-soft-400" />
    </button>
  )
}

function QuickTransferLoaded({
  contacts,
  total,
  amount,
  onAmountChange,
}: {
  contacts: Contact[]
  total: number
  amount: string
  onAmountChange: (v: string) => void
}) {
  return (
    <WidgetShell
      title={
        <>
          <SwapH className="size-4 text-icon-sub-600" />
          Quick Transfer
        </>
      }
      trailing={
        <Button style="stroke" tone="neutral" size="xs">
          <Settings className="size-3" />
          Advanced
        </Button>
      }
    >
      <ContactCarousel contacts={contacts} total={total} />
      <CardSelector />
      <div className="flex flex-col items-center gap-1 py-2 text-center">
        <div className="text-[10px] uppercase tracking-wider text-text-soft-400">
          Enter Amount
        </div>
        <div className="inline-flex items-baseline gap-1">
          <span className="text-2xl font-semibold tabular-nums text-text-strong-950">$</span>
          <input
            value={amount}
            onChange={(e) => onAmountChange(e.target.value)}
            className="w-24 bg-transparent text-3xl font-semibold tabular-nums text-text-strong-950 outline-none text-center"
            aria-label="Amount"
            inputMode="decimal"
          />
        </div>
        <div className="text-xs text-text-sub-600">
          Available:{" "}
          <span className="text-text-strong-950 font-medium tabular-nums">$16,058.94</span>
        </div>
      </div>
      <Button style="stroke" tone="neutral" size="sm" className="w-full" disabled>
        <Plus className="size-3.5" />
        Save a New Action
      </Button>
    </WidgetShell>
  )
}

function QuickTransferEmpty() {
  return (
    <WidgetShell
      title={
        <>
          <SwapH className="size-4 text-icon-sub-600" />
          Quick Transfer
        </>
      }
      trailing={null}
    >
      <div className="flex flex-col items-center gap-3 py-8 text-center">
        <EmptyStateIllustration kind="quick-transfer" />
        <div className="text-xs text-text-sub-600 max-w-[28ch] leading-relaxed">
          You do not have any funds to transfer.
          <br />
          Please check back later.
        </div>
        <Button style="stroke" tone="neutral" size="xs">
          <Plus className="size-3.5" />
          Add Funds
        </Button>
      </div>
    </WidgetShell>
  )
}
