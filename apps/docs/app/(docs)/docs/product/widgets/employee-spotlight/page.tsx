"use client"

import * as React from "react"
import {
  RiHeart3Fill as HeartFill,
  RiHeart3Line as HeartLine,
  RiEdit2Line as Edit,
  RiGift2Line as Gift,
} from "@remixicon/react"
import { Avatar, AvatarFallback, AvatarImage } from "@/registry/dash/ui/avatar"
import { Button } from "@/registry/dash/ui/button"
import { LinkButton } from "@/registry/dash/ui/link-button"
import { SegmentedControl, SegmentedItem } from "@/registry/dash/ui/segmented-control"
import { cn } from "@/registry/dash/lib/utils"
import {
  DocsPageShell,
  DocsHeader,
  DocsSection,
  DocsExample,
  DocsPropsTable,
} from "@/components/docs/page-shell"

/**
 * Employee Spotlight widget — Figma 1:1 (verified 2026-05-19).
 *   3849:31699   Overview tab — avatar + name + role + ribbon medallion + caption
 *   3849:31698   Comments tab — 3 comment rows w/ heart toggle + Comment CTA
 *   3849:31697   Rewards tab — $50 Gift Card ribbon medallion + caption
 *
 * Note: nodes 3871:22009 / 22018 / 22027 (Meetings / Events / Holiday) were
 * previously mis-attributed here — they belong to the Schedule widget family.
 *
 * 3-tab segmented control swaps body between Overview / Comments / Rewards.
 */
export default function EmployeeSpotlightWidgetPage() {
  const [tab, setTab] = React.useState<"overview" | "comments" | "rewards">("overview")
  return (
    <DocsPageShell>
      <DocsHeader
        category="Product Components / Widgets"
        title="Employee Spotlight"
        description="Monthly recognition widget. Surfaces the top-performing employee with a ribbon medallion, peer comments, and tangible rewards via a 3-tab segmented control."
      />

      <DocsSection title="Full widget">
        <p className="text-sm text-text-sub-600 max-w-2xl">
          Standard widget shell with a segmented Overview / Comments / Rewards
          tab strip in the header. Each tab swaps the body region.
        </p>
        <DocsExample
          title="3 tabs"
          preview={
            <div className="max-w-sm">
              <WidgetShell
                title={
                  <SegmentedControl
                    size="sm"
                    value={tab}
                    onValueChange={(v: string) => setTab(v as typeof tab)}
                    className="w-full"
                  >
                    <SegmentedItem size="sm" value="overview" className="flex-1">Overview</SegmentedItem>
                    <SegmentedItem size="sm" value="comments" className="flex-1">Comments</SegmentedItem>
                    <SegmentedItem size="sm" value="rewards" className="flex-1">Rewards</SegmentedItem>
                  </SegmentedControl>
                }
              >
                {tab === "overview" ? <OverviewBody /> : tab === "comments" ? <CommentsBody /> : <RewardsBody />}
              </WidgetShell>
            </div>
          }
          code={`<WidgetShell title={<SegmentedControl size="sm" value={tab} onValueChange={setTab}>
  <SegmentedItem value="overview">Overview</SegmentedItem>
  <SegmentedItem value="comments">Comments</SegmentedItem>
  <SegmentedItem value="rewards">Rewards</SegmentedItem>
</SegmentedControl>}>
  {tab === "overview" ? <OverviewBody /> : tab === "comments" ? <CommentsBody /> : <RewardsBody />}
</WidgetShell>`}
        />
      </DocsSection>

      <DocsSection title="Overview tab">
        <p className="text-sm text-text-sub-600 max-w-2xl">
          Centred avatar + name + role pair, followed by a decorative ribbon
          medallion containing a portrait. Caption seals the recognition message
          underneath.
        </p>
        <DocsExample
          title="Overview"
          preview={
            <div className="max-w-sm">
              <OverviewBody />
            </div>
          }
          code={`<OverviewBody name="Matthew Johnson" role="Software Engineer" caption="Top-performing employee of January!" />`}
        />
      </DocsSection>

      <DocsSection title="Comments tab">
        <p className="text-sm text-text-sub-600 max-w-2xl">
          Three peer comments stacked, each with an avatar + name + body + heart
          toggle. A bottom CTA opens the comment composer.
        </p>
        <DocsExample
          title="Comments"
          preview={
            <div className="max-w-sm">
              <CommentsBody />
            </div>
          }
          code={`<CommentsBody />
// CommentRow internally: <Avatar /> + name + body + heart toggle`}
        />
      </DocsSection>

      <DocsSection title="Rewards tab">
        <p className="text-sm text-text-sub-600 max-w-2xl">
          Gift-card ribbon medallion. Reuses the same scalloped ribbon shape as
          Overview but swaps the inner portrait for a gift icon.
        </p>
        <DocsExample
          title="Rewards"
          preview={
            <div className="max-w-sm">
              <RewardsBody />
            </div>
          }
          code={`<RewardsBody amount="$50" brand="Nike" recipient="Matthew" />`}
        />
      </DocsSection>

      <DocsSection title="API">
        <DocsPropsTable
          rows={[
            { name: "tab", type: '"overview" | "comments" | "rewards"', defaultValue: '"overview"', description: "Controlled segmented control value." },
            { name: "OverviewBody.name", type: "string", description: "Employee display name." },
            { name: "OverviewBody.role", type: "string", description: "Employee role / job title." },
            { name: "OverviewBody.caption", type: "string", description: "Short recognition line under the medallion." },
            { name: "CommentRow.name / body", type: "string / string", description: "Commenter identity + message body." },
            { name: "CommentRow.liked", type: "boolean", description: "Toggles between heart-line and heart-fill." },
            { name: "RewardsBody.amount / brand", type: "string / string", description: "Gift card amount + brand (e.g. $50 / Nike)." },
          ]}
        />
      </DocsSection>

      <DocsSection title="Anatomy">
        <ul className="space-y-2 text-sm text-text-strong-950/90 list-disc pl-5">
          <li><strong>Tab strip</strong> — full-width SegmentedControl in the header slot. Three equal-flex tabs.</li>
          <li><strong>Ribbon medallion</strong> — scalloped primary-alpha-24 ring around a centred bg-white-0 disc.</li>
          <li><strong>Comment row</strong> — 32px avatar + name (xs strong) + body (sm) + trailing heart toggle.</li>
          <li><strong>Footer CTA</strong> — ghost button row beneath the comments list ("Comment" w/ pencil glyph).</li>
        </ul>
      </DocsSection>

      <DocsSection title="Usage">
        <ul className="space-y-2 text-sm text-text-strong-950/90 list-disc pl-5">
          <li>Refresh the spotlight monthly — the caption should always name the recognition window ("…of January").</li>
          <li>Comments tab caps at 3 visible rows; longer threads should scroll inside the body region.</li>
          <li>Rewards tab is optional — only render when an actual reward has been issued for the period.</li>
        </ul>
      </DocsSection>
    </DocsPageShell>
  )
}

