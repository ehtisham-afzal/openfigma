import type { DesignNode, DesignPage, MeasureLine, Point, SnapGuide } from "../types/design"

export interface Bounds {
  x: number
  y: number
  width: number
  height: number
}

export function getAbsolutePosition(node: DesignNode, nodes: Record<string, DesignNode>): Point {
  let x = node.x
  let y = node.y
  let parentId = node.parentId
  const seen = new Set<string>([node.id])
  while (parentId && nodes[parentId] && !seen.has(parentId)) {
    seen.add(parentId)
    const parent = nodes[parentId]
    x += parent.x
    y += parent.y
    parentId = parent.parentId
  }
  return { x, y }
}

export function getAbsoluteBounds(node: DesignNode, nodes: Record<string, DesignNode>): Bounds {
  const pos = getAbsolutePosition(node, nodes)
  return {
    x: pos.x,
    y: pos.y,
    width: Math.max(1, node.width),
    height: Math.max(1, node.height),
  }
}

export function getSelectionBounds(ids: string[], nodes: Record<string, DesignNode>): Bounds | null {
  let minX = Infinity
  let minY = Infinity
  let maxX = -Infinity
  let maxY = -Infinity

  for (const id of ids) {
    const node = nodes[id]
    if (!node || !node.visible) continue
    const b = getAbsoluteBounds(node, nodes)
    minX = Math.min(minX, b.x)
    minY = Math.min(minY, b.y)
    maxX = Math.max(maxX, b.x + b.width)
    maxY = Math.max(maxY, b.y + b.height)
  }

  if (!Number.isFinite(minX)) return null
  return {
    x: minX,
    y: minY,
    width: Math.max(1, maxX - minX),
    height: Math.max(1, maxY - minY),
  }
}

export function isDescendant(
  candidateId: string,
  ancestorId: string,
  nodes: Record<string, DesignNode>
): boolean {
  let current = nodes[candidateId]?.parentId ?? null
  const seen = new Set<string>()
  while (current && !seen.has(current)) {
    if (current === ancestorId) return true
    seen.add(current)
    current = nodes[current]?.parentId ?? null
  }
  return false
}

export function getTopLevelSelection(ids: string[], nodes: Record<string, DesignNode>): string[] {
  const set = new Set(ids)
  return ids.filter((id) => {
    let parentId = nodes[id]?.parentId ?? null
    while (parentId) {
      if (set.has(parentId)) return false
      parentId = nodes[parentId]?.parentId ?? null
    }
    return Boolean(nodes[id])
  })
}

export function collectWithDescendants(ids: string[], page: DesignPage): string[] {
  const result = new Set<string>(ids)
  let changed = true
  while (changed) {
    changed = false
    for (const id of page.order) {
      const node = page.nodes[id]
      if (node?.parentId && result.has(node.parentId) && !result.has(id)) {
        result.add(id)
        changed = true
      }
    }
  }
  return page.order.filter((id) => result.has(id))
}

export function getAncestors(nodeId: string, nodes: Record<string, DesignNode>): DesignNode[] {
  const chain: DesignNode[] = []
  let current: DesignNode | undefined = nodes[nodeId]
  const seen = new Set<string>()
  while (current && !seen.has(current.id)) {
    seen.add(current.id)
    chain.unshift(current)
    current = current.parentId ? nodes[current.parentId] : undefined
  }
  return chain
}

export function getPolygonPoints(width: number, height: number, sides = 3): string {
  const cx = width / 2
  const cy = height / 2
  const rx = width / 2
  const ry = height / 2
  const pts: string[] = []
  const count = Math.max(3, Math.round(sides))
  for (let i = 0; i < count; i++) {
    const angle = (Math.PI * 2 * i) / count - Math.PI / 2
    pts.push(`${(cx + rx * Math.cos(angle)).toFixed(2)},${(cy + ry * Math.sin(angle)).toFixed(2)}`)
  }
  return pts.join(" ")
}

