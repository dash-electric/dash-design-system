"use client"

import * as React from "react"
import { cn } from "@/registry/dash/lib/utils"

export type TocHeading = { id: string; title: string; level: 2 | 3 }

type Props = {
  /** Explicit headings; if omitted, auto-scans nearest <article> for h2/h3 with [id]. */
  headings?: TocHeading[]
  className?: string
}

const slugify = (s: string) =>
  s
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")

/**
 * DocsOnThisPage — sticky right-rail anchor list.
 * Auto-scans h2/h3 inside the nearest <article> ancestor on mount.
 * Active anchor tracked via IntersectionObserver.
 */
export const DocsOnThisPage = ({ headings: explicit, className }: Props) => {
  const containerRef = React.useRef<HTMLDivElement>(null)
  const [headings, setHeadings] = React.useState<TocHeading[]>(explicit ?? [])
  const [activeId, setActiveId] = React.useState<string | null>(null)

  // Auto-scan on mount if no explicit headings provided.
  React.useEffect(() => {
    if (explicit && explicit.length > 0) return
    const article = containerRef.current?.closest("article") ?? document.querySelector("article")
    if (!article) return

    const nodes = Array.from(article.querySelectorAll<HTMLHeadingElement>("h2, h3"))
    const seen = new Set<string>()
    const scanned: TocHeading[] = nodes.map((node) => {
      if (!node.id) {
        const base = slugify(node.textContent ?? "")
        let id = base
        let n = 1
        while (seen.has(id) || document.getElementById(id)) {
          n += 1
          id = `${base}-${n}`
        }
        node.id = id
      }
      seen.add(node.id)
      return {
        id: node.id,
        title: node.textContent?.trim() ?? "",
        level: node.tagName === "H2" ? 2 : 3,
      }
    })
    setHeadings(scanned.filter((h) => h.id && h.title))
  }, [explicit])

  // IntersectionObserver to highlight active anchor.
  React.useEffect(() => {
    if (headings.length === 0) return

    const elements = headings
      .map((h) => document.getElementById(h.id))
      .filter((el): el is HTMLElement => el !== null)

    if (elements.length === 0) return

    const observer = new IntersectionObserver(
      (entries) => {
        // Pick the heading closest to the top that's intersecting; fall back to last passed.
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)
        if (visible.length > 0) {
          setActiveId(visible[0].target.id)
        }
      },
      {
        rootMargin: "-80px 0px -70% 0px",
        threshold: [0, 1],
      },
    )

    elements.forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [headings])

  const onClick = React.useCallback((id: string) => (e: React.MouseEvent) => {
    e.preventDefault()
    const el = document.getElementById(id)
    if (!el) return
    const y = el.getBoundingClientRect().top + window.scrollY - 72
    window.scrollTo({ top: y, behavior: "smooth" })
    history.replaceState(null, "", `#${id}`)
    setActiveId(id)
  }, [])

  if (headings.length === 0) {
    return <div ref={containerRef} aria-hidden className="hidden" />
  }

  return (
    <nav
      ref={containerRef}
      aria-label="On this page"
      className={cn(
        "hidden lg:block sticky top-20 self-start max-h-[calc(100vh-6rem)] overflow-y-auto",
        "text-sm",
        className,
      )}
    >
      <div className="text-[11px] uppercase tracking-widest text-text-soft-400 mb-3">
        On this page
      </div>
      <ul className="space-y-1.5 border-l border-stroke-soft-200">
        {headings.map((h) => {
          const isActive = activeId === h.id
          return (
            <li key={h.id}>
              <a
                href={`#${h.id}`}
                onClick={onClick(h.id)}
                className={cn(
                  "block -ml-px border-l py-1 transition-colors",
                  h.level === 2 ? "pl-3" : "pl-6 text-[13px]",
                  isActive
                    ? "border-(--dash-purple-500) text-text-strong-950 font-medium"
                    : "border-transparent text-text-sub-600 hover:text-text-strong-950",
                )}
              >
                {h.title}
              </a>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
