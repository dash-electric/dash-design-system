"use client"

import * as React from "react"
import { RiMoreFill as More, RiArrowRightSLine as ChevronRight } from "@remixicon/react"
import { WidgetShell } from "@/registry/dash/ui/widget-shell"
import { Button } from "@/registry/dash/ui/button"
import { Badge } from "@/registry/dash/ui/badge"
import {
  DocsPageShell,
  DocsHeader,
  DocsSection,
  DocsExample,
  DocsPropsTable,
  DocsDoDont,
} from "@/components/docs/page-shell"
import { DocsCode } from "@/components/docs/code-block"

export default function WidgetShellDocsPage() {
  return (
    <DocsPageShell>
      <DocsHeader
        status="shipped"
        kind="atom"
        category="Components / Layout"
        title="Widget Shell"
        description="Layer-1 dashboard primitive that frames every widget across HR, Finance, Marketing dashboards. Rounded card container with title + optional header controls + body + optional 'See all' footer. Hover lift + accent ring tinted by the active Layer-2 theme. The base of all 70+ widget compositions."
      />

      <DocsSection title="Install">
        <DocsCode language="bash" code={`dash add widget-shell`} />
      </DocsSection>

      <DocsSection title="Anatomy">
        <p className="text-base text-text-sub-600 leading-relaxed max-w-2xl">
          Three slot regions stacked vertically inside a rounded-2xl card. <strong>Header</strong> = title + headerExtra controls. <strong>Body</strong> = children (widget-specific content). <strong>Footer</strong> = optional &quot;See all&quot; link aligned right.
        </p>
        <div className="rounded-xl border border-stroke-soft-200 bg-bg-weak-50 p-10 flex items-center justify-center">
          <div className="w-full max-w-md">
            <WidgetShell
              title="Title slot"
              headerExtra={
                <Button size="xs" tone="neutral" style="ghost" aria-label="More">
                  <More />
                </Button>
              }
              seeAll
            >
              <div className="rounded-lg border border-dashed border-stroke-soft-200 bg-bg-white-0 p-4 text-center text-xs text-text-soft-400">
                Body slot — widget-specific content lives here
              </div>
            </WidgetShell>
          </div>
        </div>
      </DocsSection>

      <DocsSection title="Examples">
        <DocsExample
          title="Minimal — title + body"
          description="The smallest useful composition. No header controls, no footer link."
          preview={
            <div className="max-w-sm">
              <WidgetShell title="Total Balance">
                <div className="text-2xl font-semibold text-text-strong-950 tabular-nums">Rp 12.450.000</div>
                <div className="text-xs text-success-base">+ 4,2% bulan ini</div>
              </WidgetShell>
            </div>
          }
          code={`<WidgetShell title="Total Balance">
  <div className="text-2xl font-semibold">Rp 12.450.000</div>
  <div className="text-xs text-success-base">+ 4,2% bulan ini</div>
</WidgetShell>`}
        />

        <DocsExample
          title="With header controls"
          description="Use headerExtra for filters, dropdowns, or context-action icons (more, refresh, expand)."
          preview={
            <div className="max-w-md">
              <WidgetShell
                title="Recent Transactions"
                headerExtra={
                  <>
                    <Badge appearance="lighter" size="sm">Hari ini</Badge>
                    <Button size="xs" tone="neutral" style="ghost" aria-label="More options">
                      <More />
                    </Button>
                  </>
                }
              >
                <div className="space-y-2">
                  {[
                    { name: "Tokopedia", amt: "-Rp 142.000", t: "10:24" },
                    { name: "Gopay top-up", amt: "+Rp 500.000", t: "08:11" },
                    { name: "Shell Pertamax", amt: "-Rp 200.000", t: "07:33" },
                  ].map((tx) => (
                    <div key={tx.name} className="flex items-center justify-between text-sm">
                      <div>
                        <div className="font-medium text-text-strong-950">{tx.name}</div>
                        <div className="text-[10px] text-text-soft-400">{tx.t}</div>
                      </div>
                      <div className={tx.amt.startsWith("+") ? "text-success-base tabular-nums" : "text-text-strong-950 tabular-nums"}>{tx.amt}</div>
                    </div>
                  ))}
                </div>
              </WidgetShell>
            </div>
          }
          code={`<WidgetShell
  title="Recent Transactions"
  headerExtra={
    <>
      <Badge variant="lighter" size="xs">Hari ini</Badge>
      <Button size="xs" style="ghost"><More /></Button>
    </>
  }
>
  {transactions.map((tx) => <Row tx={tx} />)}
</WidgetShell>`}
        />

        <DocsExample
          title="With See all footer"
          description="Adds a right-aligned 'See all' anchor at the bottom of the card — boolean for default label, string for custom."
          preview={
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <WidgetShell title="Schedule" seeAll>
                <div className="text-xs text-text-sub-600">3 meetings today</div>
              </WidgetShell>
              <WidgetShell title="Time Off" seeAll="See requests">
                <div className="text-xs text-text-sub-600">2 pending requests</div>
              </WidgetShell>
            </div>
          }
          code={`<WidgetShell title="Schedule" seeAll>
  …
</WidgetShell>

<WidgetShell title="Time Off" seeAll="See requests">
  …
</WidgetShell>`}
        />

        <DocsExample
          title="Custom title node — headerNoTitle"
          description="When you need a complex title (icon + label + counter), set headerNoTitle so WidgetShell skips its default semibold-sm wrapper and renders your node verbatim."
          preview={
            <div className="max-w-md">
              <WidgetShell
                headerNoTitle
                title={
                  <div className="flex items-center gap-2">
                    <span className="inline-flex size-6 items-center justify-center rounded-md bg-(--primary-alpha-10) text-(--primary-base) text-xs font-semibold">12</span>
                    <span className="text-sm font-semibold text-text-strong-950">Notifikasi baru</span>
                  </div>
                }
                seeAll
              >
                <div className="text-xs text-text-sub-600">3 mention · 5 follow-up · 4 system</div>
              </WidgetShell>
            </div>
          }
          code={`<WidgetShell
  headerNoTitle
  title={
    <div className="flex items-center gap-2">
      <span className="badge">12</span>
      <span>Notifikasi baru</span>
    </div>
  }
  seeAll
>
  …
</WidgetShell>`}
        />

        <DocsExample
          title="Grid of widgets — full dashboard row"
          description="WidgetShell is designed for grid layouts. Hover lift + accent ring give per-widget affordance without per-widget styling."
          preview={
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <WidgetShell title="Active Drivers">
                <div className="text-2xl font-semibold text-text-strong-950 tabular-nums">1,284</div>
                <div className="text-[11px] text-text-soft-400">+ 32 hari ini</div>
              </WidgetShell>
              <WidgetShell title="Open Tickets">
                <div className="text-2xl font-semibold text-text-strong-950 tabular-nums">47</div>
                <div className="text-[11px] text-error-base">12 overdue</div>
              </WidgetShell>
              <WidgetShell title="Revenue Today">
                <div className="text-2xl font-semibold text-text-strong-950 tabular-nums">Rp 184M</div>
                <div className="text-[11px] text-success-base">+ 8,3% vs kemarin</div>
              </WidgetShell>
            </div>
          }
          code={`<div className="grid grid-cols-3 gap-3">
  <WidgetShell title="Active Drivers">…</WidgetShell>
  <WidgetShell title="Open Tickets">…</WidgetShell>
  <WidgetShell title="Revenue Today">…</WidgetShell>
</div>`}
        />
      </DocsSection>

      <DocsSection title="Don't">
        <DocsDoDont
          do={{
            preview: (
              <div className="max-w-sm">
                <WidgetShell title="Active Drivers" seeAll>
                  <div className="text-2xl font-semibold text-text-strong-950">1,284</div>
                  <div className="text-[11px] text-success-base">+ 32 hari ini</div>
                </WidgetShell>
              </div>
            ),
            caption: "Tight single-purpose widget — one metric, one trend, one optional drill-in. Reads fast in a dashboard scan.",
          }}
          dont={{
            preview: (
              <div className="max-w-sm">
                <WidgetShell title="Everything Dashboard">
                  <div className="space-y-2">
                    <div className="text-xl font-semibold text-text-strong-950">1,284 drivers</div>
                    <div className="text-xs">47 tickets · Rp 184M revenue · 12 overdue · 32 new · 8 incidents</div>
                    <div className="grid grid-cols-2 gap-2 text-[10px] text-text-sub-600">
                      <span>+ 4% MTD</span><span>- 2% WoW</span><span>+ 8% DoD</span><span>89% SLA</span>
                    </div>
                    <Button size="xs">A</Button>
                    <Button size="xs">B</Button>
                    <Button size="xs">C</Button>
                  </div>
                </WidgetShell>
              </div>
            ),
            caption: "Don't cram multiple metrics + actions into one shell. Split into separate widgets — that's literally what the grid is for.",
          }}
        />
      </DocsSection>

      <DocsSection title="API" id="api">
        <DocsPropsTable
          rows={[
            { name: "title", type: "ReactNode", description: "Header title. Rendered as semibold-sm by default; pass headerNoTitle to render verbatim." },
            { name: "seeAll", type: "boolean | string", description: "Footer 'See all' link. true = default 'See All' label · string = custom label." },
            { name: "headerExtra", type: "ReactNode", description: "Right-aligned header controls (filters, dropdowns, icon buttons). Floats to the end via ml-auto." },
            { name: "headerNoTitle", type: "boolean", defaultValue: "false", description: "Skip the auto-rendered title wrapper. Use when title is a complex custom node." },
            { name: "children", type: "ReactNode", description: "Body content. The widget-specific composition. Required." },
            { name: "className", type: "string", description: "Extra classes merged onto the root card. Useful for overriding padding or height." },
          ]}
        />
      </DocsSection>

      <DocsSection title="Accessibility">
        <ul className="space-y-3 text-base text-text-sub-600 leading-relaxed">
          <li><strong className="text-text-strong-950">Semantic role</strong> — the shell is a presentational <code className="text-xs">{`<div>`}</code>; if the widget represents a region (e.g. Recent Transactions), wrap children in <code className="text-xs">{`<section aria-labelledby>`}</code> with the title as the label source.</li>
          <li><strong className="text-text-strong-950">Header controls</strong> — icon-only buttons in <code className="text-xs">headerExtra</code> require <code className="text-xs">aria-label</code> (More, Filter, Refresh).</li>
          <li><strong className="text-text-strong-950">See all link</strong> — the footer anchor inherits page focus + hover styles. Pass an <code className="text-xs">href</code> via consumer wrapping if you need real navigation (current implementation uses <code className="text-xs">#</code> placeholder).</li>
          <li><strong className="text-text-strong-950">Hover ring</strong> — uses <code className="text-xs">--primary-alpha-16</code> from the active Layer-2 theme. WCAG AA contrast against the border color.</li>
          <li><strong className="text-text-strong-950">Keyboard navigation</strong> — focusable elements inside the widget retain default Tab order. The shell itself is not focusable.</li>
        </ul>
      </DocsSection>

      <DocsSection title="Theming">
        <ul className="space-y-2 text-sm text-text-strong-950/90">
          <li>• <strong>Border</strong> — <code className="text-xs">stroke-soft-200</code> idle → <code className="text-xs">stroke-strong-950</code> on hover.</li>
          <li>• <strong>Surface</strong> — <code className="text-xs">bg-bg-white-0</code> idle → <code className="text-xs">shadow-card-sm</code> hover lift.</li>
          <li>• <strong>Accent ring</strong> — <code className="text-xs">--primary-alpha-16</code> tinted by active Layer-2 theme (ride / logistic / travel / marketplace / trellis-*).</li>
          <li>• <strong>Radius</strong> — <code className="text-xs">rounded-2xl</code> shared across all dashboard widgets.</li>
          <li>• <strong>Padding</strong> — <code className="text-xs">p-6</code> default; override via <code className="text-xs">className</code> for dense widget grids.</li>
        </ul>
      </DocsSection>
    </DocsPageShell>
  )
}
