"use client"

import * as React from "react"
import { addDays, format, nextMonday, nextThursday } from "date-fns"
import {
  RiSunLine as Sun,
  RiCalendarLine as Cal,
  RiCalendar2Line as Cal2,
  RiForbidLine as Forbid,
  RiTimeLine as ClockIcon,
  RiCloseLine as Close,
} from "@remixicon/react"
import * as PopoverPrimitive from "@radix-ui/react-popover"
import { Calendar } from "@/registry/dash/ui/calendar"
import { DatePicker, DateRangePicker, DatePickerTrigger } from "@/registry/dash/ui/date-picker"
import { Button } from "@/registry/dash/ui/button"
import {
  DocsPageShell,
  DocsHeader,
  DocsSection,
  DocsExample,
  DocsPropsTable,
} from "@/components/docs/page-shell"

/**
 * Date Picker — Figma 1:1 (10 nodes verified 2026-05-18).
 *
 *   3118:24556   Day cell states (default/today/range-start/end/in-range/today-marker)
 *   437:175      Cell state matrix (hover/focus/selected)
 *   443:336      Today chip 3 states (light/hover/selected)
 *   442:192      Cell variants — with dot indicator
 *   446:7414     Calendar month spec
 *   3129:3915    Single picker popover light
 *   3129:3926    same dark
 *   167124:16024 Quick presets + calendar combo (Tomorrow/Later this week/Next week/No date)
 *   167124:16105 same alt
 *   167124:16199 same dark
 */

const NowChip = ({ label = "Today" }: { label?: string }) => (
  <span className="inline-flex items-center gap-1.5 h-7 px-2.5 rounded-md text-sm text-text-strong-950">
    {label}
  </span>
)

