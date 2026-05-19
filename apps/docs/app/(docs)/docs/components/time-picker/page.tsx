"use client"

import * as React from "react"
import {
  RiTimeLine as Clock,
  RiCloseLine as X,
  RiCheckLine as Check,
  RiArrowDownSLine as ChevronDown,
  RiAddLine as Plus,
  RiBankLine as Bank,
  RiNotification3Line as Bell,
  RiInformationLine as Info,
} from "@remixicon/react"
import {
  TimePicker,
  TimePickerSlot,
  TimePickerStatus,
  type TimePickerStatusKind,
} from "@/registry/dash/ui/time-picker"
import { Label } from "@/registry/dash/ui/label"
import { Field } from "@/registry/dash/ui/field"
import { Button } from "@/registry/dash/ui/button"
import { LinkButton } from "@/registry/dash/ui/link-button"
import { CompactButton } from "@/registry/dash/ui/compact-button"
import { Hint } from "@/registry/dash/ui/hint"
import { ScrollArea } from "@/registry/dash/ui/scroll-area"
import { cn } from "@/registry/dash/lib/utils"
import {
  DocsPageShell,
  DocsHeader,
  DocsSection,
  DocsExample,
  DocsPropsTable,
} from "@/components/docs/page-shell"
import { DocsCode } from "@/components/docs/code-block"

/**
 * Time Picker — Figma 1:1 (9 nodes verified 2026-05-18).
 *
 *   165483:5687    Time Picker Items — slot rows (single + dual-time × 4 states)
 *   165483:6046    Duration chips — preset duration chips (default/hover/selected/disabled)
 *   165596:41348   Time Picker Status — status badges (4 kinds × 4 states)
 *   165641:19379   Pick-time popover (light surface)
 *   165690:12492   Pick-time popover (dark surface)
 *   166942:27548   Select duration modal — Start/End time + preset chips + open dropdown
 *   166942:27586   Set focus time modal — status chips + dual-time slots
 *   166942:27624   Schedule future transfer modal — collapsed time-range trigger
 *   166942:27668   Schedule post modal — simple time trigger
 */

const TIMES_AM = ["09:30", "10:00", "10:30", "11:00", "11:30", "12:00", "12:30"]
const TIMES_AM_END = ["10:00", "10:30", "11:00", "11:30", "12:00", "12:30", "01:00"]
const DURATIONS = ["15 min", "30 min", "1 hours", "12 hours", "1 days"]

function suffix(t: string): "AM" | "PM" {
  const h = Number.parseInt(t.split(":")[0], 10)
  return h >= 12 || h === 0 ? (h === 12 ? "PM" : "AM") : "AM"
}

const STATUS_KINDS: TimePickerStatusKind[] = ["available", "busy", "in-meeting", "offline"]

