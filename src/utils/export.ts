import type { DesignNode, DesignPage, VariableCollection } from "../types/design"
import { buildVectorPathD, getAbsoluteBounds, getPolygonPoints, getStarPoints } from "./geometry"
import {
  cornerRadiusCss,
  effectsToCss,
  nodeBackgroundCss,
  primaryFillColor,
  primaryStroke,
  resolveColorVariable,
} from "./paint"

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
}

function renderNodeSvg(
  node: DesignNode,
  page: DesignPage,
  originX: number,
  originY: number,
  variables: VariableCollection,
  defs: string[]
): string {
  if (!node.visible) return ""
  const bounds = getAbsoluteBounds(node, page.nodes)
  const x = bounds.x - originX
  const y = bounds.y - originY
  const w = Math.max(1, node.width)
  const h = Math.max(1, node.height)

  const firstVisibleFill = node.fills.find((f) => f.visible)
  let fillAttr = "none"
  if (firstVisibleFill) {
    if (firstVisibleFill.type === "linear") {
      const gradId = `grad-${node.id}`
      const angle = ((firstVisibleFill.gradientAngle ?? 135) - 90) * (Math.PI / 180)
      const x1 = 50 - Math.cos(angle) * 50
      const y1 = 50 - Math.sin(angle) * 50
      const x2 = 50 + Math.cos(angle) * 50
      const y2 = 50 + Math.sin(angle) * 50
      const stops = (
        firstVisibleFill.gradientStops ?? [
          { offset: 0, color: firstVisibleFill.color },
          { offset: 1, color: "#7c3aed" },
        ]
      )
        .map(
          (s) =>
            `<stop offset="${Math.round(s.offset * 100)}%" stop-color="${escapeXml(s.color)}" stop-opacity="${firstVisibleFill.opacity}" />`
        )
        .join("")
      defs.push(
        `<linearGradient id="${gradId}" x1="${x1.toFixed(1)}%" y1="${y1.toFixed(1)}%" x2="${x2.toFixed(1)}%" y2="${y2.toFixed(1)}%">${stops}</linearGradient>`
      )
      fillAttr = `url(#${gradId})`
    } else if (firstVisibleFill.type === "radial") {
      const gradId = `grad-${node.id}`
      const stops = (
        firstVisibleFill.gradientStops ?? [
          { offset: 0, color: firstVisibleFill.color },
          { offset: 1, color: "#111318" },
        ]
      )
        .map(
          (s) =>
            `<stop offset="${Math.round(s.offset * 100)}%" stop-color="${escapeXml(s.color)}" stop-opacity="${firstVisibleFill.opacity}" />`
        )
        .join("")
      defs.push(`<radialGradient id="${gradId}">${stops}</radialGradient>`)
      fillAttr = `url(#${gradId})`
    } else if (firstVisibleFill.type === "solid") {
      fillAttr = resolveColorVariable(firstVisibleFill.color, firstVisibleFill.variableId, variables)
    }
  }

  const stroke = primaryStroke(node, variables)
  const strokeAttr = stroke ? stroke.color : "none"
  const strokeWidth = stroke ? stroke.width : 0
  const dashAttr = stroke?.style === "dashed" ? ` stroke-dasharray="6 4"` : ""
  const transform =
    node.rotation !== 0
      ? ` transform="rotate(${node.rotation} ${(x + w / 2).toFixed(1)} ${(y + h / 2).toFixed(1)})"`
      : ""
  const opacity = node.opacity < 1 ? ` opacity="${node.opacity.toFixed(2)}"` : ""

  if (
    node.type === "frame" ||
    node.type === "section" ||
    node.type === "component" ||
    node.type === "instance" ||
    node.type === "rectangle"
  ) {
    return `<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${w.toFixed(1)}" height="${h.toFixed(1)}" rx="${node.cornerRadius}" fill="${escapeXml(fillAttr)}" stroke="${escapeXml(strokeAttr)}" stroke-width="${strokeWidth}"${dashAttr}${opacity}${transform} />`
  }

  if (node.type === "image") {
    const imgFill = node.fills.find((f) => f.visible && f.type === "image" && f.imageUrl)
    if (imgFill?.imageUrl) {
      return `<image x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${w.toFixed(1)}" height="${h.toFixed(1)}" href="${escapeXml(imgFill.imageUrl)}" preserveAspectRatio="xMidYMid slice"${opacity}${transform} />`
    }
    return `<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${w.toFixed(1)}" height="${h.toFixed(1)}" rx="${node.cornerRadius}" fill="#2a2d36"${opacity}${transform} />`
  }

  if (node.type === "ellipse") {
    return `<ellipse cx="${(x + w / 2).toFixed(1)}" cy="${(y + h / 2).toFixed(1)}" rx="${(w / 2).toFixed(1)}" ry="${(h / 2).toFixed(1)}" fill="${escapeXml(fillAttr)}" stroke="${escapeXml(strokeAttr)}" stroke-width="${strokeWidth}"${dashAttr}${opacity}${transform} />`
  }

  if (node.type === "line") {
    return `<line x1="${x.toFixed(1)}" y1="${y.toFixed(1)}" x2="${(x + w).toFixed(1)}" y2="${(y + h).toFixed(1)}" stroke="${escapeXml(stroke ? stroke.color : fillAttr)}" stroke-width="${Math.max(1, strokeWidth || 2)}" stroke-linecap="round"${dashAttr}${opacity}${transform} />`
  }

  if (node.type === "polygon") {
    const pts = getPolygonPoints(w, h, node.polygonSides ?? 3)
    return `<g transform="translate(${x.toFixed(1)} ${y.toFixed(1)})${node.rotation ? ` rotate(${node.rotation} ${(w / 2).toFixed(1)} ${(h / 2).toFixed(1)})` : ""}"${opacity}><polygon points="${pts}" fill="${escapeXml(fillAttr)}" stroke="${escapeXml(strokeAttr)}" stroke-width="${strokeWidth}"${dashAttr} /></g>`
  }

  if (node.type === "star") {
    const pts = getStarPoints(w, h, node.starPoints ?? 5)
    return `<g transform="translate(${x.toFixed(1)} ${y.toFixed(1)})${node.rotation ? ` rotate(${node.rotation} ${(w / 2).toFixed(1)} ${(h / 2).toFixed(1)})` : ""}"${opacity}><polygon points="${pts}" fill="${escapeXml(fillAttr)}" stroke="${escapeXml(strokeAttr)}" stroke-width="${strokeWidth}"${dashAttr} /></g>`
  }

  if (node.type === "path") {
    const d = buildVectorPathD(node, x, y)
    if (!d) return ""
    const pathFill = node.closed && firstVisibleFill ? fillAttr : "none"
    return `<path d="${d}" fill="${escapeXml(pathFill)}" stroke="${escapeXml(stroke ? stroke.color : fillAttr)}" stroke-width="${Math.max(2, strokeWidth)}" stroke-linecap="round" stroke-linejoin="round"${dashAttr}${opacity}${transform} />`
  }

  if (node.type === "text") {
    const fontSize = node.fontSize ?? 16
    const lineHeight = node.lineHeight ?? 1.4
    const anchor =
      node.textAlign === "center" ? "middle" : node.textAlign === "right" ? "end" : "start"
    const tx =
      node.textAlign === "center" ? x + w / 2 : node.textAlign === "right" ? x + w : x
    const lines = (node.text ?? "").split("\n")
    const tspans = lines
      .map(
        (line, i) =>
          `<tspan x="${tx.toFixed(1)}" dy="${i === 0 ? fontSize : fontSize * lineHeight}">${escapeXml(line || " ")}</tspan>`
      )
      .join("")
    return `<text x="${tx.toFixed(1)}" y="${y.toFixed(1)}" fill="${escapeXml(fillAttr)}" font-family="${escapeXml(node.fontFamily ?? "Inter")}, sans-serif" font-size="${fontSize}" font-weight="${node.fontWeight ?? 400}" text-anchor="${anchor}"${opacity}${transform}>${tspans}</text>`
  }

  return ""
}