export default function DatePickerDocsPage() {
  const [date, setDate] = React.useState<Date | undefined>(new Date())
  const [range, setRange] = React.useState<{ from: Date | undefined; to?: Date }>({
    from: new Date(),
    to: addDays(new Date(), 6),
  })
  const [quick, setQuick] = React.useState<Date | null>(null)
  const [quickOpen, setQuickOpen] = React.useState(false)
  const tomorrow = addDays(new Date(), 1)

  return (
    <DocsPageShell>
      <DocsHeader
        category="Components / Forms"
        title="Date Picker"
        description="Calendar-driven date selection. Three primitives: Calendar (the grid), DatePicker (single date via Popover), DateRangePicker (from/to). All sized to match Input + Select. Cells support today-dot, range edges, and disabled out-of-month."
      />

      <DocsSection title="Day cell states">
        <p className="text-sm text-text-sub-600 max-w-2xl">
          Cells render at 36×36 with 8px radius. States: default text-strong-950, hover bg-weak-50, today text-primary, selected bg-primary text-static-white, dot indicator below day number, disabled text-soft-400.
        </p>
        <DocsExample
          title="State matrix"
          preview={
            <div className="grid grid-cols-5 gap-3 max-w-sm">
              {(["default","hover","selected","today","disabled"] as const).map((s) => (
                <div key={s} className="flex flex-col items-center gap-2">
                  <span className={[
                    "size-9 rounded-lg inline-flex items-center justify-center text-sm",
                    s === "default" ? "text-text-strong-950" : "",
                    s === "hover" ? "bg-bg-weak-50 text-text-strong-950" : "",
                    s === "selected" ? "bg-primary text-static-white" : "",
                    s === "today" ? "text-primary" : "",
                    s === "disabled" ? "text-text-soft-400" : "",
                  ].join(" ")}>1</span>
                  <span className="text-[10px] text-text-soft-400">{s}</span>
                </div>
              ))}
              {/* Dot indicator row */}
              <div className="flex flex-col items-center gap-2">
                <span className="size-9 rounded-lg inline-flex flex-col items-center justify-center text-text-strong-950 text-sm">
                  <span>1</span>
                  <span className="size-1 rounded-full bg-primary mt-0.5" />
                </span>
                <span className="text-[10px] text-text-soft-400">w/ dot</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <span className="size-9 rounded-lg inline-flex flex-col items-center justify-center bg-primary text-static-white text-sm">
                  <span>1</span>
                  <span className="size-1 rounded-full bg-static-white mt-0.5" />
                </span>
                <span className="text-[10px] text-text-soft-400">selected dot</span>
              </div>
            </div>
          }
          code={`<button className="size-9 rounded-lg bg-primary text-static-white">1</button>
<span className="size-9 rounded-lg text-primary">1</span> {/* today */}`}
        />
      </DocsSection>

      <DocsSection title="Today chip">
        <p className="text-sm text-text-sub-600 max-w-2xl">
          Shortcut chip rendered alongside the calendar header. 3 states: default (text-only) / hover (weak-50 bg) / selected (border).
        </p>
        <DocsExample
          title='"Today" 3 states'
          preview={
            <div className="flex items-center gap-3">
              <NowChip />
              <span className="inline-flex items-center h-7 px-2.5 rounded-md text-sm text-text-strong-950 bg-bg-weak-50">Today</span>
              <span className="inline-flex items-center h-7 px-2.5 rounded-md text-sm text-text-strong-950 border border-stroke-strong-950">Today</span>
            </div>
          }
          code={`<button>Today</button>
<button className="bg-bg-weak-50">Today</button>
<button className="border border-stroke-strong-950">Today</button>`}
        />
      </DocsSection>

      <DocsSection title="Inline calendar">
        <p className="text-sm text-text-sub-600 max-w-2xl">
          Renders the month grid without a Popover. Use when the calendar is the primary surface (e.g. booking flows, full-page schedulers).
        </p>
        <DocsExample
          title="Single-day selection"
          preview={
            <div className="rounded-xl border border-stroke-soft-200 bg-bg-white-0 p-3 inline-block shadow-(--shadow-custom-sm)">
              <Calendar mode="single" selected={date} onSelect={setDate} />
            </div>
          }
          code={`<Calendar mode="single" selected={date} onSelect={setDate} />`}
        />
      </DocsSection>

      <DocsSection title="DatePicker — single">
        <p className="text-sm text-text-sub-600 max-w-2xl">
          Trigger button matches Input/Select sizing. Click opens a Popover with the Calendar. Trigger reflects the selected value via date-fns format string.
        </p>
        <DocsExample
          title="3 sizes"
          preview={
            <div className="flex flex-col gap-3 max-w-xs">
              {(["sm","md","lg"] as const).map((s) => (
                <DatePicker key={s} size={s} value={date} onValueChange={setDate} />
              ))}
            </div>
          }
          code={`<DatePicker size="sm" value={date} onValueChange={setDate} />
<DatePicker size="md" value={date} onValueChange={setDate} />
<DatePicker size="lg" value={date} onValueChange={setDate} />`}
        />
      </DocsSection>

      <DocsSection title="Date range">
        <p className="text-sm text-text-sub-600 max-w-2xl">
          Two-month picker. Range edges get bg-primary; in-range days get a translucent primary-alpha-10 connector.
        </p>
        <DocsExample
          title="from – to"
          preview={
            <div className="max-w-xs">
              <DateRangePicker value={range as { from: Date | undefined; to?: Date }} onValueChange={(v) => setRange(v ?? { from: undefined })} />
            </div>
          }
          code={`<DateRangePicker value={range} onValueChange={setRange} />`}
        />
      </DocsSection>

      <DocsSection title="Quick presets + calendar">
        <p className="text-sm text-text-sub-600 max-w-2xl">
          Compose preset shortcuts (Tomorrow / Later this week / Next week / No date) above the calendar. Click a preset to commit the date and close; or use the grid for custom selection.
        </p>
        <DocsExample
          title="Schedule-due popover"
          preview={
            <div className="max-w-sm">
              <PopoverPrimitive.Root open={quickOpen} onOpenChange={setQuickOpen}>
                <PopoverPrimitive.Trigger asChild>
                  <DatePickerTrigger
                    placeholder="22 October, 03:00 PM"
                    value={quick ? format(quick, "d MMMM, p") : ""}
                    active={quickOpen}
                  />
                </PopoverPrimitive.Trigger>
                <PopoverPrimitive.Portal>
                  <PopoverPrimitive.Content
                    align="start"
                    sideOffset={6}
                    className="z-50 rounded-[20px] border border-stroke-soft-200 bg-bg-white-0 p-0 overflow-hidden shadow-(--shadow-custom-md) w-[340px]"
                  >
                    <header className="flex items-center justify-between gap-2 px-3 py-2 border-b border-stroke-soft-200">
                      <div className="inline-flex items-center gap-2 text-sm font-medium text-text-strong-950">
                        <ClockIcon className="size-4 text-icon-soft-400" />
                        22 October, 03:00 PM
                      </div>
                      <button aria-label="Close" className="size-5 text-icon-soft-400 hover:text-text-strong-950" onClick={() => setQuickOpen(false)}><Close className="size-4" /></button>
                    </header>
                    <div className="py-1.5">
                      {[
                        { Icon: Sun,    label: "Tomorrow",        sub: "Today",                                    value: tomorrow,             tone: "text-(--state-warning-base)" },
                        { Icon: Cal,    label: "Later this week", sub: "Thursday",                                  value: nextThursday(new Date()), tone: "text-(--state-success-base)" },
                        { Icon: Cal2,   label: "Next week",       sub: format(nextMonday(new Date()), "EEE, d MMMM"), value: nextMonday(new Date()), tone: "text-(--state-information-base)" },
                        { Icon: Forbid, label: "No date",         sub: "Thursday",                                  value: null,                  tone: "text-(--state-error-base)" },
                      ].map((p, i) => {
                        const PIcon = p.Icon
                        return (
                          <button
                            key={i}
                            type="button"
                            onClick={() => {
                              setQuick(p.value as Date | null)
                              setQuickOpen(false)
                            }}
                            className="flex items-center gap-3 w-full px-3 py-2 hover:bg-bg-weak-50 text-left"
                          >
                            <PIcon className={["size-4 shrink-0", p.tone].join(" ")} />
                            <span className="flex-1 text-sm text-text-strong-950">{p.label}</span>
                            <span className="text-xs text-text-soft-400">{p.sub}</span>
                          </button>
                        )
                      })}
                    </div>
                    <div className="border-t border-stroke-soft-200">
                      <Calendar mode="single" selected={quick ?? undefined} onSelect={(d) => { setQuick(d ?? null); setQuickOpen(false) }} />
                    </div>
                    <div className="grid grid-cols-2 gap-2 p-3 border-t border-stroke-soft-200">
                      <Button tone="neutral" style="stroke" onClick={() => setQuickOpen(false)}>Cancel</Button>
                      <Button tone="primary" onClick={() => setQuickOpen(false)}>Apply</Button>
                    </div>
                  </PopoverPrimitive.Content>
                </PopoverPrimitive.Portal>
              </PopoverPrimitive.Root>
            </div>
          }
          code={`<Popover>
  <PopoverTrigger asChild>
    <DatePickerTrigger value={display} />
  </PopoverTrigger>
  <PopoverContent>
    <Presets onSelect={setDate} />  {/* Tomorrow / Later this week / Next week / No date */}
    <Calendar mode="single" selected={date} onSelect={setDate} />
    <Footer cancel + apply />
  </PopoverContent>
</Popover>`}
        />
      </DocsSection>

      <DocsSection title="API">
        <DocsPropsTable
          rows={[
            { name: "DatePicker.value", type: "Date | undefined", description: "Selected date (controlled)." },
            { name: "DatePicker.onValueChange", type: "(date?: Date) => void", description: "Fires when a day is clicked." },
            { name: "DatePicker.placeholder", type: "string", defaultValue: '"Pick a date"', description: "Empty-state text on the trigger." },
            { name: "DatePicker.size", type: '"sm" | "md" | "lg"', defaultValue: '"lg"', description: "Trigger height. Matches Input/Select sizing." },
            { name: "DatePicker.format", type: "string", defaultValue: '"PPP"', description: "date-fns format string for the trigger label." },
            { name: "DateRangePicker.value", type: "{ from?: Date; to?: Date }", description: "Selected range (controlled)." },
            { name: "DateRangePicker.numberOfMonths", type: "number", defaultValue: "2", description: "Months visible side-by-side in the popover." },
            { name: "Calendar.mode", type: '"single" | "range" | "multiple"', description: "Selection behavior — single date / from-to range / multiple dates." },
            { name: "Calendar.selected", type: "Date | DateRange | Date[]", description: "Controlled selection." },
            { name: "Calendar.onSelect", type: "(value) => void", description: "Fires per click." },
          ]}
        />
      </DocsSection>
    </DocsPageShell>
  )
}