export default function TimePickerDocsPage() {
  const [value, setValue] = React.useState("09:00")
  const [picked, setPicked] = React.useState("10:30")
  const [duration, setDuration] = React.useState("30 min")
  const [status, setStatus] = React.useState<TimePickerStatusKind>("available")
  const [focusSlot, setFocusSlot] = React.useState("10:30")

  return (
    <DocsPageShell>
      <DocsHeader
        category="Components / Form"
        title="Time Picker"
        description="Time selection family — numeric HH:MM input, selectable slot rows, preset duration chips, availability-status badges, and full popover/modal compositions. Use for booking, scheduling, dispatch windows, focus-time, and reservation flows."
      />

      <DocsSection title="Install">
        <DocsCode language="bash" code={`dash add time-picker`} />
      </DocsSection>

      <DocsSection title="Usage">
        <DocsCode
          language="tsx"
          code={`import { TimePicker, TimePickerSlot, TimePickerStatus } from "@/registry/dash/ui/time-picker"

// Numeric input
<TimePicker value={value} onValueChange={setValue} />

// Selectable slot row
<TimePickerSlot start="09:30" startSuffix="AM" selected onClick={...} />

// Status badge
<TimePickerStatus kind="available" />`}
        />
      </DocsSection>

      <DocsSection title="HH:MM numeric input (Dash extension)">
        <p className="text-sm text-text-sub-600 max-w-2xl">
          Two-segment numeric input (Hours · Minutes) for form-style time entry. Disabled + invalid states wired via Root.
        </p>
        <DocsExample
          title="States"
          preview={
            <div className="w-full max-w-md space-y-3">
              <Field>
                <Label>Open</Label>
                <TimePicker value={value} onValueChange={setValue} />
              </Field>
              <Field>
                <Label>Disabled</Label>
                <TimePicker defaultValue="08:00" disabled />
              </Field>
              <Field>
                <Label>Invalid</Label>
                <TimePicker defaultValue="25:99" invalid />
                <Hint tone="error">Out of range.</Hint>
              </Field>
            </div>
          }
          code={`<TimePicker value={value} onValueChange={setValue} />
<TimePicker defaultValue="08:00" disabled />
<TimePicker defaultValue="25:99" invalid />`}
        />
      </DocsSection>

      <DocsSection title="Slot rows — 4 states">
        <p className="text-sm text-text-sub-600 max-w-2xl">
          <code className="text-xs px-1 py-0.5 rounded bg-bg-weak-50">TimePickerSlot</code> renders a 36px selectable row. 4 states (default / hover / selected / disabled) × 2 layouts (single time / dual-time range). Selected = bg-weak-50 + check icon (Figma node 165483:5687).
        </p>
        <DocsExample
          title="Single time × 4 states"
          preview={
            <div className="w-full max-w-md space-y-1">
              <TimePickerSlot start="09:30" startSuffix="AM" />
              <TimePickerSlot start="09:30" startSuffix="AM" className="bg-bg-weak-50" />
              <TimePickerSlot start="09:30" startSuffix="AM" selected />
              <TimePickerSlot start="09:30" startSuffix="AM" disabled />
            </div>
          }
          code={`<TimePickerSlot start="09:30" startSuffix="AM" />
<TimePickerSlot start="09:30" startSuffix="AM" selected />
<TimePickerSlot start="09:30" startSuffix="AM" disabled />`}
        />
        <DocsExample
          title="Dual-time range × 4 states"
          preview={
            <div className="w-full max-w-md space-y-1">
              <TimePickerSlot start="09:30" startSuffix="AM" end="09:30" endSuffix="AM" />
              <TimePickerSlot start="09:30" startSuffix="AM" end="09:30" endSuffix="AM" className="bg-bg-weak-50" />
              <TimePickerSlot start="09:30" startSuffix="AM" end="09:30" endSuffix="AM" selected />
              <TimePickerSlot start="09:30" startSuffix="AM" end="09:30" endSuffix="AM" disabled />
            </div>
          }
          code={`<TimePickerSlot
  start="09:30" startSuffix="AM"
  end="10:00"   endSuffix="AM"
  selected
/>`}
        />
      </DocsSection>

      <DocsSection title="Duration chips">
        <p className="text-sm text-text-sub-600 max-w-2xl">
          Preset duration buttons — 4 states (default / hover / selected / disabled). Selected = lighter primary bg + check icon (Figma node 165483:6046).
        </p>
        <DocsExample
          title="4 states"
          preview={
            <div className="flex flex-wrap items-center gap-2">
              <DurationChip>30 min</DurationChip>
              <DurationChip className="bg-bg-weak-50">30 min</DurationChip>
              <DurationChip selected>30 min</DurationChip>
              <DurationChip disabled>30 min</DurationChip>
            </div>
          }
          code={`<DurationChip>30 min</DurationChip>
<DurationChip selected>30 min</DurationChip>
<DurationChip disabled>30 min</DurationChip>`}
        />
      </DocsSection>

      <DocsSection title="Status badges">
        <p className="text-sm text-text-sub-600 max-w-2xl">
          <code className="text-xs px-1 py-0.5 rounded bg-bg-weak-50">TimePickerStatus</code> — 28px availability pill. 4 kinds (Available / Busy / In-meeting / Offline) × 4 states (default / hover / selected / disabled). Used in focus-time and shared-calendar flows (Figma node 165596:41348).
        </p>
        <DocsExample
          title="Status matrix"
          preview={
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                {STATUS_KINDS.map((k) => <TimePickerStatus key={k} kind={k} />)}
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {STATUS_KINDS.map((k) => <TimePickerStatus key={k} kind={k} className="bg-bg-weak-50" />)}
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <TimePickerStatus kind="available" className="bg-success-lighter text-success-darker border-success-lighter" />
                <TimePickerStatus kind="busy" className="bg-error-lighter text-error-darker border-error-lighter" />
                <TimePickerStatus kind="in-meeting" className="bg-warning-lighter text-warning-darker border-warning-lighter" />
                <TimePickerStatus kind="offline" className="bg-bg-weak-50 text-text-strong-950 border-bg-weak-50" />
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {STATUS_KINDS.map((k) => <TimePickerStatus key={k} kind={k} className="opacity-50 cursor-not-allowed" />)}
              </div>
            </div>
          }
          code={`<TimePickerStatus kind="available" />
<TimePickerStatus kind="busy" />
<TimePickerStatus kind="in-meeting" />
<TimePickerStatus kind="offline" />`}
        />
      </DocsSection>

      <DocsSection title="Composite: Pick-time popover (light)">
        <p className="text-sm text-text-sub-600 max-w-2xl">
          Full pick-time popover — header w/ current value + close, preset duration chips, scrollable slot list, Cancel/Apply footer. Figma node 165641:19379.
        </p>
        <DocsExample
          title="Light surface"
          preview={
            <PickTimePopover
              theme="light"
              value={picked}
              onValueChange={setPicked}
              duration={duration}
              onDurationChange={setDuration}
            />
          }
          code={`<PickTimePopover
  value={picked}
  onValueChange={setPicked}
  duration={duration}
  onDurationChange={setDuration}
/>`}
        />
      </DocsSection>

      <DocsSection title="Composite: Pick-time popover (dark)">
        <p className="text-sm text-text-sub-600 max-w-2xl">
          Same surface — dark theme override. Body bg = bg-strong-950, header lighter. Figma node 165690:12492.
        </p>
        <DocsExample
          title="Dark surface"
          preview={
            <PickTimePopover
              theme="dark"
              value={picked}
              onValueChange={setPicked}
              duration={duration}
              onDurationChange={setDuration}
            />
          }
          code={`<PickTimePopover theme="dark" {...props} />`}
        />
      </DocsSection>

      <DocsSection title="Composite: Select duration modal">
        <p className="text-sm text-text-sub-600 max-w-2xl">
          Start/End time triggers with open dropdown overlay + preset duration chips. Figma node 166942:27548.
        </p>
        <DocsExample
          title="Modal w/ open dropdown"
          preview={
            <div className="max-w-xl rounded-2xl border border-stroke-soft-200 bg-bg-white-0 shadow-lg p-4 space-y-4">
              <div className="flex items-start gap-3 pb-3 border-b border-stroke-soft-200">
                <span className="inline-flex size-8 items-center justify-center rounded-full bg-bg-weak-50">
                  <Clock className="size-4 text-icon-sub-600" />
                </span>
                <div className="flex-1">
                  <div className="text-sm font-medium text-text-strong-950">Select duration</div>
                  <div className="text-xs text-text-sub-600">Select start and end time or choose from preset durations.</div>
                </div>
                <CompactButton variant="ghost" size="sm" aria-label="Close"><X /></CompactButton>
              </div>
              <div className="grid grid-cols-2 gap-3 relative">
                <Field>
                  <Label optional>Start time</Label>
                  <TimeTrigger value="08:00 AM" open />
                  <div className="absolute left-0 top-[68px] z-10 w-56 rounded-xl border border-stroke-soft-200 bg-bg-white-0 shadow-lg overflow-hidden">
                    <ScrollArea className="h-56">
                      <div className="p-1">
                        {TIMES_AM.map((t) => (
                          <TimePickerSlot
                            key={t}
                            start={t}
                            startSuffix={suffix(t)}
                            selected={t === "10:30"}
                          />
                        ))}
                      </div>
                    </ScrollArea>
                  </div>
                </Field>
                <Field>
                  <Label optional>End time</Label>
                  <TimeTrigger value="12:00 PM" />
                </Field>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {["1 hours", "8 hours", "12 hours", "1 days"].map((d) => (
                  <DurationChip key={d} selected={d === duration} onClick={() => setDuration(d)}>{d}</DurationChip>
                ))}
              </div>
              <div className="flex items-center justify-end gap-2">
                <Button style="stroke" tone="neutral">Cancel</Button>
                <Button>Apply</Button>
              </div>
            </div>
          }
          code={`<Modal>
  <ModalHeader>Select duration</ModalHeader>
  <div className="grid grid-cols-2 gap-3">
    <Field><Label>Start time</Label><TimeTrigger value="08:00 AM" open /></Field>
    <Field><Label>End time</Label><TimeTrigger value="12:00 PM" /></Field>
  </div>
  <div className="flex flex-wrap gap-2">
    {presets.map(d => <DurationChip selected={d === duration}>{d}</DurationChip>)}
  </div>
  <Footer><Button>Cancel</Button><Button>Apply</Button></Footer>
</Modal>`}
        />
      </DocsSection>

      <DocsSection title="Composite: Set focus time modal">
        <p className="text-sm text-text-sub-600 max-w-2xl">
          Status selector + dual-time slot grid + "Set custom time" link footer. Figma node 166942:27586.
        </p>
        <DocsExample
          title="Focus time picker"
          preview={
            <div className="max-w-md rounded-2xl border border-stroke-soft-200 bg-bg-white-0 shadow-lg p-4 space-y-4">
              <div className="flex items-start gap-3 pb-3 border-b border-stroke-soft-200">
                <span className="inline-flex size-8 items-center justify-center rounded-full bg-bg-weak-50">
                  <Bell className="size-4 text-icon-sub-600" />
                </span>
                <div className="flex-1">
                  <div className="text-sm font-medium text-text-strong-950">Set focus time</div>
                  <div className="text-xs text-text-sub-600">Choose when you don't want to be disturbed</div>
                </div>
                <CompactButton variant="ghost" size="sm" aria-label="Close"><X /></CompactButton>
              </div>
              <div className="space-y-2">
                <div className="inline-flex items-center gap-1 text-sm font-medium">Select status <Info className="size-3.5 text-icon-soft-400" /></div>
                <div className="flex flex-wrap items-center gap-2">
                  {STATUS_KINDS.map((k) => {
                    const active = status === k
                    return (
                      <button key={k} type="button" onClick={() => setStatus(k)}>
                        <TimePickerStatus
                          kind={k}
                          className={cn(
                            active && k === "available" && "bg-success-lighter text-success-darker border-success-lighter",
                            active && k === "busy" && "bg-error-lighter text-error-darker border-error-lighter",
                            active && k === "in-meeting" && "bg-warning-lighter text-warning-darker border-warning-lighter",
                            active && k === "offline" && "bg-bg-weak-50 text-text-strong-950 border-bg-weak-50",
                          )}
                        />
                      </button>
                    )
                  })}
                </div>
              </div>
              <div className="space-y-2">
                <div className="inline-flex items-center gap-1 text-sm font-medium">Select time <Info className="size-3.5 text-icon-soft-400" /></div>
                <ScrollArea className="h-56 rounded-lg">
                  <div className="space-y-1 pr-2">
                    {TIMES_AM.map((t, i) => (
                      <TimePickerSlot
                        key={t}
                        start={t}
                        startSuffix={suffix(t)}
                        end={TIMES_AM_END[i]}
                        endSuffix={suffix(TIMES_AM_END[i])}
                        selected={t === focusSlot}
                        onClick={() => setFocusSlot(t)}
                      />
                    ))}
                  </div>
                </ScrollArea>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-stroke-soft-200">
                <LinkButton size="sm">Set custom time</LinkButton>
                <div className="flex items-center gap-2">
                  <Button style="stroke" tone="neutral">Cancel</Button>
                  <Button>Apply</Button>
                </div>
              </div>
            </div>
          }
          code={`<Modal>
  <ModalHeader>Set focus time</ModalHeader>
  <Field>
    <Label>Select status</Label>
    {STATUS_KINDS.map(k => (
      <button onClick={() => setStatus(k)}>
        <TimePickerStatus kind={k} className={active && tones[k]} />
      </button>
    ))}
  </Field>
  <Field>
    <Label>Select time</Label>
    <ScrollArea>
      {slots.map(s => (
        <TimePickerSlot
          start={s.start} startSuffix="AM"
          end={s.end}     endSuffix="AM"
          selected={focusSlot === s.start}
          onClick={() => setFocusSlot(s.start)}
        />
      ))}
    </ScrollArea>
  </Field>
  <Footer><LinkButton>Set custom time</LinkButton><Cancel/><Apply/></Footer>
</Modal>`}
        />
      </DocsSection>

      <DocsSection title="Composite: Schedule future transfer">
        <p className="text-sm text-text-sub-600 max-w-2xl">
          Bank context header + amount summary + collapsed time-range trigger + "Next transaction time" recurrence + info hint. Figma node 166942:27624.
        </p>
        <DocsExample
          title="Bank scheduling modal"
          preview={
            <div className="max-w-md rounded-2xl border border-stroke-soft-200 bg-bg-white-0 shadow-lg p-4 space-y-4">
              <div className="flex items-start justify-between pb-3 border-b border-stroke-soft-200">
                <div className="text-sm font-medium text-text-strong-950">Schedule future transfer</div>
                <CompactButton variant="ghost" size="sm" aria-label="Close"><X /></CompactButton>
              </div>
              <div className="flex items-center gap-3 pb-3 border-b border-stroke-soft-200">
                <span className="inline-flex size-10 items-center justify-center rounded-full bg-bg-weak-50">
                  <Bank className="size-5 text-icon-sub-600" />
                </span>
                <div className="flex-1">
                  <div className="text-xs text-text-sub-600">Transfer amount</div>
                  <div className="text-base font-medium text-text-strong-950">$2,500.00</div>
                </div>
                <LinkButton size="sm">Edit</LinkButton>
              </div>
              <Field>
                <Label optional>Select time</Label>
                <TimeTrigger value="10:30 AM - 11:00 AM" />
                <button type="button" className="inline-flex items-center gap-1.5 text-sm text-text-sub-600 hover:text-text-strong-950 pt-1">
                  <Plus className="size-4" /> Next transaction time
                </button>
              </Field>
              <Hint tone="neutral">Transfers process next business day.</Hint>
              <div className="flex items-center justify-end gap-2 pt-2">
                <Button style="stroke" tone="neutral">Cancel</Button>
                <Button>Confirm</Button>
              </div>
            </div>
          }
          code={`<Modal>
  <ModalHeader>Schedule future transfer</ModalHeader>
  <BankSummary amount="$2,500.00" />
  <Field>
    <Label>Select time</Label>
    <TimeTrigger value="10:30 AM - 11:00 AM" />
    <LinkButton><Plus /> Next transaction time</LinkButton>
  </Field>
  <Hint>Transfers process next business day.</Hint>
  <Footer><Cancel/><Confirm/></Footer>
</Modal>`}
        />
      </DocsSection>

      <DocsSection title="Composite: Schedule post">
        <p className="text-sm text-text-sub-600 max-w-2xl">
          Minimal time trigger with day-suffix value ("10:00 AM - Today") + full-width Schedule CTA. Figma node 166942:27668.
        </p>
        <DocsExample
          title="Schedule post"
          preview={
            <div className="max-w-md rounded-2xl border border-stroke-soft-200 bg-bg-white-0 shadow-lg p-4 space-y-4">
              <div className="flex items-start justify-between pb-3 border-b border-stroke-soft-200">
                <div className="text-sm font-medium text-text-strong-950">When would you like to post this?</div>
                <CompactButton variant="ghost" size="sm" aria-label="Close"><X /></CompactButton>
              </div>
              <Field>
                <Label className="inline-flex items-center gap-1">Select time <Info className="size-3.5 text-icon-soft-400" /></Label>
                <TimeTrigger value="10:00 AM - Today" hideIcon />
                <div className="text-xs text-text-sub-600 pt-1">Messages scheduled for later appear in My Drafts.</div>
              </Field>
              <Button className="w-full">Schedule</Button>
            </div>
          }
          code={`<Modal>
  <ModalTitle>When would you like to post this?</ModalTitle>
  <Field>
    <Label>Select time</Label>
    <TimeTrigger value="10:00 AM - Today" hideIcon />
    <FieldDescription>Messages scheduled for later appear in My Drafts.</FieldDescription>
  </Field>
  <Button className="w-full">Schedule</Button>
</Modal>`}
        />
      </DocsSection>

      <DocsSection title="API">
        <DocsPropsTable
          rows={[
            { name: "TimePicker.value", type: "string", description: "Controlled HH:MM value." },
            { name: "TimePicker.defaultValue", type: "string", defaultValue: '"09:00"', description: "Uncontrolled initial value." },
            { name: "TimePicker.onValueChange", type: "(value: string) => void", description: "Fires on hour or minute change." },
            { name: "TimePicker.disabled / invalid", type: "boolean", description: "Forwarded to InputRoot." },
            { name: "TimePickerSlot.start", type: "string", description: "Primary time string (e.g. \"09:30\")." },
            { name: "TimePickerSlot.end", type: "string", description: "Optional secondary time — renders \"—\" separator (swapped to ✓ when selected)." },
            { name: "TimePickerSlot.startSuffix / endSuffix", type: "string", description: "Period suffix (\"AM\" / \"PM\" / \"WIB\")." },
            { name: "TimePickerSlot.selected", type: "boolean", description: "Active state — bg-weak-50 + check icon." },
            { name: "TimePickerStatus.kind", type: '"available" | "busy" | "in-meeting" | "offline"', description: "Status dot color + default label." },
            { name: "TimePickerStatus.label", type: "ReactNode", description: "Override the default label text." },
          ]}
        />
      </DocsSection>

      <DocsSection title="Anatomy">
        <ul className="space-y-2 text-sm text-text-strong-950/90">
          <li>• <strong>TimePicker</strong> — numeric HH:MM input. Built on InputRoot + 2 Input segments.</li>
          <li>• <strong>TimePickerSlot</strong> — 36px row button. Single time or dual-time range layout.</li>
          <li>• <strong>TimePickerStatus</strong> — 28px availability pill (4 kinds).</li>
          <li>• <strong>Compositions</strong> — Popover/Modal shell wraps slot list + duration chips + status badges + custom triggers per use case (Schedule transfer · Set focus time · Schedule post · Pick time).</li>
        </ul>
      </DocsSection>

      <DocsSection title="Accessibility">
        <ul className="space-y-2 text-sm text-text-strong-950/90">
          <li>• <strong>Numeric input</strong> — separate <code className="text-xs">aria-label</code> per segment (Hours, Minutes). <code className="text-xs">inputMode=&quot;numeric&quot;</code>.</li>
          <li>• <strong>Slot rows</strong> — real <code className="text-xs">{`<button>`}</code> with <code className="text-xs">aria-pressed</code> for selected.</li>
          <li>• <strong>Status badges</strong> — visible label carries meaning; the colored dot is <code className="text-xs">aria-hidden</code>.</li>
          <li>• <strong>Popover/Modal</strong> — focus-trap, ESC closes, return focus to trigger.</li>
        </ul>
      </DocsSection>
    </DocsPageShell>
  )
}

