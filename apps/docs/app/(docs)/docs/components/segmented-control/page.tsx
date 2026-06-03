"use client"

import * as React from "react"
import {
  RiSunLine as Sun,
  RiMoonLine as Moon,
  RiSettings3Line as System,
  RiMoneyDollarCircleLine as Dollar,
  RiHeart3Line as Heart,
  RiBankCardLine as CardIcon,
  RiAddLine as Plus,
  RiArrowRightSLine as ChevronRight,
  RiArrowLeftSLine as ChevronLeft,
  RiHistoryLine as History,
  RiUser3Line as UserIcon,
  RiSpyLine as Spy,
  RiCheckLine as Check,
  RiInformationLine as Info,
  RiSignalWifiLine as Wifi,
} from "@remixicon/react"
import { SegmentedControl, SegmentedItem } from "@/registry/dash/ui/segmented-control"
import { Label } from "@/registry/dash/ui/label"
import { Field } from "@/registry/dash/ui/field"
import { Button } from "@/registry/dash/ui/button"
import { Badge } from "@/registry/dash/ui/badge"
import { cn } from "@/registry/dash/lib/utils"
import {
  DocsPageShell,
  DocsHeader,
  DocsSection,
  DocsExample,
  DocsPropsTable,
  DocsDoDont,
} from "@/components/docs/page-shell"
import { DocsCode } from "@/components/docs/code-block"

/**
 * Segmented Control — Figma 1:1 (11 nodes verified 2026-05-18).
 *
 *   2604:114        Group × 3 types (Label-only · Icon+Label · Icon-only)
 *   2603:2062       Item × 3 types × 4 states (Default/Hover/Active/Disabled)
 *   3698:1625       Recent Transactions card (light) — Incoming/Outgoing/Pending
 *   3698:1638       Recent Transactions card (dark)
 *   4024:88929      Donation Profile Goal tab (light) — Overview/Goal/Statistic
 *   4024:88931      Donation Profile Goal tab (dark)
 *   4024:89082      Donation Profile Statistic tab (light)
 *   4024:89084      Donation Profile Statistic tab (dark)
 *   4024:89235      My Cards (light) — Virtual (2) / Physical w/ count badge
 *   4024:89237      My Cards (dark)
 *   3715:41945      Select Theme picker — Light/Dark/System icon+label
 */

