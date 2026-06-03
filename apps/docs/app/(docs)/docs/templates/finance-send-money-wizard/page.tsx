"use client"

import * as React from "react"
import {
  RiAddLine,
  RiArrowDownSLine,
  RiArrowLeftSLine,
  RiArrowRightSLine,
  RiBankFill,
  RiBankLine,
  RiCloseLine,
  RiHeadphoneLine,
  RiInformationFill,
  RiMoneyDollarCircleFill,
  RiSearch2Line,
  RiUser6Fill,
} from "@remixicon/react"

import { cn } from "@/registry/dash/lib/utils"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  AvatarIndicator,
} from "@/registry/dash/ui/avatar"
import { Badge } from "@/registry/dash/ui/badge"
import { Button } from "@/registry/dash/ui/button"
import { CompactButton } from "@/registry/dash/ui/compact-button"
import { Divider, ContentDivider } from "@/registry/dash/ui/divider"
import { Hint } from "@/registry/dash/ui/hint"
import {
  InputRoot,
  Input,
  InputIcon,
  InputAffix,
} from "@/registry/dash/ui/input"
import { Label } from "@/registry/dash/ui/label"
import { LinkButton } from "@/registry/dash/ui/link-button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/registry/dash/ui/select"
import { StepIndicator, Step, type StepStatus } from "@/registry/dash/ui/step-indicator"
import { Switch } from "@/registry/dash/ui/switch"
import { Textarea } from "@/registry/dash/ui/textarea"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/registry/dash/ui/tooltip"
import {
  DocsPageShell,
  DocsHeader,
  DocsSection,
  DocsExample,
} from "@/components/docs/page-shell"
import { DocsCode } from "@/components/docs/code-block"

/**
 * Finance — Send Money Wizard (deep). Ported from AlignUI Finance Template
 * `app/send-money/{page,sidebar,store,step-1,step-2,step-3,step-4}.tsx`
 * (2026-05-19).
 *
 * 4-step wizard, vertical stepper on the left rail, full step content in the
 * center column. Step controlled via local React state (source uses jotai
 * activeStepAtom — translation: jotai → useState for self-contained preview).
 *
 * Verbatim step labels from source `FLOW_STEPS`:
 *   1. Recipient Selection
 *   2. Method & Details
 *   3. Source & Amount
 *   4. Transfer Summary
 */