export function getStarPoints(width: number, height: number, spikes = 5): string {
  const cx = width / 2
  const cy = height / 2
  const outerRx = width / 2
  const outerRy = height / 2
  const innerRx = outerRx * 0.42
  const innerRy = outerRy * 0.42
  const pts: string[] = []
  const count = Math.max(3, Math.round(spikes))
  for (let i = 0; i < count * 2; i++) {
    const angle = (Math.PI * i) / count - Math.PI / 2
    const rx = i % 2 === 0 ? outerRx : innerRx
    const ry = i % 2 === 0 ? outerRy : innerRy
    pts.push(`${(cx + rx * Math.cos(angle)).toFixed(2)},${(cy + ry * Math.sin(angle)).toFixed(2)}`)
  }
  return pts.join(" ")
}

export function buildVectorPathD(node: DesignNode, offsetX = 0, offsetY = 0): string {
  const fmt = (n: number) => (Math.round(n * 10) / 10).toString()

  if (node.bezierPoints && node.bezierPoints.length > 0) {
    const pts = node.bezierPoints
    if (pts.length === 1) {
      return `M${fmt(offsetX + pts[0].x)} ${fmt(offsetY + pts[0].y)}`
    }
    const parts: string[] = [`M${fmt(offsetX + pts[0].x)} ${fmt(offsetY + pts[0].y)}`]
    const segCount = node.closed ? pts.length : pts.length - 1
    for (let i = 0; i < segCount; i++) {
      const a = pts[i]
      const b = pts[(i + 1) % pts.length]
      const hasCurve = Boolean(a.handleOut || b.handleIn)
      if (hasCurve) {
        const cp1 = a.handleOut ?? { x: a.x, y: a.y }
        const cp2 = b.handleIn ?? { x: b.x, y: b.y }
        parts.push(
          `C${fmt(offsetX + cp1.x)} ${fmt(offsetY + cp1.y)} ${fmt(offsetX + cp2.x)} ${fmt(offsetY + cp2.y)} ${fmt(offsetX + b.x)} ${fmt(offsetY + b.y)}`
        )
      } else {
        parts.push(`L${fmt(offsetX + b.x)} ${fmt(offsetY + b.y)}`)
      }
    }
    if (node.closed) parts.push("Z")
    return parts.join(" ")
  }

  const raw = node.points
  if (!raw || raw.length === 0) return ""
  if (raw.length === 1) return `M${fmt(offsetX + raw[0].x)} ${fmt(offsetY + raw[0].y)}`

  if (node.smooth && raw.length >= 3) {
    const parts: string[] = [`M${fmt(offsetX + raw[0].x)} ${fmt(offsetY + raw[0].y)}`]
    for (let i = 1; i < raw.length - 1; i++) {
      const midX = (raw[i].x + raw[i + 1].x) / 2
      const midY = (raw[i].y + raw[i + 1].y) / 2
      parts.push(
        `Q${fmt(offsetX + raw[i].x)} ${fmt(offsetY + raw[i].y)} ${fmt(offsetX + midX)} ${fmt(offsetY + midY)}`
      )
    }
    const last = raw[raw.length - 1]
    parts.push(`L${fmt(offsetX + last.x)} ${fmt(offsetY + last.y)}`)
    return parts.join(" ")
  }

  return (
    raw
      .map((p, idx) => `${idx === 0 ? "M" : "L"}${fmt(offsetX + p.x)} ${fmt(offsetY + p.y)}`)
      .join(" ") + (node.closed ? " Z" : "")
  )
}

