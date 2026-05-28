"use client"

import * as React from "react"
import {
  RiArrowLeftRightLine,
  RiSettings2Line,
  RiAddLine,
  RiArrowLeftSLine,
  RiArrowRightSLine,
  RiArrowDownSLine,
  RiCheckboxCircleFill,
} from "@remixicon/react"
import { Button } from "@/registry/dash/ui/button"
import { CompactButton } from "@/registry/dash/ui/compact-button"
import { Divider } from "@/registry/dash/ui/divider"
import { Avatar, AvatarImage, AvatarFallback } from "@/registry/dash/ui/avatar"
import { cn } from "@/registry/dash/lib/utils"
import { EmptyStateIllustration } from "@/registry/dash/ui/empty-state-illustration"
import {
  DocsPageShell,
  DocsHeader,
  DocsSection,
  DocsExample,
  DocsPropsTable,
} from "@/components/docs/page-shell"

/**
 * Finance Widget — Quick Transfer. Ported from AlignUI Finance Template (2026-05-19).
 * Source: components/widgets/widget-quick-transfer.tsx
 *
 * Contacts: Natalia / James / Laura / Wei / Arthur / Emma / Lena / Nuray (8 of "12").
 * Available balance: $16,058.94. Save action button disabled until amount > 0.
 */

const CONTACTS = [
  { id: "natalia", name: "Natalia", initials: "NA", color: "primary" as const },
  { id: "james", name: "James", initials: "JB", color: "blue" as const },
  { id: "laura", name: "Laura", initials: "LP", color: "purple" as const },
  { id: "wei", name: "Wei", initials: "WC", color: "sky" as const },
  { id: "arthur", name: "Arthur", initials: "AG", color: "gray" as const },
  { id: "emma", name: "Emma", initials: "EW", color: "red" as const },
  { id: "lena", name: "Lena", initials: "LK", color: "yellow" as const },
  { id: "nuray", name: "Nuray", initials: "NB", color: "sky" as const },
]

