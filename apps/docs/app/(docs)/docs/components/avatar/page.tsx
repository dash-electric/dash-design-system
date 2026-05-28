"use client"

import * as React from "react"
import {
  RiVerifiedBadgeFill as Verified,
  RiStarFill as StarFill,
  RiAddLine as Plus,
  RiCloseLine as Close,
  RiUser3Line as UserIcon,
  RiGlobalLine as Globe,
  RiBriefcaseLine as Briefcase,
  RiMailLine as Mail,
  RiArrowRightLine as ArrowRight,
  RiUserAddLine as UserAdd,
  RiShareLine as Share,
} from "@remixicon/react"
import {
  Avatar,
  AvatarImage,
  AvatarFallback,
  AvatarIndicator,
  AvatarGroup,
  AvatarGroupCount,
} from "@/registry/dash/ui/avatar"
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
 * Avatar — Figma 1:1 (12 nodes verified 2026-05-17).
 *
 *   245:18786    Master matrix — 9 sizes × {image, text, icon, brand-bg} variants
 *   245:18697    Badge indicators — verified / feature / favorite / add / cancel / dot
 *   245:18721    Status dot indicators — online / offline / away / busy / brand
 *   581:6198     AvatarGroup with +N tail (3 sizes)
 *   2906:14962   AvatarGroup +4 tail (compact)
 *   2906:15802   Avatar fallback variants — image / solid BG / memoji / illustration / text / icon
 *   2937:14836   Saved Recipients list — light
 *   2937:14685   Saved Recipients list — dark
 *   2930:5268    Profile card with brand badge
 *   2930:6050    Contact info card with photo + plus badge
 *   2934:10193   Centered profile dialog with online dot
 *   166982:29348 "Thanks for supporting" card with verified badge
 */

const SIZES = ["xs", "sm", "md", "lg", "xl", "2xl", "3xl", "4xl", "5xl"] as const

