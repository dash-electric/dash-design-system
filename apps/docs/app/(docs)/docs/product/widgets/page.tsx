"use client"

import * as React from "react"
import {
  RiArrowRightSLine as ChevronRight,
  RiArrowLeftSLine as ChevronLeft,
  RiArrowDownSLine as ChevronDown,
  RiArrowUpSLine as ChevronUp,
  RiPlayCircleFill as Play,
  RiPauseCircleFill as Pause,
  RiStopCircleFill as Stop,
  RiBankCardLine as CardIcon,
  RiSignalWifiLine as Wifi,
  RiCheckLine as Check,
  RiAddLine as Plus,
  RiMore2Line as More,
  RiSearchLine as Search,
  RiBriefcaseLine as Briefcase,
  RiCalendarLine as CalendarI,
  RiGift2Line as Gift,
  RiMapPinLine as MapPin,
  RiHeart3Line as Heart,
  RiUser3Line as UserI,
  RiSpyLine as Spy,
  RiLightbulbLine as Lightbulb,
  RiVideoLine as Video,
  RiVideoChatLine as VideoChat,
  RiCalendarEventLine as CalendarEvent,
  RiPlaneLine as Plane,
} from "@remixicon/react"
import { Avatar, AvatarFallback, AvatarImage } from "@/registry/dash/ui/avatar"
import { Button } from "@/registry/dash/ui/button"
import { LinkButton } from "@/registry/dash/ui/link-button"
import { CompactButton } from "@/registry/dash/ui/compact-button"
import { Badge } from "@/registry/dash/ui/badge"
import { SegmentedControl, SegmentedItem } from "@/registry/dash/ui/segmented-control"
import { cn } from "@/registry/dash/lib/utils"
import {
  DocsPageShell,
  DocsHeader,
  DocsSection,
  DocsExample,
  DocsPropsTable,
} from "@/components/docs/page-shell"
import { DocsCode } from "@/components/docs/code-block"

/**
 * Product Widgets — Figma 1:1 (22 nodes verified 2026-05-18).
 *
 *   3851:32690     HR widget gallery — Time Off / Status / Notes / Schedule /
 *                   Employee Spotlight / Time Tracker / Daily Feedback /
 *                   Work Hours / Courses / Course Progress / Employee Rating /
 *                   Training Analysis
 *   3963:7181      Finance widget gallery — Stock Market / My Cards / Spending /
 *                   Exchange / Currency / Saved Actions / Recent Transactions /
 *                   My Subscriptions / Quick Transfer / Donation Profile /
 *                   Net Balance / Major Expenses / Credit Score / Budget
 *   3849:31700     Employee Spotlight (full — 3 tabs)
 *   3789:9678      Daily Feedback gauge × 5 fill states
 *   3872:24017     Notes row (todo style)
 *   3520:2550      Date chip × 3 states
 *   3520:2567      Date strip (week selector)
 *   3521:3090      Schedule cards — Meetings / Events / Holiday
 *   3710:12493     Schedule with tabs (data + empty states)
 *   3849:32128     Project picker dropdown
 *   3849:32209     Time tracker — Awaiting / Ongoing
 *   3167:153       Subscription list row × 4 leading types
 *   3710:11511     Recent transactions tabs (Incoming/Outgoing/Pending)
 *   3027:8865      EMV chip glyph × 11 colors
 *   3027:8986      Bank cards (Virtual + Physical)
 *   3931:6350      My Cards segmented panel
 *   3962:4438      Donation Profile widget
 *   3946:4047      Subscription item row × 2 leading types
 *   3948:25319     Person pill × 3 states
 *   3946:16805     Discount promo card grid (9 brand promos)
 *   3963:6847      3-color stack legend
 *   3963:6854      Stacked bar chart (Yearly/Weekly/Bi-month/Quarterly)
 */

const APEX_BLUE = "#3F6FFF"

