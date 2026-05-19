import Link from "next/link"
import {
  RiPaletteLine as Palette,
  RiText as Type,
  RiCompassLine as Compass,
  RiLayoutGridLine as LayoutGrid,
  RiShadowLine as ShadowIcon,
  RiCheckboxBlankCircleLine as Radius,
  RiPlayCircleLine as Motion,
  RiMoonLine as Moon,
  RiStarLine as Star,
} from "@remixicon/react"
import { DocsPageShell, DocsHeader } from "@/components/docs/page-shell"

export const metadata = {
  title: "Foundations — Dash Design System",
  description:
    "Design tokens and brand assets. Color, typography, icons, grid, shadows, corner radius, motion, dark mode, and Dash brand.",
}

type Card = {
  title: string
  href: string
  blurb: string
  icon?: React.ReactNode
}

type Group = {
  title: string
  description: string
  icon: React.ReactNode
  items: Card[]
}

const GROUPS: Group[] = [
  {
    title: "Design Tokens",
    description:
      "The atomic primitives every component reads from — color, type, spacing, depth, shape, motion.",
    icon: <Palette strokeWidth={1.5} />,
    items: [
      {
        title: "Color",
        href: "/docs/foundations/color",
        blurb: "Semantic and brand color tokens, ramps, and usage guidance.",
        icon: <Palette strokeWidth={1.5} />,
      },
      {
        title: "Typography",
        href: "/docs/foundations/typography",
        blurb: "Type scale, weights, and text role tokens.",
        icon: <Type strokeWidth={1.5} />,
      },
      {
        title: "Icons",
        href: "/docs/foundations/icons",
        blurb: "Remix Icon set, sizing, and stroke conventions.",
        icon: <Compass strokeWidth={1.5} />,
      },
      {
        title: "Grid",
        href: "/docs/foundations/grid",
        blurb: "Layout grid, columns, and responsive breakpoints.",
        icon: <LayoutGrid strokeWidth={1.5} />,
      },
      {
        title: "Shadows",
        href: "/docs/foundations/shadows",
        blurb: "Elevation tokens for depth, focus rings, and overlays.",
        icon: <ShadowIcon strokeWidth={1.5} />,
      },
      {
        title: "Corner Radius",
        href: "/docs/foundations/corner-radius",
        blurb: "Border-radius scale from sharp to fully rounded.",
        icon: <Radius strokeWidth={1.5} />,
      },
      {
        title: "Motion",
        href: "/docs/foundations/motion",
        blurb: "Easing curves, duration tokens, and animation principles.",
        icon: <Motion strokeWidth={1.5} />,
      },
      {
        title: "Dark Mode",
        href: "/docs/foundations/dark-mode",
        blurb: "Theme switching and dark-mode token mapping.",
        icon: <Moon strokeWidth={1.5} />,
      },
    ],
  },
  {
    title: "Brand",
    description:
      "Dash brand assets and downloadable resources for product, marketing, and partner surfaces.",
    icon: <Star strokeWidth={1.5} />,
    items: [
      {
        title: "Dash Logo",
        href: "/docs/foundations/dash-logo",
        blurb: "Primary wordmark and mark — clear-space and color variants.",
      },
      {
        title: "Brand Assets",
        href: "/docs/foundations/brand-assets",
        blurb: "Downloadable logos, wallpapers, and partner kits.",
      },
      {
        title: "App Store Badges",
        href: "/docs/foundations/app-store-badges",
        blurb: "Apple App Store and Google Play badges in every locale.",
      },
      {
        title: "Country Flags",
        href: "/docs/foundations/country-flags",
        blurb: "ISO country flag set, square and rectangle aspect ratios.",
      },
      {
        title: "Emojis",
        href: "/docs/foundations/emojis",
        blurb: "Curated emoji set with consistent rendering across platforms.",
      },
      {
        title: "Cursors",
        href: "/docs/foundations/cursors",
        blurb: "Custom cursor assets for interactive demos and products.",
      },
    ],
  },
]

export default function FoundationsOverviewPage() {
  return (
    <DocsPageShell className="max-w-6xl">
      <DocsHeader
        category="Foundations"
        title="Foundations"
        description="Design tokens and brand assets that every Dash surface reads from — color, typography, depth, shape, motion, plus the Dash logo and partner badge library."
      />

      <div className="space-y-14">
        {GROUPS.map((group) => (
          <section key={group.title} className="space-y-5">
            <div className="flex items-start gap-3">
              <div className="size-9 rounded-lg flex items-center justify-center bg-bg-weak-50 text-text-sub-600 [&_svg]:size-4 shrink-0">
                {group.icon}
              </div>
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
                <p className="text-sm text-text-sub-600 leading-relaxed mt-0.5">
                  {group.description}
                </p>
              </div>
            </div>

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
                    <p className="text-[12px] text-text-sub-600 leading-snug mt-1">
                      {item.blurb}
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </DocsPageShell>
  )
}
