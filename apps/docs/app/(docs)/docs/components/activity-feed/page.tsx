"use client"

import * as React from "react"
import {
  RiFileTextLine as File,
  RiChat3Line as Chat,
  RiCalendarLine as Calendar,
  RiErrorWarningLine as Risk,
  RiSearchLine as Search,
  RiEditLine as Pen,
  RiArrowUpLine as ArrowUp,
  RiMailLine as Mail,
  RiFileTextLine as Report,
  RiShieldCheckLine as Shield,
  RiUser3Line as UserIcon,
  RiTimeLine as ClockIcon,
} from "@remixicon/react"
import {
  ActivityFeed,
  ActivityFeedItem,
  ActivityFeedKeyIcon,
  ActivityFeedFile,
  ActivityFeedComment,
  ActivityFeedTask,
  ActivityFeedFilter,
} from "@/registry/dash/ui/activity-feed"
import { Switch } from "@/registry/dash/ui/switch"
import {
  DocsPageShell,
  DocsHeader,
  DocsSection,
  DocsExample,
  DocsPropsTable,
  DocsDoDont,
} from "@/components/docs/page-shell"

/**
 * ActivityFeed — Figma 1:1 (9 nodes verified 2026-05-17).
 *
 *   166035:46833    Base spec — 5 item types (default / file / comment / avatar group / tasks)
 *   165967:3881     Filter pill — 3 states (default / hover / selected)
 *   165967:4028     File chip — default + hover
 *   166017:612      Comment chip — default + hover
 *   166035:47290    Task chip — 4 statuses (success / warning / pending / error)
 *   165978:43548    Comprehensive Activity panel — light
 *   166707:8700     Comprehensive Activity panel — dark (auto via `.dark`)
 *   166035:48937    Threaded comments + Add comment input
 *   166707:8774     Activity timeline — vertical-line linear variant
 */

const me = { name: "Wei Chen",  initials: "WC" }
const so = { name: "Sophia Williams", initials: "SW" }
const jb = { name: "James Brown", initials: "JB" }
const lm = { name: "Lena Muller", initials: "L"  }
const rp = { name: "Ravi Patel", initials: "R"  }
const jo = { name: "Juma Omondi", initials: "J"  }
const lp = { name: "Laura Perez", initials: "L"  }
const ew = { name: "Emma Wright", initials: "E"  }

