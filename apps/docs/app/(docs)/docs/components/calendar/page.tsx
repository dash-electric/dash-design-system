"use client"

import * as React from "react"
import { Calendar } from "@/registry/dash/ui/calendar"
import {
  DocsPageShell,
  DocsHeader,
  DocsSection,
  DocsExample,
  DocsPropsTable,
} from "@/components/docs/page-shell"
import { DocsCode } from "@/components/docs/code-block"

export default function CalendarDocsPage() {
  const [date, setDate] = React.useState<Date | undefined>(new Date())

  return (
    <DocsPageShell>
      <DocsHeader
        category="Components / Form"
        title="Calendar"
        description="Date-grid primitive powered by react-day-picker. Used standalone for inline date pickers or composed inside DatePicker / DateRange overlays."
      />

      <DocsSection title="Install">
        <DocsCode language="bash" code={`dash add calendar`} />
      </DocsSection>

      <DocsSection title="Examples">
        <DocsExample
          title="Single date select"
          description="Inline calendar with controlled state."
          preview={
            <div className="flex w-full justify-center rounded-xl border border-stroke-soft-200 bg-bg-white-0 p-6">
              <Calendar mode="single" selected={date} onSelect={setDate} />
            </div>
          }
          code={`const [date, setDate] = React.useState<Date | undefined>(new Date())

<Calendar mode="single" selected={date} onSelect={setDate} />`}
        />
      </DocsSection>

      <DocsSection title="Composition">
        <ul className="text-sm text-text-sub-600 space-y-1.5 list-disc pl-5">
          <li>Wraps <code>DayPicker</code> from <code>react-day-picker</code>.</li>
          <li>Composed inside <code>DatePicker</code> and the calendar widget on dashboards.</li>
        </ul>
      </DocsSection>

      <DocsSection title="API">
        <DocsPropsTable
          rows={[
            { name: "mode", type: '"single" | "multiple" | "range"', defaultValue: '"single"', description: "Selection mode." },
            { name: "selected", type: "Date | Date[] | DateRange", description: "Controlled selection." },
            { name: "onSelect", type: "(value) => void", description: "Selection change handler." },
            { name: "...rest", type: "DayPickerProps", description: "Forwards all props to react-day-picker." },
          ]}
        />
      </DocsSection>
    </DocsPageShell>
  )
}
