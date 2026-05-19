"use client"

import * as React from "react"
import {
  RiAppleFill as Apple,
  RiGooglePlayLine as PlayLine,
  RiAmazonFill as AmazonI,
  RiMicrosoftFill as MicrosoftI,
  RiBuilding2Line as Building,
  RiFileTextLine as FileText,
  RiBookOpenLine as Book,
  RiExternalLinkLine as ExternalLink,
} from "@remixicon/react"
import { LinkButton } from "@/registry/dash/ui/link-button"
import { cn } from "@/registry/dash/lib/utils"
import {
  DocsPageShell,
  DocsHeader,
  DocsSection,
  DocsExample,
  DocsPropsTable,
} from "@/components/docs/page-shell"
import { DocsCode } from "@/components/docs/code-block"

/**
 * App Store Badges — Figma 1:1 (2 nodes verified 2026-05-18).
 *
 *   253:6998     Master grid — 8 stores × 2 styles (Black filled / White stroke)
 *   2806:5650    Brand detail card schema (App Store example)
 *
 * Stores: App Store (iOS) · Mac App Store · Amazon Appstore · Galaxy Store ·
 *         Huawei AppGallery · F-Droid · Google Play · Microsoft Store.
 */

type StoreKey =
  | "appstore"
  | "macappstore"
  | "amazon"
  | "galaxy"
  | "appgallery"
  | "fdroid"
  | "googleplay"
  | "microsoft"

type Style = "black" | "white"

type Store = {
  key: StoreKey
  brand: string
  caption: string
  label: string
  hrefHint: string
  guidelines: string
  icon: React.ReactNode
}

const STORES: Store[] = [
  {
    key: "appstore",
    brand: "Apple",
    caption: "Download on the",
    label: "App Store",
    hrefHint: "apps.apple.com",
    guidelines: "https://developer.apple.com/app-store/marketing/guidelines/",
    icon: <Apple className="size-7" />,
  },
  {
    key: "macappstore",
    brand: "Apple",
    caption: "Download on the",
    label: "Mac App Store",
    hrefHint: "apps.apple.com/mac",
    guidelines: "https://developer.apple.com/app-store/marketing/guidelines/",
    icon: <Apple className="size-7" />,
  },
  {
    key: "amazon",
    brand: "Amazon",
    caption: "available at",
    label: "amazon appstore",
    hrefHint: "amazon.com/apps",
    guidelines: "https://developer.amazon.com/docs/policy-center/app-store-badges.html",
    icon: <AmazonI className="size-7" />,
  },
  {
    key: "galaxy",
    brand: "Samsung",
    caption: "Available on",
    label: "Galaxy Store",
    hrefHint: "galaxystore.samsung.com",
    guidelines: "https://developer.samsung.com/galaxy-store",
    icon: <GalaxyIcon className="size-7" />,
  },
  {
    key: "appgallery",
    brand: "Huawei",
    caption: "EXPLORE IT ON",
    label: "AppGallery",
    hrefHint: "appgallery.huawei.com",
    guidelines: "https://developer.huawei.com/consumer/en/doc/AppGallery-connect-Guides",
    icon: <AppGalleryIcon className="size-7" />,
  },
  {
    key: "fdroid",
    brand: "F-Droid",
    caption: "GET IT ON",
    label: "F-Droid",
    hrefHint: "f-droid.org",
    guidelines: "https://f-droid.org/en/docs/Get_It_on_F-Droid_Badge/",
    icon: <FDroidIcon className="size-7" />,
  },
  {
    key: "googleplay",
    brand: "Google",
    caption: "GET IT ON",
    label: "Google Play",
    hrefHint: "play.google.com",
    guidelines: "https://play.google.com/intl/en_us/badges/",
    icon: <PlayIcon className="size-7" />,
  },
  {
    key: "microsoft",
    brand: "Microsoft",
    caption: "Get it from",
    label: "Microsoft",
    hrefHint: "apps.microsoft.com",
    guidelines: "https://learn.microsoft.com/en-us/windows/apps/publish/store-policies",
    icon: <MicrosoftI className="size-7" />,
  },
]

