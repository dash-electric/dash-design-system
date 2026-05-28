"use client"

import * as React from "react"
import {
  RiArrowLeftSLine,
  RiCloseLine,
  RiShoppingBag3Fill,
  RiPriceTag3Fill,
  RiImageAddFill,
  RiPieChartFill,
  RiShoppingBasket2Fill,
  RiInformation2Line,
  RiInformationFill,
  RiAddLine,
  RiMore2Line,
  RiStarSFill,
  RiStarFill,
  RiCheckLine,
  RiAttachment2,
} from "@remixicon/react"
import {
  DocsPageShell,
  DocsHeader,
  DocsSection,
  DocsExample,
  DocsPropsTable,
} from "@/components/docs/page-shell"
import { DocsTemplatePreview } from "@/components/docs/template-preview"
import { DocsCode } from "@/components/docs/code-block"
import { Button } from "@/registry/dash/ui/button"
import { CompactButton } from "@/registry/dash/ui/compact-button"
import { LinkButton } from "@/registry/dash/ui/link-button"
import { InputRoot, Input } from "@/registry/dash/ui/input"
import { Label } from "@/registry/dash/ui/label"
import { Textarea } from "@/registry/dash/ui/textarea"
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/registry/dash/ui/select"
import { Switch } from "@/registry/dash/ui/switch"
import { Badge } from "@/registry/dash/ui/badge"
import { Tag } from "@/registry/dash/ui/tag"
import { SegmentedControl, SegmentedItem } from "@/registry/dash/ui/segmented-control"
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "@/registry/dash/ui/tooltip"
import { Hint } from "@/registry/dash/ui/hint"
import { cn } from "@/registry/dash/lib/utils"

/**
 * Marketing Add Product Wizard — full 5-step flow.
 * Ported from AlignUI Marketing Template (2026-05-18).
 *
 * Source files (12, ~1,100 LOC):
 *   app/add-product/{page,header-navigation,mobile-header,sidebar,preview-card,
 *   store-product,store-steps,step-add-product-details,step-add-product-image,
 *   step-set-product-price,step-add-stock-status,step-summary}.tsx
 *
 * State pattern: Jotai atoms (productAtom + activeStepAtom + derived field atoms)
 * → flattened to a single `React.useState<WizardState>` here for docs purposes.
 */

/* -------------------------------------------------------------------------- */
/*  Constants                                                                 */
/* -------------------------------------------------------------------------- */

type StepId = "general" | "pricing" | "image" | "stock" | "summary"

const ADD_PRODUCT_STEPS: ReadonlyArray<{ index: number; id: StepId; label: string }> = [
  { index: 0, id: "general", label: "General Information" },
  { index: 1, id: "pricing", label: "Pricing Details" },
  { index: 2, id: "image", label: "Product Image" },
  { index: 3, id: "stock", label: "Stock Status" },
  { index: 4, id: "summary", label: "Summary" },
]

const CATEGORY_OPTIONS = [
  "Electronics & Accessories",
  "Clothing & Fashion",
  "Home & Garden",
  "Beauty & Personal Care",
  "Sports & Outdoors",
  "Technology",
  "Toys & Games",
  "Books & Media",
  "Health & Wellness",
  "Food & Beverages",
  "Automotive & Industrial",
  "Pet Supplies",
  "Jewelry & Watches",
  "Art & Collectibles",
  "Office Supplies",
  "Tools & Home Improvement",
] as const

const PREDEFINED_STOCKS = [50, 100, 200, 400, 800, 1200] as const

type ProductImage = {
  url: string
  name: string
  ext: string
  size: string
  isMain?: boolean
}

const MOCK_IMAGES: ProductImage[] = [
  { url: "/images/products/airpods-max-1.png", name: "airpods-max", ext: ".jpg", size: "753.99 KB", isMain: true },
  { url: "/images/products/apple-watch-1.png", name: "apple-watch", ext: ".jpg", size: "655.45 KB" },
  { url: "/images/products/homepod-mini-1.png", name: "homepod", ext: ".jpg", size: "234.55 KB" },
]

const FILLED_PRODUCT: WizardState = {
  step: 4,
  name: "Apple Watch S5 GPS 40MM",
  description:
    "Apple Watch Series 5 GPS brings smart features and elegant design for daily convenience.",
  category: "Technology",
  tags: ["smartwatch", "wearable", "apple"],
  price: 478.8,
  compareAtPrice: 599,
  discountPercent: 20,
  currency: "USD",
  taxInclusive: true,
  images: MOCK_IMAGES,
  coverImageUrl: MOCK_IMAGES[0].url,
  sku: "AW5-GPS-40-001",
  stock: 200,
  status: "active",
  lowStockAlertEnabled: true,
  lowStockThreshold: 12,
}

/* -------------------------------------------------------------------------- */
/*  Wizard state                                                              */
/* -------------------------------------------------------------------------- */

type WizardState = {
  step: number
  name: string
  description: string
  category: string
  tags: string[]
  price: number | undefined
  compareAtPrice: number | undefined
  discountPercent: number | undefined
  currency: string
  taxInclusive: boolean
  images: ProductImage[]
  coverImageUrl: string | undefined
  sku: string
  stock: number | undefined
  status: "active" | "draft" | "archived"
  lowStockAlertEnabled: boolean
  lowStockThreshold: number | undefined
}

