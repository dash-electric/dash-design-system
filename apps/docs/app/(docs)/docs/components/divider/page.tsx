"use client"

import * as React from "react"
import {
  RiAddLine as Plus,
  RiArrowLeftSLine as ChevronLeft,
  RiArrowRightSLine as ChevronRight,
  RiUser3Line as User,
  RiGridLine as Grid,
  RiSettings3Line as Settings,
  RiBookOpenLine as Guide,
  RiQuestionLine as Help,
  RiLogoutBoxLine as Logout,
  RiVerifiedBadgeFill as Verified,
  RiBankLine as Bank,
  RiArrowDownSLine as ChevronDown,
  RiStarFill as Star,
  RiInformationLine as Info,
  RiSparkling2Line as Sparkles,
} from "@remixicon/react"
import { Divider, ContentDivider } from "@/registry/dash/ui/divider"
import { Avatar, AvatarImage, AvatarFallback, AvatarIndicator } from "@/registry/dash/ui/avatar"
import { Badge } from "@/registry/dash/ui/badge"
import { Button } from "@/registry/dash/ui/button"
import { ButtonGroup } from "@/registry/dash/ui/button-group"
import {
  DocsPageShell,
  DocsHeader,
  DocsSection,
  DocsExample,
  DocsPropsTable,
  DocsDoDont,
} from "@/components/docs/page-shell"

/**
 * Divider — Figma 1:1 (7 nodes verified 2026-05-18).
 *
 *   414:4401       Master spec — Line / Line Spacing / Text Divider / Text & Line / Solid Text + icon variants
 *   3100:18126     Saved Recipients list — full-bleed dividers between rows + footer action
 *   3100:18144     same DARK
 *   3115:18947     User menu — section separators + support lowercase label + Free Plan bar
 *   3115:18958     same DARK
 *   3118:23210     Payment form — solid section labels ("Payment Method", "Recipient's Bank Details")
 *   3118:23224     same DARK
 */

