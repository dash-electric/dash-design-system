"use client"

import * as React from "react"
import {
  RiAlertLine as AlertTriangle,
  RiTruckLine as Truck,
  RiUserFollowLine as UserCheck,
  RiWalletLine as Wallet,
  RiChat3Line as MessageSquare,
  RiAttachmentLine as Paperclip,
  RiCloseLine as Close,
  RiNotification3Line as Bell,
  RiSettings3Line as Settings,
  RiCheckLine as CheckLine,
} from "@remixicon/react"
import {
  NotificationFeed,
  NotificationItem,
  NotificationGroup,
  NotificationAvatar,
  NotificationAvatarImage,
  NotificationAvatarFallback,
} from "@/registry/dash/ui/notification-feed"
import { Button } from "@/registry/dash/ui/button"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/registry/dash/ui/tabs"
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/registry/dash/ui/popover"
import { CompactButton } from "@/registry/dash/ui/compact-button"
import { Avatar, AvatarImage, AvatarFallback } from "@/registry/dash/ui/avatar"
import {
  DocsPageShell,
  DocsHeader,
  DocsSection,
  DocsExample,
  DocsPropsTable,
} from "@/components/docs/page-shell"
import { DocsCode } from "@/components/docs/code-block"

/**
 * Notification Feed — Figma 1:1 (10 nodes verified 2026-05-18).
 *
 * NotificationFeed + NotificationItem + NotificationGroup primitives compose:
 *   - 4 item content types (Basic / Button / File / Message)
 *   - Unread state (purple dot left edge + tinted bg)
 *   - System event variants (no avatar — icon chip only)
 *   - Group headings (Today / Yesterday / Older)
 *   - Popover panel with Tabs + footer
 *   - Empty state
 *   - Compact mobile sheet
 */

const FileChip = ({ name, size }: { name: string; size: string }) => (
  <div className="inline-flex items-center gap-1.5 rounded-md border border-stroke-soft-200 bg-bg-white-0 px-2 py-1 text-xs">
    <Paperclip className="size-3.5 text-icon-soft-400" />
    <span className="text-text-strong-950">{name}</span>
    <span className="text-text-soft-400">({size})</span>
  </div>
)

const MessageChip = ({ children }: { children: React.ReactNode }) => (
  <div className="inline-flex items-center gap-1.5 rounded-md border border-stroke-soft-200 bg-bg-white-0 px-2 py-1 text-xs text-text-sub-600 max-w-[260px]">
    <MessageSquare className="size-3.5 text-icon-soft-400 shrink-0" />
    <span className="truncate">{children}</span>
  </div>
)

