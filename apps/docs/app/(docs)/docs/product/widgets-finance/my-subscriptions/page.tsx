"use client"

import * as React from "react"
import { RiFileListLine, RiMore2Line } from "@remixicon/react"
import { Button } from "@/registry/dash/ui/button"
import { Badge } from "@/registry/dash/ui/badge"
import { Divider } from "@/registry/dash/ui/divider"
import { LinkButton } from "@/registry/dash/ui/link-button"
import { cn } from "@/registry/dash/lib/utils"
import {
  DocsPageShell,
  DocsHeader,
  DocsSection,
  DocsExample,
  DocsPropsTable,
} from "@/components/docs/page-shell"

/**
 * Finance Widget — My Subscriptions. Ported from AlignUI Finance Template (2026-05-19).
 * Source: components/widgets/widget-my-subscriptions.tsx
 *
 * Promo banner (Apple Music 50% off) + 3 subscription rows (Spotify Paid / Youtube Music Expiring / Prime Video Paused).
 */

const SUBS = [
  { id: "spotify", name: "Salary Deposit", brand: "Spotify", price: 7.99, period: "month", status: "Paid", color: "success" as const },
  { id: "yt-music", name: "Youtube Music", brand: "Youtube Music", price: 79.99, period: "year", status: "Expiring", color: "neutral" as const },
  { id: "prime", name: "Prime Video", brand: "Amazon Prime", price: 9.99, period: "month", status: "Paused", color: "warning" as const },
]

export default function FinanceMySubscriptionsWidgetPage() {
  return (
    <DocsPageShell>
      <DocsHeader
        category="Product Components / Widgets / Finance (deep)"
        title="My Subscriptions"
        description="Promo banner + 3 subscription rows (brand glyph + name + $ / period + status badge). Source pins Apple Music as the promo header and Spotify / Youtube Music / Prime Video as the rows."
      />

      <DocsSection title="Full widget">
        <DocsExample
          title="3 subscriptions — Apple Music promo"
          preview={
            <div className="max-w-md">
              <WidgetShell
                title={<><RiFileListLine className="size-4 text-icon-sub-600" /> My Subscriptions</>}
                action={<Button tone="neutral" style="stroke" size="xs">See All</Button>}
              >
                <PromoBanner />
                <div className="mt-4 flex flex-col gap-2">
                  {SUBS.map((s, i) => (
                    <React.Fragment key={s.id}>
                      <SubRow {...s} />
                      {i < SUBS.length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </div>
              </WidgetShell>
            </div>
          }
          code={`<MySubscriptions promo={<AppleMusicPromo />} subscriptions={[
  { brand: 'Spotify', price: 7.99, period: 'month', status: 'Paid' },
  { brand: 'Youtube Music', price: 79.99, period: 'year', status: 'Expiring' },
  { brand: 'Amazon Prime', price: 9.99, period: 'month', status: 'Paused' },
]} />`}
          />
        </DocsSection>

      <DocsSection title="Status variants">
        <DocsExample
          title="Paid / Expiring / Paused"
          preview={
            <div className="flex flex-wrap items-center gap-3">
              <Badge status="success" appearance="lighter">Paid</Badge>
              <Badge status="neutral" appearance="lighter">Expiring</Badge>
              <Badge status="warning" appearance="lighter">Paused</Badge>
              <Badge status="error" appearance="lighter">Failed</Badge>
            </div>
          }
          code={`<Badge status="success" appearance="lighter">Paid</Badge>`}
        />
      </DocsSection>

      <DocsSection title="Empty state">
        <DocsExample
          title="No subscriptions"
          preview={
            <div className="max-w-md">
              <WidgetShell title={<><RiFileListLine className="size-4 text-icon-sub-600" /> My Subscriptions</>}>
                <Divider />
                <div className="flex flex-col items-center gap-3 p-6 pt-8">
                  <RiFileListLine className="size-10 text-icon-soft-400" />
                  <p className="text-center text-sm text-text-soft-400">You do not have any subscriptions yet.<br />Feel free to explore.</p>
                  <Button tone="neutral" style="stroke" size="xs">Explore</Button>
                </div>
              </WidgetShell>
            </div>
          }
          code={`<MySubscriptionsEmpty />`}
        />
      </DocsSection>

      <DocsSection title="API">
        <DocsPropsTable
          rows={[
            { name: "subscriptions", type: "Sub[]", description: "Rows: { id, brand, price, period, status, color }." },
            { name: "promo", type: "ReactNode", description: "Banner above the list — source uses Apple Music 50% off ad." },
            { name: "onAction", type: "(sub: Sub) => void", description: "More menu click handler per row." },
          ]}
        />
      </DocsSection>

      <DocsSection title="Anatomy">
        <ul className="space-y-2 text-sm text-text-strong-950/90 list-disc pl-6">
          <li><strong>Promo banner</strong> — 124px tall rounded-xl bg-weak-50 panel. Brand glyph in upper-left, faded duplicate glyph bleeding off the right edge.</li>
          <li><strong>Sub row</strong> — 40px circular brand bubble + 2-line label (paragraph-xs sub-600 + price/period) + status Badge + ghost xs IconButton.</li>
          <li><strong>Status badges</strong> — Paid (success/lighter green), Expiring (gray/lighter), Paused (warning/lighter orange).</li>
          <li><strong>Divider</strong> — `line-spacing` divider between rows.</li>
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

function PromoBanner() {
  return (
    <div className="relative h-[124px] overflow-hidden rounded-xl bg-bg-weak-50 p-4">
      {/* Faded large brand glyph bleeding off right */}
      <span
        aria-hidden
        className="pointer-events-none absolute -right-4 -top-6 size-40 rounded-3xl"
        style={{
          background:
            "linear-gradient(135deg, #FA243C 0%, #FA243C 25%, #BC3CD8 50%, #6B30F6 75%, #2A53F2 100%)",
          opacity: 0.18,
        }}
      />
      <div className="relative flex flex-col gap-4">
        <span
          aria-hidden
          className="inline-flex size-8 items-center justify-center rounded-md text-static-white text-xs font-bold"
          style={{ background: "linear-gradient(135deg, #FA243C 0%, #BC3CD8 50%, #2A53F2 100%)" }}
        ></span>
        <div>
          <div className="text-sm font-medium text-text-strong-950">50% discount on Apple Music</div>
          <div className="mt-1 text-xs text-text-sub-600">
            For only $4.99 per month!{" "}
            <LinkButton tone="muted" size="sm" underline="always" className="ml-1">Learn More</LinkButton>
          </div>
        </div>
      </div>
    </div>
  )
}

function SubRow({
  brand,
  price,
  period,
  status,
  color,
}: {
  brand: string
  price: number
  period: string
  status: string
  color: "success" | "neutral" | "warning"
}) {
  const initial = brand.charAt(0)
  return (
    <div className="flex w-full items-center gap-3">
      <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-bg-white-0 shadow-sm ring-1 ring-inset ring-stroke-soft-200 text-xs font-bold text-text-sub-600">
        {initial}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-xs text-text-sub-600 truncate">{brand}</div>
        <div className="mt-0.5 flex items-baseline">
          <span className="text-sm font-medium text-text-strong-950 tabular-nums">${price.toFixed(2)}</span>
          <span className="ml-1 text-[10px] text-text-soft-400">/{period}</span>
        </div>
      </div>
      <Badge status={color} appearance="lighter">{status}</Badge>
      <Button tone="neutral" style="ghost" size="xs" aria-label="More"><RiMore2Line /></Button>
    </div>
  )
}
