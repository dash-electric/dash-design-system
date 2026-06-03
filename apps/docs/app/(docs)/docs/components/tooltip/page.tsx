"use client"

import * as React from "react"
import {
  RiGlobalLine as Globe,
  RiCloseLine as X,
  RiInformationLine as Info,
  RiLineChartLine as LineChart,
  RiHeart3Line as Heart,
  RiBarChartHorizontalLine as BarChart,
  RiSettings3Line as Settings,
  RiMailLine as Mail,
  RiArrowRightUpLine as ArrowUp,
  RiAddLine as Plus,
  RiUser3Line as UserIcon,
  RiSpyLine as Spy,
  RiCheckLine as Check,
  RiArrowDownSLine as ChevronDown,
} from "@remixicon/react"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/registry/dash/ui/tooltip"
import { Button } from "@/registry/dash/ui/button"
import { CompactButton } from "@/registry/dash/ui/compact-button"
import { Badge } from "@/registry/dash/ui/badge"
import { Label } from "@/registry/dash/ui/label"
import { Field } from "@/registry/dash/ui/field"
import { InputRoot, Input, InputIcon } from "@/registry/dash/ui/input"
import { SegmentedControl, SegmentedItem } from "@/registry/dash/ui/segmented-control"
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
 * Tooltip — Figma 1:1 (15 nodes verified 2026-05-18).
 *
 *   2604:269        Master spec — 3 sizes (xs/sm/lg) × 2 appearances (light/dark) × 12 sides+aligns + rich content
 *   4009:87524      Stock Market chart tooltip (light)
 *   4009:87526      Stock Market chart tooltip (dark)
 *   4009:87794      Donation Statistic chart tooltip (light)
 *   4009:87796      Donation Statistic chart tooltip (dark)
 *   4009:88087      Major Expenses bar chart tooltip (light)
 *   4009:88089      Major Expenses bar chart tooltip (dark)
 *   4009:88332      Email Verification field-info tooltip (light)
 *   4009:88334      Email Verification field-info tooltip (dark)
 *   167387:86988    Stat tooltip — 35.92% w/ country + quarters meta
 *   167387:87008    Impressions device-split tooltip
 *   167387:87030    Risks identified tooltip w/ legend + total
 *   167387:87054    Password strength tooltip w/ meter + checklist
 *   4009:88712      File Format helper-info trigger (closed)
 *   4024:88770      File Format helper-info tooltip (open above field)
 */

