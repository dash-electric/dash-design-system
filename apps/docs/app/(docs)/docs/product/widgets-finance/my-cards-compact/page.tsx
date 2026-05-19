"use client"

import * as React from "react"
import {
  RiBankCardLine,
  RiAddLine,
  RiArrowRightSLine,
  RiCheckboxCircleFill,
  RiWifiLine,
} from "@remixicon/react"
import { Button } from "@/registry/dash/ui/button"
import { ButtonGroup, ButtonGroupItem } from "@/registry/dash/ui/button-group"
import { CompactButton } from "@/registry/dash/ui/compact-button"
import { ProgressCircle } from "@/registry/dash/ui/progress-circle"
import { StatusBadge } from "@/registry/dash/ui/badge"
import { cn } from "@/registry/dash/lib/utils"
import {
  DocsPageShell,
  DocsHeader,
  DocsSection,
  DocsExample,
  DocsPropsTable,
} from "@/components/docs/page-shell"

/**
 * Finance Widget — My Cards Compact. Ported from AlignUI Finance Template (2026-05-19).
 * Source: components/widgets/widget-my-cards-compact.tsx + virtual-card.tsx
 *
 * Compact = single virtual card carousel (no Virtual/Physical segmented), with a Daily/Weekly/Monthly
 * ButtonGroup toggle and a ProgressCircle (50%) showing spending limit.
 */

const CARDS = [
  { id: "savings-card", status: "active" as const, name: "Savings Card", balance: 16058.94, logo: "apex" },
  { id: "daily-spending-card", status: "inactive" as const, name: "Daily Spending Card", balance: 11.25, logo: "solaris" },
]

export default function FinanceMyCardsCompactWidgetPage() {
  const [active, setActive] = React.useState(CARDS[0].id)
  const [period, setPeriod] = React.useState("weekly")
  return (
    <DocsPageShell>
      <DocsHeader
        category="Product Components / Widgets / Finance (deep)"
        title="My Cards (Compact)"
        description="Single virtual-card carousel with active/inactive status pill, a Daily/Weekly/Monthly toggle, and a 48px ProgressCircle previewing the period spending limit."
      />

      <DocsSection title="Full widget">
        <DocsExample
          title="Savings Card · $16,058.94"
          preview={
            <div className="max-w-sm">
              <WidgetShell
                title={<><RiBankCardLine className="size-4 text-icon-sub-600" /> My Cards</>}
                action={<Button tone="neutral" style="stroke" size="xs"><RiAddLine /> Add Card</Button>}
              >
                <Carousel active={active} onActive={setActive} cards={CARDS} />
                <ButtonGroup className="mt-4 w-full">
                  {(["daily", "weekly", "monthly"] as const).map((p) => (
                    <ButtonGroupItem
                      key={p}
                      size="xs"
                      active={period === p}
                      className="flex-1 capitalize"
                      onClick={() => setPeriod(p)}
                    >
                      {p}
                    </ButtonGroupItem>
                  ))}
                </ButtonGroup>
                <div className="mt-5 flex items-center gap-4">
                  <ProgressCircle value={50} size={48} showLabel={false} />
                  <div className="flex-1">
                    <div className="text-xs text-text-sub-600">Spending Limit</div>
                    <div className="mt-1 flex items-baseline gap-1">
                      <span className="text-lg font-medium text-text-strong-950 tabular-nums">$1,500.00</span>
                      <span className="text-[10px] text-text-soft-400">/ {period}</span>
                    </div>
                  </div>
                  <CompactButton variant="stroke" size="md" aria-label="Adjust limit">
                    <RiArrowRightSLine />
                  </CompactButton>
                </div>
              </WidgetShell>
            </div>
          }
          code={`<MyCardsCompact cards={virtualCardsData} period="weekly" limit={1500} progress={50} />`}
        />
      </DocsSection>

      <DocsSection title="Virtual card anatomy">
        <DocsExample
          title="Active vs Inactive"
          preview={
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl">
              <VirtualCard {...CARDS[0]} />
              <VirtualCard {...CARDS[1]} />
            </div>
          }
          code={`<VirtualCard id="savings-card" status="active" name="Savings Card" balance={16058.94} logo="apex" />`}
        />
      </DocsSection>

      <DocsSection title="Empty state">
        <DocsExample
          title="No cards"
          preview={
            <div className="max-w-sm">
              <WidgetShell
                title={<><RiBankCardLine className="size-4 text-icon-sub-600" /> My Cards</>}
                action={<Button tone="neutral" style="stroke" size="xs"><RiAddLine /> Add Card</Button>}
              >
                <div className="flex flex-col items-center gap-3 p-5">
                  <RiBankCardLine className="size-10 text-icon-soft-400" />
                  <p className="text-center text-sm text-text-soft-400">You do not have any cards yet.<br />Click the button to add one.</p>
                  <Button tone="neutral" style="stroke" size="xs"><RiAddLine /> Add Card</Button>
                </div>
              </WidgetShell>
            </div>
          }
          code={`<MyCardsCompactEmpty />`}
        />
      </DocsSection>

      <DocsSection title="API">
        <DocsPropsTable
          rows={[
            { name: "cards", type: "TypeVirtualCard[]", description: "Carousel of virtual cards. Source ships 2 cards." },
            { name: "period", type: '"daily" | "weekly" | "monthly"', defaultValue: '"weekly"', description: "Active toggle in the ButtonGroup." },
            { name: "limit", type: "number", defaultValue: "1500", description: "Spending limit number in the side panel." },
            { name: "progress", type: "number", defaultValue: "50", description: "ProgressCircle fill (0–100)." },
          ]}
        />
      </DocsSection>

      <DocsSection title="Anatomy">
        <ul className="space-y-2 text-sm text-text-strong-950/90 list-disc pl-5">
          <li><strong>Virtual card</strong> — 188px tall, max-w-96. Top row = card brand logo + RiWifiLine (rotated 90°) + Active/Inactive StatusBadge + mastercard glyph (right). Bottom = card name + title-h4 balance.</li>
          <li><strong>ButtonGroup</strong> — 3 segments xxsmall, full-width, default active = Weekly.</li>
          <li><strong>Bottom row</strong> — 48px ProgressCircle (50%) + "Spending Limit" $1,500.00 / week + Compact stroke chevron CompactButton.</li>
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
    <div className={cn("rounded-2xl border border-stroke-soft-200 bg-bg-white-0 p-4 pb-5 shadow-sm", className)}>
      <div className="flex items-center gap-2 min-h-8 mb-3">
        <div className="flex flex-1 items-center gap-2 text-sm font-medium text-text-strong-950">{title}</div>
        {action}
      </div>
      {children}
    </div>
  )
}