export default function ActivityFeedDocsPage() {
  const [tab, setTab] = React.useState<"all" | "files" | "comments" | "meetings" | "risk">("all")
  const [showAll, setShowAll] = React.useState(true)
  const [comment, setComment] = React.useState("")

  return (
    <DocsPageShell>
      <DocsHeader
        status="beta"
        kind="composite"
        category="Components / Disclosure"
        title="Activity Feed"
        description="Chronological list of who-did-what-when. Five item types (default / file / comment / avatar group / tasks) composed under one ActivityFeedItem shell. Pair with the filter pill row for tabbed feeds, the comment thread variant for replies, and the timeline variant for compact detail pages."
      />

      <DocsSection title="Base">
        <DocsExample
          title="All five payload variants in one feed"
          preview={
            <ActivityFeed className="max-w-xl">
              <ActivityFeedItem user={me} action="uploaded" target="Q2 financial report" timestamp="4 min ago" more />
              <ActivityFeedItem user={me} action="uploaded" target="Q2 financial report" timestamp="4 min ago" more>
                <ActivityFeedFile name="apex-report.pdf" size="4mb" onDownload={() => {}} />
                <ActivityFeedFile name="apex-report.pdf" size="4mb" onDownload={() => {}} />
              </ActivityFeedItem>
              <ActivityFeedItem user={me} action="uploaded" target="Q2 financial report" timestamp="4 min ago" more>
                <ActivityFeedComment body="How are you qualifying enterprise leads?" onReply={() => {}} />
              </ActivityFeedItem>
              <ActivityFeedItem user={me} action="uploaded" target="Q2 financial report" timestamp="4 min ago" more>
                <div className="inline-flex items-center gap-1 rounded-full bg-bg-weak-50 border border-stroke-soft-200 px-2 py-1">
                  <div className="flex -space-x-2">
                    {["A","B","C"].map((c) => (
                      <span key={c} className="size-5 rounded-full bg-(--primary-alpha-16) text-primary text-[10px] font-medium flex items-center justify-center ring-2 ring-bg-white-0">{c}</span>
                    ))}
                  </div>
                  <span className="text-xs text-text-sub-600 ml-1">+4</span>
                </div>
              </ActivityFeedItem>
              <ActivityFeedItem user={me} action="uploaded" target="Q2 financial report" timestamp="4 min ago" more>
                <ActivityFeedTask state="success" label="12 tasks completed" />
                <ActivityFeedTask state="success" label="12 tasks completed" />
              </ActivityFeedItem>
            </ActivityFeed>
          }
          code={`<ActivityFeed>
  <ActivityFeedItem user={user} action="uploaded" target="Q2 report" timestamp="4 min ago" more>
    <ActivityFeedFile name="apex-report.pdf" size="4mb" onDownload={...} />
  </ActivityFeedItem>
  <ActivityFeedItem ...>
    <ActivityFeedComment body="..." onReply={...} />
  </ActivityFeedItem>
  <ActivityFeedItem ...>
    <ActivityFeedTask state="success" label="12 tasks completed" />
  </ActivityFeedItem>
</ActivityFeed>`}
        />
      </DocsSection>

      <DocsSection title="Filter pill">
        <p className="text-sm text-text-sub-600 max-w-2xl">3 states: default (white bg, soft border), hover (weak-50 bg), selected (primary-alpha-16 bg + primary text + primary icon). Tab through pills with keyboard.</p>
        <DocsExample
          title="Three states"
          preview={
            <div className="flex items-center gap-3">
              <ActivityFeedFilter><File className="size-4" /> Default</ActivityFeedFilter>
              <ActivityFeedFilter className="bg-bg-weak-50"><File className="size-4" /> Hover</ActivityFeedFilter>
              <ActivityFeedFilter selected><File className="size-4" /> Selected</ActivityFeedFilter>
            </div>
          }
          code={`<ActivityFeedFilter><File /> Default</ActivityFeedFilter>
<ActivityFeedFilter selected><File /> Selected</ActivityFeedFilter>`}
        />
      </DocsSection>

      <DocsSection title="File chip">
        <p className="text-sm text-text-sub-600 max-w-2xl">Paperclip + filename + size + download button. Click size area to preview, click download to download.</p>
        <DocsExample
          title="Two states"
          preview={
            <div className="flex items-center gap-3">
              <ActivityFeedFile name="apex-report.pdf" size="4mb" onDownload={() => {}} />
              <ActivityFeedFile name="apex-report.pdf" size="4mb" onDownload={() => {}} className="bg-bg-weak-50" />
            </div>
          }
          code={`<ActivityFeedFile name="apex-report.pdf" size="4mb" onDownload={...} />`}
        />
      </DocsSection>

      <DocsSection title="Comment chip">
        <p className="text-sm text-text-sub-600 max-w-2xl">Speech bubble + body + Reply primary-color link. Truncates body to one line.</p>
        <DocsExample
          title="Two states"
          preview={
            <div className="flex flex-col items-start gap-3">
              <ActivityFeedComment body="How are you qualifying enterprise leads?" onReply={() => {}} />
              <ActivityFeedComment body="How are you qualifying enterprise leads?" onReply={() => {}} className="bg-bg-weak-50" />
            </div>
          }
          code={`<ActivityFeedComment body="How are you qualifying enterprise leads?" onReply={...} />`}
        />
      </DocsSection>

      <DocsSection title="Task chip">
        <p className="text-sm text-text-sub-600 max-w-2xl">Leading status icon + label. 4 statuses map to state-X-base color.</p>
        <DocsExample
          title="success / warning / pending / error"
          preview={
            <div className="flex flex-wrap items-center gap-3">
              <ActivityFeedTask state="success" label="12 tasks completed" />
              <ActivityFeedTask state="warning" label="12 tasks completed" />
              <ActivityFeedTask state="pending" label="12 tasks completed" />
              <ActivityFeedTask state="error"   label="12 tasks completed" />
            </div>
          }
          code={`<ActivityFeedTask state="success" label="12 tasks completed" />
<ActivityFeedTask state="warning" label="12 tasks completed" />
<ActivityFeedTask state="pending" label="12 tasks completed" />
<ActivityFeedTask state="error" label="12 tasks completed" />`}
        />
      </DocsSection>

      <DocsSection title="Activity panel">
        <p className="text-sm text-text-sub-600 max-w-2xl">
          Full panel composition. Header (brand context selector + Show all toggle) + Search + Filter row + Feed. Dark variant (166707:8700) flips automatically via the global `.dark` class on `&lt;html&gt;`.
        </p>
        <DocsExample
          title="Comprehensive SynergyHR panel"
          preview={
            <div className="max-w-2xl space-y-5 p-5 rounded-xl border border-stroke-soft-200 bg-bg-white-0">
              <header className="flex items-center justify-between">
                <h3 className="text-base font-medium text-text-strong-950">Activities</h3>
                <div className="flex items-center gap-4">
                  <button className="inline-flex items-center gap-1.5 text-sm font-medium text-text-strong-950">
                    <span className="size-5 rounded bg-primary text-static-white text-[10px] flex items-center justify-center">▲</span>
                    SynergyHR
                    <svg viewBox="0 0 12 12" className="size-3 text-icon-soft-400"><path fill="currentColor" d="M3 4 L6 8 L9 4 Z" /></svg>
                  </button>
                  <label className="inline-flex items-center gap-2 text-sm text-text-strong-950">
                    Show all activity
                    <Switch checked={showAll} onCheckedChange={setShowAll} />
                  </label>
                </div>
              </header>

              <div className="inline-flex items-center gap-2 w-full h-9 px-3 rounded-md border border-stroke-soft-200 bg-bg-white-0 text-sm text-text-soft-400">
                <Search className="size-4" />
                Search...
                <kbd className="ml-auto text-[10px] px-1 rounded bg-bg-weak-50 text-text-sub-600">⌘1</kbd>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <ActivityFeedFilter selected={tab === "all"} onClick={() => setTab("all")}>All Activities</ActivityFeedFilter>
                <ActivityFeedFilter selected={tab === "files"} onClick={() => setTab("files")}><File className="size-4" /> Files</ActivityFeedFilter>
                <ActivityFeedFilter selected={tab === "comments"} onClick={() => setTab("comments")}><Chat className="size-4" /> Comments</ActivityFeedFilter>
                <ActivityFeedFilter selected={tab === "meetings"} onClick={() => setTab("meetings")}><Calendar className="size-4" /> Meetings</ActivityFeedFilter>
                <ActivityFeedFilter selected={tab === "risk"} onClick={() => setTab("risk")}><Risk className="size-4" /> Risk Alerts</ActivityFeedFilter>
              </div>

              <ActivityFeed>
                <ActivityFeedItem user={me} action="uploaded" target="Q2 financial report" timestamp="4 min ago" more>
                  <ActivityFeedFile name="apex-report.pdf" size="4mb" onDownload={() => {}} />
                  <ActivityFeedFile name="wei-chen.csv" size="16kb" onDownload={() => {}} />
                </ActivityFeedItem>
                <ActivityFeedItem
                  user={{ name: "Investment Commitee", initials: "IC" }}
                  action="Meeting at"
                  target="2:00 PM – 3:30 PM"
                  timestamp="48 min ago"
                  more
                  keyIcon={<ActivityFeedKeyIcon><Calendar className="size-4" /></ActivityFeedKeyIcon>}
                >
                  <div className="inline-flex items-center gap-1 rounded-full bg-bg-weak-50 border border-stroke-soft-200 px-2 py-1">
                    <div className="flex -space-x-2">
                      {["A","B","C"].map((c) => (
                        <span key={c} className="size-5 rounded-full bg-(--primary-alpha-16) text-primary text-[10px] font-medium flex items-center justify-center ring-2 ring-bg-white-0">{c}</span>
                      ))}
                    </div>
                    <span className="text-xs text-text-sub-600 ml-1">+4</span>
                  </div>
                </ActivityFeedItem>
                <ActivityFeedItem user={so} action="commented on your" target="Market Analysis Report" timestamp="6 hours ago" more>
                  <ActivityFeedComment body="How are you qualifying enterprise leads?" onReply={() => {}} />
                </ActivityFeedItem>
                <ActivityFeedItem
                  user={{ name: "Risk System", initials: "!" }}
                  action="detected unusual activity in"
                  target="Account #8842"
                  timestamp="2 days ago"
                  more
                  keyIcon={<ActivityFeedKeyIcon className="text-(--state-error-base) border-(--state-error-light)"><Risk className="size-4" /></ActivityFeedKeyIcon>}
                />
                <ActivityFeedItem
                  user={{ name: "Design Team", initials: "DT" }}
                  action="completed sprint"
                  target="UI Revamp Phase 1"
                  timestamp="4 days ago"
                  more
                  keyIcon={<ActivityFeedKeyIcon><Pen className="size-4" /></ActivityFeedKeyIcon>}
                >
                  <ActivityFeedTask state="success" label="12 tasks completed" />
                  <ActivityFeedTask state="success" label="Sprint 24" />
                </ActivityFeedItem>
                <ActivityFeedItem user={jb} action="updated" target="2024 Strategy Document" timestamp="5 days ago" more>
                  <ActivityFeedFile name="strategy-docs.txt" size="4mb" onDownload={() => {}} />
                </ActivityFeedItem>
              </ActivityFeed>
            </div>
          }
          code={`<ActivityFeed>
  <ActivityFeedItem user={user} action="uploaded" target="report" timestamp="4 min ago" more>
    <ActivityFeedFile name="apex-report.pdf" size="4mb" onDownload={...} />
  </ActivityFeedItem>
  <ActivityFeedItem keyIcon={<ActivityFeedKeyIcon className="text-error-base"><Risk /></ActivityFeedKeyIcon>}
    user={system} action="detected unusual activity in" target="Account #8842" timestamp="2 days ago" more
  />
</ActivityFeed>`}
        />
      </DocsSection>

      <DocsSection title="Threaded comments + input">
        <p className="text-sm text-text-sub-600 max-w-2xl">
          Initials-only colored avatars (matched to status-tone) replace photo avatars. One feed item expands to show a reply card with full body + Reply link. Footer hosts an Add comment composer.
        </p>
        <DocsExample
          title="Audit trail with replies"
          preview={
            <div className="max-w-2xl space-y-4">
              <h3 className="text-base font-medium text-text-strong-950">Activity</h3>
              <ActivityFeed>
                <ActivityFeedItem user={me} action="assigned" target="risk assessment control" timestamp="2 days ago" more />
                <ActivityFeedItem user={lm} action="added document" target="financial-report.pdf" timestamp="3 days ago" more />
                <ActivityFeedItem user={rp} action="uploaded credit risk report" target="signed-policy.pdf" timestamp="4 days ago" more />
                <ActivityFeedItem
                  user={jo}
                  action="submitted for audit review"
                  target={<span className="inline-flex items-center gap-1 text-(--state-away-base)"><ClockIcon className="size-3.5" /> Pending review</span>}
                  timestamp="5 days ago"
                  more
                />
                <ActivityFeedItem
                  user={lp}
                  action="requested changes"
                  target={<span className="inline-flex items-center gap-1 text-(--state-error-base)">✦ Needs revision</span>}
                  timestamp="6 days ago"
                  more
                >
                  <div className="rounded-xl border border-stroke-soft-200 bg-bg-white-0 p-3 max-w-md">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="size-6 rounded-full bg-(--state-error-light) text-(--state-error-dark) text-[11px] font-medium flex items-center justify-center">L</span>
                      <span className="text-sm font-medium text-text-strong-950">Laura Perez</span>
                    </div>
                    <p className="text-sm text-text-sub-600 leading-relaxed">Please revise the risk metrics and review portfolio allocations.</p>
                    <button className="mt-2 text-sm font-medium text-primary hover:underline">Reply</button>
                  </div>
                </ActivityFeedItem>
                <ActivityFeedItem
                  user={ew}
                  action="resubmitted revised report"
                  target={<span className="inline-flex items-center gap-1 text-(--state-success-base)">✓ Approved</span>}
                  timestamp="6 days ago"
                  more
                />
              </ActivityFeed>

              <div className="rounded-xl border border-stroke-soft-200 bg-bg-white-0 px-3 py-2 flex items-center gap-2">
                <input
                  type="text"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Add comment..."
                  className="flex-1 bg-transparent text-sm placeholder:text-text-soft-400 text-text-strong-950 outline-none"
                />
                <button
                  type="button"
                  disabled={!comment.trim()}
                  className="inline-flex items-center justify-center size-7 rounded-md text-icon-sub-600 hover:bg-bg-weak-50 disabled:opacity-50"
                  aria-label="Send"
                >
                  <ArrowUp className="size-4" />
                </button>
              </div>
            </div>
          }
          code={`<ActivityFeedItem user={laura} action="requested changes" target="Needs revision" timestamp="6 days ago" more>
  <div className="rounded-xl border bg-bg-white-0 p-3">
    <header>{laura.name}</header>
    <p>Please revise the risk metrics.</p>
    <button>Reply</button>
  </div>
</ActivityFeedItem>`}
        />
      </DocsSection>

      <DocsSection title="Activity timeline">
        <p className="text-sm text-text-sub-600 max-w-2xl">
          Compact linear variant for detail pages. Each event = leading 16px icon + 2-line label/timestamp. Items chained with a vertical 1px stroke connector.
        </p>
        <DocsExample
          title="Report detail timeline"
          preview={
            <div className="max-w-2xl space-y-5">
              <div>
                <div className="text-xs text-text-soft-400 mb-1">Report detail</div>
                <h3 className="text-lg font-medium text-text-strong-950">
                  TR78221F9-0442 <span className="text-text-soft-400 font-normal text-sm">for $250,000</span>
                </h3>
                <p className="text-sm text-text-sub-600">Due end of quarter</p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <ActivityFeedFilter><span className="text-icon-soft-400">+</span> Add note</ActivityFeedFilter>
                <ActivityFeedFilter>Edit report</ActivityFeedFilter>
                <ActivityFeedFilter>Process transaction</ActivityFeedFilter>
                <ActivityFeedFilter>Send report</ActivityFeedFilter>
                <ActivityFeedFilter>More <svg viewBox="0 0 12 12" className="size-3"><path fill="currentColor" d="M3 4 L6 8 L9 4 Z" /></svg></ActivityFeedFilter>
              </div>

              <div className="grid grid-cols-3 gap-6 pt-4 border-t border-stroke-soft-200">
                {[
                  ["Location", "Frankfurt, Germany"],
                  ["Division", "Asset Management"],
                  ["Email", "lena@dash.com"],
                ].map(([k, v]) => (
                  <div key={k}>
                    <div className="text-xs text-text-soft-400">{k}</div>
                    <div className="text-sm text-text-strong-950 mt-0.5">{v}</div>
                  </div>
                ))}
              </div>

              <div>
                <h4 className="text-sm font-medium text-text-strong-950 mb-3">Activity timeline</h4>
                <ol className="relative space-y-4 before:absolute before:left-[7px] before:top-1.5 before:bottom-1.5 before:w-px before:bg-stroke-soft-200">
                  {[
                    { Icon: Mail,      txt: <>Investment report <strong>#TR78221F9-0442</strong> sent for review</>, ts: "Mar 21, 2024, 3:12 AM" },
                    { Icon: Report,    txt: <><strong>Portfolio analysis verified</strong> by risk team</>,            ts: "Mar 21, 2024, 3:12 AM" },
                    { Icon: Shield,    txt: <>Secure transaction <strong>portal enabled</strong></>,                    ts: "Mar 21, 2024, 3:12 AM" },
                    { Icon: UserIcon,  txt: <>Client <strong>reviewed portfolio</strong> details</>,                 ts: "Mar 22, 2024, 9:45 AM" },
                    { Icon: ClockIcon, txt: <>Reminder sent to <strong>james@dash.com</strong></>,                   ts: "Mar 25, 2024, 3:12 AM" },
                    { Icon: ClockIcon, txt: <>Processing period <strong>extended Q2</strong></>,                     ts: "Mar 28, 2024, 2:30 PM" },
                  ].map((row, i) => (
                    <li key={i} className="relative pl-7">
                      <span className="absolute left-0 top-0.5 size-[15px] rounded-full bg-bg-white-0 inline-flex items-center justify-center">
                        <row.Icon className="size-[14px] text-icon-soft-400" />
                      </span>
                      <div className="text-sm text-text-strong-950">{row.txt}</div>
                      <div className="text-xs text-text-soft-400 mt-0.5">{row.ts}</div>
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          }
          code={`<ol className="relative before:absolute before:left-[7px] before:top-1.5 before:bottom-1.5 before:w-px before:bg-stroke-soft-200">
  {events.map(e => (
    <li className="relative pl-7">
      <span className="absolute left-0 top-0.5"><Icon /></span>
      <div className="text-sm">{e.text}</div>
      <div className="text-xs text-text-soft-400">{e.ts}</div>
    </li>
  ))}
</ol>`}
        />
      </DocsSection>

      <DocsSection title="Do this, not that">
        <p className="text-base text-text-sub-600 leading-relaxed max-w-2xl">
          Activity feed = chronological audit trail. Group by day, lead with the actor, anchor each entry with a relative timestamp. Keep verbs concrete.
        </p>
        <DocsDoDont
          do={{
            preview: (
              <div className="w-full max-w-sm text-left space-y-2">
                <div className="text-[10px] uppercase tracking-wide text-text-soft-400 font-medium">Hari ini</div>
                <div className="text-xs text-text-sub-600"><span className="font-medium text-text-strong-950">Irfan P.</span> men-suspend <span className="font-medium text-text-strong-950">mtr-9412</span> · 4 menit lalu</div>
                <div className="text-xs text-text-sub-600"><span className="font-medium text-text-strong-950">Fayzul</span> approve refund <span className="font-medium text-text-strong-950">DLV-7821</span> · 18 menit lalu</div>
              </div>
            ),
            caption: "Kelompokkan per hari (Hari ini, Kemarin, 12 Mei). Verb spesifik (suspend, approve refund) + target object jelas (mtr-9412, DLV-7821).",
          }}
          dont={{
            preview: (
              <div className="w-full max-w-sm text-left space-y-2">
                <div className="text-xs text-text-sub-600">Update mitra</div>
                <div className="text-xs text-text-sub-600">Action performed</div>
                <div className="text-xs text-text-sub-600">Data changed</div>
              </div>
            ),
            caption: "Verb abstrak (Update, Action performed) tanpa actor + target = log tidak dapat di-audit. Dispatcher tidak tahu siapa yang ubah apa.",
          }}
        />
      </DocsSection>

      <DocsSection title="API">
        <DocsPropsTable
          rows={[
            { name: "ActivityFeedItem.user", type: "{ name; src?; initials? }", description: "Required. Renders the 32×32 avatar + bolds name in title row." },
            { name: "ActivityFeedItem.action", type: "ReactNode", description: "Verb phrase between name and target. Inherits text-sub-600 regular." },
            { name: "ActivityFeedItem.target", type: "ReactNode", description: "Optional bolded target after the verb." },
            { name: "ActivityFeedItem.timestamp", type: "string", description: "Relative time (e.g. '4 min ago'). Rendered text-soft-400 after the ・ separator." },
            { name: "ActivityFeedItem.keyIcon", type: "ReactNode", description: "Optional decorative 32×32 chip rendered LEFT of the avatar — typically ActivityFeedKeyIcon." },
            { name: "ActivityFeedItem.more", type: "boolean | ReactNode", description: "Set to true to render the default 3-dot button; pass a node to override." },
            { name: "ActivityFeedItem.children", type: "ReactNode", description: "Attachment row(s) — pass ActivityFeedFile / ActivityFeedComment / ActivityFeedTask / avatar group." },
            { name: "ActivityFeedFilter.selected", type: "boolean", defaultValue: "false", description: "Active state — primary-alpha-16 bg + primary text + primary icon." },
            { name: "ActivityFeedTask.state", type: '"success" | "warning" | "pending" | "error"', description: "Drives icon glyph + color." },
          ]}
        />
      </DocsSection>
    </DocsPageShell>
  )
}