export default function TooltipDocsPage() {
  return (
    <TooltipProvider delayDuration={150}>
      <DocsPageShell>
        <DocsHeader
          status="stable"
          kind="composite"
          category="Components / Overlay"
          title="Tooltip"
          description="Hover/focus overlay revealing supplementary info. 3 sizes (xs/sm/lg) × 2 appearances (light/dark) × 12 placements. Rich variant supports icon + title + description + close button. Use for: form field hints, chart datapoint readouts, label disambiguation, settings explainers."
        />

        <DocsSection title="Install">
          <DocsCode language="bash" code={`dashkit add tooltip`} />
        </DocsSection>

        <DocsSection title="Usage">
          <DocsCode
            language="tsx"
            code={`import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from "@/registry/dash/ui/tooltip"

<TooltipProvider>
  <Tooltip>
    <TooltipTrigger asChild>
      <Button>Hover me</Button>
    </TooltipTrigger>
    <TooltipContent>Insert Tooltip</TooltipContent>
  </Tooltip>
</TooltipProvider>`}
          />
        </DocsSection>

        <DocsSection title="Sizes × appearance">
          <p className="text-sm text-text-sub-600 max-w-2xl">
            3 sizes × 2 appearances. <code className="text-xs px-1 py-0.5 rounded bg-bg-weak-50">xs</code> = 24h compact pill · <code className="text-xs px-1 py-0.5 rounded bg-bg-weak-50">sm</code> = 34h standard · <code className="text-xs px-1 py-0.5 rounded bg-bg-weak-50">lg</code> = 12px-pad rich with icon + title + description + close (Figma node 2604:269).
          </p>
          <DocsExample
            title="xs / sm × light / dark"
            preview={
              <div className="grid grid-cols-2 gap-x-8 gap-y-4 max-w-md">
                <SizePreview size="xs" appearance="light" />
                <SizePreview size="xs" appearance="dark" />
                <SizePreview size="sm" appearance="light" />
                <SizePreview size="sm" appearance="dark" />
              </div>
            }
            code={`<Tooltip>
  <TooltipTrigger>...</TooltipTrigger>
  <TooltipContent size="xs" appearance="light">Insert Tooltip</TooltipContent>
</Tooltip>`}
          />
        </DocsSection>

        <DocsSection title="Sides × alignments">
          <p className="text-sm text-text-sub-600 max-w-2xl">
            4 sides (top / right / bottom / left) × 3 alignments (start / center / end) = 12 placements.
          </p>
          <DocsExample
            title="All 12 placements"
            preview={
              <div className="grid grid-cols-4 gap-3 max-w-lg">
                {(["top", "right", "bottom", "left"] as const).flatMap((side) =>
                  (["start", "center", "end"] as const).map((align) => (
                    <Tooltip key={`${side}-${align}`}>
                      <TooltipTrigger asChild>
                        <Button style="stroke" tone="neutral" size="xs">
                          {side.slice(0, 1)}/{align.slice(0, 1)}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side={side} align={align}>Insert Tooltip</TooltipContent>
                    </Tooltip>
                  )),
                )}
              </div>
            }
            code={`<TooltipContent side="top" align="start">Insert Tooltip</TooltipContent>
<TooltipContent side="right" align="center">Insert Tooltip</TooltipContent>`}
          />
        </DocsSection>

        <DocsSection title="Rich tooltip (size=lg)">
          <p className="text-sm text-text-sub-600 max-w-2xl">
            Compose icon + title + description + close button inside <code className="text-xs px-1 py-0.5 rounded bg-bg-weak-50">size=&quot;lg&quot;</code> for help-tip or product-tour patterns.
          </p>
          <DocsExample
            title="Rich content × 2 appearances"
            preview={
              <div className="flex flex-wrap items-center gap-6">
                <Tooltip open>
                  <TooltipTrigger asChild>
                    <Button>Hover (light)</Button>
                  </TooltipTrigger>
                  <TooltipContent size="lg" appearance="light" className="w-72">
                    <RichBody appearance="light" />
                  </TooltipContent>
                </Tooltip>
                <Tooltip open>
                  <TooltipTrigger asChild>
                    <Button>Hover (dark)</Button>
                  </TooltipTrigger>
                  <TooltipContent size="lg" appearance="dark" className="w-72">
                    <RichBody appearance="dark" />
                  </TooltipContent>
                </Tooltip>
              </div>
            }
            code={`<TooltipContent size="lg" className="w-72">
  <div className="flex items-start gap-2">
    <Globe className="size-4 mt-0.5" />
    <div className="flex-1 space-y-1">
      <div className="font-medium">Insert Tooltip</div>
      <p className="text-text-sub-600">Insert tooltip description here.</p>
    </div>
    <CompactButton variant="ghost" size="sm" aria-label="Close"><X /></CompactButton>
  </div>
</TooltipContent>`}
          />
        </DocsSection>

        <DocsSection title="Composite: Stock Market chart">
          <p className="text-sm text-text-sub-600 max-w-2xl">
            xs dark tooltip pinned to a chart datapoint w/ vertical guideline. Light + dark surface variants (Figma nodes 4009:87524 + 4009:87526).
          </p>
          <DocsExample
            title="Stock Market Tracker — light + dark"
            preview={
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <StockMarketCard theme="light" />
                <StockMarketCard theme="dark" />
              </div>
            }
            code={`// Pin tooltip to chart datapoint
<div className="relative">
  <svg>...</svg>
  <div className="absolute" style={{ left: x, top: y }}>
    <Tooltip open>
      <TooltipTrigger asChild><span className="size-2 rounded-full bg-primary" /></TooltipTrigger>
      <TooltipContent size="xs" appearance="dark">$439,82.21</TooltipContent>
    </Tooltip>
  </div>
</div>`}
          />
        </DocsSection>

        <DocsSection title="Composite: Donation Statistic chart">
          <p className="text-sm text-text-sub-600 max-w-2xl">
            xs tooltip on dual-line chart datapoint — flips light/dark based on card theme (Figma nodes 4009:87794 + 4009:87796).
          </p>
          <DocsExample
            title="Donation Statistic — light + dark"
            preview={
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <DonationStatCard theme="light" />
                <DonationStatCard theme="dark" />
              </div>
            }
            code={`<TooltipContent size="xs">$1,000.00</TooltipContent>`}
          />
        </DocsSection>

        <DocsSection title="Composite: Bar chart hover tooltip">
          <p className="text-sm text-text-sub-600 max-w-2xl">
            xs dark/light tooltip on horizontal bar with cursor pointer (Figma nodes 4009:88087 + 4009:88089).
          </p>
          <DocsExample
            title="Major Expenses — light + dark"
            preview={
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <ExpensesCard theme="light" />
                <ExpensesCard theme="dark" />
              </div>
            }
            code={`<TooltipContent size="xs" appearance="dark">$439,82.21</TooltipContent>`}
          />
        </DocsSection>

        <DocsSection title="Composite: Email Verification field-info">
          <p className="text-sm text-text-sub-600 max-w-2xl">
            Hover the Info icon next to a field label → reveals contextual hint. Light + dark card variants (Figma nodes 4009:88332 + 4009:88334).
          </p>
          <DocsExample
            title="Email field — light + dark"
            preview={
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <EmailVerificationCard theme="light" />
                <EmailVerificationCard theme="dark" />
              </div>
            }
            code={`<Label>
  Email Address
  <Tooltip>
    <TooltipTrigger asChild>
      <button aria-label="Info"><Info /></button>
    </TooltipTrigger>
    <TooltipContent size="sm" appearance="dark">The email you registered with.</TooltipContent>
  </Tooltip>
</Label>`}
          />
        </DocsSection>

        <DocsSection title="Composite: Stat tooltip (35.92%)">
          <p className="text-sm text-text-sub-600 max-w-2xl">
            Large light tooltip stack — headline value + ratio + 2-column metadata footer (country, quarter). Figma node 167387:86988.
          </p>
          <DocsExample
            title="Big stat readout"
            preview={
              <div className="relative inline-block">
                <Tooltip open>
                  <TooltipTrigger asChild><span className="inline-block size-2 rounded-full bg-error-base" /></TooltipTrigger>
                  <TooltipContent size="lg" appearance="light" className="w-56 p-0 overflow-hidden">
                    <div className="px-3 py-2 border-l-2 border-error-base">
                      <div className="text-lg font-semibold text-text-strong-950 tabular-nums">35.92%</div>
                      <div className="text-xs text-text-sub-600 tabular-nums">397.66 over 1,107</div>
                    </div>
                    <div className="grid grid-cols-2 border-t border-stroke-soft-200">
                      <div className="p-2 border-r border-stroke-soft-200">
                        <div className="text-sm font-medium text-text-strong-950">GB</div>
                        <div className="text-xs text-text-sub-600">Country</div>
                      </div>
                      <div className="p-2">
                        <div className="text-sm font-medium text-text-strong-950">Q3/25</div>
                        <div className="text-xs text-text-sub-600">Quarters</div>
                      </div>
                    </div>
                  </TooltipContent>
                </Tooltip>
              </div>
            }
            code={`<TooltipContent size="lg" className="w-56 p-0">
  <div className="px-3 py-2 border-l-2 border-error-base">
    <div className="text-lg font-semibold">35.92%</div>
    <div className="text-xs text-text-sub-600">397.66 over 1,107</div>
  </div>
  <div className="grid grid-cols-2 border-t">
    <div><Strong>GB</Strong><Sub>Country</Sub></div>
    <div><Strong>Q3/25</Strong><Sub>Quarters</Sub></div>
  </div>
</TooltipContent>`}
          />
        </DocsSection>

        <DocsSection title="Composite: Impressions device-split">
          <p className="text-sm text-text-sub-600 max-w-2xl">
            Title + date + 3 device rows with colored dots + count column. Figma node 167387:87008.
          </p>
          <DocsExample
            title="Impressions list"
            preview={
              <div className="relative inline-block">
                <Tooltip open>
                  <TooltipTrigger asChild><span className="inline-block size-2 rounded-full bg-primary" /></TooltipTrigger>
                  <TooltipContent size="lg" appearance="light" className="w-56">
                    <div className="space-y-2">
                      <div>
                        <div className="text-sm font-medium text-text-strong-950">Impressions</div>
                        <div className="text-xs text-text-sub-600">Tuesday 19 November 2024</div>
                      </div>
                      <ul className="space-y-1 text-xs">
                        {[
                          { label: "Desktop", dot: "bg-success-base", count: 1 },
                          { label: "Mobile", dot: "bg-primary", count: 49 },
                          { label: "Tablet", dot: "bg-error-base", count: 5 },
                        ].map((r) => (
                          <li key={r.label} className="flex items-center gap-1.5">
                            <span className={`size-1.5 rounded-full ${r.dot}`} />
                            <span className="flex-1 text-text-strong-950">{r.label}</span>
                            <span className="tabular-nums text-text-strong-950">{r.count}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </TooltipContent>
                </Tooltip>
              </div>
            }
            code={`<TooltipContent size="lg">
  <Title>Impressions</Title>
  <Date>Tuesday 19 November 2024</Date>
  <ul>{rows.map(r => (
    <li key={r.label} className="flex items-center gap-1.5">
      <span className={\`size-1.5 rounded-full \${r.dot}\`} />
      <span className="flex-1">{r.label}</span>
      <span className="tabular-nums">{r.count}</span>
    </li>
  ))}</ul>
</TooltipContent>`}
          />
        </DocsSection>

        <DocsSection title="Composite: Risks identified">
          <p className="text-sm text-text-sub-600 max-w-2xl">
            Caption + 3-row legend (square swatches) + Total separator row. Figma node 167387:87030.
          </p>
          <DocsExample
            title="Legend + total"
            preview={
              <div className="relative inline-block">
                <Tooltip open>
                  <TooltipTrigger asChild><span className="inline-block size-2 rounded-full bg-error-base" /></TooltipTrigger>
                  <TooltipContent size="lg" appearance="light" className="w-56">
                    <div className="space-y-1.5">
                      <div className="text-xs text-text-sub-600">Risks identified as of Aug 20</div>
                      <ul className="space-y-1 text-xs">
                        {[
                          { label: "High", color: "bg-error-base", count: 1 },
                          { label: "Med", color: "bg-warning-base", count: 2 },
                          { label: "Low", color: "bg-success-base", count: 2 },
                        ].map((r) => (
                          <li key={r.label} className="flex items-center gap-1.5">
                            <span className={`size-2.5 rounded-sm ${r.color}`} />
                            <span className="flex-1 text-text-strong-950">{r.label}</span>
                            <span className="tabular-nums text-text-strong-950">{r.count}</span>
                          </li>
                        ))}
                      </ul>
                      <div className="flex items-center gap-1.5 text-xs border-t border-stroke-soft-200 pt-1.5">
                        <span className="flex-1 text-text-strong-950">Total</span>
                        <span className="tabular-nums text-text-strong-950">5</span>
                      </div>
                    </div>
                  </TooltipContent>
                </Tooltip>
              </div>
            }
            code={`<TooltipContent size="lg">
  <Caption>Risks identified as of Aug 20</Caption>
  {rows.map(...)}
  <Separator />
  <TotalRow>5</TotalRow>
</TooltipContent>`}
          />
        </DocsSection>

        <DocsSection title="Composite: Password strength">
          <p className="text-sm text-text-sub-600 max-w-2xl">
            3-segment strength meter top + checklist of password rules (Figma node 167387:87054).
          </p>
          <DocsExample
            title="Strength meter + rules"
            preview={
              <div className="relative inline-block">
                <Tooltip open>
                  <TooltipTrigger asChild><span className="inline-block size-2 rounded-full bg-success-base" /></TooltipTrigger>
                  <TooltipContent size="lg" appearance="light" className="w-56 p-0">
                    <div className="grid grid-cols-3 gap-1 p-2">
                      <div className="h-1 rounded-full bg-error-base" />
                      <div className="h-1 rounded-full bg-warning-base" />
                      <div className="h-1 rounded-full bg-success-base" />
                    </div>
                    <div className="px-3 pb-2 space-y-1">
                      <div className="text-xs text-text-sub-600">Must contain at least:</div>
                      {["At least 1 uppercase", "At least 1 number", "At least 8 characters"].map((r) => (
                        <div key={r} className="flex items-center gap-1.5 text-xs">
                          <span className="inline-flex size-3.5 items-center justify-center rounded-full bg-success-base text-white">
                            <Check className="size-2.5" />
                          </span>
                          <span className="text-text-strong-950">{r}</span>
                        </div>
                      ))}
                    </div>
                  </TooltipContent>
                </Tooltip>
              </div>
            }
            code={`<TooltipContent size="lg" className="p-0">
  <StrengthMeter score={3} />
  <ul>
    {rules.map(r => (
      <li><CheckIcon /> {r.label}</li>
    ))}
  </ul>
</TooltipContent>`}
          />
        </DocsSection>

        <DocsSection title="Composite: File Format helper">
          <p className="text-sm text-text-sub-600 max-w-2xl">
            Hover the Info icon next to a Label → contextual file-format hint above the field. Figma nodes 4009:88712 + 4024:88770.
          </p>
          <DocsExample
            title="Field helper info"
            preview={
              <div className="max-w-sm">
                <Field>
                  <Label required className="inline-flex items-center gap-1">
                    File Format
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button type="button" aria-label="Info" className="text-icon-soft-400 hover:text-icon-sub-600">
                          <Info className="size-3.5" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent size="sm" appearance="light" side="top" align="start">
                        Only the supported formats can be uploaded.
                      </TooltipContent>
                    </Tooltip>
                  </Label>
                  <InputRoot>
                    <Input defaultValue="Word Document (DOCX)" readOnly />
                    <InputIcon><ChevronDown className="size-4" /></InputIcon>
                  </InputRoot>
                </Field>
              </div>
            }
            code={`<Label required>
  File Format
  <Tooltip>
    <TooltipTrigger asChild>
      <button aria-label="Info"><Info /></button>
    </TooltipTrigger>
    <TooltipContent side="top" align="start">
      Only the supported formats can be uploaded.
    </TooltipContent>
  </Tooltip>
</Label>`}
          />
        </DocsSection>

        <DocsSection title="Do this, not that">
          <p className="text-base text-text-sub-600 leading-relaxed max-w-2xl">
            Tooltip menjelaskan icon-only button atau hint shortcut. Bukan untuk teks yang sudah visible. Pakai sparingly — kalau setiap element butuh tooltip, mungkin UI butuh redesign.
          </p>
          <DocsDoDont
            do={{
              preview: (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <CompactButton variant="ghost" size="sm" aria-label="Suspend mtr-9412"><X /></CompactButton>
                    </TooltipTrigger>
                    <TooltipContent>Suspend mtr-9412 (Ctrl+S)</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ),
              caption: "Icon-only button (X) + tooltip explanation + keyboard shortcut. Hover/focus = clear context untuk semua user.",
            }}
            dont={{
              preview: (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button size="sm">Simpan</Button>
                    </TooltipTrigger>
                    <TooltipContent>Simpan</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ),
              caption: "Tooltip yang ulang label visible ('Simpan' = 'Simpan') = noise. Tooltip untuk INFO TAMBAHAN, bukan repeat.",
            }}
          />
          <DocsDoDont
            do={{
              preview: (
                <TooltipProvider>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-text-strong-950">SLA breach 92%</span>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <CompactButton variant="ghost" size="sm" aria-label="Info SLA"><Info /></CompactButton>
                      </TooltipTrigger>
                      <TooltipContent>SLA target ≤95% breach selama bulan ini. Surge mode aktif otomatis ≥80%.</TooltipContent>
                    </Tooltip>
                  </div>
                </TooltipProvider>
              ),
              caption: "Info icon dengan tooltip detail (definisi metric, threshold rules). User curious dapat klarifikasi tanpa pindah halaman.",
            }}
            dont={{
              preview: (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="text-sm text-error-base cursor-help">CLICK HERE FOR IMPORTANT INFO!!!</span>
                    </TooltipTrigger>
                    <TooltipContent>Detail SLA breach...</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ),
              caption: "Critical info di tooltip = hidden behind hover, mobile user tidak akses. Info penting di body content, tooltip untuk sekunder.",
            }}
          />
        </DocsSection>

        <DocsSection title="API">
          <DocsPropsTable
            rows={[
              { name: "TooltipContent.size", type: '"xs" | "sm" | "lg"', defaultValue: '"sm"', description: "Padding + radius scale. xs = 24h pill · sm = 34h standard · lg = rich card." },
              { name: "TooltipContent.appearance", type: '"light" | "dark"', defaultValue: '"light"', description: "Surface fill. Light = bg-white-0 + shadow-tooltip · Dark = bg-strong-950." },
              { name: "TooltipContent.side", type: '"top" | "right" | "bottom" | "left"', defaultValue: '"top"', description: "Preferred placement edge." },
              { name: "TooltipContent.align", type: '"start" | "center" | "end"', defaultValue: '"center"', description: "Alignment along the preferred edge." },
              { name: "TooltipContent.sideOffset", type: "number", defaultValue: "6", description: "Distance in px between trigger + content." },
              { name: "TooltipProvider.delayDuration", type: "number", defaultValue: "700", description: "Hover delay before showing. Dash docs uses 150ms." },
            ]}
          />
        </DocsSection>

        <DocsSection title="Anatomy">
          <ul className="space-y-2 text-sm text-text-strong-950/90">
            <li>• <strong>TooltipProvider</strong> — single per app/section, configures global delay.</li>
            <li>• <strong>Tooltip</strong> — Radix Root, manages open state per trigger.</li>
            <li>• <strong>TooltipTrigger</strong> — wrap any element (<code className="text-xs">asChild</code> for composition).</li>
            <li>• <strong>TooltipContent</strong> — portal-rendered overlay; size + appearance variants.</li>
            <li>• <strong>Rich content</strong> — for size=lg, slot icon + title + description + close button manually.</li>
          </ul>
        </DocsSection>

        <DocsSection title="Accessibility">
          <ul className="space-y-2 text-sm text-text-strong-950/90">
            <li>• <strong>Hover + focus</strong> — Radix opens on both pointer enter + keyboard focus.</li>
            <li>• <strong>Escape closes</strong> — pressing Escape dismisses an open tooltip.</li>
            <li>• <strong>Trigger label</strong> — info-icon triggers need <code className="text-xs">aria-label</code>.</li>
            <li>• <strong>Don't hide critical info</strong> — never put primary actions or required info behind hover.</li>
            <li>• <strong>Touch devices</strong> — Radix opens tooltip on long-press; provide alt UI for mobile when needed.</li>
            <li>• <strong>Disabled triggers</strong> — Radix doesn't fire pointer events on <code className="text-xs">disabled</code>. Wrap in a span to enable tooltip.</li>
          </ul>
        </DocsSection>
      </DocsPageShell>
    </TooltipProvider>
  )
}

function SizePreview({ size, appearance }: { size: "xs" | "sm"; appearance: "light" | "dark" }) {
  return (
    <Tooltip open>
      <TooltipTrigger asChild>
        <Button style="stroke" tone="neutral" size="xs">
          {size} · {appearance}
        </Button>
      </TooltipTrigger>
      <TooltipContent size={size} appearance={appearance}>Insert Tooltip</TooltipContent>
    </Tooltip>
  )
}

function RichBody({ appearance }: { appearance: "light" | "dark" }) {
  const dark = appearance === "dark"
  return (
    <div className="flex items-start gap-2">
      <Globe className={cn("size-4 mt-0.5 shrink-0", dark ? "text-white/80" : "text-icon-sub-600")} />
      <div className="flex-1 space-y-1">
        <div className={cn("font-medium text-sm", dark && "text-white")}>Insert Tooltip</div>
        <p className={cn("text-xs leading-4", dark ? "text-white/70" : "text-text-sub-600")}>
          Insert tooltip description here. It would look much better as three lines of text.
        </p>
      </div>
      <CompactButton variant="ghost" size="sm" aria-label="Close" className={cn(dark && "text-white/70 hover:bg-white/10 hover:text-white")}>
        <X />
      </CompactButton>
    </div>
  )
}

function StockMarketCard({ theme }: { theme: "light" | "dark" }) {
  const dark = theme === "dark"
  const tooltipAppearance: "light" | "dark" = dark ? "light" : "dark"
  return (
    <div className={cn("rounded-2xl border p-4 shadow-sm", dark ? "bg-bg-strong-950 border-bg-strong-950 text-white" : "bg-bg-white-0 border-stroke-soft-200")}>
      <div className="flex items-center gap-2 mb-3">
        <LineChart className={cn("size-4", dark ? "text-white/80" : "text-icon-sub-600")} />
        <div className={cn("text-sm font-medium flex-1", dark && "text-white")}>Stock Market Tracker</div>
        <Button style="stroke" tone="neutral" size="xs" className={cn(dark && "bg-transparent border-white/20 text-white hover:bg-white/10")}>ACME <ChevronDown className="size-3" /></Button>
      </div>
      <SegmentedControl size="sm" defaultValue="1y" className={cn("mb-3", dark && "bg-white/10")}>
        {["1d", "1w", "1m", "3m", "1y"].map((d) => (
          <SegmentedItem key={d} size="sm" value={d} className={cn(dark && "data-[state=on]:bg-bg-strong-950 data-[state=on]:text-white")}>
            {d.toUpperCase()}
          </SegmentedItem>
        ))}
      </SegmentedControl>
      <div className={cn("text-3xl font-semibold tabular-nums", dark && "text-white")}>$440,364.20</div>
      <div className="flex items-center gap-2 mb-2">
        <Badge size="sm" appearance="lighter" status="success"><ArrowUp className="size-3" />0.48%</Badge>
        <div className={cn("text-xs", dark ? "text-white/60" : "text-text-sub-600")}>Acme Tech Inc. (ACME)</div>
      </div>
      <div className="relative h-24">
        <svg viewBox="0 0 320 96" className="w-full h-full">
          <polyline
            fill="none"
            stroke="#7C3AED"
            strokeWidth="1.5"
            points="0,50 15,40 30,60 45,55 60,70 75,40 90,30 105,50 120,35 135,55 150,30 165,40 180,20 195,40 210,30 225,50 240,30 255,45 270,25 285,50 300,40 320,60"
          />
          <line x1="180" y1="0" x2="180" y2="96" stroke={dark ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.15)"} strokeWidth="1" strokeDasharray="2 2" />
          <circle cx="180" cy="20" r="4" fill="#7C3AED" />
        </svg>
        <div className="absolute left-1/2 -translate-x-1/2 top-0">
          <Tooltip open>
            <TooltipTrigger asChild><span className="inline-block size-2" /></TooltipTrigger>
            <TooltipContent size="xs" appearance={tooltipAppearance}>$439,82.21</TooltipContent>
          </Tooltip>
        </div>
      </div>
      <div className={cn("mt-3 flex items-center justify-around rounded-full border px-3 py-1.5 text-xs", dark ? "border-white/10" : "border-stroke-soft-200")}>
        <span><span className={cn(dark ? "text-white/60" : "text-text-sub-600")}>Open</span> <span className={cn("font-medium", dark ? "text-white" : "text-text-strong-950")}>439,59</span></span>
        <span className={cn(dark ? "text-white/30" : "text-text-soft-400")}>•</span>
        <span><span className={cn(dark ? "text-white/60" : "text-text-sub-600")}>High</span> <span className={cn("font-medium", dark ? "text-white" : "text-text-strong-950")}>442,23</span></span>
        <span className={cn(dark ? "text-white/30" : "text-text-soft-400")}>•</span>
        <span><span className={cn(dark ? "text-white/60" : "text-text-sub-600")}>Low</span> <span className={cn("font-medium", dark ? "text-white" : "text-text-strong-950")}>438,21</span></span>
      </div>
    </div>
  )
}

function DonationStatCard({ theme }: { theme: "light" | "dark" }) {
  const dark = theme === "dark"
  const tooltipAppearance: "light" | "dark" = dark ? "light" : "dark"
  return (
    <div className={cn("rounded-2xl border p-4 shadow-sm", dark ? "bg-bg-strong-950 border-bg-strong-950 text-white" : "bg-bg-white-0 border-stroke-soft-200")}>
      <div className="flex items-center gap-2 mb-3">
        <Heart className={cn("size-4", dark ? "text-white/80" : "text-icon-sub-600")} />
        <div className={cn("text-sm font-medium flex-1", dark && "text-white")}>Donation Profile</div>
        <Button style="stroke" tone="neutral" size="xs" className={cn(dark && "bg-transparent border-white/20 text-white hover:bg-white/10")}><Plus className="size-3" />Donate</Button>
      </div>
      <SegmentedControl size="sm" defaultValue="statistic" className={cn("mb-3 w-full", dark && "bg-white/10")}>
        <SegmentedItem size="sm" value="overview" className={cn("flex-1", dark && "data-[state=on]:bg-bg-strong-950 data-[state=on]:text-white")}>Overview</SegmentedItem>
        <SegmentedItem size="sm" value="goal" className={cn("flex-1", dark && "data-[state=on]:bg-bg-strong-950 data-[state=on]:text-white")}>Goal</SegmentedItem>
        <SegmentedItem size="sm" value="statistic" className={cn("flex-1", dark && "data-[state=on]:bg-bg-strong-950 data-[state=on]:text-white")}>Statistic</SegmentedItem>
      </SegmentedControl>
      <div className="grid grid-cols-2 gap-2 mb-3">
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
      <div className="relative h-20">
        <svg viewBox="0 0 280 80" className="w-full h-full">
          <path d="M0 60 Q40 40 80 30 T160 50 T280 65" fill="none" stroke="#3B82F6" strokeWidth="2" />
          <path d="M0 65 Q40 55 80 50 T160 20 T280 60" fill="none" stroke="#F97316" strokeWidth="2" />
          <circle cx="170" cy="32" r="4" fill="#F97316" />
        </svg>
        <div className="absolute" style={{ left: "60%", top: "8%" }}>
          <Tooltip open>
            <TooltipTrigger asChild><span className="inline-block size-2" /></TooltipTrigger>
            <TooltipContent size="xs" appearance={tooltipAppearance}>$1,000.00</TooltipContent>
          </Tooltip>
        </div>
      </div>
    </div>
  )
}

function ExpensesCard({ theme }: { theme: "light" | "dark" }) {
  const dark = theme === "dark"
  const tooltipAppearance: "light" | "dark" = dark ? "light" : "dark"
  return (
    <div className={cn("rounded-2xl border p-4 shadow-sm", dark ? "bg-bg-strong-950 border-bg-strong-950 text-white" : "bg-bg-white-0 border-stroke-soft-200")}>
      <div className="flex items-center gap-2 mb-3">
        <BarChart className={cn("size-4", dark ? "text-white/80" : "text-icon-sub-600")} />
        <div className={cn("text-sm font-medium flex-1", dark && "text-white")}>Major Expenses</div>
        <Button style="stroke" tone="neutral" size="xs" className={cn(dark && "bg-transparent border-white/20 text-white hover:bg-white/10")}>Weekly <ChevronDown className="size-3" /></Button>
      </div>
      <div className="space-y-2">
        {[
          { label: "Housing", value: 95, color: "bg-[#3F6FFF]" },
          { label: "Utilities", value: 60, color: "bg-[#5BC0EB]", showTip: true },
          { label: "Food", value: 25, color: "bg-primary" },
        ].map((b) => (
          <div key={b.label} className="flex items-center gap-2">
            <div className={cn("w-16 text-xs", dark ? "text-white/60" : "text-text-sub-600")}>{b.label}</div>
            <div className="relative flex-1 h-3 rounded-full overflow-visible">
              <div className={`h-full rounded-full ${b.color}`} style={{ width: `${b.value}%` }} />
              {b.showTip ? (
                <div className="absolute top-1/2 -translate-y-1/2" style={{ left: `${b.value}%` }}>
                  <Tooltip open>
                    <TooltipTrigger asChild><span className="inline-block size-2" /></TooltipTrigger>
                    <TooltipContent size="xs" appearance={tooltipAppearance}>$439,82.21</TooltipContent>
                  </Tooltip>
                </div>
              ) : null}
            </div>
          </div>
        ))}
        <div className={cn("flex justify-between text-[10px] pl-[68px]", dark ? "text-white/40" : "text-text-soft-400")}>
          <span>0</span><span>2k</span><span>4k</span><span>6k</span><span>8k</span><span>10k</span>
        </div>
      </div>
    </div>
  )
}

function EmailVerificationCard({ theme }: { theme: "light" | "dark" }) {
  const dark = theme === "dark"
  const tooltipAppearance: "light" | "dark" = dark ? "light" : "dark"
  return (
    <div className={cn("rounded-2xl border p-4 shadow-sm space-y-3", dark ? "bg-bg-strong-950 border-bg-strong-950 text-white" : "bg-bg-white-0 border-stroke-soft-200")}>
      <div className="flex items-start gap-3 pb-3 border-b" style={{ borderColor: dark ? "rgba(255,255,255,0.1)" : undefined }}>
        <span className={cn("inline-flex size-8 items-center justify-center rounded-full", dark ? "bg-white/10" : "bg-bg-weak-50")}>
          <Settings className={cn("size-4", dark ? "text-white/80" : "text-icon-sub-600")} />
        </span>
        <div className="flex-1">
          <div className={cn("text-sm font-medium", dark && "text-white")}>Email Verification</div>
          <div className={cn("text-xs", dark ? "text-white/60" : "text-text-sub-600")}>Enter your email to get a verification code.</div>
        </div>
        <CompactButton variant="ghost" size="sm" aria-label="Close" className={cn(dark && "text-white/70 hover:bg-white/10 hover:text-white")}><X /></CompactButton>
      </div>
      <Field>
        <Label required className="inline-flex items-center gap-1" optional>
          <span className={cn(dark && "text-white")}>Email Address</span>
        </Label>
        <InputRoot className={cn(dark && "bg-bg-strong-950 border-white/10")}>
          <InputIcon><Mail className={cn("size-4", dark && "text-white/40")} /></InputIcon>
          <Input type="email" placeholder="hello@alignui.com" className={cn(dark && "text-white placeholder:text-white/40")} />
          <Tooltip open>
            <TooltipTrigger asChild>
              <button type="button" aria-label="Info" className={cn("inline-flex size-4 items-center justify-center rounded-full", dark ? "bg-white/10 text-white/60" : "bg-bg-weak-50 text-icon-sub-600")}>
                <Info className="size-3" />
              </button>
            </TooltipTrigger>
            <TooltipContent size="sm" appearance={tooltipAppearance} side="top" align="end">
              The email you registered with.
            </TooltipContent>
          </Tooltip>
        </InputRoot>
      </Field>
      <div className={cn("flex items-center justify-end gap-2 pt-2 border-t", dark ? "border-white/10" : "border-stroke-soft-200")}>
        <Button style="stroke" tone="neutral" className={cn(dark && "bg-transparent border-white/20 text-white hover:bg-white/10")}>Cancel</Button>
        <Button>Send Code</Button>
      </div>
    </div>
  )
}
