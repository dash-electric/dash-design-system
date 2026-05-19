import Link from "next/link"
import { RiLoginBoxLine as LogIn, RiUserAddLine as UserPlus, RiKey2Line as KeyRound, RiShieldCheckLine as ShieldCheck, RiTableLine as Table2, RiTeamLine as UsersIcon, RiDashboardLine as LayoutDashboard, RiSettings3Line as Settings } from "@remixicon/react"
import {
  DocsPageShell,
  DocsHeader,
} from "@/components/docs/page-shell"
import { blockInventory } from "@/components/docs/nav-config"

export const metadata = {
  title: "Blocks — Dash Design System",
  description: "Production-ready composed sections — auth flows, tables, dashboards, settings.",
}

const GROUP_META: Record<string, { icon: React.ReactNode; blurb: string }> = {
  Login: {
    icon: <LogIn strokeWidth={1.5} />,
    blurb: "Sign-in patterns for returning users. Pick by SSO density.",
  },
  Register: {
    icon: <UserPlus strokeWidth={1.5} />,
    blurb: "New account creation flows. Pick by field count.",
  },
  "Reset Password": {
    icon: <KeyRound strokeWidth={1.5} />,
    blurb: "Password recovery via email or support contact.",
  },
  Verification: {
    icon: <ShieldCheck strokeWidth={1.5} />,
    blurb: "OTP / code entry after sign-up, SSO, or MFA challenge.",
  },
  Tables: {
    icon: <Table2 strokeWidth={1.5} />,
    blurb: "Data tables wired with header actions, filters, status badges.",
  },
  Lists: {
    icon: <UsersIcon strokeWidth={1.5} />,
    blurb: "Card-grid views for team rosters and product catalogs.",
  },
  Dashboard: {
    icon: <LayoutDashboard strokeWidth={1.5} />,
    blurb: "KPI strips, analytics grids, timelines, empty states.",
  },
  Settings: {
    icon: <Settings strokeWidth={1.5} />,
    blurb: "Per-section settings blocks — profile, notifications, team, security.",
  },
}

const totalCount = blockInventory.groups.reduce(
  (acc, g) => acc + g.items.length,
  0,
)

export default function BlocksOverviewPage() {
  return (
    <DocsPageShell className="max-w-6xl">
      <DocsHeader
        category="Build / Blocks"
        title="Blocks"
        description={`${totalCount} composed sections — pre-arranged Dash primitives ready to paste into a page. Pick by intent.`}
      />

      <div className="space-y-14">
        {blockInventory.groups.map((group) => {
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

              <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
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
                        {item.status === "wip" ? (
                          <span className="shrink-0 text-[9px] uppercase tracking-wider text-text-soft-400 rounded border border-stroke-soft-200 px-1 py-0.5">
                            legacy
                          </span>
                        ) : null}
                        <span
                          aria-hidden
                          className="ml-auto text-text-soft-400 group-hover:text-(--dash-purple-500) transition-colors text-sm leading-none"
                        >
                          →
                        </span>
                      </div>
                      <div className="text-[11px] text-text-soft-400 mt-1 truncate">
                        {item.href.replace("/docs/blocks/", "@dash/blocks/")}
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
