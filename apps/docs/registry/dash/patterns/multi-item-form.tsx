"use client"

import * as React from "react"
import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { RiAddLine as Add, RiDeleteBinLine as Trash } from "@remixicon/react"
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/registry/dash/ui/form"
import { Card, CardContent } from "@/registry/dash/ui/card"
import { Button } from "@/registry/dash/ui/button"
import { IconButton } from "@/registry/dash/ui/icon-button"
import { InputRoot, Input } from "@/registry/dash/ui/input"
import {
  UseCodeField,
  USE_CODE_REGEX,
  genUseCode,
} from "@/registry/dash/patterns/use-code-field"
import { toast } from "@/registry/dash/ui/toaster"

/**
 * multi-item-form — canonical reference for "add/remove rows + batch submit".
 *
 * WHY this pattern is anchored as a registry block (not docs prose):
 *  - The "delivery creation page jadi multi-order" refactor case keeps re-
 *    appearing (Dash Express, Bulk, Halo). Anchoring as code means AI agents
 *    can copy this exact shape via `dash add multi-item-form` instead of
 *    re-deriving useFieldArray wiring (which they get wrong ~half the time).
 *  - The schema lives in the same file as the form so agents can't mismatch
 *    `items: z.array(...)` with the array name they pass to useFieldArray.
 *    A single source of truth defeats the most common refactor bug.
 */

// WHY one schema per file: keeps the array name (`items`) and per-row shape
// next to the form that uses them — agents searching for "items schema"
// land in the right place.
const itemSchema = z.object({
  pickupAddress: z.string().min(3, "Pickup address is required"),
  dropoffAddress: z.string().min(3, "Dropoff address is required"),
  useCode: z.string().regex(USE_CODE_REGEX, "Use code must be 6 alphanumeric chars"),
})

const formSchema = z.object({
  // WHY .min(1): a multi-item form with zero rows is just a broken empty form.
  // Enforce the constraint at the schema layer so the submit button doesn't
  // have to babysit it.
  items: z.array(itemSchema).min(1, "Add at least one delivery"),
})

type FormValues = z.infer<typeof formSchema>

/** Factory for a blank row. Centralized so add-row stays in sync with schema. */
const blankItem = (): FormValues["items"][number] => ({
  pickupAddress: "",
  dropoffAddress: "",
  useCode: genUseCode(),
})

export function MultiItemForm() {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    // WHY one default row: an empty array would render nothing, leaving the
    // user staring at a lone "Add" button. Seed one row so the affordance
    // is obvious from first paint.
    defaultValues: { items: [blankItem()] },
  })

  // WHY useFieldArray (not useState<Item[]>): RHF needs to track per-row
  // validation + dirty state. Mixing controlled local state with RHF breaks
  // FormMessage rendering and triggers double-render bugs on remove.
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  })

  const onSubmit = (values: FormValues) => {
    // Real implementation would call the batch endpoint here — see
    // `@dash/patterns/bulk-submit` for the optimistic UI + per-row rollback.
    toast.success(`${values.items.length} deliveries queued for dispatch`)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-3">
          {fields.map((field, index) => (
            <Card key={field.id}>
              <CardContent className="space-y-3 pt-5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium uppercase tracking-wider text-text-soft-400">
                    Delivery #{index + 1}
                  </span>
                  <IconButton
                    type="button"
                    size="xs"
                    tone="destructive"
                    style="ghost"
                    aria-label={`Remove delivery ${index + 1}`}
                    // WHY disable when fields.length === 1: schema requires
                    // min(1), so removing the last row would leave the form
                    // in an invalid state with no recovery affordance.
                    disabled={fields.length === 1}
                    onClick={() => remove(index)}
                  >
                    <Trash />
                  </IconButton>
                </div>
                <FormField
                  control={form.control}
                  name={`items.${index}.pickupAddress`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Pickup</FormLabel>
                      <FormControl>
                        <InputRoot>
                          <Input placeholder="Outlet or address" {...field} />
                        </InputRoot>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name={`items.${index}.dropoffAddress`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Dropoff</FormLabel>
                      <FormControl>
                        <InputRoot>
                          <Input placeholder="Recipient address" {...field} />
                        </InputRoot>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {/* Per-row use-code so each delivery gets its own. */}
                <UseCodeField name={`items.${index}.useCode`} />
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="flex items-center justify-between gap-3">
          <Button
            type="button"
            tone="neutral"
            style="stroke"
            leftIcon={<Add />}
            onClick={() => append(blankItem())}
          >
            Add delivery
          </Button>
          <Button type="submit" tone="primary" style="filled">
            Submit {fields.length} {fields.length === 1 ? "delivery" : "deliveries"}
          </Button>
        </div>
      </form>
    </Form>
  )
}
