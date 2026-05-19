"use client"

import * as React from "react"
import { StepIndicator, Step } from "@/registry/dash/ui/step-indicator"
import { Button } from "@/registry/dash/ui/button"
import { cn } from "@/registry/dash/lib/utils"

export type FormStep = {
  id: string
  label: React.ReactNode
  description?: React.ReactNode
}

export type FormStepperPageProps = {
  title?: React.ReactNode
  description?: React.ReactNode
  steps: FormStep[]
  currentIndex: number
  onPrev?: () => void
  onNext?: () => void
  onComplete?: () => void
  nextLabel?: React.ReactNode
  prevLabel?: React.ReactNode
  completeLabel?: React.ReactNode
  children: React.ReactNode
  className?: string
  /** Hide internal Prev/Next bar — render your own buttons inside children. */
  hideFooter?: boolean
}

/**
 * FormStepperPage — multi-step form layout.
 * Header with horizontal step indicator + body (children) + footer (Prev/Next).
 * Controlled via currentIndex; emit onPrev/onNext/onComplete for navigation.
 */
export function FormStepperPage({
  title,
  description,
  steps,
  currentIndex,
  onPrev,
  onNext,
  onComplete,
  nextLabel = "Next",
  prevLabel = "Prev",
  completeLabel = "Submit",
  children,
  className,
  hideFooter,
}: FormStepperPageProps) {
  const isFirst = currentIndex === 0
  const isLast = currentIndex === steps.length - 1
  return (
    <div className={cn("flex flex-col gap-8 w-full max-w-3xl mx-auto", className)}>
      <header className="space-y-4">
        {title ? (
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-text-strong-950">{title}</h1>
            {description ? <p className="text-sm text-text-sub-600 mt-1">{description}</p> : null}
          </div>
        ) : null}
        <StepIndicator>
          {steps.map((s, i) => (
            <Step
              key={s.id}
              index={i}
              label={s.label}
              description={s.description}
              status={i < currentIndex ? "completed" : i === currentIndex ? "current" : "upcoming"}
              withConnector={i < steps.length - 1}
            />
          ))}
        </StepIndicator>
      </header>

      <section className="rounded-2xl border border-stroke-soft-200 bg-bg-white-0 p-6">
        {children}
      </section>

      {!hideFooter ? (
        <footer className="flex items-center justify-between gap-3">
          <Button tone="neutral" style="stroke" disabled={isFirst} onClick={onPrev}>
            {prevLabel}
          </Button>
          {isLast ? (
            <Button onClick={onComplete}>{completeLabel}</Button>
          ) : (
            <Button onClick={onNext}>{nextLabel}</Button>
          )}
        </footer>
      ) : null}
    </div>
  )
}
