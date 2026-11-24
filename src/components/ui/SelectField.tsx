"use client"

import * as React from "react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectItemIndicator,
  SelectTrigger,
  SelectValue,
} from "@ui-sdk/react/select"
import { CheckIcon } from "lucide-react"
import { FigmaChevronDownIcon } from "./FigmaIcons"
import { CONTROL_HEIGHT, type ControlSize } from "./tokens"

export interface SelectOption {
  value: string
  label: string
}

export interface SelectFieldProps {
  label: string
  value?: string
  placeholder?: string
  options: SelectOption[]
  onValueChange: (value: string) => void
  size?: ControlSize
  variant?: "filled" | "ghost"
  align?: "start" | "center" | "end"
  autoWidth?: boolean
  showIndicator?: boolean
  className?: string
}

export function SelectField({
  label,
  value,
  placeholder,
  options,
  onValueChange,
  size = "sm",
  variant = "filled",
  align = "start",
  autoWidth = false,
  showIndicator = true,
  className = "",
}: SelectFieldProps) {
  const surfaceCls =
    variant === "ghost"
      ? "border-transparent bg-transparent text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-hover)] hover:text-[var(--color-text)]"
      : "border-transparent bg-[var(--color-bg-secondary)] text-[var(--color-text)] hover:border-[var(--color-border-strong)]"

  return (
    <Select
      value={value}
      placeholder={placeholder}
      items={options}
      onValueChange={(next) => next && onValueChange(next)}
    >
      <SelectTrigger
        aria-label={label}
        className={`${CONTROL_HEIGHT[size]} ${
          autoWidth ? "!w-auto" : "w-full"
        } !min-w-0 justify-between gap-1 rounded-[5px] px-2 text-[11px] font-normal transition-colors ${surfaceCls} ${className}`.trim()}
      >
        <SelectValue placeholder={placeholder} className="truncate" />
        <FigmaChevronDownIcon className="h-4 w-4 shrink-0 text-[var(--color-icon-secondary)]" />
      </SelectTrigger>
      <SelectContent align={align}>
        {options.map((opt) => (
          <SelectItem key={opt.value} value={opt.value}>
            {opt.label}
            {showIndicator && (
              <SelectItemIndicator>
                <CheckIcon aria-hidden="true" className="h-3 w-3" />
              </SelectItemIndicator>
            )}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