export function computeSnap(
  movingBounds: Bounds,
  excludeIds: Set<string>,
  page: DesignPage,
  threshold: number
): { dx: number; dy: number; guides: SnapGuide[] } {
  const movingX = [
    movingBounds.x,
    movingBounds.x + movingBounds.width / 2,
    movingBounds.x + movingBounds.width,
  ]
  const movingY = [
    movingBounds.y,
    movingBounds.y + movingBounds.height / 2,
    movingBounds.y + movingBounds.height,
  ]

  let bestDx = Infinity
  let bestDy = Infinity
  const guides: SnapGuide[] = []

  for (const id of page.order) {
    if (excludeIds.has(id)) continue
    const node = page.nodes[id]
    if (!node || !node.visible) continue
    const b = getAbsoluteBounds(node, page.nodes)
    const targetX = [b.x, b.x + b.width / 2, b.x + b.width]
    const targetY = [b.y, b.y + b.height / 2, b.y + b.height]

    for (const mx of movingX) {
      for (const tx of targetX) {
        const diff = tx - mx
        if (Math.abs(diff) < threshold && Math.abs(diff) <= Math.abs(bestDx)) {
          if (Math.abs(diff) < Math.abs(bestDx)) {
            bestDx = diff
            for (let i = guides.length - 1; i >= 0; i--) {
              if (guides[i].orientation === "vertical") guides.splice(i, 1)
            }
          }
          if (Math.abs(diff) === Math.abs(bestDx)) {
            guides.push({
              orientation: "vertical",
              position: tx,
              start: Math.min(movingBounds.y, b.y) - 16,
              end: Math.max(movingBounds.y + movingBounds.height, b.y + b.height) + 16,
            })
          }
        }
      }
    }

    for (const my of movingY) {
      for (const ty of targetY) {
        const diff = ty - my
        if (Math.abs(diff) < threshold && Math.abs(diff) <= Math.abs(bestDy)) {
          if (Math.abs(diff) < Math.abs(bestDy)) {
            bestDy = diff
            for (let i = guides.length - 1; i >= 0; i--) {
              if (guides[i].orientation === "horizontal") guides.splice(i, 1)
            }
          }
          if (Math.abs(diff) === Math.abs(bestDy)) {
            guides.push({
              orientation: "horizontal",
              position: ty,
              start: Math.min(movingBounds.x, b.x) - 16,
              end: Math.max(movingBounds.x + movingBounds.width, b.x + b.width) + 16,
            })
          }
        }
      }
    }
  }

  // Also snap against user-placed ruler guides on the active page.
  for (const rg of page.guides ?? []) {
    if (rg.axis === "x") {
      for (const mx of movingX) {
        const diff = rg.position - mx
        if (Math.abs(diff) < threshold && Math.abs(diff) <= Math.abs(bestDx)) {
          if (Math.abs(diff) < Math.abs(bestDx)) {
            bestDx = diff
            for (let i = guides.length - 1; i >= 0; i--) {
              if (guides[i].orientation === "vertical") guides.splice(i, 1)
            }
          }
          if (Math.abs(diff) === Math.abs(bestDx)) {
            guides.push({
              orientation: "vertical",
              position: rg.position,
              start: movingBounds.y - 40,
              end: movingBounds.y + movingBounds.height + 40,
            })
          }
        }
      }
    } else {
      for (const my of movingY) {
        const diff = rg.position - my
        if (Math.abs(diff) < threshold && Math.abs(diff) <= Math.abs(bestDy)) {
          if (Math.abs(diff) < Math.abs(bestDy)) {
            bestDy = diff
            for (let i = guides.length - 1; i >= 0; i--) {
              if (guides[i].orientation === "horizontal") guides.splice(i, 1)
            }
          }
          if (Math.abs(diff) === Math.abs(bestDy)) {
            guides.push({
              orientation: "horizontal",
              position: rg.position,
              start: movingBounds.x - 40,
              end: movingBounds.x + movingBounds.width + 40,
            })
          }
        }
      }
    }
  }

  return {
    dx: Math.abs(bestDx) <= threshold ? bestDx : 0,
    dy: Math.abs(bestDy) <= threshold ? bestDy : 0,
    guides,
  }
}

