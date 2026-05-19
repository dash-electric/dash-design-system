"use client"

import * as React from "react"
import {
  RiAccountPinBoxFill,
  RiAccountPinBoxLine,
  RiAccountPinCircleFill,
  RiAccountPinCircleLine,
  RiArrowLeftSLine,
  RiAtLine,
  RiBuilding2Line,
  RiCheckboxCircleFill,
  RiCloseCircleFill,
  RiCloseLine,
  RiEyeLine,
  RiEyeOffLine,
  RiHeadphoneLine,
  RiInformationFill,
  RiLock2Line,
  RiLockFill,
  RiMailLine,
  RiPencilLine,
  RiSuitcaseLine,
  RiUser2Line,
  RiUserAddFill,
  RiUserSettingsFill,
} from "@remixicon/react"
import { cn } from "@/registry/dash/lib/utils"
import { Button } from "@/registry/dash/ui/button"
import { Checkbox } from "@/registry/dash/ui/checkbox"
import { Divider, ContentDivider } from "@/registry/dash/ui/divider"
import { FancyButton } from "@/registry/dash/ui/fancy-button"
import { Hint } from "@/registry/dash/ui/hint"
import { InputRoot, Input, InputIcon, InputAffix } from "@/registry/dash/ui/input"
import { Label } from "@/registry/dash/ui/label"
import { LinkButton } from "@/registry/dash/ui/link-button"
import { RadioGroup, RadioItem } from "@/registry/dash/ui/radio"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/registry/dash/ui/select"
import { SocialButton } from "@/registry/dash/ui/social-button"
import { StepIndicator, Step, type StepStatus } from "@/registry/dash/ui/step-indicator"
import { Textarea } from "@/registry/dash/ui/textarea"
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/registry/dash/ui/tooltip"
import {
  DocsPageShell,
  DocsHeader,
  DocsSection,
  DocsExample,
} from "@/components/docs/page-shell"

/**
 * HR Onboarding Wizard. Ported from AlignUI HR Template (2026-05-18).
 * Source:
 *  - app/onboarding/(get-started)/{header,layout,page}.tsx
 *  - app/onboarding/steps/{header,layout,page,back-button,store,step-personal,
 *      step-role,step-position,step-password,step-summary}.tsx
 *
 * Step order (per source store.tsx + page.tsx + header.tsx):
 *   Get Started (pre-wizard) → 0 Personal → 1 Role → 2 Position → 3 Password → 4 Summary
 */

const ONBOARDING_STEPS = [
  { label: "Personal" },
  { label: "Role" },
  { label: "Position" },
  { label: "Password" },
  { label: "Summary" },
] as const

export default function HROnboardingWizardPage() {
  return (
    <DocsPageShell>
      <DocsHeader
        category="Templates / HR / Onboarding"
        title="Onboarding Wizard"
        description="Pre-wizard Get Started entry + 5-step wizard (Personal · Role · Position · Password · Summary) with horizontal stepper, back button, and footer."
      />

      <DocsSection title="Get Started (pre-wizard)">
        <DocsExample
          bare
          title="Step 0 — Join Synergy Team"
          description="Email-only entry screen with social SSO, T&C checkbox, Get Started CTA, and Login fallback link."
          preview={
            <DocsTemplatePreview>
              <GetStartedShell>
                <GetStartedForm />
              </GetStartedShell>
            </DocsTemplatePreview>
          }
          code={`<GetStartedShell>
  <GetStartedForm />
</GetStartedShell>`}
        />
      </DocsSection>

      {ONBOARDING_STEPS.map((step, i) => (
        <DocsSection key={step.label} title={`Step ${i + 1} — ${step.label}`}>
          <DocsExample
            bare
            title={`${step.label} step`}
            preview={
              <DocsTemplatePreview>
                <WizardShell activeStep={i}>
                  {i === 0 ? <StepPersonal /> : null}
                  {i === 1 ? <StepRole /> : null}
                  {i === 2 ? <StepPosition /> : null}
                  {i === 3 ? <StepPassword /> : null}
                  {i === 4 ? <StepSummary /> : null}
                </WizardShell>
              </DocsTemplatePreview>
            }
            code={`<WizardShell activeStep={${i}}>
  <Step${step.label} />
</WizardShell>`}
          />
        </DocsSection>
      ))}

      <DocsSection title="Anatomy">
        <ul className="list-disc pl-5 space-y-1.5 text-sm text-text-sub-600">
          <li><strong>Header</strong> — brand mark (left), horizontal step indicator (center), close button (right).</li>
          <li><strong>Stepper</strong> — 5 indices (Personal · Role · Position · Password · Summary).</li>
          <li><strong>Back button</strong> — absolute-positioned at top-left of the content frame; "Back" → previous step.</li>
          <li><strong>Content</strong> — 392px-wide centered form, hero icon + title + description, primary "Continue" CTA per step.</li>
          <li><strong>Step 4 Summary</strong> — read-only review card with 5 rows (Name / Username / Email / Title / Department), each with a pencil edit button + "Complete" CTA.</li>
        </ul>
      </DocsSection>
    </DocsPageShell>
  )
}

