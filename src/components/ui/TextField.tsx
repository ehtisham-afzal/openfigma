"use client"

import * as React from "react"
import { Input } from "@ui-sdk/react/input"
import { XIcon } from "lucide-react"
import { IconButton } from "./IconButton"
import { CONTROL_HEIGHT, type ControlSize } from "./tokens"

export interface TextFieldProps {
  label: string
  value: string
  onValueChange: (value: string) => void
  placeholder?: string
  size?: ControlSize
  variant?: "filled" | "ghost" | "inline"
  leading?: React.ReactNode
  clearable?: boolean
  clearLabel?: string
  autoFocus?: boolean
  onClick?: (e: React.MouseEvent<HTMLInputElement>) => void
  onPointerDown?: (e: React.PointerEvent<HTMLInputElement>) => void
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void
  onBlur?: () => void
  className?: string
  inputClassName?: string
}

export function TextField({
  label,
  value,
  onValueChange,
  placeholder,
  size = "sm",
  variant = "filled",
  leading,
  clearable = false,
  clearLabel = "Clear",
  autoFocus = false,
  onClick,
  onPointerDown,
  onKeyDown,
  onBlur,
  className = "",
  inputClassName = "",
}: TextFieldProps) {
  if (!leading && !clearable) {
    const surfaceCls =
      variant === "ghost"
        ? "border-transparent bg-transparent hover:bg-[var(--color-bg-hover)] focus-visible:border-[var(--color-border-selected)] focus-visible:bg-[var(--color-bg)]"
        : variant === "inline"
          ? "border-[var(--color-border-selected)] bg-[var(--color-bg-elevated)]"
          : "border-transparent bg-[var(--color-bg-secondary)] hover:border-[var(--color-border-strong)] focus-visible:border-[var(--color-border-selected)] focus-visible:bg-[var(--color-bg)]"

    return (
      <Input
        aria-label={label}
        value={value}
        onValueChange={onValueChange}
        placeholder={placeholder}
        autoFocus={autoFocus}
        onClick={onClick}
        onPointerDown={onPointerDown}
        onKeyDown={onKeyDown}
        onBlur={onBlur}
        className={`${CONTROL_HEIGHT[size]} min-w-0 rounded-[5px] px-2 text-[11px] text-[var(--color-text)] outline-none ${surfaceCls} ${inputClassName} ${className}`.trim()}
      />
    )
  }

  return (
    <div
      className={`${CONTROL_HEIGHT[size]} flex w-full min-w-0 items-center gap-1.5 rounded-[5px] border border-transparent bg-[var(--color-bg-secondary)] px-1.5 transition-colors hover:border-[var(--color-border-strong)] focus-within:border-[var(--color-border-selected)] focus-within:bg-[var(--color-bg)] ${className}`.trim()}
    >
      {leading && (
        <span aria-hidden="true" className="inline-flex shrink-0 items-center text-[var(--color-icon-secondary)]">
          {leading}
        </span>
      )}
      <Input
        aria-label={label}
        value={value}
        onValueChange={onValueChange}
        placeholder={placeholder}
        autoFocus={autoFocus}
        onClick={onClick}
        onPointerDown={onPointerDown}
        onKeyDown={onKeyDown}
        onBlur={onBlur}
        className={`!h-full min-w-0 flex-1 !border-0 !bg-transparent !px-0 text-[11px] text-[var(--color-text)] !shadow-none outline-none ${inputClassName}`.trim()}
      />
      {clearable && value && (
        <IconButton
          size="xs"
          label={clearLabel}
          onClick={() => onValueChange("")}
        >
          <XIcon aria-hidden="true" className="h-3 w-3" />
        </IconButton>
      )}
    </div>
  )
}
