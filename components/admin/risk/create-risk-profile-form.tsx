"use client"

import { useState, useRef } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { MultiSelect, type MultiSelectOption } from "@/components/ui/multi-select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Checkbox } from "@/components/ui/checkbox"
import type { Country, Merchant } from "@/lib/types"
import {
  masterNegativeCountriesList,
  masterNegativeBINsList,
  masterNegativeIPsList,
  masterNegativeDomainsList,
} from "@/lib/constants"
import { useRouter } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"
import type React from "react"
import { UploadCloud } from "lucide-react"

const positiveNumberOptional = z.coerce
  .number()
  .int()
  .positive("Must be a positive number")
  .optional()
  .or(z.literal(""))

const riskProfileSchema = z
  .object({
    profileName: z.string().min(3, "Profile name must be at least 3 characters").max(100),
    description: z.string().max(500).optional(),
    negativeCountries: z.array(z.string()).optional(),
    useMasterNegativeCountries: z.boolean().optional(),
    negativeBINs: z
      .string()
      .optional()
      .refine((val) => !val || val.split(/[\n,]+/).every((bin) => /^\d{6}$/.test(bin.trim()) || bin.trim() === ""), {
        message: "Each BIN must be 6 digits. Separate with new lines or commas.",
      }),
    useMasterNegativeBINs: z.boolean().optional(),
    negativeIPs: z
      .string()
      .optional()
      .refine(
        (val) =>
          !val ||
          val
            .split(/[\n,]+/)
            .every(
              (ip) =>
                /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}(\/(?:[0-9]|[1-2][0-9]|3[0-2]))?$|^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/.test(
                  ip.trim(),
                ) || ip.trim() === "",
            ),
        { message: "Enter valid IP addresses or CIDR ranges. Separate with new lines or commas." },
      ),
    useMasterNegativeIPs: z.boolean().optional(),
    negativeDomains: z
      .string()
      .optional()
      .refine(
        (val) =>
          !val ||
          val
            .split(/[\n,]+/)
            .every(
              (domain) =>
                /^([a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,6}$/.test(domain.trim()) ||
                domain.trim() === "",
            ),
        { message: "Enter valid domain names. Separate with new lines or commas." },
      ),
    useMasterNegativeDomains: z.boolean().optional(),
    retentionWindow: positiveNumberOptional,
    maxDeclineCount: positiveNumberOptional,
    assignedMerchants: z.array(z.string()).optional(),
    cardConfig_retentionDuration: positiveNumberOptional,
    cardConfig_maxDebitAmount: positiveNumberOptional,
    cardConfig_maxCreditAmount: positiveNumberOptional,
    cardConfig_minTransactionAmount: positiveNumberOptional,
    cardConfig_maxTransactionCount: positiveNumberOptional,
    ipConfig_retentionDuration: positiveNumberOptional,
    ipConfig_maxTransactionCount: positiveNumberOptional,
    terminalConfig_maxFloorLimitAmount: positiveNumberOptional,
    terminalConfig_retentionDuration: positiveNumberOptional,
    terminalConfig_maxFloorLimitTransactionCount: positiveNumberOptional,
    terminalConfig_maxProcessingAmount: positiveNumberOptional,
    terminalConfig_maxCreditProcessingAmount: positiveNumberOptional,
    terminalConfig_enableAutoInactivate: z.boolean().optional(),
  })
  .refine(
    (data) => (data.retentionWindow && data.maxDeclineCount) || (!data.retentionWindow && !data.maxDeclineCount),
    {
      message:
        "Both Retention Window and Max Decline Count must be provided if one is set for Declined Card Threshold.",
      path: ["retentionWindow"],
    },
  )

type RiskProfileFormValues = z.infer<typeof riskProfileSchema>

interface CreateRiskProfileFormProps {
  countries: Country[]
  merchants: Merchant[]
}

