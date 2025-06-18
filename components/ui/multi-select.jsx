"use client"

import { useState } from "react"
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Box,
  OutlinedInput,
  Checkbox,
  ListItemText,
} from "@mui/material"

export function MultiSelect({
  options,
  selected,
  onChange,
  placeholder = "Select items...",
  className,
  maxDisplay = 3,
  disabled = false,
}) {
  const [open, setOpen] = useState(false)

  const handleChange = (event) => {
    const value = event.target.value
    onChange(typeof value === "string" ? value.split(",") : value)
  }

  const selectedLabels = selected
    .map((value) => options.find((option) => option.value === value)?.label)
    .filter(Boolean)

  return (
    <FormControl fullWidth disabled={disabled} className={className}>
      <InputLabel>{placeholder}</InputLabel>
      <Select
        multiple
        value={selected}
        onChange={handleChange}
        input={<OutlinedInput label={placeholder} />}
        open={open}
        onOpen={() => setOpen(true)}
        onClose={() => setOpen(false)}
        renderValue={(selected) => (
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
            {selectedLabels.slice(0, maxDisplay).map((label) => (
              <Chip
                key={label}
                label={label}
                size="small"
                onDelete={() => {
                  const valueToDeselect = options.find((opt) => opt.label === label)?.value
                  if (valueToDeselect) {
                    onChange(selected.filter((item) => item !== valueToDeselect))
                  }
                }}
                onMouseDown={(event) => {
                  event.stopPropagation()
                }}
              />
            ))}
            {selectedLabels.length > maxDisplay && (
              <Chip label={`+${selectedLabels.length - maxDisplay} more`} size="small" />
            )}
          </Box>
        )}
      >
        {options.map((option) => (
          <MenuItem key={option.value} value={option.value}>
            <Checkbox checked={selected.indexOf(option.value) > -1} />
            <ListItemText primary={option.label} />
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  )
}
