"use client"

import * as React from "react"
import { RiImageLine } from "@remixicon/react"
import { cn } from "@/registry/dash/lib/utils"
import { DocsCode } from "@/components/docs/code-block"

type ImageHeight = "sm" | "md" | "lg"

const HEIGHT_CLASS: Record<ImageHeight, string> = {
  sm: "h-[200px]",
  md: "h-[400px]",
  lg: "h-[600px]",
}

export type DocsStepProps = {
  /** 1-based step number. Renders as a circular badge. */
  number: number
  /** Step title — short imperative phrase. */
  title: React.ReactNode
  /** 1-2 sentence explanation of what this step does. */
  description: React.ReactNode
  /** Optional terminal command or code snippet that ships with the step. */
  code?: string
  /** Language hint for the code block. Default "bash". */
  codeLanguage?: string
  /** Optional expected stdout / completion output — rendered as a quieter code block under the main one. */
  output?: string
  /** Alt text for the screenshot. Surfaces as the placeholder caption today and as <img alt> once imageSrc lands. */
  imagePlaceholder: string
  /** Optional real screenshot URL. When set, replaces the placeholder box. */
  imageSrc?: string
  /** Aspect / fixed height for the image box. */
  imageHeight?: ImageHeight
  /** Optional extra body content rendered between description and image (e.g. variant tables, tips). */
  children?: React.ReactNode
}

/**
 * DocsStep — numbered walkthrough step with a screenshot slot.
 *
 * Inspired by developers.openai.com/codex/app, where every install step
 * pairs a terse instruction with a screenshot of the resulting UI. We
 * leave a placeholder box today (data-image-placeholder marks it for the
 * future real-image swap) and accept imageSrc once captures land.
 */
export const DocsStep = ({
  number,
  title,
  description,
  code,
  codeLanguage = "bash",
  output,
  imagePlaceholder,
  imageSrc,
  imageHeight = "md",
  children,
}: DocsStepProps) => {
  const slug = `step-${number}`
  return (
    <div
      data-slot="docs-step"
      data-step={number}
      className="grid grid-cols-1 md:grid-cols-[64px_1fr] gap-x-6 gap-y-4 pt-8 first:pt-0 border-t border-stroke-soft-200/60 first:border-t-0"
    >
      {/* Left rail — circular number badge */}
      <div className="hidden md:flex flex-col items-center pt-1">
        <span
          aria-hidden
          className="inline-flex size-9 items-center justify-center rounded-full border border-stroke-soft-200 bg-bg-weak-50 text-sm font-semibold text-text-strong-950"
        >
          {number}
        </span>
        <span aria-hidden className="flex-1 w-px bg-stroke-soft-200/60 mt-3" />
      </div>

      {/* Body */}
      <div className="space-y-4 min-w-0">
        <div className="space-y-1.5">
          <div className="flex items-center gap-3">
            {/* Mobile badge */}
            <span
              aria-hidden
              className="md:hidden inline-flex size-7 items-center justify-center rounded-full border border-stroke-soft-200 bg-bg-weak-50 text-xs font-semibold text-text-strong-950"
            >
              {number}
            </span>
            <h3
              id={slug}
              className="text-lg font-semibold tracking-tight text-text-strong-950 scroll-mt-20"
            >
              {title}
            </h3>
          </div>
          <p className="text-sm text-text-sub-600 leading-relaxed max-w-2xl">
            {description}
          </p>
        </div>

        {code ? <DocsCode language={codeLanguage} code={code} /> : null}
        {output ? (
          <DocsCode
            language="text"
            code={output}
            copy={false}
            className="opacity-90"
          />
        ) : null}

        {children}

        {/* Screenshot slot */}
        <figure
          data-image-placeholder={imagePlaceholder}
          className={cn(
            "relative w-full overflow-hidden rounded-xl border border-stroke-soft-200 bg-bg-weak-50",
            !imageSrc && HEIGHT_CLASS[imageHeight],
          )}
        >
          {imageSrc ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={imageSrc}
              alt={imagePlaceholder}
              className="w-full h-auto block"
            />
          ) : (
            <div
              className={cn(
                "absolute inset-0 flex flex-col items-center justify-center gap-2 text-center px-6",
                // subtle dotted grid so the placeholder reads as intentional, not empty
                "bg-[radial-gradient(circle_at_1px_1px,theme(colors.stroke-soft-200/40)_1px,transparent_0)] [background-size:16px_16px]",
              )}
            >
              <span className="inline-flex items-center gap-2 rounded-full border border-stroke-soft-200 bg-bg-white-0/80 backdrop-blur-sm px-3 py-1.5">
                <RiImageLine className="size-4 text-text-soft-400" strokeWidth={1.5} />
                <span className="text-[11px] uppercase tracking-[0.18em] font-medium text-text-soft-400">
                  Screenshot
                </span>
              </span>
              <figcaption className="text-sm text-text-sub-600 max-w-md">
                {imagePlaceholder}
              </figcaption>
            </div>
          )}
        </figure>
      </div>
    </div>
  )
}

type DocsStepListProps = {
  className?: string
  children: React.ReactNode
}

/** DocsStepList — vertical wrapper that connects step rails into a single timeline. */
export const DocsStepList = ({ className, children }: DocsStepListProps) => (
  <div className={cn("space-y-0", className)}>{children}</div>
)

type DocsWorkflowDiagramProps = {
  steps: Array<{ label: string; sub?: string }>
  className?: string
}

/**
 * DocsWorkflowDiagram — top-of-page text-based workflow chevron.
 * Substitute for a real hero illustration until designs land. Renders as
 * a horizontally scrolling pill row on small screens.
 */
export const DocsWorkflowDiagram = ({ steps, className }: DocsWorkflowDiagramProps) => (
  <div
    className={cn(
      "rounded-2xl border border-stroke-soft-200 bg-bg-weak-50 p-4 sm:p-6",
      className,
    )}
    data-slot="docs-workflow-diagram"
  >
    <div className="flex items-stretch gap-2 sm:gap-3 overflow-x-auto">
      {steps.map((s, i) => (
        <React.Fragment key={`${s.label}-${i}`}>
          <div className="flex-1 min-w-[140px] rounded-xl border border-stroke-soft-200 bg-bg-white-0 px-3 py-2.5">
            <div className="text-[10px] uppercase tracking-[0.18em] text-text-soft-400">
              {String(i + 1).padStart(2, "0")}
            </div>
            <div className="text-sm font-semibold text-text-strong-950 leading-tight mt-0.5">
              {s.label}
            </div>
            {s.sub ? (
              <div className="text-xs text-text-sub-600 mt-1 leading-snug">
                {s.sub}
              </div>
            ) : null}
          </div>
          {i < steps.length - 1 ? (
            <div
              aria-hidden
              className="self-center text-text-soft-400 select-none"
            >
              →
            </div>
          ) : null}
        </React.Fragment>
      ))}
    </div>
  </div>
)