export default function AppStoreBadgesPage() {
  return (
    <DocsPageShell>
      <DocsHeader
        category="Foundations"
        title="App Store Badges"
        description="Official platform-store download badges. 8 stores × 2 styles (Black filled · White stroke). Use in marketing footers, mobile-app landing pages, app announcement emails. Each badge is a real anchor — link to the actual app page, never a placeholder."
      />

      <DocsSection title="Brand card spec">
        <p className="text-sm text-text-sub-600 max-w-2xl">
          Detail card schema per Figma node 2806:5650 — brand metadata + 2-style preview chips.
        </p>
        <DocsExample
          title="App Store — full brand card"
          preview={
            <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] gap-6 max-w-4xl">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <span className="inline-flex size-10 items-center justify-center rounded-md bg-[#0098EE] text-white">
                    <AppStoreGlyph className="size-6" />
                  </span>
                  <div>
                    <div className="text-sm font-medium text-text-strong-950">App Store</div>
                    <div className="text-xs text-text-sub-600">Download on the App Store</div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <ChipBox><StoreBadge store={STORES[0]} style="black" /></ChipBox>
                  <ChipBox><StoreBadge store={STORES[0]} style="white" /></ChipBox>
                </div>
              </div>
              <div className="space-y-1 text-sm">
                <DetailRow icon={Building} label="Company name">Apple</DetailRow>
                <DetailRow icon={FileText} label="Description">Official app store for Mac applications. Adhere to Apple's branding guidelines for badge usage.</DetailRow>
                <DetailRow icon={FileText} label="Content">Download on the App Store</DetailRow>
                <DetailRow icon={Book} label="Guidelines">
                  <a href={STORES[0].guidelines} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-(--primary-base) hover:underline">
                    Check Guidelines <ExternalLink className="size-3" />
                  </a>
                </DetailRow>
              </div>
            </div>
          }
          code={`<StoreBadge store="appstore" style="black" href="https://apps.apple.com/..." />`}
        />
      </DocsSection>

      <DocsSection title="All 8 stores × 2 styles">
        <p className="text-sm text-text-sub-600 max-w-2xl">
          Same badge dimensions across all 8 stores. Black style = filled dark on light page. White style = white surface w/ gray border on dark page.
        </p>
        <DocsExample
          title="Black (filled) row"
          preview={
            <div className="flex flex-wrap items-center gap-3">
              {STORES.map((s) => (
                <StoreBadge key={s.key} store={s} style="black" />
              ))}
            </div>
          }
          code={`<StoreBadge store="appstore"   style="black" />
<StoreBadge store="googleplay" style="black" />
<StoreBadge store="microsoft"  style="black" />`}
        />
        <DocsExample
          title="White (stroke) row"
          preview={
            <div className="flex flex-wrap items-center gap-3">
              {STORES.map((s) => (
                <StoreBadge key={s.key} store={s} style="white" />
              ))}
            </div>
          }
          code={`<StoreBadge store="appstore"   style="white" />
<StoreBadge store="googleplay" style="white" />`}
        />
      </DocsSection>

      <DocsSection title="Usage examples">
        <DocsExample
          title="Marketing footer — black on light"
          preview={
            <footer className="rounded-xl border border-stroke-soft-200 bg-bg-white-0 p-6 flex flex-wrap items-center gap-3">
              <div className="text-sm text-text-strong-950 font-medium mr-4">Download Dash</div>
              <StoreBadge store={STORES[0]} style="black" />
              <StoreBadge store={STORES[6]} style="black" />
              <StoreBadge store={STORES[7]} style="black" />
            </footer>
          }
          code={`<footer>
  <StoreBadge store="appstore" style="black" />
  <StoreBadge store="googleplay" style="black" />
</footer>`}
        />
        <DocsExample
          title="Dark hero — white on dark"
          preview={
            <div className="rounded-xl bg-bg-strong-950 p-6 text-white">
              <div className="text-base font-semibold mb-3">Get the Dash mobile app</div>
              <div className="flex flex-wrap gap-3">
                <StoreBadge store={STORES[0]} style="white" />
                <StoreBadge store={STORES[6]} style="white" />
              </div>
            </div>
          }
          code={`<div className="bg-bg-strong-950">
  <StoreBadge store="appstore" style="white" />
  <StoreBadge store="googleplay" style="white" />
</div>`}
        />
      </DocsSection>

      <DocsSection title="Legal & guidelines">
        <ul className="space-y-2 text-sm text-text-strong-950/90">
          <li>• <strong>Trademark ownership</strong> — every store badge is the trademark of its respective owner (Apple Inc., Google LLC, Amazon, Samsung, Huawei, F-Droid, Microsoft).</li>
          <li>• <strong>Required link target</strong> — each badge must link to a real app page. Placeholders / dead links violate guidelines.</li>
          <li>• <strong>Per-store rules</strong> — every brand publishes formal badge usage guidelines. Read each before placement:</li>
          <li className="pl-4 grid grid-cols-2 gap-1.5">
            {STORES.map((s) => (
              <a key={s.key} href={s.guidelines} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-(--primary-base) hover:underline">
                {s.label} <ExternalLink className="size-3" />
              </a>
            ))}
          </li>
          <li>• <strong>Aspect ratio + clear space</strong> — never stretch, recolor, or crowd. Preserve clear space ≥ half badge height.</li>
        </ul>
      </DocsSection>

      <DocsSection title="API">
        <DocsPropsTable
          rows={[
            { name: "store", type: '"appstore" | "macappstore" | "amazon" | "galaxy" | "appgallery" | "fdroid" | "googleplay" | "microsoft"', description: "Which store badge to render." },
            { name: "style", type: '"black" | "white"', defaultValue: '"black"', description: "Surface treatment. black = filled dark, white = stroke." },
            { name: "href", type: "string", description: "Target URL — the actual app page. Required for production use." },
            { name: "size", type: '"sm" | "md"', defaultValue: '"md"', description: "Compact (sm = 40h) or default (md = 48h)." },
          ]}
        />
      </DocsSection>
    </DocsPageShell>
  )
}