export default function SegmentedControlDocsPage() {
  const [theme, setTheme] = React.useState("light")
  const [transTab, setTransTab] = React.useState("outgoing")
  const [transTabDark, setTransTabDark] = React.useState("outgoing")
  const [donTab, setDonTab] = React.useState("goal")
  const [donTabDark, setDonTabDark] = React.useState("goal")
  const [donStatTab, setDonStatTab] = React.useState("statistic")
  const [donStatTabDark, setDonStatTabDark] = React.useState("statistic")
  const [cardsTab, setCardsTab] = React.useState("virtual")
  const [cardsTabDark, setCardsTabDark] = React.useState("virtual")

  return (
    <DocsPageShell>
      <DocsHeader
        status="beta"
        kind="atom"
        category="Components / Form"
        title="Segmented Control"
        description="Single-select toggle group on a track surface. Use for mutually exclusive view-state pickers (tab-like) where all options should remain visible. 3 item types — label-only, icon+label, icon-only — × 4 states."
      />

      <DocsSection title="Install">
        <DocsCode language="bash" code={`dashkit add segmented-control`} />
      </DocsSection>

      <DocsSection title="Usage">
        <DocsCode
          language="tsx"
          code={`import { SegmentedControl, SegmentedItem } from "@/registry/dash/ui/segmented-control"

<SegmentedControl value={tab} onValueChange={setTab}>
  <SegmentedItem value="incoming">Incoming</SegmentedItem>
  <SegmentedItem value="outgoing">Outgoing</SegmentedItem>
  <SegmentedItem value="pending">Pending</SegmentedItem>
</SegmentedControl>`}
        />
      </DocsSection>

      <DocsSection title="Item × 3 types × 4 states">
        <p className="text-sm text-text-sub-600 max-w-2xl">
          3 item types (Label-only · Icon+Label · Icon-only) × 4 states (Default · Hover · Active · Disabled). Default state is greyed (option exists but unselected) — same item, different bg/text via <code className="text-xs px-1 py-0.5 rounded bg-bg-weak-50">data-state</code> (Figma node 2603:2062).
        </p>
        <DocsExample
          title="Item state matrix"
          preview={
            <div className="grid grid-cols-3 gap-3 p-3 rounded-xl border border-stroke-soft-200 bg-bg-white-0 max-w-md">
              <ItemPreview state="default">Label</ItemPreview>
              <ItemPreview state="default" icon>Label</ItemPreview>
              <ItemPreview state="default" iconOnly>Label</ItemPreview>
              <ItemPreview state="hover">Label</ItemPreview>
              <ItemPreview state="hover" icon>Label</ItemPreview>
              <ItemPreview state="hover" iconOnly>Label</ItemPreview>
              <ItemPreview state="active">Label</ItemPreview>
              <ItemPreview state="active" icon>Label</ItemPreview>
              <ItemPreview state="active" iconOnly>Label</ItemPreview>
              <ItemPreview state="disabled">Label</ItemPreview>
              <ItemPreview state="disabled" icon>Label</ItemPreview>
              <ItemPreview state="disabled" iconOnly>Label</ItemPreview>
            </div>
          }
          code={`<SegmentedItem value="x">Label</SegmentedItem>
<SegmentedItem value="x"><Sun /> Label</SegmentedItem>
<SegmentedItem value="x" aria-label="Light"><Sun /></SegmentedItem>`}
        />
      </DocsSection>

      <DocsSection title="Group × 3 types">
        <p className="text-sm text-text-sub-600 max-w-2xl">
          Track wraps items — bg-weak-50 surface, 10px radius, 4px padding, 4px gap. Figma node 2604:114.
        </p>
        <DocsExample
          title="Label / Icon+Label / Icon-only"
          preview={
            <div className="space-y-4 max-w-md">
              <Field>
                <Label optional>Label</Label>
                <SegmentedControl defaultValue="a">
                  <SegmentedItem value="a">Label</SegmentedItem>
                  <SegmentedItem value="b">Label</SegmentedItem>
                  <SegmentedItem value="c">Label</SegmentedItem>
                </SegmentedControl>
              </Field>
              <Field>
                <Label optional>Label</Label>
                <SegmentedControl defaultValue="a">
                  <SegmentedItem value="a"><Sun /> Label</SegmentedItem>
                  <SegmentedItem value="b"><Sun /> Label</SegmentedItem>
                  <SegmentedItem value="c"><Sun /> Label</SegmentedItem>
                </SegmentedControl>
              </Field>
              <Field>
                <Label optional>Label</Label>
                <SegmentedControl defaultValue="a">
                  <SegmentedItem value="a" aria-label="Light"><Sun /></SegmentedItem>
                  <SegmentedItem value="b" aria-label="Dark"><Sun /></SegmentedItem>
                  <SegmentedItem value="c" aria-label="System"><Sun /></SegmentedItem>
                </SegmentedControl>
              </Field>
            </div>
          }
          code={`<SegmentedControl defaultValue="a">
  <SegmentedItem value="a">Label</SegmentedItem>
  <SegmentedItem value="b">Label</SegmentedItem>
  <SegmentedItem value="c">Label</SegmentedItem>
</SegmentedControl>`}
        />
      </DocsSection>

      <DocsSection title="Theme picker">
        <p className="text-sm text-text-sub-600 max-w-2xl">
          Icon+Label group as a settings picker — Light / Dark / System. Figma node 3715:41945.
        </p>
        <DocsExample
          title="Select Theme"
          preview={
            <Field className="max-w-sm">
              <Label optional>Select Theme</Label>
              <SegmentedControl value={theme} onValueChange={setTheme}>
                <SegmentedItem value="light"><Sun /> Light</SegmentedItem>
                <SegmentedItem value="dark"><Moon /> Dark</SegmentedItem>
                <SegmentedItem value="system"><System /> System</SegmentedItem>
              </SegmentedControl>
            </Field>
          }
          code={`<SegmentedControl value={theme} onValueChange={setTheme}>
  <SegmentedItem value="light"><Sun /> Light</SegmentedItem>
  <SegmentedItem value="dark"><Moon /> Dark</SegmentedItem>
  <SegmentedItem value="system"><System /> System</SegmentedItem>
</SegmentedControl>`}
        />
      </DocsSection>

      <DocsSection title="Composite: Recent Transactions card">
        <p className="text-sm text-text-sub-600 max-w-2xl">
          Card pattern — title + See All + 3-segment filter + filtered transaction list. Light + dark surface variants (Figma nodes 3698:1625 + 3698:1638).
        </p>
        <DocsExample
          title="Light + Dark surface"
          preview={
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <TransactionsCard theme="light" value={transTab} onChange={setTransTab} />
              <TransactionsCard theme="dark" value={transTabDark} onChange={setTransTabDark} />
            </div>
          }
          code={`<Card>
  <CardHeader title="Recent Transactions" actions={<Button>See All</Button>} />
  <SegmentedControl value={tab} onValueChange={setTab} className="w-full">
    <SegmentedItem value="incoming">Incoming</SegmentedItem>
    <SegmentedItem value="outgoing">Outgoing</SegmentedItem>
    <SegmentedItem value="pending">Pending</SegmentedItem>
  </SegmentedControl>
  <TransactionList tab={tab} />
</Card>`}
        />
      </DocsSection>

      <DocsSection title="Composite: Donation Profile card">
        <p className="text-sm text-text-sub-600 max-w-2xl">
          Each tab swaps the entire card body — Goal renders a heart-fill viz, Statistic renders a line chart. Light + dark variants (Figma nodes 4024:88929 + 4024:88931 + 4024:89082 + 4024:89084).
        </p>
        <DocsExample
          title="Goal — light + dark"
          preview={
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <DonationCard theme="light" value={donTab} onChange={setDonTab} body="goal" />
              <DonationCard theme="dark" value={donTabDark} onChange={setDonTabDark} body="goal" />
            </div>
          }
          code={`<SegmentedControl value={tab} onValueChange={setTab} className="w-full">
  <SegmentedItem value="overview">Overview</SegmentedItem>
  <SegmentedItem value="goal">Goal</SegmentedItem>
  <SegmentedItem value="statistic">Statistic</SegmentedItem>
</SegmentedControl>
{tab === "goal" ? <GoalViz /> : tab === "statistic" ? <StatViz /> : <OverviewViz />}`}
        />
        <DocsExample
          title="Statistic — light + dark"
          preview={
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <DonationCard theme="light" value={donStatTab} onChange={setDonStatTab} body="statistic" />
              <DonationCard theme="dark" value={donStatTabDark} onChange={setDonStatTabDark} body="statistic" />
            </div>
          }
          code={`{tab === "statistic" ? <LineChart data={...} /> : null}`}
        />
      </DocsSection>

      <DocsSection title="Composite: My Cards (2-segment + count badge)">
        <p className="text-sm text-text-sub-600 max-w-2xl">
          Two-segment Virtual / Physical filter with inline count badge on each label. Light + dark variants (Figma nodes 4024:89235 + 4024:89237).
        </p>
        <DocsExample
          title="Light + Dark"
          preview={
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <MyCardsCard theme="light" value={cardsTab} onChange={setCardsTab} />
              <MyCardsCard theme="dark" value={cardsTabDark} onChange={setCardsTabDark} />
            </div>
          }
          code={`<SegmentedControl value={tab} onValueChange={setTab} className="w-full">
  <SegmentedItem value="virtual">
    Virtual <span className="text-text-soft-400">(2)</span>
  </SegmentedItem>
  <SegmentedItem value="physical">Physical</SegmentedItem>
</SegmentedControl>`}
        />
      </DocsSection>

      <DocsSection title="Sizes">
        <p className="text-sm text-text-sub-600 max-w-2xl">
          Dash extension — <code className="text-xs px-1 py-0.5 rounded bg-bg-weak-50">sm</code> (32 track / 24 item), <code className="text-xs px-1 py-0.5 rounded bg-bg-weak-50">md</code> (36/28 — Figma canonical), <code className="text-xs px-1 py-0.5 rounded bg-bg-weak-50">lg</code> (40/32).
        </p>
        <DocsExample
          title="sm / md / lg"
          preview={
            <div className="space-y-3 max-w-md">
              <SegmentedControl size="sm" defaultValue="a">
                <SegmentedItem size="sm" value="a">Small</SegmentedItem>
                <SegmentedItem size="sm" value="b">Small</SegmentedItem>
                <SegmentedItem size="sm" value="c">Small</SegmentedItem>
              </SegmentedControl>
              <SegmentedControl size="md" defaultValue="a">
                <SegmentedItem size="md" value="a">Medium</SegmentedItem>
                <SegmentedItem size="md" value="b">Medium</SegmentedItem>
                <SegmentedItem size="md" value="c">Medium</SegmentedItem>
              </SegmentedControl>
              <SegmentedControl size="lg" defaultValue="a">
                <SegmentedItem size="lg" value="a">Large</SegmentedItem>
                <SegmentedItem size="lg" value="b">Large</SegmentedItem>
                <SegmentedItem size="lg" value="c">Large</SegmentedItem>
              </SegmentedControl>
            </div>
          }
          code={`<SegmentedControl size="sm">...</SegmentedControl>
<SegmentedControl size="md">...</SegmentedControl>
<SegmentedControl size="lg">...</SegmentedControl>`}
        />
      </DocsSection>

      <DocsSection title="Do this, not that">
        <p className="text-base text-text-sub-600 leading-relaxed max-w-2xl">
          SegmentedControl = mutually-exclusive view switcher. Maks 4 opsi, label kata (bukan kalimat). Untuk daftar action verb pakai ButtonGroup. Untuk multi-select pakai ToggleGroup.
        </p>
        <DocsDoDont
          do={{
            preview: (
              <SegmentedControl defaultValue="list" className="w-full max-w-xs">
                <SegmentedItem value="list">List</SegmentedItem>
                <SegmentedItem value="kanban">Kanban</SegmentedItem>
                <SegmentedItem value="map">Map</SegmentedItem>
              </SegmentedControl>
            ),
            caption: "View switcher (List/Kanban/Map). 3 opsi mutually-exclusive — user pilih satu tampilan, sisanya invisible. Label kata pendek.",
          }}
          dont={{
            preview: (
              <SegmentedControl defaultValue="a" className="w-full max-w-xs">
                <SegmentedItem value="a">Buat delivery baru</SegmentedItem>
                <SegmentedItem value="b">Suspend mitra</SegmentedItem>
              </SegmentedControl>
            ),
            caption: "Action verb (Buat, Suspend) di SegmentedControl = behavior salah. SegmentedControl untuk pilih view, bukan trigger action. Pakai Button.",
          }}
        />
        <DocsDoDont
          do={{
            preview: (
              <SegmentedControl defaultValue="incoming" className="w-full max-w-xs">
                <SegmentedItem value="incoming">Masuk</SegmentedItem>
                <SegmentedItem value="outgoing">Keluar</SegmentedItem>
                <SegmentedItem value="pending">Pending</SegmentedItem>
              </SegmentedControl>
            ),
            caption: "Filter transaction state (masuk/keluar/pending). 3 opsi kata pendek dalam bahasa Indonesia.",
          }}
          dont={{
            preview: (
              <SegmentedControl defaultValue="1" className="w-full max-w-xs">
                <SegmentedItem value="1">Tribe Reservasi A</SegmentedItem>
                <SegmentedItem value="2">Tribe Reservasi B</SegmentedItem>
                <SegmentedItem value="3">Tribe Express A</SegmentedItem>
                <SegmentedItem value="4">Tribe Express B</SegmentedItem>
                <SegmentedItem value="5">Tribe Bulk</SegmentedItem>
                <SegmentedItem value="6">Tribe Halo</SegmentedItem>
              </SegmentedControl>
            ),
            caption: "6+ opsi label panjang = label terpotong, segmen tidak readable. Pakai Select dropdown atau TabsList untuk >4 opsi.",
          }}
        />
      </DocsSection>

      <DocsSection title="API">
        <DocsPropsTable
          rows={[
            { name: "SegmentedControl.value", type: "string", description: "Controlled selected value." },
            { name: "SegmentedControl.defaultValue", type: "string", description: "Uncontrolled initial value." },
            { name: "SegmentedControl.onValueChange", type: "(value: string) => void", description: "Fires when selection changes." },
            { name: "SegmentedControl.size", type: '"sm" | "md" | "lg"', defaultValue: '"md"', description: "Track height. md = Figma canonical 36px." },
            { name: "SegmentedItem.value", type: "string", description: "Required — distinguishes this item from siblings." },
            { name: "SegmentedItem.disabled", type: "boolean", description: "Disable a single item; remaining items still selectable." },
          ]}
        />
      </DocsSection>

      <DocsSection title="Anatomy">
        <ul className="space-y-2 text-sm text-text-strong-950/90">
          <li>• <strong>SegmentedControl</strong> — Radix ToggleGroup type=single. Track surface bg-weak-50, 10px radius.</li>
          <li>• <strong>SegmentedItem</strong> — Radix ToggleGroup.Item. Active state = bg-white-0 + text-strong + shadow.</li>
          <li>• <strong>Icon</strong> — pass any 16px SVG as child before label, or alone for icon-only items.</li>
        </ul>
      </DocsSection>

      <DocsSection title="Accessibility">
        <ul className="space-y-2 text-sm text-text-strong-950/90">
          <li>• <strong>Single-select semantics</strong> — Radix exposes <code className="text-xs">role=&quot;radiogroup&quot;</code>; each item gets <code className="text-xs">role=&quot;radio&quot;</code> + <code className="text-xs">aria-checked</code>.</li>
          <li>• <strong>Icon-only items</strong> — must provide <code className="text-xs">aria-label</code>.</li>
          <li>• <strong>Keyboard</strong> — arrow keys move between items, <code className="text-xs">Tab</code> enters/exits the group.</li>
          <li>• <strong>Focus ring</strong> — primary-base ring on focus-visible.</li>
        </ul>
      </DocsSection>
    </DocsPageShell>
  )
}