function DurationChip({
  children,
  selected,
  disabled,
  onClick,
  className,
}: {
  children: React.ReactNode
  selected?: boolean
  disabled?: boolean
  onClick?: () => void
  className?: string
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "inline-flex h-8 items-center gap-1.5 rounded-lg border px-3 text-sm font-medium transition-colors",
        "border-stroke-soft-200 bg-bg-white-0 text-text-sub-600",
        "hover:bg-bg-weak-50",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        selected && "bg-(--primary-alpha-10) text-(--primary-base) border-(--primary-alpha-10)",
        className,
      )}
    >
      {selected ? <Check className="size-3.5" strokeWidth={3} /> : null}
      {children}
    </button>
  )
}

function TimeTrigger({
  value,
  open,
  hideIcon,
}: {
  value: string
  open?: boolean
  hideIcon?: boolean
}) {
  return (
    <button
      type="button"
      className={cn(
        "inline-flex h-10 w-full items-center justify-between gap-2 rounded-[10px] border bg-bg-white-0 px-3 text-sm",
        "border-stroke-soft-200 hover:bg-bg-weak-50",
        open && "border-stroke-strong-950 ring-2 ring-ring ring-offset-2",
      )}
    >
      <span className="inline-flex items-center gap-2 text-text-strong-950">
        {hideIcon ? null : <Clock className="size-4 text-icon-soft-400" />}
        {value}
      </span>
      <ChevronDown className={cn("size-4 text-icon-soft-400 transition-transform", open && "rotate-180")} />
    </button>
  )
}

