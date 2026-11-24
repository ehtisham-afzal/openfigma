import * as React from "react"

/** Official Figma UI3 properties section container (16px horizontal padding, crisp vertical rhythm) */
export function InspectorSection({
  children,
  className = "",
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <section className={`flex flex-col gap-2 px-3.5 py-2.5 ${className}`.trim()}>
      {children}
    </section>
  )
}

/** Official Figma UI3 32px section header row (`11px` strong title + right 24x24 icon actions) */
export function InspectorSectionHeader({
  title,
  action,
  className = "",
}: {
  title: React.ReactNode
  action?: React.ReactNode
  className?: string
}) {
  return (
    <div className={`flex h-[24px] items-center justify-between gap-2 ${className}`.trim()}>
      <h2 className="min-w-0 truncate text-[11px] font-semibold leading-4 text-[var(--color-text)]">
        {title}
      </h2>
      {action && <div className="flex shrink-0 items-center gap-1">{action}</div>}
    </div>
  )
}

/** Official Figma UI3 11px secondary property sub-label (`Alignment`, `Position`, `Flow`, `Resizing`) */
export function FieldLabel({
  children,
  className = "",
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={`mb-1 text-[11px] font-normal leading-4 text-[var(--color-text-secondary)] ${className}`.trim()}>
      {children}
    </div>
  )
}

/**
 * Official Figma UI3 3-track property row (`ui3TwoInputOneIconRow`):
 * `[1fr input | 1fr input | 24px action icon]` with `8px` (`gap-2`) gutter.
 */
export function InspectorRow({
  children,
  align = "center",
  className = "",
}: {
  children: React.ReactNode
  align?: "center" | "start"
  className?: string
}) {
  return (
    <div
      className={`grid grid-cols-[1fr_1fr_24px] gap-2 ${
        align === "start" ? "items-start" : "items-center"
      } ${className}`.trim()}
    >
      {children}
    </div>
  )
}
