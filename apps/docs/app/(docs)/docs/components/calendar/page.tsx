"use client"

import * as React from "react"
import { Calendar } from "@/registry/dash/ui/calendar"
import {
  DocsPageShell,
  DocsHeader,
  DocsSection,
  DocsExample,
  DocsPropsTable,
  DocsDoDont,
} from "@/components/docs/page-shell"
import { DocsCode } from "@/components/docs/code-block"

export default function CalendarDocsPage() {
  const [date, setDate] = React.useState<Date | undefined>(new Date())

  return (
    <DocsPageShell>
      <DocsHeader
        status="stable"
        kind="composite"
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
        <ul className="text-sm text-text-sub-600 space-y-1.5 list-disc pl-6">
          <li>Wraps <code>DayPicker</code> from <code>react-day-picker</code>.</li>
          <li>Composed inside <code>DatePicker</code> and the calendar widget on dashboards.</li>
        </ul>
      </DocsSection>

      <DocsSection title="Do this, not that">
        <p className="text-base text-text-sub-600 leading-relaxed max-w-2xl">
          Calendar untuk pilih tanggal yang valid berdasarkan business rule. Disable opsi yang tidak bisa dipilih, highlight hari ini.
        </p>
        <DocsDoDont
          do={{
            preview: (
              <div className="w-full max-w-xs text-xs">
                <div className="text-text-sub-600 mb-1">Pilih tanggal pickup</div>
                <div className="grid grid-cols-7 gap-1">
                  {Array.from({length: 14}, (_, i) => (
                    <div
                      key={i}
                      className={`size-6 rounded flex items-center justify-center ${
                        i < 5 ? "text-text-soft-400 line-through" : i === 5 ? "bg-(--dash-purple-500) text-white font-semibold" : "bg-bg-white-0 border border-stroke-soft-200"
                      }`}
                    >{i+1}</div>
                  ))}
                </div>
                <div className="text-[10px] text-text-soft-400 mt-1">Tanggal lalu disabled · hari ini di-highlight</div>
              </div>
            ),
            caption: "Disable past dates untuk schedule delivery. Highlight today. Mitra tidak bisa pilih invalid date.",
          }}
          dont={{
            preview: (
              <div className="w-full max-w-xs text-xs">
                <div className="grid grid-cols-7 gap-1">
                  {Array.from({length: 14}, (_, i) => (
                    <div key={i} className="size-6 rounded bg-bg-white-0 border border-stroke-soft-200 flex items-center justify-center">{i+1}</div>
                  ))}
                </div>
              </div>
            ),
            caption: "Jangan biarkan semua tanggal equal weight. Mitra pilih tanggal lalu → error di submit, baru kelihatan kenapa.",
          }}
        />
        <DocsDoDont
          do={{
            caption: "Localized day-of-week: Sen, Sel, Rab. Format tanggal dd MMM (12 Mei) — natural untuk pasar Indonesia.",
          }}
          dont={{
            caption: "Jangan pakai format MM/DD/YYYY (US). Confusing — 05/12/2026 di Indonesia dibaca 5 Desember, di US 12 Mei.",
          }}
        />
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