function ItemPreview({
  children,
  state,
  icon,
  iconOnly,
}: {
  children: React.ReactNode
  state: "default" | "hover" | "active" | "disabled"
  icon?: boolean
  iconOnly?: boolean
}) {
  return (
    <div
      className={cn(
        "inline-flex h-7 items-center justify-center gap-1.5 rounded-md px-3 text-sm font-medium transition-colors",
        "[&_svg]:size-4 [&_svg]:shrink-0",
        iconOnly && "px-2.5",
        state === "default" && "text-text-soft-400",
        state === "hover" && "text-text-sub-600",
        state === "active" && "bg-bg-white-0 text-text-strong-950 shadow-regular-xs",
        state === "disabled" && "text-text-disabled-300",
      )}
    >
      {icon || iconOnly ? <Sun /> : null}
      {iconOnly ? null : children}
    </div>
  )
}

function TxRow({
  icon,
  title,
  subtitle,
  amount,
  date,
  dark,
}: {
  icon: React.ReactNode
  title: string
  subtitle: string
  amount: string
  date: string
  dark?: boolean
}) {
  return (
    <div className="flex items-center gap-3 py-2">
      {icon}
      <div className="flex-1 min-w-0">
        <div className={cn("text-sm font-medium truncate", dark ? "text-white" : "text-text-strong-950")}>{title}</div>
        <div className={cn("text-xs truncate", dark ? "text-white/60" : "text-text-sub-600")}>{subtitle}</div>
      </div>
      <div className="text-right">
        <div className={cn("text-sm font-medium tabular-nums", dark ? "text-white" : "text-text-strong-950")}>{amount}</div>
        <div className={cn("text-xs", dark ? "text-white/60" : "text-text-sub-600")}>{date}</div>
      </div>
      <ChevronRight className={cn("size-4", dark ? "text-white/40" : "text-icon-soft-400")} />
    </div>
  )
}

