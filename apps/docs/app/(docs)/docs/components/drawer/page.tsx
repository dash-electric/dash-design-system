"use client"

import * as React from "react"
import {
  RiCloseLine as Close,
  RiTimeLine as ClockIcon,
  RiWifiLine as Contactless,
  RiCheckboxCircleFill as Check,
  RiArrowRightSLine as ChevronRight,
  RiArrowLeftSLine as ChevronLeft,
  RiSearchLine as Search,
  RiLockLine as Lock,
  RiShieldCheckLine as Shield,
  RiKey2Line as Key,
  RiBankCardLine as Card,
  RiFileTextLine as File,
  RiQuestionAnswerLine as Q,
  RiTrophyLine as Trophy,
} from "@remixicon/react"
import {
  Drawer,
  DrawerTrigger,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerBody,
  DrawerFooter,
  DrawerClose,
} from "@/registry/dash/ui/drawer"
import { Button } from "@/registry/dash/ui/button"
import { ButtonGroup } from "@/registry/dash/ui/button-group"
import { Badge } from "@/registry/dash/ui/badge"
import { Checkbox } from "@/registry/dash/ui/checkbox"
import { CompactButton } from "@/registry/dash/ui/compact-button"
import { Avatar, AvatarFallback } from "@/registry/dash/ui/avatar"
import { ContentDivider } from "@/registry/dash/ui/divider"
import {
  DocsPageShell,
  DocsHeader,
  DocsSection,
  DocsExample,
  DocsPropsTable,
  DocsDoDont,
} from "@/components/docs/page-shell"

/**
 * Drawer — Figma 1:1 (14 nodes verified 2026-05-18).
 *
 *   3187:2897        DrawerHeader spec — 4 variants (title / icon+title / title+desc / icon+title+desc)
 *   4096:21416       Master spec
 *   4108:56672/56807/56707/56808  Virtual Card detail
 *   167124:24738/24794            Service Fee config
 *   167124:24859/24932/24948/24963 Internet Banking Support
 *   167124:24989/25003            Dark variants
 */

const HeaderRow = ({ icon, title, desc }: { icon?: React.ReactNode; title: string; desc?: string }) => (
  <div className="flex items-start gap-3 rounded-xl border border-stroke-soft-200 bg-bg-white-0 p-4 shadow-(--shadow-custom-xs)">
    {icon ? (
      <span className="size-9 rounded-full bg-bg-white-0 border border-stroke-soft-200 inline-flex items-center justify-center text-icon-soft-400 shrink-0">
        {icon}
      </span>
    ) : null}
    <div className="flex-1 min-w-0">
      <div className="text-sm font-semibold text-text-strong-950">{title}</div>
      {desc ? <div className="text-xs text-text-sub-600 mt-0.5">{desc}</div> : null}
    </div>
    <CompactButton size="sm" variant="ghost" aria-label="Close"><Close /></CompactButton>
  </div>
)