function StoreBadge({
  store,
  style = "black",
  size = "md",
  href,
}: {
  store: Store
  style?: Style
  size?: "sm" | "md"
  href?: string
}) {
  const dark = style === "black"
  const h = size === "sm" ? "h-10" : "h-12"
  const padY = size === "sm" ? "py-1.5" : "py-2"
  const Component = href ? "a" : "div"
  return (
    <Component
      {...(href ? { href, target: "_blank", rel: "noopener noreferrer" } : {})}
      aria-label={`${store.caption} ${store.label}`}
      className={cn(
        "inline-flex items-center gap-2 rounded-lg border px-3 transition-colors",
        h,
        padY,
        dark
          ? "bg-bg-strong-950 text-white border-bg-strong-950 hover:bg-bg-strong-950/90"
          : "bg-bg-white-0 text-bg-strong-950 border-stroke-soft-200 hover:bg-bg-weak-50",
      )}
    >
      <span className="shrink-0">{store.icon}</span>
      <span className="flex flex-col leading-tight">
        <span className={cn("text-[8px] uppercase tracking-[0.04em]", dark ? "text-white/80" : "text-bg-strong-950/70")}>
          {store.caption}
        </span>
        <span className={cn("text-[15px] font-semibold leading-[1.05]", dark ? "text-white" : "text-bg-strong-950")}>
          {store.label}
        </span>
      </span>
    </Component>
  )
}

function ChipBox({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-stroke-soft-200 p-3 flex flex-col items-center gap-2">
      {children}
      <div className="text-[10px] text-text-soft-400">Original</div>
    </div>
  )
}

function DetailRow({
  icon: Icon,
  label,
  children,
}: {
  icon: React.ElementType
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="grid grid-cols-[140px_1fr] items-start gap-2 py-2 border-b border-stroke-soft-200">
      <span className="inline-flex items-center gap-1.5 text-xs text-text-sub-600">
        <Icon className="size-4 text-icon-soft-400" />
        {label}
      </span>
      <span className="text-sm text-text-strong-950">{children}</span>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/* Inline SVG icons for stores that lack a remix icon                          */
/* -------------------------------------------------------------------------- */

function AppStoreGlyph({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M19.5 4h-15a2.5 2.5 0 0 0-2.5 2.5v11A2.5 2.5 0 0 0 4.5 20h15A2.5 2.5 0 0 0 22 17.5v-11A2.5 2.5 0 0 0 19.5 4ZM7.4 16h-2L7 13l1 2.5-.6.5Zm9.6-2H8.6l-.7 1.3-1-1.7L9.3 9l1 1.7L11.6 8h1.7l-3 5.3h6.4l.3.7Z" />
    </svg>
  )
}

function GalaxyIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M3 6a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6Zm9 3a3 3 0 1 0 0 6 3 3 0 0 0 0-6Zm-3 0H7v6h2v-6Zm8 0h-2v6h2v-6Z" />
    </svg>
  )
}

function AppGalleryIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M12 2 4 7v10l8 5 8-5V7l-8-5Zm0 2.2 6 3.75v8.1l-6 3.75-6-3.75v-8.1l6-3.75ZM10 9v6h1V9h-1Zm3 0v6h1V9h-1Z" />
    </svg>
  )
}

function FDroidIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M7 6h2v2H7V6Zm8 0h2v2h-2V6ZM6 10h12v2a6 6 0 0 1-12 0v-2Zm2 6h2v3H8v-3Zm6 0h2v3h-2v-3Z" />
    </svg>
  )
}

function PlayIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <path fill="#EA4335" d="M4 3.5v17l9.5-8.5L4 3.5Z" />
      <path fill="#FBBC04" d="m13.5 12 4.2-3.8L4 3.5l9.5 8.5Z" />
      <path fill="#34A853" d="m13.5 12-9.5 8.5 13.7-4.7-4.2-3.8Z" />
      <path fill="#4285F4" d="m17.7 8.2-4.2 3.8 4.2 3.8 2.8-1.5c1.3-.7 1.3-2.7 0-3.4l-2.8-1.5Z" />
    </svg>
  )
}
