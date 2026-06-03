"use client"

import { HrCalendar } from "@/registry/dash/templates/hr-calendar"
import {
  DocsPageShell,
  DocsHeader,
  DocsSection,
  DocsExample,
} from "@/components/docs/page-shell"
import { DocsTemplatePreview } from "@/components/docs/template-preview"
import { DocsCode } from "@/components/docs/code-block"

export default function HrCalendarDocsPage() {
  return (
    <DocsPageShell>
      <DocsHeader
        category="Templates / HR Management"
        title="HR Calendar"
        description="Synergy HR weekly schedule view — upcoming cards + Mon-Fri grid with event blocks. Ported 1:1 (structural parity) from AlignUI Pro Figma node 3873:39572."
      />

      <DocsSection title="Install">
        <DocsCode language="bash" code={`dashkit add hr-calendar`} />
      </DocsSection>

      <DocsSection title="Examples">
        <DocsExample
          bare
          title="Default week view"
          description="4 upcoming event cards (live / conflicted / cancelled / upcoming) + 5-day grid with 5 sample events."
          preview={
            <DocsTemplatePreview padding="p-6">
              <HrCalendar />
            </DocsTemplatePreview>
          }
          code={`<HrCalendar
  weekLabel="Feb 04 - Feb 11 2024"
  upcoming={[/* UpcomingEvent[] */]}
  events={[/* CalendarEventBlock[] */]}
/>`}
        />
      </DocsSection>

      <DocsSection title="When to use">
        <ul className="text-sm text-text-sub-600 space-y-1.5 list-disc pl-6">
          <li><strong>Use</strong> for team scheduling views (HR, ops, project mgmt).</li>
          <li><strong>Don&apos;t</strong> use for single-month calendar — reach for <code>@dash/calendar</code> primitive.</li>
          <li>Grid is a static visual mockup — wire real impl to your own event store.</li>
        </ul>
      </DocsSection>
    </DocsPageShell>
  )
}
