"use client"

import * as React from "react"
import {
  SegmentedControl,
  SegmentedControlIndicator,
  SegmentedControlItem,
} from "@ui-sdk/react/segmented-control"

export interface SegmentedOption {
  value: string
  label: React.ReactNode
  ariaLabel?: string
}

export interface SegmentedFieldProps {
  label: string
  value: string
  options: SegmentedOption[]
  onValueChange: (value: string) => void
  className?: string
}

export function SegmentedField({
  label,
  value,
  options,
  onValueChange,
  className = "",
}: SegmentedFieldProps) {
  return (
    <SegmentedControl
      aria-label={label}
      value={value}
      onValueChange={(val) => val && onValueChange(val)}
      className={`w-full ${className}`.trim()}
    >
      <SegmentedControlIndicator />
      {options.map((opt) => (
        <SegmentedControlItem
          key={opt.value}
          value={opt.value}
          aria-label={opt.ariaLabel}
        >
          {opt.label}
        </SegmentedControlItem>
      ))}
    </SegmentedControl>
  )
}
