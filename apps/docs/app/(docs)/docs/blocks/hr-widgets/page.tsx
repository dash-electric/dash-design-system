"use client"

import {
  ScheduleWidget,
  TimeOffWidget,
  EmployeeSpotlightWidget,
  TimeTrackerWidget,
  NotesWidget,
  StatusTrackerWidget,
} from "@/registry/dash/blocks/hr-widgets"
import {
  DocsPageShell,
  DocsHeader,
  DocsSection,
  DocsExample,
} from "@/components/docs/page-shell"
import { DocsCode } from "@/components/docs/code-block"

export default function HrWidgetsDocsPage() {
  return (
    <DocsPageShell>
      <DocsHeader
        category="Blocks / Sector Widgets"
        title="HR Widgets"
        description="Six self-contained widgets used to compose HR dashboards — Schedule, Time Off, Employee Spotlight, Time Tracker, Notes, and Status Tracker. Each works standalone; all fixtures default to AlignUI Pro Figma data."
      />

      <DocsSection title="Install">
        <DocsCode language="bash" code={`dashkit add hr-widgets`} />
      </DocsSection>

      <DocsSection title="Examples">
        <DocsExample
          title="Schedule + Notes pair"
          description="Two widgets side-by-side at default data."
          preview={
            <div className="grid w-full gap-4 lg:grid-cols-2 rounded-xl border border-stroke-soft-200 bg-bg-white-0 p-6">
              <ScheduleWidget />
              <NotesWidget />
            </div>
          }
          code={`<ScheduleWidget events={[/* ScheduleEvent[] */]} />
<NotesWidget notes={[/* NoteEntry[] */]} />`}
        />

        <DocsExample
          title="Time Off + Status Tracker pair"
          preview={
            <div className="grid w-full gap-4 lg:grid-cols-2 rounded-xl border border-stroke-soft-200 bg-bg-white-0 p-6">
              <TimeOffWidget />
              <StatusTrackerWidget />
            </div>
          }
          code={`<TimeOffWidget entries={[/* TimeOffEntry[] */]} />
<StatusTrackerWidget entries={[/* StatusEntry[] */]} />`}
        />

        <DocsExample
          title="Employee Spotlight + Time Tracker"
          preview={
            <div className="grid w-full gap-4 lg:grid-cols-2 rounded-xl border border-stroke-soft-200 bg-bg-white-0 p-6">
              <EmployeeSpotlightWidget />
              <TimeTrackerWidget />
            </div>
          }
          code={`<EmployeeSpotlightWidget />
<TimeTrackerWidget tasks={[/* TimeTrackerTask[] */]} />`}
        />
      </DocsSection>

      <DocsSection title="Composition">
        <ul className="text-sm text-text-sub-600 space-y-1.5 list-disc pl-5">
          <li><code>ScheduleWidget</code> — week-strip + today&apos;s events with meeting / event / holiday tags.</li>
          <li><code>TimeOffWidget</code> — gauge + Pending / Confirmed / Rejected requests.</li>
          <li><code>EmployeeSpotlightWidget</code> — featured employee card.</li>
          <li><code>TimeTrackerWidget</code> — task list with cumulative hours tracked.</li>
          <li><code>NotesWidget</code> — 3 quick notes with category badges.</li>
          <li><code>StatusTrackerWidget</code> — absent / away employee list with reasons + replacements.</li>
        </ul>
      </DocsSection>
    </DocsPageShell>
  )
}
