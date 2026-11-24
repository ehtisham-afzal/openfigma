"use client"

import * as React from "react"
import {
  NumberInput,
  NumberInputControl,
  NumberInputGroup,
  NumberInputScrubArea,
  NumberInputScrubAreaCursor,
} from "@ui-sdk/react/number-input"
import { MoveHorizontalIcon } from "lucide-react"

/**
 * Safe recursive-descent arithmetic evaluator for Figma-style math inputs
 * (e.g., `560/2`, `100+24`, `(368-32)/2`, `12*4`). Never uses `eval`.
 */
export function evaluateMathExpression(raw: string): number | null {
  const cleaned = raw.replace(/,/g, "").replace(/\s+/g, "").replace(/[°%px]+$/i, "")
  if (!cleaned || !/^[0-9+\-*/().]+$/.test(cleaned)) return null
  if (!/[+\-*/]/.test(cleaned.slice(1))) return null

  let pos = 0

  const parseExpr = (): number => {
    let left = parseTerm()
    while (pos < cleaned.length && (cleaned[pos] === "+" || cleaned[pos] === "-")) {
      const op = cleaned[pos++]
      const right = parseTerm()
      left = op === "+" ? left + right : left - right
    }
    return left
  }

  const parseTerm = (): number => {
    let left = parseFactor()
    while (pos < cleaned.length && (cleaned[pos] === "*" || cleaned[pos] === "/")) {
      const op = cleaned[pos++]
      const right = parseFactor()
      left = op === "*" ? left * right : right === 0 ? NaN : left / right
    }
    return left
  }

  const parseFactor = (): number => {
    if (cleaned[pos] === "+") {
      pos++
      return parseFactor()
    }
    if (cleaned[pos] === "-") {
      pos++
      return -parseFactor()
    }
    if (cleaned[pos] === "(") {
      pos++
      const val = parseExpr()
      if (cleaned[pos] !== ")") return NaN
      pos++
      return val
    }
    const start = pos
    while (pos < cleaned.length && /[0-9.]/.test(cleaned[pos])) pos++
    if (pos === start) return NaN
    return Number(cleaned.slice(start, pos))
  }

  const result = parseExpr()
  if (pos !== cleaned.length || !Number.isFinite(result)) return null
  return Math.round(result * 100) / 100
}

export interface NumberFieldProps {
  label: string
  prefix?: React.ReactNode
  suffix?: React.ReactNode
  trailing?: React.ReactNode
  value: number
  mixed?: boolean
  disabled?: boolean
  displayText?: string
  min?: number
  max?: number
  step?: number
  compactAddon?: boolean
  onChange: (value: number) => void
  onCommit?: (value: number) => void
  className?: string
}

