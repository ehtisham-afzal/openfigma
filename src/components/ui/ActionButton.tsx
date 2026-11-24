"use client"

import * as React from "react"
import { Button } from "@ui-sdk/react/button"
import { CONTROL_HEIGHT, type ControlSize } from "./tokens"

export interface ActionButtonProps {
  children: React.ReactNode
  ariaLabel?: string
  icon?: React.ReactNode
  onClick?: (e: React.MouseEvent<HTMLElement>) => void
  onDoubleClick?: (e: React.MouseEvent<HTMLElement>) => void
  size?: ControlSize
  variant?: "default" | "primary" | "subtle" | "ghost" | "purple"
  active?: boolean
  disabled?: boolean
  title?: string
  className?: string
}

export function ActionButton({
  children,
  ariaLabel,
  icon,
  onClick,
  onDoubleClick,
  size = "sm",
  variant = "default",
  active = false,
  disabled = false,
  title,
  className = "",
}: ActionButtonProps) {
  const variantCls = active
    ? "border-transparent bg-[var(--color-bg-selected)] text-[var(--color-text-brand)] hover:bg-[var(--color-bg-selected-hover)]"
    : variant === "primary"
      ? "border-[var(--color-bg-brand)] bg-[var(--color-bg-brand)] font-semibold text-white hover:bg-[var(--color-bg-brand-hover)]"
      : variant === "subtle"
        ? "border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text)] hover:bg-[var(--color-bg-secondary)]"
        : variant === "purple"
          ? "border-[#55387c] bg-[var(--color-bg-component-secondary)] text-[var(--color-text-component)] hover:bg-[var(--color-bg-component-selected)]"
          : variant === "ghost"
            ? "border-transparent bg-transparent text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-hover)] hover:text-[var(--color-text)]"
            : "border-transparent bg-[var(--color-bg-secondary)] text-[var(--color-text)] hover:bg-[var(--color-bg-tertiary)]"

  const padCls =
    size === "xs"
      ? "px-2 text-[11px]"
      : size === "sm"
        ? "px-2 text-[11px]"
        : "px-3 text-[11px]"

  return (
    <Button
      aria-label={ariaLabel}
      title={title}
      disabled={disabled}
      onClick={onClick}
      onDoubleClick={onDoubleClick}
      className={`${CONTROL_HEIGHT[size]} inline-flex items-center justify-center gap-1.5 rounded-[5px] font-medium whitespace-nowrap transition-colors disabled:opacity-35 ${padCls} ${variantCls} ${className}`.trim()}
    >
      {icon}
      <span>{children}</span>
    </Button>
  )
}
