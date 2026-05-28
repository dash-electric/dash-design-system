"use client"

import * as React from "react"
import {
  RiHomeSmile2Line as HomeIcon,
  RiBookOpenLine as BookIcon,
  RiHeartLine as HeartIcon,
  RiFireLine as FireIcon,
  RiAddLine as Plus,
  RiArrowRightSLine as ChevronRight,
  RiFlashlightFill as BoltIcon,
} from "@remixicon/react"
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
 * Saved Actions widget — Figma 1:1 (2 nodes verified 2026-05-19).
 *
 *   3946:4372    Saved Actions — 4-row loaded (Rent / Tuition / Donation / Gas Bill)
 *   3963:8666    Saved Actions — empty state (no saved actions yet)
 *
 * Real Figma anatomy: header "Saved Actions" + "See All" stroke button. Rows =
 * tinted-circle category icon + (name + description) + amount pill chip + chevron.
 * Bottom always renders a full-width "+ Save a New Action" CTA, even in loaded.
 */

type SavedAction = {
  id: string
  name: string
  subtitle: string
  amount: string
  icon: React.ElementType
  tint: string
  iconTint: string
}

const ACTIONS_PRIMARY: SavedAction[] = [
  { id: "rent", name: "Rent Payment", subtitle: "Monthly rent payment.", amount: "$940.00", icon: HomeIcon, tint: "bg-success-lighter", iconTint: "text-success-base" },
  { id: "tuition", name: "Natalia's Tuition", subtitle: "Nat's university fee.", amount: "$750.00", icon: BookIcon, tint: "bg-information-lighter", iconTint: "text-information-base" },
  { id: "donation", name: "Donation to TEMA", subtitle: "In the name of our family.", amount: "$100.00", icon: HeartIcon, tint: "bg-(--primary-alpha-10)", iconTint: "text-(--primary-base)" },
  { id: "gas", name: "Gas Bill Payment", subtitle: "Monthly gas bill payment.", amount: "$20.00", icon: FireIcon, tint: "bg-warning-lighter", iconTint: "text-warning-base" },
]

const ACTIONS_SECONDARY: SavedAction[] = [
  { id: "rent", name: "Rent Payment", subtitle: "Monthly rent payment.", amount: "$940.00", icon: HomeIcon, tint: "bg-success-lighter", iconTint: "text-success-base" },
  { id: "tuition", name: "Natalia's Tuition", subtitle: "Nat's university fee.", amount: "$750.00", icon: BookIcon, tint: "bg-information-lighter", iconTint: "text-information-base" },
]

