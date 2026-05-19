"use client"

import * as React from "react"
import { RiSearchLine as Search, RiAddLine as Plus, RiFilter3Line as Filter, RiArrowUpDownLine as ArrowUpDown, RiMoreLine as MoreHorizontal, RiBox3Line as Package } from "@remixicon/react"
import { Card, CardHeader, CardDescription, CardContent } from "@/registry/dash/ui/card"
import { Button } from "@/registry/dash/ui/button"
import { Badge } from "@/registry/dash/ui/badge"
import { IconButton } from "@/registry/dash/ui/icon-button"
import { Stat, StatValue, StatTrend } from "@/registry/dash/ui/stat"
import { InputRoot, Input, InputIcon } from "@/registry/dash/ui/input"
import { cn } from "@/registry/dash/lib/utils"

/* -------------------------------------------------------------------------- */
/*  Types                                                                     */
/* -------------------------------------------------------------------------- */

export type Product = {
  id: string
  name: string
  category: string
  price: number
  stock: number
  status: "active" | "draft" | "out-of-stock"
  thumbnailHue?: number // 0-359 for placeholder thumbnail bg
}

export type MarketingProductsProps = {
  title?: string
  description?: string
  products?: Product[]
  className?: string
}

/* -------------------------------------------------------------------------- */
/*  Defaults                                                                  */
/* -------------------------------------------------------------------------- */

const defaultProducts: Product[] = [
  { id: "p1", name: "Apple Watch S5 GPS 40mm White", category: "Technology", price: 399, stock: 124, status: "active",        thumbnailHue: 260 },
  { id: "p2", name: "MacBook Pro M1 256GB Silver",   category: "Technology", price: 1299, stock: 38,  status: "active",        thumbnailHue: 200 },
  { id: "p3", name: "iMac M1 24-inch Purple",        category: "Technology", price: 1499, stock: 4,   status: "active",        thumbnailHue: 280 },
  { id: "p4", name: "AirPods Max Green",             category: "Technology", price: 549, stock: 87,   status: "active",        thumbnailHue: 140 },
  { id: "p5", name: "HomePod Mini Orange",           category: "Technology", price: 99,  stock: 0,    status: "out-of-stock",  thumbnailHue: 30 },
  { id: "p6", name: "iPad Pro 12.9-inch with M2 chip", category: "Technology", price: 1099, stock: 56, status: "active",       thumbnailHue: 220 },
  { id: "p7", name: "Magic Keyboard Wireless",       category: "Accessories", price: 129, stock: 211, status: "active",       thumbnailHue: 0 },
  { id: "p8", name: "Studio Display 5K Nano-Texture", category: "Technology", price: 1999, stock: 12, status: "draft",        thumbnailHue: 180 },
]

const statusMap = {
  "active":        { label: "Active",       status: "success" as const },
  "draft":         { label: "Draft",        status: "feature" as const },
  "out-of-stock":  { label: "Out of stock", status: "error" as const },
}

/* -------------------------------------------------------------------------- */
/*  Component                                                                 */
/* -------------------------------------------------------------------------- */

/**
 * MarketingProducts — Catalyst-style Product catalog page ported from AlignUI Pro Figma.
 * Page header + KPI tiles (Total / Active / Sales / Revenue) + product grid w/ filters.
 *
 * Source: Figma node `164711:2406` ("My Products [Marketing & Sales]").
 */
export function MarketingProducts({
  title = "My Products",
  description = "Manage and collaborate on your product listings.",
  products = defaultProducts,
  className,
}: MarketingProductsProps) {
  return (
    <div className={cn("space-y-6", className)}>
      <header className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
          <p className="text-sm text-text-sub-600">{description}</p>
        </div>
        <Button tone="primary" style="filled">
          <Plus className="size-4" /> New Products
        </Button>
      </header>

      {/* KPI tiles */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2"><CardDescription>Total Products</CardDescription></CardHeader>
          <CardContent><Stat>
            <StatValue>248</StatValue>
            <StatTrend trend="up" value="+12">this week</StatTrend>
          </Stat></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardDescription>Active Listings</CardDescription></CardHeader>
          <CardContent><Stat>
            <StatValue>186</StatValue>
            <StatTrend trend="up" value="+2%">of total</StatTrend>
          </Stat></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardDescription>Total Sales</CardDescription></CardHeader>
          <CardContent><Stat>
            <StatValue>8,944</StatValue>
            <StatTrend trend="up" value="+2.1%">this week</StatTrend>
          </Stat></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardDescription>Total Revenue</CardDescription></CardHeader>
          <CardContent><Stat>
            <StatValue>$8,944</StatValue>
            <StatTrend trend="down" value="-0.5%">vs last week</StatTrend>
          </Stat></CardContent>
        </Card>
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2">
        <InputRoot size="sm" className="w-72">
          <InputIcon><Search /></InputIcon>
          <Input placeholder="Search products..." />
        </InputRoot>
        <div className="flex-1" />
        <Button tone="neutral" style="stroke" size="sm">Last 7 days</Button>
        <Button tone="neutral" style="stroke" size="sm">
          <ArrowUpDown className="size-3.5" /> Newest
        </Button>
        <Button tone="neutral" style="stroke" size="sm">
          <Filter className="size-3.5" /> Filter
        </Button>
      </div>

      {/* Product grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
        {products.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </div>
  )
}

function ProductCard({ product }: { product: Product }) {
  const meta = statusMap[product.status]
  return (
    <Card className="overflow-hidden flex flex-col">
      <div
        className="aspect-[4/3] flex items-center justify-center relative"
        style={{
          background: `linear-gradient(135deg, hsl(${product.thumbnailHue ?? 260} 60% 92%), hsl(${(product.thumbnailHue ?? 260) + 20} 70% 80%))`,
        }}
      >
        <Package className="size-12 text-static-white/80" aria-hidden />
        <Badge appearance="lighter" status={meta.status} className="absolute top-2 left-2">
          {meta.label}
        </Badge>
        <IconButton
          tone="neutral"
          style="stroke"
          size="xs"
          className="absolute top-2 right-2 bg-bg-white-0/90"
          aria-label="More"
        >
          <MoreHorizontal />
        </IconButton>
      </div>
      <CardContent className="p-4 flex-1 flex flex-col gap-1">
        <div className="text-xs text-text-soft-400 uppercase tracking-wider">{product.category}</div>
        <div className="text-sm font-medium text-text-strong-950 line-clamp-2">{product.name}</div>
        <div className="flex items-baseline justify-between mt-auto pt-3">
          <span className="text-base font-semibold text-text-strong-950">${product.price}</span>
          <span className={cn(
            "text-xs",
            product.stock === 0 ? "text-state-error-base" : product.stock < 10 ? "text-state-warning-base" : "text-text-sub-600",
          )}>
            {product.stock} in stock
          </span>
        </div>
      </CardContent>
    </Card>
  )
}
