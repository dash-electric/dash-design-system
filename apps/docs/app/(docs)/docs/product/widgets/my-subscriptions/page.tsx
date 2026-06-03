"use client"

import * as React from "react"
import {
  RiMore2Line as More,
  RiSpotifyLine as Spotify,
  RiAppleLine as Apple,
  RiYoutubeLine as Youtube,
  RiNetflixLine as Netflix,
  RiAmazonFill as AmazonI,
  RiMusic2Line as MusicIcon,
} from "@remixicon/react"
import { Avatar, AvatarFallback, AvatarImage } from "@/registry/dash/ui/avatar"
import { Badge } from "@/registry/dash/ui/badge"
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
 * My Subscriptions widget — Figma 1:1 (re-verified 2026-05-19).
 *
 *   3946:17206   My Subscriptions — loaded (promo banner + 3 subscription rows w/ status badges)
 *   3963:9458    My Subscriptions — empty ("You do not have any subscriptions yet. Feel free to explore.")
 *
 * Real Figma anatomy: header "My Subscriptions" + "See All" stroke button. Body
 * starts with an Apple-Music style promo banner (tinted card + headline + Learn
 * More link), then a list of subscription rows. Each row = brand circle + name +
 * "$X /period" + status badge (Paid / Expiring / Paused) + 3-dot menu. Row 1 in
 * Figma is "Salary Deposit" w/ spotify-green avatar — kept verbatim for fidelity.
 * Empty state drops the See All button and renders Explore CTA.
 */

type SubStatus = "paid" | "expiring" | "paused"

type Subscription = {
  id: string
  name: string
  amount: string
  period: "month" | "year"
  status: SubStatus
  brand: "spotify" | "youtube" | "amazon" | "netflix" | "apple"
}

const SUBS_PRIMARY: Subscription[] = [
  { id: "salary", name: "Salary Deposit", amount: "$7.99", period: "month", status: "paid", brand: "spotify" },
  { id: "youtube", name: "Youtube Music", amount: "$79.99", period: "year", status: "expiring", brand: "youtube" },
  { id: "prime", name: "Prime Video", amount: "$9.99", period: "month", status: "paused", brand: "amazon" },
]

const SUBS_SECONDARY: Subscription[] = [
  { id: "netflix", name: "Netflix", amount: "$15.49", period: "month", status: "paid", brand: "netflix" },
  { id: "apple", name: "Apple Music", amount: "$9.99", period: "month", status: "paid", brand: "apple" },
  { id: "youtube", name: "Youtube Premium", amount: "$13.99", period: "month", status: "expiring", brand: "youtube" },
]

const STATUS_LABEL: Record<SubStatus, string> = {
  paid: "Paid",
  expiring: "Expiring",
  paused: "Paused",
}

function statusBadge(status: SubStatus) {
  switch (status) {
    case "paid":
      return (
        <Badge size="sm" appearance="lighter" status="success">
          {STATUS_LABEL[status]}
        </Badge>
      )
    case "expiring":
      return (
        <Badge size="sm" appearance="lighter" status="stable">
          {STATUS_LABEL[status]}
        </Badge>
      )
    case "paused":
      return (
        <Badge size="sm" appearance="lighter" status="warning">
          {STATUS_LABEL[status]}
        </Badge>
      )
  }
}

function BrandCircle({ brand }: { brand: Subscription["brand"] }) {
  const cls = "inline-flex size-9 items-center justify-center rounded-full text-white"
  switch (brand) {
    case "spotify":
      return (
        <span className={cn(cls, "bg-[#1DB954]")}>
          <Spotify className="size-4" />
        </span>
      )
    case "youtube":
      return (
        <span className={cn(cls, "bg-[#FF0000]")}>
          <Youtube className="size-4" />
        </span>
      )
    case "amazon":
      return (
        <span className={cn(cls, "bg-[#FF9900]")}>
          <AmazonI className="size-4" />
        </span>
      )
    case "netflix":
      return (
        <span className={cn(cls, "bg-[#E50914]")}>
          <Netflix className="size-4" />
        </span>
      )
    case "apple":
      return (
        <span className={cn(cls, "bg-bg-strong-950")}>
          <Apple className="size-4" />
        </span>
      )
  }
}

