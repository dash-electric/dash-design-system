"use client"

import * as React from "react"
import {
  RiArrowLeftLine,
  RiCheckboxCircleFill,
  RiCloseCircleLine,
  RiPlayCircleLine,
  RiMapPin2Line,
  RiBox3Line,
  RiTruckLine,
  RiTimeLine,
  RiArrowRightUpLine,
  RiPriceTag3Line,
} from "@remixicon/react"
import {
  DocsPageShell,
  DocsHeader,
  DocsSection,
  DocsExample,
  DocsPropsTable,
} from "@/components/docs/page-shell"
import { DocsCode } from "@/components/docs/code-block"
import { Button } from "@/registry/dash/ui/button"
import { LinkButton } from "@/registry/dash/ui/link-button"
import { StatusBadge } from "@/registry/dash/ui/badge"
import { Banner } from "@/registry/dash/ui/banner"
import { Field, FieldGroup, FieldDescription } from "@/registry/dash/ui/field"
import { Label } from "@/registry/dash/ui/label"
import { InputRoot, Input, InputAffix } from "@/registry/dash/ui/input"
import { Divider } from "@/registry/dash/ui/divider"
import {
  PortalShell,
  PortalHeader,
} from "../_portal-shared"

/**
 * Portal Simulation Detail — ported from
 * next-portal-v2-web/app/[locale]/(dashboard)/simulation/[slug]/page.tsx.
 *
 * In production this route redirects to /deliveries/[slug] — sandbox controls
 * (Next / Fail / Cancel) appear in-line on the regular delivery detail when
 * envMode === 'sandbox'. This docs template recreates the dedicated detail
 * surface ops teams saw in v1: simulation config form (origin/destination/
 * parcel weight) + result map placeholder + price breakdown + lifecycle
 * controls.
 */

function DocsTemplatePreview({ children }: { children: React.ReactNode }) {
  return (
    <div className="w-full overflow-x-auto rounded-2xl border border-stroke-soft-200 bg-bg-weak-50">
      <div className="min-w-[1280px] p-6">{children}</div>
    </div>
  )
}

function MapPlaceholder() {
  return (
    <div className="relative flex h-[280px] w-full items-center justify-center overflow-hidden rounded-xl bg-bg-weak-50 ring-1 ring-inset ring-stroke-soft-200">
      <div
        className="absolute inset-0 opacity-60"
        style={{
          backgroundImage:
            "linear-gradient(90deg, transparent 0, transparent 39px, rgb(0 0 0 / 0.04) 40px), linear-gradient(0deg, transparent 0, transparent 39px, rgb(0 0 0 / 0.04) 40px)",
          backgroundSize: "40px 40px",
        }}
      />
      <div className="absolute left-[18%] top-[58%] flex items-center gap-1 rounded-full bg-bg-white-0 px-2 py-1 text-xs shadow-sm">
        <RiMapPin2Line className="size-3.5 text-(--state-success-base)" />
        Pickup
      </div>
      <div className="absolute right-[14%] top-[24%] flex items-center gap-1 rounded-full bg-bg-white-0 px-2 py-1 text-xs shadow-sm">
        <RiMapPin2Line className="size-3.5 text-(--state-error-base)" />
        Dropoff
      </div>
      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
        <path
          d="M 22 60 Q 50 30 84 28"
          stroke="rgb(0 0 0 / 0.4)"
          strokeWidth="0.6"
          strokeDasharray="1.5 1.5"
          fill="none"
        />
      </svg>
    </div>
  )
}

