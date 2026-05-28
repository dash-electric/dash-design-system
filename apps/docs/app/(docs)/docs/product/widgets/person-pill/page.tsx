"use client"

import * as React from "react"
import { RiCheckLine as Check } from "@remixicon/react"
import { Avatar, AvatarFallback, AvatarImage } from "@/registry/dash/ui/avatar"
import { cn } from "@/registry/dash/lib/utils"
import {
  DocsPageShell,
  DocsHeader,
  DocsSection,
  DocsExample,
  DocsPropsTable,
} from "@/components/docs/page-shell"

/**
 * Person Pill — Figma verified 2026-05-19 (Default / Hover / Selected states).
 *   3948:25318  Default  (avatar + name, 90×32)
 *   3948:25317  Hover    (weak fill, 90×32)
 *   3948:25373  Selected (weak fill + success check trailing, 108×32)
 *
 * "active" prop value = Figma "Selected" state.
 */
export default function PersonPillWidgetPage() {
  return (
    <DocsPageShell>
      <DocsHeader
        category="Product Components / Widgets"
        title="Person Pill"
        description="Compact assignee chip — avatar + name + optional success check. Used in task rows, notes, and quick-pick assignee menus."
      />

      <DocsSection title="3 states">
        <DocsExample
          title="Default · Hover · Active"
          preview={
            <div className="flex items-center gap-3">
              <PersonPill name="Natalia" state="default" />
              <PersonPill name="Natalia" state="hover" />
              <PersonPill name="Natalia" state="active" />
            </div>
          }
          code={`<PersonPill name="Natalia" state="default" />
<PersonPill name="Natalia" state="hover" />
<PersonPill name="Natalia" state="active" />`}
        />
      </DocsSection>

      <DocsSection title="With image avatar">
        <DocsExample
          title="Live avatar"
          preview={
            <div className="flex items-center gap-3">
              <PersonPill name="Arthur" state="default" src="https://i.pravatar.cc/40?u=arthur" />
              <PersonPill name="Lena" state="hover" src="https://i.pravatar.cc/40?u=lena" />
              <PersonPill name="Sofia" state="active" src="https://i.pravatar.cc/40?u=sofia" />
            </div>
          }
          code={`<PersonPill name="Arthur" src="https://..." state="active" />`}
        />
      </DocsSection>

      <DocsSection title="API">
        <DocsPropsTable
          rows={[
            { name: "name", type: "string", description: "Assignee display name. First letter falls back when no image." },
            { name: "state", type: '"default" | "hover" | "active"', description: "Active shows a success check trailing." },
            { name: "src", type: "string", description: "Optional avatar image url." },
          ]}
        />
      </DocsSection>

      <DocsSection title="Anatomy">
        <ul className="space-y-2 text-sm text-text-strong-950/90 list-disc pl-6">
          <li>Pill height 28px (7 × 4px grid).</li>
          <li>Avatar xs (20px) at leading edge, 4px gap to label.</li>
          <li>Active state: success-base 14px circle with white check at trailing edge.</li>
        </ul>
      </DocsSection>
    </DocsPageShell>
  )
}

function PersonPill({
  name,
  state = "default",
  src,
}: {
  name: string
  state?: "default" | "hover" | "active"
  src?: string
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border h-7 pl-1 pr-2.5 text-sm",
        state === "default" && "border-stroke-soft-200 bg-bg-white-0",
        state === "hover" && "border-stroke-soft-200 bg-bg-weak-50",
        state === "active" && "border-stroke-soft-200 bg-bg-weak-50",
      )}
    >
      <Avatar size="xs">
        {src ? <AvatarImage src={src} /> : null}
        <AvatarFallback>{name[0]}</AvatarFallback>
      </Avatar>
      <span>{name}</span>
      {state === "active" ? (
        <span className="inline-flex size-3.5 items-center justify-center rounded-full bg-success-base text-white">
          <Check className="size-2" />
        </span>
      ) : null}
    </span>
  )
}
