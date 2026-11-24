import type { DesignNode, DesignPage } from "../types/design"

export function computeAllAutoLayouts(page: DesignPage): DesignPage {
  const nextNodes: Record<string, DesignNode> = { ...page.nodes }
  const childrenByParent = new Map<string, string[]>()

  for (const id of page.order) {
    const node = nextNodes[id]
    if (!node || !node.parentId) continue
    const list = childrenByParent.get(node.parentId) ?? []
    list.push(id)
    childrenByParent.set(node.parentId, list)
  }

  const visited = new Set<string>()
  let mutated = false

  function visit(nodeId: string) {
    if (visited.has(nodeId)) return
    visited.add(nodeId)
    const kids = childrenByParent.get(nodeId) ?? []
    for (const kidId of kids) visit(kidId)

    const frame = nextNodes[nodeId]
    if (!frame || !frame.layout || frame.layout.mode === "none") return

    const flowKids = kids
      .map((id) => nextNodes[id])
      .filter((n): n is DesignNode => Boolean(n && n.visible && !n.layoutAbsolute))

    const layout = frame.layout
    const isRow = layout.mode === "horizontal"
    const gap = Math.max(0, layout.gap)
    const padL = Math.max(0, layout.paddingLeft)
    const padR = Math.max(0, layout.paddingRight)
    const padT = Math.max(0, layout.paddingTop)
    const padB = Math.max(0, layout.paddingBottom)

    let totalMain = 0
    let maxCross = 0
    for (let i = 0; i < flowKids.length; i++) {
      const k = flowKids[i]
      totalMain += isRow ? k.width : k.height
      if (i > 0) totalMain += gap
      maxCross = Math.max(maxCross, isRow ? k.height : k.width)
    }

    let frameWidth = frame.width
    let frameHeight = frame.height

    if (isRow) {
      if (layout.primarySizing === "hug") {
        frameWidth = Math.max(24, Math.round(totalMain + padL + padR))
      }
      if (layout.counterSizing === "hug") {
        frameHeight = Math.max(24, Math.round(maxCross + padT + padB))
      }
    } else {
      if (layout.primarySizing === "hug") {
        frameHeight = Math.max(24, Math.round(totalMain + padT + padB))
      }
      if (layout.counterSizing === "hug") {
        frameWidth = Math.max(24, Math.round(maxCross + padL + padR))
      }
    }

    if (frameWidth !== frame.width || frameHeight !== frame.height) {
      nextNodes[nodeId] = { ...frame, width: frameWidth, height: frameHeight }
      mutated = true
    }

    const innerMain = isRow ? Math.max(0, frameWidth - padL - padR) : Math.max(0, frameHeight - padT - padB)
    const innerCross = isRow ? Math.max(0, frameHeight - padT - padB) : Math.max(0, frameWidth - padL - padR)

    const growSum = flowKids.reduce((sum, k) => sum + (k.layoutGrow ?? 0), 0)
    const freeSpace = Math.max(0, innerMain - totalMain)

    let effectiveGap = gap
    let cursor = isRow ? padL : padT

    if (growSum === 0 && flowKids.length > 0) {
      if (layout.primaryAlign === "center") {
        cursor += (innerMain - totalMain) / 2
      } else if (layout.primaryAlign === "end") {
        cursor += innerMain - totalMain
      } else if (layout.primaryAlign === "space-between" && flowKids.length > 1) {
        const itemsOnly = flowKids.reduce((s, k) => s + (isRow ? k.width : k.height), 0)
        effectiveGap = Math.max(0, (innerMain - itemsOnly) / (flowKids.length - 1))
      }
    }

    for (const kid of flowKids) {
      let kidW = kid.width
      let kidH = kid.height

      if (growSum > 0 && (kid.layoutGrow ?? 0) > 0) {
        const extra = (freeSpace * (kid.layoutGrow ?? 0)) / growSum
        if (isRow) kidW = Math.max(4, Math.round(kidW + extra))
        else kidH = Math.max(4, Math.round(kidH + extra))
      }

      let crossPos = isRow ? padT : padL
      if (layout.counterAlign === "stretch") {
        if (isRow) kidH = Math.max(4, Math.round(innerCross))
        else kidW = Math.max(4, Math.round(innerCross))
      } else if (layout.counterAlign === "center") {
        crossPos += (innerCross - (isRow ? kidH : kidW)) / 2
      } else if (layout.counterAlign === "end") {
        crossPos += innerCross - (isRow ? kidH : kidW)
      }

      const nextX = Math.round(isRow ? cursor : crossPos)
      const nextY = Math.round(isRow ? crossPos : cursor)

      if (kid.x !== nextX || kid.y !== nextY || kid.width !== kidW || kid.height !== kidH) {
        nextNodes[kid.id] = {
          ...kid,
          x: nextX,
          y: nextY,
          width: kidW,
          height: kidH,
        }
        mutated = true
      }

      cursor += (isRow ? kidW : kidH) + effectiveGap
    }
  }

  for (const id of page.order) {
    visit(id)
  }

  return mutated ? { ...page, nodes: nextNodes } : page
}
