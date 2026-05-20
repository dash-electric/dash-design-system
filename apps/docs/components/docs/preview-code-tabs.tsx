"use client"

import * as React from "react"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/registry/dash/ui/tabs"
import { DocsPreview } from "@/components/docs/preview"
import { DocsCode } from "@/components/docs/code-block"
import { cn } from "@/registry/dash/lib/utils"

type PreviewCodeTabsProps = {
  preview: React.ReactNode
  code: string
  language?: string
  className?: string
  /**
   * When true (default), Preview is the default tab. Set false to show Code
   * first — useful for utility components where the snippet is the headline.
   */
  previewFirst?: boolean
}

/**
 * DocsPreviewCodeTabs — shadcn-style hero block: a tabs row with Preview
 * (live render) and Code (the same example as source). Compresses the page
 * by ~40% vs always-visible stacked preview+code.
 */
export const DocsPreviewCodeTabs = ({
  preview,
  code,
  language = "tsx",
  className,
  previewFirst = true,
}: PreviewCodeTabsProps) => {
  const first = previewFirst ? "preview" : "code"
  return (
    <Tabs defaultValue={first} className={cn("space-y-3", className)}>
      <TabsList>
        <TabsTrigger value="preview">Preview</TabsTrigger>
        <TabsTrigger value="code">Code</TabsTrigger>
      </TabsList>
      <TabsContent value="preview" className="mt-0">
        <div className="rounded-xl overflow-hidden">
          <DocsPreview className="rounded-xl border-b">{preview}</DocsPreview>
        </div>
      </TabsContent>
      <TabsContent value="code" className="mt-0">
        <DocsCode code={code} language={language} />
      </TabsContent>
    </Tabs>
  )
}