export function computeResizeSnap(
  edgeX: number | null,
  edgeY: number | null,
  movingBounds: Bounds,
  excludeIds: Set<string>,
  page: DesignPage,
  threshold: number
): { dx: number; dy: number; guides: SnapGuide[] } {
  let bestDx = Infinity
  let bestDy = Infinity
  const guides: SnapGuide[] = []

  const checkX = (tx: number, startY: number, endY: number) => {
    if (edgeX === null) return
    const diff = tx - edgeX
    if (Math.abs(diff) < threshold && Math.abs(diff) <= Math.abs(bestDx)) {
      if (Math.abs(diff) < Math.abs(bestDx)) {
        bestDx = diff
        for (let i = guides.length - 1; i >= 0; i--) {
          if (guides[i].orientation === "vertical") guides.splice(i, 1)
        }
      }
      if (Math.abs(diff) === Math.abs(bestDx)) {
        guides.push({ orientation: "vertical", position: tx, start: startY, end: endY })
      }
    }
  }

  const checkY = (ty: number, startX: number, endX: number) => {
    if (edgeY === null) return
    const diff = ty - edgeY
    if (Math.abs(diff) < threshold && Math.abs(diff) <= Math.abs(bestDy)) {
      if (Math.abs(diff) < Math.abs(bestDy)) {
        bestDy = diff
        for (let i = guides.length - 1; i >= 0; i--) {
          if (guides[i].orientation === "horizontal") guides.splice(i, 1)
        }
      }
      if (Math.abs(diff) === Math.abs(bestDy)) {
        guides.push({ orientation: "horizontal", position: ty, start: startX, end: endX })
      }
    }
  }

  for (const id of page.order) {
    if (excludeIds.has(id)) continue
    const node = page.nodes[id]
    if (!node || !node.visible) continue
    const b = getAbsoluteBounds(node, page.nodes)
    const minY = Math.min(movingBounds.y, b.y) - 16
    const maxY = Math.max(movingBounds.y + movingBounds.height, b.y + b.height) + 16
    const minX = Math.min(movingBounds.x, b.x) - 16
    const maxX = Math.max(movingBounds.x + movingBounds.width, b.x + b.width) + 16
    checkX(b.x, minY, maxY)
    checkX(b.x + b.width / 2, minY, maxY)
    checkX(b.x + b.width, minY, maxY)
    checkY(b.y, minX, maxX)
    checkY(b.y + b.height / 2, minX, maxX)
    checkY(b.y + b.height, minX, maxX)
  }

  for (const rg of page.guides ?? []) {
    if (rg.axis === "x") {
      checkX(rg.position, movingBounds.y - 40, movingBounds.y + movingBounds.height + 40)
    } else {
      checkY(rg.position, movingBounds.x - 40, movingBounds.x + movingBounds.width + 40)
    }
  }

  return {
    dx: Math.abs(bestDx) <= threshold ? bestDx : 0,
    dy: Math.abs(bestDy) <= threshold ? bestDy : 0,
    guides,
  }
}

export function computeMeasureLines(source: Bounds, target: Bounds): MeasureLine[] {
  const lines: MeasureLine[] = []
  const sCx = source.x + source.width / 2
  const sCy = source.y + source.height / 2

  const isInside =
    source.x >= target.x &&
    source.y >= target.y &&
    source.x + source.width <= target.x + target.width &&
    source.y + source.height <= target.y + target.height

  if (isInside) {
    const leftDist = Math.round(source.x - target.x)
    const rightDist = Math.round(target.x + target.width - (source.x + source.width))
    const topDist = Math.round(source.y - target.y)
    const bottomDist = Math.round(target.y + target.height - (source.y + source.height))
    if (leftDist > 0) lines.push({ orientation: "horizontal", x1: target.x, y1: sCy, x2: source.x, y2: sCy, distance: leftDist })
    if (rightDist > 0) lines.push({ orientation: "horizontal", x1: source.x + source.width, y1: sCy, x2: target.x + target.width, y2: sCy, distance: rightDist })
    if (topDist > 0) lines.push({ orientation: "vertical", x1: sCx, y1: target.y, x2: sCx, y2: source.y, distance: topDist })
    if (bottomDist > 0) lines.push({ orientation: "vertical", x1: sCx, y1: source.y + source.height, x2: sCx, y2: target.y + target.height, distance: bottomDist })
    return lines
  }

  if (source.x + source.width < target.x) {
    lines.push({
      orientation: "horizontal",
      x1: source.x + source.width,
      y1: sCy,
      x2: target.x,
      y2: sCy,
      distance: Math.round(target.x - (source.x + source.width)),
    })
  } else if (target.x + target.width < source.x) {
    lines.push({
      orientation: "horizontal",
      x1: target.x + target.width,
      y1: sCy,
      x2: source.x,
      y2: sCy,
      distance: Math.round(source.x - (target.x + target.width)),
    })
  }

  if (source.y + source.height < target.y) {
    lines.push({
      orientation: "vertical",
      x1: sCx,
      y1: source.y + source.height,
      x2: sCx,
      y2: target.y,
      distance: Math.round(target.y - (source.y + source.height)),
    })
  } else if (target.y + target.height < source.y) {
    lines.push({
      orientation: "vertical",
      x1: sCx,
      y1: target.y + target.height,
      x2: sCx,
      y2: source.y,
      distance: Math.round(source.y - (target.y + target.height)),
    })
  }

  return lines
}

export function rectsIntersect(a: Bounds, b: Bounds): boolean {
  return (
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y
  )
}
