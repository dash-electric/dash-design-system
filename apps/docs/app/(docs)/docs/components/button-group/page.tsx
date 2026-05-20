"use client"

import * as React from "react"
import {
  RiArrowDownSLine as ChevronDown,
  RiArrowLeftSLine as ChevronLeft,
  RiArrowRightSLine as ChevronRight,
  RiGridLine as Grid,
  RiListUnordered as List,
  RiLayoutGridLine as Gallery,
  RiHeartLine as Heart,
  RiChat3Line as Comment,
  RiShareLine as Share,
  RiBold as Bold,
  RiItalic as Italic,
  RiUnderline as Underline,
  RiExternalLinkLine as External,
  RiLinkM as Link,
  RiMore2Line as MoreV,
  RiLineChartLine as Chart,
  RiCheckboxCircleFill as Check,
  RiWifiLine as Contactless,
} from "@remixicon/react"
import { Button } from "@/registry/dash/ui/button"
import { ButtonGroup } from "@/registry/dash/ui/button-group"
import { Badge } from "@/registry/dash/ui/badge"
import {
  DocsPageShell,
  DocsHeader,
  DocsSection,
  DocsExample,
  DocsPropsTable,
  DocsDoDont,
} from "@/components/docs/page-shell"

/**
 * ButtonGroup — Figma 1:1 (8 nodes verified 2026-05-18).
 *
 *   493:8644       Master spec — quantity 2-6 children, shared corner radius
 *   226:4669       Item spec — bg/text per state (default/hover/active/disabled)
 *   3016:38617     Use cases LIGHT — view toggle, social actions, formatting toolbar, prev/next
 *   3016:38636     same DARK
 *   3027:5619      Stock tracker time-range selector inside card LIGHT
 *   3027:5625      same DARK
 *   3031:2534      Compact prev/next on savings card LIGHT
 *   3031:2536      same DARK
 */

