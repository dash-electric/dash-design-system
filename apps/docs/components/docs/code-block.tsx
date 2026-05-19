"use client"

import * as React from "react"
import { RiCheckLine as Check, RiFileCopyLine as Copy } from "@remixicon/react"
import { cn } from "@/registry/dash/lib/utils"
import { getHighlighter, SUPPORTED_LANGS } from "@/components/docs/shiki-highlighter"

type CodeBlockProps = React.HTMLAttributes<HTMLDivElement> & {
  code: string
  language?: string
  /** Show copy button (default true). */
  copy?: boolean
}

const normalizeLang = (lang?: string): string => {
  if (!lang) return "text"
  const l = lang.toLowerCase()
  if (l === "shell" || l === "sh" || l === "zsh") return "bash"
  if (l === "typescript") return "ts"
  if (l === "javascript") return "js"
  if (SUPPORTED_LANGS.has(l)) return l
  return "text"
}

/**
 * DocsCode — dark code surface with hairline header bar (lang label + copy)
 * + Shiki syntax highlighting. Falls back to plain monospace if Shiki fails.
 *
 * Layout: header bar (h-9) with bottom border, then code body with generous
 * top padding so the first code line never collides with the lang label.
 */
export const DocsCode = ({
  className,
  code,
  language,
  copy = true,
  ...props
}: CodeBlockProps) => {
  const [copied, setCopied] = React.useState(false)
  const [highlighted, setHighlighted] = React.useState<string | null>(null)
  const lang = normalizeLang(language)

  React.useEffect(() => {
    let cancelled = false
    if (lang === "text") return

    getHighlighter()
      .then((hl) => {
        if (cancelled) return
        const html = hl.codeToHtml(code, {
          lang: lang as Parameters<typeof hl.codeToHtml>[1]["lang"],
          themes: { dark: "github-dark", light: "github-dark" },
          defaultColor: "dark",
        })
        setHighlighted(html)
      })
      .catch(() => {
        // Graceful fallback — keep plain rendering.
      })
    return () => {
      cancelled = true
    }
  }, [code, lang])

  const onCopy = async () => {
    await navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 1400)
  }

  const hasHeader = !!language || copy

  return (
    <div
      data-slot="docs-code"
      className={cn(
        "relative group rounded-xl bg-[#0d1117] text-text-white-0 overflow-hidden border border-white/5",
        className,
      )}
      {...props}
    >
      {hasHeader ? (
        <div className="flex items-center justify-between gap-2 h-9 px-4 border-b border-white/5 bg-white/[0.02]">
          <span className="text-[10px] uppercase tracking-widest text-text-soft-400">
            {language ?? ""}
          </span>
          {copy ? (
            <button
              type="button"
              onClick={onCopy}
              aria-label={copied ? "Copied" : "Copy"}
              className={cn(
                "inline-flex size-7 items-center justify-center rounded-md -mr-1.5",
                "text-text-soft-400 hover:bg-white/10 hover:text-text-white-0",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                "transition-colors",
              )}
            >
              {copied ? (
                <Check className="size-4" strokeWidth={2} />
              ) : (
                <Copy className="size-3.5" strokeWidth={1.75} />
              )}
            </button>
          ) : null}
        </div>
      ) : null}
      {highlighted ? (
        <div
          className={cn(
            // Shiki emits its own <pre> with default padding 1rem.
            // We add extra py to give the code body breathing room.
            "docs-shiki overflow-x-auto text-[13px] leading-relaxed",
            "[&_pre]:py-4 [&_pre]:px-4 [&_pre]:m-0",
          )}
          dangerouslySetInnerHTML={{ __html: highlighted }}
        />
      ) : (
        <pre className="overflow-x-auto py-4 px-4 m-0 text-[13px] leading-relaxed">
          <code>{code}</code>
        </pre>
      )}
    </div>
  )
}
