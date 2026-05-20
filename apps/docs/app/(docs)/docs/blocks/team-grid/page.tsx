"use client"

import { TeamGrid } from "@/registry/dash/blocks/team-grid"
import {
  DocsPageShell,
  DocsHeader,
  DocsSection,
  DocsExample,
  DocsPropsTable,
  DocsDoDont,
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
      <DocsSection title="Role badge on every card">
        <p className="text-sm text-text-sub-600 max-w-2xl">
          Each member card shows name + role. Role drives permission expectations — don't hide it behind a hover-only tooltip.
        </p>
        <DocsDoDont
          do={{
            preview: (
              <div className="grid grid-cols-3 gap-2 w-full max-w-md">
                <div className="rounded-lg border border-stroke-soft-200 bg-bg-white-0 p-3 text-center space-y-1"><div className="size-10 rounded-full bg-primary-alpha-16 mx-auto" /><p className="text-xs font-medium">Budi A.</p><p className="text-[10px] text-text-sub-600">Ops Lead</p><span className="inline-block rounded-full bg-feature-lighter text-feature-dark px-2 py-0.5 text-[9px]">Admin</span></div>
                <div className="rounded-lg border border-stroke-soft-200 bg-bg-white-0 p-3 text-center space-y-1"><div className="size-10 rounded-full bg-primary-alpha-16 mx-auto" /><p className="text-xs font-medium">Sari R.</p><p className="text-[10px] text-text-sub-600">Dispatcher</p><span className="inline-block rounded-full bg-information-lighter text-information-dark px-2 py-0.5 text-[9px]">Member</span></div>
                <div className="rounded-lg border border-stroke-soft-200 bg-bg-white-0 p-3 text-center space-y-1"><div className="size-10 rounded-full bg-primary-alpha-16 mx-auto" /><p className="text-xs font-medium">Tono S.</p><p className="text-[10px] text-text-sub-600">Mitra</p><span className="inline-block rounded-full bg-faded-lighter text-faded-dark px-2 py-0.5 text-[9px]">Viewer</span></div>
              </div>
            ),
            caption: "Every card surfaces role + permission tier. Admin/Member/Viewer is immediately scannable.",
          }}
          dont={{
            preview: (
              <div className="grid grid-cols-3 gap-2 w-full max-w-md">
                <div className="rounded-lg border border-stroke-soft-200 bg-bg-white-0 p-3 text-center space-y-1"><div className="size-10 rounded-full bg-primary-alpha-16 mx-auto" /><p className="text-xs font-medium">Budi A.</p></div>
                <div className="rounded-lg border border-stroke-soft-200 bg-bg-white-0 p-3 text-center space-y-1"><div className="size-10 rounded-full bg-primary-alpha-16 mx-auto" /><p className="text-xs font-medium">Sari R.</p></div>
                <div className="rounded-lg border border-stroke-soft-200 bg-bg-white-0 p-3 text-center space-y-1"><div className="size-10 rounded-full bg-primary-alpha-16 mx-auto" /><p className="text-xs font-medium">Tono S.</p></div>
              </div>
            ),
            caption: "Don't show only names. Reader can't tell who can dispatch, who can suspend mitra, who's a guest viewer.",
          }}
        />
      </DocsSection>

      <DocsSection title="Avatar fallback initials">
        <p className="text-sm text-text-sub-600 max-w-2xl">
          When mitra hasn't uploaded a photo, show colored initials over the Dash primary tint. Don't show a grey ghost silhouette.
        </p>
        <DocsDoDont
          do={{
            preview: (
              <div className="flex gap-3 items-center">
                <div className="size-12 rounded-full bg-primary-alpha-16 text-primary-dark font-semibold flex items-center justify-center text-sm">BA</div>
                <div className="size-12 rounded-full bg-feature-lighter text-feature-dark font-semibold flex items-center justify-center text-sm">SR</div>
                <div className="size-12 rounded-full bg-success-lighter text-success-dark font-semibold flex items-center justify-center text-sm">TS</div>
              </div>
            ),
            caption: "Colored initials with a tinted background distinguish members instantly and look intentional.",
          }}
          dont={{
            preview: (
              <div className="flex gap-3 items-center">
                <div className="size-12 rounded-full bg-bg-soft-200 text-text-soft-400 flex items-center justify-center text-lg">👤</div>
                <div className="size-12 rounded-full bg-bg-soft-200 text-text-soft-400 flex items-center justify-center text-lg">👤</div>
                <div className="size-12 rounded-full bg-bg-soft-200 text-text-soft-400 flex items-center justify-center text-lg">👤</div>
              </div>
            ),
            caption: "Don't use grey silhouettes. Three identical ghosts in a row look unfinished and members become indistinguishable.",
          }}
        />
      </DocsSection>
        </DocsPageShell>
  )
}