export default function ProductWidgetsDocsPage() {
  const [trans, setTrans] = React.useState("incoming")
  const [cardTab, setCardTab] = React.useState("virtual")
  const [donTab, setDonTab] = React.useState("overview")
  const [schedTab, setSchedTab] = React.useState("meetings")
  const [project, setProject] = React.useState("Monday.com Redesign")
  const [tracker, setTracker] = React.useState<"awaiting" | "ongoing">("awaiting")
  const [chartRange, setChartRange] = React.useState("monthly")

  return (
    <DocsPageShell>
      <DocsHeader
        category="Product Components / Widgets"
        title="Widgets"
        description="Dashboard building blocks — pre-assembled cards used to compose HR, Finance, and SaaS product dashboards. Every widget shares the same shell anatomy (title + See All link + body + optional empty state). 30+ widgets across 2 product verticals."
      />

      <DocsSection title="Shell anatomy">
        <p className="text-sm text-text-sub-600 max-w-2xl">
          Every widget = card surface + header row (title + optional See All) + body slot. Body switches between loaded data and empty state per widget.
        </p>
        <DocsExample
          title="Empty shell"
          preview={
            <WidgetShell title="Widget title" seeAll>
              <EmptyState text="No data yet. Please check back later." />
            </WidgetShell>
          }
          code={`<WidgetShell title="Widget title" seeAll>
  <Body />
</WidgetShell>`}
        />
      </DocsSection>

      <DocsSection title="HR widget gallery">
        <p className="text-sm text-text-sub-600 max-w-2xl">
          12 widgets compose a typical HR dashboard. Figma node 3851:32690.
        </p>

        {/* Time Off + Notes + Time Tracker */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <WidgetShell title="Time Off" seeAll>
            <div className="flex items-center justify-between">
              <DailyFeedbackGauge value={10} max={20} unit="DAYS" />
              <div className="space-y-1 text-xs">
                <KV label="Jan 01, 2024" value={<Badge size="sm" appearance="lighter" status="warning">Pending</Badge>} />
                <KV label="Jan 02, 2024" value={<Badge size="sm" appearance="lighter" status="success">Approved</Badge>} />
                <KV label="Feb 22, 2024" value={<Badge size="sm" appearance="lighter" status="error">Rejected</Badge>} />
              </div>
            </div>
          </WidgetShell>

          <WidgetShell title="Notes" seeAll>
            <div className="space-y-2">
              <NoteRow done={false} title="Quarterly report prep" desc="Compile Q3 numbers." tags={["Today", "Waiting Feedback"]} date="Aug 02" />
              <NoteRow done title="Update onboarding deck" desc="Refresh team slides." tags={["Today", "Waiting Feedback"]} date="Aug 02" />
            </div>
          </WidgetShell>

          <WidgetShell
            title={
              <ProjectPicker value={project} onChange={setProject} />
            }
            headerNoTitle
          >
            <TimeTracker state={tracker} onToggle={() => setTracker((s) => (s === "awaiting" ? "ongoing" : "awaiting"))} />
          </WidgetShell>
        </div>

        {/* Employee Spotlight + Schedule */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
          <WidgetShell title="Employee Spotlight" seeAll>
            <div className="text-center space-y-2">
              <Avatar size="lg" className="mx-auto"><AvatarImage src="https://i.pravatar.cc/80?u=mj" /><AvatarFallback>MJ</AvatarFallback></Avatar>
              <div>
                <div className="text-sm font-medium text-text-strong-950">Matthew Johnson</div>
                <div className="text-xs text-text-sub-600">Software Engineer</div>
              </div>
              <p className="text-xs text-text-sub-600">Top-performing employee of January!</p>
            </div>
          </WidgetShell>

          <WidgetShell
            title="Schedule"
            seeAll
            headerExtra={
              <DateStrip
                items={[
                  { day: "Fri", date: "31" },
                  { day: "Sat", date: "01" },
                  { day: "Sun", date: "02", active: true },
                  { day: "Mon", date: "03" },
                  { day: "Tue", date: "04" },
                ]}
              />
            }
          >
            <SegmentedControl size="sm" value={schedTab} onValueChange={setSchedTab} className="w-full mb-2">
              <SegmentedItem value="meetings" className="flex-1"><VideoChat className="size-3.5" /> Meetings</SegmentedItem>
              <SegmentedItem value="events" className="flex-1"><CalendarEvent className="size-3.5" /> Events</SegmentedItem>
              <SegmentedItem value="holiday" className="flex-1"><Plane className="size-3.5" /> Holiday</SegmentedItem>
            </SegmentedControl>
            {schedTab === "meetings" ? (
              <ScheduleCard
                title="Meeting with James Brown"
                time="8:00 - 8:45 AM (UTC)"
                avatars={["jb", "lp", "at"]}
                channel="On Google Meet"
                badge={{ label: "Marketing", tone: "warning" }}
              />
            ) : schedTab === "events" ? (
              <ScheduleCard
                title="Tesla 4th year Celebration Party"
                time="7:00 - 11:00 PM (UTC)"
                location="341 Windy Ridge Road, LA"
                attendees="16/25"
                organizer="by Sofia Williams"
              />
            ) : (
              <ScheduleCard
                title="Christmas Holiday"
                time="DEC 25 – DEC 27"
                emoji="🎄"
                description="Happy Christmas!"
                subtitle="Religious Holiday"
                badge={{ label: "2-days break", tone: "purple" }}
              />
            )}
          </WidgetShell>
        </div>

        {/* Daily Feedback + Work Hours + Courses */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-3">
          <WidgetShell title="Daily Feedback" seeAll>
            <div className="text-center space-y-3">
              <p className="text-sm text-text-strong-950">How would you rate your mood today?</p>
              <div className="flex items-center justify-center gap-2 text-2xl">
                {["😟", "😐", "🙂", "😀", "🤩"].map((e) => (
                  <button key={e} className="hover:scale-110 transition-transform">{e}</button>
                ))}
              </div>
              <Button size="sm">Next Question</Button>
            </div>
          </WidgetShell>

          <WidgetShell title="Work Hours Analysis" seeAll>
            <div className="text-xs text-text-sub-600">10 hours · 0 mins</div>
            <svg viewBox="0 0 240 80" className="w-full h-20 mt-2">
              <polyline
                fill="none"
                stroke={APEX_BLUE}
                strokeWidth="1.5"
                points="0,60 20,55 40,65 60,40 80,30 100,50 120,30 140,45 160,25 180,55 200,40 220,55 240,30"
              />
            </svg>
          </WidgetShell>

          <WidgetShell title="Courses" seeAll>
            <ul className="divide-y divide-stroke-soft-200 text-xs">
              {[
                { name: "Huxley Albury", course: "Talent Management", progress: 70, status: "In Progress", tone: "information" as const },
                { name: "Ashlee Taylor", course: "Leadership Skills", progress: 55, status: "In Progress", tone: "information" as const },
                { name: "Wei Chen", course: "Diversity Training", progress: 100, status: "Completed", tone: "success" as const },
                { name: "Laura Müller", course: "Efficiency at Work", progress: 40, status: "In Progress", tone: "information" as const },
              ].map((c) => (
                <li key={c.name} className="flex items-center gap-2 py-1.5">
                  <Avatar size="xs"><AvatarImage src={`https://i.pravatar.cc/40?u=${c.name}`} /></Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">{c.name}</div>
                    <div className="text-text-sub-600 truncate">{c.course}</div>
                  </div>
                  <div className="w-16">
                    <div className="h-1 rounded-full bg-bg-soft-200"><div className="h-full rounded-full bg-(--primary-base)" style={{ width: `${c.progress}%` }} /></div>
                  </div>
                  <Badge size="sm" appearance="lighter" status={c.tone}>{c.status}</Badge>
                </li>
              ))}
            </ul>
          </WidgetShell>
        </div>

        {/* Daily Work Hours + Training Analysis + Employee Rating + Course Progress */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mt-3">
          <WidgetShell title="Daily Work Hours" seeAll>
            <div className="grid grid-cols-7 gap-1.5 h-20 items-end">
              {[40, 60, 80, 50, 70, 90, 30].map((v, i) => (
                <div key={i} className="flex flex-col items-center gap-1">
                  <div className="w-full bg-(--primary-alpha-24)" style={{ height: `${v}%` }} />
                  <div className="text-[9px] text-text-soft-400">{["M","T","W","T","F","S","S"][i]}</div>
                </div>
              ))}
            </div>
          </WidgetShell>

          <WidgetShell title="Training Analysis" seeAll>
            <div className="text-base font-semibold tabular-nums">12 trainees</div>
            <div className="grid grid-cols-12 gap-1 h-16 items-end mt-2">
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="w-full bg-(--primary-alpha-24) rounded-t-sm" style={{ height: `${20 + Math.random() * 60}%` }} />
              ))}
            </div>
          </WidgetShell>

          <WidgetShell title="Employee Rating" seeAll>
            <div className="text-xl font-semibold tabular-nums">⭐ 3.65 <span className="text-xs font-normal text-text-sub-600">overall</span></div>
            <svg viewBox="0 0 220 50" className="w-full h-12 mt-1.5">
              <path d="M0 30 Q40 10 80 20 T160 25 T220 15" fill="none" stroke={APEX_BLUE} strokeWidth="1.5" />
            </svg>
          </WidgetShell>

          <WidgetShell title="Course Progress" seeAll>
            <div className="flex items-center gap-3">
              <DailyFeedbackGauge value={68} max={100} unit="%" smaller />
              <div>
                <div className="text-xs font-medium">Sam (Diversity Training)</div>
                <LinkButton size="sm">Progress Course</LinkButton>
              </div>
            </div>
          </WidgetShell>
        </div>
      </DocsSection>

      <DocsSection title="Finance widget gallery">
        <p className="text-sm text-text-sub-600 max-w-2xl">
          14 widgets compose a typical fintech consumer dashboard. Figma node 3963:7181.
        </p>

        {/* Stock Market + My Cards + Spending */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <WidgetShell title="Stock Market Tracker" headerExtra={<Button style="stroke" tone="neutral" size="xs">ACME <ChevronDown className="size-3" /></Button>} headerNoTitle>
            <div className="space-y-2">
              <div className="text-xs font-medium">Stock Market Tracker</div>
              <SegmentedControl size="sm" defaultValue="1y" className="w-full">
                {["1D","1W","1M","3M","1Y"].map((d) => (
                  <SegmentedItem key={d} size="sm" value={d.toLowerCase()} className="flex-1">{d}</SegmentedItem>
                ))}
              </SegmentedControl>
              <div className="text-xl font-semibold tabular-nums">$440,364.20</div>
              <svg viewBox="0 0 220 60" className="w-full h-14">
                <polyline fill="none" stroke="#7C3AED" strokeWidth="1.5" points="0,40 10,30 20,45 30,35 40,50 50,30 60,40 70,25 80,45 90,30 100,40 110,20 120,40 130,30 140,40 150,20 160,35 170,25 180,45 190,30 200,45 210,30 220,40" />
              </svg>
            </div>
          </WidgetShell>

          <WidgetShell title="My Cards" headerExtra={<Button style="stroke" tone="neutral" size="xs"><Plus className="size-3" />Add Card</Button>} headerNoTitle>
            <SegmentedControl size="sm" value={cardTab} onValueChange={setCardTab} className="w-full mb-2">
              <SegmentedItem size="sm" value="virtual" className="flex-1">Virtual <span className="text-text-soft-400 ml-1">(2)</span></SegmentedItem>
              <SegmentedItem size="sm" value="physical" className="flex-1">Physical</SegmentedItem>
            </SegmentedControl>
            <BankCard variant={cardTab === "virtual" ? "virtual" : "physical"} />
          </WidgetShell>

          <WidgetShell title="Spending Summary" seeAll>
            <div className="text-xl font-semibold tabular-nums">$1,900.00</div>
            <div className="relative h-20 mt-2">
              <svg viewBox="0 0 100 50" className="w-full h-full">
                <path d="M10 40 A30 30 0 1 1 90 40" fill="none" stroke="#E5E5E5" strokeWidth="6" />
                <path d="M10 40 A30 30 0 0 1 70 18" fill="none" stroke={APEX_BLUE} strokeWidth="6" />
              </svg>
            </div>
            <div className="flex justify-between text-[10px] text-text-sub-600 mt-1">
              <span><span className="font-medium text-text-strong-950">$640</span> Food</span>
              <span><span className="font-medium text-text-strong-950">$220</span> Drinks</span>
            </div>
          </WidgetShell>
        </div>

        {/* Exchange + Currency + Recent Transactions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-3">
          <WidgetShell title="Exchange" seeAll>
            <SegmentedControl size="sm" defaultValue="rates" className="w-full mb-2">
              <SegmentedItem size="sm" value="rates" className="flex-1">Rates</SegmentedItem>
              <SegmentedItem size="sm" value="buy" className="flex-1">Buy</SegmentedItem>
            </SegmentedControl>
            <div className="text-xl font-semibold tabular-nums">$100.00</div>
            <div className="text-xs text-text-sub-600">Sold 0.0156 BTC</div>
            <Button className="w-full mt-2" size="sm">Exchange</Button>
          </WidgetShell>

          <WidgetShell title="Currency List" seeAll>
            <ul className="divide-y divide-stroke-soft-200 text-xs">
              {[
                { country: "🇨🇦", currency: "Canadian Dollar", rate: "11.77", change: "+0.46%" },
                { country: "🇯🇵", currency: "Japanese Yen", rate: "157.31", change: "+0.13%" },
                { country: "🇧🇷", currency: "Brazilian Real", rate: "5.34", change: "−0.21%" },
              ].map((r) => (
                <li key={r.currency} className="flex items-center gap-2 py-1.5">
                  <span className="text-base">{r.country}</span>
                  <span className="flex-1 truncate">{r.currency}</span>
                  <span className="tabular-nums font-medium">{r.rate}</span>
                  <span className={cn("tabular-nums", r.change.startsWith("+") ? "text-success-base" : "text-error-base")}>{r.change}</span>
                </li>
              ))}
            </ul>
          </WidgetShell>

          <WidgetShell title="Recent Transactions" seeAll>
            <SegmentedControl size="sm" value={trans} onValueChange={setTrans} className="w-full mb-2">
              <SegmentedItem size="sm" value="incoming" className="flex-1">Incoming</SegmentedItem>
              <SegmentedItem size="sm" value="outgoing" className="flex-1">Outgoing</SegmentedItem>
              <SegmentedItem size="sm" value="pending" className="flex-1">Pending</SegmentedItem>
            </SegmentedControl>
            <ul className="divide-y divide-stroke-soft-200 text-xs">
              {(trans === "incoming"
                ? [
                    { brand: "Salary Deposit", desc: "Monthly salary from Apex…", amount: "$3,500.00", date: "Sep 18" },
                    { brand: "Stock Dividend", desc: "Payment from stock invest…", amount: "$846.14", date: "Sep 18" },
                  ]
                : trans === "outgoing"
                  ? [
                      { brand: "Baroque Painting", desc: "Order No #234122", amount: "-$124.00", date: "Sep 18" },
                      { brand: "Mastercard Payment", desc: "Monthly Credit Card Paym…", amount: "-$963.62", date: "Sep 15" },
                    ]
                  : [
                      { brand: "Electricity Bill", desc: "3 days later", amount: "-$86.00", date: "Sep 21" },
                      { brand: "Internet Service", desc: "4 days later", amount: "-$46.00", date: "Sep 22" },
                    ]
              ).map((r) => (
                <li key={r.brand} className="flex items-center gap-2 py-2">
                  <span className="inline-flex size-7 items-center justify-center rounded-full bg-bg-weak-50"><CardIcon className="size-3.5" /></span>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">{r.brand}</div>
                    <div className="text-text-sub-600 truncate">{r.desc}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium tabular-nums">{r.amount}</div>
                    <div className="text-text-sub-600">{r.date}</div>
                  </div>
                </li>
              ))}
            </ul>
          </WidgetShell>
        </div>

        {/* Subscriptions + Quick Transfer + Donation Profile */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-3">
          <WidgetShell title="My Subscriptions" seeAll>
            <div className="space-y-2">
              {[
                { name: "Netflix", price: "$15.49", date: "May 03" },
                { name: "Apple Music", price: "$9.99", date: "May 05" },
                { name: "Spotify", price: "$9.99", date: "May 12" },
                { name: "YouTube Premium", price: "$13.99", date: "May 19" },
              ].map((s) => (
                <SubscriptionRow key={s.name} title={s.name} price={s.price} date={s.date} />
              ))}
            </div>
          </WidgetShell>

          <WidgetShell title="Quick Transfer" headerExtra={<Button style="stroke" tone="neutral" size="xs"><Plus className="size-3" />Add</Button>} headerNoTitle>
            <div className="text-xs font-medium mb-2">Quick Transfer</div>
            <div className="flex items-center gap-2 mb-3">
              {["Sophia", "James", "Lena", "Arthur", "+5"].map((n, i) => (
                <div key={i} className="text-center">
                  <Avatar size="sm" className="mx-auto"><AvatarFallback>{n[0]}</AvatarFallback></Avatar>
                  <div className="text-[10px] text-text-sub-600 mt-1">{n}</div>
                </div>
              ))}
            </div>
            <div className="text-xs text-text-sub-600">Enter Amount</div>
            <div className="text-xl font-semibold tabular-nums">$0.00</div>
            <Button className="w-full mt-2" size="sm">Send</Button>
          </WidgetShell>

          <WidgetShell title="Donation Profile" headerExtra={<Button style="stroke" tone="neutral" size="xs"><Plus className="size-3" />Donate</Button>} headerNoTitle>
            <div className="space-y-2">
              <div className="text-xs font-medium">Donation Profile</div>
              <SegmentedControl size="sm" value={donTab} onValueChange={setDonTab} className="w-full">
                <SegmentedItem size="sm" value="overview" className="flex-1">Overview</SegmentedItem>
                <SegmentedItem size="sm" value="goal" className="flex-1">Goal</SegmentedItem>
                <SegmentedItem size="sm" value="statistic" className="flex-1">Statistic</SegmentedItem>
              </SegmentedControl>
              <div className="text-center space-y-1">
                <Avatar size="md" className="mx-auto"><AvatarImage src="https://i.pravatar.cc/40?u=arthur" /><AvatarFallback>AT</AvatarFallback></Avatar>
                <div className="text-sm font-medium">Arthur Taylor</div>
                <div className="text-[10px] text-text-sub-600">48 donations in the last year</div>
                <div className="grid grid-cols-2 gap-1.5 mt-2">
                  <div className="rounded-lg border border-stroke-soft-200 p-2 text-center">
                    <div className="text-xs font-medium">$12,000</div>
                    <div className="text-[10px] text-text-soft-400">Total</div>
                  </div>
                  <div className="rounded-lg border border-stroke-soft-200 p-2 text-center">
                    <div className="text-xs font-medium">14-month</div>
                    <div className="text-[10px] text-text-soft-400">Streak</div>
                  </div>
                </div>
              </div>
            </div>
          </WidgetShell>
        </div>

        {/* Net Balance + Major Expenses + Credit Score + Budget Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mt-3">
          <WidgetShell title="Net Balance" seeAll>
            <div className="text-xl font-semibold tabular-nums">$14,460.24</div>
            <Badge size="sm" appearance="lighter" status="success">+5.32%</Badge>
            <svg viewBox="0 0 220 50" className="w-full h-12 mt-1.5">
              <path d="M0 30 Q40 10 80 20 T160 25 T220 15" fill="none" stroke={APEX_BLUE} strokeWidth="1.5" />
            </svg>
          </WidgetShell>

          <WidgetShell title="Major Expenses" headerExtra={<Button style="stroke" tone="neutral" size="xs">Weekly <ChevronDown className="size-3" /></Button>} headerNoTitle>
            <div className="text-xs font-medium mb-2">Major Expenses</div>
            <div className="space-y-1.5">
              {[
                { label: "Housing", v: 95, c: "#3F6FFF" },
                { label: "Utilities", v: 60, c: "#5BC0EB" },
                { label: "Food", v: 25, c: "#7C3AED" },
              ].map((b) => (
                <div key={b.label} className="flex items-center gap-2 text-xs">
                  <div className="w-12 text-text-sub-600">{b.label}</div>
                  <div className="flex-1 h-2 rounded-full bg-bg-weak-50"><div className="h-full rounded-full" style={{ width: `${b.v}%`, background: b.c }} /></div>
                </div>
              ))}
            </div>
          </WidgetShell>

          <WidgetShell title="Credit Score" seeAll>
            <div className="text-xs text-text-sub-600">Your credit score is</div>
            <div className="text-xl font-semibold tabular-nums">790 <Badge size="sm" appearance="lighter" status="success">+0.46%</Badge></div>
            <div className="grid grid-cols-5 gap-1 mt-2">
              {["bg-error-base","bg-error-base","bg-warning-base","bg-success-base","bg-bg-soft-200"].map((b, i) => (
                <div key={i} className={cn("h-1.5 rounded", b)} />
              ))}
            </div>
          </WidgetShell>

          <WidgetShell title="Budget Overview" headerExtra={<Button style="stroke" tone="neutral" size="xs">Yearly <ChevronDown className="size-3" /></Button>} headerNoTitle>
            <div className="text-xs">
              <div className="flex items-center gap-3">
                <KVDot color="#3F6FFF" label="$9,300.00" />
                <KVDot color="#5BC0EB" label="$4,138.00" />
                <KVDot color="#7C3AED" label="$1,200.00" />
              </div>
            </div>
            <StackedBars range={chartRange} onRangeChange={setChartRange} />
          </WidgetShell>
        </div>
      </DocsSection>

      <DocsSection title="Daily Feedback gauge × 5 fills">
        <p className="text-sm text-text-sub-600 max-w-2xl">
          Reusable semi-arc gauge. 0% / 25% / 50% / 75% / 100% fills (Figma node 3789:9678).
        </p>
        <DocsExample
          title="0 / 5 / 10 / 15 / 20 of 20"
          preview={
            <div className="flex items-end gap-3">
              {[0, 5, 10, 15, 20].map((v) => (
                <DailyFeedbackGauge key={v} value={v} max={20} unit="OUT OF 20" />
              ))}
            </div>
          }
          code={`<Gauge value={10} max={20} unit="OUT OF 20" />`}
        />
      </DocsSection>

      <DocsSection title="Date chip + Date strip">
        <p className="text-sm text-text-sub-600 max-w-2xl">
          Tiny tile + horizontal week strip — used in Schedule + Time Off widgets (Figma nodes 3520:2550 + 3520:2567).
        </p>
        <DocsExample
          title="Single chip × 3 states"
          preview={
            <div className="flex items-center gap-2">
              <DateChip day="Fri" date="31" state="default" />
              <DateChip day="Fri" date="31" state="hover" />
              <DateChip day="Fri" date="31" state="active" />
            </div>
          }
          code={`<DateChip day="Fri" date="31" state="active" />`}
        />
        <DocsExample
          title="Week strip"
          preview={
            <DateStrip
              items={[
                { day: "Fri", date: "31" },
                { day: "Sat", date: "01" },
                { day: "Sun", date: "02", active: true },
                { day: "Mon", date: "03" },
                { day: "Tue", date: "04" },
              ]}
            />
          }
          code={`<DateStrip items={[...]} />`}
        />
      </DocsSection>

      <DocsSection title="Notes row">
        <p className="text-sm text-text-sub-600 max-w-2xl">
          Checkbox + title + description + status tags + date. Done state mutes everything (Figma node 3872:24017).
        </p>
        <DocsExample
          title="2 states"
          preview={
            <div className="space-y-2 max-w-md">
              <NoteRow done={false} title="Insert note title here." desc="Insert note description here." tags={["Today", "Waiting Feedback"]} date="Aug 02" />
              <NoteRow done title="Insert note title here." desc="Insert note description here." tags={["Today", "Waiting Feedback"]} date="Aug 02" />
            </div>
          }
          code={`<NoteRow done={false} title="..." desc="..." tags={["Today", "Waiting"]} date="Aug 02" />`}
        />
      </DocsSection>

      <DocsSection title="Time tracker">
        <p className="text-sm text-text-sub-600 max-w-2xl">
          Awaiting / Ongoing states. Mono clock + action button (Figma node 3849:32209).
        </p>
        <DocsExample
          title="Both states"
          preview={
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-md">
              <TimeTracker state="awaiting" />
              <TimeTracker state="ongoing" />
            </div>
          }
          code={`<TimeTracker state="awaiting" />
<TimeTracker state="ongoing" />`}
        />
      </DocsSection>

      <DocsSection title="Subscription / list rows">
        <p className="text-sm text-text-sub-600 max-w-2xl">
          List row primitive — leading element (icon / avatar / brand / monochrome) + title + description + trailing value + chevron. 4 leading types × 2 states (Figma nodes 3167:153 + 3946:4047).
        </p>
        <DocsExample
          title="4 leading types"
          preview={
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-w-2xl">
              <SubscriptionRow leading="icon" title="Insert title here…" date="Feb 12" price="$0.00" />
              <SubscriptionRow leading="avatar" title="Insert title here…" date="Feb 12" price="$0.00" />
              <SubscriptionRow leading="brand-spotify" title="Insert title here…" date="Feb 12" price="$0.00" />
              <SubscriptionRow leading="mono" title="Insert title here…" date="Feb 12" price="$0.00" />
            </div>
          }
          code={`<SubscriptionRow leading="brand-spotify" title="Spotify" price="$9.99" date="May 12" />`}
        />
      </DocsSection>

      <DocsSection title="Person pill">
        <p className="text-sm text-text-sub-600 max-w-2xl">
          Compact assignee pill — avatar + name + optional check (Figma node 3948:25319).
        </p>
        <DocsExample
          title="3 states"
          preview={
            <div className="flex items-center gap-3">
              <PersonPill name="Natalia" state="default" />
              <PersonPill name="Natalia" state="hover" />
              <PersonPill name="Natalia" state="active" />
            </div>
          }
          code={`<PersonPill name="Natalia" state="active" />`}
        />
      </DocsSection>

      <DocsSection title="Bank card + EMV chip glyphs">
        <p className="text-sm text-text-sub-600 max-w-2xl">
          Virtual (light) + Physical (dark) bank cards. 11 EMV chip color glyphs available (Figma nodes 3027:8865 + 3027:8986).
        </p>
        <DocsExample
          title="Virtual + Physical"
          preview={
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-2xl">
              <BankCard variant="virtual" />
              <BankCard variant="physical" />
            </div>
          }
          code={`<BankCard variant="virtual" />
<BankCard variant="physical" />`}
        />
        <DocsExample
          title="EMV chip glyph × 11 colors"
          preview={
            <div className="flex flex-wrap items-center gap-2">
              {[
                "#FFFFFF","#BDBDBD","#7C3AED","#FB7185","#FBBF24","#FCD34D",
                "#86EFAC","#67E8F9","#93C5FD","#F9A8D4","#34D399",
              ].map((c) => (
                <ChipGlyph key={c} color={c} />
              ))}
            </div>
          }
          code={`<ChipGlyph color="#7C3AED" />`}
        />
      </DocsSection>

      <DocsSection title="Stacked bar chart range switcher">
        <p className="text-sm text-text-sub-600 max-w-2xl">
          3-color stacked bar chart with 4 time ranges — Monthly / Weekly / Bi-monthly / Quarterly (Figma nodes 3963:6847 + 3963:6854).
        </p>
        <DocsExample
          title="4 ranges"
          preview={
            <div className="space-y-3 max-w-2xl">
              <SegmentedControl size="sm" value={chartRange} onValueChange={setChartRange}>
                <SegmentedItem size="sm" value="monthly">Monthly</SegmentedItem>
                <SegmentedItem size="sm" value="weekly">Weekly</SegmentedItem>
                <SegmentedItem size="sm" value="bimonth">Bi-month</SegmentedItem>
                <SegmentedItem size="sm" value="quarterly">Quarterly</SegmentedItem>
              </SegmentedControl>
              <StackedBars range={chartRange} onRangeChange={setChartRange} hideSegment />
            </div>
          }
          code={`<StackedBars range="monthly" />`}
        />
      </DocsSection>

      <DocsSection title="Discount promo cards">
        <p className="text-sm text-text-sub-600 max-w-2xl">
          9 brand discount promo cards w/ corner artwork (Figma node 3946:16805).
        </p>
        <DocsExample
          title="9-card grid"
          preview={
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-w-4xl">
              {[
                { brand: "Apple Music", color: "#4285F4" },
                { brand: "Spotify", color: "#1DB954" },
                { brand: "Grove Shark", color: "#FF5500" },
                { brand: "YouTube Music", color: "#FF0000" },
                { brand: "Netflix", color: "#E50914" },
                { brand: "Microsoft Office", color: "#EA3E23" },
                { brand: "Creative Cloud", color: "#FA0F00" },
                { brand: "Twitch", color: "#9146FF" },
                { brand: "Mailchimp", color: "#FFE01B" },
              ].map((p) => (
                <DiscountCard key={p.brand} brand={p.brand} color={p.color} />
              ))}
            </div>
          }
          code={`<DiscountCard brand="Spotify" color="#1DB954" />`}
        />
      </DocsSection>

      <DocsSection title="Empty states">
        <p className="text-sm text-text-sub-600 max-w-2xl">
          Every widget body falls back to an empty state when data is missing. Common pattern: muted illustration + reassuring text + optional CTA (Figma node 3710:12493).
        </p>
        <DocsExample
          title="Schedule tabs empty"
          preview={
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {[
                { icon: VideoChat, label: "meetings" },
                { icon: Gift, label: "events" },
                { icon: Plane, label: "holiday" },
              ].map((s) => (
                <WidgetShell key={s.label} title={`Schedule · ${s.label}`} headerNoTitle>
                  <EmptyState
                    icon={s.icon}
                    text={`No records of ${s.label} yet. Please check back later.`}
                    cta="Request"
                  />
                </WidgetShell>
              ))}
            </div>
          }
          code={`<EmptyState
  icon={Plane}
  text="No records of holiday yet."
  cta="Request"
/>`}
        />
      </DocsSection>

      <DocsSection title="API surface">
        <DocsPropsTable
          rows={[
            { name: "WidgetShell.title", type: "ReactNode", description: "Widget heading (or full custom header)." },
            { name: "WidgetShell.seeAll", type: "boolean | string", description: "Render trailing See All link." },
            { name: "WidgetShell.headerExtra", type: "ReactNode", description: "Custom slot in header right side." },
            { name: "WidgetShell.children", type: "ReactNode", description: "Body content." },
            { name: "Gauge.value / max / unit", type: "number / number / string", description: "Semi-arc gauge." },
            { name: "DateChip.state", type: '"default" | "hover" | "active"', description: "Day tile state." },
            { name: "TimeTracker.state", type: '"awaiting" | "ongoing"', description: "Tracker mode." },
            { name: "SubscriptionRow.leading", type: '"icon" | "avatar" | "brand-spotify" | "mono"', description: "Leading element type." },
            { name: "PersonPill.state", type: '"default" | "hover" | "active"', description: "Pill state." },
            { name: "BankCard.variant", type: '"virtual" | "physical"', description: "Card surface." },
            { name: "StackedBars.range", type: '"monthly" | "weekly" | "bimonth" | "quarterly"', description: "Bar groupings." },
          ]}
        />
      </DocsSection>
    </DocsPageShell>
  )
}

/* ============================================================================ */
/*  COMPONENTS                                                                  */
/* ============================================================================ */

function WidgetShell({
  title,
  seeAll,
  headerExtra,
  headerNoTitle,
  children,
}: {
  title: React.ReactNode
  seeAll?: boolean | string
  headerExtra?: React.ReactNode
  headerNoTitle?: boolean
  children: React.ReactNode
}) {
  return (
    <div className="rounded-2xl border border-stroke-soft-200 bg-bg-white-0 p-3 shadow-sm space-y-2">
      <div className="flex items-center gap-2">
        {headerNoTitle ? title : <div className="text-sm font-medium text-text-strong-950">{title}</div>}
        <div className="ml-auto inline-flex items-center gap-1.5">
          {headerExtra}
          {seeAll ? <LinkButton size="sm">{typeof seeAll === "string" ? seeAll : "See All"}</LinkButton> : null}
        </div>
      </div>
      {children}
    </div>
  )
}

function EmptyState({ icon: Icon, text, cta }: { icon?: React.ElementType; text: string; cta?: string }) {
  return (
    <div className="flex flex-col items-center gap-2 py-6 text-center">
      <span className="inline-flex size-10 items-center justify-center rounded-full bg-bg-weak-50">
        {Icon ? <Icon className="size-5 text-icon-soft-400" /> : <CalendarI className="size-5 text-icon-soft-400" />}
      </span>
      <p className="text-xs text-text-sub-600 max-w-[18ch]">{text}</p>
      {cta ? <Button style="stroke" tone="neutral" size="xs"><Plus className="size-3" />{cta}</Button> : null}
    </div>
  )
}

function DailyFeedbackGauge({
  value,
  max,
  unit,
  smaller,
}: {
  value: number
  max: number
  unit: string
  smaller?: boolean
}) {
  const ratio = value / max
  const circumference = Math.PI * 30
  const offset = circumference * (1 - ratio)
  const size = smaller ? "h-12" : "h-16"
  return (
    <div className={cn("relative w-32", size)}>
      <svg viewBox="0 0 100 50" className="w-full h-full">
        <path d="M10 45 A35 35 0 1 1 90 45" fill="none" stroke="#E5E5E5" strokeWidth="6" strokeLinecap="round" />
        <path
          d="M10 45 A35 35 0 1 1 90 45"
          fill="none"
          stroke="#7C3AED"
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-end pb-1">
        <div className={cn("font-semibold tabular-nums", smaller ? "text-base" : "text-xl")}>{value}</div>
        <div className="text-[9px] uppercase tracking-wider text-text-soft-400">{unit}</div>
      </div>
    </div>
  )
}

function NoteRow({ done, title, desc, tags, date }: { done: boolean; title: string; desc: string; tags: string[]; date: string }) {
  return (
    <div className={cn("rounded-lg p-2.5 space-y-1.5", done ? "opacity-60" : "")}>
      <div className="flex items-start gap-2">
        <span className={cn("inline-flex size-4 items-center justify-center rounded-full border mt-0.5", done ? "bg-success-base border-success-base text-white" : "border-stroke-soft-200")}>
          {done ? <Check className="size-2.5" /> : null}
        </span>
        <div className="flex-1 min-w-0">
          <div className={cn("text-sm font-medium", done && "line-through")}>{title}</div>
          <div className="text-xs text-text-sub-600">{desc}</div>
        </div>
        <div className="text-xs text-text-sub-600 inline-flex items-center gap-1">
          <CalendarI className="size-3" />
          {date}
        </div>
      </div>
      <div className="flex flex-wrap gap-1.5 pl-6">
        {tags.map((t, i) => (
          <span key={t} className={cn("inline-flex items-center rounded-full px-2 h-5 text-[10px]", i === 0 ? "bg-error-lighter text-error-darker" : "bg-warning-lighter text-warning-darker", done && "bg-bg-weak-50 text-text-soft-400")}>
            {t}
          </span>
        ))}
      </div>
    </div>
  )
}

function DateChip({ day, date, state = "default" }: { day: string; date: string; state?: "default" | "hover" | "active" }) {
  return (
    <div
      className={cn(
        "inline-flex flex-col items-center rounded-lg border h-12 w-12 justify-center transition-colors",
        state === "default" && "border-stroke-soft-200 bg-bg-white-0",
        state === "hover" && "border-stroke-soft-200 bg-bg-weak-50",
        state === "active" && "bg-(--primary-base) border-(--primary-base) text-white",
      )}
    >
      <span className={cn("text-[10px]", state === "active" ? "text-white/80" : "text-text-sub-600")}>{day}</span>
      <span className={cn("text-sm font-medium tabular-nums", state === "active" ? "text-white" : "text-text-strong-950")}>{date}</span>
    </div>
  )
}

function DateStrip({ items }: { items: { day: string; date: string; active?: boolean }[] }) {
  return (
    <div className="inline-flex items-center gap-1">
      <CompactButton variant="ghost" size="sm" aria-label="Prev"><ChevronLeft /></CompactButton>
      {items.map((it) => (
        <DateChip key={`${it.day}-${it.date}`} day={it.day} date={it.date} state={it.active ? "active" : "default"} />
      ))}
      <CompactButton variant="ghost" size="sm" aria-label="Next"><ChevronRight /></CompactButton>
    </div>
  )
}

function ProjectPicker({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <button
      type="button"
      onClick={() => onChange(value)}
      className="inline-flex items-center gap-2 rounded-lg border border-stroke-soft-200 bg-bg-weak-50 px-2.5 h-9 w-full text-sm"
    >
      <span className="inline-flex size-5 items-center justify-center rounded-md bg-white"><Briefcase className="size-3.5 text-icon-sub-600" /></span>
      <span className="flex-1 text-left truncate">{value}</span>
      <ChevronDown className="size-3.5 text-text-soft-400" />
    </button>
  )
}

function TimeTracker({ state = "awaiting", onToggle }: { state?: "awaiting" | "ongoing"; onToggle?: () => void }) {
  return (
    <div className="rounded-xl border border-stroke-soft-200 bg-bg-white-0 p-3 text-center">
      <div className="text-xs text-text-soft-400 mb-1.5">{state === "ongoing" ? "ongoing" : "Awaiting"}</div>
      <div className="font-mono text-2xl font-medium tabular-nums">
        {state === "ongoing" ? "02:44" : "00:00"}<span className="text-text-soft-400">:{state === "ongoing" ? "22" : "00"}</span>
      </div>
      {state === "awaiting" ? (
        <button onClick={onToggle} className="inline-flex items-center gap-1 text-(--primary-base) font-medium text-sm mt-2">
          <Play className="size-4" /> Start Time Tracker
        </button>
      ) : (
        <div className="flex items-center justify-center gap-3 mt-2">
          <button onClick={onToggle} className="inline-flex items-center gap-1 text-sm">
            <Pause className="size-4" /> Pause
          </button>
          <span className="text-text-soft-400">|</span>
          <button onClick={onToggle} className="inline-flex items-center gap-1 text-error-base text-sm">
            <Stop className="size-4" /> Stop
          </button>
        </div>
      )}
    </div>
  )
}

function SubscriptionRow({
  leading = "icon",
  title,
  price,
  date,
}: {
  leading?: "icon" | "avatar" | "brand-spotify" | "mono"
  title: string
  price: string
  date: string
}) {
  const leadingEl =
    leading === "avatar" ? (
      <Avatar size="sm"><AvatarImage src="https://i.pravatar.cc/40?u=sub" /></Avatar>
    ) : leading === "brand-spotify" ? (
      <span className="inline-flex size-7 items-center justify-center rounded-full bg-[#1DB954] text-white text-xs font-bold">♫</span>
    ) : leading === "mono" ? (
      <span className="inline-flex size-7 items-center justify-center rounded-full border border-stroke-soft-200 bg-bg-white-0"><More className="size-3.5 text-icon-soft-400" /></span>
    ) : (
      <span className="inline-flex size-7 items-center justify-center rounded-full bg-[#E0F2FE] text-[#0EA5E9]"><Lightbulb className="size-3.5" /></span>
    )
  return (
    <div className="flex items-center gap-2.5 rounded-lg hover:bg-bg-weak-50 p-2 text-xs">
      {leadingEl}
      <div className="flex-1 min-w-0">
        <div className="font-medium truncate text-sm">{title}</div>
        <div className="text-text-sub-600 truncate">Insert description here…</div>
      </div>
      <div className="text-right">
        <div className="font-medium tabular-nums">{price}</div>
        <div className="text-text-sub-600">{date}</div>
      </div>
      <ChevronRight className="size-4 text-text-soft-400" />
    </div>
  )
}

function PersonPill({ name, state = "default" }: { name: string; state?: "default" | "hover" | "active" }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border h-7 pl-1 pr-2.5 text-sm",
        state === "default" && "border-stroke-soft-200 bg-bg-white-0",
        state === "hover" && "border-stroke-soft-200 bg-bg-weak-50",
        state === "active" && "border-stroke-soft-200 bg-bg-weak-50",
      )}
    >
      <Avatar size="xs"><AvatarFallback>{name[0]}</AvatarFallback></Avatar>
      <span>{name}</span>
      {state === "active" ? (
        <span className="inline-flex size-3.5 items-center justify-center rounded-full bg-success-base text-white">
          <Check className="size-2" />
        </span>
      ) : null}
    </span>
  )
}

function BankCard({ variant = "virtual" }: { variant?: "virtual" | "physical" }) {
  const dark = variant === "physical"
  return (
    <div className={cn("relative h-40 rounded-2xl border p-3 overflow-hidden", dark ? "bg-bg-strong-950 text-white border-bg-strong-950" : "bg-bg-white-0 border-stroke-soft-200")}>
      <div className="flex items-center gap-2">
        {dark ? <ChipGlyph color="#FBBF24" /> : <span className="inline-flex size-9 items-center justify-center rounded-full" style={{ background: APEX_BLUE }}><CardIcon className="size-5 text-white" /></span>}
        <Wifi className={cn("size-3.5", dark ? "text-white/60" : "text-text-soft-400")} />
        {!dark ? <Badge size="sm" appearance="lighter" status="success"><Check className="size-3" />Active</Badge> : null}
        <div className="ml-auto flex gap-0.5">
          <span className="inline-block size-5 rounded-full bg-[#EB001B]" />
          <span className="inline-block size-5 rounded-full bg-[#F79E1B] -ml-2" />
        </div>
      </div>
      <div className="absolute bottom-3 left-3 right-3">
        <div className={cn("text-xs", dark ? "text-white/60" : "text-text-sub-600")}>{dark ? "Cardholder Name" : "Savings Card"}</div>
        <div className="text-xl font-semibold tabular-nums">{dark ? "Arthur Taylor" : "$16,058.94"}</div>
      </div>
      {!dark ? (
        <div className="absolute bottom-3 right-3 flex gap-1">
          <button className="inline-flex size-5 items-center justify-center rounded-full border border-stroke-soft-200"><ChevronLeft className="size-3 text-icon-soft-400" /></button>
          <button className="inline-flex size-5 items-center justify-center rounded-full border border-stroke-soft-200"><ChevronRight className="size-3 text-icon-soft-400" /></button>
        </div>
      ) : null}
    </div>
  )
}

function ChipGlyph({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 32 24" className="size-8" aria-hidden>
      <rect x="1" y="1" width="30" height="22" rx="4" fill={color} stroke="#000" strokeOpacity="0.1" />
      <rect x="6" y="6" width="20" height="12" rx="2" fill="none" stroke="#000" strokeOpacity="0.2" />
      <line x1="6" y1="12" x2="26" y2="12" stroke="#000" strokeOpacity="0.2" />
      <line x1="16" y1="6" x2="16" y2="18" stroke="#000" strokeOpacity="0.2" />
    </svg>
  )
}

function ScheduleCard({
  title,
  time,
  avatars,
  channel,
  badge,
  location,
  attendees,
  organizer,
  emoji,
  description,
  subtitle,
}: {
  title: string
  time: string
  avatars?: string[]
  channel?: string
  badge?: { label: string; tone: "warning" | "purple" | "success" | "information" }
  location?: string
  attendees?: string
  organizer?: string
  emoji?: string
  description?: string
  subtitle?: string
}) {
  const badgeCls = badge
    ? {
        warning: "bg-warning-lighter text-warning-darker",
        purple: "bg-(--primary-alpha-10) text-(--primary-base)",
        success: "bg-success-lighter text-success-darker",
        information: "bg-information-lighter text-information-darker",
      }[badge.tone]
    : ""
  return (
    <div className="rounded-lg border border-stroke-soft-200 bg-bg-white-0 p-2.5 space-y-1.5">
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="text-sm font-medium text-text-strong-950">{title}</div>
          <div className="text-xs text-text-sub-600">{time}</div>
        </div>
        {badge ? (
          <span className={cn("inline-flex items-center rounded-full px-2 h-5 text-[10px]", badgeCls)}>{badge.label}</span>
        ) : (
          <CompactButton variant="ghost" size="sm" aria-label="Toggle"><ChevronDown /></CompactButton>
        )}
      </div>
      {avatars ? (
        <div className="flex -space-x-1.5">
          {avatars.map((a) => (
            <Avatar key={a} size="xs"><AvatarImage src={`https://i.pravatar.cc/40?u=${a}`} /></Avatar>
          ))}
          <span className="inline-flex size-5 items-center justify-center rounded-full bg-bg-weak-50 text-[10px] text-text-sub-600 border-2 border-bg-white-0">+4</span>
        </div>
      ) : null}
      {location ? <div className="text-xs text-text-sub-600 inline-flex items-center gap-1"><MapPin className="size-3 text-(--primary-base)" />{location}</div> : null}
      {channel ? <div className="text-xs text-text-sub-600">{channel}</div> : null}
      {organizer || attendees ? (
        <div className="flex items-center justify-between text-xs text-text-sub-600">
          <span>{organizer}</span>
          {attendees ? <span className="inline-flex items-center gap-1"><UserI className="size-3" />{attendees}</span> : null}
        </div>
      ) : null}
      {emoji && description ? (
        <div className="text-xs text-text-strong-950 inline-flex items-center gap-1">
          <span>{emoji}</span>{description}
        </div>
      ) : null}
      {subtitle ? <div className="text-xs text-text-sub-600">{subtitle}</div> : null}
    </div>
  )
}

function KV({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-2 text-xs">
      <span className="text-text-sub-600">{label}</span>
      <span>{value}</span>
    </div>
  )
}

function KVDot({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className="inline-block size-2 rounded-full" style={{ background: color }} />
      <span className="tabular-nums font-medium">{label}</span>
    </span>
  )
}

function StackedBars({ range, onRangeChange, hideSegment }: { range: string; onRangeChange?: (r: string) => void; hideSegment?: boolean }) {
  const cols = range === "monthly" ? 12 : range === "weekly" ? 7 : range === "bimonth" ? 6 : 4
  const labels =
    range === "monthly"
      ? ["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"]
      : range === "weekly"
        ? ["M", "T", "W", "T", "F", "S", "S"]
        : range === "bimonth"
          ? ["Jan-Feb", "Mar-Apr", "May-Jun", "Jul-Aug", "Sep-Oct", "Nov-Dec"]
          : ["Q1", "Q2", "Q3", "Q4"]
  return (
    <div className="space-y-1.5">
      {!hideSegment && onRangeChange ? (
        <SegmentedControl size="sm" value={range} onValueChange={onRangeChange}>
          <SegmentedItem size="sm" value="monthly">Monthly</SegmentedItem>
          <SegmentedItem size="sm" value="weekly">Weekly</SegmentedItem>
          <SegmentedItem size="sm" value="bimonth">Bi-month</SegmentedItem>
          <SegmentedItem size="sm" value="quarterly">Quarterly</SegmentedItem>
        </SegmentedControl>
      ) : null}
      <div className={cn("grid gap-1 h-16 items-end")} style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}>
        {Array.from({ length: cols }).map((_, i) => (
          <div key={i} className="flex flex-col-reverse gap-0.5 h-full">
            <div className="bg-[#7C3AED] rounded-b-sm" style={{ height: "10%" }} />
            <div className="bg-[#5BC0EB]" style={{ height: "30%" }} />
            <div className="bg-[#3F6FFF] rounded-t-sm" style={{ height: "55%" }} />
          </div>
        ))}
      </div>
      <div className="grid gap-1 text-[10px] text-text-soft-400" style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}>
        {labels.map((l) => (
          <span key={l} className="text-center truncate">{l}</span>
        ))}
      </div>
    </div>
  )
}

function DiscountCard({ brand, color }: { brand: string; color: string }) {
  return (
    <div className="relative overflow-hidden rounded-xl border border-stroke-soft-200 bg-bg-white-0 p-3">
      <div className="absolute -top-4 -right-4 size-20 rounded-full" style={{ background: `${color}33` }} />
      <div className="absolute -top-2 -right-2 size-16 rounded-full" style={{ background: `${color}66` }} />
      <span className="relative inline-flex size-7 items-center justify-center rounded-full text-white text-xs font-bold" style={{ background: color }}>
        {brand[0]}
      </span>
      <div className="relative text-sm font-medium text-text-strong-950 mt-2">50% discount on {brand}</div>
      <div className="text-xs text-text-sub-600">For only $4.99 per month! <a className="underline">Learn More</a></div>
    </div>
  )
}
