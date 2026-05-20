"use client"

import Link from "next/link"
import {
  DocsPageShell,
  DocsHeader,
  DocsSection,
  DocsPrinciples,
} from "@/components/docs/page-shell"
import { DocsCode } from "@/components/docs/code-block"

const quickLinks = [
  {
    title: "Installation",
    href: "/docs/installation",
    description: "Wire the @dash registry into your project (Next.js, Vite, Remix, Astro). 5 minutes.",
  },
  {
    title: "Quick Start",
    href: "/docs/quick-start",
    description: "User onboarding — one-time setup, daily AI-first workflow, brand audit loop.",
  },
  {
    title: "Theming",
    href: "/docs/theming",
    description: "4-tier semantic tokens on top of 11 raw scales. Rebrand the entire app in one line.",
  },
  {
    title: "Dark Mode",
    href: "/docs/foundations/dark-mode",
    description: "Single .dark class on <html> flips every token. No dark: variants in component code.",
  },
  {
    title: "Components",
    href: "/docs/components",
    description: "92 primitives — buttons, inputs, overlays, navigation, charts, feedback.",
  },
  {
    title: "Templates",
    href: "/docs/templates",
    description: "Page-level shells — generic, Finance, HR, Marketing, Dash Portal v2.",
  },
]

export default function IntroductionPage() {
  return (
    <DocsPageShell>
      <DocsHeader
        category="Getting Started"
        title="Introduction"
        description="Dash Design System is the internal UI library and registry powering every Dash product surface. Install components by name with the dash CLI, get production source code into your repo, and ship features faster with brand-consistent output."
      />

      <DocsSection
        title="Pillars"
        description="The five principles that shape every decision in Dash DS — adapted from shadcn/ui's open-code philosophy, sharpened for an internal 10-person team that vibe-codes with AI."
      >
        <DocsPrinciples
          items={[
            {
              title: "Open code",
              body: "No black-box library. The CLI copies real source into your project. You own and edit it — no version bumps, no peer-dep hell.",
            },
            {
              title: "Composition",
              body: "Every component shares a consistent, composable interface. Predictable to use, predictable to extend, predictable for the AI to compose.",
            },
            {
              title: "Distribution",
              body: "A flat-file registry schema plus the dash CLI. One command pulls source, npm deps, and CSS tokens into your repo.",
            },
            {
              title: "Brand-first defaults",
              body: "Tokens extracted directly from the source design Figma. Light + dark, semantic + extension scales — your output looks like Dash without any work.",
            },
            {
              title: "AI-native",
              body: "AGENTS.md, MCP server, and Skill ship in the box. Claude / Cursor / Codex know the registry, pick the right component, install it — you review the diff.",
            },
          ]}
        />
      </DocsSection>

      <DocsSection
        title="Why Dash DS exists"
        description="The math behind the system — what happens when 10 team members ship in parallel without it."
      >
        <p className="text-base text-text-sub-600 leading-relaxed mb-3">
          Ten Product Engineers across Reservasi, Express, Eats, Halo, Mitra, Finance, HR, Marketing, Growth,
          and Platform run AI-assisted vibe coding in parallel. Without a shared component layer each branch
          reinvents Buttons, Inputs, and Cards from scratch — brand drifts, ship time stretches to 2–3 days
          per feature, token spend compounds.
        </p>
        <p className="text-base text-text-sub-600 leading-relaxed">
          Dash DS solves this with a private registry that delivers source code straight into your repo via
          the{" "}
          <code className="text-xs px-1 py-0.5 rounded bg-bg-weak-50 border border-stroke-soft-200">dash</code>{" "}
          CLI. Every component, block, and page template ships with anatomy guarantees, semantic theming,
          and AI rules — so the output stays consistent across every PR.
        </p>
      </DocsSection>

      <DocsSection
        title="Architecture at a glance"
        description="Figma → registry → ds.dash.com → your repo. One pipeline, four steps, fully observable."
      >
        <div className="rounded-xl border border-stroke-soft-200 bg-bg-weak-50 p-6 text-xs leading-relaxed text-text-sub-600 whitespace-pre overflow-x-auto font-mono">
{`┌────────────────────────────────────────────────────────┐
│  Figma  ▶  Dash DS repo  ▶  ds.dash.com  ▶  Your repo  │
│                                                        │
│  source design system                                  │
│  Figma file ──▶ Figma MCP ──▶ registry/dash/*.tsx      │
│                                  │                     │
│                                  ▼                     │
│                            registry.json               │
│                                  │                     │
│                                  ▼                     │
│                       dash build ──▶ public/r/*.json   │
│                                            │           │
│                                            ▼           │
│                            ds.dash.com (Vercel + auth) │
│                                            │           │
│                                            ▼           │
│                            dash add button             │
│                                            │           │
│                                            ▼           │
│                  components/ui/button.tsx in your repo │
└────────────────────────────────────────────────────────┘`}
        </div>
      </DocsSection>

      <DocsSection
        title="Your first install"
        description="One command from a fresh Next.js repo to a wired Dash project. Full detail on the Installation page."
      >
        <DocsCode
          language="bash"
          code={`pnpm dlx dash@latest init --token sk-dash-xxxx
pnpm dlx dash add button card dashboard-shell`}
        />
        <p className="text-sm text-text-sub-600 mt-3">
          See <Link className="text-(--dash-purple-600) underline-offset-4 hover:underline" href="/docs/installation">Installation</Link>{" "}
          for the full setup (components.json, base theme, bearer auth) and{" "}
          <Link className="text-(--dash-purple-600) underline-offset-4 hover:underline" href="/docs/quick-start">Quick Start</Link>{" "}
          for the day-1 user workflow.
        </p>
      </DocsSection>

      <DocsSection
        title="Quick links"
        description="Common destinations — pick where you want to go next."
      >
        <div className="grid sm:grid-cols-2 gap-3">
          {quickLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="group rounded-xl border border-stroke-soft-200 bg-bg-white-0 p-5 transition-colors hover:border-(--dash-purple-300) hover:bg-(--dash-purple-50)/30"
            >
              <div className="flex items-baseline justify-between mb-1.5">
                <h3 className="font-semibold text-text-strong-950 group-hover:text-(--dash-purple-700) transition-colors">
                  {link.title}
                </h3>
                <span
                  aria-hidden
                  className="text-text-soft-400 group-hover:text-(--dash-purple-600) transition-colors"
                >
                  →
                </span>
              </div>
              <p className="text-sm text-text-sub-600 leading-relaxed">
                {link.description}
              </p>
            </Link>
          ))}
        </div>
      </DocsSection>
    </DocsPageShell>
  )
}
