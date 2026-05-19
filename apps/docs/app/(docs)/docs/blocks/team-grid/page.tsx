"use client"

import { TeamGrid } from "@/registry/dash/blocks/team-grid"
import {
  DocsPageShell,
  DocsHeader,
  DocsSection,
  DocsExample,
  DocsPropsTable,
} from "@/components/docs/page-shell"
import { DocsCode } from "@/components/docs/code-block"

export default function TeamGridDocsPage() {
  return (
    <DocsPageShell>
      <DocsHeader
        category="Blocks / Lists"
        title="Team Grid"
        description="Card-grid of Halo-dash agents with role badge, status pill, and message-CTA. Use on the Team settings tab or as a tribe-leadership overview."
      />

      <DocsSection title="Install">
        <DocsCode language="bash" code={`dash add team-grid`} />
      </DocsSection>

      <DocsSection title="Preview">
        <DocsExample
          title="Halo-dash agents — 6"
          preview={
            <div className="w-full rounded-xl border border-stroke-soft-200 bg-bg-white-0 p-6">
              <TeamGrid />
            </div>
          }
          code={`<TeamGrid members={[/* TeamMember[] */]} />`}
        />
      </DocsSection>

      <DocsSection title="Composition">
        <ul className="text-sm text-text-sub-600 space-y-1.5 list-disc pl-5">
          <li>Each card: <code>Avatar</code> + name + role + email + status <code>Badge</code>.</li>
          <li>Footer — Message <code>Button</code> + overflow <code>IconButton</code>.</li>
          <li>Grid responsive: 1 mobile / 2 tablet / 3 desktop.</li>
          <li>Defaults render 6 Halo-dash agents (Sigit, Andi, Rina, Wei, Fayzul, …).</li>
        </ul>
      </DocsSection>

      <DocsSection title="When to use">
        <ul className="text-sm text-text-sub-600 space-y-1.5 list-disc pl-5">
          <li><strong>Use</strong> on Settings → Team tab.</li>
          <li><strong>Use</strong> for tribe-leadership directory pages.</li>
          <li><strong>Use</strong> when each member has a clear primary action (Message, Invite, Manage).</li>
          <li><strong>Don't</strong> use for queue-driven team views — reach for <code>HrDashboard</code> with SLA + load.</li>
          <li><strong>Don't</strong> use for &gt; 24 members — switch to a table.</li>
        </ul>
      </DocsSection>

      <DocsSection title="API">
        <DocsPropsTable
          rows={[
            { name: "members", type: "TeamMember[]", description: "{ id, name, role, email, status: 'online' | 'busy' | 'away' }." },
            { name: "className", type: "string", description: "Outer wrapper class." },
          ]}
        />
      </DocsSection>
    </DocsPageShell>
  )
}
