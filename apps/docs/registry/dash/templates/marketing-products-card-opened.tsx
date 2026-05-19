"use client"

import * as React from "react"
import { RiArrowUpSLine as ChevronUp, RiArrowDownSLine as ChevronDown, RiArrowRightUpLine as ArrowUpRight, RiEditLine as Edit, RiMore2Line as MoreVertical } from "@remixicon/react"
import { Card, CardContent } from "@/registry/dash/ui/card"
import { Button } from "@/registry/dash/ui/button"
import { IconButton } from "@/registry/dash/ui/icon-button"
import { cn } from "@/registry/dash/lib/utils"

export type ProductCardData = {
  id: string
  name: string
  category: string
  price: number
  stock: number
  thumbnailHue: number
  opened?: boolean
}

export type MarketingProductsCardOpenedProps = {
  products?: ProductCardData[]
  className?: string
}

const defaultProducts: ProductCardData[] = [
  { id: "p1", name: "Apple Watch S5 GPS 40mm White",   category: "Technology", price: 399,  stock: 124, thumbnailHue: 260 },
  { id: "p2", name: "MacBook Pro M1 256GB Silver",     category: "Technology", price: 948,  stock: 48,  thumbnailHue: 200, opened: true },
  { id: "p3", name: "iMac M1 24-inch Purple",          category: "Technology", price: 1499, stock: 4,   thumbnailHue: 280 },
  { id: "p4", name: "AirPods Max Green",               category: "Technology", price: 549,  stock: 87,  thumbnailHue: 140 },
  { id: "p5", name: "HomePod Mini Orange",             category: "Technology", price: 99,   stock: 0,   thumbnailHue: 30 },
  { id: "p6", name: "Apple Studio Display Standard",   category: "Technology", price: 1599, stock: 12,  thumbnailHue: 220 },
  { id: "p7", name: "Apple AirPods Pro 2nd Gen",       category: "Technology", price: 249,  stock: 60,  thumbnailHue: 160 },
  { id: "p8", name: "Apple Watch Ultra Titanium",      category: "Technology", price: 799,  stock: 25,  thumbnailHue: 320 },
]

const tabs = ["Sales", "Views", "Stock"]

/**
 * MarketingProductsCardOpened — Products grid with one card expanded inline,
 * revealing a detail panel (price + stock + 3-tab analytics + Edit Product CTA).
 * Ported from AlignUI Pro Figma node `164965:34586`.
 */
export function MarketingProductsCardOpened({
  products = defaultProducts,
  className,
}: MarketingProductsCardOpenedProps) {
  return (
    <div className={cn("space-y-6", className)}>
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-text-strong-950">
          My Products
        </h1>
        <p className="text-sm text-text-sub-600 mt-1">
          Manage and collaborate on your product listings.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {products.map((p) => (
          <Card key={p.id} className={p.opened ? "ring-2 ring-(--dash-purple-200)" : ""}>
            <CardContent className="p-3 space-y-3">
              <div className="relative aspect-square rounded-lg overflow-hidden">
                <div
                  className="absolute inset-0"
                  style={{
                    background: `linear-gradient(135deg, hsl(${p.thumbnailHue} 80% 60%), hsl(${p.thumbnailHue + 40} 70% 75%))`,
                  }}
                />
                <IconButton
                  size="xs"
                  style="ghost"
                  className="absolute top-2 right-2 bg-bg-white-0/80 backdrop-blur"
                  aria-label="More"
                >
                  <MoreVertical className="size-3.5" />
                </IconButton>
              </div>

              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="text-sm font-medium text-text-strong-950 truncate">{p.name}</div>
                  <div className="text-xs text-text-sub-600 mt-0.5">{p.category}</div>
                </div>
                {p.opened ? (
                  <ChevronUp className="size-4 text-text-sub-600 shrink-0" />
                ) : (
                  <ChevronDown className="size-4 text-text-sub-600 shrink-0" />
                )}
              </div>

              {p.opened ? (
                <div className="space-y-3 pt-2 border-t border-stroke-soft-200">
                  <div className="flex items-center gap-6">
                    <div>
                      <div className="text-xs text-text-soft-400">Price</div>
                      <div className="text-sm font-semibold text-text-strong-950">
                        ${p.price.toFixed(2)}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-text-soft-400">Stock</div>
                      <div className="flex items-center gap-1 text-sm font-medium text-text-strong-950">
                        {p.stock} units
                        <ArrowUpRight className="size-3.5 text-(--dash-green-600)" />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-xs border-b border-stroke-soft-200 -mx-3 px-3">
                    {tabs.map((t, i) => (
                      <button
                        key={t}
                        className={cn(
                          "py-1.5 border-b-2 -mb-px transition-colors",
                          i === 0
                            ? "border-(--dash-purple-700) text-text-strong-950 font-medium"
                            : "border-transparent text-text-sub-600",
                        )}
                      >
                        {t}
                      </button>
                    ))}
                  </div>

                  {/* Sparkline placeholder */}
                  <div className="h-16 relative">
                    <svg viewBox="0 0 200 60" className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
                      <path
                        d="M0 50 L20 45 L40 38 L60 42 L80 30 L100 35 L120 20 L140 25 L160 15 L180 18 L200 8"
                        fill="none"
                        stroke="var(--dash-purple-600)"
                        strokeWidth="2"
                      />
                      <path
                        d="M0 50 L20 45 L40 38 L60 42 L80 30 L100 35 L120 20 L140 25 L160 15 L180 18 L200 8 L200 60 L0 60 Z"
                        fill="var(--dash-purple-600)"
                        opacity="0.1"
                      />
                    </svg>
                  </div>

                  <Button tone="primary" style="filled" size="sm" className="w-full">
                    <Edit className="size-3.5" /> Edit Product
                  </Button>

                  <div className="flex items-center justify-center gap-1">
                    <div className="h-1 w-4 rounded-full bg-(--dash-purple-700)" />
                    <div className="h-1 w-1 rounded-full bg-stroke-soft-200" />
                    <div className="h-1 w-1 rounded-full bg-stroke-soft-200" />
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between text-xs pt-2 border-t border-stroke-soft-200">
                  <span className="font-semibold text-text-strong-950">${p.price}</span>
                  <span className="text-text-sub-600">{p.stock} units</span>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
