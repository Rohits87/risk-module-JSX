"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { MultiSelect } from "@/components/ui/multi-select"
import type { Country } from "@/lib/types"

const parameterTypes = ["negativeCountries", "negativeBINs", "negativeIPs", "negativeDomains"] as const
type ParameterType = (typeof parameterTypes)[number]

const globalParameterSchema = z.object({
  parameterType: z.enum(parameterTypes),
  values: z
    .union([z.string(), z.array(z.string())])
    .refine((val) => (Array.isArray(val) ? val.length > 0 : typeof val === "string" && val.trim().length > 0), {
      message: "Please enter at least one value.",
    }),
})

type FormValues = z.infer<typeof globalParameterSchema>

interface GlobalParameterModalProps {
  isOpen: boolean
  onOpenChange: (isOpen: boolean) => void
  onSubmit: (data: { parameterType: ParameterType; values: string[] }) => void
  countries: Country[]
}

export default function GlobalParameterModal({ isOpen, onOpenChange, onSubmit, countries }: GlobalParameterModalProps) {
  const form = useForm<FormValues>({
    resolver: zodResolver(globalParameterSchema),
    defaultValues: {
      parameterType: "negativeCountries",
      values: [],
    },
  })

  const selectedParameterType = form.watch("parameterType")

  const handleSubmit = (data: FormValues) => {
    const valuesArray =
      typeof data.values === "string"
        ? data.values
            .split(/[\n,]+/)
            .map((v) => v.trim())
            .filter(Boolean)
        : data.values
    onSubmit({ parameterType: data.parameterType, values: valuesArray })
  }

  const countryOptions = countries.map((c) => ({ value: c.code, label: c.name }))

  const getPlaceholderText = (type: ParameterType) => {
    switch (type) {
      case "negativeBINs":
        return "Enter 6-digit BINs, one per line or comma-separated."
      case "negativeIPs":
        return "Enter IP addresses or CIDR ranges, one per line or comma-separated."
      case "negativeDomains":
        return "Enter domain names, one per line or comma-separated."
      default:
        return ""
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Set Global Risk Parameter</DialogTitle>
          <DialogDescription>
            Add new values to a parameter for all active and inactive profiles. This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="parameterType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Parameter Type</FormLabel>
                  <Select
                    onValueChange={(value: ParameterType) => {
                      field.onChange(value)
                      form.setValue("values", value === "negativeCountries" ? [] : "") // Reset values on change
                      form.clearErrors("values")
                    }}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a parameter to update" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="negativeCountries">Negative Countries</SelectItem>
                      <SelectItem value="negativeBINs">Negative BINs</SelectItem>
                      <SelectItem value="negativeIPs">Negative IPs</SelectItem>
                      <SelectItem value="negativeDomains">Negative Domains</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="values"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Values to Add</FormLabel>
                  <FormControl>
                    {selectedParameterType === "negativeCountries" ? (
                      <MultiSelect
                        options={countryOptions}
                        selected={(field.value as string[]) || []}
                        onChange={field.onChange}
                        placeholder="Select countries to add..."
                      />
                    ) : (
                      <Textarea
                        placeholder={getPlaceholderText(selectedParameterType)}
                        {...field}
                        value={(field.value as string) || ""}
                        rows={5}
                      />
                    )}
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit">Confirm & Apply</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