export default function DividerDocsPage() {
  return (
    <DocsPageShell>
      <DocsHeader
        status="stable"
        kind="atom"
        category="Components / Layout"
        title="Divider"
        description="Horizontal or vertical line that separates content. Plain Divider for sibling rows; ContentDivider for centered text/icon labels framed by lines; solid variant for full-width section labels."
      />

      <DocsSection title="Plain line">
        <p className="text-sm text-text-sub-600 max-w-2xl">
          1px stroke-soft-200 horizontal rule. Use to separate stacked rows.
        </p>
        <DocsExample
          title="Horizontal + vertical"
          preview={
            <div className="space-y-6">
              <div className="space-y-3 max-w-md">
                <span className="block">Above</span>
                <Divider />
                <span className="block">Below</span>
              </div>
              <div className="inline-flex items-center gap-3 h-9">
                <span>Left</span>
                <Divider orientation="vertical" />
                <span>Right</span>
              </div>
            </div>
          }
          code={`<Divider />
<Divider orientation="vertical" />`}
        />
      </DocsSection>

      <DocsSection title="Text divider">
        <p className="text-sm text-text-sub-600 max-w-2xl">
          ContentDivider — line + uppercase tracking-wide label. Aligns center (default), start, or end.
        </p>
        <DocsExample
          title="center / start / end"
          preview={
            <div className="space-y-5 max-w-md">
              <ContentDivider>OR</ContentDivider>
              <ContentDivider align="start">OR</ContentDivider>
              <ContentDivider align="end">OR</ContentDivider>
            </div>
          }
          code={`<ContentDivider>OR</ContentDivider>
<ContentDivider align="start">OR</ContentDivider>
<ContentDivider align="end">OR</ContentDivider>`}
        />
      </DocsSection>

      <DocsSection title="Solid section label">
        <p className="text-sm text-text-sub-600 max-w-2xl">
          Filled gray bar — use for section breaks inside multi-step forms or grouped settings panels.
        </p>
        <DocsExample
          title='"Amount & Account" section header'
          preview={
            <div className="space-y-3 max-w-md">
              <ContentDivider variant="solid">Amount &amp; Account</ContentDivider>
            </div>
          }
          code={`<ContentDivider variant="solid">Amount & Account</ContentDivider>`}
        />
      </DocsSection>

      <DocsSection title="With icon button">
        <p className="text-sm text-text-sub-600 max-w-2xl">
          ContentDivider accepts any ReactNode as middle content — pass an icon button or button cluster for "add row" patterns.
        </p>
        <DocsExample
          title="Plus / Prev+Plus+Next / Add button / ButtonGroup"
          preview={
            <div className="space-y-6 max-w-md">
              <ContentDivider>
                <Button size="icon-xs" tone="neutral" style="stroke" aria-label="Add"><Plus /></Button>
              </ContentDivider>
              <ContentDivider>
                <ButtonGroup>
                  <Button size="icon-xs" tone="neutral" style="stroke" aria-label="Previous"><ChevronLeft /></Button>
                  <Button size="icon-xs" tone="neutral" style="stroke" aria-label="Add"><Plus /></Button>
                  <Button size="icon-xs" tone="neutral" style="stroke" aria-label="Next"><ChevronRight /></Button>
                </ButtonGroup>
              </ContentDivider>
              <ContentDivider>
                <Button size="xs" tone="neutral" style="stroke">Add</Button>
              </ContentDivider>
              <ContentDivider>
                <ButtonGroup>
                  <Button size="xs" tone="neutral" style="stroke">Button</Button>
                  <Button size="xs" tone="neutral" style="stroke">Button</Button>
                  <Button size="xs" tone="neutral" style="stroke">Button</Button>
                </ButtonGroup>
              </ContentDivider>
            </div>
          }
          code={`<ContentDivider>
  <Button size="icon-xs" tone="neutral" style="stroke" aria-label="Add"><Plus /></Button>
</ContentDivider>

<ContentDivider>
  <ButtonGroup>
    <Button size="icon-xs" ... aria-label="Previous"><ChevronLeft /></Button>
    <Button size="icon-xs" ... aria-label="Add"><Plus /></Button>
    <Button size="icon-xs" ... aria-label="Next"><ChevronRight /></Button>
  </ButtonGroup>
</ContentDivider>`}
        />
      </DocsSection>

      <DocsSection title="Saved Recipients list">
        <p className="text-sm text-text-sub-600 max-w-2xl">
          Full-bleed Divider between rows. Footer separated from rows by Divider, then a "+ New Recipient" action.
        </p>
        <DocsExample
          title="Recipient list with row dividers + footer CTA"
          preview={
            <div className="max-w-sm rounded-xl border border-stroke-soft-200 bg-bg-white-0 p-4 shadow-(--shadow-custom-sm)">
              <div className="text-xs text-text-soft-400 mb-3">Saved Recipients</div>
              <div className="space-y-0">
                {[
                  { name: "James Brown",     sub: "james@dash.com",    id: "A-52112", verified: true,  fall: "bg-(--state-success-light) text-(--state-success-dark)", initials: "JB" },
                  { name: "Sophia Williams", sub: "+44 01 2345 6789",   id: "A-52132", verified: false, fall: "bg-(--state-warning-light) text-(--state-warning-dark)", initials: "SW" },
                  { name: "Emma Wright",     sub: "james@dash.com",     id: "A-52184", verified: false, fall: "bg-(--state-information-light) text-(--state-information-dark)", initials: "EW" },
                  { name: "Matthew Johnson", sub: "+1 (456) 789-0123",  id: "A-52114", verified: false, fall: "bg-(--state-feature-light) text-(--state-feature-dark)", initials: "MJ" },
                ].map((r, i, arr) => (
                  <React.Fragment key={r.id}>
                    <div className="flex items-center gap-3 py-3">
                      <Avatar size="lg">
                        <AvatarFallback className={r.fall}>{r.initials}</AvatarFallback>
                        {r.verified ? (
                          <AvatarIndicator tone="favorite" size="lg" position="top-right">
                            <Star />
                          </AvatarIndicator>
                        ) : null}
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-text-strong-950 truncate">{r.name}</div>
                        <div className="text-xs text-text-soft-400 truncate">{r.sub}</div>
                      </div>
                      <span className="text-xs px-2 py-1 rounded-full bg-bg-weak-50 text-text-sub-600">{r.id}</span>
                    </div>
                    {i < arr.length - 1 ? <Divider /> : null}
                  </React.Fragment>
                ))}
              </div>
              <Divider className="my-3" />
              <Button size="md" tone="neutral" style="stroke" className="w-full" leftIcon={<Plus />}>New Recipient</Button>
            </div>
          }
          code={`{recipients.map((r, i, arr) => (
  <Fragment key={r.id}>
    <Row r={r} />
    {i < arr.length - 1 ? <Divider /> : null}
  </Fragment>
))}
<Divider />
<Button leftIcon={<Plus />}>New Recipient</Button>`}
        />
      </DocsSection>

      <DocsSection title="User menu">
        <p className="text-sm text-text-sub-600 max-w-2xl">
          Stacked sections: account header + main nav + lowercase &quot;support&quot; label + secondary nav + plan card + logout. Plain Divider between sections; ContentDivider for the lowercase &quot;support&quot; group label.
        </p>
        <DocsExample
          title="Emma Wright PRO menu"
          preview={
            <div className="max-w-xs rounded-xl border border-stroke-soft-200 bg-bg-white-0 p-4 shadow-(--shadow-custom-md)">
              <div className="flex items-center gap-3">
                <Avatar size="lg">
                  <AvatarImage src="https://i.pravatar.cc/80?u=emma" />
                  <AvatarFallback>EW</AvatarFallback>
                  <AvatarIndicator tone="verified" size="lg" position="top-right"><Verified /></AvatarIndicator>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-text-strong-950">Emma Wright</div>
                  <div className="text-xs text-text-sub-600 truncate">emma@dash.com</div>
                </div>
                <Badge status="error" appearance="lighter" size="sm">PRO</Badge>
              </div>
              <Divider className="my-3" />
              <ul className="space-y-2">
                <li className="flex items-center gap-3 text-sm text-text-strong-950"><User className="size-4 text-icon-soft-400" />Account Settings</li>
                <li className="flex items-center gap-3 text-sm text-text-strong-950"><Grid className="size-4 text-icon-soft-400" />Integrations</li>
                <li className="flex items-center gap-3 text-sm text-text-strong-950"><Settings className="size-4 text-icon-soft-400" />Settings</li>
              </ul>
              <div className="mt-3 mb-1 text-[11px] tracking-wide text-text-soft-400 lowercase">support</div>
              <ul className="space-y-2">
                <li className="flex items-center gap-3 text-sm text-text-strong-950"><Guide className="size-4 text-icon-soft-400" />Guide</li>
                <li className="flex items-center gap-3 text-sm text-text-strong-950"><Help className="size-4 text-icon-soft-400" />Help Center</li>
              </ul>
              <Divider className="my-3" />
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-text-strong-950">Free Plan</div>
                  <div className="text-xs text-text-sub-600">12,000 views</div>
                </div>
                <Button size="sm" tone="primary" style="lighter">Upgrade</Button>
              </div>
              <Divider className="my-3" />
              <div className="flex items-center gap-3 text-sm text-text-strong-950"><Logout className="size-4 text-icon-soft-400" />Logout</div>
            </div>
          }
          code={`<header>
  <Avatar />
  <Name + email />
  <Badge>PRO</Badge>
</header>
<Divider />
<MainNav />
<div className="text-soft-400 lowercase">support</div>
<SupportNav />
<Divider />
<PlanCard />
<Divider />
<LogoutRow />`}
        />
      </DocsSection>

      <DocsSection title="Payment form section labels">
        <p className="text-sm text-text-sub-600 max-w-2xl">
          Solid ContentDivider bars label form sections: <code>Payment Method</code>, <code>Recipient&apos;s Bank Details</code>. Heavier visual weight than a plain Divider — signals a logical group boundary.
        </p>
        <DocsExample
          title="Wire transfer form"
          preview={
            <div className="max-w-sm rounded-xl border border-stroke-soft-200 bg-bg-white-0 shadow-(--shadow-custom-sm)">
              <div className="flex items-center gap-3 p-4">
                <Avatar size="lg">
                  <AvatarImage src="https://i.pravatar.cc/80?u=james-pay" />
                  <AvatarFallback>JB</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-text-strong-950">James Brown</div>
                  <div className="text-xs text-text-sub-600 truncate">james@dash.com</div>
                </div>
                <a href="#" className="text-sm font-medium text-primary">Edit</a>
              </div>
              <ContentDivider variant="solid">Payment Method</ContentDivider>
              <div className="p-4 space-y-2">
                <div className="text-sm font-medium text-text-strong-950 inline-flex items-center gap-1.5">
                  Select Payment Method <Info className="size-3.5 text-icon-soft-400" />
                </div>
                <div className="flex items-center gap-2 h-10 px-3 rounded-md border border-stroke-soft-200 bg-bg-white-0 text-sm">
                  Wire
                  <ChevronDown className="size-4 ml-auto text-icon-soft-400" />
                </div>
                <div className="text-xs text-text-sub-600">Same-day transfer, no fees.</div>
              </div>
              <ContentDivider variant="solid">Recipient&apos;s Bank Details</ContentDivider>
              <div className="p-4 flex items-center gap-3">
                <span className="size-9 rounded-md bg-bg-weak-50 inline-flex items-center justify-center text-icon-soft-400">
                  <Bank className="size-4" />
                </span>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-text-strong-950">Summit Finance International</div>
                  <div className="text-xs text-text-sub-600">Account ••9876 · Routing ••5432</div>
                </div>
                <a href="#" className="text-sm font-medium text-primary">Edit</a>
              </div>
              <div className="p-4 grid grid-cols-2 gap-2">
                <Button tone="neutral" style="stroke">Back</Button>
                <Button tone="primary">Next</Button>
              </div>
            </div>
          }
          code={`<ContentDivider variant="solid">Payment Method</ContentDivider>
<ContentDivider variant="solid">Recipient's Bank Details</ContentDivider>`}
        />
      </DocsSection>

      <DocsSection title="Sparkle inline">
        <p className="text-sm text-text-sub-600 max-w-2xl">
          ContentDivider can host any glyph + label combination for marketing surfaces.
        </p>
        <DocsExample
          title="Promo bar"
          preview={
            <div className="max-w-md">
              <ContentDivider>
                <span className="inline-flex items-center gap-1.5"><Sparkles className="size-3.5 text-(--state-feature-base)" /> New Releases</span>
              </ContentDivider>
            </div>
          }
          code={`<ContentDivider>
  <Sparkles /> New Releases
</ContentDivider>`}
        />
      </DocsSection>

      <DocsSection title="Do this, not that">
        <p className="text-base text-text-sub-600 leading-relaxed max-w-2xl">
          Divider memisahkan grup yang related tapi distinct. Pakai spacing dulu — kalau spacing tidak cukup, baru tarik garis. Jangan divider di antara setiap baris (visual noise).
        </p>
        <DocsDoDont
          do={{
            preview: (
              <div className="space-y-3 max-w-xs text-xs">
                <div>
                  <div className="font-medium text-text-strong-950">Account</div>
                  <div className="text-text-sub-600">Settings, Notifications</div>
                </div>
                <Divider />
                <div>
                  <div className="font-medium text-text-strong-950">Mitra</div>
                  <div className="text-text-sub-600">Suspend, Reaktivasi, Audit log</div>
                </div>
                <Divider />
                <div>
                  <div className="font-medium text-text-strong-950">Logout</div>
                </div>
              </div>
            ),
            caption: "Divider memisah grup logis (Account, Mitra, Logout). User scan menu lebih cepat karena tahu boundary section.",
          }}
          dont={{
            preview: (
              <div className="space-y-2 max-w-xs text-xs">
                {["Account Settings","Notifications","Suspend mitra","Reaktivasi","Audit log","Logout"].map((s, i, arr) => (
                  <React.Fragment key={s}>
                    <div className="text-text-strong-950">{s}</div>
                    {i < arr.length - 1 ? <Divider /> : null}
                  </React.Fragment>
                ))}
              </div>
            ),
            caption: "Divider di antara setiap row = visual noise. Hilangkan garis, naikkan spacing. Garis hanya untuk boundary semantik.",
          }}
        />
        <DocsDoDont
          do={{
            preview: (
              <div className="max-w-xs rounded-lg border border-stroke-soft-200 bg-bg-white-0 text-xs">
                <ContentDivider variant="solid">Detail Mitra</ContentDivider>
                <div className="p-3 text-text-sub-600">mtr-9412 · Active · Bekasi</div>
                <ContentDivider variant="solid">Riwayat Delivery</ContentDivider>
                <div className="p-3 text-text-sub-600">142 trips · last 7d</div>
              </div>
            ),
            caption: "ContentDivider variant='solid' untuk section label di form panjang. Visual weight cukup tanpa pakai heading H3.",
          }}
          dont={{
            preview: (
              <div className="max-w-xs rounded-lg border border-stroke-soft-200 bg-bg-white-0 text-xs">
                <ContentDivider variant="solid">Section 1</ContentDivider>
                <ContentDivider variant="solid">Section 2</ContentDivider>
                <ContentDivider variant="solid">Section 3</ContentDivider>
              </div>
            ),
            caption: "Solid dividers tanpa konten di antara = bar abu-abu menumpuk. Setiap section harus punya isi minimal sebelum divider berikut.",
          }}
        />
      </DocsSection>

      <DocsSection title="API">
        <DocsPropsTable
          rows={[
            { name: "Divider.orientation", type: '"horizontal" | "vertical"', defaultValue: '"horizontal"', description: "Stack axis." },
            { name: "Divider.weight", type: '"thin" | "regular"', defaultValue: '"thin"', description: "1px (thin) or 1.5px (regular)." },
            { name: "ContentDivider.align", type: '"start" | "center" | "end"', defaultValue: '"center"', description: "Position of children between the two line segments." },
            { name: "ContentDivider.variant", type: '"line" | "solid"', defaultValue: '"line"', description: "line = framed by stroke; solid = full-width filled gray bar (section header)." },
            { name: "ContentDivider.weight", type: '"thin" | "regular"', defaultValue: '"thin"', description: "Line weight when variant=line." },
            { name: "ContentDivider.children", type: "ReactNode", description: "Middle content — text, icon, Button, ButtonGroup, anything." },
          ]}
        />
      </DocsSection>
    </DocsPageShell>
  )
}
