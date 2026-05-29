"use client"

import { HrDashboard } from "@/registry/dash/templates/hr-dashboard"
import {
  DocsPageShell,
  DocsHeader,
  DocsSection,
  DocsExample,
  DocsPropsTable,
  DocsDoDont,
} from "@/components/docs/page-shell"
import { DocsTemplatePreview } from "@/components/docs/template-preview"
import { DocsCode } from "@/components/docs/code-block"

export default function HrDashboardDocsPage() {
  return (
    <DocsPageShell>
      <DocsHeader
        category="Templates / HR Management"
        title="HR Dashboard"
        description="Synergy HR home — Status Tracker (absent/away) + Notes + Today's Schedule + Time Off (gauge) + Current Project. Ported 1:1 (structural parity) from AlignUI Pro Figma node 3715:42065."
      />

      <DocsSection title="Install">
        <DocsCode language="bash" code={`dashkit add hr-dashboard`} />
      </DocsSection>

      <DocsSection title="Examples">
        <DocsExample
          bare
          title="Welcome dashboard"
          description="Default render with 1 absent + 3 away employees, 3 notes, 3 scheduled events, time-off gauge, current project tile."
          preview={
            <DocsTemplatePreview padding="p-6">
              <HrDashboard />
            </DocsTemplatePreview>
          }
          code={`<HrDashboard
  userName="Sophia"
  date="February 04, 2024"
  absent={[/* AbsentEmployee[] */]}
  away={[/* AbsentEmployee[] */]}
  schedule={[/* ScheduleEvent[] */]}
  timeOff={[/* TimeOffRequest[] */]}
/>`}
        />
      </DocsSection>

      <DocsSection
        title="Composition"
        description="5-widget layout composed entirely from @dash primitives."
      >
        <ul className="text-sm text-text-sub-600 space-y-1.5 list-disc pl-5">
          <li><strong>Status Tracker</strong> — Absent + Away sub-sections, avatar + reason + duration per row.</li>
          <li><strong>Notes</strong> — 3 quick notes with category badges (Today / Meeting / Important).</li>
          <li><strong>Schedule</strong> — week-strip + today&apos;s events list with meeting / event / holiday tags.</li>
          <li><strong>Time Off</strong> — 10/20 gauge + Pending/Confirmed/Rejected requests.</li>
          <li><strong>Current Project</strong> — 4 KPI tiles + sprint progress bar.</li>
        </ul>
      </DocsSection>

      <DocsSection title="When to use">
        <ul className="text-sm text-text-sub-600 space-y-1.5 list-disc pl-5">
          <li><strong>Use</strong> as the daily home for HR portals.</li>
          <li><strong>Use</strong> as starter shell for employee self-serve dashboards.</li>
          <li><strong>Don&apos;t</strong> use for L1/L2 ticket dashboards — reach for <code>HaloDash3Pane</code>.</li>
        </ul>
      </DocsSection>

      <DocsSection title="API">
        <DocsPropsTable
          rows={[
            { name: "userName", type: "string", defaultValue: '"Sophia"', description: "Header greeting name." },
            { name: "date", type: "string", defaultValue: '"February 04, 2024"', description: "Subtitle date string." },
            { name: "absent", type: "AbsentEmployee[]", description: "{ id, name, reason?, replacedBy?, team, duration, initials? }." },
            { name: "away", type: "AbsentEmployee[]", description: "Same shape as absent." },
            { name: "schedule", type: "ScheduleEvent[]", description: "{ id, title, time, via?, tag, attendeesExtra? }." },
            { name: "timeOff", type: "TimeOffRequest[]", description: "{ id, label, date, type: 'Pending' | 'Confirmed' | 'Rejected' }." },
          ]}
        />
      </DocsSection>
      <DocsSection title="Headcount + state">
        <p className="text-sm text-text-sub-600 max-w-2xl">
          HR dashboards lead with headcount split by employment state — active, onboarding, leaving. Don't show one giant 'team size' number.
        </p>
        <DocsDoDont
          do={{
            preview: (
              <div className="w-full max-w-md grid grid-cols-3 gap-2">
                <div className="rounded-lg border border-stroke-soft-200 bg-bg-white-0 p-2"><p className="text-[10px] text-text-sub-600">Aktif</p><p className="text-base font-semibold">128</p></div>
                <div className="rounded-lg border border-stroke-soft-200 bg-bg-white-0 p-2"><p className="text-[10px] text-text-sub-600">Onboarding</p><p className="text-base font-semibold text-warning-dark">7</p></div>
                <div className="rounded-lg border border-stroke-soft-200 bg-bg-white-0 p-2"><p className="text-[10px] text-text-sub-600">Cuti</p><p className="text-base font-semibold">12</p></div>
              </div>
            ),
            caption: "Split headcount by state. People-ops can see at a glance who's onboarding (needs attention) vs on leave (covered).",
          }}
          dont={{
            preview: (
              <div className="w-full max-w-md rounded-lg border border-stroke-soft-200 bg-bg-white-0 p-4 text-center"><p className="text-[10px] text-text-sub-600">Total karyawan</p><p className="text-3xl font-semibold">147</p></div>
            ),
            caption: "Don't roll up to one 'total' number. People-ops needs the breakdown — '147' tells them nothing actionable.",
          }}
        />
      </DocsSection>

      <DocsSection title="Quick actions placement">
        <p className="text-sm text-text-sub-600 max-w-2xl">
          Approve leave, run payroll, send onboarding doc — these high-frequency actions sit on the dashboard, one click away. Don't bury them in submenus.
        </p>
        <DocsDoDont
          do={{
            preview: (
              <div className="w-full max-w-md space-y-2">
                <p className="text-xs font-medium">Aksi cepat</p>
                <div className="grid grid-cols-3 gap-2"><button className="h-12 rounded-md border border-stroke-soft-200 bg-bg-white-0 text-[10px] flex flex-col items-center justify-center gap-1"><span></span>Approve cuti</button><button className="h-12 rounded-md border border-stroke-soft-200 bg-bg-white-0 text-[10px] flex flex-col items-center justify-center gap-1"><span></span>Run payroll</button><button className="h-12 rounded-md border border-stroke-soft-200 bg-bg-white-0 text-[10px] flex flex-col items-center justify-center gap-1"><span></span>Onboard new</button></div>
              </div>
            ),
            caption: "Quick-action tiles on the dashboard. People-ops opens Dash, sees the action, clicks once.",
          }}
          dont={{
            preview: (
              <div className="w-full max-w-md rounded-lg border border-stroke-soft-200 bg-bg-white-0 p-3 text-xs text-text-sub-600">Aksi-aksi tersedia di menu Settings → Workflows → Quick actions.</div>
            ),
            caption: "Don't bury frequent actions three levels deep. Daily flow becomes a treasure hunt.",
          }}
        />
      </DocsSection>
        </DocsPageShell>
  )
}