export function buildSvgMarkup(
  page: DesignPage,
  variables: VariableCollection,
  targetIds?: string[]
): string {
  const ids = targetIds && targetIds.length > 0 ? targetIds : page.order
  const included = new Set<string>(ids)
  let grew = true
  while (grew) {
    grew = false
    for (const id of page.order) {
      const node = page.nodes[id]
      if (node?.parentId && included.has(node.parentId) && !included.has(id)) {
        included.add(id)
        grew = true
      }
    }
  }

  const ordered = page.order.filter((id) => included.has(id) && page.nodes[id]?.visible)
  if (ordered.length === 0) {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300"></svg>`
  }

  let minX = Infinity
  let minY = Infinity
  let maxX = -Infinity
  let maxY = -Infinity
  for (const id of ordered) {
    const b = getAbsoluteBounds(page.nodes[id], page.nodes)
    minX = Math.min(minX, b.x)
    minY = Math.min(minY, b.y)
    maxX = Math.max(maxX, b.x + b.width)
    maxY = Math.max(maxY, b.y + b.height)
  }

  const pad = 16
  const width = Math.max(1, Math.ceil(maxX - minX + pad * 2))
  const height = Math.max(1, Math.ceil(maxY - minY + pad * 2))
  const defs: string[] = []
  const body = ordered
    .map((id) => renderNodeSvg(page.nodes[id], page, minX - pad, minY - pad, variables, defs))
    .filter(Boolean)
    .join("\n  ")

  const defsBlock = defs.length > 0 ? `\n  <defs>\n    ${defs.join("\n    ")}\n  </defs>` : ""
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">${defsBlock}\n  ${body}\n</svg>`
}

