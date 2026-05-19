"use client"

import * as React from "react"
import {
  RiFlashlightLine,
  RiAddLine,
  RiDropFill,
  RiHandHeartFill,
  RiFireFill,
  RiArrowRightSLine,
} from "@remixicon/react"
import { Button } from "@/registry/dash/ui/button"
import { Badge } from "@/registry/dash/ui/badge"
import { Divider } from "@/registry/dash/ui/divider"
import { Avatar, AvatarImage, AvatarFallback } from "@/registry/dash/ui/avatar"
import { cn } from "@/registry/dash/lib/utils"
import {
  DocsPageShell,
  DocsHeader,
  DocsSection,
  DocsExample,
  DocsPropsTable,
} from "@/components/docs/page-shell"

/**
 * Finance Widget — Saved Actions. Ported from AlignUI Finance Template (2026-05-19).
 * Source: components/widgets/widget-saved-actions.tsx + saved-action-item.tsx
 *
 * 4 rows: Rent $900 (water/blue) · Natalia's Tuition $750 (avatar) · Donation to TEMA $100 (donate/violet) · Gas $20 (gas/red).
 */

type SavedAction = {
  id: string
  name: string
  description: string
  transaction: number
  type?: "rent" | "tax" | "phone" | "internet" | "donate" | "electricity" | "gas" | "water" | "other"
  icon?: React.ElementType
  avatar?: { initials: string }
}

const SAVED: SavedAction[] = [
  { id: "rent", name: "Rent Payment", description: "Monthly rent payment.", transaction: 900, type: "water", icon: RiDropFill },
  { id: "tuition", name: "Natalia's Tuition", description: "Nat's university fee.", transaction: 750, avatar: { initials: "NA" } },
  { id: "donation", name: "Donation to TEMA", description: "In the name of our family.", transaction: 100, type: "donate", icon: RiHandHeartFill },
  { id: "gas", name: "Gas Bill Payment", description: "Monthly gas bill payment.", transaction: 20, type: "gas", icon: RiFireFill },
]

const TYPE_BG: Record<string, string> = {
  other: "bg-bg-white-0 text-text-sub-600 shadow-sm ring-1 ring-inset ring-stroke-soft-200",
  rent: "bg-success-lighter text-success-base",
  tax: "bg-feature-lighter text-feature-base",
  phone: "bg-warning-lighter text-warning-base",
  internet: "bg-information-lighter text-information-base",
  donate: "bg-highlighted-lighter text-highlighted-base",
  electricity: "bg-away-lighter text-away-base",
  gas: "bg-error-lighter text-error-base",
  water: "bg-verified-lighter text-verified-base",
}

