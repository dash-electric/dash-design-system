"use client"

import {
  DocsPageShell,
  DocsHeader,
  DocsSection,
} from "@/components/docs/page-shell"

type ChangelogEntry = {
  version: string
  date: string
  summary: string
  groups: Array<{
    kind: "Added" | "Changed" | "Fixed" | "Deprecated"
    items: string[]
  }>
}

const entries: ChangelogEntry[] = [
  {
    version: "1.0.0",
    date: "2026-05-16",
    summary: "Polish Phase 2 — 19 missing docs routes shipped, full shadcn-style parity.",
    groups: [
      {
        kind: "Added",
        items: [
          "Getting Started: /docs/installation (rewrite), /docs/installation/cli, /docs/quick-start, /docs/changelog.",
          "Foundations: /docs/foundations/dark-mode completed.",
          "Forms: /docs/forms/react-hook-form, /docs/forms/tanstack-form.",
          "Theming: /docs/theming overview, /docs/theming/colors swatch reference.",
          "Registry: /docs/registry intro, /docs/registry/registry-json, /docs/registry/registry-item-json, /docs/registry/authentication, /docs/registry/examples.",
          "Tools: /docs/tools/mcp (WIP placeholder), /docs/tools/skill (WIP placeholder).",
          "Resources: /docs/resources/tokens full reference completed.",
        ],
      },
      {
        kind: "Changed",
        items: [
          "Sidebar nav: 19 status flips planned/wip → shipped; new top-level Theming + Registry sections; Forms group nested under Components.",
        ],
      },
    ],
  },
  {
    version: "1.0.0-rc.5",
    date: "2026-05-15",
    summary: "Polish Phase 1 — TOC + prev/next + Shiki + Copy Page + distinctive landing.",
    groups: [
      {
        kind: "Added",
        items: [
          "DocsPageShell renders auto prev/next nav from nav-config.",
          "DocsOnThisPage table-of-contents in right sidebar (lg+ only).",
          "Shiki syntax highlighting via github-dark theme, with graceful plain-mono fallback.",
          "Copy Page button in every DocsHeader, copies the URL to clipboard.",
          "Distinctive landing page hero with brand purple gradient + animated swatch grid.",
        ],
      },
      { kind: "Fixed", items: ["Anchor offset for sticky topbar — scroll-mt-20 on every h2."] },
    ],
  },
  {
    version: "1.0.0-rc.4",
    date: "2026-05-12",
    summary: "Batch 13 — Templates + Dash-custom completion.",
    groups: [
      {
        kind: "Added",
        items: [
          "Templates: dashboard-shell, list-detail-page, settings-tabs-page, form-stepper-page, auth-shell, finance-dashboard, hr-dashboard, marketing-dashboard.",
          "Dash custom templates: mitra-suspend-page, halo-dash-3pane, phase7-results.",
        ],
      },
    ],
  },
  {
    version: "1.0.0-rc.3",
    date: "2026-05-09",
    summary: "Batch 9-12 — Overlays + Navigation + Layout + Blocks completion.",
    groups: [
      {
        kind: "Added",
        items: [
          "Overlays: alert-dialog, command, context-menu, modal, drawer, dropdown-menu, menubar, popover, sheet.",
          "Navigation: breadcrumb, navigation-menu, pagination, sidebar, step-indicator, dot-stepper, tabs.",
          "Layout: accordion, aspect-ratio, collapsible, resizable, scroll-area, divider.",
          "Blocks: login-01..03, signup-01..03, forgot-password-01, verification-otp, transactions-table, orders-table, team-grid, products-grid, stat-card-grid, empty-state-collection, analytics-grid, activity-timeline, my-cards-stack, settings-{profile,notifications,integrations,team,privacy-security}.",
        ],
      },
    ],
  },
  {
    version: "1.0.0-rc.2",
    date: "2026-05-07",
    summary: "Batch 4-8 — Form + Feedback + Utils.",
    groups: [
      {
        kind: "Added",
        items: [
          "Form: checkbox, color-picker, date-picker, field, hint, file-upload, form, input, input-otp, label, radio, select, slider, switch, textarea, combobox, rating, filter, time-picker, rich-editor.",
          "Feedback: alert, progress, spinner, progress-circle.",
          "Utils: cn, use-mobile, use-debounce.",
        ],
      },
    ],
  },
  {
    version: "1.0.0-rc.1",
    date: "2026-05-05",
    summary: "Batch 1-3 — Foundations + Actions + Data Display.",
    groups: [
      {
        kind: "Added",
        items: [
          "Foundations: color, typography, icons, grid, shadows, corner-radius, motion.",
          "Actions: button, button-group, icon-button, link-button, toggle, toggle-group, segmented-control, social-button, fancy-button.",
          "Displaying data: activity-feed, avatar, badge, banner, card, data-table, carousel, chart, empty-state, skeleton, stat, kbd, table, notification-feed, tag, tooltip, hover-card.",
          "Tools: dash CLI v0.1.0, AI rules markdown bundle.",
        ],
      },
    ],
  },
  {
    version: "0.0.1",
    date: "2026-05-07",
    summary: "Day 1 Phase 0 — repo scaffold, source design system source import, custom registry namespace decision.",
    groups: [
      {
        kind: "Added",
        items: [
          "Repo bootstrap, components.json, registry.json with @dash namespace.",
          "Tailwind v4 @theme inline token system from source design Figma.",
        ],
      },
    ],
  },
]

const kindStyle: Record<ChangelogEntry["groups"][number]["kind"], string> = {
  Added:      "text-state-success-dark",
  Changed:    "text-state-information-dark",
  Fixed:      "text-state-warning-dark",
  Deprecated: "text-state-error-dark",
}

export default function ChangelogPage() {
  return (
    <DocsPageShell>
      <DocsHeader
        category="Getting Started"
        title="Changelog"
        description="Every shipped batch since Day 1 of Dash Design System. Latest at top. Links point to GitHub commits once the repo is public."
      />

      {entries.map((e) => (
        <DocsSection
          key={e.version}
          id={`v${e.version.replace(/\./g, "-")}`}
          title={
            <span className="flex items-baseline gap-3 flex-wrap">
              <span className="text-base">{e.version}</span>
              <span className="text-xs text-text-soft-400 uppercase tracking-wider">{e.date}</span>
            </span>
          }
          description={e.summary}
        >
          <div className="space-y-4">
            {e.groups.map((g) => (
              <div key={g.kind}>
                <div className={`text-xs uppercase tracking-wider mb-1.5 ${kindStyle[g.kind]}`}>
                  {g.kind}
                </div>
                <ul className="text-sm text-text-sub-600 list-disc pl-5 space-y-1">
                  {g.items.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </DocsSection>
      ))}
    </DocsPageShell>
  )
}
