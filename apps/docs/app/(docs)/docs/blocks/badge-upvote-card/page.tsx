"use client"

import { BadgeUpvoteCard } from "@/registry/dash/blocks/badge-upvote-card"
import {
  DocsPageShell,
  DocsHeader,
  DocsSection,
  DocsExample,
  DocsPropsTable,
} from "@/components/docs/page-shell"
import { DocsCode } from "@/components/docs/code-block"

export default function BadgeUpvoteCardDocsPage() {
  return (
    <DocsPageShell>
      <DocsHeader
        category="Blocks / Composition Examples"
        title="Badge — Top Contributor Card"
        description="Composition example: top-contributor leaderboard card stacking Avatar + Badge + Button. Demonstrates upvote interaction pattern."
      />

      <DocsSection title="Install">
        <DocsCode language="bash" code={`dash add badge-upvote-card`} />
      </DocsSection>

      <DocsSection title="Examples">
        <DocsExample
          title="Week's Top Contributor"
          description="Default 3-contributor list with rank badges and upvote action."
          preview={
            <div className="w-full max-w-md rounded-xl border border-stroke-soft-200 bg-bg-white-0 p-6">
              <BadgeUpvoteCard />
            </div>
          }
          code={`<BadgeUpvoteCard
  title="Week's Top Contributor"
  contributors={[/* Contributor[] */]}
  onUpvote={(id) => {}}
/>`}
        />
      </DocsSection>

      <DocsSection title="Composition">
        <ul className="text-sm text-text-sub-600 space-y-1.5 list-disc pl-6">
          <li><code>Card</code> wrapper + heading.</li>
          <li>Per row: rank <code>Badge</code> + <code>Avatar</code> + name + upvote <code>Button</code>.</li>
        </ul>
      </DocsSection>

      <DocsSection title="API">
        <DocsPropsTable
          rows={[
            { name: "title", type: "string", defaultValue: '"Week\'s Top Contributor"', description: "Card heading." },
            { name: "contributors", type: "Contributor[]", description: "{ id, name, avatarSrc?, upvotes, rank }." },
            { name: "onUpvote", type: "(id: string) => void", description: "Fired when a contributor row is upvoted." },
            { name: "className", type: "string", description: "Outer wrapper class." },
          ]}
        />
      </DocsSection>
    </DocsPageShell>
  )
}
