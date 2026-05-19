"use client"

import type { Highlighter, BundledLanguage } from "shiki"

/**
 * Lazy singleton Shiki highlighter loaded client-side.
 * Languages registered: tsx, ts, jsx, js, bash, json, css, md.
 * Dual theme: github-dark + github-light (switched via CSS data-theme).
 */
let highlighterPromise: Promise<Highlighter> | null = null

const LANGS: BundledLanguage[] = ["tsx", "ts", "jsx", "js", "bash", "json", "css", "md"]

export const getHighlighter = (): Promise<Highlighter> => {
  if (highlighterPromise) return highlighterPromise
  highlighterPromise = import("shiki").then(({ createHighlighter }) =>
    createHighlighter({
      themes: ["github-dark", "github-light"],
      langs: LANGS,
    }),
  )
  return highlighterPromise
}

export const SUPPORTED_LANGS = new Set<string>(LANGS)