export default function NotificationFeedDocsPage() {
  const [tab, setTab] = React.useState("all")
  const [open, setOpen] = React.useState(false)

  return (
    <DocsPageShell>
      <DocsHeader
        category="Components / Disclosure"
        title="Notification Feed"
        description="Activity inbox composed of 40×40 avatar/icon rows. Items support 4 content types (Basic / Button / File / Message), an unread state with purple dot indicator, and grouping via NotificationGroup headers. Wrap inside a Popover for the bell-icon dropdown variant."
      />

      <DocsSection title="Install">
        <DocsCode language="bash" code={`dash add notification-feed`} />
      </DocsSection>

      <DocsSection title="Item content types">
        <p className="text-sm text-text-sub-600 max-w-2xl">
          Four flavours of NotificationItem: <strong>Basic</strong> (text only), <strong>Button</strong> (inline actions), <strong>File</strong> (attached file chip), <strong>Message</strong> (quoted text snippet).
        </p>
        <DocsExample
          title="4 types stacked"
          preview={
            <NotificationFeed className="max-w-md">
              <NotificationItem
                avatar={<NotificationAvatar><NotificationAvatarImage src="https://i.pravatar.cc/80?u=james" /><NotificationAvatarFallback>JB</NotificationAvatarFallback></NotificationAvatar>}
                title="James Brown commented on your post"
                timestamp="4 min ago"
                description="Reply or react in the discussion"
              />
              <NotificationItem
                avatar={<NotificationAvatar><NotificationAvatarImage src="https://i.pravatar.cc/80?u=sophia" /><NotificationAvatarFallback>SW</NotificationAvatarFallback></NotificationAvatar>}
                title="Sophia Williams invited you to Q2 review"
                timestamp="12 min ago"
                actions={
                  <>
                    <Button size="xs" tone="neutral" style="stroke">Decline</Button>
                    <Button size="xs" tone="primary">Accept</Button>
                  </>
                }
              />
              <NotificationItem
                avatar={<NotificationAvatar><NotificationAvatarImage src="https://i.pravatar.cc/80?u=wei" /><NotificationAvatarFallback>WC</NotificationAvatarFallback></NotificationAvatar>}
                title="Wei Chen uploaded Q2 financial report"
                timestamp="32 min ago"
                actions={<FileChip name="apex-report.pdf" size="4mb" />}
              />
              <NotificationItem
                avatar={<NotificationAvatar><NotificationAvatarImage src="https://i.pravatar.cc/80?u=laura" /><NotificationAvatarFallback>LP</NotificationAvatarFallback></NotificationAvatar>}
                title="Laura Perez left feedback on your draft"
                timestamp="2h ago"
                actions={<MessageChip>Could you double-check the totals on page 3?</MessageChip>}
              />
            </NotificationFeed>
          }
          code={`<NotificationFeed>
  <NotificationItem avatar={<NotificationAvatar />} title="..." timestamp="..." description="..." />
  <NotificationItem ... actions={<><Button>Decline</Button><Button>Accept</Button></>} />
  <NotificationItem ... actions={<FileChip name="apex-report.pdf" size="4mb" />} />
  <NotificationItem ... actions={<MessageChip>...</MessageChip>} />
</NotificationFeed>`}
        />
      </DocsSection>

      <DocsSection title="Unread state">
        <p className="text-sm text-text-sub-600 max-w-2xl">
          Set <code className="text-xs px-1 py-0.5 rounded bg-bg-weak-50">unread</code> to surface the purple dot indicator on the left edge + tinted row bg. Marks the item as needing attention.
        </p>
        <DocsExample
          title="Unread + read mix"
          preview={
            <NotificationFeed className="max-w-md">
              <NotificationItem
                unread
                avatar={<NotificationAvatar><NotificationAvatarImage src="https://i.pravatar.cc/80?u=james-u" /><NotificationAvatarFallback>JB</NotificationAvatarFallback></NotificationAvatar>}
                title="James Brown mentioned you"
                timestamp="just now"
                description="@you can you take a look at this?"
              />
              <NotificationItem
                unread
                avatar={<NotificationAvatar><NotificationAvatarImage src="https://i.pravatar.cc/80?u=emma" /><NotificationAvatarFallback>EW</NotificationAvatarFallback></NotificationAvatar>}
                title="Emma Wright assigned you a new task"
                timestamp="3 min ago"
                description="Audit the Q2 dispatch logs by EOD"
              />
              <NotificationItem
                avatar={<NotificationAvatar><NotificationAvatarImage src="https://i.pravatar.cc/80?u=sophia-r" /><NotificationAvatarFallback>SW</NotificationAvatarFallback></NotificationAvatar>}
                title="Sophia Williams updated her profile photo"
                timestamp="yesterday"
              />
            </NotificationFeed>
          }
          code={`<NotificationItem unread title="..." timestamp="just now" />`}
        />
      </DocsSection>

      <DocsSection title="System events">
        <p className="text-sm text-text-sub-600 max-w-2xl">
          For non-human actors (system, billing, dispatch), drop the avatar and pass an <code className="text-xs px-1 py-0.5 rounded bg-bg-weak-50">icon</code> instead — renders inside a 40×40 rounded chip.
        </p>
        <DocsExample
          title="Truck / Wallet / UserCheck / Alert"
          preview={
            <NotificationFeed className="max-w-md">
              <NotificationItem icon={<Truck />} title="Dispatch #DSP-42 completed" timestamp="2 min ago" description="Driver: James Brown" />
              <NotificationItem icon={<Wallet />} title="Payout of $4,420.35 processed" timestamp="1h ago" description="Bank: Summit Finance" />
              <NotificationItem icon={<UserCheck />} title="KYC verified — driver Laura Perez" timestamp="3h ago" />
              <NotificationItem unread icon={<AlertTriangle className="text-(--state-warning-base)" />} title="Surge mode active in Jakarta Timur" timestamp="4h ago" description="Auto-cleared at 18:00 WIB" />
            </NotificationFeed>
          }
          code={`<NotificationItem icon={<Truck />} title="..." timestamp="..." />
<NotificationItem icon={<AlertTriangle className="text-warning-base" />} title="..." />`}
        />
      </DocsSection>

      <DocsSection title="Grouped — Today / Yesterday / Older">
        <p className="text-sm text-text-sub-600 max-w-2xl">
          Wrap items inside <code className="text-xs px-1 py-0.5 rounded bg-bg-weak-50">NotificationGroup label="…"</code> to stamp a tracking-wider header with the bg-weak-50 row.
        </p>
        <DocsExample
          title="Today + Yesterday + Older"
          preview={
            <NotificationFeed className="max-w-md">
              <NotificationGroup label="Today">
                <NotificationItem unread avatar={<NotificationAvatar><NotificationAvatarImage src="https://i.pravatar.cc/80?u=james-t" /><NotificationAvatarFallback>JB</NotificationAvatarFallback></NotificationAvatar>} title="James Brown sent you a file" timestamp="9:32 AM" actions={<FileChip name="invoice-may.pdf" size="2.4mb" />} />
                <NotificationItem icon={<Truck />} title="Dispatch #DSP-08 on the way" timestamp="9:14 AM" />
              </NotificationGroup>
              <NotificationGroup label="Yesterday">
                <NotificationItem avatar={<NotificationAvatar><NotificationAvatarImage src="https://i.pravatar.cc/80?u=sophia-y" /><NotificationAvatarFallback>SW</NotificationAvatarFallback></NotificationAvatar>} title="Sophia commented on Q2 plan" timestamp="6:14 PM" actions={<MessageChip>Looks good — pushed minor edits.</MessageChip>} />
              </NotificationGroup>
              <NotificationGroup label="Older">
                <NotificationItem icon={<Wallet />} title="Auto-debit succeeded — $1,200.00" timestamp="May 14" />
                <NotificationItem icon={<UserCheck />} title="New mitra onboarded in Bandung" timestamp="May 12" />
              </NotificationGroup>
            </NotificationFeed>
          }
          code={`<NotificationFeed>
  <NotificationGroup label="Today">{...}</NotificationGroup>
  <NotificationGroup label="Yesterday">{...}</NotificationGroup>
  <NotificationGroup label="Older">{...}</NotificationGroup>
</NotificationFeed>`}
        />
      </DocsSection>

      <DocsSection title="Popover panel w/ Tabs + footer">
        <p className="text-sm text-text-sub-600 max-w-2xl">
          Bell-icon dropdown variant. Header (title + Settings + Close) + Tabs (All / Unread / Mentions) + scrollable feed + footer (Mark all as read).
        </p>
        <DocsExample
          title="Bell trigger"
          preview={
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <Button size="icon-sm" tone="neutral" style="stroke" aria-label="Open notifications"><Bell /></Button>
              </PopoverTrigger>
              <PopoverContent align="end" className="w-[420px] p-0 overflow-hidden">
                <header className="flex items-center justify-between px-4 py-3 border-b border-stroke-soft-200">
                  <div className="text-sm font-semibold text-text-strong-950 inline-flex items-center gap-2">
                    Notifications
                    <span className="inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-(--primary-alpha-16) text-primary text-[10px] font-medium">3</span>
                  </div>
                  <div className="inline-flex items-center gap-1">
                    <CompactButton size="sm" variant="ghost" aria-label="Settings"><Settings /></CompactButton>
                    <CompactButton size="sm" variant="ghost" aria-label="Close" onClick={() => setOpen(false)}><Close /></CompactButton>
                  </div>
                </header>
                <Tabs value={tab} onValueChange={setTab}>
                  <TabsList className="px-4 border-b border-stroke-soft-200">
                    <TabsTrigger value="all">All</TabsTrigger>
                    <TabsTrigger value="unread">Unread</TabsTrigger>
                    <TabsTrigger value="mentions">Mentions</TabsTrigger>
                  </TabsList>
                  <TabsContent value="all" className="max-h-[360px] overflow-y-auto">
                    <NotificationFeed className="p-2">
                      <NotificationItem unread avatar={<NotificationAvatar><NotificationAvatarImage src="https://i.pravatar.cc/80?u=james-p" /><NotificationAvatarFallback>JB</NotificationAvatarFallback></NotificationAvatar>} title="James mentioned you in #ops" timestamp="2 min ago" description="@you take a look when you get a sec" />
                      <NotificationItem unread icon={<Truck />} title="Dispatch DSP-42 completed" timestamp="9 min ago" />
                      <NotificationItem avatar={<NotificationAvatar><NotificationAvatarImage src="https://i.pravatar.cc/80?u=laura-p" /><NotificationAvatarFallback>LP</NotificationAvatarFallback></NotificationAvatar>} title="Laura shared a doc with you" timestamp="2h ago" actions={<FileChip name="q2-plan.pdf" size="1.1mb" />} />
                      <NotificationItem icon={<Wallet />} title="Payout sent — $4,420.35" timestamp="yesterday" />
                    </NotificationFeed>
                  </TabsContent>
                  <TabsContent value="unread" className="max-h-[360px] overflow-y-auto">
                    <NotificationFeed className="p-2">
                      <NotificationItem unread avatar={<NotificationAvatar><NotificationAvatarFallback>JB</NotificationAvatarFallback></NotificationAvatar>} title="James mentioned you in #ops" timestamp="2 min ago" />
                      <NotificationItem unread icon={<Truck />} title="Dispatch DSP-42 completed" timestamp="9 min ago" />
                    </NotificationFeed>
                  </TabsContent>
                  <TabsContent value="mentions" className="max-h-[360px] overflow-y-auto">
                    <NotificationFeed className="p-2">
                      <NotificationItem unread avatar={<NotificationAvatar><NotificationAvatarFallback>JB</NotificationAvatarFallback></NotificationAvatar>} title="James mentioned you in #ops" timestamp="2 min ago" />
                    </NotificationFeed>
                  </TabsContent>
                </Tabs>
                <footer className="px-4 py-2.5 border-t border-stroke-soft-200 flex items-center justify-between">
                  <Button size="sm" tone="neutral" style="ghost" leftIcon={<CheckLine />}>Mark all as read</Button>
                  <a href="#" className="text-sm font-medium text-primary hover:underline">View all</a>
                </footer>
              </PopoverContent>
            </Popover>
          }
          code={`<Popover>
  <PopoverTrigger asChild>
    <Button aria-label="Notifications"><Bell /></Button>
  </PopoverTrigger>
  <PopoverContent>
    <Header />
    <Tabs>
      <TabsList>All / Unread / Mentions</TabsList>
      <TabsContent><NotificationFeed>...</NotificationFeed></TabsContent>
    </Tabs>
    <Footer>Mark all as read · View all</Footer>
  </PopoverContent>
</Popover>`}
        />
      </DocsSection>

      <DocsSection title="Empty state">
        <p className="text-sm text-text-sub-600 max-w-2xl">
          When the feed has nothing to show, render a centered icon + title + sub-line.
        </p>
        <DocsExample
          title='"All caught up"'
          preview={
            <div className="max-w-md rounded-xl border border-stroke-soft-200 bg-bg-white-0 p-10 flex flex-col items-center text-center gap-2 shadow-(--shadow-custom-xs)">
              <span className="size-12 rounded-full bg-(--state-success-light) text-(--state-success-dark) inline-flex items-center justify-center">
                <CheckLine className="size-5" />
              </span>
              <div className="text-sm font-semibold text-text-strong-950">You&apos;re all caught up</div>
              <div className="text-xs text-text-sub-600">New notifications will appear here.</div>
            </div>
          }
          code={`<div className="flex flex-col items-center text-center gap-2">
  <span><CheckLine /></span>
  <strong>You're all caught up</strong>
  <p>New notifications will appear here.</p>
</div>`}
        />
      </DocsSection>

      <DocsSection title="Compact mobile">
        <p className="text-sm text-text-sub-600 max-w-2xl">
          On mobile sheets, drop the descriptions and timestamps to a single inline row to maximize density.
        </p>
        <DocsExample
          title="Mobile sheet preview"
          preview={
            <div className="max-w-xs rounded-2xl border border-stroke-soft-200 bg-bg-white-0 p-2 shadow-(--shadow-custom-sm)">
              <NotificationFeed>
                <NotificationItem unread avatar={<Avatar size="md"><AvatarImage src="https://i.pravatar.cc/80?u=mobile-j" /><AvatarFallback>JB</AvatarFallback></Avatar>} title="James — Comment" timestamp="2m" />
                <NotificationItem icon={<Truck />} title="DSP-08 on the way" timestamp="9m" />
                <NotificationItem icon={<Wallet />} title="Payout $1,200" timestamp="1h" />
              </NotificationFeed>
            </div>
          }
          code={`<NotificationFeed>
  <NotificationItem unread title="James — Comment" timestamp="2m" />
  <NotificationItem icon={<Truck />} title="DSP-08 on the way" timestamp="9m" />
</NotificationFeed>`}
        />
      </DocsSection>

      <DocsSection title="API">
        <DocsPropsTable
          rows={[
            { name: "NotificationItem.unread", type: "boolean", defaultValue: "false", description: "Adds purple dot left indicator + tinted bg." },
            { name: "NotificationItem.avatar", type: "ReactNode", description: "40×40 leading slot — pass NotificationAvatar or any 40×40 node." },
            { name: "NotificationItem.icon", type: "ReactNode", description: "Convenience: icon rendered inside a 40×40 rounded chip (no avatar)." },
            { name: "NotificationItem.title", type: "ReactNode", description: "Primary line (text-strong-950, font-medium)." },
            { name: "NotificationItem.timestamp", type: "ReactNode", description: "Sub-line leading text — appears before description with · separator." },
            { name: "NotificationItem.authorIcon", type: "ReactNode", description: "Small 16×16 author/app glyph after the timestamp · separator." },
            { name: "NotificationItem.description", type: "ReactNode", description: "Sub-line trailing text." },
            { name: "NotificationItem.actions", type: "ReactNode", description: "Below-title action row — Button cluster, FileChip, MessageChip, etc." },
            { name: "NotificationGroup.label", type: "ReactNode", description: "Section header (uppercased tracking-widest tracking pill row)." },
          ]}
        />
      </DocsSection>
    </DocsPageShell>
  )
}