function TransactionsCard({
  theme,
  value,
  onChange,
}: {
  theme: "light" | "dark"
  value: string
  onChange: (v: string) => void
}) {
  const dark = theme === "dark"
  return (
    <div className={cn("rounded-2xl border p-4 shadow-sm", dark ? "bg-bg-strong-950 border-bg-strong-950 text-white" : "bg-bg-white-0 border-stroke-soft-200")}>
      <div className="flex items-center gap-2 mb-3">
        <span className={cn("inline-flex size-7 items-center justify-center rounded-full", dark ? "bg-white/10" : "bg-bg-weak-50")}>
          <Dollar className={cn("size-4", dark ? "text-white/80" : "text-icon-sub-600")} />
        </span>
        <div className={cn("text-sm font-medium flex-1", dark && "text-white")}>Recent Transactions</div>
        <Button style="stroke" tone="neutral" size="xs" className={cn(dark && "bg-transparent border-white/20 text-white hover:bg-white/10")}>See All</Button>
      </div>
      <SegmentedControl
        value={value}
        onValueChange={onChange}
        className={cn("w-full mb-2", dark && "bg-white/10")}
      >
        <SegmentedItem value="incoming" className={cn("flex-1", dark && "data-[state=on]:bg-bg-strong-950 data-[state=on]:text-white")}>Incoming</SegmentedItem>
        <SegmentedItem value="outgoing" className={cn("flex-1", dark && "data-[state=on]:bg-bg-strong-950 data-[state=on]:text-white")}>Outgoing</SegmentedItem>
        <SegmentedItem value="pending" className={cn("flex-1", dark && "data-[state=on]:bg-bg-strong-950 data-[state=on]:text-white")}>Pending</SegmentedItem>
      </SegmentedControl>
      <div className={cn("divide-y", dark ? "divide-white/10" : "divide-stroke-soft-200")}>
        <TxRow icon={<span className="inline-flex size-8 items-center justify-center rounded-full bg-[#E8F5E9] text-[#7CB342] text-xs font-bold">S</span>} title="Baroque Painting" subtitle="Order No #234122" amount="-$124.00" date="Sep 18" dark={dark} />
        <TxRow icon={<span className="inline-flex size-8 items-center justify-center rounded-full bg-bg-strong-950"><CardIcon className="size-4 text-white" /></span>} title="Mastercard Payment" subtitle="Monthly Credit Card Paym…" amount="-$963.62" date="Sep 15" dark={dark} />
        <TxRow icon={<span className="inline-flex size-8 items-center justify-center rounded-full bg-bg-weak-50"><System className="size-4 text-icon-sub-600" /></span>} title="Car Repairing Expenses" subtitle="RepairMyCar Co." amount="-$640.00" date="Sep 08" dark={dark} />
        <TxRow icon={<span className="inline-flex size-8 items-center justify-center rounded-full bg-[#1A75D2] text-[10px] font-bold text-white">W</span>} title="Grocery Shopping" subtitle="Walmart Canada" amount="-$146.31" date="Sep 04" dark={dark} />
      </div>
    </div>
  )
}

