"use client"

import * as React from "react"
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/registry/dash/ui/resizable"
import { ScrollArea } from "@/registry/dash/ui/scroll-area"
import { cn } from "@/registry/dash/lib/utils"

export type ListDetailPageProps = {
  /** Master list column content (rows / table / filtered cards). */
  list: React.ReactNode
  /** Detail pane content for currently selected row. */
  detail: React.ReactNode
  /** Optional toolbar above the list column (filters, search, bulk actions). */
  listToolbar?: React.ReactNode
  /** Optional toolbar above the detail pane (breadcrumb, actions). */
  detailToolbar?: React.ReactNode
  /** Initial split percentage for the list pane (10-60). */
  listSize?: number
  /** Layout: "resizable" (drag handle) or "fixed" (no handle, predefined width). */
  layout?: "resizable" | "fixed"
  className?: string
}

/**
 * ListDetailPage — master-detail layout for resource browsers.
 * Mitra list / Trip log / Dispatch queue / Ticket inbox patterns.
 * Default: resizable horizontal split. Drag handle between panes.
 */
export function ListDetailPage({
  list,
  detail,
  listToolbar,
  detailToolbar,
  listSize = 35,
  layout = "resizable",
  className,
}: ListDetailPageProps) {
  if (layout === "fixed") {
    return (
      <div className={cn("flex h-full w-full", className)}>
        <aside className="w-80 shrink-0 border-r border-stroke-soft-200 flex flex-col">
          {listToolbar ? (
            <div className="border-b border-stroke-soft-200 px-3 py-2">{listToolbar}</div>
          ) : null}
          <ScrollArea className="flex-1">{list}</ScrollArea>
        </aside>
        <section className="flex-1 min-w-0 flex flex-col">
          {detailToolbar ? (
            <div className="border-b border-stroke-soft-200 px-4 py-2">{detailToolbar}</div>
          ) : null}
          <ScrollArea className="flex-1 p-6">{detail}</ScrollArea>
        </section>
      </div>
    )
  }

  return (
    <div className={cn("h-full w-full", className)}>
      <ResizablePanelGroup orientation="horizontal">
        <ResizablePanel defaultSize={listSize} minSize={20} maxSize={60}>
          <div className="flex h-full flex-col">
            {listToolbar ? (
              <div className="border-b border-stroke-soft-200 px-3 py-2">{listToolbar}</div>
            ) : null}
            <ScrollArea className="flex-1">{list}</ScrollArea>
          </div>
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={100 - listSize}>
          <div className="flex h-full flex-col">
            {detailToolbar ? (
              <div className="border-b border-stroke-soft-200 px-4 py-2">{detailToolbar}</div>
            ) : null}
            <ScrollArea className="flex-1 p-6">{detail}</ScrollArea>
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  )
}