function PickTimePopover({
  theme = "light",
  value,
  onValueChange,
  duration,
  onDurationChange,
}: {
  theme?: "light" | "dark"
  value: string
  onValueChange: (v: string) => void
  duration: string
  onDurationChange: (d: string) => void
}) {
  const dark = theme === "dark"
  return (
    <div
      className={cn(
        "max-w-md w-full rounded-2xl border shadow-lg overflow-hidden",
        dark ? "bg-bg-strong-950 border-bg-strong-950 text-static-white" : "bg-bg-white-0 border-stroke-soft-200 text-text-strong-950",
      )}
    >
      <div className={cn("flex items-center gap-2 px-4 py-3 border-b", dark ? "border-white/10" : "border-stroke-soft-200")}>
        <Clock className={cn("size-4", dark ? "text-white/70" : "text-icon-soft-400")} />
        <span className="text-sm font-medium tabular-nums">{value}</span>
        <span className={cn("text-xs", dark ? "text-white/50" : "text-text-soft-400")}>{suffix(value)}</span>
        <span className="ml-auto" />
        <CompactButton
          variant="ghost"
          size="sm"
          aria-label="Close"
          className={cn(dark && "text-white/70 hover:bg-white/10 hover:text-white")}
        >
          <X />
        </CompactButton>
      </div>
      <div className={cn("flex flex-wrap items-center gap-2 px-4 py-3 border-b overflow-x-auto", dark ? "border-white/10" : "border-stroke-soft-200")}>
        {DURATIONS.map((d) => (
          <DurationChip
            key={d}
            selected={d === duration}
            onClick={() => onDurationChange(d)}
            className={cn(
              dark && "bg-transparent border-white/20 text-white/80 hover:bg-white/10",
              dark && d === duration && "bg-(--primary-alpha-24) text-(--primary-base) border-(--primary-alpha-24)",
            )}
          >
            {d}
          </DurationChip>
        ))}
      </div>
      <ScrollArea className="h-56">
        <div className="p-1">
          {TIMES_AM.map((t) => (
            <TimePickerSlot
              key={t}
              start={t}
              startSuffix={suffix(t)}
              selected={t === value}
              onClick={() => onValueChange(t)}
              className={cn(
                dark && "text-white/80 hover:bg-white/10",
                dark && t === value && "bg-white/10",
              )}
            />
          ))}
        </div>
      </ScrollArea>
      <div className={cn("flex items-center justify-end gap-2 px-4 py-3 border-t", dark ? "border-white/10" : "border-stroke-soft-200")}>
        <Button style="stroke" tone="neutral" className={cn(dark && "bg-transparent border-white/20 text-white hover:bg-white/10")}>Cancel</Button>
        <Button>Apply</Button>
      </div>
    </div>
  )
}
