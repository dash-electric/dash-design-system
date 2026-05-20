"use client"

import * as React from "react"
import {
  RiArrowUpSFill as ArrowUp,
  RiArrowDownSFill as ArrowDown,
  RiArrowRightSFill as ArrowRight,
  RiTimeLine as Clock,
  RiVerifiedBadgeFill as Verified,
  RiAddLine as Plus,
  RiSparkling2Fill as Sparkle,
  RiUser3Line as UserIcon,
  RiGridLine as Grid,
  RiMoonLine as Moon,
  RiLogoutBoxLine as Logout,
  RiComputerLine as Monitor,
} from "@remixicon/react"
import { Badge, NumberBadge, StatusBadge, STATUSES } from "@/registry/dash/ui/badge"
import { Avatar, AvatarImage, AvatarFallback, AvatarIndicator } from "@/registry/dash/ui/avatar"
import { Switch } from "@/registry/dash/ui/switch"
import { Button } from "@/registry/dash/ui/button"
import {
  DocsPageShell,
  DocsHeader,
  DocsSection,
  DocsExample,
  DocsPropsTable,
  DocsDoDont,
} from "@/components/docs/page-shell"

/**
 * Badge — Figma 1:1 (8 nodes verified 2026-05-18).
 *
 *   118:2324     Master matrix — 11 statuses × 3 appearances × 5 types × 2 sizes
 *   171:5100     Compact 5-status badge spec (info/success/warning/error/faded × dot/icon)
 *   2939:19645   Vote count card light (directional ▲▼▶ count badges)
 *   2939:19662   same dark
 *   2950:5587    User menu light (PRO tag pill)
 *   2950:5596    same dark
 *   2950:6461    Status Tracker light (absent badge + time-counter badges with clock icon)
 *   2950:6470    same dark
 */

const APPEARANCES = ["filled", "lighter", "stroke"] as const