export default function DrawerDocsPage() {
  const [side, setSide] = React.useState<"right" | "left" | "top" | "bottom">("right")
  const [openCard, setOpenCard] = React.useState(false)
  const [openFee, setOpenFee] = React.useState(false)
  const [openSupport, setOpenSupport] = React.useState(false)
  const [feeTab, setFeeTab] = React.useState<"monthly" | "onetime" | "none">("monthly")
  const [serviceVis, setServiceVis] = React.useState<"public" | "private">("public")

  return (
    <DocsPageShell>
      <DocsHeader
        status="stable"
        kind="composite"
        category="Components / Overlay"
        title="Drawer"
        description="Side-anchored panel for secondary flows (detail view, config, search). Compose Header (with optional leading icon + description), Body, Footer. Built on Radix Dialog — supports any side (left/right/top/bottom)."
      />

      <DocsSection title="Header anatomy">
        <p className="text-sm text-text-sub-600 max-w-2xl">
          4 header variants: title-only / leading icon + title / title + description / icon + title + description. Compose via DrawerHeader + DrawerTitle + DrawerDescription primitives.
        </p>
        <DocsExample
          title="4 header layouts"
          preview={
            <div className="space-y-3 max-w-md">
              <HeaderRow title="Insert title here" />
              <HeaderRow icon={<ClockIcon className="size-5" />} title="Insert title here" />
              <HeaderRow title="Insert title here" desc="Please insert drawer description here." />
              <HeaderRow icon={<ClockIcon className="size-5" />} title="Insert title here" desc="Please insert drawer description here." />
            </div>
          }
          code={`<DrawerHeader>
  <div className="flex items-start gap-3">
    {leading ? <IconChip>{leading}</IconChip> : null}
    <div>
      <DrawerTitle>{title}</DrawerTitle>
      {description ? <DrawerDescription>{description}</DrawerDescription> : null}
    </div>
    <DrawerClose asChild><CompactButton aria-label="Close"><Close /></CompactButton></DrawerClose>
  </div>
</DrawerHeader>`}
        />
      </DocsSection>

      <DocsSection title="Do this, not that">
        <p className="text-base text-text-sub-600 leading-relaxed max-w-2xl">
          Drawer adalah secondary surface. Konteks utama tetap visible. Bukan modal yang block screen.
        </p>
        <DocsDoDont
          do={{
            preview: (
              <div className="flex w-full max-w-xs gap-2">
                <div className="flex-1 rounded border border-stroke-soft-200 p-2 text-xs text-text-sub-600">Delivery list (24 row)</div>
                <div className="w-32 rounded border border-stroke-soft-200 bg-bg-weak-50 p-2">
                  <div className="text-xs font-semibold">DLV-7821</div>
                  <div className="text-[10px] text-text-sub-600">PICKED_UP · ETA 14 min</div>
                </div>
              </div>
            ),
            caption: "Drawer right untuk detail delivery. List tetap terlihat, dispatcher track 24 delivery sambil drill ke satu.",
          }}
          dont={{
            preview: (
              <div className="flex flex-col w-full max-w-xs gap-2">
                <div className="rounded border border-stroke-soft-200 bg-bg-weak-50 p-2 text-xs">
                  <div className="font-semibold mb-1">Konfirmasi cancel DLV-7821?</div>
                  <div className="text-text-sub-600">Customer akan di-notify.</div>
                </div>
              </div>
            ),
            caption: "Jangan pakai Drawer untuk konfirmasi destructive — itu pakai Alert Dialog (focused, blocks input).",
          }}
        />
        <DocsDoDont
          do={{
            caption: "Drawer bottom hanya untuk mobile context (Halo-dash app driver). Desktop default = right side.",
          }}
          dont={{
            caption: "Jangan nest Drawer dalam Drawer (DLV detail → mitra detail → outlet detail). Itu confusing — flatten ke single drawer dengan sub-section.",
          }}
        />
      </DocsSection>

      <DocsSection title="Side anchoring">
        <p className="text-sm text-text-sub-600 max-w-2xl">
          Drawer can slide from any edge. Right (default) for detail views, left for nav drawers, bottom for mobile sheets.
        </p>
        <DocsExample
          title="Pick a side"
          preview={
            <div className="flex flex-wrap items-center gap-2">
              {(["left","right","top","bottom"] as const).map((s) => (
                <Drawer key={s}>
                  <DrawerTrigger asChild>
                    <Button tone="neutral" style="stroke" onClick={() => setSide(s)}>{s}</Button>
                  </DrawerTrigger>
                  <DrawerContent side={s}>
                    <DrawerHeader>
                      <DrawerTitle>{s} drawer</DrawerTitle>
                      <DrawerDescription>Drawer slides in from the {s} edge.</DrawerDescription>
                    </DrawerHeader>
                    <DrawerBody>
                      <p className="text-sm text-text-sub-600">Body content goes here.</p>
                    </DrawerBody>
                    <DrawerFooter>
                      <DrawerClose asChild><Button tone="neutral" style="stroke">Close</Button></DrawerClose>
                    </DrawerFooter>
                  </DrawerContent>
                </Drawer>
              ))}
            </div>
          }
          code={`<DrawerContent side="right">...</DrawerContent>
<DrawerContent side="left">...</DrawerContent>
<DrawerContent side="top">...</DrawerContent>
<DrawerContent side="bottom">...</DrawerContent>`}
        />
      </DocsSection>

      <DocsSection title="Virtual card detail">
        <p className="text-sm text-text-sub-600 max-w-2xl">
          Detail-pane pattern. Hero card preview + meta fields + inline actions + section divider + recent transactions list + footer CTA.
        </p>
        <DocsExample
          title="Open card details"
          preview={
            <Drawer open={openCard} onOpenChange={setOpenCard}>
              <DrawerTrigger asChild>
                <Button tone="neutral" style="stroke">View Virtual Card</Button>
              </DrawerTrigger>
              <DrawerContent side="right" className="w-[400px]">
                <DrawerHeader className="border-b-0 pb-2">
                  <div className="flex items-center justify-between">
                    <DrawerTitle>Virtual Card</DrawerTitle>
                    <DrawerClose asChild><CompactButton size="sm" variant="ghost" aria-label="Close"><Close /></CompactButton></DrawerClose>
                  </div>
                </DrawerHeader>
                <DrawerBody className="space-y-5">
                  <div className="rounded-2xl border border-stroke-soft-200 bg-bg-white-0 p-4 relative overflow-hidden">
                    <div className="flex items-center gap-3 mb-6">
                      <span className="size-8 rounded-md bg-(--state-information-base) inline-flex items-center justify-center text-static-white text-xs font-semibold">≡</span>
                      <Contactless className="size-4 text-icon-soft-400" />
                      <Badge status="success" appearance="lighter" type="left-icon" icon={<Check />}>Active</Badge>
                      <div className="ml-auto inline-flex items-center gap-0.5">
                        <span className="size-5 rounded-full bg-(--state-error-base) inline-block" />
                        <span className="size-5 rounded-full bg-(--state-warning-base) inline-block -ml-2" />
                      </div>
                    </div>
                    <div className="text-xs text-text-soft-400">Savings Card</div>
                    <div className="text-2xl font-semibold text-text-strong-950 mt-1">$16,058.94</div>
                    <div className="absolute bottom-4 right-4">
                      <ButtonGroup>
                        <Button size="icon-xs" tone="neutral" style="stroke" aria-label="Previous"><ChevronLeft /></Button>
                        <Button size="icon-xs" tone="neutral" style="stroke" aria-label="Next"><ChevronRight /></Button>
                      </ButtonGroup>
                    </div>
                  </div>
                  <dl className="space-y-2.5 text-sm">
                    {[
                      ["Card Number", "•••• 1234"],
                      ["Expiry Date", "06/27"],
                      ["CVC", "•••"],
                      ["Spending Limit (Monthly)", "$12,000.00"],
                    ].map(([k, v]) => (
                      <div key={k} className="flex items-center justify-between">
                        <dt className="text-text-sub-600">{k}</dt>
                        <dd className="text-text-strong-950 font-medium">{v}</dd>
                      </div>
                    ))}
                  </dl>
                  <ButtonGroup>
                    <Button size="sm" tone="neutral" style="stroke" className="flex-1">Unhide</Button>
                    <Button size="sm" tone="neutral" style="stroke" className="flex-1">Adjust Limit</Button>
                    <Button size="sm" tone="neutral" style="stroke" className="flex-1">More</Button>
                  </ButtonGroup>
                  <ContentDivider variant="solid">Recent Transactions</ContentDivider>
                  <ul className="space-y-3">
                    {[
                      { name: "Netflix Cashback",  sub: "Cashback of September, 2023",     amt: "$36.24",   date: "Sep 18", iconBg: "bg-(--state-error-base)",   ic: "N" },
                      { name: "Rental Income",     sub: "Rental payment from Mr. Dudley.",  amt: "$800.00",  date: "Sep 17", iconBg: "bg-(--state-success-light)", ic: "⌂" },
                      { name: "Grocery Shopping",  sub: "Purchase of monthly groceries.",   amt: "-$84.14",  date: "Sep 16", iconBg: "bg-bg-weak-50",              ic: "🛒" },
                      { name: "Stock Dividend",    sub: "Payment from stock investments.",  amt: "$1,500.00",date: "Sep 15", iconBg: "bg-(--state-error-light)",   ic: "◐" },
                      { name: "Electricity Bills", sub: "Payment for electricity bills.",   amt: "-$72.32",  date: "Sep 14", iconBg: "bg-(--state-warning-light)", ic: "💡" },
                    ].map((tx) => (
                      <li key={tx.name} className="flex items-center gap-3">
                        <span className={["size-9 rounded-full text-static-white inline-flex items-center justify-center text-xs font-semibold", tx.iconBg].join(" ")}>{tx.ic}</span>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-text-strong-950">{tx.name}</div>
                          <div className="text-xs text-text-soft-400 truncate">{tx.sub}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium text-text-strong-950">{tx.amt}</div>
                          <div className="text-xs text-text-soft-400">{tx.date}</div>
                        </div>
                        <ChevronRight className="size-4 text-icon-soft-400" />
                      </li>
                    ))}
                  </ul>
                </DrawerBody>
                <DrawerFooter>
                  <Button tone="neutral" style="stroke" leftIcon={<ClockIcon />}>See All Transactions</Button>
                </DrawerFooter>
              </DrawerContent>
            </Drawer>
          }
          code={`<Drawer>
  <DrawerTrigger asChild><Button>View Virtual Card</Button></DrawerTrigger>
  <DrawerContent side="right" className="w-[400px]">
    <DrawerHeader><DrawerTitle>Virtual Card</DrawerTitle></DrawerHeader>
    <DrawerBody>
      <CardPreview />
      <MetaList />
      <ButtonGroup>Unhide / Adjust Limit / More</ButtonGroup>
      <ContentDivider variant="solid">Recent Transactions</ContentDivider>
      <Transactions />
    </DrawerBody>
    <DrawerFooter><Button>See All Transactions</Button></DrawerFooter>
  </DrawerContent>
</Drawer>`}
        />
      </DocsSection>

      <DocsSection title="Service fee config">
        <p className="text-sm text-text-sub-600 max-w-2xl">
          Form-heavy drawer. Underline tabs + sectioned form via ContentDivider solid bars (Eligibility / Payment Methods / Service Availability).
        </p>
        <DocsExample
          title='"Service Fee" form drawer'
          preview={
            <Drawer open={openFee} onOpenChange={setOpenFee}>
              <DrawerTrigger asChild>
                <Button tone="neutral" style="stroke">Configure Service Fee</Button>
              </DrawerTrigger>
              <DrawerContent side="right" className="w-[400px]">
                <DrawerHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <DrawerTitle>Service Fee</DrawerTitle>
                      <DrawerDescription>Configure your service pricing and terms</DrawerDescription>
                    </div>
                    <DrawerClose asChild><CompactButton size="sm" variant="ghost" aria-label="Close"><Close /></CompactButton></DrawerClose>
                  </div>
                </DrawerHeader>
                <DrawerBody className="p-0">
                  <div className="flex items-center border-b border-stroke-soft-200 px-6">
                    {[
                      { id: "monthly", label: "Monthly Fee" },
                      { id: "onetime", label: "One-time Fee" },
                      { id: "none",    label: "No Fee"     },
                    ].map((t) => (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => setFeeTab(t.id as typeof feeTab)}
                        className={[
                          "flex-1 py-3 text-sm font-medium border-b-2",
                          feeTab === t.id
                            ? "border-primary text-primary"
                            : "border-transparent text-text-sub-600 hover:text-text-strong-950",
                        ].join(" ")}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>
                  <div className="p-6 space-y-3">
                    <label className="text-sm font-medium text-text-strong-950">Amount</label>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 inline-flex items-center gap-2 h-10 px-3 rounded-md border border-stroke-soft-200 text-sm text-text-soft-400">
                        € 0.00
                      </div>
                      <Button size="md" tone="neutral" style="stroke" leftIcon={<span className="size-4 rounded-full bg-(--state-information-base) inline-block" />} rightIcon={<ChevronRight className="rotate-90" />}>
                        EUR
                      </Button>
                    </div>
                  </div>
                  <ContentDivider variant="solid">Eligibility Criteria</ContentDivider>
                  <div className="p-6 space-y-3">
                    <label className="text-sm font-medium text-text-strong-950">Prequisites</label>
                    <div className="flex items-center gap-2 h-10 px-3 rounded-md border border-stroke-soft-200 text-sm text-text-soft-400">
                      Prequisites
                      <ChevronRight className="ml-auto size-4 rotate-90" />
                    </div>
                    <label className="flex items-center gap-2.5 text-sm text-text-strong-950 cursor-pointer">
                      <Checkbox /> Client must have an existing account
                    </label>
                  </div>
                  <ContentDivider variant="solid">Payment Methods</ContentDivider>
                  <div className="p-6 space-y-3">
                    {[
                      { name: "Bank Transfer", hint: "(1-3 business days)", desc: "Direct bank to bank transfers", checked: true },
                      { name: "Credit Card",   hint: "(Instant)",            desc: "All major cards accepted",      checked: false },
                      { name: "Digital Wallet",hint: "(Instant)",            desc: "Popular digital payment methods",checked: true },
                    ].map((m) => (
                      <label key={m.name} className="flex items-start gap-2.5 cursor-pointer">
                        <Checkbox checked={m.checked} className="mt-0.5" />
                        <div>
                          <div className="text-sm">
                            <strong className="text-text-strong-950">{m.name}</strong>{" "}
                            <span className="text-text-sub-600">{m.hint}</span>
                          </div>
                          <div className="text-xs text-text-soft-400">{m.desc}</div>
                        </div>
                      </label>
                    ))}
                  </div>
                  <ContentDivider variant="solid">Service Availability</ContentDivider>
                  <div className="p-6 space-y-3">
                    {[
                      { id: "public",  label: "Public Service",  hint: "(Recommended)", desc: "Visible to all users in the marketplace" },
                      { id: "private", label: "Private Service", hint: "",              desc: "Limited visibility for select clients"    },
                    ].map((o) => (
                      <label key={o.id} className="flex items-start gap-2.5 cursor-pointer">
                        <span className={["mt-0.5 size-4 rounded-full border inline-flex items-center justify-center shrink-0", serviceVis === o.id ? "border-primary" : "border-stroke-soft-200"].join(" ")}>
                          {serviceVis === o.id ? <span className="size-2 rounded-full bg-primary" /> : null}
                        </span>
                        <div onClick={() => setServiceVis(o.id as typeof serviceVis)}>
                          <div className="text-sm">
                            <strong className="text-text-strong-950">{o.label}</strong>{" "}
                            {o.hint ? <span className="text-text-sub-600">{o.hint}</span> : null}
                          </div>
                          <div className="text-xs text-text-soft-400">{o.desc}</div>
                        </div>
                      </label>
                    ))}
                  </div>
                </DrawerBody>
                <DrawerFooter>
                  <DrawerClose asChild><Button tone="neutral" style="stroke" className="flex-1">Cancel</Button></DrawerClose>
                  <Button tone="primary" className="flex-1">Continue</Button>
                </DrawerFooter>
              </DrawerContent>
            </Drawer>
          }
          code={`<DrawerContent>
  <DrawerHeader>
    <DrawerTitle>Service Fee</DrawerTitle>
    <DrawerDescription>Configure your service pricing and terms</DrawerDescription>
  </DrawerHeader>
  <DrawerBody>
    <TabBar />
    <FormFields />
    <ContentDivider variant="solid">Eligibility Criteria</ContentDivider>
    <ContentDivider variant="solid">Payment Methods</ContentDivider>
    <ContentDivider variant="solid">Service Availability</ContentDivider>
  </DrawerBody>
  <DrawerFooter>
    <Button style="stroke">Cancel</Button>
    <Button>Continue</Button>
  </DrawerFooter>
</DrawerContent>`}
        />
      </DocsSection>

      <DocsSection title="Help / Support panel">
        <p className="text-sm text-text-sub-600 max-w-2xl">
          Search + sectioned help articles. Numbered top issues + bulleted suggestions + iconified Self Service rows + Support footer counter + View hours CTA.
        </p>
        <DocsExample
          title='"Internet Banking Support"'
          preview={
            <Drawer open={openSupport} onOpenChange={setOpenSupport}>
              <DrawerTrigger asChild>
                <Button tone="neutral" style="stroke">Open Support Panel</Button>
              </DrawerTrigger>
              <DrawerContent side="right" className="w-[400px]">
                <DrawerHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <DrawerTitle>Internet Banking Support</DrawerTitle>
                      <DrawerDescription>Contact Support (24/7)</DrawerDescription>
                    </div>
                    <DrawerClose asChild><CompactButton size="sm" variant="ghost" aria-label="Close"><Close /></CompactButton></DrawerClose>
                  </div>
                </DrawerHeader>
                <DrawerBody className="p-0">
                  <div className="px-6 pt-4">
                    <div className="inline-flex items-center gap-2 w-full h-9 px-3 rounded-md border border-stroke-soft-200 bg-bg-white-0 text-sm text-text-soft-400">
                      <Search className="size-4" />
                      Search for help...
                      <kbd className="ml-auto text-[10px] px-1 rounded bg-bg-weak-50 text-text-sub-600">⌘1</kbd>
                    </div>
                  </div>
                  <ContentDivider variant="solid" className="mt-4">Unable to Access Wallet</ContentDivider>
                  <ul className="px-6 py-3 space-y-2">
                    {[
                      ["1", "Two-Factor Authentication Issues"],
                      ["2", "Incorrect Login Information"],
                    ].map(([n, label]) => (
                      <li key={n} className="flex items-center gap-3 text-sm text-text-strong-950">
                        <span className="text-text-soft-400 w-3">{n}</span>
                        <span>{label}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="px-6 pb-4">
                    <Button size="sm" tone="neutral" style="stroke" className="w-full">How to resolve?</Button>
                  </div>
                  <ContentDivider variant="solid">You might be looking for</ContentDivider>
                  <ul className="px-6 py-3 space-y-2">
                    {[
                      [<File key="f" className="size-4 text-icon-soft-400" />,  "Generate monthly statement?"],
                      [<Q key="q" className="size-4 text-icon-soft-400" />,     "Want to automate your bill payments?"],
                      [<Trophy key="t" className="size-4 text-icon-soft-400" />,"Looking to earn rewards with premium banking?"],
                    ].map(([Icon, label], i) => (
                      <li key={i} className="flex items-center gap-3 text-sm text-text-strong-950">{Icon}<span>{label}</span></li>
                    ))}
                  </ul>
                  <ContentDivider variant="solid">Self Service</ContentDivider>
                  <ul className="px-6 py-3 divide-y divide-stroke-soft-200">
                    {[
                      { Icon: Lock,   tone: "bg-(--state-success-light) text-(--state-success-dark)",       title: "Reset Password",   desc: "Reset your online banking password." },
                      { Icon: Shield, tone: "bg-(--state-information-light) text-(--state-information-dark)", title: "Account Security", desc: "Update authentication settings." },
                      { Icon: Key,    tone: "bg-(--state-warning-light) text-(--state-warning-dark)",         title: "Recover Account",  desc: "Regain access to online banking." },
                      { Icon: Card,   tone: "bg-(--state-highlighted-light) text-(--state-highlighted-dark)", title: "PIN Services",     desc: "Change ATM or card PIN." },
                    ].map((row) => (
                      <li key={row.title} className="flex items-center gap-3 py-3">
                        <span className={["size-9 rounded-full inline-flex items-center justify-center", row.tone].join(" ")}>
                          <row.Icon className="size-4" />
                        </span>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-text-strong-950">{row.title}</div>
                          <div className="text-xs text-text-soft-400">{row.desc}</div>
                        </div>
                        <ChevronRight className="size-4 text-icon-soft-400" />
                      </li>
                    ))}
                  </ul>
                </DrawerBody>
                <DrawerFooter>
                  <div className="flex items-center justify-between w-full">
                    <span className="inline-flex items-center gap-1 text-sm text-text-sub-600"><Avatar size="xs"><AvatarFallback>S</AvatarFallback></Avatar> Support <span className="text-text-soft-400">(8)</span></span>
                    <Button tone="neutral">View Support Hours</Button>
                  </div>
                </DrawerFooter>
              </DrawerContent>
            </Drawer>
          }
          code={`<DrawerContent>
  <DrawerHeader>
    <DrawerTitle>Internet Banking Support</DrawerTitle>
    <DrawerDescription>Contact Support (24/7)</DrawerDescription>
  </DrawerHeader>
  <DrawerBody>
    <SearchInput />
    <ContentDivider variant="solid">Unable to Access Wallet</ContentDivider>
    <NumberedList />
    <Button>How to resolve?</Button>
    <ContentDivider variant="solid">You might be looking for</ContentDivider>
    <IconList />
    <ContentDivider variant="solid">Self Service</ContentDivider>
    <SelfServiceList />
  </DrawerBody>
  <DrawerFooter>
    <SupportCounter />
    <Button>View Support Hours</Button>
  </DrawerFooter>
</DrawerContent>`}
        />
      </DocsSection>

      <DocsSection title="API">
        <DocsPropsTable
          rows={[
            { name: "Drawer", type: "Radix Dialog Root props", description: "open, onOpenChange, modal." },
            { name: "DrawerContent.side", type: '"left" | "right" | "top" | "bottom"', defaultValue: '"right"', description: "Edge the drawer slides in from." },
            { name: "DrawerHeader", type: "div", description: "Container for DrawerTitle + DrawerDescription + close button. Apply your own padding override via className." },
            { name: "DrawerTitle", type: "Dialog.Title", description: "Required for a11y. text-base font-medium tracking-tight." },
            { name: "DrawerDescription", type: "Dialog.Description", description: "Optional sub-text below the title." },
            { name: "DrawerBody", type: "div", description: "Scrollable middle region (flex-1 overflow-y-auto p-6). Override padding for full-bleed sections." },
            { name: "DrawerFooter", type: "div", description: "Action row pinned at the bottom. Stacks reverse on mobile, row-justify-end on sm+." },
            { name: "DrawerClose", type: "Dialog.Close", description: "Apply asChild to a Button/CompactButton trigger." },
          ]}
        />
      </DocsSection>
    </DocsPageShell>
  )
}
