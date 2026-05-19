"use client"

import * as React from "react"
import {
  RiArrowRightSLine as ChevronRight,
  RiLightbulbLine as Lightbulb,
  RiMore2Line as More,
} from "@remixicon/react"
import { Avatar, AvatarImage } from "@/registry/dash/ui/avatar"
import { Badge } from "@/registry/dash/ui/badge"
import { cn } from "@/registry/dash/lib/utils"
import {
  DocsPageShell,
  DocsHeader,
  DocsSection,
  DocsExample,
  DocsPropsTable,
} from "@/components/docs/page-shell"

/**
 * Subscription Rows — Figma verified 2026-05-19 (4 nodes — Type × State).
 *   3946:4046  Type=Payment, State=Default  (yellow-coin icon leading + Badge)
 *   3946:4061  Type=Avatar,  State=Default  (avatar leading + Badge)
 *   3946:4328  Type=Payment, State=Hover    (weak-bg variant)
 *   3946:4353  Type=Avatar,  State=Hover    (weak-bg variant)
 *
 * Row anatomy: leading 32px circle (icon or avatar) + title + description +
 * trailing Badge + chevron-right. Brand-tile + mono variants are local extras.
 */
export default function SubscriptionRowsWidgetPage() {
  return (
    <DocsPageShell>
      <DocsHeader
        category="Product Components / Widgets"
        title="Subscription Rows"
        description="Compact row primitive — leading (icon / brand / avatar / mono) + title + description + optional badge + trailing value + chevron. Reused in My Subscriptions and Recent Transactions widgets."
      />

      <DocsSection title="4 leading types">
        <DocsExample
          title="icon · brand · avatar · mono"
          preview={
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-w-2xl">
              <SubscriptionRow leading="icon" title="Insert title here…" date="Feb 12" price="$0.00" />
              <SubscriptionRow leading="brand-spotify" title="Spotify" date="May 12" price="$9.99" />
              <SubscriptionRow leading="avatar" title="Insert title here…" date="Feb 12" price="$0.00" />
              <SubscriptionRow leading="mono" title="Insert title here…" date="Feb 12" price="$0.00" />
            </div>
          }
          code={`<SubscriptionRow leading="brand-spotify" title="Spotify" price="$9.99" date="May 12" />`}
        />
      </DocsSection>

      <DocsSection title="2 layouts">
        <p className="text-sm text-text-sub-600 max-w-2xl">
          Compact (default) shows trailing price + date stacked. With badge variant trades the secondary description line for a status badge.
        </p>
        <DocsExample
          title="Compact + badge"
          preview={
            <div className="space-y-2 max-w-md">
              <SubscriptionRow leading="brand-spotify" title="Spotify Premium" date="May 12" price="$9.99" desc="Monthly · Auto-renew" />
              <SubscriptionRow leading="brand-spotify" title="Spotify Premium" price="$9.99" badge="Active" />
            </div>
          }
          code={`<SubscriptionRow leading="brand-spotify" title="Spotify Premium" price="$9.99" desc="Monthly · Auto-renew" />
<SubscriptionRow leading="brand-spotify" title="Spotify Premium" price="$9.99" badge="Active" />`}
        />
      </DocsSection>

      <DocsSection title="API">
        <DocsPropsTable
          rows={[
            { name: "leading", type: '"icon" | "avatar" | "brand-spotify" | "mono"', description: "Leading slot type." },
            { name: "title", type: "string", description: "Bold primary line." },
            { name: "desc", type: "string", description: "Secondary line beneath title (mutually exclusive with badge)." },
            { name: "price", type: "string", description: "Trailing tabular-numeric value." },
            { name: "date", type: "string", description: "Sub-line under price." },
            { name: "badge", type: "string", description: "When set, swaps the desc line for a success badge." },
          ]}
        />
      </DocsSection>

      <DocsSection title="Anatomy">
        <ul className="space-y-2 text-sm text-text-strong-950/90 list-disc pl-5">
          <li>Leading slot is always 28 × 28 (rounded full).</li>
          <li>Title 13px medium, description 11px sub-text. Both single-line + truncate.</li>
          <li>Trailing column right-aligns price (13px medium) + date (11px sub-text).</li>
          <li>Chevron-right at 16px, soft-icon tone.</li>
        </ul>
      </DocsSection>
    </DocsPageShell>
  )
}

function SubscriptionRow({
  leading = "icon",
  title,
  desc,
  price,
  date,
  badge,
}: {
  leading?: "icon" | "avatar" | "brand-spotify" | "mono"
  title: string
  desc?: string
  price: string
  date?: string
  badge?: string
}) {
  const leadingEl =
    leading === "avatar" ? (
      <Avatar size="sm"><AvatarImage src="https://i.pravatar.cc/40?u=sub" /></Avatar>
    ) : leading === "brand-spotify" ? (
      <span className="inline-flex size-7 items-center justify-center rounded-full bg-[#1DB954] text-white text-xs font-bold">♫</span>
    ) : leading === "mono" ? (
      <span className="inline-flex size-7 items-center justify-center rounded-full border border-stroke-soft-200 bg-bg-white-0">
        <More className="size-3.5 text-icon-soft-400" />
      </span>
    ) : (
      <span className="inline-flex size-7 items-center justify-center rounded-full bg-[#E0F2FE] text-[#0EA5E9]">
        <Lightbulb className="size-3.5" />
      </span>
    )

  return (
    <div className="flex items-center gap-2.5 rounded-lg hover:bg-bg-weak-50 p-2 text-xs">
      {leadingEl}
      <div className="flex-1 min-w-0">
        <div className="font-medium truncate text-sm">{title}</div>
        {badge ? (
          <Badge size="sm" appearance="lighter" status="success">{badge}</Badge>
        ) : (
          <div className="text-text-sub-600 truncate">{desc ?? "Insert description here…"}</div>
        )}
      </div>
      <div className="text-right">
        <div className="font-medium tabular-nums">{price}</div>
        {date ? <div className="text-text-sub-600">{date}</div> : null}
      </div>
      <ChevronRight className="size-4 text-text-soft-400" />
    </div>
  )
}
