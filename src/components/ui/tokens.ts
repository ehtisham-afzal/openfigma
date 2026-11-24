export type ControlSize = "xs" | "sm" | "md" | "lg"

/**
 * Official Figma UI3 (FPL) control heights:
 * - xs: 20px (inline layer tree actions)
 * - sm: 24px (standard Figma FPL inputs, selects, icon buttons, segmented controls)
 * - md: 32px (header Share/Present buttons, toolbar buttons, page/layer rows)
 * - lg: 32px (dialog primary actions)
 */
export const CONTROL_HEIGHT: Record<ControlSize, string> = {
  xs: "!h-[20px]",
  sm: "!h-[24px]",
  md: "!h-[32px]",
  lg: "!h-[32px]",
}

export const ICON_BOX_SIZE: Record<ControlSize, string> = {
  xs: "!h-[20px] !w-[20px]",
  sm: "!h-[24px] !w-[24px]",
  md: "!h-[32px] !w-[32px]",
  lg: "!h-[32px] !w-[32px]",
}

export const FIELD_SURFACE =
  "rounded-[5px] border border-transparent bg-[var(--color-bg-secondary)] text-[var(--color-text)] transition-colors hover:border-[var(--color-border-strong)] focus-within:border-[var(--color-border-selected)] focus-within:bg-[var(--color-bg)]"

export const GHOST_SURFACE =
  "rounded-[5px] border border-transparent bg-transparent text-[var(--color-icon-secondary)] transition-colors hover:bg-[var(--color-bg-hover)] hover:text-[var(--color-icon)]"