export default function AvatarDocsPage() {
  return (
    <DocsPageShell>
      <DocsHeader
        status="stable"
        kind="atom"
        category="Components / Data"
        title="Avatar"
        description="User identity glyph. Nine sizes, three shapes, image / text / icon fallback. Compose with AvatarIndicator for status dots or icon badges, AvatarGroup for stacked rosters."
      />

      {/* 1. Sizes — 245:18786 */}
      <DocsSection title="Sizes">
        <p className="text-sm text-text-sub-600 max-w-2xl">
          xs (20) · sm (24) · md (32) · lg (40) · xl (48) · 2xl (56) · 3xl (64) · 4xl (72) · 5xl (80). Match avatar size to row density and surrounding type scale.
        </p>
        <DocsExample
          title="9-step size scale"
          preview={
            <div className="flex items-end flex-wrap gap-4">
              {SIZES.map((s) => (
                <div key={s} className="flex flex-col items-center gap-1.5">
                  <Avatar size={s}>
                    <AvatarFallback className="bg-(--primary-alpha-16) text-primary">JB</AvatarFallback>
                  </Avatar>
                  <span className="text-[10px] text-text-soft-400">{s}</span>
                </div>
              ))}
            </div>
          }
          code={`<Avatar size="md">
  <AvatarImage src="..." />
  <AvatarFallback>JB</AvatarFallback>
</Avatar>`}
        />
      </DocsSection>

      {/* 2. Fallback variants — 2906:15802 */}
      <DocsSection title="Fallback variants">
        <p className="text-sm text-text-sub-600 max-w-2xl">
          Six rendering strategies — pick by available data. Default to image; fall back to text initials; reserve icon for systems / disambiguated unknown users.
        </p>
        <DocsExample
          title="image / solid BG / illustration / text / icon"
          preview={
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 max-w-2xl">
              {[
                { label: "Image",        node: <Avatar size="2xl"><AvatarImage src="https://i.pravatar.cc/120?u=jb" /><AvatarFallback>JB</AvatarFallback></Avatar> },
                { label: "Solid BG",     node: <Avatar size="2xl"><AvatarFallback className="bg-(--state-success-light) text-(--state-success-dark)">JB</AvatarFallback></Avatar> },
                { label: "Illustration", node: <Avatar size="2xl"><AvatarFallback className="bg-(--state-feature-light)"><UserIcon className="size-2/3 text-(--state-feature-dark)" /></AvatarFallback></Avatar> },
                { label: "Text",         node: <Avatar size="2xl"><AvatarFallback className="bg-bg-weak-50 text-text-strong-950 font-semibold">JB</AvatarFallback></Avatar> },
                { label: "Icon",         node: <Avatar size="2xl"><AvatarFallback className="bg-bg-weak-50 text-text-soft-400"><UserIcon className="size-1/2" /></AvatarFallback></Avatar> },
              ].map((v) => (
                <div key={v.label} className="rounded-xl border border-stroke-soft-200 bg-bg-white-0 p-4 flex flex-col items-center gap-3">
                  {v.node}
                  <span className="text-xs text-text-sub-600">{v.label}</span>
                </div>
              ))}
            </div>
          }
          code={`<Avatar size="2xl">
  <AvatarImage src={photo} />
  <AvatarFallback>JB</AvatarFallback>
</Avatar>

<Avatar size="2xl">
  <AvatarFallback className="bg-(--state-success-light) text-(--state-success-dark)">JB</AvatarFallback>
</Avatar>

<Avatar size="2xl">
  <AvatarFallback><UserIcon className="size-1/2" /></AvatarFallback>
</Avatar>`}
        />
      </DocsSection>

      {/* 3. Status dot indicators — 245:18721 */}
      <DocsSection title="Status dot">
        <p className="text-sm text-text-sub-600 max-w-2xl">
          Bottom-right corner dot. 4 tones: online (green) · away (yellow) · busy (red) · offline (gray). Brand glyph variant uses any custom tone.
        </p>
        <DocsExample
          title="4 status tones"
          preview={
            <div className="flex items-center gap-6">
              {(["online", "away", "busy", "offline"] as const).map((t) => (
                <div key={t} className="flex flex-col items-center gap-1.5">
                  <Avatar size="xl">
                    <AvatarFallback className="bg-(--primary-alpha-16) text-primary">JB</AvatarFallback>
                    <AvatarIndicator tone={t} size="xl" />
                  </Avatar>
                  <span className="text-[10px] text-text-soft-400">{t}</span>
                </div>
              ))}
            </div>
          }
          code={`<Avatar size="xl">
  <AvatarImage src={photo} />
  <AvatarFallback>JB</AvatarFallback>
  <AvatarIndicator tone="online" size="xl" />
</Avatar>`}
        />
      </DocsSection>

      {/* 4. Badge indicators — 245:18697 */}
      <DocsSection title="Badge indicator">
        <p className="text-sm text-text-sub-600 max-w-2xl">
          Icon-bearing badge. Pass a 10-12px glyph as child. Auto-upgrades from dot to badge size when children present. 5 preset tones + brand.
        </p>
        <DocsExample
          title="verified / feature / favorite / add / cancel"
          preview={
            <div className="flex items-center gap-6">
              {[
                { tone: "verified" as const, icon: <Verified />, label: "Verified" },
                { tone: "feature"  as const, icon: <StarFill />,  label: "Feature"  },
                { tone: "favorite" as const, icon: <StarFill />,  label: "Favorite" },
                { tone: "add"      as const, icon: <Plus />,      label: "Add"      },
                { tone: "cancel"   as const, icon: <Close />,     label: "Cancel"   },
              ].map((v) => (
                <div key={v.label} className="flex flex-col items-center gap-1.5">
                  <Avatar size="xl">
                    <AvatarFallback className="bg-(--primary-alpha-16) text-primary">JB</AvatarFallback>
                    <AvatarIndicator tone={v.tone} size="xl">
                      {v.icon}
                    </AvatarIndicator>
                  </Avatar>
                  <span className="text-[10px] text-text-soft-400">{v.label}</span>
                </div>
              ))}
            </div>
          }
          code={`<Avatar size="xl">
  <AvatarFallback>JB</AvatarFallback>
  <AvatarIndicator tone="verified" size="xl">
    <Verified />
  </AvatarIndicator>
</Avatar>`}
        />
      </DocsSection>

      {/* 5. AvatarGroup — 581:6198 + 2906:14962 */}
      <DocsSection title="AvatarGroup">
        <p className="text-sm text-text-sub-600 max-w-2xl">
          Stacked avatars sharing a single visual unit. Card ring auto-applied to nested children. Pair with AvatarGroupCount for the +N tail.
        </p>
        <DocsExample
          title="Across 3 sizes"
          preview={
            <div className="space-y-4">
              {(["xl", "lg", "md"] as const).map((s) => (
                <div key={s} className="flex items-center gap-3">
                  <AvatarGroup size={s}>
                    <Avatar><AvatarImage src="https://i.pravatar.cc/100?u=1" /><AvatarFallback>A</AvatarFallback></Avatar>
                    <Avatar><AvatarImage src="https://i.pravatar.cc/100?u=2" /><AvatarFallback>B</AvatarFallback></Avatar>
                    <Avatar><AvatarImage src="https://i.pravatar.cc/100?u=3" /><AvatarFallback>C</AvatarFallback></Avatar>
                    <AvatarGroupCount value={9} />
                  </AvatarGroup>
                  <span className="text-xs text-text-soft-400">{s}</span>
                </div>
              ))}
            </div>
          }
          code={`<AvatarGroup size="xl">
  <Avatar><AvatarImage src={u1} /><AvatarFallback>A</AvatarFallback></Avatar>
  <Avatar><AvatarImage src={u2} /><AvatarFallback>B</AvatarFallback></Avatar>
  <Avatar><AvatarImage src={u3} /><AvatarFallback>C</AvatarFallback></Avatar>
  <AvatarGroupCount value={9} />
</AvatarGroup>`}
        />
      </DocsSection>

      {/* 6. Saved Recipients pattern — 2937:14836 / 2937:14685 */}
      <DocsSection title="Saved Recipients list">
        <p className="text-sm text-text-sub-600 max-w-2xl">
          Compact list pattern: avatar + 2-line identity + account-number badge. Mix photo + initial-fallback avatars in the same list — use status-tone bg for fallbacks to stay tonally varied.
        </p>
        <DocsExample
          title="Recipient roster"
          preview={
            <div className="rounded-xl border border-stroke-soft-200 bg-bg-white-0 p-4 max-w-sm">
              <div className="text-xs text-text-soft-400 mb-3">Saved Recipients</div>
              <ul className="divide-y divide-stroke-soft-200">
                {[
                  { name: "James Brown",      sub: "james@dash.com",        id: "A-52112", verified: true,  initials: "JB", color: "bg-(--state-success-light) text-(--state-success-dark)" },
                  { name: "Sophia Williams",  sub: "+44 01 2345 6789",      id: "A-52132", verified: false, initials: "SW", color: "bg-(--state-warning-light) text-(--state-warning-dark)" },
                  { name: "Emma Wright",      sub: "james@dash.com",        id: "A-52184", verified: false, initials: "EW", color: "bg-(--state-information-light) text-(--state-information-dark)" },
                  { name: "Matthew Johnson",  sub: "+1 (456) 789-0123",     id: "A-52114", verified: false, initials: "MJ", color: "bg-(--state-feature-light) text-(--state-feature-dark)" },
                ].map((r) => (
                  <li key={r.id} className="flex items-center gap-3 py-3">
                    <Avatar size="lg">
                      <AvatarFallback className={r.color}>{r.initials}</AvatarFallback>
                      {r.verified ? (
                        <AvatarIndicator tone="favorite" size="lg" position="top-right">
                          <StarFill />
                        </AvatarIndicator>
                      ) : null}
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-text-strong-950 truncate">{r.name}</div>
                      <div className="text-xs text-text-soft-400 truncate">{r.sub}</div>
                    </div>
                    <span className="text-xs px-2 py-1 rounded-full bg-bg-weak-50 text-text-sub-600">{r.id}</span>
                  </li>
                ))}
              </ul>
              <button className="mt-3 w-full inline-flex items-center justify-center gap-2 h-10 rounded-lg border border-stroke-soft-200 bg-bg-white-0 text-sm text-text-strong-950 hover:bg-bg-weak-50">
                <Plus className="size-4" /> New Recipient
              </button>
            </div>
          }
          code={`<li>
  <Avatar size="lg">
    <AvatarFallback className="bg-(--state-success-light) text-(--state-success-dark)">JB</AvatarFallback>
    <AvatarIndicator tone="favorite" position="top-right"><StarFill /></AvatarIndicator>
  </Avatar>
  <div>{name} / {email}</div>
  <span>{accountId}</span>
</li>`}
        />
      </DocsSection>

      {/* 7. Profile card with brand badge — 2930:5268 */}
      <DocsSection title="Profile card">
        <p className="text-sm text-text-sub-600 max-w-2xl">
          Big photo + name + title with brand-circle indicator at bottom-right. Use for hero profile surfaces — public profiles, contact cards, member highlights.
        </p>
        <DocsExample
          title="Arthur Taylor — CEO at Apex"
          preview={
            <div className="rounded-xl border border-stroke-soft-200 bg-bg-white-0 max-w-sm shadow-(--shadow-custom-md)">
              <div className="p-6 flex flex-col items-center text-center">
                <Avatar size="3xl">
                  <AvatarImage src="https://i.pravatar.cc/200?u=arthur" />
                  <AvatarFallback>AT</AvatarFallback>
                  <AvatarIndicator tone="custom" size="3xl" className="bg-(--state-information-base)" position="bottom-right">
                    <Briefcase />
                  </AvatarIndicator>
                </Avatar>
                <div className="mt-3 text-base font-semibold text-text-strong-950">Arthur Taylor</div>
                <div className="text-sm text-text-sub-600">Entrepreneur / CEO at Apex</div>
              </div>
              <div className="border-t border-stroke-soft-200 px-6 py-4 grid grid-cols-[1fr_auto] gap-3 items-center">
                <div>
                  <div className="text-xs text-text-soft-400">Contacts</div>
                  <div className="text-sm font-medium text-text-strong-950">Expand Your Network</div>
                </div>
                <Button size="sm" tone="neutral" style="stroke" aria-label="Add"><UserAdd /></Button>
              </div>
              <div className="px-6 pb-4">
                <div className="text-xs text-text-soft-400 mb-1">Premium Features</div>
                <a href="#" className="text-sm font-medium text-text-strong-950 underline underline-offset-4">Get &quot;Profile Highlighting&quot; feature.</a>
              </div>
              <div className="px-6 pb-6">
                <Button size="md" tone="neutral" style="stroke" className="w-full" leftIcon={<Plus />}>Create a group</Button>
              </div>
            </div>
          }
          code={`<Avatar size="3xl">
  <AvatarImage src={photo} />
  <AvatarIndicator tone="custom" className="bg-(--state-information-base)"><Briefcase /></AvatarIndicator>
</Avatar>`}
        />
      </DocsSection>

      {/* 8. Contact info card — 2930:6050 */}
      <DocsSection title="Contact info card">
        <p className="text-sm text-text-sub-600 max-w-2xl">
          Compact contact card with photo + name + handle and inline data rows. + button stacks on the avatar via top-right add-badge.
        </p>
        <DocsExample
          title="Lena Müller — Marketing Manager"
          preview={
            <div className="rounded-xl border border-stroke-soft-200 bg-bg-white-0 max-w-md shadow-(--shadow-custom-sm)">
              <div className="flex items-center justify-between px-4 py-3 border-b border-stroke-soft-200">
                <span className="text-sm font-medium text-text-strong-950">Contact Information</span>
                <a href="#" className="text-sm font-medium text-primary">View Profile</a>
              </div>
              <div className="px-4 py-4 flex items-center gap-3 border-b border-stroke-soft-200">
                <Avatar size="lg">
                  <AvatarImage src="https://i.pravatar.cc/100?u=lena" />
                  <AvatarFallback>LM</AvatarFallback>
                  <AvatarIndicator tone="add" size="lg" position="top-right">
                    <Plus />
                  </AvatarIndicator>
                </Avatar>
                <div className="flex-1">
                  <div className="text-sm font-medium text-text-strong-950">Lena Müller</div>
                  <div className="text-xs text-text-sub-600">Marketing Manager <strong className="text-text-strong-950">@catalyst</strong></div>
                </div>
                <Button size="sm" tone="neutral" style="stroke" aria-label="Add"><Plus /></Button>
              </div>
              <div className="px-4 py-4 space-y-3">
                {[
                  { Icon: Globe,     label: "LOCATION",       value: "Berlin, Germany" },
                  { Icon: Briefcase, label: "Specialty",       value: "Marketing, SEO, Team Leader" },
                  { Icon: Mail,      label: "Email Address",   value: "lena@dash.com" },
                ].map((r) => (
                  <div key={r.label} className="flex items-start gap-3">
                    <span className="size-7 rounded-full bg-bg-weak-50 inline-flex items-center justify-center text-icon-soft-400"><r.Icon className="size-4" /></span>
                    <div>
                      <div className="text-xs text-text-soft-400">{r.label}</div>
                      <div className="text-sm text-text-strong-950">{r.value}</div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="px-4 pb-4 grid grid-cols-2 gap-2">
                <Button tone="neutral" style="stroke">Add Contact</Button>
                <Button tone="primary">Send Message</Button>
              </div>
            </div>
          }
          code={`<Avatar size="lg">
  <AvatarImage src={photo} />
  <AvatarIndicator tone="add" position="top-right"><Plus /></AvatarIndicator>
</Avatar>`}
        />
      </DocsSection>

      {/* 9. Centered profile dialog — 2934:10193 */}
      <DocsSection title="Centered profile dialog">
        <p className="text-sm text-text-sub-600 max-w-2xl">
          Modal-style profile preview. Centered avatar + status dot + name + handle + single CTA.
        </p>
        <DocsExample
          title="Wei Chen — online"
          preview={
            <div className="rounded-xl border border-stroke-soft-200 bg-bg-white-0 max-w-xs px-6 py-6 shadow-(--shadow-custom-md) relative">
              <button aria-label="Close" className="absolute right-3 top-3 size-5 text-icon-soft-400 hover:text-text-strong-950">✕</button>
              <div className="flex flex-col items-center text-center gap-2">
                <Avatar size="2xl">
                  <AvatarImage src="https://i.pravatar.cc/120?u=wei" />
                  <AvatarFallback>WC</AvatarFallback>
                  <AvatarIndicator tone="online" size="2xl" />
                </Avatar>
                <div className="text-sm font-medium text-text-strong-950">Wei Chen</div>
                <div className="text-xs text-text-sub-600">Marketing Manager <strong className="text-text-strong-950">@catalyst</strong></div>
                <Button size="sm" tone="neutral" style="stroke" className="mt-2">Add Contact</Button>
              </div>
            </div>
          }
          code={`<Avatar size="2xl">
  <AvatarImage src={photo} />
  <AvatarIndicator tone="online" />
</Avatar>`}
        />
      </DocsSection>

      {/* 10. Support card — 166982:29348 */}
      <DocsSection title="Support card">
        <p className="text-sm text-text-sub-600 max-w-2xl">
          Verified-creator gratitude card. Avatar with verified badge + title + body + share CTA.
        </p>
        <DocsExample
          title="Thanks for supporting Wei Chen!"
          preview={
            <div className="rounded-xl border border-stroke-soft-200 bg-bg-white-0 max-w-sm shadow-(--shadow-custom-md)">
              <div className="px-6 py-6 flex flex-col items-center text-center gap-2">
                <Avatar size="2xl">
                  <AvatarImage src="https://i.pravatar.cc/120?u=creator" />
                  <AvatarFallback>WC</AvatarFallback>
                  <AvatarIndicator tone="verified" size="2xl" position="top-right">
                    <Verified />
                  </AvatarIndicator>
                </Avatar>
                <div className="text-sm font-medium text-text-strong-950">Thanks for the supporting Wei Chen!</div>
                <div className="text-xs text-text-sub-600">Your contribution means a lot to us.</div>
              </div>
              <div className="border-t border-stroke-soft-200 bg-bg-weak-50 px-6 py-4 flex flex-col items-center gap-3">
                <div className="text-sm font-medium text-text-strong-950">Do you want to share your support?</div>
                <p className="text-xs text-text-sub-600 text-center">Click the button below to give them a shoutout and share their work with others.</p>
                <Button size="sm" tone="neutral" leftIcon={<Share />}>Share</Button>
              </div>
            </div>
          }
          code={`<Avatar size="2xl">
  <AvatarImage src={photo} />
  <AvatarIndicator tone="verified" position="top-right"><Verified /></AvatarIndicator>
</Avatar>`}
        />
      </DocsSection>

      <DocsSection title="Examples">
        <DocsExample
          title="Online mitra roster"
          description="Sidebar Halo-dash menampilkan mitra siap-dispatch per polygon. Status dot online = real-time GPS aktif < 30s lalu."
          preview={
            <div className="w-full max-w-sm space-y-2 rounded-xl border border-stroke-soft-200 bg-bg-white-0 p-3">
              <div className="px-1 text-xs font-medium text-text-soft-400 uppercase tracking-wider">Online di Bekasi Timur · 6 mitra</div>
              {[
                { initials: "FK", name: "Fauzan K.", id: "mtr-9412", tone: "online" as const, trips: "2 trip aktif" },
                { initials: "RP", name: "Rizky P.", id: "mtr-9418", tone: "online" as const, trips: "Idle 4 menit" },
                { initials: "AW", name: "Andi W.", id: "mtr-9419", tone: "away" as const, trips: "Break · est 8 min" },
                { initials: "RS", name: "Rina S.", id: "mtr-9425", tone: "busy" as const, trips: "Trip JKT→BDG" },
              ].map((m) => (
                <div key={m.id} className="flex items-center gap-3 rounded-lg px-2 py-1.5 hover:bg-bg-weak-50">
                  <Avatar size="md">
                    <AvatarFallback>{m.initials}</AvatarFallback>
                    <AvatarIndicator tone={m.tone} position="bottom-right" />
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-text-strong-950 truncate">{m.name} · <span className="text-text-sub-600 text-xs font-normal">{m.id}</span></div>
                    <div className="text-xs text-text-sub-600 truncate">{m.trips}</div>
                  </div>
                </div>
              ))}
            </div>
          }
          code={`<Avatar size="md">
  <AvatarFallback>FK</AvatarFallback>
  <AvatarIndicator tone="online" position="bottom-right" />
</Avatar>
<Avatar size="md">
  <AvatarFallback>AW</AvatarFallback>
  <AvatarIndicator tone="away" position="bottom-right" />
</Avatar>
<Avatar size="md">
  <AvatarFallback>RS</AvatarFallback>
  <AvatarIndicator tone="busy" position="bottom-right" />
</Avatar>`}
        />

        <DocsExample
          title="Trip handover stack"
          description="X-Dock handover dari mitra A → B. AvatarGroup tampilkan kedua mitra + +N tile kalau >3 hop."
          preview={
            <div className="flex items-center gap-4">
              <AvatarGroup size="md">
                <Avatar><AvatarFallback>FK</AvatarFallback></Avatar>
                <Avatar><AvatarFallback>RS</AvatarFallback></Avatar>
                <Avatar><AvatarFallback>AW</AvatarFallback></Avatar>
              </AvatarGroup>
              <span className="text-sm text-text-sub-600">3 mitra · trip DSC-77821</span>

              <AvatarGroup size="md" className="ml-6">
                <Avatar><AvatarFallback>FK</AvatarFallback></Avatar>
                <Avatar><AvatarFallback>RS</AvatarFallback></Avatar>
                <Avatar><AvatarFallback>AW</AvatarFallback></Avatar>
                <AvatarGroupCount value={5} />
              </AvatarGroup>
              <span className="text-sm text-text-sub-600">8 mitra · bulk relay</span>
            </div>
          }
          code={`<AvatarGroup size="md">
  <Avatar><AvatarFallback>FK</AvatarFallback></Avatar>
  <Avatar><AvatarFallback>RS</AvatarFallback></Avatar>
  <Avatar><AvatarFallback>AW</AvatarFallback></Avatar>
  <AvatarGroupCount value={5} />
</AvatarGroup>`}
        />

        <DocsExample
          title="Verified mitra card"
          description="Mitra detail card di Halo-dash. Verified badge dipasang setelah KYC + SIM verification selesai (≥6 bulan tenure)."
          preview={
            <div className="w-full max-w-xs rounded-xl border border-stroke-soft-200 bg-bg-white-0 p-4">
              <div className="flex flex-col items-center text-center">
                <Avatar size="3xl">
                  <AvatarFallback>FK</AvatarFallback>
                  <AvatarIndicator tone="verified" position="bottom-right"><Verified /></AvatarIndicator>
                </Avatar>
                <div className="mt-3 text-base font-semibold text-text-strong-950">Fauzan Kurniawan</div>
                <div className="text-xs text-text-sub-600">mtr-9412 · Express Bekasi</div>
                <div className="mt-1 text-xs text-(--state-success-base) font-medium">Verified · KYC + SIM C</div>
                <Button size="sm" className="mt-4 w-full" leftIcon={<Mail />}>Kirim pesan</Button>
              </div>
            </div>
          }
          code={`<Avatar size="3xl">
  <AvatarFallback>FK</AvatarFallback>
  <AvatarIndicator tone="verified" position="bottom-right">
    <Verified />
  </AvatarIndicator>
</Avatar>`}
        />
      </DocsSection>

      <DocsSection title="Do this, not that">
        <p className="text-base text-text-sub-600 leading-relaxed max-w-2xl">
          Avatar identifies who, not what. Always provide a meaningful fallback (initials), and reserve indicators for live presence signals — not generic decoration.
        </p>
        <DocsDoDont
          do={{
            preview: (
              <div className="flex items-center gap-3">
                <Avatar size="md"><AvatarFallback>IP</AvatarFallback></Avatar>
                <Avatar size="md"><AvatarFallback>FK</AvatarFallback></Avatar>
                <Avatar size="md"><AvatarFallback>AB</AvatarFallback></Avatar>
              </div>
            ),
            caption: "Fallback = inisial 2 huruf dari nama mitra (Irfan Prima → IP). Cepat dikenali, konsisten across team.",
          }}
          dont={{
            preview: (
              <div className="flex items-center gap-3">
                <Avatar size="md"><AvatarFallback>?</AvatarFallback></Avatar>
                <Avatar size="md"><AvatarFallback>?</AvatarFallback></Avatar>
                <Avatar size="md"><AvatarFallback>?</AvatarFallback></Avatar>
              </div>
            ),
            caption: "'?' atau emoji generic 👤 = semua mitra terlihat sama. Dispatcher tidak bisa scan-list.",
          }}
        />
        <DocsDoDont
          do={{
            preview: (
              <Avatar size="lg">
                <AvatarFallback>FK</AvatarFallback>
                <AvatarIndicator tone="online" position="bottom-right" />
              </Avatar>
            ),
            caption: "Indicator online = mitra siap terima dispatch SEKARANG. Live presence signal yang actionable.",
          }}
          dont={{
            preview: (
              <Avatar size="lg">
                <AvatarFallback>FK</AvatarFallback>
                <AvatarIndicator tone="favorite" position="bottom-right"><StarFill /></AvatarIndicator>
              </Avatar>
            ),
            caption: "Star sebagai indicator = ambigu. Favorite/decorative belong elsewhere; indicator adalah real-time signal, bukan rating.",
          }}
        />
      </DocsSection>

      <DocsSection title="API">
        <DocsPropsTable
          rows={[
            { name: "size", type: '"xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl" | "5xl"', defaultValue: '"md"', description: "Diameter — 20/24/32/40/48/56/64/72/80 px." },
            { name: "shape", type: '"circle" | "rounded"', defaultValue: '"circle"', description: "Pill (full) or radius-md corner." },
            { name: "ring", type: '"none" | "background" | "card"', defaultValue: '"none"', description: "2px ring — use card when stacked in AvatarGroup." },
            { name: "AvatarIndicator.tone", type: '"online" | "away" | "busy" | "offline" | "verified" | "feature" | "favorite" | "add" | "cancel" | "custom"', defaultValue: '"online"', description: "Status (dot tones) or badge (icon tones). custom = bring your own bg via className." },
            { name: "AvatarIndicator.shape", type: '"dot" | "badge"', defaultValue: 'auto', description: "Auto-upgrades to badge when children present." },
            { name: "AvatarIndicator.position", type: '"top-right" | "bottom-right" | "top-left" | "bottom-left"', defaultValue: '"bottom-right"', description: "Corner anchor." },
            { name: "AvatarGroup.size / shape", type: "Avatar size/shape", description: "Propagated to children automatically. Card ring auto-applied." },
            { name: "AvatarGroupCount.value", type: "number", description: "Renders +{n} count tile." },
          ]}
        />
      </DocsSection>
    </DocsPageShell>
  )
}