export default function FinanceSendMoneyWizardPage() {
  return (
    <TooltipProvider>
      <DocsPageShell>
        <DocsHeader
          category="Templates / Finance"
          title="Send money wizard (deep)"
          description="Full 4-step send-money flow with vertical stepper sidebar, animated step content, and Prev/Next/Close controls. All 4 step cards rendered as interactive preview — switch between them via the stepper or the mobile pager controls."
        />

        <DocsSection title="Full preview — interactive 4-step wizard">
          <DocsExample
            bare
            title="Apex — Send Money (Recipient → Method → Source → Summary)"
            preview={
              <DocsTemplatePreview>
                <SendMoneyWizard />
              </DocsTemplatePreview>
            }
            code={WIZARD_SNIPPET}
          />
        </DocsSection>

        <DocsSection title="Step 1 — Recipient Selection (in isolation)">
          <DocsExample
            bare
            title="Step 1"
            preview={
              <DocsTemplatePreview>
                <StepStandalone>
                  <Step1 />
                </StepStandalone>
              </DocsTemplatePreview>
            }
            code={STEP1_SNIPPET}
          />
        </DocsSection>

        <DocsSection title="Step 2 — Method & Details (in isolation)">
          <DocsExample
            bare
            title="Step 2"
            preview={
              <DocsTemplatePreview>
                <StepStandalone>
                  <Step2 />
                </StepStandalone>
              </DocsTemplatePreview>
            }
            code={STEP2_SNIPPET}
          />
        </DocsSection>

        <DocsSection title="Step 3 — Source & Amount (in isolation)">
          <DocsExample
            bare
            title="Step 3"
            preview={
              <DocsTemplatePreview>
                <StepStandalone>
                  <Step3 />
                </StepStandalone>
              </DocsTemplatePreview>
            }
            code={STEP3_SNIPPET}
          />
        </DocsSection>

        <DocsSection title="Step 4 — Transfer Summary (in isolation)">
          <DocsExample
            bare
            title="Step 4"
            preview={
              <DocsTemplatePreview>
                <StepStandalone>
                  <Step4 />
                </StepStandalone>
              </DocsTemplatePreview>
            }
            code={STEP4_SNIPPET}
          />
        </DocsSection>

        <DocsSection title="Anatomy">
          <ul className="list-disc space-y-1.5 pl-6 text-sm text-text-sub-600">
            <li>
              <strong>Layout</strong> — desktop: 264px sidebar + 1392px content
              max; mobile: pager strip + progress bar + step indicator pill.
            </li>
            <li>
              <strong>FlowSidebar</strong> — vertical{" "}
              <code>StepIndicator</code> with 4 <code>Step</code> items, status
              from active index (current / completed / upcoming).
            </li>
            <li>
              <strong>Mobile header</strong> — Prev/Next ghost buttons + Close
              icon + progress bar (linear fill % of <code>FLOW_STEPS.length</code>) +
              active-step pill ("1/4").
            </li>
            <li>
              <strong>Step content</strong> — every step is a 572px max-w
              centered column with a halo IconBadge, h6/h5 title, paragraph
              description, and a primary card body 400px wide.
            </li>
            <li>
              <strong>Step 1</strong> — Search input (with <code>Kbd</code> hint
              ⌘1) + recipient list (3 avatar rows + 1 initials row) + "New
              Recipient" stroke button.
            </li>
            <li>
              <strong>Step 2</strong> — recipient header row + payment-method
              Select + bank details row + Back / Next.
            </li>
            <li>
              <strong>Step 3</strong> — funding source row + amount input (with{" "}
              <code>$</code> inline affix) + description Textarea + recurring{" "}
              <code>Switch</code> + Back / Next.
            </li>
            <li>
              <strong>Step 4</strong> — hero amount ($8,400.00) + 3 grouped
              summary blocks (Recipient Details / Funding Source / Description)
              + Discard / Send Money + legal microcopy.
            </li>
            <li>
              <strong>Mobile sidebar fallback</strong> — bottom contact CTA +
              copyright (also visible at full width when no rail).
            </li>
          </ul>
        </DocsSection>

        <DocsSection title="Step labels (verbatim, from `FLOW_STEPS`)">
          <DocsCode
            language="ts"
            code={`export const FLOW_STEPS = [
  { label: 'Recipient Selection', indicator: '1' },
  { label: 'Method & Details',    indicator: '2' },
  { label: 'Source & Amount',     indicator: '3' },
  { label: 'Transfer Summary',    indicator: '4' },
]`}
          />
        </DocsSection>

        <DocsSection title="Primitive substitutions">
          <ul className="list-disc space-y-1.5 pl-6 text-sm text-text-sub-600">
            <li>
              <code>VerticalStepper.Root</code> /{" "}
              <code>VerticalStepper.Item</code> /{" "}
              <code>VerticalStepper.ItemIndicator</code> /{" "}
              <code>VerticalStepper.Arrow</code> → Dash{" "}
              <code>@/registry/dash/ui/step-indicator</code>{" "}
              <code>StepIndicator orientation="vertical"</code> +{" "}
              <code>Step status=…</code> (current/completed/upcoming).
            </li>
            <li>
              <code>jotai activeStepAtom</code> → <code>useState&lt;number&gt;</code>.
            </li>
            <li>
              <code>Radix TabsPrimitive.Root / List / Trigger / Content</code> →
              flat conditional render driven by active step.
            </li>
            <li>
              <code>Kbd.Root</code> + custom ⌘ glyph → keep as inline span for now
              (Dash <code>Kbd</code> primitive exists; substituted to a small
              styled token to avoid breaking shape).
            </li>
            <li>
              <code>Divider.Root variant="solid-text"</code> →{" "}
              <code>ContentDivider variant="solid"</code>.
            </li>
            <li>
              <code>Divider.Root variant="text"</code> →{" "}
              <code>ContentDivider variant="line"</code>.
            </li>
            <li>
              <code>Divider.Root variant="line-spacing"</code> →{" "}
              <code>Divider</code> with extra wrapper padding.
            </li>
            <li>
              <code>Avatar.Root color="blue"/"purple" + initials</code> →{" "}
              <code>Avatar</code> + <code>AvatarFallback</code> with explicit
              brand bg color class.
            </li>
            <li>
              <code>Input.InlineAffix</code> → <code>InputAffix</code>.
            </li>
            <li>
              <code>Tooltip.Root/Trigger/Content size="xsmall"</code> → Dash{" "}
              <code>Tooltip</code> +{" "}
              <code>TooltipContent size="xs"</code> (must be wrapped in{" "}
              <code>TooltipProvider</code> — already done at page root).
            </li>
          </ul>
        </DocsSection>
      </DocsPageShell>
    </TooltipProvider>
  )
}

