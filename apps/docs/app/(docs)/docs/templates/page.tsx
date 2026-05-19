import Link from "next/link"
import { RiLayoutLine as LayoutTemplate, RiBarChartLine as BarChart3, RiBuilding2Line as Building2 } from "@remixicon/react"
import {
  DocsPageShell,
  DocsHeader,
} from "@/components/docs/page-shell"
import { templateInventory } from "@/components/docs/nav-config"

export const metadata = {
  title: "Templates — Dash Design System",
  description: "Page-level shells — dashboard, list-detail, settings, auth, plus Dash-specific Halo-dash and Phase7 layouts.",
}

const GROUP_META: Record<string, { icon: React.ReactNode; blurb: string }> = {
  Generic: {
    icon: <LayoutTemplate strokeWidth={1.5} />,
    blurb: "Reusable page shells — dashboard, list-detail, settings tabs, form stepper, auth.",
  },
  "Vertical Dashboards": {
    icon: <BarChart3 strokeWidth={1.5} />,
    blurb: "Domain-shaped dashboards — finance, HR, marketing variants.",
  },
  "Dash Custom": {
    icon: <Building2 strokeWidth={1.5} />,
    blurb: "Dash-specific patterns — mitra suspend, Halo-dash 3-pane, Phase7 results.",
  },
}

const totalCount = templateInventory.groups.reduce(
  (acc, g) => acc + g.items.length,
  0,
)

export default function TemplatesOverviewPage() {
  return (
    <DocsPageShell className="max-w-6xl">
      <DocsHeader
        category="Build / Templates"
        title="Templates"
        description={`${totalCount} page templates — full-page shells you can drop into a Next.js app/route. Generic, verticalized, and Dash-specific.`}
      />

      <div className="space-y-14">
        {templateInventory.groups.map((group) => {
          const meta = GROUP_META[group.title]
          return (
            <section key={group.title} className="space-y-5">
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
                      {group.items.length} {group.items.length === 1 ? "item" : "items"}
                    </span>
                  </div>
                  {meta?.blurb ? (
                    <p className="text-sm text-text-sub-600 leading-relaxed mt-0.5">
                      {meta.blurb}
                    </p>
                  ) : null}
                </div>
              </div>

              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {group.items.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className="group block h-full rounded-xl border border-stroke-soft-200 bg-bg-white-0 px-4 py-3.5 transition-[border-color,box-shadow] duration-150 ease-out hover:border-(--dash-purple-300) hover:shadow-custom-xs"
                    >
                      <div className="flex items-baseline gap-2">
                        <span className="font-medium text-sm text-text-strong-950 tracking-tight truncate">
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
                        {item.href.replace("/docs/templates/", "@dash/templates/")}
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
