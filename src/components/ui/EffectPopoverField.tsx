"use client"

import { Popover, PopoverContent, PopoverTitle, PopoverTrigger } from "@ui-sdk/react/popover"
import type { EffectLayer } from "../../types/design"
import { ColorField } from "./ColorField"
import { FieldLabel } from "./InspectorSection"
import { NumberField } from "./NumberField"
import { SelectField } from "./SelectField"

const EFFECT_TYPES: { value: EffectLayer["type"]; label: string }[] = [
  { value: "drop-shadow", label: "Drop shadow" },
  { value: "inner-shadow", label: "Inner shadow" },
  { value: "layer-blur", label: "Layer blur" },
  { value: "background-blur", label: "Background blur" },
]

export interface EffectPopoverFieldProps {
  index: number
  effect: EffectLayer
  onChange: (patch: Partial<EffectLayer>) => void
  onCommit?: () => void
}

export function EffectPopoverField({
  index,
  effect,
  onChange,
  onCommit,
}: EffectPopoverFieldProps) {
  const currentLabel =
    EFFECT_TYPES.find((t) => t.value === effect.type)?.label ?? "Drop shadow"

  return (
    <Popover>
      <PopoverTrigger
        aria-label={`Edit effect ${index + 1}`}
        className="flex !h-[24px] min-w-0 flex-1 items-center justify-start gap-1.5 rounded-[5px] border border-transparent bg-[var(--color-bg-secondary)] px-1.5 text-left text-[11px] font-normal text-[var(--color-text)] transition-colors hover:border-[var(--color-border-strong)]"
      >
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          width="24"
          height="24"
          fill="none"
          className="h-5 w-5 shrink-0 text-[var(--color-icon-secondary)]"
        >
          <rect x="5.5" y="5.5" width="9" height="9" rx="2" stroke="currentColor" strokeWidth="1.2" />
          <path d="M17.5 9.5V15.5A2 2 0 0 1 15.5 17.5H9.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
        </svg>
        <span className="min-w-0 flex-1 truncate">{currentLabel}</span>
      </PopoverTrigger>

      <PopoverContent side="left" align="start" sideOffset={12} className="w-[244px] p-3">
        <PopoverTitle className="mb-2 text-[11px] font-semibold text-[var(--color-text)]">
          {currentLabel}
        </PopoverTitle>
        <div className="flex flex-col gap-2">
          <div>
            <FieldLabel>Type</FieldLabel>
            <SelectField
              label={`Effect ${index + 1} type`}
              value={effect.type}
              options={EFFECT_TYPES}
              showIndicator={false}
              onValueChange={(val) => {
                onChange({ type: val as EffectLayer["type"] })
                onCommit?.()
              }}
            />
          </div>

          {effect.type === "drop-shadow" || effect.type === "inner-shadow" ? (
            <>
              <div className="grid grid-cols-2 gap-2">
                <NumberField
                  label={`Effect ${index + 1} X`}
                  prefix="X"
                  value={effect.x}
                  onChange={(x) => onChange({ x })}
                  onCommit={onCommit}
                />
                <NumberField
                  label={`Effect ${index + 1} Y`}
                  prefix="Y"
                  value={effect.y}
                  onChange={(y) => onChange({ y })}
                  onCommit={onCommit}
                />
                <NumberField
                  label={`Effect ${index + 1} blur`}
                  prefix="B"
                  value={effect.blur}
                  min={0}
                  onChange={(blur) => onChange({ blur: Math.max(0, blur) })}
                  onCommit={onCommit}
                />
                <NumberField
                  label={`Effect ${index + 1} spread`}
                  prefix="S"
                  value={effect.spread}
                  onChange={(spread) => onChange({ spread })}
                  onCommit={onCommit}
                />
              </div>
              <div>
                <FieldLabel>Color</FieldLabel>
                <ColorField
                  label={`Effect ${index + 1} color`}
                  value={effect.color.startsWith("#") ? effect.color : "#000000"}
                  onValueChange={(color) => onChange({ color })}
                  onValueCommit={onCommit}
                />
              </div>
            </>
          ) : (
            <NumberField
              label={`Effect ${index + 1} blur radius`}
              prefix="Blur"
              value={effect.blur}
              min={0}
              max={120}
              onChange={(blur) => onChange({ blur: Math.max(0, blur) })}
              onCommit={onCommit}
            />
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}