export function NumberField({
  label,
  prefix,
  suffix,
  trailing,
  value,
  mixed = false,
  disabled = false,
  displayText,
  min,
  max,
  step = 1,
  compactAddon = false,
  onChange,
  onCommit,
  className = "",
}: NumberFieldProps) {
  const [focused, setFocused] = React.useState(false)
  const [mathExpr, setMathExpr] = React.useState<string | null>(null)
  const mathInputRef = React.useRef<HTMLInputElement>(null)

  React.useEffect(() => {
    if (mathExpr !== null) {
      const el = mathInputRef.current
      if (el) {
        el.focus()
        el.setSelectionRange(el.value.length, el.value.length)
      }
    }
  }, [mathExpr !== null])

  const clamp = (n: number) => {
    let out = n
    if (min !== undefined) out = Math.max(min, out)
    if (max !== undefined) out = Math.min(max, out)
    return Math.round(out * 100) / 100
  }

  const commitMathExpr = (raw: string) => {
    const evaluated = evaluateMathExpression(raw)
    if (evaluated !== null) {
      const clamped = clamp(evaluated)
      onChange(clamped)
      onCommit?.(clamped)
    } else {
      const parsed = Number(raw.replace(/,/g, "").trim())
      if (Number.isFinite(parsed) && raw.trim() !== "") {
        const clamped = clamp(parsed)
        onChange(clamped)
        onCommit?.(clamped)
      }
    }
    setMathExpr(null)
    setFocused(false)
  }

  const showOverlayText = !focused && mathExpr === null && (mixed || Boolean(displayText))
  const overlayLabel = mixed ? "Mixed" : displayText

  return (
    <div
      className={`figma-num-field min-w-0 ${compactAddon ? "figma-num-field-compact" : ""} ${
        disabled ? "opacity-50" : ""
      } ${className}`.trim()}
    >
      <NumberInput
        value={mixed ? null : Math.round(value * 100) / 100}
        min={min}
        max={max}
        step={step}
        largeStep={step * 10}
        disabled={disabled}
        wheel={!disabled}
        onValueChange={(next) => {
          if (next !== null) onChange(next)
        }}
        onValueCommit={(next) => {
          if (next !== null) onCommit?.(next)
        }}
      >
        <NumberInputGroup className="relative">
          {prefix !== undefined && (
            <NumberInputScrubArea pixelsPerStep={2}>
              <span aria-hidden="true" className="inline-flex items-center justify-center leading-none">
                {prefix}
              </span>
              <NumberInputScrubAreaCursor>
                <MoveHorizontalIcon aria-hidden="true" className="h-4 w-4 text-white" />
              </NumberInputScrubAreaCursor>
            </NumberInputScrubArea>
          )}

          <div className="relative flex h-full min-w-0 flex-1 items-center">
            <NumberInputControl
              aria-label={label}
              placeholder={mixed ? "Mixed" : undefined}
              onFocus={(e) => {
                setFocused(true)
                e.currentTarget.select()
              }}
              onKeyDown={(e) => {
                const isOperator =
                  e.key === "/" ||
                  e.key === "*" ||
                  e.key === "+" ||
                  e.key === "(" ||
                  (e.key === "-" &&
                    e.currentTarget.selectionStart !== null &&
                    e.currentTarget.selectionStart > 0)
                if (isOperator) {
                  e.preventDefault()
                  const current = e.currentTarget.value
                  const start = e.currentTarget.selectionStart ?? current.length
                  const end = e.currentTarget.selectionEnd ?? current.length
                  setMathExpr(current.slice(0, start) + e.key + current.slice(end))
                } else if (e.key === "Escape") {
                  e.currentTarget.blur()
                }
              }}
              onBlur={(e) => {
                if (mathExpr === null) {
                  setFocused(false)
                  e.currentTarget.scrollLeft = 0
                }
              }}
              className={showOverlayText || mathExpr !== null ? "!text-transparent" : undefined}
            />

            {mathExpr !== null && (
              <input
                ref={mathInputRef}
                type="text"
                aria-label={`${label} expression`}
                value={mathExpr}
                onChange={(e) => setMathExpr(e.target.value)}
                onKeyDown={(e) => {
                  e.stopPropagation()
                  if (e.key === "Enter") {
                    e.preventDefault()
                    commitMathExpr(mathExpr)
                  } else if (e.key === "Escape") {
                    e.preventDefault()
                    setMathExpr(null)
                    setFocused(false)
                  }
                }}
                onBlur={() => commitMathExpr(mathExpr)}
                className="absolute inset-0 h-full w-full border-0 bg-transparent pr-1.5 text-[11px] tabular-nums text-[var(--color-text)] outline-none"
              />
            )}

            {showOverlayText && (
              <span
                aria-hidden="true"
                className="pointer-events-none absolute inset-y-0 left-0 flex items-center text-[11px] text-[var(--color-text-secondary)]"
              >
                {overlayLabel}
              </span>
            )}
          </div>

          {suffix !== undefined && !showOverlayText && mathExpr === null && (
            <span
              aria-hidden="true"
              className="shrink-0 select-none pr-1.5 text-[11px] text-[var(--color-text-secondary)]"
            >
              {suffix}
            </span>
          )}

          {trailing}
        </NumberInputGroup>
      </NumberInput>
    </div>
  )
}
