import Link from "next/link"
import {
  RiCompassLine as Compass,
  RiLayoutTopLine as HeaderIcon,
  RiDashboardLine as Dashboard,
} from "@remixicon/react"
import { DocsPageShell, DocsHeader } from "@/components/docs/page-shell"

export const metadata = {
  title: "Product Components — Dash Design System",
  description:
    "Dash-specific product UI — navigation patterns, app header variants, and 70+ data widgets organized by domain (HR, Finance, Marketing).",
}

type Card = {
  title: string
  href: string
  blurb: string
  icon: React.ReactNode
}

const ITEMS: Card[] = [
  {
    title: "Navigation",
    href: "/docs/product/navigation",
    blurb: "App shell navigation patterns — sidebars, rails, and route hierarchies.",
    icon: <Compass strokeWidth={1.5} />,
  },
  {
    title: "Header",
    href: "/docs/product/header",
    blurb: "Top-bar variants with search, profile menu, notifications, and theme toggle.",
    icon: <HeaderIcon strokeWidth={1.5} />,
  },
  {
    title: "Widgets",
    href: "/docs/product/widgets",
    blurb: "70+ data widgets organized by domain — HR, Finance, and Marketing.",
    icon: <Dashboard strokeWidth={1.5} />,
  },
]

export default function ProductOverviewPage() {
  return (
    <DocsPageShell className="max-w-6xl">
      <DocsHeader
        category="Product"
        title="Product Components"
        description="Dash-specific product UI — navigation patterns, app header variants, and 70+ data widgets organized by domain (HR, Finance, Marketing)."
      />

      <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {ITEMS.map((item) => (
          <li key={item.href}>
            <Link
              href={item.href}
              className="group block h-full rounded-xl border border-stroke-soft-200 bg-bg-white-0 px-5 py-4 transition-[border-color,box-shadow,transform] duration-150 ease-out hover:border-(--dash-purple-300) hover:shadow-custom-xs"
            >
              <div className="flex items-center gap-3">
                <div className="size-9 rounded-lg flex items-center justify-center bg-bg-weak-50 text-text-sub-600 [&_svg]:size-4 shrink-0 group-hover:text-(--dash-purple-600) transition-colors">
                  {item.icon}
                </div>
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
              <p className="text-[12px] text-text-sub-600 leading-snug mt-2">
                {item.blurb}
              </p>
            </Link>
          </li>
        ))}
      </ul>
    </DocsPageShell>
  )
}