export default function CreateRiskProfileForm({ countries, merchants }: CreateRiskProfileFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [currentUploadField, setCurrentUploadField] = useState<
    "negativeBINs" | "negativeIPs" | "negativeCountries" | null
  >(null)

  const form = useForm<RiskProfileFormValues>({
    resolver: zodResolver(riskProfileSchema),
    defaultValues: {
      profileName: "",
      description: "",
      negativeCountries: [],
      useMasterNegativeCountries: false,
      negativeBINs: "",
      useMasterNegativeBINs: false,
      negativeIPs: "",
      useMasterNegativeIPs: false,
      negativeDomains: "",
      useMasterNegativeDomains: false,
      assignedMerchants: [],
      terminalConfig_enableAutoInactivate: false,
    },
  })

  const countryOptions: MultiSelectOption[] = countries.map((c) => ({ value: c.code, label: c.name }))
  const merchantOptions: MultiSelectOption[] = merchants.map((m) => ({ value: m.id, label: m.name }))

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file || !currentUploadField) return

    const reader = new FileReader()
    reader.onload = (e) => {
      const content = e.target?.result as string
      if (!content) {
        toast({ title: "Error reading file", description: "File content is empty.", variant: "destructive" })
        return
      }
      const items = content
        .split(/[\n,]+/)
        .map((item) => item.trim())
        .filter(Boolean)
      if (items.length === 0) {
        toast({
          title: "No items found",
          description: "The uploaded file contains no valid items.",
        })
        return
      }

      if (currentUploadField === "negativeCountries") {
        const currentSelectedCountries = form.getValues("negativeCountries") || []
        const validCountryCodes = countryOptions.map((opt) => opt.value)
        const newCountries = items.filter((code) => validCountryCodes.includes(code.toUpperCase()))
        const uniqueNewCountries = newCountries.filter((code) => !currentSelectedCountries.includes(code.toUpperCase()))
        if (uniqueNewCountries.length > 0) {
          form.setValue(
            "negativeCountries",
            [...currentSelectedCountries, ...uniqueNewCountries.map((c) => c.toUpperCase())],
            { shouldValidate: true },
          )
          toast({ title: "Countries Uploaded", description: `${uniqueNewCountries.length} new valid countries added.` })
        } else {
          toast({
            title: "No New Countries",
            description: "No new valid countries found or all were already selected.",
          })
        }
      } else {
        const existingValue = form.getValues(currentUploadField) || ""
        const newValuesString = items.join("\n")
        const combinedValue = existingValue ? `${existingValue}\n${newValuesString}` : newValuesString
        form.setValue(currentUploadField, combinedValue, { shouldValidate: true })
        toast({ title: `${currentUploadField} Uploaded`, description: `${items.length} items added.` })
      }
      if (fileInputRef.current) fileInputRef.current.value = ""
      setCurrentUploadField(null)
    }
    reader.readAsText(file)
  }

  const triggerFileUpload = (fieldName: "negativeBINs" | "negativeIPs" | "negativeCountries") => {
    setCurrentUploadField(fieldName)
    fileInputRef.current?.click()
  }

  async function onSubmit(data: RiskProfileFormValues) {
    const getProcessedList = (
      useMaster: boolean | undefined,
      masterList: string[],
      manualInput: string | string[] | undefined,
    ): string[] => {
      const manualList = Array.isArray(manualInput)
        ? manualInput
        : typeof manualInput === "string"
          ? manualInput
              .split(/[\n,]+/)
              .map((s) => s.trim())
              .filter(Boolean)
          : []

      if (useMaster) {
        return Array.from(new Set([...masterList, ...manualList]))
      }
      return manualList
    }

    const parametersToSubmit = {
      negativeCountries: getProcessedList(
        data.useMasterNegativeCountries,
        masterNegativeCountriesList,
        data.negativeCountries,
      ),
      negativeBINs: getProcessedList(data.useMasterNegativeBINs, masterNegativeBINsList, data.negativeBINs),
      negativeIPs: getProcessedList(data.useMasterNegativeIPs, masterNegativeIPsList, data.negativeIPs),
      negativeDomains: getProcessedList(data.useMasterNegativeDomains, masterNegativeDomainsList, data.negativeDomains),
      declinedCardThreshold:
        data.retentionWindow && data.maxDeclineCount
          ? { retentionWindow: Number(data.retentionWindow), maxDeclineCount: Number(data.maxDeclineCount) }
          : undefined,
    }

    const finalData = {
      profileName: data.profileName,
      description: data.description,
      parameters: parametersToSubmit,
      assignedMerchants: data.assignedMerchants,
    }

    console.log("Form submitted:", finalData)
    toast({
      title: "Profile Submitted",
      description: `Risk profile "${data.profileName}" has been submitted for approval.`,
    })
    router.push("/admin/risk-profiles")
  }

  const renderNumericField = (
    name: keyof RiskProfileFormValues,
    label: string,
    placeholder?: string,
    description?: string,
  ) => (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <Input
              type="number"
              placeholder={placeholder}
              {...field}
              onChange={(e) => field.onChange(e.target.value === "" ? "" : Number(e.target.value))}
            />
          </FormControl>
          {description && <FormDescription>{description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  )

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileUpload}
          accept=".txt,.csv"
          style={{ display: "none" }}
        />
        <Card>
          <CardHeader>
            <CardTitle>Profile Details</CardTitle>
            <CardDescription>Basic information for the risk profile.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <FormField
              control={form.control}
              name="profileName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Profile Name <span className="text-primary">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., High Risk Countries" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Optional: Describe the purpose of this profile..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <Tabs defaultValue="general" className="w-full">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 mb-4">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="card">Card Config</TabsTrigger>
            <TabsTrigger value="ip">IP Config</TabsTrigger>
            <TabsTrigger value="terminal">Terminal Config</TabsTrigger>
          </TabsList>

          <TabsContent value="general">
            <Card>
              <CardHeader>
                <CardTitle>General Parameters</CardTitle>
                <CardDescription>Define common risk rules for this profile.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <FormField
                  control={form.control}
                  name="useMasterNegativeCountries"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center space-x-3 space-y-0 mb-2">
                      <FormControl>
                        <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                      <FormLabel className="font-normal">Include System Master List for Negative Countries</FormLabel>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="negativeCountries"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex justify-between items-center mb-1">
                        <FormLabel>Custom Negative Countries</FormLabel>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => triggerFileUpload("negativeCountries")}
                        >
                          <UploadCloud className="mr-2 h-4 w-4" /> Bulk Upload
                        </Button>
                      </div>
                      <MultiSelect
                        options={countryOptions}
                        selected={field.value || []}
                        onChange={field.onChange}
                        placeholder="Select custom countries..."
                        className="w-full"
                      />
                      <FormDescription>
                        Manually add countries. If master list is selected, these will be added to it.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Separator />

                <FormField
                  control={form.control}
                  name="useMasterNegativeBINs"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center space-x-3 space-y-0 mb-2">
                      <FormControl>
                        <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                      <FormLabel className="font-normal">Include System Master List for Negative BINs</FormLabel>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="negativeBINs"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex justify-between items-center mb-1">
                        <FormLabel>Custom Negative BINs</FormLabel>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => triggerFileUpload("negativeBINs")}
                        >
                          <UploadCloud className="mr-2 h-4 w-4" /> Bulk Upload
                        </Button>
                      </div>
                      <FormControl>
                        <Textarea
                          placeholder="Enter custom 6-digit BINs, one per line or comma-separated."
                          {...field}
                          rows={4}
                        />
                      </FormControl>
                      <FormDescription>
                        Manually add BINs. If master list is selected, these will be added to it.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Separator />

                <FormField
                  control={form.control}
                  name="useMasterNegativeIPs"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center space-x-3 space-y-0 mb-2">
                      <FormControl>
                        <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                      <FormLabel className="font-normal">Include System Master List for Negative IPs</FormLabel>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="negativeIPs"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex justify-between items-center mb-1">
                        <FormLabel>Custom Negative IPs</FormLabel>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => triggerFileUpload("negativeIPs")}
                        >
                          <UploadCloud className="mr-2 h-4 w-4" /> Bulk Upload
                        </Button>
                      </div>
                      <FormControl>
                        <Textarea
                          placeholder="Enter custom IP addresses or CIDR ranges, one per line or comma-separated."
                          {...field}
                          rows={4}
                        />
                      </FormControl>
                      <FormDescription>
                        Manually add IPs. If master list is selected, these will be added to it.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Separator />

                <FormField
                  control={form.control}
                  name="useMasterNegativeDomains"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center space-x-3 space-y-0 mb-2">
                      <FormControl>
                        <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                      <FormLabel className="font-normal">Include System Master List for Negative Domains</FormLabel>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="negativeDomains"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Custom Negative Domains</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Enter custom domain names, one per line or comma-separated (e.g., example.com)."
                          {...field}
                          rows={4}
                        />
                      </FormControl>
                      <FormDescription>
                        Manually add domains. If master list is selected, these will be added to it.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Separator />

                <div>
                  <h4 className="text-sm font-medium mb-1">Declined Card Threshold</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 border rounded-md">
                    {renderNumericField(
                      "retentionWindow" as keyof RiskProfileFormValues,
                      "Retention Window (minutes)",
                      "e.g., 60",
                    )}
                    {renderNumericField(
                      "maxDeclineCount" as keyof RiskProfileFormValues,
                      "Maximum Decline Count",
                      "e.g., 3",
                    )}
                  </div>
                  {form.formState.errors.retentionWindow && form.formState.errors.retentionWindow.type === "root" && (
                    <p className="text-sm font-medium text-destructive mt-2">
                      {form.formState.errors.retentionWindow.message}
                    </p>
                  )}
                  <p className="text-sm text-muted-foreground mt-1">
                    Flag cards declined multiple times within a window.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="card">
            <Card>
              <CardHeader>
                <CardTitle>Card Specific Configuration</CardTitle>
                <CardDescription>Parameters related to individual card usage.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {renderNumericField(
                  "cardConfig_retentionDuration" as keyof RiskProfileFormValues,
                  "Retention Duration (seconds)",
                  "e.g., 86400",
                  "Time to retain transaction/session data before purging.",
                )}
                {renderNumericField(
                  "cardConfig_maxDebitAmount" as keyof RiskProfileFormValues,
                  "Maximum Debit Amount (Per Card)",
                  "e.g., 1000",
                )}
                {renderNumericField(
                  "cardConfig_maxCreditAmount" as keyof RiskProfileFormValues,
                  "Maximum Credit Amount (Per Card)",
                  "e.g., 5000",
                )}
                {renderNumericField(
                  "cardConfig_minTransactionAmount" as keyof RiskProfileFormValues,
                  "Minimum Transaction Amount (Per Card)",
                  "e.g., 5",
                )}
                {renderNumericField(
                  "cardConfig_maxTransactionCount" as keyof RiskProfileFormValues,
                  "Maximum Transaction Count (Per Card)",
                  "e.g., 10",
                  "Max transactions per day or session.",
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="ip">
            <Card>
              <CardHeader>
                <CardTitle>IP Specific Configuration</CardTitle>
                <CardDescription>Parameters related to transaction origin IP addresses.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {renderNumericField(
                  "ipConfig_retentionDuration" as keyof RiskProfileFormValues,
                  "Retention Duration (seconds)",
                  "e.g., 3600",
                  "How long transaction data is retained per IP.",
                )}
                {renderNumericField(
                  "ipConfig_maxTransactionCount" as keyof RiskProfileFormValues,
                  "Maximum Transaction Count (Per IP)",
                  "e.g., 20",
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="terminal">
            <Card>
              <CardHeader>
                <CardTitle>Terminal Specific Configuration</CardTitle>
                <CardDescription>Parameters related to specific payment terminals.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {renderNumericField(
                  "terminalConfig_maxFloorLimitAmount" as keyof RiskProfileFormValues,
                  "Maximum Floor Limit Amount (Per Transaction)",
                  "e.g., 500",
                )}
                {renderNumericField(
                  "terminalConfig_retentionDuration" as keyof RiskProfileFormValues,
                  "Retention Duration (seconds)",
                  "e.g., 7200",
                  "Time terminal retains transaction/session data.",
                )}
                {renderNumericField(
                  "terminalConfig_maxFloorLimitTransactionCount" as keyof RiskProfileFormValues,
                  "Maximum Floor Limit Transaction Count",
                  "e.g., 5",
                )}
                {renderNumericField(
                  "terminalConfig_maxProcessingAmount" as keyof RiskProfileFormValues,
                  "Maximum Processing Amount",
                  "e.g., 10000",
                  "Total value terminal can process.",
                )}
                {renderNumericField(
                  "terminalConfig_maxCreditProcessingAmount" as keyof RiskProfileFormValues,
                  "Maximum Credit Processing Amount",
                  "e.g., 5000",
                )}
                <FormField
                  control={form.control}
                  name="terminalConfig_enableAutoInactivate"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                      <FormControl>
                        <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Enable Auto-Inactivate Terminal</FormLabel>
                        <FormDescription>
                          Automatically deactivate the terminal upon threshold breach or inactivity.
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <Card>
          <CardHeader>
            <CardTitle>Assign to Merchants</CardTitle>
            <CardDescription>Optionally assign this profile to one or more merchants upon creation.</CardDescription>
          </CardHeader>
          <CardContent>
            <FormField
              control={form.control}
              name="assignedMerchants"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Merchants</FormLabel>
                  <MultiSelect
                    options={merchantOptions}
                    selected={field.value || []}
                    onChange={field.onChange}
                    placeholder="Select merchants..."
                    className="w-full"
                  />
                  <FormDescription>This profile will apply to selected merchants once active.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <div className="flex justify-end space-x-3">
          <Button type="button" variant="outline" onClick={() => router.push("/admin/risk-profiles")}>
            Cancel
          </Button>
          <Button
            type="submit"
            className="bg-primary hover:bg-primary/90 text-primary-foreground"
            disabled={form.formState.isSubmitting}
          >
            {form.formState.isSubmitting ? "Submitting..." : "Save & Submit for Approval"}
          </Button>
        </div>
      </form>
    </Form>
  )
}