const INITIAL_STATE: WizardState = {
  step: 0,
  name: "",
  description: "",
  category: "",
  tags: [],
  price: undefined,
  compareAtPrice: undefined,
  discountPercent: undefined,
  currency: "USD",
  taxInclusive: false,
  images: [],
  coverImageUrl: undefined,
  sku: "",
  stock: undefined,
  status: "draft",
  lowStockAlertEnabled: false,
  lowStockThreshold: undefined,
}

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
})

/* -------------------------------------------------------------------------- */
/*  Shared atoms — Wizard shell                                               */
/* -------------------------------------------------------------------------- */

function WizardSidebar({
  activeStep,
  onStepChange,
}: {
  activeStep: number
  onStepChange: (i: number) => void
}) {
  return (
    <aside className="hidden w-[212px] shrink-0 flex-col gap-12 border-r border-stroke-soft-200 p-8 lg:flex">
      {/* Catalyst placeholder logo block */}
      <div className="flex size-8 items-center justify-center rounded-lg bg-bg-strong-950 text-static-white text-sm font-semibold tracking-tight">
        C
      </div>

      <ol className="relative flex w-full flex-1 flex-col gap-8">
        {/* Active rail indicator (right edge) */}
        <span
          aria-hidden
          className="absolute right-[-34px] h-11 w-0.5 bg-primary transition-all"
          style={{
            top: activeStep * 44 + activeStep * 32,
            transitionTimingFunction: "cubic-bezier(.6,.6,0,1)",
            transitionDuration: ".45s",
          }}
        />

        {ADD_PRODUCT_STEPS.map(({ index, label }) => {
          const isCompleted = activeStep > index
          const isCurrent = activeStep === index
          return (
            <li key={label}>
              <button
                type="button"
                onClick={() => onStepChange(index)}
                className="flex w-full flex-col gap-1 text-left focus:outline-none"
              >
                <span
                  className={cn(
                    "flex items-center gap-1.5 text-xs",
                    isCurrent
                      ? "text-primary"
                      : isCompleted
                        ? "text-text-sub-600"
                        : "text-text-soft-400",
                  )}
                >
                  Step {index + 1}/5
                  {isCompleted ? (
                    <RiCheckLine className="size-3.5 text-success-base" />
                  ) : null}
                </span>
                <span
                  className={cn(
                    "text-sm",
                    isCurrent || isCompleted
                      ? "text-text-strong-950 font-medium"
                      : "text-text-sub-600",
                  )}
                >
                  {label}
                </span>
              </button>
            </li>
          )
        })}
      </ol>

      <div className="text-xs text-text-soft-400">© 2026 Catalyst</div>
    </aside>
  )
}

function WizardHeaderNav({
  activeStep,
  onPrev,
  onSaveDraft,
  onContinue,
  canContinue,
}: {
  activeStep: number
  onPrev: () => void
  onSaveDraft: () => void
  onContinue: () => void
  canContinue: boolean
}) {
  const prevIndex = Math.max(activeStep - 1, 0)
  const prevLabel = ADD_PRODUCT_STEPS[prevIndex].label
  const isLastStep = activeStep === ADD_PRODUCT_STEPS.length - 1
  return (
    <div className="relative z-20 flex w-full items-center px-8 pt-8">
      {activeStep > 0 ? (
        <LinkButton size="md" tone="neutral" onClick={onPrev}>
          <RiArrowLeftSLine className="size-4" />
          Back to {prevLabel}
        </LinkButton>
      ) : null}

      <div className="flex-1" />

      <div className="flex items-center gap-2">
        <Button tone="neutral" style="stroke" size="sm" onClick={onSaveDraft}>
          Save Draft
        </Button>
        <Button
          tone="primary"
          style="filled"
          size="sm"
          disabled={!canContinue}
          onClick={onContinue}
        >
          {isLastStep ? "Complete" : "Continue"}
        </Button>
        <CompactButton variant="ghost" size="md" aria-label="Close">
          <RiCloseLine className="size-4" />
        </CompactButton>
      </div>
    </div>
  )
}

