"use client"

import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Typography,
  Box,
} from "@mui/material"
import { MultiSelect } from "@/components/ui/multi-select"
import { useEffect, useState } from "react"
import { getCountriesAction } from "@/lib/actions"

const parameterTypes = ["negativeCountries", "negativeBINs", "negativeIPs", "negativeDomains"]

const globalParameterSchema = z.object({
  parameterType: z.enum(parameterTypes),
  values: z
    .union([z.string(), z.array(z.string())])
    .refine((val) => (Array.isArray(val) ? val.length > 0 : typeof val === "string" && val.trim().length > 0), {
      message: "Please enter at least one value.",
    }),
})

export default function GlobalParameterModal({ isOpen, onOpenChange, onSubmit }) {
  const [countries, setCountries] = useState([])

  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const countriesData = await getCountriesAction()
        setCountries(countriesData)
      } catch (error) {
        console.error("Error fetching countries:", error)
      }
    }

    if (isOpen) {
      fetchCountries()
    }
  }, [isOpen])

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    clearErrors,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(globalParameterSchema),
    defaultValues: {
      parameterType: "negativeCountries",
      values: [],
    },
  })

  const selectedParameterType = watch("parameterType")

  const handleFormSubmit = (data) => {
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

  const getPlaceholderText = (type) => {
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
    <Dialog open={isOpen} onClose={() => onOpenChange(false)} maxWidth="sm" fullWidth>
      <DialogTitle>Add to System Master List</DialogTitle>
      <DialogContent>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Add new values to a parameter for all active and inactive profiles. This action cannot be undone.
        </Typography>
        <Box component="form" sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
          <Controller
            name="parameterType"
            control={control}
            render={({ field }) => (
              <FormControl fullWidth error={!!errors.parameterType}>
                <InputLabel>Parameter Type</InputLabel>
                <Select
                  {...field}
                  label="Parameter Type"
                  onChange={(e) => {
                    field.onChange(e.target.value)
                    setValue("values", e.target.value === "negativeCountries" ? [] : "")
                    clearErrors("values")
                  }}
                >
                  <MenuItem value="negativeCountries">Negative Countries</MenuItem>
                  <MenuItem value="negativeBINs">Negative BINs</MenuItem>
                  <MenuItem value="negativeIPs">Negative IPs</MenuItem>
                  <MenuItem value="negativeDomains">Negative Domains</MenuItem>
                </Select>
              </FormControl>
            )}
          />

          <Controller
            name="values"
            control={control}
            render={({ field }) =>
              selectedParameterType === "negativeCountries" ? (
                <MultiSelect
                  options={countryOptions}
                  selected={field.value || []}
                  onChange={field.onChange}
                  placeholder="Select countries to add..."
                />
              ) : (
                <TextField
                  {...field}
                  multiline
                  rows={5}
                  placeholder={getPlaceholderText(selectedParameterType)}
                  error={!!errors.values}
                  helperText={errors.values?.message}
                  fullWidth
                />
              )
            }
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => onOpenChange(false)} color="inherit">
          Cancel
        </Button>
        <Button onClick={handleSubmit(handleFormSubmit)} variant="contained">
          Confirm & Apply
        </Button>
      </DialogActions>
    </Dialog>
  )
}
