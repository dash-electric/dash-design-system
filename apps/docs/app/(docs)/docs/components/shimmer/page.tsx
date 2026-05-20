"use client"

import * as React from "react"
import { Shimmer } from "@/registry/dash/ui/shimmer"
import {
  DocsPageShell,
  DocsHeader,
  DocsSection,
  DocsExample,
  DocsPropsTable,
} from "@/components/docs/page-shell"
import { DocsCode } from "@/components/docs/code-block"

/**
 * Shimmer — Ported from Dash Next Portal v2 (2026-05-19).
 * Source: components/ui/shimmer.tsx
 *
 * A lower-level loading primitive: takes className for shape/size, owns the
 * gradient + animation. Compose into table/card/analytics skeletons. Dash already
 * ships a `Skeleton` primitive — Shimmer is the slightly different "moving
 * highlight" variant (200% gradient pan) that Next Portal uses in tables.
 */

// Composed examples — direct ports of Next Portal's table/card skeletons.
function AnalyticsCardSkeleton() {
  return (
    <div className="flex flex-col gap-1 rounded-xl border border-stroke-soft-200 p-3">
      <Shimmer className="h-4 w-16 rounded" />
      <Shimmer className="mt-1 h-5 w-8 rounded" />
    </div>
  )
}

function DeliveryCardSkeleton() {
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-stroke-soft-200 bg-bg-white-0 p-4">
      <div className="flex items-start justify-between gap-2">
        <Shimmer className="h-4 w-32 rounded" />
        <Shimmer className="h-5 w-16 rounded-full" />
      </div>
      <Shimmer className="h-3 w-24 rounded" />
      <div className="h-px w-full bg-stroke-soft-200" />
      {Array.from({ length: 3 }).map((_, j) => (
        <div key={j} className="flex items-center justify-between">
          <Shimmer className="h-3 w-20 rounded" />
          <Shimmer className="h-3 w-28 rounded" />
        </div>
      ))}
    </div>
  )
}

export default function ShimmerDocsPage() {
  return (
    <DocsPageShell>
      <DocsHeader
        category="Components / Loaders"
        title="Shimmer"
        description="Low-level loading primitive: caller sets shape via className, Shimmer owns the moving-highlight gradient. Compose into table rows, cards, and analytics tiles. Distinct from Skeleton (pulse-only) — use Shimmer when you want a visible sweep."
        status="beta"
        kind="specialized"
      />

      <DocsSection title="Install">
        <DocsCode language="bash" code={`dash add shimmer`} />
      </DocsSection>

      <DocsSection title="Usage">
        <DocsCode
          language="tsx"
          code={`<Shimmer className="h-4 w-32 rounded" />
<Shimmer className="h-6 w-20 rounded-full" />
<Shimmer className="size-10 rounded-full" />`}
        />
      </DocsSection>

      <DocsSection title="Live: primitive">
        <DocsExample
          title="Shapes"
          preview={
            <div className="flex flex-wrap items-center gap-3">
              <Shimmer className="h-4 w-32 rounded" />
              <Shimmer className="h-6 w-20 rounded-full" />
              <Shimmer className="size-10 rounded-full" />
              <Shimmer className="h-12 w-48 rounded-xl" />
            </div>
          }
          code={`<Shimmer className="h-4 w-32 rounded" />
<Shimmer className="h-6 w-20 rounded-full" />
<Shimmer className="size-10 rounded-full" />
<Shimmer className="h-12 w-48 rounded-xl" />`}
        />
      </DocsSection>

      <DocsSection title="Composed: analytics summary">
        <DocsExample
          title="5-card row"
          preview={
            <div className="grid w-full grid-cols-3 gap-3 lg:flex">
              {Array.from({ length: 5 }).map((_, i) => (
                <AnalyticsCardSkeleton key={i} />
              ))}
            </div>
          }
          code={`<div className="grid grid-cols-3 gap-3 lg:flex">
  {Array.from({ length: 5 }).map((_, i) => <AnalyticsCardSkeleton key={i} />)}
</div>`}
        />
      </DocsSection>

      <DocsSection title="Composed: delivery card list">
        <DocsExample
          title="Mobile list of 3 cards"
          preview={
            <div className="flex w-full max-w-md flex-col gap-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <DeliveryCardSkeleton key={i} />
              ))}
            </div>
          }
          code={`{Array.from({ length: 3 }).map((_, i) => <DeliveryCardSkeleton key={i} />)}`}
        />
      </DocsSection>

      <DocsSection title="API">
        <DocsPropsTable
          rows={[
            { name: "className", type: "string", description: "Tailwind classes controlling shape — width, height, rounded-* are all caller-set." },
          ]}
        />
      </DocsSection>

      <DocsSection title="Shimmer vs Skeleton">
        <ul className="list-disc pl-6 space-y-1 text-sm text-text-sub-600">
          <li><strong>Skeleton</strong> (in Dash) — pulses opacity on a solid grey block. Calmer.</li>
          <li><strong>Shimmer</strong> — animates a gradient highlight across the block. More "active". Best when the wait is &lt;2s.</li>
          <li>Use Skeleton for content lists; Shimmer for tables and dashboards where action-y feedback helps.</li>
        </ul>
      </DocsSection>
    </DocsPageShell>
  )
}
