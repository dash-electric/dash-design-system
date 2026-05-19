"use client"

import * as React from "react"
import { RiFileCopyLine as Copy, RiCheckLine as Check } from "@remixicon/react"
import { cn } from "@/registry/dash/lib/utils"
import { toast } from "sonner"

/**
 * DocsCopyPage — extracts current page as clean markdown and copies to clipboard.
 *
 * Strategy: DOM walk over the nearest <article>. Translates:
 *  - h1/h2/h3 → markdown headings
 *  - DocsPreview blocks → skipped (visual-only)
 *  - DocsCode blocks → fenced code with language tag
 *  - DocsPropsTable → markdown table
 *  - p, ul, li, em, strong, code → markdown equivalents
 */

const extractMarkdown = (root: HTMLElement): string => {
  const lines: string[] = []

  const walk = (node: Node): void => {
    if (node.nodeType === Node.TEXT_NODE) {
      return
    }
    if (!(node instanceof HTMLElement)) return

    // Skip preview blocks entirely.
    if (node.dataset?.slot === "docs-preview") return

    // Code blocks → fenced code.
    if (node.dataset?.slot === "docs-code") {
      const codeEl = node.querySelector("code, pre")
      const codeText = codeEl?.textContent ?? ""
      // Try language from the small label tag (first text child).
      // Language label = small uppercase tracking-widest text in the code-block header
      const labelEl = node.querySelector("[class*='uppercase'][class*='tracking-widest']")
      const lang = labelEl?.textContent?.trim().toLowerCase() ?? ""
      lines.push("")
      lines.push("```" + lang)
      lines.push(codeText.replace(/\n$/, ""))
      lines.push("```")
      lines.push("")
      return
    }

    // Tables → markdown table.
    if (node.tagName === "TABLE") {
      const headers = Array.from(node.querySelectorAll("thead th")).map(
        (th) => th.textContent?.trim() ?? "",
      )
      const rows = Array.from(node.querySelectorAll("tbody tr")).map((tr) =>
        Array.from(tr.querySelectorAll("td")).map((td) =>
          (td.textContent ?? "").replace(/\|/g, "\\|").replace(/\n+/g, " ").trim(),
        ),
      )
      if (headers.length > 0) {
        lines.push("")
        lines.push("| " + headers.join(" | ") + " |")
        lines.push("| " + headers.map(() => "---").join(" | ") + " |")
        for (const row of rows) {
          lines.push("| " + row.join(" | ") + " |")
        }
        lines.push("")
      }
      return
    }

    switch (node.tagName) {
      case "H1": {
        lines.push("")
        lines.push("# " + (node.textContent ?? "").trim())
        lines.push("")
        return
      }
      case "H2": {
        lines.push("")
        lines.push("## " + (node.textContent ?? "").trim())
        lines.push("")
        return
      }
      case "H3": {
        lines.push("")
        lines.push("### " + (node.textContent ?? "").trim())
        lines.push("")
        return
      }
      case "P": {
        const text = (node.textContent ?? "").trim()
        if (text) {
          lines.push(text)
          lines.push("")
        }
        return
      }
      case "LI": {
        lines.push("- " + (node.textContent ?? "").trim())
        return
      }
    }

    // Recurse for everything else.
    for (const child of Array.from(node.childNodes)) {
      walk(child)
    }
  }

  walk(root)

  // Compress runs of blank lines.
  return lines.join("\n").replace(/\n{3,}/g, "\n\n").trim() + "\n"
}

type Props = {
  className?: string
  /** Optional explicit markdown to copy (bypasses DOM walk). */
  markdown?: string
}

export const DocsCopyPage = ({ className, markdown }: Props) => {
  const [copied, setCopied] = React.useState(false)

  const onClick = async () => {
    let content = markdown
    if (!content) {
      const article = document.querySelector("article")
      if (!article) {
        toast.error("Could not find page content to copy")
        return
      }
      content = extractMarkdown(article as HTMLElement)
    }
    try {
      await navigator.clipboard.writeText(content)
      setCopied(true)
      toast.success("Page copied as markdown", {
        description: "Paste into Claude, ChatGPT, or any AI agent for context.",
      })
      setTimeout(() => setCopied(false), 1600)
    } catch {
      toast.error("Could not write to clipboard")
    }
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1.5 h-8 px-2.5 rounded-md",
        "text-[12px] font-medium text-text-sub-600",
        "border border-stroke-soft-200 bg-bg-white-0",
        "hover:bg-bg-weak-50 hover:text-text-strong-950 hover:border-(--dash-purple-300)",
        "transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        className,
      )}
      aria-label="Copy page as markdown"
    >
      {copied ? (
        <Check className="size-3.5 text-(--dash-green-500)" strokeWidth={2} />
      ) : (
        <Copy className="size-3.5" strokeWidth={1.75} />
      )}
      {copied ? "Copied" : "Copy page"}
    </button>
  )
}
