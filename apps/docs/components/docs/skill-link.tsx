"use client"

import * as React from "react"
import {
  RiLinkM as LinkIcon,
  RiDownloadLine as Download,
  RiFileCopyLine as CopyFile,
  RiCheckLine as Check,
  RiLoader4Line as Loader,
} from "@remixicon/react"
import { cn } from "@/registry/dash/lib/utils"
import { toast } from "sonner"

/**
 * Skill delivery buttons.
 *
 * Goal: a non-technical user (no pnpm/npx) gets the skill into ANY AI
 * assistant reliably. Pasting a URL is unreliable — ChatGPT/Gemini retrieve
 * via a search index, not a live GET, so an un-indexed URL silently fails.
 * The robust path is to hand the assistant the CONTENT, not a link:
 *
 *  - "Download skill" → saves the self-contained .md; user uploads/attaches it
 *    to the chat. File upload is universally supported and reliably read.
 *  - "Copy full skill" → copies the entire markdown to the clipboard; large
 *    pastes are auto-converted to an attachment by ChatGPT/Gemini and read.
 *  - "Copy link" (secondary) → only for assistants that truly open links
 *    (Claude, Perplexity).
 */

function useFlag(ms = 1600) {
  const [on, setOn] = React.useState(false)
  const fire = () => {
    setOn(true)
    setTimeout(() => setOn(false), ms)
  }
  return [on, fire] as const
}

export function CopySkillLink({
  url,
  filename,
}: {
  /** Absolute URL to the raw .md bundle. */
  url: string
  /** Suggested download filename, e.g. "dash-deck-design.md". */
  filename: string
}) {
  const [copiedFull, fireCopiedFull] = useFlag()
  const [copiedLink, fireCopiedLink] = useFlag()
  const [loading, setLoading] = React.useState(false)

  const copyFull = async () => {
    if (loading) return
    setLoading(true)
    try {
      const res = await fetch(url)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const text = await res.text()
      await navigator.clipboard.writeText(text)
      fireCopiedFull()
      toast.success("Full skill copied — paste it into any AI assistant")
    } catch {
      toast.error("Could not copy the skill — try Download instead")
    } finally {
      setLoading(false)
    }
  }

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(url)
      fireCopiedLink()
      toast.success("Link copied")
    } catch {
      toast.error("Could not write to clipboard")
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        {/* Primary: download the self-contained .md */}
        <a
          href={url}
          download={filename}
          className={cn(
            "inline-flex items-center gap-1.5 h-9 px-3.5 rounded-lg",
            "text-[13px] font-medium text-white",
            "bg-(--dash-purple-500) hover:bg-(--dash-purple-600)",
            "transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          )}
        >
          <Download className="size-4" strokeWidth={1.75} />
          Download skill
        </a>

        {/* Primary: copy the entire markdown to paste directly */}
        <button
          type="button"
          onClick={copyFull}
          disabled={loading}
          className={cn(
            "inline-flex items-center gap-1.5 h-9 px-3.5 rounded-lg",
            "text-[13px] font-medium text-text-strong-950",
            "border border-(--dash-purple-300) bg-bg-white-0",
            "hover:bg-(--dash-purple-50)/60",
            "transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            "disabled:opacity-60 disabled:cursor-progress",
          )}
        >
          {loading ? (
            <Loader className="size-4 animate-spin" strokeWidth={1.75} />
          ) : copiedFull ? (
            <Check className="size-4 text-(--dash-green-500)" strokeWidth={2} />
          ) : (
            <CopyFile className="size-4" strokeWidth={1.75} />
          )}
          {copiedFull ? "Copied" : "Copy full skill"}
        </button>
      </div>

      {/* Secondary: link, for link-opening assistants only */}
      <div className="flex items-center gap-2 text-[11px] text-text-soft-400">
        <span>Asisten yang bisa buka link (Claude, Perplexity)?</span>
        <button
          type="button"
          onClick={copyLink}
          className={cn(
            "inline-flex items-center gap-1 rounded-md px-1.5 py-0.5",
            "text-text-sub-600 hover:text-text-strong-950 transition-colors",
          )}
        >
          {copiedLink ? (
            <Check className="size-3.5 text-(--dash-green-500)" strokeWidth={2} />
          ) : (
            <LinkIcon className="size-3.5" strokeWidth={1.75} />
          )}
          {copiedLink ? "Copied" : "Copy link"}
        </button>
      </div>
    </div>
  )
}