export default function ButtonGroupDocsPage() {
  const [view, setView] = React.useState<"grid" | "list" | "gallery">("grid")
  const [range, setRange] = React.useState<"1D" | "1W" | "1M" | "3M" | "1Y">("1Y")

  return (
    <DocsPageShell>
      <DocsHeader
        status="beta"
        kind="composite"
        category="Components / Actions"
        title="Button Group"
        description="Joined buttons sharing a single visual unit. 1px gray-200 ring container with shared outer corner radius — children have no own radius. Use for segmented toggles (view modes, time ranges), formatting toolbars (bold/italic/underline), or paired prev/next chevrons."
      />

      <DocsSection title="Sizes">
        <p className="text-sm text-text-sub-600 max-w-2xl">
          Three sizes matching Button: <code className="text-xs px-1 py-0.5 rounded bg-bg-weak-50">xs (24px)</code>, <code className="text-xs px-1 py-0.5 rounded bg-bg-weak-50">sm (32px)</code>, <code className="text-xs px-1 py-0.5 rounded bg-bg-weak-50">md (36px)</code>. ButtonGroup forwards size to all Button children.
        </p>
        <DocsExample
          title="md / sm / xs"
          preview={
            <div className="flex flex-col items-start gap-3">
              <ButtonGroup>
                <Button size="md">Button</Button>
                <Button size="md" leftIcon={<ChevronLeft />}>Button</Button>
                <Button size="md" rightIcon={<ChevronRight />}>Button</Button>
              </ButtonGroup>
              <ButtonGroup>
                <Button size="sm">Button</Button>
                <Button size="sm" leftIcon={<ChevronLeft />}>Button</Button>
                <Button size="sm" rightIcon={<ChevronRight />}>Button</Button>
              </ButtonGroup>
              <ButtonGroup>
                <Button size="xs">Button</Button>
                <Button size="xs" leftIcon={<ChevronLeft />}>Button</Button>
                <Button size="xs" rightIcon={<ChevronRight />}>Button</Button>
              </ButtonGroup>
            </div>
          }
          code={`<ButtonGroup size="md">
  <Button>Button</Button>
  <Button leftIcon={<ChevronLeft />}>Button</Button>
  <Button rightIcon={<ChevronRight />}>Button</Button>
</ButtonGroup>`}
        />
      </DocsSection>

      <DocsSection title="View toggle">
        <p className="text-sm text-text-sub-600 max-w-2xl">
          Segmented control for swapping display mode of a list/grid surface. Active button uses neutral lighter via aria-pressed pattern.
        </p>
        <DocsExample
          title="Grid / List / Gallery"
          preview={
            <ButtonGroup>
              {([
                { id: "grid", Icon: Grid, label: "Grid view" },
                { id: "list", Icon: List, label: "List view" },
                { id: "gallery", Icon: Gallery, label: "Gallery view" },
              ] as const).map((v) => (
                <Button
                  key={v.id}
                  tone="neutral"
                  style={view === v.id ? "lighter" : "stroke"}
                  leftIcon={<v.Icon />}
                  onClick={() => setView(v.id)}
                  aria-pressed={view === v.id}
                >
                  {v.label}
                </Button>
              ))}
            </ButtonGroup>
          }
          code={`<ButtonGroup size="sm">
  <Button tone="neutral" style={view === "grid" ? "lighter" : "stroke"} leftIcon={<Grid />}>Grid view</Button>
  <Button tone="neutral" style={view === "list" ? "lighter" : "stroke"} leftIcon={<List />}>List view</Button>
  <Button tone="neutral" style={view === "gallery" ? "lighter" : "stroke"} leftIcon={<Gallery />}>Gallery view</Button>
</ButtonGroup>`}
        />
      </DocsSection>

      <DocsSection title="Social actions">
        <p className="text-sm text-text-sub-600 max-w-2xl">
          Like / Comment / Share row. Buttons are independent triggers (not mutually exclusive) — share the visual unit only.
        </p>
        <DocsExample
          title="Like, Comment, Share"
          preview={
            <ButtonGroup>
              <Button size="sm" tone="neutral" style="stroke" leftIcon={<Heart />}>Like</Button>
              <Button size="sm" tone="neutral" style="stroke" leftIcon={<Comment />}>Comment</Button>
              <Button size="sm" tone="neutral" style="stroke" leftIcon={<Share />}>Share</Button>
            </ButtonGroup>
          }
          code={`<ButtonGroup size="sm">
  <Button tone="neutral" style="stroke" leftIcon={<Heart />}>Like</Button>
  <Button tone="neutral" style="stroke" leftIcon={<Comment />}>Comment</Button>
  <Button tone="neutral" style="stroke" leftIcon={<Share />}>Share</Button>
</ButtonGroup>`}
        />
      </DocsSection>

      <DocsSection title="Formatting toolbar">
        <p className="text-sm text-text-sub-600 max-w-2xl">
          Font dropdown + B/I/U toggles. Mix text+chevron Button with icon-only siblings in the same group.
        </p>
        <DocsExample
          title="Font + Bold/Italic/Underline"
          preview={
            <ButtonGroup>
              <Button size="sm" tone="neutral" style="stroke" rightIcon={<ChevronDown />}>Inter Variable</Button>
              <Button size="icon-sm" tone="neutral" style="stroke" aria-label="Bold"><Bold /></Button>
              <Button size="icon-sm" tone="neutral" style="stroke" aria-label="Italic"><Italic /></Button>
              <Button size="icon-sm" tone="neutral" style="stroke" aria-label="Underline"><Underline /></Button>
            </ButtonGroup>
          }
          code={`<ButtonGroup size="sm">
  <Button tone="neutral" style="stroke" rightIcon={<ChevronDown />}>Inter Variable</Button>
  <Button size="icon-sm" tone="neutral" style="stroke" aria-label="Bold"><Bold /></Button>
  <Button size="icon-sm" tone="neutral" style="stroke" aria-label="Italic"><Italic /></Button>
  <Button size="icon-sm" tone="neutral" style="stroke" aria-label="Underline"><Underline /></Button>
</ButtonGroup>`}
        />
      </DocsSection>

      <DocsSection title="Icon-only utility cluster">
        <p className="text-sm text-text-sub-600 max-w-2xl">
          Share / Link / Overflow trio. Pure icon buttons sharing the group ring.
        </p>
        <DocsExample
          title="External, Link, More"
          preview={
            <ButtonGroup>
              <Button size="icon-sm" tone="neutral" style="stroke" aria-label="Open"><External /></Button>
              <Button size="icon-sm" tone="neutral" style="stroke" aria-label="Copy link"><Link /></Button>
              <Button size="icon-sm" tone="neutral" style="stroke" aria-label="More"><MoreV /></Button>
            </ButtonGroup>
          }
          code={`<ButtonGroup size="sm">
  <Button size="icon-sm" tone="neutral" style="stroke" aria-label="Open"><External /></Button>
  <Button size="icon-sm" tone="neutral" style="stroke" aria-label="Copy link"><Link /></Button>
  <Button size="icon-sm" tone="neutral" style="stroke" aria-label="More"><MoreV /></Button>
</ButtonGroup>`}
        />
      </DocsSection>

      <DocsSection title="Prev/Next compact">
        <p className="text-sm text-text-sub-600 max-w-2xl">
          Two-chevron pagination cluster. Smallest common pattern.
        </p>
        <DocsExample
          title="xs prev + next"
          preview={
            <ButtonGroup>
              <Button size="icon-xs" tone="neutral" style="stroke" aria-label="Previous"><ChevronLeft /></Button>
              <Button size="icon-xs" tone="neutral" style="stroke" aria-label="Next"><ChevronRight /></Button>
            </ButtonGroup>
          }
          code={`<ButtonGroup size="xs">
  <Button size="icon-xs" tone="neutral" style="stroke" aria-label="Previous"><ChevronLeft /></Button>
  <Button size="icon-xs" tone="neutral" style="stroke" aria-label="Next"><ChevronRight /></Button>
</ButtonGroup>`}
        />
      </DocsSection>

      <DocsSection title="Stock tracker time range">
        <p className="text-sm text-text-sub-600 max-w-2xl">
          1D / 1W / 1M / 3M / 1Y selector inside a card. Active range uses neutral lighter; rest are ghost.
        </p>
        <DocsExample
          title="Inside a Stock Market Tracker card"
          preview={
            <div className="max-w-md rounded-2xl border border-stroke-soft-200 bg-bg-white-0 p-5 shadow-(--shadow-custom-sm)">
              <div className="flex items-center justify-between mb-4">
                <div className="inline-flex items-center gap-2">
                  <Chart className="size-4 text-icon-soft-400" />
                  <span className="text-sm font-medium text-text-strong-950">Stock Market Tracker</span>
                </div>
                <Button size="sm" tone="neutral" style="stroke" rightIcon={<ChevronDown />}>ACME</Button>
              </div>
              <ButtonGroup>
                {(["1D","1W","1M","3M","1Y"] as const).map((r) => (
                  <Button
                    key={r}
                    tone="neutral"
                    style={range === r ? "lighter" : "ghost"}
                    onClick={() => setRange(r)}
                    aria-pressed={range === r}
                  >
                    {r}
                  </Button>
                ))}
              </ButtonGroup>
              <div className="mt-4">
                <div className="text-2xl font-semibold text-text-strong-950 inline-flex items-center gap-2">
                  $440,364.20
                  <Badge status="success" appearance="lighter" type="left-icon" icon={<span>↗</span>}>0.48%</Badge>
                </div>
                <div className="text-xs text-text-soft-400 mt-1">Acme Tech Inc. (ACME)</div>
                <div className="mt-4 h-28 rounded-md bg-bg-weak-50" aria-label="Sparkline placeholder" />
                <div className="flex items-center justify-center gap-4 mt-3 text-xs text-text-sub-600">
                  <span>Open <strong className="text-text-strong-950">439,59</strong></span>
                  <span aria-hidden className="text-text-soft-400">·</span>
                  <span>High <strong className="text-text-strong-950">442,23</strong></span>
                  <span aria-hidden className="text-text-soft-400">·</span>
                  <span>Low <strong className="text-text-strong-950">438,21</strong></span>
                </div>
              </div>
            </div>
          }
          code={`<ButtonGroup size="xs">
  {ranges.map(r => (
    <Button tone="neutral"
      style={selected === r ? "lighter" : "ghost"}
      onClick={() => setRange(r)}>{r}</Button>
  ))}
</ButtonGroup>`}
        />
      </DocsSection>

      <DocsSection title="Savings card prev/next">
        <p className="text-sm text-text-sub-600 max-w-2xl">
          Compact chevron pair inside a payment card. Fits the smallest layouts without disrupting flow.
        </p>
        <DocsExample
          title="Savings Card with carousel control"
          preview={
            <div className="max-w-md rounded-2xl border border-stroke-soft-200 bg-bg-white-0 p-5 shadow-(--shadow-custom-md) relative overflow-hidden">
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
              <div className="absolute bottom-5 right-5">
                <ButtonGroup>
                  <Button size="icon-xs" tone="neutral" style="stroke" aria-label="Previous"><ChevronLeft /></Button>
                  <Button size="icon-xs" tone="neutral" style="stroke" aria-label="Next"><ChevronRight /></Button>
                </ButtonGroup>
              </div>
            </div>
          }
          code={`<ButtonGroup size="xs">
  <Button size="icon-xs" tone="neutral" style="stroke" aria-label="Previous"><ChevronLeft /></Button>
  <Button size="icon-xs" tone="neutral" style="stroke" aria-label="Next"><ChevronRight /></Button>
</ButtonGroup>`}
        />
      </DocsSection>

      <DocsSection title="Do this, not that">
        <p className="text-base text-text-sub-600 leading-relaxed max-w-2xl">
          ButtonGroup = visual cluster, bukan radio behavior. Untuk view switcher mutually-exclusive, set <code className="text-xs px-1 py-0.5 rounded bg-bg-weak-50">aria-pressed</code> + active style. Untuk related-but-independent actions, biarkan semua sama.
        </p>
        <DocsDoDont
          do={{
            preview: (
              <ButtonGroup>
                <Button size="sm" tone="neutral" style="lighter" leftIcon={<Grid />} aria-pressed>Grid</Button>
                <Button size="sm" tone="neutral" style="stroke" leftIcon={<List />}>List</Button>
                <Button size="sm" tone="neutral" style="stroke" leftIcon={<Gallery />}>Gallery</Button>
              </ButtonGroup>
            ),
            caption: "View toggle mutually-exclusive: 1 lighter (active) + sisanya stroke. aria-pressed = screen reader announce 'Grid, selected'.",
          }}
          dont={{
            preview: (
              <ButtonGroup>
                <Button size="sm" tone="primary" leftIcon={<Grid />}>Grid</Button>
                <Button size="sm" tone="primary" leftIcon={<List />}>List</Button>
                <Button size="sm" tone="primary" leftIcon={<Gallery />}>Gallery</Button>
              </ButtonGroup>
            ),
            caption: "Semua primary filled = user kira tiga aksi simultan. Tidak ada signal mana yang sedang aktif. Untuk view switcher, pakai stroke + 1 lighter.",
          }}
        />
        <DocsDoDont
          do={{
            preview: (
              <ButtonGroup>
                <Button size="sm" tone="neutral" style="stroke" leftIcon={<ChevronLeft />} aria-label="Halaman sebelumnya" />
                <Button size="sm" tone="neutral" style="stroke" leftIcon={<ChevronRight />} aria-label="Halaman berikutnya" />
              </ButtonGroup>
            ),
            caption: "Prev/Next cluster di table pagination atau carousel. Dua icon button join radius — visual unit kecil tapi clear.",
          }}
          dont={{
            preview: (
              <ButtonGroup>
                <Button size="sm" tone="primary">Buat delivery</Button>
                <Button size="sm" tone="destructive">Suspend mitra</Button>
              </ButtonGroup>
            ),
            caption: "Jangan join aksi yang beda tone/severity. Buat delivery + Suspend mitra adalah 2 task berbeda — pisah dengan jarak normal, jangan dalam ring yang sama.",
          }}
        />
      </DocsSection>

      <DocsSection title="API">
        <DocsPropsTable
          rows={[
            { name: "size", type: '"xs" | "sm" | "md"', defaultValue: '"md"', description: "Forwards to all Button children. Height matches Button at the same size." },
            { name: "children", type: "ReactNode", description: "Pass 2-6 Button (or IconButton-style) children. Individual radius stripped — outer corners from the group container." },
            { name: "orientation", type: '"horizontal" | "vertical"', defaultValue: '"horizontal"', description: "Stack direction. Vertical flips radius." },
          ]}
        />
      </DocsSection>
    </DocsPageShell>
  )
}
