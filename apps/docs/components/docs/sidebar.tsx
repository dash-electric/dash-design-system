"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/registry/dash/lib/utils"
import { navSections } from "./nav-config"

// StatusDot removed — sidebar is a clean list; status stays in nav-config
// metadata but is not visualised inline. Re-introduce only if a status
// indicator becomes load-bearing (e.g. deprecated callouts on hover).

export function DocsSidebar() {
  const pathname = usePathname()

  return (
    <aside
      aria-label="Docs navigation"
      className="hidden lg:block w-64 shrink-0 border-r border-border h-[calc(100vh-3.5rem)] sticky top-14 overflow-y-auto"
    >
      <nav aria-label="Documentation sections" className="px-4 py-6 space-y-7">
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