function DonationCard({
  theme,
  value,
  onChange,
  body,
}: {
  theme: "light" | "dark"
  value: string
  onChange: (v: string) => void
  body: "goal" | "statistic"
}) {
  const dark = theme === "dark"
  return (
    <div className={cn("rounded-2xl border p-4 shadow-sm", dark ? "bg-bg-strong-950 border-bg-strong-950 text-white" : "bg-bg-white-0 border-stroke-soft-200")}>
      <div className="flex items-center gap-2 mb-3">
        <span className={cn("inline-flex size-7 items-center justify-center rounded-full", dark ? "bg-white/10" : "bg-bg-weak-50")}>
          <Heart className={cn("size-4", dark ? "text-white/80" : "text-icon-sub-600")} />
        </span>
        <div className={cn("text-sm font-medium flex-1", dark && "text-white")}>Donation Profile</div>
        <Button style="stroke" tone="neutral" size="xs" className={cn(dark && "bg-transparent border-white/20 text-white hover:bg-white/10")}><Plus className="size-3.5" />Donate</Button>
      </div>
      <SegmentedControl
        value={value}
        onValueChange={onChange}
        className={cn("w-full mb-3", dark && "bg-white/10")}
      >
        <SegmentedItem value="overview" className={cn("flex-1", dark && "data-[state=on]:bg-bg-strong-950 data-[state=on]:text-white")}>Overview</SegmentedItem>
        <SegmentedItem value="goal" className={cn("flex-1", dark && "data-[state=on]:bg-bg-strong-950 data-[state=on]:text-white")}>Goal</SegmentedItem>
        <SegmentedItem value="statistic" className={cn("flex-1", dark && "data-[state=on]:bg-bg-strong-950 data-[state=on]:text-white")}>Statistic</SegmentedItem>
      </SegmentedControl>
      {body === "goal" ? (
        <div className="text-center space-y-2">
          <div className={cn("text-sm font-medium", dark && "text-white")}>Donation Goal for 2023</div>
          <div className={cn("text-xs", dark ? "text-white/60" : "text-text-sub-600")}>
            <span className={cn("font-medium", dark ? "text-white/80" : "text-text-strong-950")}>$12,000</span> / $16,000
          </div>
          <div className="relative mx-auto h-28 w-32 flex items-end justify-center">
            <span className="text-7xl">❤️</span>
            <span className="absolute inset-0 flex items-center justify-center text-white font-semibold text-sm">75%</span>
          </div>
          <div className={cn("text-xs", dark ? "text-white/60" : "text-text-sub-600")}>
            Donate <span className={cn("font-medium", dark ? "text-white" : "text-text-strong-950")}>$4,000</span> to reach your target.
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <div className={cn("flex items-center gap-2 rounded-lg p-2", dark ? "bg-white/5" : "bg-bg-white-0")}>
              <span className="inline-flex size-8 items-center justify-center rounded-full bg-warning-lighter"><UserIcon className="size-4 text-warning-darker" /></span>
              <div>
                <div className={cn("text-xs", dark ? "text-white/60" : "text-text-sub-600")}>Public</div>
                <div className={cn("text-sm font-medium", dark && "text-white")}>$8,000</div>
              </div>
            </div>
            <div className={cn("flex items-center gap-2 rounded-lg p-2", dark ? "bg-white/5" : "bg-bg-white-0")}>
              <span className="inline-flex size-8 items-center justify-center rounded-full bg-information-lighter"><Spy className="size-4 text-information-darker" /></span>
              <div>
                <div className={cn("text-xs", dark ? "text-white/60" : "text-text-sub-600")}>Anonymous</div>
                <div className={cn("text-sm font-medium", dark && "text-white")}>$4,000</div>
              </div>
            </div>
          </div>
          <svg viewBox="0 0 280 80" className="w-full h-20">
            <path d="M0 60 Q40 40 80 30 T160 50 T280 65" fill="none" stroke="#3B82F6" strokeWidth="2" />
            <path d="M0 65 Q40 55 80 50 T160 20 T280 60" fill="none" stroke="#F97316" strokeWidth="2" />
            <circle cx="170" cy="32" r="4" fill="#F97316" />
          </svg>
          <div className={cn("flex justify-between text-[10px]", dark ? "text-white/40" : "text-text-soft-400")}>
            <span>feB</span><span>MAR</span><span>APR</span><span>May</span><span>JUN</span><span>JUL</span>
          </div>
          <div className={cn("flex items-center gap-1.5 rounded-lg border p-2 text-xs", dark ? "border-white/10 text-white/60" : "border-stroke-soft-200 text-text-sub-600")}>
            <Info className="size-3.5 shrink-0" />
            <span>You have donated <span className={cn("font-medium", dark ? "text-white" : "text-text-strong-950")}>$12,000</span> in total.</span>
          </div>
        </div>
      )}
    </div>
  )
}