/* -------------------------------------------------------------------------- */
/* Preview frame                                                              */
/* -------------------------------------------------------------------------- */

function DocsTemplatePreview({ children }: { children: React.ReactNode }) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-stroke-soft-200 bg-bg-weak-50">
      <div className="min-w-[1280px]">{children}</div>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/* Shells                                                                     */
/* -------------------------------------------------------------------------- */

function GetStartedShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-[860px] flex-col bg-bg-white-0">
      <div className="border-b border-stroke-soft-200 bg-bg-white-0 lg:h-[88px]">
        <div className="mx-auto flex h-full w-full max-w-[1392px] items-center justify-between gap-6 px-5 lg:py-0">
          <BrandMark />
          <div className="flex gap-3">
            <div className="flex items-center gap-4">
              <span className="text-sm text-text-sub-600">Need help?</span>
              <Button tone="neutral" style="stroke" size="md" leftIcon={<RiHeadphoneLine />}>
                Contact Us
              </Button>
            </div>
            <Button tone="neutral" style="ghost" size="icon-md" aria-label="Close">
              <RiCloseLine />
            </Button>
          </div>
        </div>
      </div>
      <div className="relative isolate mx-auto flex w-full max-w-[1392px] flex-1 flex-col">
        <div className="w-full px-5">{children}</div>
        <OnboardingFooterRow />
      </div>
    </div>
  )
}

function WizardShell({
  activeStep,
  children,
}: {
  activeStep: number
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-[860px] flex-col bg-bg-white-0">
      <div className="border-b border-stroke-soft-200 bg-bg-white-0 lg:h-[88px]">
        <div className="mx-auto grid h-full w-full max-w-[1392px] grid-cols-[minmax(0,1fr),auto,minmax(0,1fr)] items-center gap-6 px-5">
          <BrandMark />
          <WizardStepper activeStep={activeStep} />
          <Button
            tone="neutral"
            style="ghost"
            size="icon-md"
            className="ml-auto"
            aria-label="Close"
          >
            <RiCloseLine />
          </Button>
        </div>
      </div>
      <div className="relative isolate mx-auto flex w-full max-w-[1392px] flex-1 flex-col">
        <div className="absolute left-[84px] top-8 hidden lg:block">
          <Button tone="neutral" style="stroke" size="xs" leftIcon={<RiArrowLeftSLine />}>
            Back
          </Button>
        </div>
        <div className="w-full px-5 py-12">{children}</div>
        <OnboardingFooterRow />
      </div>
    </div>
  )
}

function WizardStepper({ activeStep }: { activeStep: number }) {
  const getStatus = (index: number): StepStatus => {
    if (activeStep > index) return "completed"
    if (activeStep === index) return "current"
    return "upcoming"
  }
  return (
    <div className="flex w-full justify-center">
      <StepIndicator>
        {ONBOARDING_STEPS.map((step, index) => (
          <Step
            key={step.label}
            index={index}
            status={getStatus(index)}
            label={step.label}
            withConnector={index < ONBOARDING_STEPS.length - 1}
          />
        ))}
      </StepIndicator>
    </div>
  )
}

function BrandMark() {
  return (
    <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary text-static-white text-xs font-bold">
      S
    </span>
  )
}

