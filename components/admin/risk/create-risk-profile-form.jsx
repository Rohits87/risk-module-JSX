"use client"

import { useState, useRef, useEffect } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm, Controller } from "react-hook-form"
import * as z from "zod"
import {
  Button,
  TextField,
  Card,
  CardContent,
  CardHeader,
  Typography,
  Tabs,
  Tab,
  Box,
  FormControlLabel,
  Checkbox,
  Divider,
  Grid,
} from "@mui/material"
import { CloudUpload } from "@mui/icons-material"
import { MultiSelect } from "@/components/ui/multi-select"
import {
  masterNegativeCountriesList,
  masterNegativeBINsList,
  masterNegativeIPsList,
  masterNegativeDomainsList,
} from "@/lib/data"
import { getCountriesAction, getMerchantsAction } from "@/lib/actions"
import { useRouter } from "next/navigation"
import toast from "react-hot-toast"

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

function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  )
}

export default function CreateRiskProfileForm() {
  const router = useRouter()
  const fileInputRef = useRef(null)
  const [currentUploadField, setCurrentUploadField] = useState(null)
  const [tabValue, setTabValue] = useState(0)
  const [countries, setCountries] = useState([])
  const [merchants, setMerchants] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  const {
    control,
    handleSubmit,
    setValue,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm({
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

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)
        const [countriesData, merchantsData] = await Promise.all([getCountriesAction(), getMerchantsAction()])
        setCountries(countriesData)
        setMerchants(merchantsData)
      } catch (error) {
        toast.error("Failed to load data")
        console.error("Error fetching data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  const countryOptions = countries.map((c) => ({ value: c.code, label: c.name }))
  const merchantOptions = merchants.map((m) => ({ value: m.id, label: m.name }))

  const handleFileUpload = (event) => {
    const file = event.target.files?.[0]
    if (!file || !currentUploadField) return

    const reader = new FileReader()
    reader.onload = (e) => {
      const content = e.target?.result
      if (!content) {
        toast.error("File content is empty.")
        return
      }
      const items = content
        .split(/[\n,]+/)
        .map((item) => item.trim())
        .filter(Boolean)
      if (items.length === 0) {
        toast.error("The uploaded file contains no valid items.")
        return
      }

      if (currentUploadField === "negativeCountries") {
        const currentSelectedCountries = getValues("negativeCountries") || []
        const validCountryCodes = countryOptions.map((opt) => opt.value)
        const newCountries = items.filter((code) => validCountryCodes.includes(code.toUpperCase()))
        const uniqueNewCountries = newCountries.filter((code) => !currentSelectedCountries.includes(code.toUpperCase()))
        if (uniqueNewCountries.length > 0) {
          setValue(
            "negativeCountries",
            [...currentSelectedCountries, ...uniqueNewCountries.map((c) => c.toUpperCase())],
            { shouldValidate: true },
          )
          toast.success(`${uniqueNewCountries.length} new valid countries added.`)
        } else {
          toast.info("No new valid countries found or all were already selected.")
        }
      } else {
        const existingValue = getValues(currentUploadField) || ""
        const newValuesString = items.join("\n")
        const combinedValue = existingValue ? `${existingValue}\n${newValuesString}` : newValuesString
        setValue(currentUploadField, combinedValue, { shouldValidate: true })
        toast.success(`${items.length} items added.`)
      }
      if (fileInputRef.current) fileInputRef.current.value = ""
      setCurrentUploadField(null)
    }
    reader.readAsText(file)
  }

  const triggerFileUpload = (fieldName) => {
    setCurrentUploadField(fieldName)
    fileInputRef.current?.click()
  }

  const onSubmit = async (data) => {
    const getProcessedList = (useMaster, masterList, manualInput) => {
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

    // Add config objects
    parametersToSubmit.cardConfig = {
      retentionDuration: data.cardConfig_retentionDuration ? Number(data.cardConfig_retentionDuration) : undefined,
      maxDebitAmount: data.cardConfig_maxDebitAmount ? Number(data.cardConfig_maxDebitAmount) : undefined,
      maxCreditAmount: data.cardConfig_maxCreditAmount ? Number(data.cardConfig_maxCreditAmount) : undefined,
      minTransactionAmount: data.cardConfig_minTransactionAmount
        ? Number(data.cardConfig_minTransactionAmount)
        : undefined,
      maxTransactionCount: data.cardConfig_maxTransactionCount
        ? Number(data.cardConfig_maxTransactionCount)
        : undefined,
    }
    parametersToSubmit.ipConfig = {
      retentionDuration: data.ipConfig_retentionDuration ? Number(data.ipConfig_retentionDuration) : undefined,
      maxTransactionCount: data.ipConfig_maxTransactionCount ? Number(data.ipConfig_maxTransactionCount) : undefined,
    }
    parametersToSubmit.terminalConfig = {
      maxFloorLimitAmount: data.terminalConfig_maxFloorLimitAmount
        ? Number(data.terminalConfig_maxFloorLimitAmount)
        : undefined,
      retentionDuration: data.terminalConfig_retentionDuration
        ? Number(data.terminalConfig_retentionDuration)
        : undefined,
      maxFloorLimitTransactionCount: data.terminalConfig_maxFloorLimitTransactionCount
        ? Number(data.terminalConfig_maxFloorLimitTransactionCount)
        : undefined,
      maxProcessingAmount: data.terminalConfig_maxProcessingAmount
        ? Number(data.terminalConfig_maxProcessingAmount)
        : undefined,
      maxCreditProcessingAmount: data.terminalConfig_maxCreditProcessingAmount
        ? Number(data.terminalConfig_maxCreditProcessingAmount)
        : undefined,
      enableAutoInactivate: data.terminalConfig_enableAutoInactivate,
    }

    // Clean up empty configs
    if (Object.values(parametersToSubmit.cardConfig).every((val) => val === undefined))
      delete parametersToSubmit.cardConfig
    if (Object.values(parametersToSubmit.ipConfig).every((val) => val === undefined)) delete parametersToSubmit.ipConfig
    if (
      Object.values(parametersToSubmit.terminalConfig).every((val) => val === undefined || val === false) &&
      parametersToSubmit.terminalConfig.enableAutoInactivate === false
    ) {
      const { enableAutoInactivate, ...restOfTerminalConfig } = parametersToSubmit.terminalConfig
      if (Object.values(restOfTerminalConfig).every((val) => val === undefined) && enableAutoInactivate === false) {
        delete parametersToSubmit.terminalConfig
      }
    }

    const finalData = {
      profileName: data.profileName,
      description: data.description,
      parameters: parametersToSubmit,
      assignedMerchants: data.assignedMerchants,
    }

    console.log("Form submitted:", finalData)
    toast.success(`Risk profile "${data.profileName}" has been submitted for approval.`)
    router.push("/admin/risk-profiles")
  }

  if (isLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "200px" }}>
        <Typography>Loading...</Typography>
      </Box>
    )
  }

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        accept=".txt,.csv"
        style={{ display: "none" }}
      />

      {/* Profile Details Card */}
      <Card>
        <CardHeader title="Profile Details" subheader="Basic information for the risk profile." />
        <CardContent sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
          <Controller
            name="profileName"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Profile Name *"
                placeholder="e.g., High Risk Countries"
                error={!!errors.profileName}
                helperText={errors.profileName?.message}
                fullWidth
              />
            )}
          />
          <Controller
            name="description"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Description"
                placeholder="Optional: Describe the purpose of this profile..."
                multiline
                rows={3}
                error={!!errors.description}
                helperText={errors.description?.message}
                fullWidth
              />
            )}
          />
        </CardContent>
      </Card>

      {/* Tabs */}
      <Card>
        <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
          <Tab label="General" />
          <Tab label="Card Config" />
          <Tab label="IP Config" />
          <Tab label="Terminal Config" />
        </Tabs>

        <TabPanel value={tabValue} index={0}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
            {/* Negative Countries */}
            <Controller
              name="useMasterNegativeCountries"
              control={control}
              render={({ field }) => (
                <FormControlLabel
                  control={<Checkbox {...field} checked={field.value} />}
                  label="Include System Master List for Negative Countries"
                />
              )}
            />
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
              <Typography variant="subtitle1">Custom Negative Countries</Typography>
              <Button
                variant="outlined"
                size="small"
                startIcon={<CloudUpload />}
                onClick={() => triggerFileUpload("negativeCountries")}
              >
                Bulk Upload
              </Button>
            </Box>
            <Controller
              name="negativeCountries"
              control={control}
              render={({ field }) => (
                <MultiSelect
                  options={countryOptions}
                  selected={field.value || []}
                  onChange={field.onChange}
                  placeholder="Select custom countries..."
                />
              )}
            />
            <Typography variant="body2" color="text.secondary">
              Manually add countries. If master list is selected, these will be added to it.
            </Typography>

            <Divider />

            {/* Negative BINs */}
            <Controller
              name="useMasterNegativeBINs"
              control={control}
              render={({ field }) => (
                <FormControlLabel
                  control={<Checkbox {...field} checked={field.value} />}
                  label="Include System Master List for Negative BINs"
                />
              )}
            />
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
              <Typography variant="subtitle1">Custom Negative BINs</Typography>
              <Button
                variant="outlined"
                size="small"
                startIcon={<CloudUpload />}
                onClick={() => triggerFileUpload("negativeBINs")}
              >
                Bulk Upload
              </Button>
            </Box>
            <Controller
              name="negativeBINs"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  multiline
                  rows={4}
                  placeholder="Enter custom 6-digit BINs, one per line or comma-separated."
                  error={!!errors.negativeBINs}
                  helperText={
                    errors.negativeBINs?.message ||
                    "Manually add BINs. If master list is selected, these will be added to it."
                  }
                  fullWidth
                />
              )}
            />

            <Divider />

            {/* Negative IPs */}
            <Controller
              name="useMasterNegativeIPs"
              control={control}
              render={({ field }) => (
                <FormControlLabel
                  control={<Checkbox {...field} checked={field.value} />}
                  label="Include System Master List for Negative IPs"
                />
              )}
            />
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
              <Typography variant="subtitle1">Custom Negative IPs</Typography>
              <Button
                variant="outlined"
                size="small"
                startIcon={<CloudUpload />}
                onClick={() => triggerFileUpload("negativeIPs")}
              >
                Bulk Upload
              </Button>
            </Box>
            <Controller
              name="negativeIPs"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  multiline
                  rows={4}
                  placeholder="Enter custom IP addresses or CIDR ranges, one per line or comma-separated."
                  error={!!errors.negativeIPs}
                  helperText={
                    errors.negativeIPs?.message ||
                    "Manually add IPs. If master list is selected, these will be added to it."
                  }
                  fullWidth
                />
              )}
            />

            <Divider />

            {/* Negative Domains */}
            <Controller
              name="useMasterNegativeDomains"
              control={control}
              render={({ field }) => (
                <FormControlLabel
                  control={<Checkbox {...field} checked={field.value} />}
                  label="Include System Master List for Negative Domains"
                />
              )}
            />
            <Typography variant="subtitle1">Custom Negative Domains</Typography>
            <Controller
              name="negativeDomains"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  multiline
                  rows={4}
                  placeholder="Enter custom domain names, one per line or comma-separated (e.g., example.com)."
                  error={!!errors.negativeDomains}
                  helperText={
                    errors.negativeDomains?.message ||
                    "Manually add domains. If master list is selected, these will be added to it."
                  }
                  fullWidth
                />
              )}
            />

            <Divider />

            {/* Declined Card Threshold */}
            <Typography variant="h6">Declined Card Threshold</Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Controller
                  name="retentionWindow"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      type="number"
                      label="Retention Window (minutes)"
                      placeholder="e.g., 60"
                      error={!!errors.retentionWindow}
                      helperText={errors.retentionWindow?.message}
                      fullWidth
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Controller
                  name="maxDeclineCount"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      type="number"
                      label="Maximum Decline Count"
                      placeholder="e.g., 3"
                      error={!!errors.maxDeclineCount}
                      helperText={errors.maxDeclineCount?.message}
                      fullWidth
                    />
                  )}
                />
              </Grid>
            </Grid>
            <Typography variant="body2" color="text.secondary">
              Flag cards declined multiple times within a window.
            </Typography>
          </Box>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Card Specific Configuration
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Parameters related to individual card usage.
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Controller
                name="cardConfig_retentionDuration"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    type="number"
                    label="Retention Duration (seconds)"
                    placeholder="e.g., 86400"
                    helperText="Time to retain transaction/session data before purging."
                    fullWidth
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller
                name="cardConfig_maxDebitAmount"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    type="number"
                    label="Maximum Debit Amount (Per Card)"
                    placeholder="e.g., 1000"
                    fullWidth
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller
                name="cardConfig_maxCreditAmount"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    type="number"
                    label="Maximum Credit Amount (Per Card)"
                    placeholder="e.g., 5000"
                    fullWidth
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller
                name="cardConfig_minTransactionAmount"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    type="number"
                    label="Minimum Transaction Amount (Per Card)"
                    placeholder="e.g., 5"
                    fullWidth
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller
                name="cardConfig_maxTransactionCount"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    type="number"
                    label="Maximum Transaction Count (Per Card)"
                    placeholder="e.g., 10"
                    helperText="Max transactions per day or session."
                    fullWidth
                  />
                )}
              />
            </Grid>
          </Grid>
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            IP Specific Configuration
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Parameters related to transaction origin IP addresses.
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Controller
                name="ipConfig_retentionDuration"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    type="number"
                    label="Retention Duration (seconds)"
                    placeholder="e.g., 3600"
                    helperText="How long transaction data is retained per IP."
                    fullWidth
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller
                name="ipConfig_maxTransactionCount"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    type="number"
                    label="Maximum Transaction Count (Per IP)"
                    placeholder="e.g., 20"
                    fullWidth
                  />
                )}
              />
            </Grid>
          </Grid>
        </TabPanel>

        <TabPanel value={tabValue} index={3}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Terminal Specific Configuration
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Parameters related to specific payment terminals.
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Controller
                name="terminalConfig_maxFloorLimitAmount"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    type="number"
                    label="Maximum Floor Limit Amount (Per Transaction)"
                    placeholder="e.g., 500"
                    fullWidth
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller
                name="terminalConfig_retentionDuration"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    type="number"
                    label="Retention Duration (seconds)"
                    placeholder="e.g., 7200"
                    helperText="Time terminal retains transaction/session data."
                    fullWidth
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller
                name="terminalConfig_maxFloorLimitTransactionCount"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    type="number"
                    label="Maximum Floor Limit Transaction Count"
                    placeholder="e.g., 5"
                    fullWidth
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller
                name="terminalConfig_maxProcessingAmount"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    type="number"
                    label="Maximum Processing Amount"
                    placeholder="e.g., 10000"
                    helperText="Total value terminal can process."
                    fullWidth
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller
                name="terminalConfig_maxCreditProcessingAmount"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    type="number"
                    label="Maximum Credit Processing Amount"
                    placeholder="e.g., 5000"
                    fullWidth
                  />
                )}
              />
            </Grid>
            <Grid item xs={12}>
              <Controller
                name="terminalConfig_enableAutoInactivate"
                control={control}
                render={({ field }) => (
                  <FormControlLabel
                    control={<Checkbox {...field} checked={field.value} />}
                    label="Enable Auto-Inactivate Terminal"
                  />
                )}
              />
              <Typography variant="body2" color="text.secondary">
                Automatically deactivate the terminal upon threshold breach or inactivity.
              </Typography>
            </Grid>
          </Grid>
        </TabPanel>
      </Card>

      {/* Assign to Merchants */}
      <Card>
        <CardHeader
          title="Assign to Merchants"
          subheader="Optionally assign this profile to one or more merchants upon creation."
        />
        <CardContent>
          <Controller
            name="assignedMerchants"
            control={control}
            render={({ field }) => (
              <MultiSelect
                options={merchantOptions}
                selected={field.value || []}
                onChange={field.onChange}
                placeholder="Select merchants..."
              />
            )}
          />
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            This profile will apply to selected merchants once active.
          </Typography>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2 }}>
        <Button variant="outlined" onClick={() => router.push("/admin/risk-profiles")}>
          Cancel
        </Button>
        <Button
          type="submit"
          variant="contained"
          disabled={isSubmitting}
          sx={{ backgroundColor: "#ef4444", "&:hover": { backgroundColor: "#dc2626" } }}
        >
          {isSubmitting ? "Submitting..." : "Save & Submit for Approval"}
        </Button>
      </Box>
    </Box>
  )
}