export default function FinanceQuickTransferWidgetPage() {
  const [selected, setSelected] = React.useState<string[]>([])
  const [amount, setAmount] = React.useState(0)

  const toggle = (id: string) =>
    setSelected((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]))

  const fmt = (v: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(v)

  return (
    <DocsPageShell>
      <DocsHeader
        category="Product Components / Widgets / Finance (deep)"
        title="Quick Transfer"
        description="Embla-carousel contacts row + currency amount input + bg-weak-50 available balance footer. Source ships 8 contact pills (out of 12), $16,058.94 available, and a stroked Save-action CTA disabled until amount > 0."
      />

      <DocsSection title="Full widget">
        <DocsExample
          title="0 contacts selected · $0.00"
          preview={
            <div className="max-w-md">
              <WidgetShell
                title={<><RiArrowLeftRightLine className="size-4 text-icon-sub-600" /> Quick Transfer</>}
                action={<Button tone="neutral" style="stroke" size="xs"><RiSettings2Line /> Advanced</Button>}
              >
                <Divider />
                {/* Contacts header */}
                <div className="mt-4 flex items-center justify-between">
                  <div className="text-[10px] uppercase tracking-wider text-text-soft-400">My Contacts (12)</div>
                  <div className="flex gap-2">
                    <CompactButton variant="ghost" size="md" aria-label="Previous"><RiArrowLeftSLine /></CompactButton>
                    <CompactButton variant="ghost" size="md" aria-label="Next"><RiArrowRightSLine /></CompactButton>
                  </div>
                </div>
                {/* Contact pills */}
                <div className="mt-2 flex gap-2 overflow-x-auto pb-1">
                  {CONTACTS.map((c) => (
                    <ContactPill key={c.id} {...c} selected={selected.includes(c.id)} onClick={() => toggle(c.id)} />
                  ))}
                </div>
                {/* Amount card */}
                <div className="mt-4 overflow-hidden rounded-xl bg-bg-white-0 ring-1 ring-inset ring-stroke-soft-200">
                  <div className="flex h-8 items-center justify-between gap-2 border-b border-stroke-soft-200 bg-bg-weak-50 pl-3 pr-2.5">
                    <div className="flex items-center gap-2">
                      <span className="inline-flex h-4 items-center rounded-sm bg-bg-strong-950 px-1 text-[8px] font-bold uppercase text-static-white">MC</span>
                      <div className="text-xs text-text-sub-600">My Physical Card</div>
                    </div>
                    <RiArrowDownSLine className="size-5 text-text-sub-600" />
                  </div>
                  <div className="flex flex-col items-center gap-3 p-3">
                    <div>
                      <div className="text-center text-[10px] uppercase tracking-wider text-text-soft-400">ENTER AMOUNT</div>
                      <input
                        type="number"
                        min={0}
                        value={amount || ""}
                        placeholder="$0.00"
                        onChange={(e) => setAmount(Number(e.target.value) || 0)}
                        className="mt-1 w-full bg-transparent text-center text-2xl font-medium tabular-nums text-text-strong-950 outline-none"
                      />
                    </div>
                    <div className="flex h-7 w-full items-center justify-center rounded-md bg-bg-weak-50 text-xs text-text-sub-600">
                      Available: <span className="ml-1 font-medium text-text-strong-950">$16,058.94</span>
                    </div>
                  </div>
                </div>

                <Button tone="neutral" style="stroke" size="sm" className="mt-4 w-full" disabled={amount === 0}>
                  <RiAddLine /> Save a New Action
                </Button>
              </WidgetShell>
            </div>
          }
          code={`<QuickTransfer contacts={contactsList} available={16058.94} amount={amount} onAmountChange={setAmount} />`}
        />
      </DocsSection>

      <DocsSection title="Contact pill states">
        <DocsExample
          title="Default vs Selected"
          preview={
            <div className="flex flex-wrap gap-2">
              <ContactPill {...CONTACTS[0]} selected={false} />
              <ContactPill {...CONTACTS[0]} selected={true} />
            </div>
          }
          code={`<ContactPill selected={false} />
<ContactPill selected={true} />`}
        />
      </DocsSection>

      <DocsSection title="Empty state">
        <DocsExample
          title="No funds"
          preview={
            <div className="max-w-md">
              <WidgetShell title={<><RiArrowLeftRightLine className="size-4 text-icon-sub-600" /> Quick Transfer</>}>
                <Divider />
                <div className="flex h-[260px] flex-col items-center justify-center gap-3 p-6">
                  <EmptyStateIllustration kind="quick-transfer" />
                  <p className="text-center text-sm text-text-soft-400">You do not have any funds to transfer.<br />Please check back later.</p>
                  <Button tone="neutral" style="stroke" size="xs"><RiAddLine /> Add Funds</Button>
                </div>
              </WidgetShell>
            </div>
          }
          code={`<QuickTransferEmpty />`}
        />
      </DocsSection>

      <DocsSection title="API">
        <DocsPropsTable
          rows={[
            { name: "contacts", type: "Contact[]", description: "Carousel pills. Source ships 8 of stated 12." },
            { name: "selected", type: "string[]", description: "Multi-select ids." },
            { name: "amount", type: "number", description: "USD value of the field; controlled." },
            { name: "available", type: "number", defaultValue: "16058.94", description: "Wallet balance shown under the input." },
            { name: "onSubmit", type: "() => void", description: "Save action — disabled until amount > 0." },
          ]}
        />
      </DocsSection>

      <DocsSection title="Anatomy">
        <ul className="space-y-2 text-sm text-text-strong-950/90 list-disc pl-6">
          <li><strong>Contacts header</strong> — uppercase caption + 2 ghost CompactButton (prev/next).</li>
          <li><strong>Contact pill</strong> — pill-shaped, 20px avatar + name. Selected = bg-weak-50 + animated success check.</li>
          <li><strong>Amount card</strong> — header strip (bg-weak-50) with brand glyph + label + chevron, body = title-h4 currency input + Available footer.</li>
          <li><strong>Save action</strong> — disabled until amount &gt; 0.</li>
        </ul>
      </DocsSection>
    </DocsPageShell>
  )
}

function WidgetShell({
  title,
  action,
  children,
  className,
}: {
  title: React.ReactNode
  action?: React.ReactNode
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn("rounded-2xl border border-stroke-soft-200 bg-bg-white-0 p-4 shadow-sm", className)}>
      <div className="flex items-center gap-2 min-h-8 mb-3">
        <div className="flex flex-1 items-center gap-2 text-sm font-medium text-text-strong-950">{title}</div>
        {action}
      </div>
      {children}
    </div>
  )
}

function ContactPill({
  name,
  initials,
  selected,
  onClick,
}: {
  id: string
  name: string
  initials: string
  color?: string
  selected: boolean
  onClick?: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex h-8 items-center whitespace-nowrap rounded-full pl-1 pr-3 ring-1 ring-inset transition",
        selected
          ? "bg-bg-weak-50 ring-transparent"
          : "bg-bg-white-0 ring-stroke-soft-200 hover:bg-bg-weak-50",
      )}
    >
      <Avatar size="xs">
        <AvatarImage src="" />
        <AvatarFallback>{initials}</AvatarFallback>
      </Avatar>
      <span className={cn("ml-1.5 text-xs", selected ? "font-medium text-text-strong-950" : "text-text-sub-600")}>{name}</span>
      {selected && <RiCheckboxCircleFill className="ml-1.5 size-4 text-(--state-success-base)" />}
    </button>
  )
}