const fmt = (v: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(v)

export default function FinanceSavedActionsWidgetPage() {
  return (
    <DocsPageShell>
      <DocsHeader
        category="Product Components / Widgets / Finance (deep)"
        title="Saved Actions"
        description="Quick re-pay list. Each row = tinted bubble OR avatar + label/description + neutral amount Badge + chevron CompactButton. Source ships 4 rows: Rent $900 / Tuition $750 / Donation $100 / Gas $20."
      />

      <DocsSection title="Full widget">
        <DocsExample
          title="4 saved actions"
          preview={
            <div className="max-w-md">
              <WidgetShell
                title={<><RiFlashlightLine className="size-4 text-icon-sub-600" /> Saved Actions</>}
                action={<Button tone="neutral" style="stroke" size="xs">See All</Button>}
              >
                <Divider />
                <div className="w-full pb-1 pt-3">
                  <div className="flex flex-col gap-0.5">
                    {SAVED.map((s) => <SavedActionRow key={s.id} action={s} />)}
                  </div>
                  <Button tone="neutral" style="stroke" size="sm" className="mt-3.5 w-full">
                    <RiAddLine /> Save a New Action
                  </Button>
                </div>
              </WidgetShell>
            </div>
          }
          code={`<SavedActions items={[
  { name: 'Rent Payment', amount: 900, type: 'water', icon: RiDropFill },
  { name: "Natalia's Tuition", amount: 750, avatar: '/.../natalia.png' },
  { name: 'Donation to TEMA', amount: 100, type: 'donate', icon: RiHandHeartFill },
  { name: 'Gas Bill Payment', amount: 20, type: 'gas', icon: RiFireFill },
]} />`}
        />
      </DocsSection>

      <DocsSection title="Row variants">
        <DocsExample
          title="Icon bubble vs Avatar"
          preview={
            <div className="max-w-sm space-y-1">
              <SavedActionRow action={SAVED[0]} />
              <SavedActionRow action={SAVED[1]} />
            </div>
          }
          code={`<SavedActionRow icon={RiDropFill} type="water" />
<SavedActionRow avatar="natalia.png" />`}
        />
      </DocsSection>

      <DocsSection title="Empty state">
        <DocsExample
          title="No saved actions"
          preview={
            <div className="max-w-md">
              <WidgetShell title={<><RiFlashlightLine className="size-4 text-icon-sub-600" /> Saved Actions</>}>
                <Divider />
                <div className="flex flex-col items-center gap-3 p-5 pt-8">
                  <RiFlashlightLine className="size-10 text-icon-soft-400" />
                  <p className="text-center text-sm text-text-soft-400">You do not have any saved actions.<br />Feel free to save one.</p>
                  <Button tone="neutral" style="stroke" size="xs"><RiAddLine /> Save a New Action</Button>
                </div>
              </WidgetShell>
            </div>
          }
          code={`<SavedActionsEmpty />`}
        />
      </DocsSection>

      <DocsSection title="API">
        <DocsPropsTable
          rows={[
            { name: "items", type: "SavedAction[]", description: "Rows — { name, description, amount, type?, icon?, avatar? }." },
            { name: "type", type: '"rent" | "tax" | "phone" | ... | "water" | "other"', description: "Drives the bubble tint when no avatar." },
            { name: "onSave", type: "() => void", description: "Bottom CTA — Save a New Action." },
          ]}
        />
      </DocsSection>

      <DocsSection title="Anatomy">
        <ul className="space-y-2 text-sm text-text-strong-950/90 list-disc pl-5">
          <li><strong>Row container</strong> — full-width rounded-xl button, hover bg-weak-50 + 12px horizontal pad.</li>
          <li><strong>Leading slot</strong> — 40px avatar (color=blue) OR 40px tinted bubble (per type).</li>
          <li><strong>Body</strong> — label-sm strong-950 name + paragraph-xs sub-600 description.</li>
          <li><strong>Amount</strong> — gray lighter Badge (small).</li>
          <li><strong>Chevron</strong> — ghost CompactButton.</li>
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

function SavedActionRow({ action }: { action: SavedAction }) {
  const Icon = action.icon
  return (
    <button type="button" className="flex w-full items-center gap-3 rounded-xl py-2 text-left transition hover:bg-bg-weak-50 hover:px-3">
      {action.avatar ? (
        <Avatar size="lg">
          <AvatarImage src="" />
          <AvatarFallback className="bg-(--state-information-light) text-(--state-information-dark)">{action.avatar.initials}</AvatarFallback>
        </Avatar>
      ) : (
        <div className={cn("flex size-10 shrink-0 items-center justify-center rounded-full", TYPE_BG[action.type ?? "other"])}>
          {Icon ? <Icon className="size-5" /> : null}
        </div>
      )}
      <div className="min-w-0 flex-1 space-y-0.5">
        <div className="truncate text-sm font-medium text-text-strong-950">{action.name}</div>
        <div className="truncate text-[11px] text-text-sub-600">{action.description}</div>
      </div>
      <Badge status="neutral" appearance="lighter">{fmt(action.transaction)}</Badge>
      <span
        aria-hidden
        className="inline-flex size-6 items-center justify-center rounded-md text-text-soft-400 hover:bg-bg-weak-50 hover:text-text-sub-600"
      >
        <RiArrowRightSLine className="size-4" />
      </span>
    </button>
  )
}
