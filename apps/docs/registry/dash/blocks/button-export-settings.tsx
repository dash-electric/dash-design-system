"use client"

/**
 * Button Examples — Export Settings dialog.
 *
 * Figma parity: Button [Examples] :: id 167874:113157.
 * Demonstrates a settings modal with upsell-banner, Cancel + primary CTA.
 */

import * as React from "react"
import { RiSparkling2Line as Sparkles } from "@remixicon/react"
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalTitle,
  ModalDescription,
  ModalBody,
  ModalFooter,
} from "@/registry/dash/ui/modal"
import { Button } from "@/registry/dash/ui/button"
import { Badge } from "@/registry/dash/ui/badge"
import { Card, CardContent } from "@/registry/dash/ui/card"

export function ButtonExportSettings({
  open,
  onOpenChange,
  trigger,
  onExport,
  onUpgrade,
}: {
  open?: boolean
  onOpenChange?: (next: boolean) => void
  trigger?: React.ReactNode
  onExport?: () => void
  onUpgrade?: () => void
}) {
  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      {trigger}
      <ModalContent>
        <ModalHeader>
          <ModalTitle>Export Settings</ModalTitle>
          <ModalDescription>Export the videos in 4K video quality.</ModalDescription>
        </ModalHeader>
        <ModalBody>
          <Card className="bg-(--primary-alpha-10) border-(--primary-alpha-24)">
            <CardContent className="flex items-start gap-3 p-3">
              <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary text-text-white-0">
                <Sparkles className="size-4" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-label-small text-text-strong-950">4K Export</span>
                  <Badge appearance="lighter" status="feature" size="sm">NEW</Badge>
                </div>
                <p className="mt-0.5 text-paragraph-x-small text-text-sub-600">
                  To access these features, upgrade to the premium plan.
                </p>
              </div>
              <Button tone="primary" style="ghost" size="xs" onClick={onUpgrade}>
                Upgrade
              </Button>
            </CardContent>
          </Card>
        </ModalBody>
        <ModalFooter>
          <Button tone="neutral" style="stroke" size="md" onClick={() => onOpenChange?.(false)}>
            Cancel
          </Button>
          <Button tone="primary" style="filled" size="md" onClick={onExport}>
            Export
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}