export default function BadgeDocsPage() {
  return (
    <DocsPageShell>
      <DocsHeader
        status="stable"
        kind="atom"
        category="Components / Data"
        title="Badge"
        description="Pill-shaped status / count / tag indicator. 11 status colors × 3 appearances × 5 type modifiers × 2 sizes. Pair with text labels, status icons, leading dots, trailing counts. For semantic status displays use StatusBadge; for numeric counts use NumberBadge."
      />

      {/* 1. Master matrix — 118:2324 */}
      <DocsSection title="Status × appearance">
        <p className="text-sm text-text-sub-600 max-w-2xl">
          Cross-product of 11 statuses × 3 appearances. Pick status by semantic intent (success / warning / etc.) and appearance by visual weight (filled = highest contrast, lighter = soft tint, stroke = minimal).
        </p>
        <DocsExample
          title="11 × 3 grid"
          preview={
            <div className="space-y-3">
              {APPEARANCES.map((ap) => (
                <div key={ap}>
                  <div className="text-[10px] uppercase tracking-wider text-text-soft-400 mb-2">{ap}</div>
                  <div className="flex flex-wrap items-center gap-2">
                    {STATUSES.map((s) => (
                      <Badge key={`${ap}-${s}`} status={s} appearance={ap}>{s}</Badge>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          }
          code={`<Badge status="success" appearance="filled">success</Badge>
<Badge status="success" appearance="lighter">success</Badge>
<Badge status="success" appearance="stroke">success</Badge>`}
        />
      </DocsSection>

      {/* 2. Type modifiers — 118:2324 row variants */}
      <DocsSection title="Type modifiers">
        <p className="text-sm text-text-sub-600 max-w-2xl">
          5 layout shapes per Badge: default · dot (leading 4px circle) · left-icon · right-icon · counter (trailing numeric pill).
        </p>
        <DocsExample
          title="default / dot / left-icon / right-icon / counter"
          preview={
            <div className="flex flex-wrap items-center gap-3">
              <Badge status="success">Badge</Badge>
              <Badge status="success" type="dot">Badge</Badge>
              <Badge status="success" type="left-icon" icon={<Sparkle />}>Badge</Badge>
              <Badge status="success" type="right-icon" icon={<Sparkle />}>Badge</Badge>
              <Badge status="success" type="counter">12</Badge>
            </div>
          }
          code={`<Badge status="success">Badge</Badge>
<Badge status="success" type="dot">Badge</Badge>
<Badge status="success" type="left-icon" icon={<Sparkle />}>Badge</Badge>
<Badge status="success" type="right-icon" icon={<Sparkle />}>Badge</Badge>
<Badge status="success" type="counter">12</Badge>`}
        />
      </DocsSection>

      {/* 3. Size — 118:2324 */}
      <DocsSection title="Sizes">
        <DocsExample
          title="sm + md"
          preview={
            <div className="flex flex-wrap items-center gap-3">
              <Badge size="sm" status="information">sm 11/16</Badge>
              <Badge size="md" status="information">md 12/16</Badge>
              <Badge size="sm" status="success" type="dot">sm dot</Badge>
              <Badge size="md" status="success" type="dot">md dot</Badge>
            </div>
          }
          code={`<Badge size="sm" status="information">sm</Badge>
<Badge size="md" status="information">md</Badge>`}
        />
      </DocsSection>

      {/* 4. StatusBadge — 171:5100 */}
      <DocsSection title="StatusBadge">
        <p className="text-sm text-text-sub-600 max-w-2xl">
          Higher-level wrapper. 4 variants: dot-stroke / icon-stroke / dot-light / icon-light. Use for status pills with optional pulsing dot (live system health).
        </p>
        <DocsExample
          title="5 statuses × 4 variants"
          preview={
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 max-w-2xl">
              {(["success","warning","error","information","faded"] as const).flatMap((s) =>
                (["icon-stroke","dot-stroke","icon-light","dot-light"] as const).map((v) => (
                  <StatusBadge key={`${s}-${v}`} status={s} variant={v}>Badge</StatusBadge>
                ))
              )}
            </div>
          }
          code={`<StatusBadge status="success" variant="icon-stroke">Badge</StatusBadge>
<StatusBadge status="success" variant="dot-stroke">Badge</StatusBadge>
<StatusBadge status="success" variant="icon-light">Badge</StatusBadge>
<StatusBadge status="success" variant="dot-light">Badge</StatusBadge>`}
        />
      </DocsSection>

      {/* 5. NumberBadge — counter */}
      <DocsSection title="NumberBadge">
        <DocsExample
          title="Numeric counter pills"
          preview={
            <div className="flex flex-wrap items-center gap-3">
              <NumberBadge status="information" value={3} />
              <NumberBadge status="success" value={12} />
              <NumberBadge status="warning" value={42} />
              <NumberBadge status="error" value={99} />
              <NumberBadge status="feature" appearance="filled" value={5} />
            </div>
          }
          code={`<NumberBadge status="error" value={99} />
<NumberBadge status="feature" appearance="filled" value={5} />`}
        />
      </DocsSection>

      {/* 6. Week's Top Contributor — 2939:19645 */}
      <DocsSection title="Vote count card">
        <p className="text-sm text-text-sub-600 max-w-2xl">
          Directional vote count badge — arrow icon + numeric count. Up arrow + success-tint when positive, down arrow + error-tint when negative, neutral when stable.
        </p>
        <DocsExample
          title="Week's Top Contributor"
          preview={
            <div className="rounded-xl border border-stroke-soft-200 bg-bg-white-0 max-w-md shadow-(--shadow-custom-sm)">
              <div className="px-5 py-4 border-b border-stroke-soft-200">
                <h3 className="text-sm font-semibold text-text-strong-950">Week&apos;s Top Contributor</h3>
              </div>
              <ul className="divide-y divide-stroke-soft-200">
                {[
                  { name: "James Brown",     role: "Marketing Manager",  dir: "up"  as const, n: 26 },
                  { name: "Sophia Williams", role: "HR Assistant",       dir: "up"  as const, n: 17 },
                  { name: "Arthur Taylor",   role: "CEO of Apex",         dir: "flat" as const, n: 11 },
                  { name: "Emma Wright",     role: "Front-end Developer", dir: "down" as const, n: 4  },
                ].map((r) => (
                  <li key={r.name} className="flex items-center gap-3 px-5 py-3">
                    <Avatar size="md">
                      <AvatarImage src={`https://i.pravatar.cc/80?u=${r.name}`} />
                      <AvatarFallback>{r.name[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-text-strong-950 truncate">{r.name}</div>
                      <div className="text-xs text-text-soft-400 truncate">{r.role}</div>
                    </div>
                    <Badge
                      status={r.dir === "up" ? "success" : r.dir === "down" ? "error" : "faded"}
                      appearance="lighter"
                      type="left-icon"
                      icon={r.dir === "up" ? <ArrowUp /> : r.dir === "down" ? <ArrowDown /> : <ArrowRight />}
                    >
                      {r.n}
                    </Badge>
                  </li>
                ))}
              </ul>
              <div className="px-5 py-3 border-t border-stroke-soft-200">
                <Button size="sm" tone="neutral" style="stroke" className="w-full" leftIcon={<Plus />}>Upvote</Button>
              </div>
            </div>
          }
          code={`<Badge
  status={dir === "up" ? "success" : dir === "down" ? "error" : "faded"}
  appearance="lighter"
  type="left-icon"
  icon={dir === "up" ? <ArrowUp /> : dir === "down" ? <ArrowDown /> : <ArrowRight />}
>
  {voteCount}
</Badge>`}
        />
      </DocsSection>

      {/* 7. User menu PRO tag — 2950:5587 */}
      <DocsSection title="PRO tag">
        <p className="text-sm text-text-sub-600 max-w-2xl">
          Plan-tier tag next to the account name. Warning-lighter tint reserved for paid / pro tiers.
        </p>
        <DocsExample
          title="Account menu with PRO badge"
          preview={
            <div className="rounded-xl border border-stroke-soft-200 bg-bg-white-0 max-w-sm shadow-(--shadow-custom-md) overflow-hidden">
              <div className="flex items-center gap-3 px-4 py-3 border-b border-stroke-soft-200">
                <Avatar size="lg">
                  <AvatarImage src="https://i.pravatar.cc/100?u=laura-perez" />
                  <AvatarFallback>LP</AvatarFallback>
                  <AvatarIndicator tone="verified" size="lg" position="top-right">
                    <Verified />
                  </AvatarIndicator>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-text-strong-950">Laura Perez</div>
                  <div className="text-xs text-text-sub-600 truncate">laura@dash.com</div>
                </div>
                <Badge status="warning" appearance="lighter" size="sm">PRO</Badge>
              </div>
              <div className="py-2 divide-y divide-stroke-soft-200">
                <div className="px-4 py-2 flex items-center gap-3 hover:bg-bg-weak-50 cursor-pointer"><UserIcon className="size-4 text-icon-soft-400" /><span className="text-sm text-text-strong-950">Account Settings</span></div>
                <div className="px-4 py-2 flex items-center gap-3 hover:bg-bg-weak-50 cursor-pointer"><Grid className="size-4 text-icon-soft-400" /><span className="text-sm text-text-strong-950">Integrations</span></div>
                <div className="px-4 py-2 flex items-center gap-3 hover:bg-bg-weak-50 cursor-pointer">
                  <Moon className="size-4 text-icon-soft-400" />
                  <span className="text-sm text-text-strong-950 flex-1">Dark Mode</span>
                  <Switch />
                </div>
                <div className="px-4 py-2 flex items-center gap-3 hover:bg-bg-weak-50 cursor-pointer"><Logout className="size-4 text-icon-soft-400" /><span className="text-sm text-text-strong-950">Logout</span></div>
              </div>
            </div>
          }
          code={`<Badge status="warning" appearance="lighter" size="sm">PRO</Badge>`}
        />
      </DocsSection>

      {/* 8. Status Tracker — 2950:6461 */}
      <DocsSection title="Status Tracker">
        <p className="text-sm text-text-sub-600 max-w-2xl">
          Team availability list. StatusBadge with leading icon (faded for absent) + Badge counter with clock icon for time-since (away duration).
        </p>
        <DocsExample
          title="Absent + Away with time counter"
          preview={
            <div className="rounded-xl border border-stroke-soft-200 bg-bg-white-0 max-w-md shadow-(--shadow-custom-sm)">
              <div className="flex items-center justify-between px-5 py-3 border-b border-stroke-soft-200">
                <div className="inline-flex items-center gap-2">
                  <Monitor className="size-4 text-icon-soft-400" />
                  <span className="text-sm font-semibold text-text-strong-950">Status Tracker</span>
                </div>
                <Button size="sm" tone="neutral" style="stroke">See All</Button>
              </div>
              <div className="px-5 py-3 border-b border-stroke-soft-200">
                <div className="text-xs text-text-soft-400 mb-2">Absent</div>
                <div className="flex items-center gap-3">
                  <Avatar size="md">
                    <AvatarImage src="https://i.pravatar.cc/80?u=james" />
                    <AvatarFallback>JB</AvatarFallback>
                    <AvatarIndicator tone="offline" size="md" />
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-text-strong-950">James Brown 🩷</div>
                    <div className="text-xs text-text-soft-400 truncate">Replaced by Arthur T.</div>
                  </div>
                  <StatusBadge status="faded" variant="icon-light">Absent</StatusBadge>
                </div>
              </div>
              <div className="px-5 py-3">
                <div className="text-xs text-text-soft-400 mb-2">Away</div>
                <ul className="space-y-3">
                  {[
                    { name: "Sophia Williams", sub: "Synergy",  m: 25 },
                    { name: "Arthur Taylor",   sub: "Apex",      m: 12 },
                    { name: "Emma Wright",     sub: "Pulse",     m: 8  },
                  ].map((r) => (
                    <li key={r.name} className="flex items-center gap-3">
                      <Avatar size="md">
                        <AvatarImage src={`https://i.pravatar.cc/80?u=${r.name}`} />
                        <AvatarFallback>{r.name[0]}</AvatarFallback>
                        <AvatarIndicator tone="away" size="md" />
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-text-strong-950 truncate">{r.name} 🩷</div>
                        <div className="text-xs text-text-soft-400 truncate">{r.sub}</div>
                      </div>
                      <Badge status="away" appearance="lighter" type="left-icon" icon={<Clock />}>{r.m}m</Badge>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          }
          code={`<StatusBadge status="faded" variant="icon-light">Absent</StatusBadge>
<Badge status="away" appearance="lighter" type="left-icon" icon={<Clock />}>25m</Badge>`}
        />
      </DocsSection>

      <DocsSection title="Examples">
        <DocsExample
          title="Mitra status row"
          description="Daftar mitra Dash Express dengan badge status. Active = bisa dispatch, Pending = onboarding belum lengkap, Suspended = kena auto-suspend, Rejected = gagal KYC."
          preview={
            <div className="flex flex-col gap-2 max-w-md">
              {[
                { id: "mtr-9412", name: "Fauzan Kurniawan", status: "success" as const, label: "Active" },
                { id: "mtr-9415", name: "Adi Brahmana", status: "warning" as const, label: "Pending KYC" },
                { id: "mtr-9418", name: "Rizky Pratama", status: "neutral" as const, label: "Suspended" },
                { id: "mtr-9420", name: "Bagus Wijaya", status: "error" as const, label: "Rejected" },
              ].map((m) => (
                <div key={m.id} className="flex items-center justify-between rounded-lg border border-stroke-soft-200 bg-bg-white-0 px-3 py-2">
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-text-strong-950">{m.name}</span>
                    <span className="text-xs text-text-sub-600">{m.id}</span>
                  </div>
                  <Badge status={m.status} appearance="lighter" type="dot">{m.label}</Badge>
                </div>
              ))}
            </div>
          }
          code={`<Badge status="success" appearance="lighter" type="dot">Active</Badge>
<Badge status="warning" appearance="lighter" type="dot">Pending KYC</Badge>
<Badge status="neutral" appearance="lighter" type="dot">Suspended</Badge>
<Badge status="error" appearance="lighter" type="dot">Rejected</Badge>`}
        />

        <DocsExample
          title="Dispatch queue counter"
          description="NumberBadge sebagai unread / outstanding counter di sidebar Halo-dash. Lighter agar tidak compete dengan navigation icon."
          preview={
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <span className="text-sm text-text-strong-950">Antrian dispatch</span>
                <NumberBadge status="information" appearance="lighter" value={12} />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-text-strong-950">Pending payment</span>
                <NumberBadge status="warning" appearance="lighter" value={3} />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-text-strong-950">Maintenance overdue</span>
                <NumberBadge status="error" appearance="filled" value={8} />
              </div>
            </div>
          }
          code={`<NumberBadge status="information" appearance="lighter" value={12} />
<NumberBadge status="warning" appearance="lighter" value={3} />
<NumberBadge status="error" appearance="filled" value={8} />`}
        />

        <DocsExample
          title="EV battery health tags"
          description="Tag-style badges untuk metadata armada — battery SOH tier, vehicle type, charger compatibility."
          preview={
            <div className="flex flex-wrap items-center gap-2">
              <Badge status="success" appearance="filled" type="left-icon" icon={<Verified />}>SOH 95%</Badge>
              <Badge status="information" appearance="lighter">Motor</Badge>
              <Badge status="feature" appearance="lighter">CCS2</Badge>
              <Badge status="warning" appearance="stroke">Swap due 3d</Badge>
            </div>
          }
          code={`<Badge status="success" appearance="filled" type="left-icon" icon={<Verified />}>SOH 95%</Badge>
<Badge status="information" appearance="lighter">Motor</Badge>
<Badge status="warning" appearance="stroke">Swap due 3d</Badge>`}
        />
      </DocsSection>

      <DocsSection title="Do this, not that">
        <p className="text-base text-text-sub-600 leading-relaxed max-w-2xl">
          Badge labels state, not action. Color = sentimen, bukan random palette. Pending = warning (kuning, "lagi diproses"), bukan error (merah, "ditolak").
        </p>
        <DocsDoDont
          do={{
            preview: (
              <div className="flex flex-wrap items-center gap-2">
                <Badge status="success" appearance="lighter">Active</Badge>
                <Badge status="warning" appearance="lighter">Pending</Badge>
                <Badge status="neutral" appearance="lighter">Suspended</Badge>
                <Badge status="error" appearance="lighter">Rejected</Badge>
              </div>
            ),
            caption: "Pending = warning (kuning) karena status sementara butuh review. Suspended = neutral karena reversible. Rejected = error karena terminal.",
          }}
          dont={{
            preview: (
              <div className="flex flex-wrap items-center gap-2">
                <Badge status="error" appearance="lighter">Active</Badge>
                <Badge status="error" appearance="lighter">Pending</Badge>
                <Badge status="error" appearance="lighter">Suspended</Badge>
              </div>
            ),
            caption: "Semua merah = mitra panik baca status mereka. Pending bukan error, Active jelas bukan merah. Color HARUS map ke sentimen.",
          }}
        />
        <DocsDoDont
          do={{
            preview: (
              <div className="flex items-center gap-2">
                <span className="text-sm">mtr-9412</span>
                <Badge status="success" appearance="lighter" type="dot">Active</Badge>
              </div>
            ),
            caption: "Badge berdampingan dengan ID/nama yang ia labeli. Type dot untuk status compact di list mitra.",
          }}
          dont={{
            preview: (
              <Badge status="success" appearance="filled">CLICK TO ACTIVATE</Badge>
            ),
            caption: "Jangan bikin badge yang clickable / CTA-style. Pakai Button. Badge = label, bukan action trigger.",
          }}
        />
      </DocsSection>

      <DocsSection title="API">
        <DocsPropsTable
          rows={[
            { name: "status", type: '"error" | "warning" | "away" | "success" | "information" | "feature" | "verified" | "highlighted" | "stable" | "faded" | "neutral"', defaultValue: '"neutral"', description: "Semantic color." },
            { name: "appearance", type: '"filled" | "lighter" | "stroke"', defaultValue: '"lighter"', description: "Surface treatment. filled = solid status bg + white text. lighter = -200 tint + status-dark text. stroke = 1px outline status-base + status-base text." },
            { name: "type", type: '"default" | "dot" | "left-icon" | "right-icon" | "counter"', defaultValue: '"default"', description: "Layout shape." },
            { name: "size", type: '"sm" | "md"', defaultValue: '"sm"', description: "11/16 vs 12/16 typography." },
            { name: "icon", type: "ReactNode", description: "Required for type='left-icon' | 'right-icon'." },
            { name: "disabled", type: "boolean", defaultValue: "false", description: "Renders gray outline + disabled-300 text regardless of status/appearance." },
            { name: "StatusBadge.variant", type: '"dot-stroke" | "icon-stroke" | "dot-light" | "icon-light"', defaultValue: '"dot-stroke"', description: "StatusBadge only — dot or icon leading + stroke or light surface." },
            { name: "StatusBadge.pulse", type: "boolean", defaultValue: "false", description: "Pulsing dot for live system health." },
            { name: "NumberBadge", type: "Badge-like, omits type+children", description: "Numeric counter pill — pass count via children." },
          ]}
        />
      </DocsSection>
    </DocsPageShell>
  )
}
