"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { RiFullscreenLine as Maximize2, RiFullscreenExitLine as Minimize2, RiSearchLine as Search } from "@remixicon/react"
const GithubIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    aria-hidden
    {...props}
  >
    <path d="M12 .5C5.6.5.5 5.6.5 12c0 5.1 3.3 9.4 7.9 10.9.6.1.8-.2.8-.6v-2c-3.2.7-3.9-1.5-3.9-1.5-.5-1.3-1.3-1.7-1.3-1.7-1.1-.7.1-.7.1-.7 1.2.1 1.8 1.2 1.8 1.2 1 1.8 2.8 1.3 3.5 1 .1-.8.4-1.3.8-1.6-2.6-.3-5.3-1.3-5.3-5.8 0-1.3.5-2.3 1.2-3.1-.1-.3-.5-1.5.1-3.1 0 0 1-.3 3.3 1.2 1-.3 2-.4 3-.4s2 .1 3 .4c2.3-1.5 3.3-1.2 3.3-1.2.7 1.6.2 2.8.1 3.1.8.8 1.2 1.9 1.2 3.1 0 4.5-2.7 5.5-5.3 5.8.4.4.8 1.1.8 2.2v3.3c0 .3.2.7.8.6 4.6-1.5 7.9-5.8 7.9-10.9C23.5 5.6 18.4.5 12 .5z" />
  </svg>
)
import { ThemeToggle } from "@/components/theme-toggle"
import { cn } from "@/registry/dash/lib/utils"

const LAYOUT_KEY = "dash-ds:layout-mode"

const TOP_LINKS = [
  { label: "Docs", href: "/docs", match: /^\/docs(\/|$)(?!components|blocks|templates)/ },
  { label: "Components", href: "/docs/components", match: /^\/docs\/components(\/|$)/ },
  { label: "Blocks", href: "/docs/blocks", match: /^\/docs\/blocks(\/|$)/ },
  { label: "Templates", href: "/docs/templates", match: /^\/docs\/templates(\/|$)/ },
] as const

export function DocsTopbar() {
  const pathname = usePathname()
  const [layoutMode, setLayoutMode] = React.useState<"centered" | "wide">("centered")

  // Hydrate from localStorage + apply class to <html>.
  React.useEffect(() => {
    const stored = (typeof window !== "undefined" && localStorage.getItem(LAYOUT_KEY)) as
      | "centered"
      | "wide"
      | null
    const initial = stored === "wide" ? "wide" : "centered"
    // Client-only hydration from localStorage — the cascading render
    // is intentional and runs exactly once on mount.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLayoutMode(initial)
    document.documentElement.dataset.layout = initial
  }, [])

  const toggleLayout = () => {
    const next = layoutMode === "centered" ? "wide" : "centered"
    setLayoutMode(next)
    localStorage.setItem(LAYOUT_KEY, next)
    document.documentElement.dataset.layout = next
  }

  // ⌘K shortcut → dispatch a custom event consumers can listen for.
  React.useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault()
        window.dispatchEvent(new CustomEvent("dash-ds:command-menu"))
      }
    }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [])

  const openCommand = () => {
    window.dispatchEvent(new CustomEvent("dash-ds:command-menu"))
  }

  return (
    <header className="sticky top-0 z-40 h-14 border-b border-stroke-soft-200 bg-bg-white-0/95 backdrop-blur supports-[backdrop-filter]:bg-bg-white-0/80 text-text-strong-950">
      <div className="h-full px-4 lg:px-6 flex items-center gap-4">
        <Link href="/" className="flex items-center gap-2 mr-2">
          <span
            aria-hidden
            className="size-7 rounded-md flex items-center justify-center bg-(--dash-purple-500) text-static-white font-semibold text-sm tracking-tight"
          >
            D
          </span>
          <span className="font-semibold tracking-tight text-text-strong-950">
            Dash
          </span>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-bg-weak-50 text-text-sub-600 ml-1">
            v1.0
          </span>
        </Link>

        <nav className="flex items-center gap-0">
          {TOP_LINKS.map((link) => {
            const active = link.match.test(pathname ?? "")
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "hidden sm:inline-flex h-9 px-4 items-center text-sm transition-colors",
                  active
                    ? "text-text-strong-950 font-semibold"
                    : "text-text-sub-600 hover:text-text-strong-950",
                )}
              >
                {link.label}
              </Link>
            )
          })}
        </nav>

        <div className="flex-1" />

        <button
          type="button"
          onClick={openCommand}
          className="hidden md:flex items-center gap-2 max-w-xs h-9 px-3 rounded-md bg-bg-weak-50 border border-stroke-soft-200 text-sm text-text-sub-600 hover:bg-bg-white-0 hover:text-text-strong-950 hover:border-stroke-sub-300 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--dash-purple-300)"
          aria-label="Search documentation"
        >
          <Search className="size-3.5" strokeWidth={1.75} aria-hidden />
          <span className="flex-1 text-left whitespace-nowrap">
            Search…
          </span>
          <kbd className="text-[10px] px-1.5 py-0.5 rounded bg-bg-white-0 border border-stroke-soft-200 text-text-sub-600">
            ⌘&nbsp;K
          </kbd>
        </button>

        <button
          type="button"
          onClick={toggleLayout}
          aria-label={
            layoutMode === "centered" ? "Switch to wide layout" : "Switch to centered layout"
          }
          title={layoutMode === "centered" ? "Wide layout" : "Centered layout"}
          className={cn(
            "inline-flex size-9 items-center justify-center rounded-md",
            "text-text-sub-600 hover:text-text-strong-950 hover:bg-bg-weak-50 transition-colors",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--dash-purple-300)",
          )}
        >
          {layoutMode === "centered" ? (
            <Maximize2 className="size-4" strokeWidth={1.75} />
          ) : (
            <Minimize2 className="size-4" strokeWidth={1.75} />
          )}
        </button>

        <a
          href="https://github.com/dash-ev/dash-ds"
          target="_blank"
          rel="noreferrer noopener"
          aria-label="GitHub repository"
          className="inline-flex size-9 items-center justify-center rounded-md text-text-sub-600 hover:text-text-strong-950 hover:bg-bg-weak-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--dash-purple-300)"
        >
          <GithubIcon className="size-4" />
        </a>

        <ThemeToggle />
      </div>
    </header>
  )
}
