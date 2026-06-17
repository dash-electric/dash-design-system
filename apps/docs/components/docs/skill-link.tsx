"use client"

import * as React from "react"
import {
  RiLinkM as LinkIcon,
  RiFileCopyLine as Copy,
  RiCheckLine as Check,
  RiSparkling2Line as Sparkle,
} from "@remixicon/react"
import { cn } from "@/registry/dash/lib/utils"
import { toast } from "sonner"

/**
 * Copy buttons for a public skill's LLM link.
 *
 * Two affordances:
 *  - "Copy link"   → just the raw .md URL.
 *  - "Copy prompt" → a ready-to-paste instruction wrapping the URL, so a
 *    non-technical user can drop it straight into Claude / ChatGPT / Gemini.
 */

function useCopied() {
  const [copied, setCopied] = React.useState(false)
  const copy = async (text: string, msg: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      toast.success(msg)
      setTimeout(() => setCopied(false), 1600)
    } catch {
      toast.error("Could not write to clipboard")
    }
  }
  return { copied, copy }
}

export function CopySkillLink({
  url,
  prompt,
}: {
  url: string
  prompt: string
}) {
  const link = useCopied()
  const promptCopy = useCopied()

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        type="button"
        onClick={() => promptCopy.copy(prompt, "Prompt copied — paste into any AI assistant")}
        className={cn(
          "inline-flex items-center gap-1.5 h-9 px-3.5 rounded-lg",
          "text-[13px] font-medium text-white",
          "bg-(--dash-purple-500) hover:bg-(--dash-purple-600)",
          "transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        )}
      >
        {promptCopy.copied ? (
          <Check className="size-4" strokeWidth={2} />
        ) : (
          <Sparkle className="size-4" strokeWidth={1.75} />
        )}
        {promptCopy.copied ? "Copied" : "Copy AI prompt"}
      </button>

      <button
        type="button"
        onClick={() => link.copy(url, "Link copied")}
        className={cn(
          "inline-flex items-center gap-1.5 h-9 px-3 rounded-lg",
          "text-[13px] font-medium text-text-sub-600",
          "border border-stroke-soft-200 bg-bg-white-0",
          "hover:bg-bg-weak-50 hover:text-text-strong-950 hover:border-(--dash-purple-300)",
          "transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        )}
      >
        {link.copied ? (
          <Check className="size-4 text-(--dash-green-500)" strokeWidth={2} />
        ) : (
          <LinkIcon className="size-4" strokeWidth={1.75} />
        )}
        {link.copied ? "Copied" : "Copy link"}
      </button>

      <a
        href={url}
        target="_blank"
        rel="noreferrer"
        className={cn(
          "inline-flex items-center gap-1.5 h-9 px-3 rounded-lg",
          "text-[13px] font-medium text-text-sub-600",
          "border border-stroke-soft-200 bg-bg-white-0",
          "hover:bg-bg-weak-50 hover:text-text-strong-950 hover:border-(--dash-purple-300)",
          "transition-colors",
        )}
      >
        <Copy className="size-4" strokeWidth={1.75} />
        Open raw
      </a>
    </div>
  )
}
