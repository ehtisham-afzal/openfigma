import type {
  DesignNode,
  EffectLayer,
  FillLayer,
  StrokeLayer,
  VariableCollection,
} from "../types/design"

export function resolveColorVariable(
  color: string,
  variableId: string | null | undefined,
  variables?: VariableCollection
): string {
  if (!variableId || !variables) return color
  const variable = variables.variables.find((v) => v.id === variableId)
  if (!variable || variable.type !== "color") return color
  const modeVal = variable.values[variables.activeModeId]
  return typeof modeVal === "string" ? modeVal : color
}

export function hexToRgba(hex: string, alpha: number): string {
  if (alpha >= 0.999) return hex
  const clean = hex.trim()
  if (!clean.startsWith("#")) return clean
  const raw = clean.slice(1)
  if (raw.length === 3) {
    const r = parseInt(raw[0] + raw[0], 16)
    const g = parseInt(raw[1] + raw[1], 16)
    const b = parseInt(raw[2] + raw[2], 16)
    return `rgba(${r}, ${g}, ${b}, ${alpha.toFixed(2)})`
  }
  if (raw.length === 6 || raw.length === 8) {
    const r = parseInt(raw.slice(0, 2), 16)
    const g = parseInt(raw.slice(2, 4), 16)
    const b = parseInt(raw.slice(4, 6), 16)
    const baseAlpha = raw.length === 8 ? parseInt(raw.slice(6, 8), 16) / 255 : 1
    return `rgba(${r}, ${g}, ${b}, ${(baseAlpha * alpha).toFixed(2)})`
  }
  return clean
}

export function fillLayerToCss(fill: FillLayer, variables?: VariableCollection): string {
  if (fill.type === "linear") {
    const angle = fill.gradientAngle ?? 135
    const stops =
      fill.gradientStops && fill.gradientStops.length >= 2
        ? fill.gradientStops
        : [
            { offset: 0, color: fill.color },
            { offset: 1, color: "#7c3aed" },
          ]
    const stopStr = stops
      .map((s) => `${hexToRgba(s.color, fill.opacity)} ${Math.round(s.offset * 100)}%`)
      .join(", ")
    return `linear-gradient(${angle}deg, ${stopStr})`
  }
  if (fill.type === "radial") {
    const stops =
      fill.gradientStops && fill.gradientStops.length >= 2
        ? fill.gradientStops
        : [
            { offset: 0, color: fill.color },
            { offset: 1, color: "#111318" },
          ]
    const stopStr = stops
      .map((s) => `${hexToRgba(s.color, fill.opacity)} ${Math.round(s.offset * 100)}%`)
      .join(", ")
    return `radial-gradient(circle, ${stopStr})`
  }
  if (fill.type === "image" && fill.imageUrl) {
    return `url("${fill.imageUrl}") center / ${fill.imageScaleMode ?? "cover"} no-repeat`
  }
  const resolved = resolveColorVariable(fill.color, fill.variableId, variables)
  return hexToRgba(resolved, fill.opacity)
}

export function nodeBackgroundCss(node: DesignNode, variables?: VariableCollection): string {
  const visible = node.fills.filter((f) => f.visible)
  if (visible.length === 0) return "transparent"
  // Stack topmost fill first in CSS multiple backgrounds.
  const layers = [...visible].reverse().map((fill) => {
    if (fill.type === "solid") {
      const c = fillLayerToCss(fill, variables)
      return `linear-gradient(${c}, ${c})`
    }
    return fillLayerToCss(fill, variables)
  })
  return layers.join(", ")
}

export function primaryFillColor(node: DesignNode, variables?: VariableCollection): string {
  const visible = node.fills.find((f) => f.visible)
  if (!visible) return "transparent"
  if (visible.type === "solid") {
    const resolved = resolveColorVariable(visible.color, visible.variableId, variables)
    return hexToRgba(resolved, visible.opacity)
  }
  return visible.gradientStops?.[0]?.color ?? visible.color
}

export function primaryStroke(
  node: DesignNode,
  variables?: VariableCollection
): { color: string; width: number; style: "solid" | "dashed"; align: StrokeLayer["align"] } | null {
  const visible = node.strokes.find((s) => s.visible && s.width > 0)
  if (!visible) return null
  const resolved = resolveColorVariable(visible.color, visible.variableId, variables)
  return {
    color: hexToRgba(resolved, visible.opacity),
    width: visible.width,
    style: visible.style,
    align: visible.align,
  }
}

export function effectsToCss(effects: EffectLayer[]): {
  boxShadow?: string
  filter?: string
  backdropFilter?: string
} {
  const shadows: string[] = []
  let layerBlur = 0
  let bgBlur = 0

  for (const fx of effects) {
    if (!fx.visible) continue
    if (fx.type === "drop-shadow") {
      shadows.push(`${fx.x}px ${fx.y}px ${fx.blur}px ${fx.spread}px ${fx.color}`)
    } else if (fx.type === "inner-shadow") {
      shadows.push(`inset ${fx.x}px ${fx.y}px ${fx.blur}px ${fx.spread}px ${fx.color}`)
    } else if (fx.type === "layer-blur") {
      layerBlur = Math.max(layerBlur, fx.blur)
    } else if (fx.type === "background-blur") {
      bgBlur = Math.max(bgBlur, fx.blur)
    }
  }

  return {
    boxShadow: shadows.length > 0 ? shadows.join(", ") : undefined,
    filter: layerBlur > 0 ? `blur(${layerBlur}px)` : undefined,
    backdropFilter: bgBlur > 0 ? `blur(${bgBlur}px)` : undefined,
  }
}

export function cornerRadiusCss(node: DesignNode): string | number {
  if (node.type === "ellipse") return "9999px"
  if (node.independentCorners && node.cornerRadii) {
    return `${node.cornerRadii[0]}px ${node.cornerRadii[1]}px ${node.cornerRadii[2]}px ${node.cornerRadii[3]}px`
  }
  return node.cornerRadius
}
