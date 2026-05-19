"use client"

import * as React from "react"
import {
  RiStarSmileLine,
  RiShareForwardLine,
  RiPencilLine,
  RiGiftLine,
  RiHeart3Fill,
  RiHeart3Line,
  RiUserSmileLine,
} from "@remixicon/react"
import { Button } from "@/registry/dash/ui/button"
import { Avatar, AvatarImage, AvatarFallback } from "@/registry/dash/ui/avatar"
import { Divider } from "@/registry/dash/ui/divider"
import { SegmentedControl, SegmentedItem } from "@/registry/dash/ui/segmented-control"
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
 * HR Widget — Employee Spotlight. Ported from AlignUI HR Template (2026-05-18).
 * Source: components/widgets/widget-employee-spotlight.tsx
 *
 * 3 tabs — Overview (sticker frame), Comments (likeable list), Rewards (gift card).
 */
export default function HREmployeeSpotlightWidgetPage() {
  const [tab, setTab] = React.useState("overview")

  return (
    <DocsPageShell>
      <DocsHeader
        category="Product Components / Widgets / HR"
        title="Employee Spotlight"
        description="Celebratory widget. 3-tab segmented control — Overview (avatar in sticker frame), Comments (likeable list), Rewards (gift card)."
      />

      <DocsSection title="Full widget">
        <DocsExample
          title="Matthew Johnson — Top performer of January"
          preview={
            <div className="max-w-sm">
              <WidgetShell
                title={<><RiStarSmileLine className="size-4 text-icon-sub-600" /> Employee Spotlight</>}
                action={<Button tone="neutral" style="stroke" size="xs" leftIcon={<RiShareForwardLine className="size-3.5" />}>Share</Button>}
              >
                <SegmentedControl value={tab} onValueChange={(v: string) => v && setTab(v)} className="w-full">
                  <SegmentedItem value="overview">Overview</SegmentedItem>
                  <SegmentedItem value="comments">Comments</SegmentedItem>
                  <SegmentedItem value="rewards">Rewards</SegmentedItem>
                </SegmentedControl>
                <div className="pt-4">
                  {tab === "overview" && <OverviewTab />}
                  {tab === "comments" && <CommentsTab />}
                  {tab === "rewards" && <RewardsTab />}
                </div>
              </WidgetShell>
            </div>
          }
          code={`<SegmentedControl value={tab} onValueChange={setTab}>
  <SegmentedItem value="overview">Overview</SegmentedItem>
  <SegmentedItem value="comments">Comments</SegmentedItem>
  <SegmentedItem value="rewards">Rewards</SegmentedItem>
</SegmentedControl>`}
        />
      </DocsSection>

      <DocsSection title="Overview tab">
        <DocsExample title="Avatar + sticker frame" preview={<div className="max-w-sm"><OverviewTab /></div>} code={`<OverviewTab />`} />
      </DocsSection>

      <DocsSection title="Comments tab">
        <DocsExample title="3 likeable comments" preview={<div className="max-w-sm"><CommentsTab /></div>} code={`<CommentsTab />`} />
      </DocsSection>

      <DocsSection title="Rewards tab">
        <DocsExample title="$50 Nike gift card" preview={<div className="max-w-sm"><RewardsTab /></div>} code={`<RewardsTab />`} />
      </DocsSection>

      <DocsSection title="Empty state">
        <DocsExample
          title="No spotlight yet"
          preview={
            <div className="max-w-sm">
              <WidgetShell title={<><RiStarSmileLine className="size-4 text-icon-sub-600" /> Employee Spotlight</>}>
                <SegmentedControl value="overview" className="w-full pointer-events-none opacity-50">
                  <SegmentedItem value="overview">Overview</SegmentedItem>
                  <SegmentedItem value="comments">Comments</SegmentedItem>
                  <SegmentedItem value="rewards">Rewards</SegmentedItem>
                </SegmentedControl>
                <div className="flex flex-col items-center justify-center gap-4 py-10">
                  <EmptyStateIllustration kind="employee-spotlight-overview" />
                  <p className="text-center text-sm text-text-soft-400">
                    No records of employee spotlight yet.<br /> Please check back later.
                  </p>
                </div>
              </WidgetShell>
            </div>
          }
          code={`<EmptyState />`}
        />
      </DocsSection>

      <DocsSection title="API">
        <DocsPropsTable
          rows={[
            { name: "employee", type: "{ name, role, image }", description: "Centred name + role + 72px avatar." },
            { name: "caption", type: "string", description: "Award caption beneath the sticker frame." },
            { name: "comments", type: "Comment[]", description: "Each = avatar + name + message + heart toggle." },
            { name: "reward", type: "{ title, message }", description: "Reward title + congratulatory line." },
          ]}
        />
      </DocsSection>

      <DocsSection title="Anatomy">
        <ul className="space-y-2 text-sm text-text-strong-950/90 list-disc pl-5">
          <li><strong>SegmentedControl</strong> — 3 tabs, full width.</li>
          <li><strong>Sticker frame</strong> — decorative SVG frame with the 72px avatar centred.</li>
          <li><strong>Comment row</strong> — 40px avatar + xs name + sm message + heart toggle.</li>
          <li><strong>Reward</strong> — blue-200 disc with RiGiftLine glyph inside the same sticker frame.</li>
        </ul>
      </DocsSection>
    </DocsPageShell>
  )
}

function StickerFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative mx-auto h-[156px] w-full max-w-80">
      {/* Simplified sticker frame — dashed outline with corner ticks */}
      <svg className="absolute inset-0 size-full" viewBox="0 0 320 156" fill="none">
        <rect x="2" y="2" width="316" height="152" rx="16" stroke="var(--primary-base)" strokeWidth="1.5" strokeDasharray="6 4" opacity="0.4" />
        {[
          [16, 16], [304, 16], [16, 140], [304, 140],
        ].map(([cx, cy], i) => (
          <circle key={i} cx={cx} cy={cy} r="3" fill="var(--primary-base)" opacity="0.6" />
        ))}
      </svg>
      <div className="absolute left-1/2 top-1/2 size-[72px] -translate-x-1/2 -translate-y-1/2">
        {children}
      </div>
    </div>
  )
}

function OverviewTab() {
  return (
    <div className="space-y-4">
      <div className="space-y-1 text-center">
        <div className="text-base font-medium text-text-strong-950">Matthew Johnson</div>
        <div className="text-xs text-text-sub-600">Software Engineer</div>
      </div>
      <StickerFrame>
        <Avatar size="xl">
          <AvatarImage src="/images/avatar/illustration/arthur.png" />
          <AvatarFallback>MJ</AvatarFallback>
        </Avatar>
      </StickerFrame>
      <div className="text-center text-xs text-text-sub-600">
        Top-performing employee of January!
      </div>
    </div>
  )
}

const COMMENTS = [
  { name: "James Brown", img: "/images/avatar/illustration/james.png", initials: "JB", message: "Congrats, Matthew! 🔥", liked: true },
  { name: "Lena Müller", img: "/images/avatar/illustration/lena.png", initials: "LM", message: "Keep up the amazing work! 🤗", liked: true },
  { name: "Juma Omondi", img: "/images/avatar/illustration/juma.png", initials: "JO", message: "Sky is the limit, well deserved! ⚡️", liked: false },
] as const

function CommentsTab() {
  return (
    <div className="space-y-4">
      <div className="space-y-4">
        {COMMENTS.map((c, i) => (
          <React.Fragment key={c.name}>
            <CommentRow {...c} />
            {i < COMMENTS.length - 1 && <Divider />}
          </React.Fragment>
        ))}
      </div>
      <Button tone="neutral" style="stroke" size="sm" className="w-full" leftIcon={<RiPencilLine className="size-4" />}>
        Comment
      </Button>
    </div>
  )
}

function CommentRow({ name, img, initials, message, liked: defaultLiked }: { name: string; img: string; initials: string; message: string; liked: boolean }) {
  const [liked, setLiked] = React.useState(defaultLiked)
  return (
    <div className="flex items-center gap-3">
      <Avatar size="md">
        <AvatarImage src={img} />
        <AvatarFallback>{initials}</AvatarFallback>
      </Avatar>
      <div className="flex-1 space-y-0.5">
        <div className="text-xs text-text-sub-600">{name}</div>
        <div className="text-sm text-text-strong-950">{message}</div>
      </div>
      <button type="button" onClick={() => setLiked((p) => !p)} className="size-5">
        {liked ? <RiHeart3Fill className="size-5 text-red-500" /> : <RiHeart3Line className="size-5 text-stroke-soft-200" />}
      </button>
    </div>
  )
}

function RewardsTab() {
  return (
    <div className="space-y-4">
      <div className="space-y-1 text-center">
        <div className="text-base font-medium text-text-strong-950">$50 Gift Card for Nike</div>
        <div className="text-xs text-text-sub-600">Enjoy spending, Matthew!</div>
      </div>
      <StickerFrame>
        <div className="flex size-[72px] items-center justify-center rounded-full bg-blue-200">
          <RiGiftLine className="size-10 text-blue-800" />
        </div>
      </StickerFrame>
      <div className="text-center text-xs text-text-sub-600">
        Employees of the month receive rewards
      </div>
    </div>
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
    <div className={cn("rounded-2xl border border-stroke-soft-200 bg-bg-white-0 p-4 shadow-sm space-y-3", className)}>
      <div className="flex items-center gap-2 h-9">
        <div className="flex flex-1 items-center gap-2 text-sm font-medium text-text-strong-950">{title}</div>
        {action}
      </div>
      {children}
    </div>
  )
}
