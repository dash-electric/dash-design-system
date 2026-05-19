"use client"

import * as React from "react"
import { RiBriefcaseLine as Briefcase, RiInformationLine as Info } from "@remixicon/react"
import { Button } from "@/registry/dash/ui/button"
import { Label } from "@/registry/dash/ui/label"
import { Textarea } from "@/registry/dash/ui/textarea"
import { LinkButton } from "@/registry/dash/ui/link-button"
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/registry/dash/ui/select"
import {
  OnboardingTopNav,
  OnboardingBottomBar,
} from "@/registry/dash/templates/hr-personal-information"
import { cn } from "@/registry/dash/lib/utils"

/**
 * HrPositionSelection — ported 1:1 (structural parity) from AlignUI Pro Figma node 3904:29920.
 * Synergy HR onboarding step 3 of 5. Department select + Title select + Biography textarea
 * + skip-this-step link.
 */

export type HrPositionSelectionProps = {
  brand?: React.ReactNode
  onContinue?: (data: { department: string; title: string; bio: string }) => void
  onBack?: () => void
  onSkip?: () => void
  className?: string
}

const steps = ["Personal", "Role", "Position", "Password", "Summary"]

const departments = [
  "Human Resources",
  "Engineering",
  "Marketing",
  "Sales",
  "Design",
  "Finance",
  "Operations",
]

const titles = [
  "Manager",
  "Senior Specialist",
  "Specialist",
  "Coordinator",
  "Assistant",
  "Director",
]

export function HrPositionSelection({
  brand,
  onContinue,
  onBack,
  onSkip,
  className,
}: HrPositionSelectionProps) {
  const [department, setDepartment] = React.useState("")
  const [title, setTitle] = React.useState("")
  const [bio, setBio] = React.useState("")

  return (
    <div className={cn("min-h-screen flex flex-col bg-bg-white-0", className)}>
      <OnboardingTopNav brand={brand} currentStep={2} steps={steps} />

      <main className="flex-1 flex items-center justify-center px-6 py-8">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="mx-auto size-14 rounded-full bg-bg-weak-50 border border-stroke-soft-200 grid place-items-center mb-4">
              <Briefcase className="size-6 text-icon-sub-600" />
            </div>
            <h1 className="text-2xl font-semibold tracking-tight text-text-strong-950">
              Position Selection
            </h1>
            <p className="mt-1 text-sm text-text-sub-600">
              Select your department and title.
            </p>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault()
              onContinue?.({ department, title, bio })
            }}
            className="space-y-4"
          >
            <div className="space-y-1.5">
              <Label htmlFor="department">Select Department</Label>
              <Select value={department} onValueChange={setDepartment}>
                <SelectTrigger id="department" className="w-full">
                  <SelectValue placeholder="e.g. Human Resources" />
                </SelectTrigger>
                <SelectContent>
                  {departments.map((d) => (
                    <SelectItem key={d} value={d}>{d}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="title">Select Title</Label>
              <Select value={title} onValueChange={setTitle}>
                <SelectTrigger id="title" className="w-full">
                  <SelectValue placeholder="Your Title" />
                </SelectTrigger>
                <SelectContent>
                  {titles.map((t) => (
                    <SelectItem key={t} value={t}>{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="bio">Biography</Label>
              <Textarea
                id="bio"
                value={bio}
                maxLength={200}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Describe yourself..."
                rows={4}
              />
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1 text-text-sub-600">
                  <Info className="size-3" />
                  It will be displayed on your profile.
                </span>
                <span className="text-text-soft-400">{bio.length}/200</span>
              </div>
            </div>

            <Button
              tone="primary"
              style="filled"
              size="lg"
              type="submit"
              className="w-full mt-2"
            >
              Continue
            </Button>

            <p className="text-center text-sm text-text-sub-600">
              Want to fill in later?{" "}
              <LinkButton
                href="#"
                tone="primary"
                onClick={(e: React.MouseEvent) => {
                  e.preventDefault()
                  onSkip?.()
                }}
              >
                Skip this step
              </LinkButton>
            </p>
          </form>
        </div>
      </main>

      <OnboardingBottomBar onBack={onBack} />
    </div>
  )
}
