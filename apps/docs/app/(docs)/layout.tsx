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
      <DocsTopbar />
      <div className="flex flex-1">
        <DocsSidebar />
        <div className="flex-1 min-w-0 flex">
          <main className="flex-1 min-w-0">{children}</main>
          <aside className="hidden lg:block w-56 shrink-0 px-6 py-12">
            <DocsOnThisPage />
          </aside>
        </div>
      </div>
      {/* Listens for ⌘K + `dash-ds:command-menu` event from topbar Search button. */}
      <DocsCommandPalette />
    </div>
  )
}