export default function SavedActionsWidgetPage() {
  return (
    <DocsPageShell>
      <DocsHeader
        category="Product Components / Widgets"
        title="Saved Actions"
        description="Quick-launch list of saved payment actions. Each row = category icon avatar + name + descriptive subtitle + amount pill chip. A persistent + Save a New Action CTA renders below the list. Empty state replaces the body with illustration + the same CTA."
      />

      <DocsSection title="Loaded state — 4 saved actions">
        <p className="text-sm text-text-sub-600 max-w-2xl">
          Default render — 4 saved actions (Rent / Tuition / Donation / Gas Bill). Each row is tappable to re-run the
          saved transfer. Bottom CTA always present so a new action can be saved without an empty list.
        </p>
        <DocsExample
          title="4-row list"
          preview={
            <div className="max-w-sm">
              <SavedActionsLoaded actions={ACTIONS_PRIMARY} />
            </div>
          }
          code={`<SavedActions
  actions={[
    { id: "rent", name: "Rent Payment", subtitle: "Monthly rent payment.", amount: "$940.00" },
    { id: "tuition", name: "Natalia's Tuition", subtitle: "Nat's university fee.", amount: "$750.00" },
    { id: "donation", name: "Donation to TEMA", subtitle: "In the name of our family.", amount: "$100.00" },
    { id: "gas", name: "Gas Bill Payment", subtitle: "Monthly gas bill payment.", amount: "$20.00" },
  ]}
/>`}
        />
      </DocsSection>

      <DocsSection title="Loaded state — 2 actions">
        <p className="text-sm text-text-sub-600 max-w-2xl">
          Same shell with fewer rows. Confirms list density at 2 rows without dropping the persistent CTA.
        </p>
        <DocsExample
          title="2-row list"
          preview={
            <div className="max-w-sm">
              <SavedActionsLoaded actions={ACTIONS_SECONDARY} />
            </div>
          }
          code={`<SavedActions actions={[/* Rent, Tuition */]} />`}
        />
      </DocsSection>

      <DocsSection title="Empty state">
        <p className="text-sm text-text-sub-600 max-w-2xl">
          Renders when no actions have been saved yet. Body swaps to illustration + Save a New Action stroke CTA.
        </p>
        <DocsExample
          title="No saved actions"
          preview={
            <div className="max-w-sm">
              <SavedActionsEmpty />
            </div>
          }
          code={`<SavedActions state="empty" />`}
        />
      </DocsSection>

      <DocsSection title="API">
        <DocsPropsTable
          rows={[
            { name: "actions", type: "SavedAction[]", description: "Saved actions — { id, name, subtitle, amount, icon, tint, iconTint }." },
            { name: "action.name", type: "string", description: "Action label (line 1)." },
            { name: "action.subtitle", type: "string", description: "Descriptive line 2 (purpose / cadence)." },
            { name: "action.amount", type: "string", description: "Pre-formatted amount shown as a pill chip." },
            { name: "action.icon", type: "ElementType", description: "Leading category icon (Remix icon component)." },
            { name: "action.tint", type: "string", description: "Background utility for the icon circle (e.g. bg-success-lighter)." },
            { name: "action.iconTint", type: "string", description: "Foreground utility for the icon (e.g. text-success-base)." },
            { name: "onRun", type: "(id: string) => void", description: "Fires when a row is tapped." },
            { name: "onAddNew", type: "() => void", description: "Fires when the Save a New Action CTA is pressed." },
            { name: "state", type: '"loaded" | "empty"', defaultValue: '"loaded"', description: "Loaded renders the list; empty renders the illustration + CTA." },
          ]}
        />
      </DocsSection>

      <DocsSection title="Anatomy">
        <ul className="space-y-2 text-sm text-text-strong-950/90 list-disc pl-6">
          <li><strong>Header</strong> — title + See All stroke button.</li>
          <li><strong>Row</strong> — tinted icon circle + (name + subtitle) + amount pill chip + chevron.</li>
          <li><strong>Divider</strong> — soft 1px between rows.</li>
          <li><strong>Persistent CTA</strong> — full-width Save a New Action stroke button below the list.</li>
          <li><strong>Empty</strong> — circular illustration + 2-line copy + same Save a New Action CTA.</li>
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
      <div className="flex items-center gap-2 pb-2 border-b border-stroke-soft-200">
        <div className="text-sm font-medium text-text-strong-950 flex-1 inline-flex items-center gap-1.5">
          {title}
        </div>
        {trailing}
      </div>
      {children}
    </div>
  )
}

function SavedActionRow({ action }: { action: SavedAction }) {
  const Icon = action.icon
  return (
    <button
      type="button"
      className="flex w-full items-center gap-3 rounded-lg px-1 py-2 text-left hover:bg-bg-weak-50 transition-colors"
    >
      <span
        className={cn(
          "inline-flex size-9 items-center justify-center rounded-full",
          action.tint,
        )}
      >
        <Icon className={cn("size-4", action.iconTint)} />
      </span>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-text-strong-950 truncate">
          {action.name}
        </div>
        <div className="text-xs text-text-sub-600 truncate">{action.subtitle}</div>
      </div>
      <span className="inline-flex items-center rounded-full bg-bg-weak-50 px-2.5 py-1 text-xs font-medium tabular-nums text-text-strong-950">
        {action.amount}
      </span>
      <ChevronRight className="size-4 text-text-soft-400" aria-hidden />
    </button>
  )
}

function SavedActionsLoaded({ actions }: { actions: SavedAction[] }) {
  return (
    <WidgetShell
      title={
        <>
          <BoltIcon className="size-4 text-icon-sub-600" />
          Saved Actions
        </>
      }
      trailing={
        <Button style="stroke" tone="neutral" size="xs">
          See All
        </Button>
      }
    >
      <ul className="divide-y divide-stroke-soft-200">
        {actions.map((a) => (
          <li key={a.id}>
            <SavedActionRow action={a} />
          </li>
        ))}
      </ul>
      <Button style="stroke" tone="neutral" size="sm" className="w-full">
        <Plus className="size-3.5" />
        Save a New Action
      </Button>
    </WidgetShell>
  )
}

function SavedActionsEmpty() {
  return (
    <WidgetShell
      title={
        <>
          <BoltIcon className="size-4 text-icon-sub-600" />
          Saved Actions
        </>
      }
      trailing={null}
    >
      <div className="flex flex-col items-center gap-3 py-6 text-center">
        <EmptyStateIllustration kind="saved-actions" />
        <div className="text-xs text-text-sub-600 max-w-[28ch] leading-relaxed">
          You do not have any saved actions.
          <br />
          Feel free to save one.
        </div>
      </div>
      <Button style="stroke" tone="neutral" size="sm" className="w-full">
        <Plus className="size-3.5" />
        Save a New Action
      </Button>
    </WidgetShell>
  )
}
