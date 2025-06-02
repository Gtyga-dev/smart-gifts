"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface MwkCurrencyInputProps {
  value: number
  onChange: (value: number) => void
  label?: string
  placeholder?: string
  className?: string
  min?: number
  max?: number
}

export function MwkCurrencyInput({
  value,
  onChange,
  label,
  placeholder = "0.00",
  className = "",
  min,
  max,
}: MwkCurrencyInputProps) {
  const [displayValue, setDisplayValue] = useState("")

  // Format the initial value
  useEffect(() => {
    if (value) {
      setDisplayValue(formatAsMwk(value))
    }
  }, [value])

  // Format as MWK currency
  const formatAsMwk = (val: number): string => {
    return new Intl.NumberFormat("en-MW", {
      style: "currency",
      currency: "MWK",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
      .format(val)
      .replace("MWK", "MK") // Replace MWK with MK prefix
  }

  // Parse the input value
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Remove all non-numeric characters
    const rawValue = e.target.value.replace(/[^0-9.]/g, "")

    // Parse as number
    const numericValue = Number.parseFloat(rawValue)

    // Check if it's a valid number
    if (!isNaN(numericValue)) {
      // Apply min/max constraints
      let constrainedValue = numericValue
      if (min !== undefined && numericValue < min) {
        constrainedValue = min
      }
      if (max !== undefined && numericValue > max) {
        constrainedValue = max
      }

      // Update the parent component
      onChange(constrainedValue)

      // Format for display
      setDisplayValue(formatAsMwk(constrainedValue))
    } else {
      // If not a valid number, clear the input
      setDisplayValue("")
      onChange(0)
    }
  }

  // Handle focus to show raw number
  const handleFocus = () => {
    setDisplayValue(value.toString())
  }

  // Handle blur to format as currency
  const handleBlur = () => {
    if (value) {
      setDisplayValue(formatAsMwk(value))
    } else {
      setDisplayValue("")
    }
  }

  return (
    <div className="space-y-2">
      {label && <Label>{label}</Label>}
      <Input
        type="text"
        value={displayValue}
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        placeholder={placeholder}
        className={className}
      />
    </div>
  )
}