function PreviewCard({ state }: { state: WizardState }) {
  const usedStock = React.useMemo(() => {
    if (!state.stock) return 0
    // Deterministic for SSR — use 30% of stock as "used".
    return Math.floor(state.stock * 0.3)
  }, [state.stock])

  const coverUrl = state.coverImageUrl ?? state.images[0]?.url
  const stockMax = state.stock ?? 100

  return (
    <div className="relative w-full min-w-0 sm:w-[352px] sm:shrink-0">
      <div className="relative z-10 flex w-full flex-col gap-6 rounded-3xl border border-stroke-soft-200 bg-bg-white-0 p-6 pb-8 shadow-[0_8px_24px_-12px_rgba(15,23,42,0.12)]">
        {/* SKU */}
        <div className="flex items-center gap-1.5">
          <RiInformation2Line className="size-3.5 text-text-disabled-300" />
          <div className="text-xs text-text-soft-400">
            SKU: {state.sku || "000-00-0000"}
          </div>
        </div>

        {/* Image well */}
        <div className="flex h-[224px] w-full flex-col items-center justify-center rounded-xl border border-dashed border-stroke-soft-200 bg-bg-white-0 text-center">
          {coverUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={coverUrl}
              alt={state.name || "Product image"}
              className="size-[200px] object-contain"
            />
          ) : (
            <>
              <div className="flex size-11 items-center justify-center rounded-full bg-bg-weak-50">
                <RiAddLine className="size-6 text-text-soft-400" />
              </div>
              <div className="mt-3 text-sm text-text-soft-400">Product Image</div>
              <div className="mt-1 text-xs text-text-soft-400">400x400px</div>
            </>
          )}
        </div>

        {/* Title + Category + Price */}
        <div className="w-full">
          <div className="text-sm text-text-soft-400">
            {state.category || "Category name"}
          </div>
          <div className="mt-2 line-clamp-3 text-base font-medium text-text-sub-600">
            {state.name || "The product name is here."}
          </div>
          <div
            className={cn(
              "mt-2 text-2xl font-semibold tracking-tight",
              (state.price ?? 0) > 0 ? "text-text-strong-950" : "text-text-sub-600",
            )}
          >
            {state.price ? currencyFormatter.format(state.price) : "$0.00"}
          </div>
          {state.compareAtPrice && state.compareAtPrice > (state.price ?? 0) ? (
            <div className="mt-0.5 text-xs text-text-soft-400 line-through">
              {currencyFormatter.format(state.compareAtPrice)}
            </div>
          ) : null}
        </div>

        {/* Dashed divider */}
        <div className="h-px w-full border-t border-dashed border-stroke-soft-200" />

        {/* Stock status */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <div className="text-sm text-text-soft-400">Stock Status</div>
            <div className="text-xs text-text-soft-400">
              {usedStock} out of {state.stock ?? 0} units
            </div>
          </div>
          <div
            role="progressbar"
            aria-valuenow={usedStock}
            aria-valuemin={0}
            aria-valuemax={stockMax}
            className="h-1.5 w-full overflow-hidden rounded-full bg-bg-weak-50"
          >
            <div
              className="h-full rounded-full bg-success-base transition-all"
              style={{
                width: `${stockMax > 0 ? Math.min(100, (usedStock / stockMax) * 100) : 0}%`,
              }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/*  Steps                                                                     */
/* -------------------------------------------------------------------------- */

function StepHero({
  Icon,
  title,
  subtitle,
}: {
  Icon: React.ElementType
  title: string
  subtitle: string
}) {
  return (
    <div className="flex w-full flex-col gap-6">
      <Icon className="size-7 text-primary" />
      <div>
        <div className="text-xl font-semibold text-text-strong-950">{title}</div>
        <div className="mt-2 text-sm text-text-sub-600">{subtitle}</div>
      </div>
    </div>
  )
}

function DashedDivider() {
  return <div className="h-px w-full border-t border-dashed border-stroke-soft-200" />
}

/**
 * Field label with an info Tooltip — mirrors the source pattern where
 * `<LabelPrimitives.Root> + <Tooltip.Root>` are siblings inside a flex row.
 * Tooltip copy is taken verbatim from the source step files when present.
 */
function LabelWithTooltip({
  htmlFor,
  children,
  hint,
  optional,
}: {
  htmlFor: string
  children: React.ReactNode
  hint: string
  optional?: boolean
}) {
  return (
    <div className="flex items-center gap-1">
      <Label htmlFor={htmlFor} optional={optional}>
        {children}
      </Label>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            aria-label="More info"
            className="inline-flex size-4 items-center justify-center text-text-disabled-300 hover:text-text-soft-400 focus:outline-none focus-visible:text-text-soft-400"
          >
            <RiInformationFill className="size-3.5" />
          </button>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-80">
          {hint}
        </TooltipContent>
      </Tooltip>
    </div>
  )
}

/** Per-step validation error map. Each error keys a required field. */
type StepErrors = {
  name?: string
  category?: string
  description?: string
  price?: string
  images?: string
  stock?: string
}

function StepGeneral({
  state,
  onChange,
  errors,
}: {
  state: WizardState
  onChange: (patch: Partial<WizardState>) => void
  errors?: StepErrors
}) {
  const [tagInput, setTagInput] = React.useState("")

  const addTag = (raw: string) => {
    const t = raw.trim().toLowerCase()
    if (!t || state.tags.includes(t)) return
    onChange({ tags: [...state.tags, t] })
  }
  const removeTag = (t: string) => onChange({ tags: state.tags.filter((x) => x !== t) })

  return (
    <div className="mx-auto flex w-full max-w-[372px] flex-col gap-8">
      <StepHero
        Icon={RiShoppingBag3Fill}
        title="Add product details"
        subtitle="Boost sales with detailed product information"
      />
      <DashedDivider />

      <div className="flex flex-col gap-8">
        {/* Name */}
        <div className="flex flex-col gap-1.5">
          <LabelWithTooltip
            htmlFor="product-name"
            hint="Enter your product's full name including brand, model, and key features to help customers find it easily"
          >
            Product name
          </LabelWithTooltip>
          <InputRoot>
            <Input
              id="product-name"
              placeholder="Enter product name..."
              value={state.name}
              onChange={(e) => onChange({ name: e.target.value })}
              aria-invalid={errors?.name ? true : undefined}
            />
          </InputRoot>
          {errors?.name ? <Hint tone="error">{errors.name}</Hint> : null}
        </div>

        {/* Category */}
        <div className="flex flex-col gap-1.5">
          <LabelWithTooltip
            htmlFor="product-category"
            hint="Choose the main category where customers can find this product in your store"
          >
            Category
          </LabelWithTooltip>
          <Select
            value={state.category || undefined}
            onValueChange={(v) => onChange({ category: v })}
          >
            <SelectTrigger id="product-category" aria-invalid={errors?.category ? true : undefined}>
              <SelectValue placeholder="Select category..." />
            </SelectTrigger>
            <SelectContent>
              {CATEGORY_OPTIONS.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors?.category ? <Hint tone="error">{errors.category}</Hint> : null}
        </div>

        {/* Description */}
        <div className="flex flex-col gap-1.5">
          <LabelWithTooltip
            htmlFor="product-description"
            hint="Enter a detailed description of your product, including key features, benefits, and specifications to help customers make informed purchasing decisions"
          >
            Description
          </LabelWithTooltip>
          <Textarea
            id="product-description"
            placeholder="Enter product description..."
            value={state.description}
            onChange={(e) => onChange({ description: e.target.value })}
            rows={4}
            aria-invalid={errors?.description ? true : undefined}
          />
          {errors?.description ? <Hint tone="error">{errors.description}</Hint> : null}
        </div>

        {/* Tags */}
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="product-tags" optional>
            Tags
          </Label>
          <InputRoot>
            <Input
              id="product-tags"
              placeholder="Type and press Enter..."
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === ",") {
                  e.preventDefault()
                  addTag(tagInput)
                  setTagInput("")
                }
              }}
            />
          </InputRoot>
          {state.tags.length > 0 ? (
            <div className="mt-1 flex flex-wrap gap-1.5">
              {state.tags.map((t) => (
                <Tag key={t} variant="gray" onRemove={() => removeTag(t)}>
                  {t}
                </Tag>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  )
}

function StepPricing({
  state,
  onChange,
}: {
  state: WizardState
  onChange: (patch: Partial<WizardState>) => void
}) {
  return (
    <div className="mx-auto flex w-full max-w-[372px] flex-col gap-8">
      <StepHero
        Icon={RiPriceTag3Fill}
        title="Set product price"
        subtitle="Define strategic pricing for market success"
      />
      <DashedDivider />

      <div className="flex flex-col gap-8">
        {/* Currency */}
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="product-currency">Currency</Label>
          <Select
            value={state.currency}
            onValueChange={(v) => onChange({ currency: v })}
          >
            <SelectTrigger id="product-currency">
              <SelectValue placeholder="Select currency..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="USD">USD — US Dollar</SelectItem>
              <SelectItem value="EUR">EUR — Euro</SelectItem>
              <SelectItem value="GBP">GBP — British Pound</SelectItem>
              <SelectItem value="IDR">IDR — Indonesian Rupiah</SelectItem>
              <SelectItem value="JPY">JPY — Japanese Yen</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Regular price */}
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="product-price">Product pricing</Label>
          <InputRoot size="lg">
            <Input
              id="product-price"
              type="number"
              inputMode="decimal"
              placeholder="$0.00"
              value={state.price ?? ""}
              onChange={(e) =>
                onChange({
                  price: e.target.value === "" ? undefined : Number(e.target.value),
                })
              }
              className="text-2xl font-semibold tracking-tight"
            />
          </InputRoot>
          <div className="mt-2 flex items-center gap-1.5">
            <RiInformation2Line className="size-3 shrink-0 text-text-disabled-300" />
            <div className="text-xs text-text-soft-400">
              Similar products in the{" "}
              <span className="text-text-sub-600">market are priced $999-1499</span>
            </div>
          </div>
        </div>

        {/* Compare-at price */}
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="product-compare-price" optional>
            Compare-at price
          </Label>
          <InputRoot>
            <Input
              id="product-compare-price"
              type="number"
              placeholder="$0.00"
              value={state.compareAtPrice ?? ""}
              onChange={(e) =>
                onChange({
                  compareAtPrice:
                    e.target.value === "" ? undefined : Number(e.target.value),
                })
              }
            />
          </InputRoot>
        </div>

        {/* Discount */}
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="product-discount" optional>
            Discount %
          </Label>
          <InputRoot>
            <Input
              id="product-discount"
              type="number"
              min={0}
              max={100}
              placeholder="0"
              value={state.discountPercent ?? ""}
              onChange={(e) =>
                onChange({
                  discountPercent:
                    e.target.value === "" ? undefined : Number(e.target.value),
                })
              }
            />
          </InputRoot>
        </div>

        {/* Tax-inclusive */}
        <div className="flex items-center justify-between gap-3 rounded-[10px] border border-stroke-soft-200 bg-bg-white-0 px-3 py-2.5">
          <div>
            <div className="text-sm font-medium text-text-strong-950">
              Tax-inclusive pricing
            </div>
            <div className="text-xs text-text-soft-400">
              Display price already includes applicable tax.
            </div>
          </div>
          <Switch
            checked={state.taxInclusive}
            onCheckedChange={(v) => onChange({ taxInclusive: v })}
          />
        </div>
      </div>
    </div>
  )
}

function StepImage({
  state,
  onChange,
}: {
  state: WizardState
  onChange: (patch: Partial<WizardState>) => void
}) {
  const loadMockImages = () => {
    onChange({ images: MOCK_IMAGES, coverImageUrl: MOCK_IMAGES[0].url })
  }
  return (
    <div className="mx-auto flex w-full max-w-[372px] flex-col gap-6">
      <StepHero
        Icon={RiImageAddFill}
        title="Add product images"
        subtitle="Showcase products with quality visuals"
      />

      {/* Drop zone */}
      <button
        type="button"
        onClick={loadMockImages}
        className="w-full cursor-pointer rounded-2xl border border-dashed border-stroke-sub-300 bg-bg-white-0 p-6 text-left transition-colors hover:bg-bg-weak-50"
      >
        <div className="flex items-center gap-2">
          <RiAttachment2 className="size-4 text-text-soft-400" />
          <div className="text-sm font-medium text-text-sub-600">
            Choose a file or drag &amp; drop it here.
          </div>
        </div>
        <div className="mt-1 text-xs text-text-soft-400">
          JPEG, PNG, PDF, and MP4 formats, up to 50 MB.
        </div>
        <Button tone="neutral" style="stroke" size="xs" className="mt-4">
          Browse files
        </Button>
      </button>

      {/* Uploaded images */}
      {state.images.length > 0 ? (
        <div className="flex w-full flex-col gap-6">
          {state.images.map(({ url, name, ext, size, isMain }) => {
            const isCover = state.coverImageUrl === url
            return (
              <div key={url} className="flex items-center gap-4">
                <div className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-bg-weak-50">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={url} alt={name} className="size-10 object-contain" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <div className="text-sm text-text-sub-600 truncate">
                      {name}
                      <span className="text-text-soft-400">{ext}</span>
                    </div>
                    {isMain ? (
                      <Badge
                        status="feature"
                        appearance="lighter"
                        size="sm"
                        type="left-icon"
                        icon={<RiStarSFill />}
                      >
                        Primary
                      </Badge>
                    ) : null}
                  </div>
                  <div className="mt-1 text-xs text-text-soft-400">{size}</div>
                </div>
                {/* Cover radio */}
                <label className="flex items-center gap-1.5 text-xs text-text-sub-600">
                  <input
                    type="radio"
                    name="cover-image"
                    checked={isCover}
                    onChange={() => onChange({ coverImageUrl: url })}
                    className="accent-(--primary-base)"
                    aria-label={`Set ${name} as cover`}
                  />
                  Cover
                </label>
                <CompactButton variant="ghost" size="md" aria-label="More">
                  <RiMore2Line className="size-4" />
                </CompactButton>
              </div>
            )
          })}
        </div>
      ) : null}
    </div>
  )
}

function StepStock({
  state,
  onChange,
}: {
  state: WizardState
  onChange: (patch: Partial<WizardState>) => void
}) {
  return (
    <div className="mx-auto flex w-full max-w-[372px] flex-col gap-8">
      <StepHero
        Icon={RiPieChartFill}
        title="Add stock status"
        subtitle="Highlight stock status with dynamic indicators"
      />
      <DashedDivider />

      <div className="flex flex-col gap-8">
        {/* SKU */}
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="product-sku" hint="e.g. AW5-GPS-40-001">
            SKU
          </Label>
          <InputRoot>
            <Input
              id="product-sku"
              placeholder="000-00-0000"
              value={state.sku}
              onChange={(e) => onChange({ sku: e.target.value })}
            />
          </InputRoot>
        </div>

        {/* Stock count */}
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="product-stock">Set Custom Stock Status</Label>
          <InputRoot size="lg">
            <Input
              id="product-stock"
              type="number"
              min={0}
              placeholder="0"
              value={state.stock ?? ""}
              onChange={(e) =>
                onChange({
                  stock: e.target.value === "" ? undefined : Number(e.target.value),
                })
              }
              className="text-2xl font-semibold tracking-tight"
            />
          </InputRoot>
          <div className="mt-2 flex flex-wrap gap-2">
            {PREDEFINED_STOCKS.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => onChange({ stock: s })}
                className={cn(
                  "h-7 rounded-md border px-2.5 text-xs font-medium transition-colors",
                  s === state.stock
                    ? "border-stroke-strong-950 bg-bg-white-0 text-text-strong-950"
                    : "border-stroke-soft-200 bg-bg-white-0 text-text-sub-600 hover:bg-bg-weak-50",
                )}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Status */}
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="product-status">Status</Label>
          <Select
            value={state.status}
            onValueChange={(v) => onChange({ status: v as WizardState["status"] })}
          >
            <SelectTrigger id="product-status">
              <SelectValue placeholder="Select status..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="archived">Archived</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Low stock alert */}
        <div className="flex flex-col gap-3 rounded-[10px] border border-stroke-soft-200 bg-bg-white-0 px-3 py-3">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-sm font-medium text-text-strong-950">
                Low-stock alert
              </div>
              <div className="text-xs text-text-soft-400">
                Notify when stock drops below the threshold.
              </div>
            </div>
            <Switch
              checked={state.lowStockAlertEnabled}
              onCheckedChange={(v) => onChange({ lowStockAlertEnabled: v })}
            />
          </div>
          {state.lowStockAlertEnabled ? (
            <div className="flex items-center gap-2">
              <span className="text-xs text-text-sub-600">Threshold</span>
              <InputRoot size="sm" className="w-24">
                <Input
                  type="number"
                  min={0}
                  placeholder="12"
                  value={state.lowStockThreshold ?? ""}
                  onChange={(e) =>
                    onChange({
                      lowStockThreshold:
                        e.target.value === "" ? undefined : Number(e.target.value),
                    })
                  }
                />
              </InputRoot>
              <span className="text-xs text-text-soft-400">units</span>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  )
}

function StepSummary({ state }: { state: WizardState }) {
  const view: WizardState = state.name ? state : FILLED_PRODUCT
  return (
    <div className="mx-auto flex w-full max-w-[372px] flex-col gap-8">
      <StepHero
        Icon={RiShoppingBasket2Fill}
        title="Summary"
        subtitle="Quick overview of product details and inventory"
      />

      <div className="flex flex-col gap-6 pt-2">
        <SummaryRow label="Name" value={view.name} />
        <DashedDivider />
        <SummaryRow label="Descriptions" value={view.description} />
        <DashedDivider />
        <div className="flex gap-8">
          <SummaryRow label="Category" value={view.category} className="flex-1" />
          <DashedDividerVertical />
          <SummaryRow
            label="Price"
            value={view.price ? currencyFormatter.format(view.price) : "—"}
            className="flex-1"
          />
          <DashedDividerVertical />
          <SummaryRow
            label="Stock"
            value={`${view.stock ?? 0} units`}
            className="flex-1"
          />
        </div>
        <DashedDivider />
        <div>
          <div className="text-[11px] uppercase tracking-wide text-text-soft-400">
            Product Images
          </div>
          <div className="mt-2 flex flex-wrap gap-2">
            {view.images.map(({ url, name, isMain }) => (
              <div
                key={url}
                className="relative flex size-[72px] shrink-0 items-center justify-center rounded-lg bg-bg-weak-50"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={url} alt={name} className="size-16 object-contain" />
                {isMain ? (
                  <div className="absolute right-1 top-1 flex size-4 items-center justify-center rounded bg-(--state-feature-base)">
                    <RiStarFill className="size-2.5 text-static-white" />
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        </div>
        <DashedDivider />
        <div className="flex items-center justify-between">
          <SummaryRow label="SKU" value={view.sku || "—"} />
          <SummaryRow label="Status" value={
            <Badge
              status={
                view.status === "active"
                  ? "success"
                  : view.status === "draft"
                    ? "neutral"
                    : "faded"
              }
              appearance="lighter"
              type="dot"
              size="sm"
            >
              {view.status.charAt(0).toUpperCase() + view.status.slice(1)}
            </Badge>
          } />
        </div>
      </div>

      <Button tone="primary" style="filled" size="lg" className="w-full">
        Submit Product
      </Button>
    </div>
  )
}

function SummaryRow({
  label,
  value,
  className,
}: {
  label: string
  value: React.ReactNode
  className?: string
}) {
  return (
    <div className={className}>
      <div className="text-[11px] uppercase tracking-wide text-text-soft-400">
        {label}
      </div>
      <div className="mt-1 text-sm font-medium text-text-strong-950">{value}</div>
    </div>
  )
}

function DashedDividerVertical() {
  return <div className="self-stretch border-l border-dashed border-stroke-soft-200" />
}

/* -------------------------------------------------------------------------- */
/*  Wizard shell                                                              */
/* -------------------------------------------------------------------------- */

function AddProductWizardShell({ initial }: { initial?: Partial<WizardState> }) {
  const [state, setState] = React.useState<WizardState>(() => ({
    ...INITIAL_STATE,
    ...initial,
  }))
  const patch = React.useCallback(
    (p: Partial<WizardState>) => setState((s) => ({ ...s, ...p })),
    [],
  )

  const goNext = () =>
    patch({ step: Math.min(state.step + 1, ADD_PRODUCT_STEPS.length - 1) })
  const goPrev = () => patch({ step: Math.max(state.step - 1, 0) })

  // Per-step Continue gate (mirrors source `disabled` predicates).
  const canContinue = (() => {
    switch (state.step) {
      case 0:
        return Boolean(state.name && state.category && state.description)
      case 1:
        return Boolean(state.price)
      case 2:
        return state.images.length > 0
      case 3:
        return state.stock !== undefined && state.stock !== null
      case 4:
        return true
      default:
        return false
    }
  })()

  return (
    <div className="flex min-h-[820px] flex-col bg-bg-white-0 lg:flex-row">
      <WizardSidebar
        activeStep={state.step}
        onStepChange={(i) => patch({ step: i })}
      />

      <div className="flex flex-1 flex-col-reverse md:grid md:grid-cols-[minmax(0,600fr)_minmax(0,628fr)]">
        {/* Left pane — live preview */}
        <div className="flex flex-col md:py-2 md:pl-2 lg:pl-0">
          <div className="flex w-full flex-1 flex-col items-center justify-center bg-bg-weak-50 py-8 md:rounded-2xl lg:py-0">
            <div className="flex w-full flex-col gap-6 px-4 sm:w-auto">
              <div>
                <div className="text-sm font-medium text-text-sub-600">Preview</div>
                <div className="mt-1 text-xs text-text-soft-400">
                  This is how your product will appear.
                </div>
              </div>
              <PreviewCard state={state} />
            </div>
          </div>
        </div>

        {/* Right pane — header nav + step content */}
        <div className="flex flex-col items-center px-0 py-0 lg:py-0">
          <WizardHeaderNav
            activeStep={state.step}
            onPrev={goPrev}
            onSaveDraft={() => {}}
            onContinue={goNext}
            canContinue={canContinue}
          />
          <div className="flex h-full w-full flex-col justify-center px-8 py-8">
            {state.step === 0 ? <StepGeneral state={state} onChange={patch} /> : null}
            {state.step === 1 ? <StepPricing state={state} onChange={patch} /> : null}
            {state.step === 2 ? <StepImage state={state} onChange={patch} /> : null}
            {state.step === 3 ? <StepStock state={state} onChange={patch} /> : null}
            {state.step === 4 ? <StepSummary state={state} /> : null}
          </div>
        </div>
      </div>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/*  Per-step deep-dive switcher                                               */
/* -------------------------------------------------------------------------- */

function StepDeepDive() {
  const [activeId, setActiveId] = React.useState<StepId>("general")
  const [state, setState] = React.useState<WizardState>(INITIAL_STATE)
  const patch = (p: Partial<WizardState>) => setState((s) => ({ ...s, ...p }))

  return (
    <div className="space-y-4">
      <SegmentedControl
        value={activeId}
        onValueChange={(v: string) => v && setActiveId(v as StepId)}
        size="md"
      >
        {ADD_PRODUCT_STEPS.map((s) => (
          <SegmentedItem key={s.id} value={s.id}>
            {s.label}
          </SegmentedItem>
        ))}
      </SegmentedControl>

      <div className="rounded-xl border border-stroke-soft-200 bg-bg-white-0 p-8">
        {activeId === "general" ? <StepGeneral state={state} onChange={patch} /> : null}
        {activeId === "pricing" ? <StepPricing state={state} onChange={patch} /> : null}
        {activeId === "image" ? <StepImage state={state} onChange={patch} /> : null}
        {activeId === "stock" ? <StepStock state={state} onChange={patch} /> : null}
        {activeId === "summary" ? <StepSummary state={state} /> : null}
      </div>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/*  Docs page                                                                 */
/* -------------------------------------------------------------------------- */

export default function MarketingAddProductWizardPage() {
  return (
    <TooltipProvider>
    <DocsPageShell>
      <DocsHeader
        category="Templates / Marketing"
        title="Add Product Wizard"
        description="Full 5-step product creation flow ported from the AlignUI Marketing template: vertical step rail, swappable step form column, and a live product preview card. Composes Input, Select, Textarea, Switch, Tag, Badge, and SegmentedControl primitives from the Dash registry."
        status="beta"
      />

      <DocsSection title="Full preview" description="All five steps wired together with shared wizard state. Use the left rail (or the Continue button) to navigate.">
        <DocsExample
          bare
          title="Default — step 1 active"
          preview={
            <DocsTemplatePreview>
              <AddProductWizardShell />
            </DocsTemplatePreview>
          }
          code={`<AddProductWizardShell />`}
        />
      </DocsSection>

      <DocsSection
        title="Per-step deep-dive"
        description="Each step rendered in isolation so individual field anatomy can be inspected. Switcher uses SegmentedControl."
      >
        <div className="rounded-xl border border-stroke-soft-200 bg-bg-white-0 p-6">
          <StepDeepDive />
        </div>
      </DocsSection>

      <DocsSection
        title="State pattern"
        description="The source uses Jotai (productAtom + activeStepAtom + per-field derived atoms). For docs purposes we collapse to a single React.useState<WizardState> with a `patch` reducer."
      >
        <DocsCode
          language="tsx"
          code={`// Source pattern (Jotai)
export const productAtom = atom<Product>(initialProduct)
export const productNameAtom = atom(
  (get) => get(productAtom).name,
  (get, set, newName: string) =>
    set(productAtom, { ...get(productAtom), name: newName }),
)
export const activeStepAtom = atom(0)
export const nextStepAtom = atom(null, (get, set) => {
  set(activeStepAtom, Math.min(get(activeStepAtom) + 1, MAX_STEP))
})

// Docs equivalent (useState + patch)
type WizardState = {
  step: number
  name: string
  category: string
  // ...all product fields
}
const [state, setState] = React.useState<WizardState>(INITIAL_STATE)
const patch = (p: Partial<WizardState>) =>
  setState((s) => ({ ...s, ...p }))

const goNext = () =>
  patch({ step: Math.min(state.step + 1, STEPS.length - 1) })`}
        />
      </DocsSection>

      <DocsSection title="Anatomy">
        <ul className="text-sm text-text-sub-600 space-y-1.5 list-disc pl-6">
          <li><strong>Sidebar (212px)</strong> — Catalyst logo, vertical step list (5 items, 44px tall + 32px gap), animated rail indicator on right edge, footer copyright. Each step shows <em>Step N/5</em> label + step name; completed steps get a green check icon, active step uses primary text + rail.</li>
          <li><strong>Header navigation</strong> — Top row inside the right pane. Left: <code>LinkButton</code> &quot;Back to {`{prev step label}`}&quot; (hidden on step 1). Right: <code>Save Draft</code> (Neutral stroke) + <code>Continue / Complete</code> (Primary filled) + close <code>CompactButton</code>.</li>
          <li><strong>Preview column</strong> — Left half of the content grid (600fr / 628fr). Soft <code>bg-bg-weak-50</code> backdrop, &quot;Preview&quot; / &quot;This is how your product will appear.&quot; eyebrow, and a 352px-wide product card rendered live.</li>
          <li><strong>Preview card</strong> — White 3xl-rounded card with SKU eyebrow + info tooltip, 224px dashed image well (falls back to <code>RiAddLine</code> in a 44px circle + &quot;Product Image · 400x400px&quot; placeholder), category / name / price block, dashed divider, &quot;Stock Status&quot; row with progress bar (success-base fill).</li>
          <li><strong>Step content (372px max)</strong> — Each step opens with a hero block: 28px primary icon + 20/24-tracking title + sub-paragraph. Followed by a dashed divider and a 28px-gap field stack. Continue button lives in the header (not per-step) — its disabled gate is per-step (name/category/description for step 1, price for step 2, etc.).</li>
        </ul>
      </DocsSection>

      <DocsSection title="Per-step coverage">
        <DocsPropsTable
          rows={[
            {
              name: "1. General Information",
              type: "step-add-product-details.tsx",
              description: "Product name (Input), Category (Select — 16 enum options), Description (Textarea), Tags (Input + Enter-to-add chip list rendered with `Tag variant=\"gray\"`). Hero icon: RiShoppingBag3Fill. Continue gated on name + category + description.",
            },
            {
              name: "2. Pricing Details",
              type: "step-set-product-price.tsx",
              description: "Currency (Select — USD/EUR/GBP/IDR/JPY), Product pricing (large numeric Input with market-range hint), Compare-at price (optional), Discount % (0–100), Tax-inclusive Switch row. Hero icon: RiPriceTag3Fill. Continue gated on price > 0.",
            },
            {
              name: "3. Product Image",
              type: "step-add-product-image.tsx",
              description: "Dashed drop-zone (RiAttachment2 + 'JPEG, PNG, PDF, MP4 up to 50 MB' hint + Browse files button — click loads 3 mock images), uploaded image rows with 12px well thumbnail + filename/ext + size + Primary badge + Cover radio + more menu. Hero icon: RiImageAddFill. Continue gated on images.length > 0.",
            },
            {
              name: "4. Stock Status",
              type: "step-add-stock-status.tsx",
              description: "SKU (Input — hint 'e.g. AW5-GPS-40-001'), Set Custom Stock Status (large numeric Input + 6 quick-pick chips: 50/100/200/400/800/1200), Status (Select: Active / Draft / Archived), Low-stock alert (Switch + conditional threshold Input). Hero icon: RiPieChartFill. Continue gated on stock defined.",
            },
            {
              name: "5. Summary",
              type: "step-summary.tsx",
              description: "Auto-loads `filledProduct` mock on mount if state is empty. Read-only review: Name, Description, [Category | Price | Stock] triple split by vertical dashed dividers, image grid (72px thumbs + 4px feature-base star badge on primary), SKU + Status badge. Submit Product CTA (primary, full-width). Hero icon: RiShoppingBasket2Fill.",
            },
          ]}
        />
      </DocsSection>

      <DocsSection title="Primitive map (source → Dash)">
        <DocsPropsTable
          rows={[
            { name: "components/ui/button", type: "Button (tone/style/size)", description: "Source Button.Root with variant/mode. Continue/Complete use `tone='primary' style='filled'`, Save Draft uses `tone='neutral' style='stroke'`." },
            { name: "components/ui/compact-button", type: "CompactButton", description: "Close (X) icon button and per-row more actions." },
            { name: "components/ui/link-button", type: "LinkButton", description: "Back to {prev label} link in the header." },
            { name: "components/custom-input", type: "InputRoot + Input", description: "Source wraps Radix Input. Dash uses InputRoot/Input slot pair; affixes via `InputIcon` / `InputAffix` (not used here)." },
            { name: "components/custom-select", type: "Select / SelectTrigger / SelectContent / SelectItem", description: "Source used a custom Select; Dash exports Radix-backed primitive with the same shape." },
            { name: "components/custom-textarea", type: "Textarea", description: "Dash Textarea matches Figma sizing tokens." },
            { name: "@radix-ui/react-label", type: "Label", description: "Dash Label supports `required` / `optional` / `hint` slots — used for SKU `hint='e.g. AW5-GPS-40-001'`." },
            { name: "components/check-button", type: "Inline chip button", description: "Stock quick-picks (50/100/200/400/800/1200). Dash has no dedicated `CheckButton`; inlined as a styled `<button>` with active border state — closest off-the-shelf is `Tag variant='stroke'` (not interactive enough for this use)." },
            { name: "components/ui/badge", type: "Badge", description: "Primary image marker (`status='feature' appearance='lighter' type='left-icon'`) and Status pill on the summary." },
            { name: "primereact InputNumber", type: "native `<input type='number'>`", description: "Source pulls PrimeReact for currency-formatted number input; Dash uses native type=number for docs simplicity. Production should wrap with a currency-mask library." },
            { name: "react-aria-components NumberField", type: "native `<input type='number'>`", description: "Same simplification for stock input." },
            { name: "(no source equivalent)", type: "SegmentedControl", description: "Added in docs as the per-step deep-dive switcher — not present in the original wizard." },
          ]}
        />
      </DocsSection>
    </DocsPageShell>
    </TooltipProvider>
  )
}
