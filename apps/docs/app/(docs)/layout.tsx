import { DocsSidebar } from "@/components/docs/sidebar"
import { DocsTopbar } from "@/components/docs/topbar"
import { DocsOnThisPage } from "@/components/docs/on-this-page"
import { DocsCommandPalette } from "@/components/docs/command-palette"

export default function DocsLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <div className="min-h-screen flex flex-col">
      {/*
        A11y E4 — skip-link must be the first focusable element in the DOM
        so keyboard users can bypass the topbar + sidebar and land on the
        main docs content. Visually hidden by default; reveals on focus.
      */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-md focus:bg-bg-strong-950 focus:px-4 focus:py-2 focus:text-text-white-0 focus:shadow-custom-md"
      >
        Skip to main content
      </a>
      <DocsTopbar />
      <div className="flex flex-1">
        <DocsSidebar />
        <div className="flex-1 min-w-0 flex">
          <main id="main-content" className="flex-1 min-w-0" tabIndex={-1}>
            {children}
          </main>
          <aside
            aria-label="On this page"
            className="hidden lg:block w-56 shrink-0 px-6 py-12"
          >
            <DocsOnThisPage />
          </aside>
        </div>
      </div>
      {/* Listens for ⌘K + `dash-ds:command-menu` event from topbar Search button. */}
      <DocsCommandPalette />
    </div>
  )
}