export function buildCssSnippet(node: DesignNode, variables: VariableCollection): string {
  const lines: string[] = [
    `/* ${node.name} */`,
    `width: ${Math.round(node.width)}px;`,
    `height: ${Math.round(node.height)}px;`,
  ]
  if (node.layout && node.layout.mode !== "none") {
    lines.push(`display: flex;`)
    lines.push(`flex-direction: ${node.layout.mode === "horizontal" ? "row" : "column"};`)
    if (node.layout.gap > 0) lines.push(`gap: ${node.layout.gap}px;`)
    lines.push(
      `padding: ${node.layout.paddingTop}px ${node.layout.paddingRight}px ${node.layout.paddingBottom}px ${node.layout.paddingLeft}px;`
    )
    const justifyMap = {
      start: "flex-start",
      center: "center",
      end: "flex-end",
      "space-between": "space-between",
    }
    const alignMap = {
      start: "flex-start",
      center: "center",
      end: "flex-end",
      stretch: "stretch",
    }
    lines.push(`justify-content: ${justifyMap[node.layout.primaryAlign]};`)
    lines.push(`align-items: ${alignMap[node.layout.counterAlign]};`)
  } else {
    lines.push(`position: absolute;`)
    lines.push(`left: ${Math.round(node.x)}px;`)
    lines.push(`top: ${Math.round(node.y)}px;`)
  }
  if (node.rotation !== 0) {
    lines.push(`transform: rotate(${Math.round(node.rotation)}deg);`)
  }
  if (node.opacity < 1) {
    lines.push(`opacity: ${node.opacity.toFixed(2)};`)
  }
  if (node.type === "text") {
    lines.push(`font-family: "${node.fontFamily ?? "Inter"}", sans-serif;`)
    lines.push(`font-size: ${node.fontSize ?? 16}px;`)
    lines.push(`font-weight: ${node.fontWeight ?? 400};`)
    lines.push(`line-height: ${node.lineHeight ?? 1.4};`)
    if (node.letterSpacing) lines.push(`letter-spacing: ${node.letterSpacing}px;`)
    if (node.textTransform && node.textTransform !== "none") {
      lines.push(`text-transform: ${node.textTransform};`)
    }
    if (node.textDecoration && node.textDecoration !== "none") {
      lines.push(`text-decoration: ${node.textDecoration};`)
    }
    lines.push(`color: ${primaryFillColor(node, variables)};`)
  } else {
    const bg = nodeBackgroundCss(node, variables)
    if (bg !== "transparent") lines.push(`background: ${bg};`)
    const stroke = primaryStroke(node, variables)
    if (stroke) lines.push(`border: ${stroke.width}px ${stroke.style} ${stroke.color};`)
    const radius = cornerRadiusCss(node)
    if (radius !== 0 && radius !== "0") {
      lines.push(`border-radius: ${typeof radius === "number" ? `${Math.round(radius)}px` : radius};`)
    }
  }
  const fx = effectsToCss(node.effects)
  if (fx.boxShadow) lines.push(`box-shadow: ${fx.boxShadow};`)
  if (fx.filter) lines.push(`filter: ${fx.filter};`)
  if (fx.backdropFilter) lines.push(`backdrop-filter: ${fx.backdropFilter};`)
  if (node.blendMode !== "normal") lines.push(`mix-blend-mode: ${node.blendMode};`)
  return lines.join("\n")
}

