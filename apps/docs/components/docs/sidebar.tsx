"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/registry/dash/lib/utils"
import { navSections, type NavItem } from "./nav-config"

function StatusDot({ status }: { status?: NavItem["status"] }) {
  if (!status || status === "shipped") return null
  return (
    <span
      className={cn(
        "ml-auto inline-flex items-center justify-center text-[10px] font-medium px-1.5 py-0.5 rounded uppercase tracking-wider",
        status === "wip" && "bg-(--dash-yellow-100) text-(--dash-yellow-800) dark:bg-(--dash-yellow-900) dark:text-(--dash-yellow-200)",
        status === "planned" && "bg-muted text-muted-foreground",
      )}
    >
      {status === "wip" ? "WIP" : "Soon"}
    </span>
  )
}

export function DocsSidebar() {
  const pathname = usePathname()

  return (
    <aside className="hidden lg:block w-64 shrink-0 border-r border-border h-[calc(100vh-3.5rem)] sticky top-14 overflow-y-auto">
      <nav className="px-4 py-6 space-y-7">
        {navSections.map((section) => (
          <div key={section.title}>
            <h4 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-2 px-2">
              {section.title}
            </h4>
            <div className="space-y-4">
              {section.groups.map((group, gi) => (
                <div key={gi}>
                  {group.title ? (
                    <div className="text-xs font-medium text-foreground/70 mb-1 px-2">
                      {group.title}
                    </div>
                  ) : null}
                  <ul className="space-y-0.5">
                    {group.items.map((item) => {
                      const active = pathname === item.href
                      return (
                        <li key={item.href}>
                          <Link
                            href={item.href}
                            className={cn(
                              "flex items-center gap-2 px-2.5 py-1.5 rounded-md text-sm",
                              "transition-[background-color,color,box-shadow] duration-150 ease-out",
                              "border-l-2 -ml-px",
                              active
                                ? "border-(--dash-purple-500) bg-bg-weak-50 text-text-strong-950 font-medium"
                                : "border-transparent text-text-sub-600 hover:text-text-strong-950 hover:bg-bg-weak-50/60",
                            )}
                          >
                            <span className="truncate">{item.title}</span>
                            <StatusDot status={item.status} />
                          </Link>
                        </li>
                      )
                    })}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        ))}
      </nav>
    </aside>
  )
}