function MyCardsCard({
  theme,
  value,
  onChange,
}: {
  theme: "light" | "dark"
  value: string
  onChange: (v: string) => void
}) {
  const dark = theme === "dark"
  return (
    <div className={cn("rounded-2xl border p-4 shadow-sm space-y-3", dark ? "bg-bg-strong-950 border-bg-strong-950 text-white" : "bg-bg-white-0 border-stroke-soft-200")}>
      <div className="flex items-center gap-2">
        <span className={cn("inline-flex size-7 items-center justify-center rounded-full", dark ? "bg-white/10" : "bg-bg-weak-50")}>
          <CardIcon className={cn("size-4", dark ? "text-white/80" : "text-icon-sub-600")} />
        </span>
        <div className={cn("text-sm font-medium flex-1", dark && "text-white")}>My Cards</div>
        <Button style="stroke" tone="neutral" size="xs" className={cn(dark && "bg-transparent border-white/20 text-white hover:bg-white/10")}><Plus className="size-3.5" />Add Card</Button>
      </div>
      <SegmentedControl value={value} onValueChange={onChange} className={cn("w-full", dark && "bg-white/10")}>
        <SegmentedItem value="virtual" className={cn("flex-1", dark && "data-[state=on]:bg-bg-strong-950 data-[state=on]:text-white")}>
          Virtual <span className={cn("ml-1", dark ? "text-white/40" : "text-text-soft-400")}>(2)</span>
        </SegmentedItem>
        <SegmentedItem value="physical" className={cn("flex-1", dark && "data-[state=on]:bg-bg-strong-950 data-[state=on]:text-white")}>Physical</SegmentedItem>
      </SegmentedControl>
      <div className={cn("relative h-40 rounded-2xl border p-4 overflow-hidden", dark ? "bg-bg-strong-950 border-white/10" : "bg-bg-white-0 border-stroke-soft-200")}>
        <div className="flex items-center gap-2 mb-2">
          <span className="inline-flex size-9 items-center justify-center rounded-full bg-[#3F6FFF]">
            <CardIcon className="size-5 text-white" />
          </span>
          <Wifi className={cn("size-4", dark ? "text-white/60" : "text-text-soft-400")} />
          <Badge size="sm" appearance="lighter" status="success"><Check className="size-3" />Active</Badge>
          <div className="ml-auto flex gap-0.5">
            <span className="inline-block size-5 rounded-full bg-[#EB001B]" />
            <span className="inline-block size-5 rounded-full bg-[#F79E1B] -ml-2" />
          </div>
        </div>
        <div className="mt-6">
          <div className={cn("text-xs", dark ? "text-white/60" : "text-text-sub-600")}>Savings Card</div>
          <div className={cn("text-2xl font-semibold tabular-nums", dark && "text-white")}>$16,058.94</div>
        </div>
        <div className="absolute bottom-3 right-3 flex gap-1">
          <button className={cn("inline-flex size-6 items-center justify-center rounded-full border", dark ? "border-white/20" : "border-stroke-soft-200")}>
            <ChevronLeft className={cn("size-3.5", dark ? "text-white/60" : "text-icon-soft-400")} />
          </button>
          <button className={cn("inline-flex size-6 items-center justify-center rounded-full border", dark ? "border-white/20" : "border-stroke-soft-200")}>
            <ChevronRight className={cn("size-3.5", dark ? "text-white/60" : "text-icon-soft-400")} />
          </button>
        </div>
      </div>
      <div className={cn("text-xs space-y-2 border-t pt-2", dark ? "border-white/10" : "border-stroke-soft-200")}>
        <div className="flex justify-between"><span className={cn(dark ? "text-white/60" : "text-text-sub-600")}>Card Number</span><span className={cn(dark ? "text-white" : "text-text-strong-950")}>•••• 1234</span></div>
        <div className="flex justify-between"><span className={cn(dark ? "text-white/60" : "text-text-sub-600")}>Expiry Date</span><span className={cn(dark ? "text-white" : "text-text-strong-950")}>06/27</span></div>
        <div className="flex justify-between"><span className={cn(dark ? "text-white/60" : "text-text-sub-600")}>Spending Limit</span><span className={cn(dark ? "text-white" : "text-text-strong-950")}>$12,000.00</span></div>
      </div>
      <Button style="stroke" tone="neutral" className={cn("w-full", dark && "bg-transparent border-white/20 text-white hover:bg-white/10")}><History className="size-3.5" />See All Transactions</Button>
    </div>
  )
}