/* -------------------------------------------------------------------------- */
/* Shared preview frame                                                        */
/* -------------------------------------------------------------------------- */

function DocsTemplatePreview({ children }: { children: React.ReactNode }) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-stroke-soft-200 bg-bg-weak-50">
      <div className="min-w-[1280px]">{children}</div>
    </div>
  )
}

function StepStandalone({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex w-full justify-center bg-bg-white-0 py-12">
      {children}
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/* FLOW_STEPS — verbatim from source store.ts                                  */
/* -------------------------------------------------------------------------- */

const FLOW_STEPS = [
  { label: "Recipient Selection", indicator: "1" },
  { label: "Method & Details", indicator: "2" },
  { label: "Source & Amount", indicator: "3" },
  { label: "Transfer Summary", indicator: "4" },
] as const
const MAX_STEP = FLOW_STEPS.length - 1
const MIN_STEP = 0

/* -------------------------------------------------------------------------- */
/* Wizard                                                                      */
/* -------------------------------------------------------------------------- */

function SendMoneyWizard() {
  const [activeStep, setActiveStep] = React.useState(0)

  const getStatus = (i: number): StepStatus => {
    if (activeStep > i) return "completed"
    if (activeStep === i) return "current"
    return "upcoming"
  }

  const renderStep = () => {
    switch (activeStep) {
      case 0:
        return <Step1 />
      case 1:
        return <Step2 />
      case 2:
        return <Step3 />
      case 3:
        return <Step4 />
      default:
        return null
    }
  }

  return (
    <div className="flex min-h-[920px] flex-col lg:grid lg:grid-cols-[auto,minmax(0,1fr)] lg:items-start bg-bg-white-0">
      {/* Mobile rail (visible always in preview at smaller widths; preview min is 1280, so just keep desktop) */}
      <MobileBar
        activeStep={activeStep}
        setActiveStep={setActiveStep}
      />

      {/* Desktop sidebar */}
      <div className="hidden flex-1 flex-col self-stretch p-2 lg:flex">
        <div className="flex w-[264px] flex-1 shrink-0 flex-col gap-3 rounded-2xl bg-bg-weak-50 px-4 pb-4 pt-6">
          <div className="w-full flex-1">
            <div className="mb-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-text-soft-400">
              Transfer Sequence
            </div>
            <StepIndicator orientation="vertical" className="w-[232px] shrink-0">
              {FLOW_STEPS.map((step, i) => (
                <Step
                  key={step.indicator}
                  index={i}
                  status={getStatus(i)}
                  orientation="vertical"
                  withConnector={false}
                  label={step.label}
                  onClick={() => setActiveStep(i)}
                  role="button"
                  tabIndex={0}
                  className="cursor-pointer"
                />
              ))}
            </StepIndicator>
          </div>

          <div className="flex flex-col gap-4 text-center">
            <div className="text-sm text-text-sub-600">
              Having trouble with transfer?
            </div>
            <Button tone="neutral" style="stroke" size="md" leftIcon={<RiHeadphoneLine />}>
              Contact
            </Button>
          </div>

          <div className="text-center text-xs text-text-soft-400">
            © 2023 Apex Financial
          </div>
        </div>
      </div>

      {/* Content area */}
      <div className="relative isolate mx-auto flex w-full max-w-[1392px] flex-1 flex-col">
        <div className="absolute right-8 top-6 hidden lg:flex">
          <Button tone="neutral" style="ghost" size="icon-sm" aria-label="Close">
            <RiCloseLine />
          </Button>
        </div>

        <div className="flex w-full justify-center py-12 transition-all duration-300">
          {renderStep()}
        </div>
      </div>
    </div>
  )
}

function MobileBar({
  activeStep,
  setActiveStep,
}: {
  activeStep: number
  setActiveStep: (i: number) => void
}) {
  const goPrev = () => setActiveStep(Math.max(activeStep - 1, MIN_STEP))
  const goNext = () => setActiveStep(Math.min(activeStep + 1, MAX_STEP))
  return (
    <div className="border-b border-stroke-soft-200 lg:hidden">
      <div className="px-2.5 pb-3.5 pt-2.5">
        <div className="relative flex h-9 items-center justify-between">
          <div className="flex gap-2">
            <Button
              tone="neutral"
              style="stroke"
              size="sm"
              onClick={goPrev}
              disabled={activeStep === MIN_STEP}
              leftIcon={<RiArrowLeftSLine />}
            >
              Prev
            </Button>
            <Button
              tone="neutral"
              style="stroke"
              size="sm"
              onClick={goNext}
              disabled={activeStep === MAX_STEP}
              leftIcon={<RiArrowRightSLine />}
            >
              Next
            </Button>
          </div>
          <Button tone="neutral" style="ghost" size="icon-sm" aria-label="Close">
            <RiCloseLine />
          </Button>
        </div>
      </div>
      <div className="h-1 w-full bg-bg-soft-200">
        <div
          className="h-full bg-(--primary-base) transition-all duration-200 ease-out"
          style={{
            width: `${(100 / FLOW_STEPS.length) * (activeStep + 1)}%`,
          }}
        />
      </div>
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center gap-2">
          <div className="flex size-5 items-center justify-center rounded-full bg-(--primary-base) text-[10px] font-medium text-static-white">
            {FLOW_STEPS[activeStep].indicator}
          </div>
          <span className="text-sm text-text-strong-950">
            {FLOW_STEPS[activeStep].label}
          </span>
        </div>
        <div className="text-right text-sm text-text-soft-400">
          {activeStep + 1}/{FLOW_STEPS.length}
        </div>
      </div>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/* Halo icon                                                                   */
/* -------------------------------------------------------------------------- */

function IconHalo({ children }: { children: React.ReactNode }) {
  return (
    <div
      className={cn(
        "relative flex size-[68px] shrink-0 items-center justify-center rounded-full backdrop-blur-xl lg:size-24",
        "before:absolute before:inset-0 before:rounded-full",
        "before:bg-gradient-to-b before:from-neutral-500 before:to-transparent before:opacity-10",
      )}
    >
      <div className="relative z-10 flex size-12 items-center justify-center rounded-full bg-bg-white-0 shadow-regular-xs ring-1 ring-inset ring-stroke-soft-200 lg:size-16">
        {children}
      </div>
    </div>
  )
}

function StepHero({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode
  title: string
  description: string
}) {
  return (
    <div className="flex w-full flex-col items-center gap-2">
      <IconHalo>{icon}</IconHalo>
      <div className="space-y-1 text-center">
        <div className="text-lg font-semibold tracking-tight text-text-strong-950 lg:text-xl">
          {title}
        </div>
        <div className="text-sm text-text-sub-600 lg:text-base">
          {description}
        </div>
      </div>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/* Step 1 — Recipient Selection                                                */
/* -------------------------------------------------------------------------- */

function CmdKbd({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1 rounded border border-stroke-soft-200 bg-bg-weak-50 px-1.5 py-0.5 text-[10px] font-medium text-text-sub-600">
      <span className="text-[8px]">⌘</span>
      {children}
    </span>
  )
}

function RecipientRow({
  name,
  detail,
  badge,
  avatarSrc,
  initials,
  avatarColor,
  withDot,
}: {
  name: string
  detail: string
  badge: string
  avatarSrc?: string
  initials?: string
  avatarColor?: string
  withDot?: boolean
}) {
  return (
    <div className="flex items-center gap-3 p-2">
      <Avatar size="lg" className="shrink-0">
        {avatarSrc ? <AvatarImage src={avatarSrc} alt={name} /> : null}
        <AvatarFallback className={cn(avatarColor, "text-static-white")}>
          {initials ?? name.slice(0, 2).toUpperCase()}
        </AvatarFallback>
        {withDot ? (
          <AvatarIndicator
            position="top-right"
            tone="online"
            size="lg"
          />
        ) : null}
      </Avatar>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-text-strong-950">{name}</div>
        <div className="mt-1 text-xs text-text-sub-600">{detail}</div>
      </div>
      <Badge status="neutral" appearance="lighter" size="md">
        {badge}
      </Badge>
    </div>
  )
}

function Step1() {
  return (
    <div className="flex w-full max-w-[572px] shrink-0 flex-col items-center gap-6 px-4">
      <StepHero
        icon={<RiUser6Fill className="size-6 text-text-sub-600 lg:size-8" />}
        title="Recipient Selection"
        description="Select who will receive your money transfer."
      />

      <div className="flex w-full shrink-0 flex-col gap-3 min-[390px]:w-[352px]">
        <div className="flex flex-col gap-1">
          <Label htmlFor="recip-search">Choose Recipient</Label>
          <InputRoot size="lg">
            <InputIcon>
              <RiSearch2Line className="size-5" />
            </InputIcon>
            <Input id="recip-search" placeholder="Search for recipients..." />
            <CmdKbd>1</CmdKbd>
          </InputRoot>
        </div>

        <div className="flex flex-col gap-1 rounded-[20px] bg-bg-white-0 p-2 pt-3 shadow-regular-xs ring-1 ring-inset ring-stroke-soft-200">
          <ContentDivider variant="line">Saved Recipients</ContentDivider>

          <RecipientRow
            name="James Brown"
            detail="james@alignui.com"
            badge="A-52112"
            avatarSrc="/images/avatar/illustration/james.png"
            initials="JB"
            withDot
          />
          <Divider className="my-1" />

          <RecipientRow
            name="Sophia Williams"
            detail="+44 01 2345 6789"
            badge="A-52132"
            avatarSrc="/images/avatar/illustration/sophia.png"
            initials="SW"
          />
          <Divider className="my-1" />

          <RecipientRow
            name="Emma Wright"
            detail="james@alignui.com"
            badge="A-52184"
            initials="EW"
            avatarColor="bg-(--dash-blue-500)"
          />
          <Divider className="my-1" />

          <RecipientRow
            name="Matthew Johnson"
            detail="+1 (456) 789-0123"
            badge="A-52114"
            initials="MJ"
            avatarColor="bg-(--dash-purple-500)"
          />

          <div className="p-2">
            <Button
              tone="neutral"
              style="stroke"
              size="sm"
              className="w-full"
              leftIcon={<RiAddLine />}
            >
              New Recipient
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/* Step 2 — Method & Details                                                   */
/* -------------------------------------------------------------------------- */

function Step2() {
  return (
    <div className="flex w-full max-w-[572px] shrink-0 flex-col items-center gap-6 px-4">
      <StepHero
        icon={<RiBankFill className="size-6 text-text-sub-600 lg:size-8" />}
        title="Method & Details"
        description="Select a payment method and see recipient bank details."
      />

      <div className="w-full shrink-0 rounded-[20px] bg-bg-white-0 shadow-regular-xs ring-1 ring-inset ring-stroke-soft-200 min-[420px]:w-[400px]">
        <div className="flex items-center gap-3.5 p-4">
          <Avatar size="lg" className="shrink-0">
            <AvatarImage src="/images/avatar/illustration/james.png" alt="James Brown" />
            <AvatarFallback>JB</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium text-text-strong-950">James Brown</div>
            <div className="mt-1 text-xs text-text-sub-600">james@alignui.com</div>
          </div>
          <LinkButton tone="primary" size="md">
            Edit
          </LinkButton>
        </div>

        <ContentDivider variant="solid">Payment Method</ContentDivider>

        <div className="flex flex-col gap-1 p-4">
          <Label htmlFor="payment-method" required>
            <span>Select Payment Method</span>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  aria-label="More info"
                  className="inline-flex"
                >
                  <RiInformationFill className="size-5 text-text-disabled-300" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="top" size="xs">
                Choose your preferred payment option for completing the purchase.
              </TooltipContent>
            </Tooltip>
          </Label>

          <Select defaultValue="wire">
            <SelectTrigger id="payment-method">
              <SelectValue placeholder="Select a payment method" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="wire">Wire</SelectItem>
              <SelectItem value="credit-card">Credit Card</SelectItem>
              <SelectItem value="paypal">PayPal</SelectItem>
              <SelectItem value="apple-pay">Apple Pay</SelectItem>
              <SelectItem value="google-pay">Google Pay</SelectItem>
            </SelectContent>
          </Select>

          <Hint>Same-day transfer, no fees.</Hint>
        </div>

        <ContentDivider variant="solid">Recipient&rsquo;s Bank Details</ContentDivider>

        <div className="flex items-center gap-3.5 p-4">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-bg-white-0 shadow-regular-xs ring-1 ring-inset ring-stroke-soft-200">
            <RiBankLine className="size-5 text-text-sub-600" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium text-text-strong-950">
              Summit Finance International
            </div>
            <div className="mt-1 text-xs text-text-sub-600">
              Account ••9876 · Routing ••5432
            </div>
          </div>
          <LinkButton tone="primary" size="md">
            Edit
          </LinkButton>
        </div>

        <Divider />

        <div className="grid grid-cols-2 gap-4 p-4">
          <Button tone="neutral" style="stroke" size="lg">
            Back
          </Button>
          <Button tone="primary" style="filled" size="lg">
            Next
          </Button>
        </div>
      </div>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/* Step 3 — Source & Amount                                                    */
/* -------------------------------------------------------------------------- */

function Step3() {
  return (
    <div className="flex w-full max-w-[572px] shrink-0 flex-col items-center gap-6 px-4">
      <StepHero
        icon={<RiMoneyDollarCircleFill className="size-6 text-text-sub-600 lg:size-8" />}
        title="Source & Amount"
        description="Choose the funding source and enter the amount to send money."
      />

      <div className="w-full shrink-0 rounded-[20px] bg-bg-white-0 shadow-regular-xs ring-1 ring-inset ring-stroke-soft-200 min-[420px]:w-[400px]">
        <div className="flex items-center gap-3.5 py-4 pl-6 pr-6">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-bg-white-0 shadow-regular-xs ring-1 ring-inset ring-stroke-soft-200">
            <RiBankLine className="size-5 text-text-sub-600" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium text-text-strong-950">
              Checking ••0123
            </div>
            <div className="mt-1 text-xs text-text-sub-600">
              Available: $15,000.00
            </div>
          </div>
          <CompactButton variant="stroke" size="md" aria-label="Switch source">
            <RiArrowDownSLine />
          </CompactButton>
        </div>

        <ContentDivider variant="solid">Recipient Receives</ContentDivider>

        <div className="flex flex-col gap-3 p-4">
          <div className="flex flex-col gap-1">
            <Label htmlFor="amount">
              <span>Enter Amount</span>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    aria-label="More info"
                    className="inline-flex"
                  >
                    <RiInformationFill className="size-5 text-text-disabled-300" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="top" size="xs">
                  Specify the amount you wish to pay or transfer.
                </TooltipContent>
              </Tooltip>
            </Label>

            <InputRoot size="lg">
              <InputAffix>$</InputAffix>
              <Input id="amount" placeholder="0.00" />
            </InputRoot>
          </div>

          <div className="flex flex-col gap-1">
            <Label htmlFor="description" optional>
              Description
            </Label>
            <Textarea
              id="description"
              placeholder="The message you wish to send to the recipient..."
              className="min-h-[66px]"
            />
            <div className="flex justify-end text-xs text-text-soft-400">
              0/200
            </div>
          </div>
        </div>

        <Divider />

        <div className="flex items-center gap-2 px-6 py-4">
          <Switch id="recurring" />
          <label htmlFor="recurring" className="text-sm text-text-strong-950">
            Recurring payment
          </label>
        </div>

        <Divider />

        <div className="grid grid-cols-2 gap-4 px-6 py-4">
          <Button tone="neutral" style="stroke" size="md">
            Back
          </Button>
          <Button tone="primary" style="filled" size="md">
            Next
          </Button>
        </div>
      </div>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/* Step 4 — Transfer Summary                                                   */
/* -------------------------------------------------------------------------- */

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="text-sm text-text-sub-600">{label}</div>
      <div className="text-right text-sm font-medium text-text-strong-950">
        {value}
      </div>
    </div>
  )
}

function Step4() {
  return (
    <div className="flex w-full max-w-[572px] shrink-0 flex-col items-center gap-6 px-4">
      <StepHero
        icon={<RiMoneyDollarCircleFill className="size-6 text-text-sub-600 lg:size-8" />}
        title="Transfer Summary"
        description="Review summary and confirm it before finalizing your transfer."
      />

      <div className="w-full shrink-0 rounded-[20px] bg-bg-white-0 shadow-regular-xs ring-1 ring-inset ring-stroke-soft-200 min-[420px]:w-[400px]">
        <div className="p-4 text-center">
          <div className="text-xs text-text-sub-600">Wire to James Brown</div>
          <div className="mt-1 text-3xl font-semibold tracking-tight text-text-strong-950">
            $8,400.00
          </div>
        </div>

        <ContentDivider variant="solid">Recipient Details</ContentDivider>

        <div className="flex flex-col gap-2 p-4">
          <SummaryRow label="Recipient" value="James Brown" />
          <SummaryRow label="Bank" value="Summit Finance Intl." />
          <SummaryRow label="Account Number" value="123450123" />
          <SummaryRow label="Routing Number" value="98765432" />
        </div>

        <ContentDivider variant="solid">Funding Source</ContentDivider>

        <div className="flex flex-col gap-2 p-4">
          <SummaryRow label="From" value="Apex Financial, Inc." />
          <SummaryRow label="Account" value="Checking ••0123" />
        </div>

        <ContentDivider variant="solid">Description</ContentDivider>

        <div className="flex flex-col gap-2 p-4">
          <SummaryRow label="Sender’s Note" value="Best wishes!" />
        </div>

        <Divider />

        <div className="grid grid-cols-2 gap-4 px-6 py-4">
          <Button tone="neutral" style="stroke" size="md">
            Discard
          </Button>
          <Button tone="primary" style="filled" size="md">
            Send Money
          </Button>
        </div>

        <div className="px-4 pb-4 text-center text-xs text-text-soft-400">
          By clicking Send Money, I grant Apex permission to proceed with the
          detailed transaction.
        </div>
      </div>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/* Code snippets                                                               */
/* -------------------------------------------------------------------------- */

const WIZARD_SNIPPET = `const FLOW_STEPS = [
  { label: 'Recipient Selection', indicator: '1' },
  { label: 'Method & Details',    indicator: '2' },
  { label: 'Source & Amount',     indicator: '3' },
  { label: 'Transfer Summary',    indicator: '4' },
]

function SendMoneyWizard() {
  const [active, setActive] = React.useState(0)
  const status = (i: number) =>
    active > i ? 'completed' : active === i ? 'current' : 'upcoming'

  return (
    <div className="grid grid-cols-[auto,1fr]">
      <aside className="w-[264px] rounded-2xl bg-bg-weak-50 p-4">
        <h2 className="mb-3 text-[10px] uppercase tracking-wide text-text-soft-400">
          Transfer Sequence
        </h2>
        <StepIndicator orientation="vertical">
          {FLOW_STEPS.map((s, i) => (
            <Step
              key={s.indicator}
              index={i}
              status={status(i)}
              orientation="vertical"
              label={s.label}
              onClick={() => setActive(i)}
            />
          ))}
        </StepIndicator>
      </aside>

      <main className="py-12 flex justify-center">
        {active === 0 && <Step1 />}
        {active === 1 && <Step2 />}
        {active === 2 && <Step3 />}
        {active === 3 && <Step4 />}
      </main>
    </div>
  )
}`

const STEP1_SNIPPET = `<Step1>
  <StepHero icon={<RiUser6Fill />} title="Recipient Selection"
            description="Select who will receive your money transfer." />

  <Label htmlFor="recip-search">Choose Recipient</Label>
  <InputRoot size="lg">
    <InputIcon><RiSearch2Line /></InputIcon>
    <Input placeholder="Search for recipients..." />
    <Kbd>⌘ 1</Kbd>
  </InputRoot>

  <Card>
    <ContentDivider variant="line">Saved Recipients</ContentDivider>
    <RecipientRow name="James Brown"     detail="james@alignui.com"  badge="A-52112" withDot />
    <RecipientRow name="Sophia Williams" detail="+44 01 2345 6789"   badge="A-52132" />
    <RecipientRow name="Emma Wright"     detail="james@alignui.com"  badge="A-52184" initials="EW" />
    <RecipientRow name="Matthew Johnson" detail="+1 (456) 789-0123"  badge="A-52114" initials="MJ" />
    <Button tone="neutral" style="stroke" leftIcon={<RiAddLine />} className="w-full">
      New Recipient
    </Button>
  </Card>
</Step1>`

const STEP2_SNIPPET = `<Step2>
  <StepHero icon={<RiBankFill />} title="Method & Details"
            description="Select a payment method and see recipient bank details." />

  <Card>
    <RecipientHeader name="James Brown" detail="james@alignui.com">
      <LinkButton tone="primary">Edit</LinkButton>
    </RecipientHeader>

    <ContentDivider variant="solid">Payment Method</ContentDivider>
    <Label required>
      Select Payment Method
      <Tooltip><TooltipTrigger>…</TooltipTrigger>
        <TooltipContent size="xs">Choose your preferred payment option…</TooltipContent>
      </Tooltip>
    </Label>
    <Select defaultValue="wire">
      <SelectTrigger><SelectValue /></SelectTrigger>
      <SelectContent>
        <SelectItem value="wire">Wire</SelectItem>
        <SelectItem value="credit-card">Credit Card</SelectItem>
        <SelectItem value="paypal">PayPal</SelectItem>
        <SelectItem value="apple-pay">Apple Pay</SelectItem>
        <SelectItem value="google-pay">Google Pay</SelectItem>
      </SelectContent>
    </Select>
    <Hint>Same-day transfer, no fees.</Hint>

    <ContentDivider variant="solid">Recipient's Bank Details</ContentDivider>
    <BankRow name="Summit Finance International" detail="Account ••9876 · Routing ••5432" />

    <Divider />
    <Grid cols={2}>
      <Button tone="neutral" style="stroke">Back</Button>
      <Button tone="primary">Next</Button>
    </Grid>
  </Card>
</Step2>`

const STEP3_SNIPPET = `<Step3>
  <StepHero icon={<RiMoneyDollarCircleFill />} title="Source & Amount"
            description="Choose the funding source and enter the amount to send money." />

  <Card>
    <SourceRow name="Checking ••0123" detail="Available: \\$15,000.00">
      <CompactButton variant="stroke"><RiArrowDownSLine /></CompactButton>
    </SourceRow>

    <ContentDivider variant="solid">Recipient Receives</ContentDivider>

    <Label>
      Enter Amount
      <Tooltip>…<TooltipContent size="xs">Specify the amount…</TooltipContent></Tooltip>
    </Label>
    <InputRoot>
      <InputAffix>$</InputAffix>
      <Input placeholder="0.00" />
    </InputRoot>

    <Label optional>Description</Label>
    <Textarea placeholder="The message you wish to send to the recipient..." />

    <Divider />
    <Switch /> Recurring payment

    <Divider />
    <Grid cols={2}>
      <Button tone="neutral" style="stroke">Back</Button>
      <Button tone="primary">Next</Button>
    </Grid>
  </Card>
</Step3>`

const STEP4_SNIPPET = `<Step4>
  <StepHero icon={<RiMoneyDollarCircleFill />} title="Transfer Summary"
            description="Review summary and confirm it before finalizing your transfer." />

  <Card>
    <Hero>Wire to James Brown — $8,400.00</Hero>

    <ContentDivider variant="solid">Recipient Details</ContentDivider>
    <SummaryRow label="Recipient"      value="James Brown" />
    <SummaryRow label="Bank"           value="Summit Finance Intl." />
    <SummaryRow label="Account Number" value="123450123" />
    <SummaryRow label="Routing Number" value="98765432" />

    <ContentDivider variant="solid">Funding Source</ContentDivider>
    <SummaryRow label="From"    value="Apex Financial, Inc." />
    <SummaryRow label="Account" value="Checking ••0123" />

    <ContentDivider variant="solid">Description</ContentDivider>
    <SummaryRow label="Sender's Note" value="Best wishes!" />

    <Divider />
    <Grid cols={2}>
      <Button tone="neutral" style="stroke">Discard</Button>
      <Button tone="primary">Send Money</Button>
    </Grid>
    <p className="text-xs text-text-soft-400 text-center">
      By clicking Send Money, I grant Apex permission to proceed with the detailed transaction.
    </p>
  </Card>
</Step4>`