export default function PortalSimulationDetailPage() {
  return (
    <DocsPageShell>
      <DocsHeader
        category="Templates / Dash Next Portal"
        title="Portal Simulation Detail"
        description="Sandbox delivery configuration + result preview. Two-pane layout: left = config form (origin/destination/parcel weight), right = result map + price breakdown. Footer hosts the lifecycle controls (Next stage / Fail / Cancel) that drive the sandbox state machine."
      />

      <DocsSection title="Full preview">
        <DocsExample
          bare
          title="Simulation #sim-7841"
          description="Wedding cake delivery scenario, picked-up phase. Three sandbox actions advance the lifecycle."
          preview={
            <DocsTemplatePreview>
              <PortalShell active="/deliveries" withAnnouncementBar>
                <PortalHeader
                  title="Simulation #sim-7841"
                  subtitle="Wedding cake delivery — JKT"
                  sandbox
                  actions={
                    <Button tone="neutral" style="stroke" size="sm">
                      <RiArrowLeftLine className="size-4" />
                      Back
                    </Button>
                  }
                />
                <div className="grid grid-cols-12 gap-6 px-8 py-6">
                  {/* Left — Config form */}
                  <div className="col-span-12 flex flex-col gap-4 lg:col-span-5">
                    <div className="rounded-2xl bg-bg-white-0 p-6 ring-1 ring-inset ring-stroke-soft-200">
                      <div className="mb-4 flex items-center justify-between">
                        <p className="text-base font-medium text-text-strong-950">
                          Configuration
                        </p>
                        <StatusBadge status="warning" variant="dot-light">
                          Picking up
                        </StatusBadge>
                      </div>

                      <FieldGroup>
                        <Field>
                          <Label>Origin address</Label>
                          <InputRoot>
                            <Input defaultValue="Senopati Hub, Jakarta Selatan" />
                          </InputRoot>
                        </Field>
                        <Field>
                          <Label>Destination address</Label>
                          <InputRoot>
                            <Input defaultValue="Plaza Senayan, Jakarta Pusat" />
                          </InputRoot>
                        </Field>
                        <Field>
                          <Label>Parcel weight</Label>
                          <InputRoot>
                            <Input defaultValue="8" type="number" />
                            <InputAffix>kg</InputAffix>
                          </InputRoot>
                          <FieldDescription>Max 50kg per parcel.</FieldDescription>
                        </Field>
                        <Field>
                          <Label>Recipient</Label>
                          <InputRoot>
                            <Input defaultValue="Sigit Permana · +62 812-3456-7890" />
                          </InputRoot>
                        </Field>
                      </FieldGroup>
                    </div>
                  </div>

                  {/* Right — Map + Price */}
                  <div className="col-span-12 flex flex-col gap-4 lg:col-span-7">
                    <div className="rounded-2xl bg-bg-white-0 p-6 ring-1 ring-inset ring-stroke-soft-200">
                      <div className="mb-4 flex items-center justify-between">
                        <p className="text-base font-medium text-text-strong-950">
                          Route preview
                        </p>
                        <span className="inline-flex items-center gap-1 text-xs text-text-sub-600">
                          <RiTimeLine className="size-3.5" />
                          ETA 22 min
                        </span>
                      </div>
                      <MapPlaceholder />
                    </div>

                    <div className="rounded-2xl bg-bg-white-0 p-6 ring-1 ring-inset ring-stroke-soft-200">
                      <p className="mb-3 text-base font-medium text-text-strong-950">
                        Price breakdown
                      </p>
                      <div className="space-y-2.5">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-text-sub-600">Base fare</span>
                          <span className="text-text-strong-950">Rp 25,000</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-text-sub-600">Distance · 6.4 km</span>
                          <span className="text-text-strong-950">Rp 19,200</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-text-sub-600">Parcel weight surcharge</span>
                          <span className="text-text-strong-950">Rp 8,000</span>
                        </div>
                        <Divider />
                        <div className="flex items-center justify-between text-sm font-medium">
                          <span className="text-text-strong-950">Total</span>
                          <span className="text-text-strong-950">Rp 52,200</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Footer — Sandbox lifecycle controls */}
                  <div className="col-span-12">
                    <Banner status="warning" appearance="lighter" title="Sandbox controls">
                      Drive this run through its lifecycle without dispatching a real driver.
                    </Banner>
                  </div>

                  <div className="col-span-12 flex items-center justify-end gap-3">
                    <Button tone="destructive" style="ghost" size="sm">
                      <RiCloseCircleLine className="size-4" />
                      Cancel
                    </Button>
                    <Button tone="neutral" style="stroke" size="sm">
                      <RiCloseCircleLine className="size-4" />
                      Fail
                    </Button>
                    <Button tone="primary" style="filled" size="sm">
                      <RiPlayCircleLine className="size-4" />
                      Next stage
                    </Button>
                  </div>
                </div>
              </PortalShell>
            </DocsTemplatePreview>
          }
          code={`<PortalShell active="/deliveries" withAnnouncementBar>
  <PortalHeader title="Simulation #sim-7841" sandbox actions={<BackBtn />} />
  <div className="grid grid-cols-12 gap-6">
    <ConfigForm className="col-span-5" />
    <div className="col-span-7 space-y-4">
      <RoutePreviewMap />
      <PriceBreakdown />
    </div>
    <SandboxControls className="col-span-12" />
  </div>
</PortalShell>`}
        />
      </DocsSection>

      <DocsSection title="Anatomy">
        <ul className="text-sm text-text-sub-600 space-y-1.5 list-disc pl-6">
          <li><b>Header</b> — back button + run title + scenario subtitle + sandbox pill.</li>
          <li><b>Config panel (5/12)</b> — origin, destination, parcel weight (with affix), recipient. Pre-fills from simulation seed; editable while status is Allocating only.</li>
          <li><b>Route preview (7/12)</b> — map placeholder with pickup/dropoff pins and dashed path. In production this is a Mapbox GL canvas with live driver position.</li>
          <li><b>Price breakdown</b> — base fare + distance + surcharges. Divider before the total row.</li>
          <li><b>Sandbox controls</b> — warning Banner above three actions: Cancel (destructive ghost), Fail (neutral stroke), Next stage (primary filled). Mirrors the state machine in the production delivery detail.</li>
        </ul>
      </DocsSection>

      <DocsSection title="When to use">
        <ul className="text-sm text-text-sub-600 space-y-1.5 list-disc pl-6">
          <li><b>Use</b> for sandbox flows that need to drive a state machine forward with explicit operator clicks.</li>
          <li><b>Use</b> the warning-Banner-above-actions pattern wherever destructive lifecycle moves live (cancel / fail / etc.) — the banner is the affordance contract.</li>
          <li><b>Don't</b> reuse this layout for production delivery detail — that page has the same skeleton but inline sandbox controls instead of footer-pinned ones.</li>
        </ul>
      </DocsSection>

      <DocsSection title="API">
        <DocsPropsTable
          rows={[
            { name: "run", type: "SimulationRun", description: "{ id, origin, destination, parcelWeight, recipient, status, price:{ base, distance, surcharge, total } }." },
            { name: "onNext", type: "() => void", description: "Advances the simulation to the next stage." },
            { name: "onFail", type: "() => void", description: "Marks the simulation as failed (terminal)." },
            { name: "onCancel", type: "() => void", description: "Cancels the simulation (terminal)." },
            { name: "onBack", type: "() => void", description: "Returns to /simulation (or /deliveries in production)." },
          ]}
        />
      </DocsSection>
    </DocsPageShell>
  )
}
