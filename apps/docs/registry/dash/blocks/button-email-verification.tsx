"use client"

/**
 * Button Examples — Email Verification dialog.
 *
 * Figma parity: Button [Examples] :: id 167874:113174.
 * Demonstrates OTP entry with two link-style buttons ("Enter code manually",
 * "Resend the link") and inline footer hint.
 */

import * as React from "react"
import { RiMailCheckLine as MailCheck } from "@remixicon/react"
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
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/registry/dash/ui/input-otp"

export function ButtonEmailVerification({
  open,
  onOpenChange,
  trigger,
  email = "hi@alignui.com",
  onResend,
  onManualCode,
  onVerify,
}: {
  open?: boolean
  onOpenChange?: (next: boolean) => void
  trigger?: React.ReactNode
  email?: string
  onResend?: () => void
  onManualCode?: () => void
  onVerify?: (code: string) => void
}) {
  const [code, setCode] = React.useState("")
  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      {trigger}
      <ModalContent>
        <ModalHeader>
          <div className="flex items-center justify-center pb-2">
            <div className="flex size-12 items-center justify-center rounded-full bg-(--primary-alpha-10) text-primary">
              <MailCheck className="size-6" />
            </div>
          </div>
          <ModalTitle className="text-center">Email Verification</ModalTitle>
          <ModalDescription className="text-center">
            We have sent an email to <span className="text-text-strong-950">{email}</span>.
            Please click on the link provided in your email to verify.
          </ModalDescription>
        </ModalHeader>
        <ModalBody className="flex flex-col items-center gap-3">
          <InputOTP maxLength={6} value={code} onChange={setCode}>
            <InputOTPGroup>
              <InputOTPSlot index={0} />
              <InputOTPSlot index={1} />
              <InputOTPSlot index={2} />
              <InputOTPSlot index={3} />
              <InputOTPSlot index={4} />
              <InputOTPSlot index={5} />
            </InputOTPGroup>
          </InputOTP>
          <Button tone="primary" style="link" size="sm" onClick={onManualCode}>
            Enter code manually
          </Button>
        </ModalBody>
        <ModalFooter className="flex-col items-center gap-2">
          <Button
            tone="primary"
            style="filled"
            size="md"
            className="w-full"
            disabled={code.length < 6}
            onClick={() => onVerify?.(code)}
          >
            Verify
          </Button>
          <p className="text-paragraph-x-small text-text-sub-600">
            Can&rsquo;t find the link or code?{" "}
            <button type="button" onClick={onResend} className="text-primary hover:underline">
              Resend the link
            </button>
          </p>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}