/* ============================================================================ */

function WidgetShell({
  title,
  seeAll,
  children,
  className,
}: {
  title: React.ReactNode
  seeAll?: boolean
  children: React.ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-stroke-soft-200 bg-bg-white-0 p-3 shadow-sm space-y-2",
        className,
      )}
    >
      <div className="flex items-center gap-2">
        <div className="text-sm font-medium text-text-strong-950 flex-1">{title}</div>
        {seeAll ? <LinkButton size="sm">See All</LinkButton> : null}
      </div>
      {children}
    </div>
  )
}

function OverviewBody() {
  return (
    <div className="text-center space-y-3 py-2">
      <div>
        <div className="text-base font-semibold text-text-strong-950">Matthew Johnson</div>
        <div className="text-xs text-text-sub-600">Software Engineer</div>
      </div>
      <Medallion>
        <Avatar size="xl">
          <AvatarImage src="https://i.pravatar.cc/120?u=matthew" />
          <AvatarFallback>MJ</AvatarFallback>
        </Avatar>
      </Medallion>
      <p className="text-xs text-text-sub-600">Top-performing employee of January!</p>
    </div>
  )
}

function CommentsBody() {
  return (
    <div className="space-y-2">
      <ul className="divide-y divide-stroke-soft-200">
        <CommentRow name="James Brown" body="Congrats, Matthew! 🔥" avatar="jb" liked />
        <CommentRow name="Lena Müller" body="Keep up the amazing work! 🤗" avatar="lm" liked />
        <CommentRow name="Juma Omondi" body="Sky is the limit, well deserved! ⚡" avatar="jo" />
      </ul>
      <Button style="stroke" tone="neutral" size="sm" className="w-full">
        <Edit className="size-3.5" /> Comment
      </Button>
    </div>
  )
}

function RewardsBody() {
  return (
    <div className="text-center space-y-3 py-2">
      <div>
        <div className="text-base font-semibold text-text-strong-950">$50 Gift Card for Nike</div>
        <div className="text-xs text-text-sub-600">Enjoy spending, Matthew!</div>
      </div>
      <Medallion>
        <span className="inline-flex size-12 items-center justify-center rounded-full bg-(--primary-alpha-24)">
          <Gift className="size-6 text-(--primary-base)" />
        </span>
      </Medallion>
      <p className="text-xs text-text-sub-600">Employees of the month receive rewards</p>
    </div>
  )
}

function Medallion({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative mx-auto flex items-center justify-center size-32">
      <svg
        viewBox="0 0 100 100"
        className="absolute inset-0 size-full text-(--primary-alpha-24)"
        aria-hidden
      >
        <path
          d="M50 4 C56 6 60 2 66 4 C72 6 74 12 80 14 C86 16 92 14 94 20 C96 26 100 32 98 38 C96 44 96 50 96 56 C96 62 94 68 90 74 C86 80 84 86 78 90 C72 94 66 96 60 96 C54 96 48 100 42 96 C36 92 28 92 22 88 C16 84 12 80 10 74 C8 68 4 62 4 56 C4 50 2 44 4 38 C6 32 8 26 12 22 C16 18 22 14 28 12 C34 10 38 4 44 4 C46 4 48 4 50 4 Z"
          fill="currentColor"
        />
      </svg>
      <div className="relative inline-flex items-center justify-center size-16 rounded-full bg-bg-white-0 border-2 border-(--primary-alpha-24)">
        {children}
      </div>
    </div>
  )
}

function CommentRow({
  name,
  body,
  avatar,
  liked,
}: {
  name: string
  body: string
  avatar: string
  liked?: boolean
}) {
  const [active, setActive] = React.useState(!!liked)
  return (
    <li className="flex items-start gap-2 py-2">
      <Avatar size="sm">
        <AvatarImage src={`https://i.pravatar.cc/40?u=${avatar}`} />
        <AvatarFallback>{name.split(" ").map((p) => p[0]).join("")}</AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <div className="text-[11px] text-text-sub-600">{name}</div>
        <div className="text-sm text-text-strong-950">{body}</div>
      </div>
      <button
        type="button"
        onClick={() => setActive((v) => !v)}
        aria-label={active ? "Unlike comment" : "Like comment"}
        className="text-error-base"
      >
        {active ? <HeartFill className="size-4" /> : <HeartLine className="size-4 text-text-soft-400" />}
      </button>
    </li>
  )
}
