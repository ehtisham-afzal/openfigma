"use client"

import * as React from "react"
import { Checkbox, CheckboxIndicator } from "@ui-sdk/react/checkbox"
import { CheckIcon } from "lucide-react"

export interface CheckboxFieldProps {
  label: string
  checked: boolean
  onCheckedChange: (checked: boolean) => void
  className?: string
}

export function CheckboxField({
  label,
  checked,
  onCheckedChange,
  className = "",
}: CheckboxFieldProps) {
  return (
    <label
      className={`flex min-h-[24px] cursor-pointer items-center gap-2 text-[11px] font-normal text-[var(--color-text)] select-none ${className}`.trim()}
    >
      <Checkbox
        aria-label={label}
        checked={checked}
        onCheckedChange={(next) => onCheckedChange(Boolean(next))}
      >
        <CheckboxIndicator>
          <CheckIcon aria-hidden="true" className="h-3 w-3 stroke-[2.75]" />
        </CheckboxIndicator>
      </Checkbox>
      <span className="truncate">{label}</span>
    </label>
  )
}