function Carousel({
  active,
  onActive,
  cards,
}: {
  active: string
  onActive: (id: string) => void
  cards: typeof CARDS
}) {
  const idx = cards.findIndex((c) => c.id === active)
  const current = cards[idx] ?? cards[0]
  return (
    <div className="space-y-2">
      <VirtualCard {...current} />
      <div className="flex items-center justify-center gap-1.5">
        {cards.map((c) => (
          <button
            key={c.id}
            onClick={() => onActive(c.id)}
            className={cn(
              "h-1.5 rounded-full transition-all",
              c.id === active ? "w-6 bg-text-strong-950" : "w-1.5 bg-bg-soft-200",
            )}
            aria-label={`Show ${c.name}`}
          />
        ))}
      </div>
    </div>
  )
}

function VirtualCard({
  id,
  status,
  balance,
  name,
}: {
  id: string
  status: "active" | "inactive"
  balance: number
  name: string
  logo?: string
}) {
  return (
    <div
      data-card-id={id}
      className={cn(
        "relative mx-auto flex h-[188px] w-full max-w-96 shrink-0 flex-col gap-3 rounded-2xl bg-bg-white-0 p-5 pb-4 ring-1 ring-inset ring-stroke-soft-200",
      )}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="inline-flex size-8 items-center justify-center rounded-md bg-bg-weak-50 text-[10px] font-bold uppercase text-text-sub-600">
              APX
            </span>
            <RiWifiLine className="size-6 rotate-90 text-text-soft-400" />
          </div>
          {status === "active" ? (
            <StatusBadge status="success" variant="icon-stroke" icon={<RiCheckboxCircleFill />}>Active</StatusBadge>
          ) : (
            <StatusBadge status="faded" variant="icon-stroke" icon={<RiCheckboxCircleFill />}>Inactive</StatusBadge>
          )}
        </div>
        <span className="inline-flex h-5 items-center rounded-sm bg-bg-strong-950 px-1.5 text-[10px] font-bold uppercase text-static-white">
          MC
        </span>
      </div>
      <div className="mt-auto flex flex-col gap-1">
        <div className="text-xs text-text-sub-600">{name}</div>
        <div className="text-2xl font-medium tabular-nums text-text-strong-950">
          {new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(balance)}
        </div>
      </div>
      {/* Decorative diagonal SVG */}
      <svg className="absolute right-0 top-0 pointer-events-none" width="94" height="129" viewBox="0 0 94 129" fill="none">
        <path className="stroke-stroke-soft-200" d="M137.386-140.5h159.669c7.952 0 12.866 8.673 8.779 15.494L196.6 57.309A20.966 20.966 0 0 1 178.614 67.5H18.944c-7.951 0-12.865-8.673-8.778-15.494L119.4-130.309a20.966 20.966 0 0 1 17.986-10.191Z" />
        <path className="stroke-stroke-soft-200" d="M175.386-79.5h159.669c7.952 0 12.866 8.673 8.779 15.494L234.6 118.309a20.966 20.966 0 0 1-17.986 10.191H56.944c-7.952 0-12.865-8.673-8.778-15.494L157.4-69.309A20.966 20.966 0 0 1 175.386-79.5Z" />
      </svg>
    </div>
  )
}
