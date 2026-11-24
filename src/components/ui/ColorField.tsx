"use client"

import {
  ColorPicker,
  ColorPickerArea,
  ColorPickerAreaThumb,
  ColorPickerEyeDropper,
  ColorPickerInput,
  ColorPickerSlider,
  ColorPickerSliderThumb,
  ColorPickerSwatch,
  ColorPickerSwatches,
  ColorPickerSwatchItem,
} from "@ui-sdk/react/color-picker"
import {
  NumberInput,
  NumberInputControl,
  NumberInputGroup,
  NumberInputScrubArea,
} from "@ui-sdk/react/number-input"
import { Popover, PopoverContent, PopoverTitle, PopoverTrigger } from "@ui-sdk/react/popover"
import { PipetteIcon } from "lucide-react"

const PRESET_COLORS = [
  "#ffffff",
  "#e2e8f0",
  "#94a3b8",
  "#334155",
  "#111318",
  "#0d99ff",
  "#6366f1",
  "#7c3aed",
  "#ec4899",
  "#f43f5e",
  "#f97316",
  "#facc15",
  "#10b981",
  "#14b8a6",
  "#06b6d4",
  "#a855f7",
]

export interface ColorFieldProps {
  label: string
  value: string
  onValueChange: (color: string) => void
  onValueCommit?: (color: string) => void
  opacity?: number
  onOpacityChange?: (opacity: number) => void
  compact?: boolean
  side?: "left" | "right" | "top" | "bottom"
}

export function ColorField({
  label,
  value,
  onValueChange,
  onValueCommit,
  opacity,
  onOpacityChange,
  compact = false,
  side = "left",
}: ColorFieldProps) {
  const hasSplitOpacity = !compact && opacity !== undefined && onOpacityChange !== undefined

  const triggerNode = (
    <ColorPicker
      aria-label={label}
      value={value}
      format="hex"
      onValueChange={(next) => onValueChange(next)}
      onValueCommit={(next) => onValueCommit?.(next)}
      className={compact ? "w-auto shrink-0 gap-0" : "min-w-0 flex-1 gap-0"}
    >
      <Popover>
        <PopoverTrigger
          aria-label={`Choose ${label}`}
          className={
            compact
              ? "flex !h-[20px] !w-[20px] shrink-0 items-center justify-center rounded-[4px] border border-white/20 !p-0 hover:border-white/50"
              : `flex !h-[24px] w-full min-w-0 items-center justify-start gap-1.5 border border-transparent bg-[var(--color-bg-secondary)] px-1.5 text-left text-[11px] font-normal text-[var(--color-text)] transition-colors hover:border-[var(--color-border-strong)] ${
                  hasSplitOpacity ? "rounded-l-[5px] rounded-r-none" : "rounded-[5px]"
                }`
          }
          style={compact ? { background: value } : undefined}
        >
          {!compact && (
            <>
              <span
                aria-hidden="true"
                className="h-[14px] w-[14px] shrink-0 rounded-[3px] border border-white/15"
                style={{ background: value }}
              />
              <span className="min-w-0 flex-1 truncate uppercase tabular-nums">
                {value.replace(/^#/, "")}
              </span>
            </>
          )}
        </PopoverTrigger>
        <PopoverContent side={side} align="start" sideOffset={12} className="w-[244px] p-3">
          <PopoverTitle className="mb-2 text-[11px] font-semibold text-[var(--color-text)]">
            {label}
          </PopoverTitle>
          <div className="flex w-full flex-col gap-2.5">
            <ColorPickerArea>
              <ColorPickerAreaThumb />
            </ColorPickerArea>
            <ColorPickerSlider channel="hue">
              <ColorPickerSliderThumb />
            </ColorPickerSlider>
            <ColorPickerSlider channel="alpha">
              <ColorPickerSliderThumb />
            </ColorPickerSlider>
            <div className="flex items-center gap-1.5">
              <ColorPickerSwatch />
              <ColorPickerInput aria-label={`${label} hex value`} className="min-w-0 flex-1" />
              <ColorPickerEyeDropper
                aria-label={`Pick ${label} from screen`}
                className="!h-[24px] !w-[24px] shrink-0 border-transparent bg-[var(--color-bg-secondary)] !p-0 text-[var(--color-icon)] hover:bg-[var(--color-bg-tertiary)] data-unsupported:hidden"
              >
                <PipetteIcon aria-hidden="true" className="h-3.5 w-3.5" />
              </ColorPickerEyeDropper>
            </div>
            <ColorPickerSwatches aria-label={`${label} presets`}>
              {PRESET_COLORS.map((preset) => (
                <ColorPickerSwatchItem key={preset} value={preset} />
              ))}
            </ColorPickerSwatches>
          </div>
        </PopoverContent>
      </Popover>
    </ColorPicker>
  )

  if (!hasSplitOpacity) return triggerNode

  return (
    <div className="flex min-w-0 flex-1 items-center">
      {triggerNode}
      <div className="figma-num-field figma-num-field-split w-[48px] shrink-0">
        <NumberInput
          value={Math.round(opacity * 100)}
          min={0}
          max={100}
          wheel
          onValueChange={(next) =>
            next !== null && onOpacityChange(Math.max(0, Math.min(100, next)) / 100)
          }
          onValueCommit={() => onValueCommit?.(value)}
        >
          <NumberInputGroup>
            <NumberInputControl aria-label={`${label} opacity`} />
            <NumberInputScrubArea pixelsPerStep={2}>
              <span aria-hidden="true">%</span>
            </NumberInputScrubArea>
          </NumberInputGroup>
        </NumberInput>
      </div>
    </div>
  )
}
