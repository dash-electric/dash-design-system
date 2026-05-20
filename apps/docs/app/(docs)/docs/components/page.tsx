import Link from "next/link"
import { RiCursorLine as MousePointerClick, RiLayoutGridLine as LayoutGrid, RiNotification3Line as Bell, RiText as Type, RiLayoutLeftLine as PanelsTopLeft, RiCompassLine as Compass, RiStackLine as Layers, RiToolsLine as Wrench } from "@remixicon/react"
import {
  DocsPageShell,
  DocsHeader,
} from "@/components/docs/page-shell"
import { componentInventory } from "@/components/docs/nav-config"

export const metadata = {
  title: "Components — Dash Design System",
  description: "92 primitives + hooks. Buttons, inputs, overlays, navigation, feedback. Each ports cleanly via dash CLI.",
}

const GROUP_META: Record<string, { icon: React.ReactNode; blurb: string }> = {
  Actions: {
    icon: <MousePointerClick strokeWidth={1.5} />,
    blurb: "Triggers user input — buttons, toggles, segmented controls, social SSO.",
  },
  "Displaying Data": {
    icon: <LayoutGrid strokeWidth={1.5} />,
    blurb: "Read-only surfaces — avatars, badges, cards, tables, charts, status indicators.",
  },
  Feedback: {
    icon: <Bell strokeWidth={1.5} />,
    blurb: "System-to-user signals — alerts, progress, spinners, toasts.",
  },
  Form: {
    icon: <Type strokeWidth={1.5} />,
    blurb: "Inputs for user data — text, password, OTP, date, color, file, select, combobox.",
  },
  Layout: {
    icon: <PanelsTopLeft strokeWidth={1.5} />,
    blurb: "Structural primitives — accordion, collapsible, resizable, scroll area, divider.",
  },
  Navigation: {
    icon: <Compass strokeWidth={1.5} />,
    blurb: "Move between screens — breadcrumb, sidebar, tabs, steppers, pagination.",
  },
  Overlays: {
    icon: <Layers strokeWidth={1.5} />,
    blurb: "Float above content — modal, drawer, popover, command, context menu, sheet.",
  },
  Utils: {
    icon: <Wrench strokeWidth={1.5} />,
    blurb: "Helpers — cn class merge, useMobile, useDebounce.",
  },
}

const totalCount = componentInventory.groups.reduce(
  (acc, g) => acc + g.items.length,
  0,
)

export default function ComponentsOverviewPage() {
  return (
    <DocsPageShell className="max-w-6xl">
      <DocsHeader
        category="Build / Components"
        title="Components"
        description={`${totalCount} primitives + utility hooks, themed via Dash semantic tokens. Each installable via `}
      />

      <div className="space-y-14">
        {componentInventory.groups.map((group) => {
          const meta = GROUP_META[group.title]
          return (
            <section key={group.title} className="space-y-5">
              {/* Group header */}
              <div className="flex items-start gap-3">
                {meta?.icon ? (
                  <div className="size-9 rounded-lg flex items-center justify-center bg-bg-weak-50 text-text-sub-600 [&_svg]:size-4 shrink-0">
                    {meta.icon}
                  </div>
                ) : null}
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline justify-between gap-3">
                    <h2 className="text-base font-semibold tracking-tight text-text-strong-950">
                      {group.title}
                    </h2>
                    <span className="text-[10px] uppercase tracking-[0.18em] text-text-soft-400">
                      {group.items.length}{" "}
                      {group.items.length === 1 ? "item" : "items"}
                    </span>
                  </div>
                  {meta?.blurb ? (
                    <p className="text-sm text-text-sub-600 leading-relaxed mt-0.5">
                      {meta.blurb}
                    </p>
                  ) : null}
                </div>
              </div>

              {/* Card grid */}
              <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {group.items.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className="group block h-full rounded-xl border border-stroke-soft-200 bg-bg-white-0 px-4 py-3.5 transition-[border-color,box-shadow,transform] duration-150 ease-out hover:border-(--dash-purple-300) hover:shadow-custom-xs"
                    >
                      <div className="flex items-baseline gap-2">
                        <span className="font-medium text-sm text-text-strong-950 tracking-tight">
                          {item.title}
                        </span>
                        <span
                          aria-hidden
                          className="ml-auto text-text-soft-400 group-hover:text-(--dash-purple-500) transition-colors text-sm leading-none"
                        >
                          →
                        </span>
                      </div>
                      <div className="text-[11px] text-text-soft-400 mt-1 truncate">
                        {item.href.replace("/docs/components/", "@dash/")}
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )
        })}
      </div>
    </DocsPageShell>
  )
}