function toComponentName(name: string): string {
  const cleaned = name
    .replace(/[^a-zA-Z0-9]+/g, " ")
    .trim()
    .split(/\s+/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join("")
  return cleaned || "DesignComponent"
}

export function buildReactTailwindSnippet(
  rootNode: DesignNode,
  page: DesignPage,
  variables: VariableCollection
): string {
  const renderTree = (node: DesignNode, depth: number, inFlow: boolean): string => {
    const indent = "  ".repeat(depth)
    const classes: string[] = []
    if (!inFlow && depth > 1) classes.push("absolute")
    if (node.layout && node.layout.mode !== "none") {
      classes.push("flex", node.layout.mode === "horizontal" ? "flex-row" : "flex-col")
      if (node.layout.gap > 0) classes.push(`gap-[${node.layout.gap}px]`)
      if (node.layout.primaryAlign === "center") classes.push("justify-center")
      if (node.layout.primaryAlign === "end") classes.push("justify-end")
      if (node.layout.primaryAlign === "space-between") classes.push("justify-between")
      if (node.layout.counterAlign === "center") classes.push("items-center")
      if (node.layout.counterAlign === "end") classes.push("items-end")
      if (node.layout.counterAlign === "stretch") classes.push("items-stretch")
      if (node.layout.paddingTop || node.layout.paddingBottom || node.layout.paddingLeft || node.layout.paddingRight) {
        classes.push(
          `pt-[${node.layout.paddingTop}px]`,
          `pr-[${node.layout.paddingRight}px]`,
          `pb-[${node.layout.paddingBottom}px]`,
          `pl-[${node.layout.paddingLeft}px]`
        )
      }
    } else if (
      node.type === "frame" ||
      node.type === "component" ||
      node.type === "instance"
    ) {
      classes.push("relative")
    }

    if (node.clipContent) classes.push("overflow-hidden")
    if (!inFlow && depth > 1) {
      classes.push(`left-[${Math.round(node.x)}px]`, `top-[${Math.round(node.y)}px]`)
    }
    if (node.layout?.primarySizing !== "hug") classes.push(`w-[${Math.round(node.width)}px]`)
    if (node.layout?.counterSizing !== "hug") classes.push(`h-[${Math.round(node.height)}px]`)

    if (node.type === "ellipse") {
      classes.push("rounded-full")
    } else if (node.cornerRadius > 0) {
      classes.push(`rounded-[${Math.round(node.cornerRadius)}px]`)
    }

    const firstFill = node.fills.find((f) => f.visible)
    if (node.type === "text") {
      const color = primaryFillColor(node, variables)
      classes.push(`text-[${color}]`, `text-[${node.fontSize ?? 16}px]`)
      if ((node.fontWeight ?? 400) >= 700) classes.push("font-bold")
      else if ((node.fontWeight ?? 400) >= 600) classes.push("font-semibold")
      else if ((node.fontWeight ?? 400) >= 500) classes.push("font-medium")
      if (node.textAlign === "center") classes.push("text-center")
      if (node.textAlign === "right") classes.push("text-right")
      return `${indent}<p className="${classes.join(" ")}">${(node.text ?? "").replace(/\n/g, " ")}</p>`
    }

    if (firstFill?.type === "solid") {
      const c = resolveColorVariable(firstFill.color, firstFill.variableId, variables)
      classes.push(`bg-[${c}]`)
    }
    const stroke = primaryStroke(node, variables)
    if (stroke) {
      classes.push(`border-[${stroke.width}px]`, `border-[${stroke.color}]`)
    }
    if (node.opacity < 1) classes.push(`opacity-[${node.opacity.toFixed(2)}]`)

    const children = page.order
      .map((id) => page.nodes[id])
      .filter((n): n is DesignNode => Boolean(n && n.visible && n.parentId === node.id))

    const styleProp =
      firstFill && (firstFill.type === "linear" || firstFill.type === "radial")
        ? ` style={{ background: "${nodeBackgroundCss(node, variables)}" }}`
        : ""

    if (children.length === 0) {
      return `${indent}<div className="${classes.join(" ")}"${styleProp} />`
    }

    const childInFlow = Boolean(node.layout && node.layout.mode !== "none")
    const renderedKids = children.map((c) => renderTree(c, depth + 1, childInFlow)).join("\n")
    return `${indent}<div className="${classes.join(" ")}"${styleProp}>\n${renderedKids}\n${indent}</div>`
  }

  const componentName = toComponentName(rootNode.name)
  return `export function ${componentName}() {\n  return (\n${renderTree(rootNode, 2, false)}\n  )\n}`
}

export function buildTokensCssSnippet(variables: VariableCollection): string {
  const blocks = variables.modes.map((mode) => {
    const selector = mode.id === variables.activeModeId ? ":root" : `[data-theme="${mode.name.toLowerCase()}"]`
    const entries = variables.variables
      .map((v) => {
        const val = v.values[mode.id]
        const cssName = `--${v.name.replace(/[^a-zA-Z0-9]+/g, "-").toLowerCase()}`
        const cssVal = v.type === "number" ? `${val}px` : String(val)
        return `  ${cssName}: ${cssVal};`
      })
      .join("\n")
    return `${selector} {\n${entries}\n}`
  })
  return blocks.join("\n\n")
}

export function downloadTextFile(filename: string, content: string, mime: string) {
  const blob = new Blob([content], { type: mime })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}

export async function exportSvgAsPng(svgMarkup: string, filename: string): Promise<void> {
  const img = new Image()
  const svgBlob = new Blob([svgMarkup], { type: "image/svg+xml;charset=utf-8" })
  const url = URL.createObjectURL(svgBlob)
  try {
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve()
      img.onerror = () => reject(new Error("Could not render SVG for PNG export"))
      img.src = url
    })
    const canvas = document.createElement("canvas")
    const scale = 2
    canvas.width = Math.max(1, img.width * scale)
    canvas.height = Math.max(1, img.height * scale)
    const ctx = canvas.getContext("2d")
    if (!ctx) return
    ctx.scale(scale, scale)
    ctx.drawImage(img, 0, 0)
    const pngUrl = canvas.toDataURL("image/png")
    const link = document.createElement("a")
    link.href = pngUrl
    link.download = filename
    link.click()
  } finally {
    URL.revokeObjectURL(url)
  }
}