export default function MySubscriptionsWidgetPage() {
  return (
    <DocsPageShell>
      <DocsHeader
        category="Product Components / Widgets"
        title="My Subscriptions"
        description="Recurring billing list — optional top promo banner (cross-sell), then a list of subscription rows. Each row pairs a brand-tinted circle with name, recurring price, and a status badge (Paid / Expiring / Paused). 3-dot menu opens row actions."
      />

      <DocsSection title="Loaded state — with promo banner">
        <p className="text-sm text-text-sub-600 max-w-2xl">
          Default render — promotional banner advertising an Apple Music discount, followed by 3 subscription rows
          (Spotify Paid, Youtube Music Expiring, Prime Video Paused).
        </p>
        <DocsExample
          title="Promo + 3 rows"
          preview={
            <div className="max-w-sm">
              <MySubscriptionsLoaded promo subscriptions={SUBS_PRIMARY} />
            </div>
          }
          code={`<MySubscriptions
  promo={{ title: "50% discount on Apple Music", subtitle: "For only $4.99 per month!" }}
  subscriptions={[
    { id: "salary", name: "Salary Deposit", amount: "$7.99", period: "month", status: "paid", brand: "spotify" },
    { id: "youtube", name: "Youtube Music", amount: "$79.99", period: "year", status: "expiring", brand: "youtube" },
    { id: "prime", name: "Prime Video", amount: "$9.99", period: "month", status: "paused", brand: "amazon" },
  ]}
/>`}
        />
      </DocsSection>

      <DocsSection title="Loaded state — no promo">
        <p className="text-sm text-text-sub-600 max-w-2xl">
          Same shell without the promo banner — used when no cross-sell is active.
        </p>
        <DocsExample
          title="3 rows, no promo"
          preview={
            <div className="max-w-sm">
              <MySubscriptionsLoaded subscriptions={SUBS_SECONDARY} />
            </div>
          }
          code={`<MySubscriptions subscriptions={[/* Netflix, Apple Music, Youtube */]} />`}
        />
      </DocsSection>

      <DocsSection title="Empty state">
        <p className="text-sm text-text-sub-600 max-w-2xl">
          Renders when no subscriptions are linked. Body swaps to illustration + Add Subscription stroke CTA.
        </p>
        <DocsExample
          title="No subscriptions"
          preview={
            <div className="max-w-sm">
              <MySubscriptionsEmpty />
            </div>
          }
          code={`<MySubscriptions state="empty" />`}
        />
      </DocsSection>

      <DocsSection title="API">
        <DocsPropsTable
          rows={[
            { name: "promo", type: "{ title: string; subtitle: string } | boolean", description: "Optional cross-sell banner above the list." },
            { name: "subscriptions", type: "Subscription[]", description: "Active subscriptions — { id, name, amount, period, status, brand }." },
            { name: "subscription.amount", type: "string", description: "Pre-formatted recurring amount (e.g. \"$7.99\")." },
            { name: "subscription.period", type: '"month" | "year"', description: "Billing cadence — drives the suffix string." },
            { name: "subscription.status", type: '"paid" | "expiring" | "paused"', description: "Status badge tone." },
            { name: "subscription.brand", type: '"spotify" | "youtube" | "amazon" | "netflix" | "apple"', description: "Brand circle tint + glyph." },
            { name: "onRowAction", type: "(id: string) => void", description: "Fires when the 3-dot menu is opened." },
            { name: "state", type: '"loaded" | "empty"', defaultValue: '"loaded"', description: "Loaded renders banner + list; empty renders illustration + CTA." },
          ]}
        />
      </DocsSection>

      <DocsSection title="Anatomy">
        <ul className="space-y-2 text-sm text-text-strong-950/90 list-disc pl-6">
          <li><strong>Header</strong> — title + See All stroke button.</li>
          <li><strong>Promo banner</strong> — soft tinted card, brand circle on the left, headline + Learn More link.</li>
          <li><strong>Row</strong> — brand circle + (name + price) + status badge + 3-dot menu.</li>
          <li><strong>Status</strong> — Paid (success), Expiring (neutral), Paused (warning).</li>
          <li><strong>Empty</strong> — muted illustration + 2-line copy + Add Subscription stroke button.</li>
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

function PromoBanner() {
  return (
    <div className="relative overflow-hidden rounded-xl bg-bg-weak-50 px-3 py-3">
      <div className="flex items-start gap-3">
        <span className="inline-flex size-9 items-center justify-center rounded-full bg-bg-white-0 ring-1 ring-(--primary-alpha-24)">
          <MusicIcon className="size-4 text-(--primary-base)" />
        </span>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-semibold text-text-strong-950">
            50% discount on Apple Music
          </div>
          <div className="text-xs text-text-sub-600">
            For only $4.99 per month!{" "}
            <a className="underline text-text-strong-950 cursor-pointer">Learn More</a>
          </div>
        </div>
      </div>
      <div
        aria-hidden
        className="pointer-events-none absolute -right-6 -top-2 size-20 rounded-full bg-(--primary-alpha-10) blur-xl"
      />
    </div>
  )
}

function SubscriptionRow({ sub }: { sub: Subscription }) {
  return (
    <div className="flex items-center gap-3 py-2.5">
      <BrandCircle brand={sub.brand} />
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-text-strong-950 truncate">
          {sub.name}
        </div>
        <div className="text-xs text-text-sub-600 tabular-nums">
          {sub.amount}{" "}
          <span className="text-text-soft-400">/{sub.period}</span>
        </div>
      </div>
      {statusBadge(sub.status)}
      <button
        type="button"
        className="inline-flex size-7 items-center justify-center rounded-md text-text-soft-400 hover:bg-bg-weak-50"
        aria-label="More actions"
      >
        <More className="size-4" />
      </button>
    </div>
  )
}

function MySubscriptionsLoaded({
  promo,
  subscriptions,
}: {
  promo?: boolean
  subscriptions: Subscription[]
}) {
  return (
    <WidgetShell
      title="My Subscriptions"
      trailing={
        <Button style="stroke" tone="neutral" size="xs">
          See All
        </Button>
      }
    >
      {promo ? <PromoBanner /> : null}
      <ul className="divide-y divide-stroke-soft-200">
        {subscriptions.map((s) => (
          <li key={s.id}>
            <SubscriptionRow sub={s} />
          </li>
        ))}
      </ul>
    </WidgetShell>
  )
}

function MySubscriptionsEmpty() {
  return (
    <WidgetShell title="My Subscriptions" trailing={null}>
      <div className="flex flex-col items-center gap-3 py-8 text-center border-t border-stroke-soft-200 pt-6">
        <EmptyStateIllustration kind="my-subscriptions" />
        <div className="text-xs text-text-sub-600 max-w-[28ch] leading-relaxed">
          You do not have any subscriptions yet.
          <br />
          Feel free to explore.
        </div>
        <Button style="stroke" tone="neutral" size="xs">
          Explore
        </Button>
      </div>
    </WidgetShell>
  )
}

// Re-export inferred Avatar/AvatarFallback/AvatarImage to keep TSX prune happy in build
type _AvatarRef = typeof Avatar | typeof AvatarFallback | typeof AvatarImage