function OnboardingFooterRow() {
  return (
    <div className="mt-auto flex items-center justify-between gap-4 px-5 py-6">
      <div className="text-sm text-text-sub-600">© 2024 Synergy HR</div>
      <div className="text-sm text-text-sub-600">English (UK)</div>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/* Shared hero icon                                                           */
/* -------------------------------------------------------------------------- */

function HeroIcon({ icon: Icon }: { icon: React.ComponentType<{ className?: string }> }) {
  return (
    <div
      className={cn(
        "relative flex size-24 shrink-0 items-center justify-center rounded-full",
        "before:absolute before:inset-0 before:rounded-full before:bg-gradient-to-b before:from-neutral-500/10 before:to-transparent",
        "after:absolute after:inset-0 after:rounded-full after:ring-1 after:ring-stroke-soft-200",
      )}
    >
      <div className="relative z-10 flex size-16 items-center justify-center rounded-full bg-bg-white-0 shadow-regular-xs ring-1 ring-inset ring-stroke-soft-200">
        <Icon className="size-8 text-text-sub-600" />
      </div>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/* Get Started form                                                           */
/* -------------------------------------------------------------------------- */

function GetStartedForm() {
  return (
    <div className="flex justify-center py-12">
      <div className="mx-auto flex w-full max-w-[392px] flex-col gap-6">
        <div className="flex flex-col items-center space-y-2">
          <HeroIcon icon={RiUserAddFill} />
          <div className="space-y-1 text-center">
            <div className="text-xl font-semibold text-text-strong-950">Join Synergy Team</div>
            <div className="text-base text-text-sub-600">Get started by submitting email address.</div>
          </div>
        </div>

        <div className="grid w-full auto-cols-fr grid-flow-col gap-3">
          <SocialButton brand="apple" style="stroke" onlyIcon />
          <SocialButton brand="google" style="stroke" onlyIcon />
          <SocialButton brand="linkedin" style="stroke" onlyIcon />
        </div>

        <ContentDivider>OR</ContentDivider>

        <div>
          <Label htmlFor="email" required>
            Email Address
          </Label>
          <InputRoot className="mt-1">
            <InputIcon>
              <RiMailLine className="size-5" />
            </InputIcon>
            <Input id="email" type="email" placeholder="hello@alignui.com" />
          </InputRoot>

          <div className="mt-4 flex items-start gap-2">
            <Checkbox id="agree" />
            <label htmlFor="agree" className="block cursor-pointer text-sm text-text-sub-600">
              I agree to the{" "}
              <LinkButton tone="neutral" underline="always">
                Terms &amp; Conditions
              </LinkButton>{" "}
              and{" "}
              <LinkButton tone="neutral" underline="always">
                Privacy Policy
              </LinkButton>
              .
            </label>
          </div>
        </div>

        <FancyButton tone="primary" size="md">
          Get Started
        </FancyButton>

        <div className="text-center text-sm text-text-sub-600">
          Already have an account?{" "}
          <LinkButton tone="neutral" underline="always">
            Login
          </LinkButton>
        </div>
      </div>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/* Step components                                                            */
/* -------------------------------------------------------------------------- */

function StepPersonal() {
  return (
    <div className="mx-auto flex w-full max-w-[392px] flex-col gap-6">
      <div className="flex flex-col items-center space-y-2">
        <HeroIcon icon={RiAccountPinBoxFill} />
        <div className="space-y-1 text-center">
          <div className="text-xl font-semibold text-text-strong-950">Personal Information</div>
          <div className="text-base text-text-sub-600">Provide essential information to proceed.</div>
        </div>
      </div>

      <Divider />

      <div className="space-y-3">
        <div className="space-y-1">
          <Label htmlFor="fullname" required>
            Full Name
          </Label>
          <InputRoot>
            <Input id="fullname" type="text" placeholder="James Brown" />
          </InputRoot>
        </div>

        <div className="space-y-1">
          <Label htmlFor="username" optional>
            Username
          </Label>
          <InputRoot>
            <InputAffix>synergy.com/</InputAffix>
            <Input id="username" type="text" placeholder="jamesbrown123" />
          </InputRoot>
        </div>

        <div className="space-y-1">
          <Label htmlFor="phone" required>
            Phone Number
          </Label>
          <InputRoot>
            <InputAffix>+1</InputAffix>
            <Input id="phone" type="tel" placeholder="(555) 000-0000" />
          </InputRoot>
        </div>
      </div>

      <FancyButton tone="primary" size="md">
        Continue
      </FancyButton>
    </div>
  )
}

function StepRole() {
  return (
    <div className="mx-auto flex w-full max-w-[392px] flex-col gap-6">
      <div className="flex flex-col items-center space-y-2">
        <HeroIcon icon={RiUserSettingsFill} />
        <div className="space-y-1 text-center">
          <div className="text-xl font-semibold text-text-strong-950">Role Selection</div>
          <div className="text-base text-text-sub-600">Choose your role within Synergy.</div>
        </div>
      </div>

      <Divider />

      <RadioGroup className="space-y-3" defaultValue="employee">
        <RoleCard
          value="employee"
          icon={RiUser2Line}
          title="I'm an Employee"
          description="Join as an employee to access Synergy."
        />
        <RoleCard
          value="employer"
          icon={RiSuitcaseLine}
          title="I'm an Employer"
          description="Join as an employer to access Synergy."
        />
      </RadioGroup>

      <FancyButton tone="primary" size="md">
        Continue
      </FancyButton>
    </div>
  )
}

function RoleCard({
  value,
  icon: Icon,
  title,
  description,
}: {
  value: string
  icon: React.ComponentType<{ className?: string }>
  title: string
  description: string
}) {
  const id = `role-${value}`
  return (
    <label
      htmlFor={id}
      className={cn(
        "flex cursor-pointer items-start gap-3.5 rounded-xl bg-bg-white-0 p-4 shadow-regular-xs ring-1 ring-inset ring-stroke-soft-200 transition duration-200 ease-out",
        "has-[[data-state=checked]]:shadow-none has-[[data-state=checked]]:ring-primary",
      )}
    >
      <div className="flex size-10 items-center justify-center rounded-full ring-1 ring-inset ring-stroke-soft-200">
        <Icon className="size-5 text-text-sub-600" />
      </div>
      <div className="flex-1 space-y-1">
        <div className="text-sm font-medium text-text-strong-950">{title}</div>
        <div className="text-xs text-text-sub-600">{description}</div>
      </div>
      <RadioItem id={id} value={value} />
    </label>
  )
}

function StepPosition() {
  const [biography, setBiography] = React.useState("")
  return (
    <div className="mx-auto flex w-full max-w-[392px] flex-col gap-6">
      <div className="flex flex-col items-center space-y-2">
        <HeroIcon icon={RiAccountPinCircleFill} />
        <div className="space-y-1 text-center">
          <div className="text-xl font-semibold text-text-strong-950">Position Selection</div>
          <div className="text-base text-text-sub-600">Select your department and title.</div>
        </div>
      </div>

      <Divider />

      <div className="space-y-3">
        <div className="space-y-1">
          <Label htmlFor="department" required>
            Select Department
            <InfoTooltip text="Choose a department from the list." />
          </Label>
          <Select>
            <SelectTrigger id="department">
              <SelectValue placeholder="e.g. Human Resources" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="human-resources">Human Resources</SelectItem>
              <SelectItem value="sales">Sales</SelectItem>
              <SelectItem value="it">IT</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1">
          <Label htmlFor="title">
            Select Title
            <InfoTooltip text="Pick a title for the selected department." />
          </Label>
          <Select>
            <SelectTrigger id="title">
              <SelectValue placeholder="Your Title" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="frontend">Frontend</SelectItem>
              <SelectItem value="backend">Backend</SelectItem>
              <SelectItem value="fullstack">Fullstack</SelectItem>
              <SelectItem value="devops">Devops</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1">
          <Label htmlFor="biography" required optional>
            Biography
            <InfoTooltip text="Enter a brief biography or personal description." />
          </Label>
          <Textarea
            id="biography"
            placeholder="Describe yourself..."
            className="min-h-[58px]"
            value={biography}
            onChange={(e) => setBiography(e.target.value)}
            maxLength={200}
          />
          <div className="flex items-center justify-between gap-2">
            <Hint>It will be displayed on your profile.</Hint>
            <span className="text-xs text-text-soft-400">{biography.length}/200</span>
          </div>
        </div>
      </div>

      <FancyButton tone="primary" size="md">
        Continue
      </FancyButton>

      <div className="text-center text-sm text-text-sub-600">
        Want to fill in later?{" "}
        <LinkButton tone="neutral" underline="always">
          Skip this step
        </LinkButton>
      </div>
    </div>
  )
}

function InfoTooltip({ text }: { text: string }) {
  return (
    <TooltipProvider><Tooltip>
      <TooltipTrigger asChild>
        <button type="button" aria-label="More info" className="inline-flex">
          <RiInformationFill className="size-5 text-text-disabled-300" />
        </button>
      </TooltipTrigger>
      <TooltipContent side="top">{text}</TooltipContent>
    </Tooltip></TooltipProvider>
  )
}

function StepPassword() {
  const [password, setPassword] = React.useState("")
  const [confirmPassword, setConfirmPassword] = React.useState("")
  const [showPwd, setShowPwd] = React.useState(false)
  const [showConfirm, setShowConfirm] = React.useState(false)

  const criteria = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    number: /[0-9]/.test(password),
  }
  const trueCount = Object.values(criteria).filter(Boolean).length

  return (
    <div className="mx-auto flex w-full max-w-[392px] flex-col gap-6">
      <div className="flex flex-col items-center space-y-2">
        <HeroIcon icon={RiLockFill} />
        <div className="space-y-1 text-center">
          <div className="text-xl font-semibold text-text-strong-950">Password Setup</div>
          <div className="text-base text-text-sub-600">Set up a secure password to protect your account.</div>
        </div>
      </div>

      <Divider />

      <div>
        <div className="space-y-3">
          <div className="space-y-1">
            <Label htmlFor="password" required>
              Create a Password
            </Label>
            <InputRoot>
              <InputIcon>
                <RiLock2Line className="size-5" />
              </InputIcon>
              <Input
                id="password"
                type={showPwd ? "text" : "password"}
                placeholder="••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowPwd((s) => !s)}
                className="inline-flex size-7 items-center justify-center text-text-soft-400 mr-0.5"
                aria-label={showPwd ? "Hide password" : "Show password"}
              >
                {showPwd ? <RiEyeOffLine className="size-5" /> : <RiEyeLine className="size-5" />}
              </button>
            </InputRoot>
          </div>

          <div className="space-y-1">
            <Label htmlFor="confirm-password" required>
              Confirm Password
            </Label>
            <InputRoot>
              <InputIcon>
                <RiLock2Line className="size-5" />
              </InputIcon>
              <Input
                id="confirm-password"
                type={showConfirm ? "text" : "password"}
                placeholder="••••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowConfirm((s) => !s)}
                className="inline-flex size-7 items-center justify-center text-text-soft-400 mr-0.5"
                aria-label={showConfirm ? "Hide password" : "Show password"}
              >
                {showConfirm ? <RiEyeOffLine className="size-5" /> : <RiEyeLine className="size-5" />}
              </button>
            </InputRoot>
          </div>
        </div>

        <div className="mt-2.5 space-y-2">
          <PasswordLevelBar level={trueCount} />
          <div className="text-xs text-text-sub-600">Must contain at least;</div>
          <CriteriaLine ok={criteria.uppercase} label="At least 1 uppercase" />
          <CriteriaLine ok={criteria.number} label="At least 1 number" />
          <CriteriaLine ok={criteria.length} label="At least 8 characters" />
        </div>
      </div>

      <FancyButton tone="primary" size="md">
        Continue
      </FancyButton>
    </div>
  )
}

function PasswordLevelBar({ level }: { level: number }) {
  return (
    <div className="flex gap-1">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className={cn(
            "h-1 flex-1 rounded-full",
            i < level ? "bg-(--state-success-base)" : "bg-bg-soft-200",
          )}
        />
      ))}
    </div>
  )
}

function CriteriaLine({ ok, label }: { ok: boolean; label: string }) {
  return (
    <div className="flex items-center gap-1.5 text-xs text-text-sub-600">
      {ok ? (
        <RiCheckboxCircleFill className="size-4 shrink-0 text-(--state-success-base)" />
      ) : (
        <RiCloseCircleFill className="size-4 shrink-0 text-text-soft-400" />
      )}
      {label}
    </div>
  )
}

function StepSummary() {
  return (
    <div className="mx-auto flex w-full max-w-[392px] flex-col gap-6">
      <div className="flex flex-col items-center space-y-2">
        <HeroIcon icon={RiCheckboxCircleFill} />
        <div className="space-y-1 text-center">
          <div className="text-xl font-semibold text-text-strong-950">Onboarding Summary</div>
          <div className="text-base text-text-sub-600">Review and complete your account setup.</div>
        </div>
      </div>

      <div className="space-y-4 rounded-2xl bg-bg-white-0 px-4 py-[15px] ring-1 ring-inset ring-stroke-soft-200">
        <SummaryRow icon={RiAccountPinBoxLine} label="Full Name" value="James Brown" />
        <Divider />
        <SummaryRow icon={RiAtLine} label="Username" value="@jamesbrown" />
        <Divider />
        <SummaryRow icon={RiMailLine} label="Email Address" value="james@alignui.com" />
        <Divider />
        <SummaryRow icon={RiAccountPinCircleLine} label="Title" value="Marketing Manager" />
        <Divider />
        <SummaryRow icon={RiBuilding2Line} label="Department" value="Marketing" />
      </div>

      <FancyButton tone="primary" size="md">
        Complete
      </FancyButton>
    </div>
  )
}

function SummaryRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: string
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-bg-weak-50">
        <Icon className="size-5 text-text-sub-600" />
      </div>
      <div className="flex-1 space-y-1">
        <div className="text-xs font-medium uppercase tracking-wide text-text-sub-600">{label}</div>
        <div className="text-sm font-medium text-text-strong-950">{value}</div>
      </div>
      <Button tone="neutral" style="ghost" size="icon-xs" aria-label="Edit">
        <RiPencilLine />
      </Button>
    </div>
  )
}
