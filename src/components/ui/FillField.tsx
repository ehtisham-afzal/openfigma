"use client"

import * as React from "react"
import { Button } from "@ui-sdk/react/button"
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
import { ArrowLeftRightIcon, ImageIcon, Link2Icon, PipetteIcon, UnlinkIcon } from "lucide-react"
import type { DesignVariable, FillLayer, VariableCollection } from "../../types/design"
import { fillLayerToCss, resolveColorVariable } from "../../utils/paint"
import { ActionButton } from "./ActionButton"
import { IconButton } from "./IconButton"
import { NumberField } from "./NumberField"
import { SegmentedField } from "./SegmentedField"

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

export interface FillFieldProps {
  label: string
  fill: FillLayer
  variables: VariableCollection
  onChange: (patch: Partial<FillLayer>) => void
  onCommit?: () => void
}

export function FillField({
  label,
  fill,
  variables,
  onChange,
  onCommit,
}: FillFieldProps) {
  const fileInputRef = React.useRef<HTMLInputElement>(null)
  const [activeStop, setActiveStop] = React.useState<0 | 1>(0)
  const colorVars = React.useMemo(
    () => variables.variables.filter((v): v is DesignVariable => v.type === "color"),
    [variables.variables]
  )

  const boundVar = fill.variableId
    ? colorVars.find((v) => v.id === fill.variableId)
    : undefined

  const resolvedSolid = resolveColorVariable(fill.color, fill.variableId, variables)
  const stops =
    fill.gradientStops && fill.gradientStops.length >= 2
      ? fill.gradientStops
      : [
          { offset: 0, color: fill.color || "#0d99ff" },
          { offset: 1, color: "#7c3aed" },
        ]
  const pickerColor =
    fill.type === "solid" ? resolvedSolid : stops[activeStop]?.color ?? fill.color

  const triggerPreview = fillLayerToCss(fill, variables)
  const triggerLabel =
    fill.type === "linear"
      ? `Linear ${fill.gradientAngle ?? 135}°`
      : fill.type === "radial"
        ? "Radial"
        : fill.type === "image"
          ? "Image"
          : boundVar
            ? boundVar.name
            : resolvedSolid.replace(/^#/, "").toUpperCase()

  const handleColorUpdate = (nextColor: string) => {
    if (fill.type === "solid") {
      onChange({ color: nextColor, variableId: null })
    } else if (fill.type === "linear" || fill.type === "radial") {
      const nextStops = stops.map((s, idx) =>
        idx === activeStop ? { ...s, color: nextColor } : s
      )
      onChange({ gradientStops: nextStops, color: nextStops[0].color })
    }
  }

  const handleImagePick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      onChange({ type: "image", imageUrl: String(reader.result), imageScaleMode: "cover" })
      onCommit?.()
    }
    reader.readAsDataURL(file)
  }

  return (
    <div className="flex min-w-0 flex-1 items-center">
      <Popover>
        <PopoverTrigger
          aria-label={`Edit ${label}`}
          className="flex !h-[24px] min-w-0 flex-1 items-center justify-start gap-1.5 rounded-l-[5px] rounded-r-none border border-transparent bg-[var(--color-bg-secondary)] px-1.5 text-left text-[11px] font-normal text-[var(--color-text)] transition-colors hover:border-[var(--color-border-strong)]"
        >
          <span
            aria-hidden="true"
            className="h-[14px] w-[14px] shrink-0 rounded-[3px] border border-white/15"
            style={{ background: triggerPreview }}
          />
          <span className="min-w-0 flex-1 truncate text-[11px] tabular-nums">
            {triggerLabel}
          </span>
          {boundVar && (
            <Link2Icon aria-hidden="true" className="h-3 w-3 shrink-0 text-[var(--color-icon-brand)]" />
          )}
        </PopoverTrigger>

      <PopoverContent side="left" align="start" sideOffset={12} className="w-[260px] p-3">
        <PopoverTitle className="mb-2 text-[11px] font-semibold text-[#e5e5e5]">
          {label}
        </PopoverTitle>

        <div className="flex w-full flex-col gap-2.5">
          <SegmentedField
            label={`${label} paint type`}
            value={fill.type}
            options={[
              { value: "solid", label: "Solid" },
              { value: "linear", label: "Linear" },
              { value: "radial", label: "Radial" },
              { value: "image", label: "Image" },
            ]}
            onValueChange={(val) => {
              if (val === "linear" || val === "radial") {
                onChange({
                  type: val,
                  gradientAngle: fill.gradientAngle ?? 135,
                  gradientStops: stops,
                })
              } else {
                onChange({ type: val as FillLayer["type"] })
              }
              onCommit?.()
            }}
          />

          {(fill.type === "linear" || fill.type === "radial") && (
            <div className="flex flex-col gap-2">
              <div
                aria-hidden="true"
                className="h-4 w-full rounded-[4px] border border-white/15"
                style={{
                  background: `linear-gradient(90deg, ${stops[0].color} 0%, ${stops[1].color} 100%)`,
                }}
              />
              <div className="flex items-center gap-1">
                {stops.map((stop, idx) => (
                  <Button
                    key={idx}
                    aria-label={`Gradient stop ${idx + 1}`}
                    onClick={() => setActiveStop(idx as 0 | 1)}
                    className={`!h-[24px] flex-1 justify-start gap-1.5 rounded-[5px] px-1.5 text-[11px] tabular-nums ${
                      activeStop === idx
                        ? "border-[var(--color-border-selected)] bg-[var(--color-bg-selected)] text-[var(--color-text)]"
                        : "border-transparent bg-[var(--color-bg-secondary)] text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-tertiary)]"
                    }`}
                  >
                    <span
                      aria-hidden="true"
                      className="h-[14px] w-[14px] rounded-[3px] border border-white/20"
                      style={{ background: stop.color }}
                    />
                    <span>{stop.color.replace(/^#/, "").toUpperCase()}</span>
                  </Button>
                ))}
                <IconButton
                  variant="filled"
                  label="Flip gradient stops"
                  title="Flip gradient"
                  onClick={() => {
                    const flipped = [
                      { offset: 0, color: stops[1].color },
                      { offset: 1, color: stops[0].color },
                    ]
                    onChange({ gradientStops: flipped, color: flipped[0].color })
                    onCommit?.()
                  }}
                >
                  <ArrowLeftRightIcon aria-hidden="true" className="h-3 w-3" />
                </IconButton>
              </div>
              {fill.type === "linear" && (
                <NumberField
                  label="Gradient angle"
                  prefix="∠"
                  suffix="°"
                  value={fill.gradientAngle ?? 135}
                  min={0}
                  max={360}
                  onChange={(gradientAngle) => onChange({ gradientAngle })}
                  onCommit={() => onCommit?.()}
                />
              )}
            </div>
          )}

          {fill.type === "image" ? (
            <div className="flex flex-col gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImagePick}
              />
              {fill.imageUrl && (
                <div
                  className="h-28 w-full rounded-[6px] border border-[#444444] bg-cover bg-center"
                  style={{ backgroundImage: `url("${fill.imageUrl}")` }}
                />
              )}
              <ActionButton
                size="md"
                icon={<ImageIcon aria-hidden="true" className="h-3.5 w-3.5 shrink-0" />}
                onClick={() => fileInputRef.current?.click()}
                className="w-full"
              >
                {fill.imageUrl ? "Replace Image…" : "Upload Image…"}
              </ActionButton>
              <SegmentedField
                label="Image fit mode"
                value={fill.imageScaleMode ?? "cover"}
                options={[
                  { value: "cover", label: "Cover" },
                  { value: "contain", label: "Contain" },
                  { value: "fill", label: "Stretch" },
                ]}
                onValueChange={(val) =>
                  onChange({ imageScaleMode: val as FillLayer["imageScaleMode"] })
                }
              />
            </div>
          ) : (
            <ColorPicker
              aria-label={`${label} color picker`}
              value={pickerColor}
              format="hex"
              onValueChange={handleColorUpdate}
              onValueCommit={() => onCommit?.()}
            >
              <ColorPickerArea>
                <ColorPickerAreaThumb />
              </ColorPickerArea>
              <ColorPickerSlider channel="hue">
                <ColorPickerSliderThumb />
              </ColorPickerSlider>
              <div className="flex items-center gap-1.5">
                <ColorPickerSwatch />
                <ColorPickerInput aria-label={`${label} hex`} className="min-w-0 flex-1" />
                <NumberField
                  label={`${label} opacity`}
                  prefix="%"
                  compactAddon
                  value={Math.round(fill.opacity * 100)}
                  min={0}
                  max={100}
                  onChange={(next) =>
                    onChange({ opacity: Math.max(0, Math.min(100, next)) / 100 })
                  }
                  onCommit={() => onCommit?.()}
                  className="w-[58px] shrink-0"
                />
                <ColorPickerEyeDropper
                  aria-label={`Eyedropper for ${label}`}
                  className="!h-[24px] !w-[24px] shrink-0 border-transparent bg-[var(--color-bg-secondary)] !p-0 text-[var(--color-icon)] hover:bg-[var(--color-bg-tertiary)] data-unsupported:hidden"
                >
                  <PipetteIcon aria-hidden="true" className="h-3 w-3" />
                </ColorPickerEyeDropper>
              </div>
              <ColorPickerSwatches aria-label={`${label} palette`}>
                {PRESET_COLORS.map((preset) => (
                  <ColorPickerSwatchItem key={preset} value={preset} />
                ))}
              </ColorPickerSwatches>
            </ColorPicker>
          )}

          {fill.type === "solid" && colorVars.length > 0 && (
            <div className="flex flex-col gap-1 border-t border-[#3b3b3b] pt-2">
              <div className="flex items-center justify-between text-[10.5px] font-medium text-[#b5b5b5]">
                <span>Color Variables</span>
                {boundVar && (
                  <ActionButton
                    size="xs"
                    variant="ghost"
                    ariaLabel={`Detach variable from ${label}`}
                    icon={<UnlinkIcon aria-hidden="true" className="h-3 w-3 shrink-0" />}
                    onClick={() => {
                      onChange({ variableId: null, color: resolvedSolid })
                      onCommit?.()
                    }}
                    className="text-[#f59e0b]"
                  >
                    Detach
                  </ActionButton>
                )}
              </div>
              <div className="flex max-h-24 flex-col gap-1 overflow-y-auto">
                {colorVars.map((v) => {
                  const val = String(v.values[variables.activeModeId] ?? "#ffffff")
                  const active = fill.variableId === v.id
                  return (
                    <Button
                      key={v.id}
                      onClick={() => {
                        onChange({ variableId: v.id, color: val })
                        onCommit?.()
                      }}
                      className={`!h-[24px] w-full justify-start gap-2 rounded-[5px] px-1.5 text-[11px] ${
                        active
                          ? "border-[var(--color-border-selected)] bg-[var(--color-bg-selected)] text-[var(--color-text)]"
                          : "border-transparent bg-transparent text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-secondary)]"
                      }`}
                    >
                      <span
                        aria-hidden="true"
                        className="h-3.5 w-3.5 shrink-0 rounded-full border border-white/25"
                        style={{ background: val }}
                      />
                      <span className="min-w-0 flex-1 truncate text-left">{v.name}</span>
                      <span className="font-mono text-[11px] text-[#9e9e9e]">{val}</span>
                    </Button>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
    <div className="figma-num-field figma-num-field-split w-[48px] shrink-0">
      <NumberInput
        value={Math.round(fill.opacity * 100)}
        min={0}
        max={100}
        wheel
        onValueChange={(next) =>
          next !== null &&
          onChange({ opacity: Math.max(0, Math.min(100, next)) / 100 })
        }
        onValueCommit={() => onCommit?.()}
      >
        <NumberInputGroup>
          <NumberInputControl aria-label={`${label} inline opacity`} />
          <NumberInputScrubArea pixelsPerStep={2}>
            <span aria-hidden="true">%</span>
          </NumberInputScrubArea>
        </NumberInputGroup>
      </NumberInput>
    </div>
  </div>
  )
}
