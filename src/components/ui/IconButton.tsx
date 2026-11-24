"use client"

import * as React from "react"
import { Button } from "@ui-sdk/react/button"
import { MenuTrigger } from "@ui-sdk/react/menu"
import { Toggle, ToggleIcon } from "@ui-sdk/react/toggle"
import { ICON_BOX_SIZE, type ControlSize } from "./tokens"

export interface IconButtonProps {
  label: string
  onClick?: (e: React.MouseEvent<HTMLElement>) => void
  children: React.ReactNode
  size?: ControlSize
  variant?: "ghost" | "filled" | "subtle"
  active?: boolean
  disabled?: boolean
  title?: string
  type?: "button" | "submit" | "reset"
  className?: string
}

export function IconButton({
  label,
  onClick,
  children,
  size = "sm",
  variant = "ghost",
  active = false,
  disabled = false,
  title,
  type = "button",
  className = "",
}: IconButtonProps) {
  const variantCls = active
    ? "border-transparent bg-[var(--color-bg-selected)] text-[var(--color-icon-brand)] hover:bg-[var(--color-bg-selected-hover)]"
    : variant === "filled"
      ? "border-transparent bg-[var(--color-bg-secondary)] text-[var(--color-icon)] hover:bg-[var(--color-bg-tertiary)]"
      : variant === "subtle"
        ? "border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-icon)] hover:bg-[var(--color-bg-secondary)]"
        : "border-transparent bg-transparent text-[var(--color-icon)] hover:bg-[var(--color-bg-hover)]"

  return (
    <Button
      type={type}
      aria-label={label}
      title={title}
      disabled={disabled}
      onClick={onClick}
      className={`${ICON_BOX_SIZE[size]} inline-flex shrink-0 items-center justify-center rounded-[5px] !p-0 transition-colors disabled:opacity-35 ${variantCls} ${className}`.trim()}
    >
      {children}
    </Button>
  )
}

export interface IconToggleProps {
  label: string
  pressed: boolean
  onPressedChange: (pressed: boolean) => void
  children: React.ReactNode
  size?: ControlSize
  variant?: "filled" | "ghost"
  disabled?: boolean
  title?: string
  className?: string
}

export function IconToggle({
  label,
  pressed,
  onPressedChange,
  children,
  size = "sm",
  variant = "ghost",
  disabled = false,
  title,
  className = "",
}: IconToggleProps) {
  const base =
    variant === "filled"
      ? "border-transparent bg-[var(--color-bg-secondary)] text-[var(--color-icon)] hover:bg-[var(--color-bg-tertiary)] data-pressed:bg-[var(--color-bg-selected)] data-pressed:text-[var(--color-icon-brand)]"
      : "border-transparent bg-transparent text-[var(--color-icon)] hover:bg-[var(--color-bg-hover)] data-pressed:bg-[var(--color-bg-selected)] data-pressed:text-[var(--color-icon-brand)]"

  return (
    <Toggle
      aria-label={label}
      title={title}
      disabled={disabled}
      pressed={pressed}
      onPressedChange={onPressedChange}
      className={`${ICON_BOX_SIZE[size]} inline-flex shrink-0 items-center justify-center rounded-[5px] !p-0 transition-colors disabled:opacity-35 ${base} ${className}`.trim()}
    >
      <ToggleIcon>{children}</ToggleIcon>
    </Toggle>
  )
}

export interface IconMenuTriggerProps {
  label: string
  children: React.ReactNode
  size?: ControlSize
  active?: boolean
  className?: string
}

/** Official Figma FPL 24x24 / 32x32 icon-only MenuTrigger */
export function IconMenuTrigger({
  label,
  children,
  size = "sm",
  active = false,
  className = "",
}: IconMenuTriggerProps) {
  return (
    <MenuTrigger
      aria-label={label}
      className={`${ICON_BOX_SIZE[size]} inline-flex shrink-0 items-center justify-center rounded-[5px] border-transparent bg-transparent !p-0 transition-colors hover:bg-[var(--color-bg-hover)] ${
        active ? "text-[var(--color-icon-brand)]" : "text-[var(--color-icon)]"
      } ${className}`.trim()}
    >
      {children}
    </MenuTrigger>
  )
}

/** Official Figma FPL `segmented_button--root` (24px grouped icon pill for Alignment & Transform) */
export function SegmentedIconGroup({
  label,
  children,
  className = "",
}: {
  label: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <div
      role="group"
      aria-label={label}
      className={`flex h-[24px] items-stretch rounded-[5px] bg-[var(--color-bg-secondary)] ${className}`.trim()}
    >
      {children}
    </div>
  )
}

export function SegmentedIconButton({
  label,
  title,
  disabled = false,
  onClick,
  children,
}: {
  label: string
  title?: string
  disabled?: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <Button
      aria-label={label}
      title={title}
      disabled={disabled}
      onClick={onClick}
      className="flex !h-full flex-1 items-center justify-center rounded-none border-0 bg-transparent !p-0 text-[var(--color-icon)] transition-colors first:rounded-l-[5px] last:rounded-r-[5px] hover:bg-[var(--color-bg-hover)] disabled:opacity-40"
    >
      {children}
    </Button>
  )
}
