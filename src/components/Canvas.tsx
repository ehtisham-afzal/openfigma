"use client"

import * as React from "react"
import { Button } from "@ui-sdk/react/button"
import { Input } from "@ui-sdk/react/input"
import {
  Menu,
  MenuContent,
  MenuContextTrigger,
  MenuItem,
  MenuSeparator,
} from "@ui-sdk/react/menu"
import { Popover, PopoverContent, PopoverTitle, PopoverTrigger } from "@ui-sdk/react/popover"
import { toast } from "@ui-sdk/react/toast"
import { CheckIcon, PipetteIcon, SendIcon, Trash2Icon } from "lucide-react"
import { createNodeId, useDesignStore } from "../store/useDesignStore"
import { solidFill } from "../store/starter"
import type {
  BezierPoint,
  CanvasComment,
  DesignNode,
  MeasureLine,
  Point,
  SnapGuide,
} from "../types/design"
import {
  buildVectorPathD,
  computeMeasureLines,
  computeResizeSnap,
  computeSnap,
  getAbsoluteBounds,
  getAbsolutePosition,
  getAncestors,
  getPolygonPoints,
  getSelectionBounds,
  getStarPoints,
  getTopLevelSelection,
  isDescendant,
  rectsIntersect,
  type Bounds,
} from "../utils/geometry"
import {
  cornerRadiusCss,
  effectsToCss,
  nodeBackgroundCss,
  primaryFillColor,
  primaryStroke,
} from "../utils/paint"

type ResizeHandle = "nw" | "n" | "ne" | "e" | "se" | "s" | "sw" | "w"
type PaddingSide = "top" | "right" | "bottom" | "left"
type AutoLayoutField = "paddingTop" | "paddingRight" | "paddingBottom" | "paddingLeft" | "gap"

type Interaction =
  | {
      kind: "pan"
      startClientX: number
      startClientY: number
      originX: number
      originY: number
    }
  | {
      kind: "move"
      pointerId: number
      startCanvas: Point
      ids: string[]
      initialPositions: Record<string, Point>
      initialBounds: Bounds
      moved: boolean
      altDuplicated: boolean
    }
  | {
      kind: "resize"
      handle: ResizeHandle
      startCanvas: Point
      ids: string[]
      initialGroup: Bounds
      initialNodes: Record<
        string,
        { x: number; y: number; width: number; height: number; absX: number; absY: number }
      >
      moved: boolean
    }
  | {
      kind: "rotate"
      nodeId: string
      center: Point
      startAngle: number
      initialRotation: number
    }
  | {
      kind: "corner-radius"
      nodeId: string
      cornerIndex: 0 | 1 | 2 | 3
      startCanvas: Point
      initialRadius: number
      initialRadii: [number, number, number, number]
      maxRadius: number
      dirX: 1 | -1
      dirY: 1 | -1
    }
  | {
      kind: "al-padding"
      pointerId: number
      nodeId: string
      side: PaddingSide
      startCanvas: Point
      initialVal: number
      initialOpposite: number
      moved: boolean
    }
  | {
      kind: "al-gap"
      pointerId: number
      nodeId: string
      axis: "horizontal" | "vertical"
      startCanvas: Point
      initialGap: number
      moved: boolean
    }
  | {
      kind: "guide"
      pointerId: number
      axis: "x" | "y"
      guideId: string | null
      startCanvas: Point
      position: number
      moved: boolean
    }
  | {
      kind: "marquee"
      startCanvas: Point
      currentCanvas: Point
    }
  | {
      kind: "draw"
      nodeId: string
      startCanvas: Point
      parentOffset: Point
      nodeType: DesignNode["type"]
    }
  | {
      kind: "pen-handle"
      nodeId: string
      vertexIndex: number
      anchor: Point
      parentOffset: Point
      dragged: boolean
    }
  | {
      kind: "pencil-stroke"
      nodeId: string
      parentOffset: Point
      rawPoints: Point[]
    }
  | {
      kind: "comment-drag"
      commentId: string
      pointerId: number
      startCanvas: Point
      startWorld: Point
      moved: boolean
    }

interface PenSession {
  nodeId: string
  points: BezierPoint[]
  parentId: string | null
  parentOffset: Point
}

interface PendingComment {
  worldX: number
  worldY: number
  parentId: string | null
  parentName: string | null
  text: string
}

interface InlineAutoLayoutEdit {
  nodeId: string
  field: AutoLayoutField
  value: string
  x: number
  y: number
}

interface CanvasProps {
  canvasSizeRef: React.MutableRefObject<{ width: number; height: number }>
}

const CORNER_HANDLES: { id: ResizeHandle; left: string; top: string; cursor: string }[] = [
  { id: "nw", left: "0%", top: "0%", cursor: "nwse-resize" },
  { id: "ne", left: "100%", top: "0%", cursor: "nesw-resize" },
  { id: "se", left: "100%", top: "100%", cursor: "nwse-resize" },
  { id: "sw", left: "0%", top: "100%", cursor: "nesw-resize" },
]

const ROTATE_ZONES: { id: string; left: string; top: string; dx: number; dy: number }[] = [
  { id: "rot-nw", left: "0%", top: "0%", dx: -10, dy: -10 },
  { id: "rot-ne", left: "100%", top: "0%", dx: 10, dy: -10 },
  { id: "rot-se", left: "100%", top: "100%", dx: 10, dy: 10 },
  { id: "rot-sw", left: "0%", top: "100%", dx: -10, dy: 10 },
]

const CORNER_NAMES = ["TL", "TR", "BR", "BL"] as const

const ROTATE_CURSOR = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='%23ffffff' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M21 12a9 9 0 1 1-3-6.7L21 8'/%3E%3Cpath d='M21 3v5h-5'/%3E%3C/svg%3E") 10 10, grab`

function snapPenAngle(origin: Point, target: Point): Point {
  const dx = target.x - origin.x
  const dy = target.y - origin.y
  const dist = Math.hypot(dx, dy)
  if (dist < 1) return target
  const angle = Math.atan2(dy, dx)
  const snapped = Math.round(angle / (Math.PI / 4)) * (Math.PI / 4)
  return {
    x: origin.x + Math.cos(snapped) * dist,
    y: origin.y + Math.sin(snapped) * dist,
  }
}

function CommentPin({
  comment,
  worldX,
  worldY,
  parentName,
  index,
  zoom,
  onPinPointerDown,
  onPinClick,
  onReply,
  onResolve,
  onDelete,
}: {
  comment: CanvasComment
  worldX: number
  worldY: number
  parentName?: string | null
  index: number
  zoom: number
  onPinPointerDown: (e: React.PointerEvent) => void
  onPinClick: (e: React.MouseEvent) => void
  onReply: (text: string) => void
  onResolve: () => void
  onDelete: () => void
}) {
  const [replyText, setReplyText] = React.useState("")

  return (
    <div
      data-comment-pin={comment.id}
      style={{
        position: "absolute",
        left: worldX,
        top: worldY,
        transform: `scale(${1 / zoom}) translate(0, -100%)`,
        transformOrigin: "0 100%",
        zIndex: 25,
      }}
      onPointerDown={(e) => e.stopPropagation()}
    >
      <Popover>
        <PopoverTrigger
          aria-label={`Comment ${index + 1} by ${comment.author}`}
          title={
            parentName
              ? `Pinned to ${parentName} · Click to open · Drag to move`
              : "Click to open · Drag to move"
          }
          onPointerDown={onPinPointerDown}
          onClick={onPinClick}
          className="flex h-7 w-7 cursor-grab items-center justify-center rounded-full rounded-bl-none border-2 border-white p-0 text-[11px] font-bold text-white shadow-lg transition-transform hover:scale-110 active:cursor-grabbing"
          style={{ backgroundColor: comment.avatarColor }}
        >
          {index + 1}
        </PopoverTrigger>
        <PopoverContent side="right" align="start" sideOffset={10} className="w-[264px] p-3">
          <div className="mb-1.5 flex items-center justify-between gap-2">
            <PopoverTitle className="text-[11px] font-semibold text-[var(--color-text)]">
              {comment.author}
              <span className="ml-1.5 text-[10px] font-normal text-[var(--color-text-tertiary)]">
                {comment.createdAt}
              </span>
            </PopoverTitle>
            <div className="flex items-center gap-0.5">
              <Button
                aria-label={`Resolve comment ${index + 1}`}
                onClick={onResolve}
                className="!h-6 !w-6 border-transparent bg-transparent !p-0 text-[var(--color-icon-secondary)] hover:bg-[var(--color-bg-secondary)] hover:text-[var(--color-bg-dev)]"
              >
                <CheckIcon aria-hidden="true" className="h-3.5 w-3.5" />
              </Button>
              <Button
                aria-label={`Delete comment ${index + 1}`}
                onClick={onDelete}
                className="!h-6 !w-6 border-transparent bg-transparent !p-0 text-[var(--color-icon-secondary)] hover:bg-[var(--color-bg-secondary)] hover:text-[var(--ui-destructive)]"
              >
                <Trash2Icon aria-hidden="true" className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
          {parentName && (
            <div className="mb-2 inline-flex items-center rounded-[4px] bg-[var(--color-bg-secondary)] px-1.5 py-0.5 text-[10px] text-[var(--color-text-secondary)]">
              Pinned to {parentName}
            </div>
          )}

          <p className="text-[11px] leading-relaxed text-[var(--color-text)]">{comment.text}</p>

          {comment.replies.length > 0 && (
            <div className="mt-2.5 flex flex-col gap-1.5 border-t border-[var(--color-border)] pt-2">
              {comment.replies.map((r) => (
                <div key={r.id} className="text-[11px]">
                  <span className="font-semibold text-[var(--color-text)]">{r.author}</span>{" "}
                  <span className="text-[10px] text-[var(--color-text-tertiary)]">{r.createdAt}</span>
                  <p className="mt-0.5 text-[var(--color-text-secondary)]">{r.text}</p>
                </div>
              ))}
            </div>
          )}

          <form
            onSubmit={(e) => {
              e.preventDefault()
              if (!replyText.trim()) return
              onReply(replyText)
              setReplyText("")
            }}
            className="mt-2.5 flex items-center gap-1.5 border-t border-[var(--color-border)] pt-2"
          >
            <Input
              aria-label={`Reply to comment ${index + 1}`}
              value={replyText}
              onValueChange={setReplyText}
              placeholder="Reply…"
              className="h-6 flex-1 border-[var(--color-border)] bg-[var(--color-bg-secondary)] px-2 text-[11px]"
            />
            <Button
              type="submit"
              aria-label={`Send reply to comment ${index + 1}`}
              className="!h-6 !w-6 shrink-0 border-transparent bg-[var(--color-bg-brand)] !p-0 text-white hover:bg-[var(--color-bg-brand-hover)]"
            >
              <SendIcon aria-hidden="true" className="h-3 w-3" />
            </Button>
          </form>
        </PopoverContent>
      </Popover>
    </div>
  )
}

export function Canvas({ canvasSizeRef }: CanvasProps) {
  const {
    doc,
    activePage,
    selectedNodes,
    editingTextId,
    setEditingTextId,
    setSelectedIds,
    setTool,
    setViewport,
    commitCheckpoint,
    addNode,
    updateNodes,
    copySelection,
    pasteClipboard,
    duplicateSelection,
    deleteSelection,
    frameSelection,
    ungroupSelection,
    toggleAutoLayout,
    createComponentFromSelection,
    detachInstance,
    reparentNode,
    flipSelection,
    reorderZOrder,
    zoomToFit,
    zoomToSelection,
    insertImageFromFile,
    addComment,
    moveComment,
    replyComment,
    toggleResolveComment,
    deleteComment,
    addGuide,
    moveGuide,
    removeGuide,
    clearGuides,
  } = useDesignStore()

  const containerRef = React.useRef<HTMLDivElement>(null)
  const interactionRef = React.useRef<Interaction | null>(null)
  const suppressCommentClickRef = React.useRef(false)
  const [spacePressed, setSpacePressed] = React.useState(false)
  const [altPressed, setAltPressed] = React.useState(false)
  const [modPressed, setModPressed] = React.useState(false)
  const [shiftPressed, setShiftPressed] = React.useState(false)
  const [isPanning, setIsPanning] = React.useState(false)
  const [hoveredId, setHoveredId] = React.useState<string | null>(null)
  const [dropTargetId, setDropTargetId] = React.useState<string | null>(null)
  const [guides, setGuides] = React.useState<SnapGuide[]>([])
  const [marquee, setMarquee] = React.useState<Bounds | null>(null)
  const [cursorCanvas, setCursorCanvas] = React.useState<Point | null>(null)
  const [cursorClient, setCursorClient] = React.useState<Point | null>(null)
  const [canvasSize, setCanvasSize] = React.useState({ width: 1440, height: 900 })
  const [isDragOverFile, setIsDragOverFile] = React.useState(false)

  // Live canvas HUD states
  const [hudText, setHudText] = React.useState<string | null>(null)
  const [hudPink, setHudPink] = React.useState(false)
  const [guidePreview, setGuidePreview] = React.useState<{
    axis: "x" | "y"
    position: number
    guideId: string | null
  } | null>(null)

  // Inline canvas label editing (Frame / Component / Section title double-click)
  const [renamingLabelId, setRenamingLabelId] = React.useState<string | null>(null)
  const [renamingLabelDraft, setRenamingLabelDraft] = React.useState("")

  // Inline Auto Layout padding / gap editing (double-click on pink spacing handle)
  const [alInlineEdit, setAlInlineEdit] = React.useState<InlineAutoLayoutEdit | null>(null)

  // Multi-point Bézier Pen tool session
  const [penSession, setPenSession] = React.useState<PenSession | null>(null)
  const penSessionRef = React.useRef<PenSession | null>(null)
  penSessionRef.current = penSession

  // Pending inline comment composer (Comment tool C)
  const [pendingComment, setPendingComment] = React.useState<PendingComment | null>(null)

  // Eyedropper sampled color state
  const [eyedropperColor, setEyedropperColor] = React.useState<string>("#0d99ff")

  React.useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const update = () => {
      const rect = el.getBoundingClientRect()
      const next = { width: Math.max(1, rect.width), height: Math.max(1, rect.height) }
      canvasSizeRef.current = next
      setCanvasSize(next)
    }
    update()
    const observer = new ResizeObserver(update)
    observer.observe(el)
    return () => observer.disconnect()
  }, [canvasSizeRef])

  // Clear pen session if user switches away from pen tool
  React.useEffect(() => {
    if (doc.tool !== "pen" && penSession) {
      setPenSession(null)
    }
  }, [doc.tool, penSession])

  // Sync keyboard modifiers and Escape / Enter for Pen & Eyedropper
  React.useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space" && !isEditableTarget(e.target)) {
        e.preventDefault()
        setSpacePressed(true)
      }
      if (e.key === "Alt") setAltPressed(true)
      if (e.key === "Control" || e.key === "Meta") setModPressed(true)
      if (e.key === "Shift") setShiftPressed(true)

      if (e.key === "Escape" && !isEditableTarget(e.target)) {
        if (pendingComment) {
          e.preventDefault()
          setPendingComment(null)
          return
        }
        if (penSession) {
          e.preventDefault()
          if (penSession.points.length < 2) {
            deleteSelection([penSession.nodeId])
          }
          setPenSession(null)
          setTool("select")
          return
        }
        if (alInlineEdit) {
          e.preventDefault()
          setAlInlineEdit(null)
          return
        }
        if (renamingLabelId) {
          e.preventDefault()
          setRenamingLabelId(null)
          return
        }
        if (doc.tool !== "select") {
          e.preventDefault()
          setTool("select")
        }
      }

      if (e.key === "Enter" && penSession && !isEditableTarget(e.target)) {
        e.preventDefault()
        if (penSession.points.length < 2) {
          deleteSelection([penSession.nodeId])
        }
        setPenSession(null)
        setTool("select")
      }
    }
    const onKeyUp = (e: KeyboardEvent) => {
      if (e.code === "Space") setSpacePressed(false)
      if (e.key === "Alt") setAltPressed(false)
      if (e.key === "Control" || e.key === "Meta") setModPressed(false)
      if (e.key === "Shift") setShiftPressed(false)
    }
    const onBlur = () => {
      setSpacePressed(false)
      setAltPressed(false)
      setModPressed(false)
      setShiftPressed(false)
      setIsPanning(false)
    }
    window.addEventListener("keydown", onKeyDown)
    window.addEventListener("keyup", onKeyUp)
    window.addEventListener("blur", onBlur)
    return () => {
      window.removeEventListener("keydown", onKeyDown)
      window.removeEventListener("keyup", onKeyUp)
      window.removeEventListener("blur", onBlur)
    }
  }, [penSession, pendingComment, alInlineEdit, renamingLabelId, doc.tool, setTool, deleteSelection])

  const clientToCanvas = React.useCallback(
    (clientX: number, clientY: number): Point => {
      const rect = containerRef.current?.getBoundingClientRect()
      const left = rect?.left ?? 0
      const top = rect?.top ?? 0
      const rulerOffset = doc.showRulers ? 20 : 0
      return {
        x: (clientX - left - rulerOffset - doc.viewport.x) / doc.viewport.zoom,
        y: (clientY - top - rulerOffset - doc.viewport.y) / doc.viewport.zoom,
      }
    },
    [doc.showRulers, doc.viewport.x, doc.viewport.y, doc.viewport.zoom]
  )

  // Native non-passive wheel listener so preventDefault() blocks browser zoom/scroll on canvas.
  React.useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const onNativeWheel = (e: WheelEvent) => {
      e.preventDefault()
      if (e.ctrlKey || e.metaKey) {
        const rect = el.getBoundingClientRect()
        const offset = doc.showRulers ? 20 : 0
        const pointerX = e.clientX - rect.left - offset
        const pointerY = e.clientY - rect.top - offset
        const delta = Math.max(-120, Math.min(120, e.deltaY))
        const factor = Math.exp(-delta * 0.005)
        setViewport((vp) => {
          const nextZoom = Math.min(8, Math.max(0.1, vp.zoom * factor))
          const scale = nextZoom / vp.zoom
          return {
            zoom: nextZoom,
            x: pointerX - (pointerX - vp.x) * scale,
            y: pointerY - (pointerY - vp.y) * scale,
          }
        })
      } else {
        setViewport((vp) => ({
          ...vp,
          x: vp.x - e.deltaX,
          y: vp.y - e.deltaY,
        }))
      }
    }
    el.addEventListener("wheel", onNativeWheel, { passive: false })
    return () => el.removeEventListener("wheel", onNativeWheel)
  }, [doc.showRulers, setViewport])

  const findEnclosingFrame = React.useCallback(
    (pt: Point, excludeIds?: Set<string>): DesignNode | null => {
      for (let i = activePage.order.length - 1; i >= 0; i--) {
        const node = activePage.nodes[activePage.order[i]]
        if (!node || !node.visible || node.locked) continue
        if (node.type !== "frame" && node.type !== "component" && node.type !== "section") continue
        if (excludeIds?.has(node.id)) continue
        let skip = false
        if (excludeIds) {
          for (const ex of excludeIds) {
            if (isDescendant(node.id, ex, activePage.nodes)) {
              skip = true
              break
            }
          }
        }
        if (skip) continue
        const b = getAbsoluteBounds(node, activePage.nodes)
        if (pt.x >= b.x && pt.x <= b.x + b.width && pt.y >= b.y && pt.y <= b.y + b.height) {
          return node
        }
      }
      return null
    },
    [activePage]
  )

  // Deep hit test at canvas point (for eyedropper sampling and double-click drill-in)
  const hitTestTopNode = React.useCallback(
    (pt: Point): DesignNode | null => {
      for (let i = activePage.order.length - 1; i >= 0; i--) {
        const node = activePage.nodes[activePage.order[i]]
        if (!node || !node.visible) continue
        const b = getAbsoluteBounds(node, activePage.nodes)
        if (pt.x >= b.x && pt.x <= b.x + b.width && pt.y >= b.y && pt.y <= b.y + b.height) {
          return node
        }
      }
      return null
    },
    [activePage]
  )

  const sampleColorAt = React.useCallback(
    (pt: Point): string => {
      for (let i = activePage.order.length - 1; i >= 0; i--) {
        const node = activePage.nodes[activePage.order[i]]
        if (!node || !node.visible) continue
        const b = getAbsoluteBounds(node, activePage.nodes)
        if (pt.x >= b.x && pt.x <= b.x + b.width && pt.y >= b.y && pt.y <= b.y + b.height) {
          const visibleFill = node.fills.find((f) => f.visible)
          if (visibleFill) {
            return primaryFillColor(node, doc.variables)
          }
        }
      }
      return activePage.background || "#1e1e1e"
    },
    [activePage, doc.variables]
  )

  const syncBezierPenNode = React.useCallback(
    (nodeId: string, points: BezierPoint[], parentOffset: Point, closed = false) => {
      if (points.length === 0) return
      let minX = Infinity
      let minY = Infinity
      let maxX = -Infinity
      let maxY = -Infinity
      const consider = (p: Point) => {
        minX = Math.min(minX, p.x)
        minY = Math.min(minY, p.y)
        maxX = Math.max(maxX, p.x)
        maxY = Math.max(maxY, p.y)
      }
      for (const bp of points) {
        consider(bp)
        if (bp.handleIn) consider(bp.handleIn)
        if (bp.handleOut) consider(bp.handleOut)
      }
      const relativeBezier: BezierPoint[] = points.map((bp) => ({
        x: Math.round((bp.x - minX) * 10) / 10,
        y: Math.round((bp.y - minY) * 10) / 10,
        ...(bp.handleIn
          ? {
              handleIn: {
                x: Math.round((bp.handleIn.x - minX) * 10) / 10,
                y: Math.round((bp.handleIn.y - minY) * 10) / 10,
              },
            }
          : {}),
        ...(bp.handleOut
          ? {
              handleOut: {
                x: Math.round((bp.handleOut.x - minX) * 10) / 10,
                y: Math.round((bp.handleOut.y - minY) * 10) / 10,
              },
            }
          : {}),
      }))
      updateNodes(
        [nodeId],
        (node) => ({
          x: Math.round(minX - parentOffset.x),
          y: Math.round(minY - parentOffset.y),
          width: Math.max(4, Math.round(maxX - minX)),
          height: Math.max(4, Math.round(maxY - minY)),
          bezierPoints: relativeBezier,
          points: relativeBezier.map((p) => ({ x: p.x, y: p.y })),
          closed,
          ...(closed && node.fills.length === 0 ? { fills: [solidFill("rgba(13, 153, 255, 0.16)")] } : {}),
        }),
        false
      )
    },
    [updateNodes]
  )

  const syncPencilStrokeNode = React.useCallback(
    (nodeId: string, points: Point[], parentOffset: Point) => {
      if (points.length === 0) return
      let minX = Infinity
      let minY = Infinity
      let maxX = -Infinity
      let maxY = -Infinity
      for (const p of points) {
        minX = Math.min(minX, p.x)
        minY = Math.min(minY, p.y)
        maxX = Math.max(maxX, p.x)
        maxY = Math.max(maxY, p.y)
      }
      const relativePoints = points.map((p) => ({
        x: Math.round((p.x - minX) * 10) / 10,
        y: Math.round((p.y - minY) * 10) / 10,
      }))
      updateNodes(
        [nodeId],
        {
          x: Math.round(minX - parentOffset.x),
          y: Math.round(minY - parentOffset.y),
          width: Math.max(4, Math.round(maxX - minX)),
          height: Math.max(4, Math.round(maxY - minY)),
          points: relativePoints,
          smooth: true,
        },
        false
      )
    },
    [updateNodes]
  )

  const startPan = (e: React.PointerEvent) => {
    setIsPanning(true)
    interactionRef.current = {
      kind: "pan",
      startClientX: e.clientX,
      startClientY: e.clientY,
      originX: doc.viewport.x,
      originY: doc.viewport.y,
    }
    e.currentTarget.setPointerCapture?.(e.pointerId)
  }

  const startGuideDrag = (
    e: React.PointerEvent,
    axis: "x" | "y",
    guideId: string | null,
    initialPos: number
  ) => {
    e.stopPropagation()
    e.preventDefault()
    const startPt = clientToCanvas(e.clientX, e.clientY)
    const isNewGuide = guideId === null
    if (isNewGuide) {
      setGuidePreview({ axis, position: Math.round(initialPos), guideId })
      containerRef.current?.setPointerCapture?.(e.pointerId)
    }
    interactionRef.current = {
      kind: "guide",
      pointerId: e.pointerId,
      axis,
      guideId,
      startCanvas: startPt,
      position: Math.round(initialPos),
      moved: isNewGuide,
    }
  }

  const handleCanvasPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.button === 2) return
    if (e.button === 1 || doc.tool === "hand" || spacePressed) {
      e.preventDefault()
      startPan(e)
      return
    }
    if (e.button !== 0) return

    setEditingTextId(null)
    setAlInlineEdit(null)
    setRenamingLabelId(null)
    const pt = clientToCanvas(e.clientX, e.clientY)

    // Eyedropper color sampling
    if (doc.tool === "eyedropper") {
      const hex = sampleColorAt(pt)
      if (doc.selectedIds.length > 0) {
        updateNodes(doc.selectedIds, (node) => ({
          fills:
            node.fills.length > 0
              ? node.fills.map((f, idx) =>
                  idx === 0 ? { ...f, type: "solid", color: hex, variableId: null } : f
                )
              : [solidFill(hex)],
        }))
        toast(`Applied ${hex.toUpperCase()} to fill`)
      } else {
        void navigator.clipboard?.writeText(hex)
        toast(`Copied ${hex.toUpperCase()}`)
      }
      setTool("select")
      return
    }

    if (doc.tool === "comment") {
      const enclosing = findEnclosingFrame(pt)
      setPendingComment({
        worldX: pt.x,
        worldY: pt.y,
        parentId: enclosing?.id ?? null,
        parentName: enclosing?.name ?? null,
        text: "",
      })
      return
    }

    if (doc.tool === "select") {
      if (!e.shiftKey) setSelectedIds([])
      interactionRef.current = {
        kind: "marquee",
        startCanvas: pt,
        currentCanvas: pt,
      }
      setMarquee({ x: pt.x, y: pt.y, width: 0, height: 0 })
      e.currentTarget.setPointerCapture?.(e.pointerId)
      return
    }

    if (doc.tool === "text") {
      const frame = findEnclosingFrame(pt)
      const parentBounds = frame ? getAbsoluteBounds(frame, activePage.nodes) : { x: 0, y: 0 }
      const id = createNodeId("text")
      const node: DesignNode = {
        id,
        name: "Text",
        type: "text",
        parentId: frame?.id ?? null,
        x: Math.round(pt.x - parentBounds.x),
        y: Math.round(pt.y - parentBounds.y),
        width: 180,
        height: 32,
        rotation: 0,
        opacity: 1,
        visible: true,
        locked: false,
        fills: [solidFill("#f8fafc")],
        strokes: [],
        effects: [],
        cornerRadius: 0,
        blendMode: "normal",
        text: "Type something",
        fontFamily: "Inter",
        fontSize: 18,
        fontWeight: 500,
        textAlign: "left",
        lineHeight: 1.35,
        letterSpacing: 0,
      }
      addNode(node, true)
      setTool("select")
      setEditingTextId(id)
      return
    }

    // Real Figma Bézier Pen tool (P): click for corner vertices, click-drag to pull symmetric Bézier curve handles
    if (doc.tool === "pen") {
      if (penSession) {
        const lastPt = penSession.points[penSession.points.length - 1]
        const firstPt = penSession.points[0]
        const nextPt = e.shiftKey && lastPt ? snapPenAngle(lastPt, pt) : pt

        // Clicking near vertex 0 with 3+ vertices closes the Bézier loop
        if (
          penSession.points.length >= 3 &&
          Math.hypot(pt.x - firstPt.x, pt.y - firstPt.y) <= 10 / doc.viewport.zoom
        ) {
          syncBezierPenNode(penSession.nodeId, penSession.points, penSession.parentOffset, true)
          setPenSession(null)
          setTool("select")
          toast("Closed Bézier vector path")
          return
        }

        const nextPts: BezierPoint[] = [...penSession.points, { x: nextPt.x, y: nextPt.y }]
        syncBezierPenNode(penSession.nodeId, nextPts, penSession.parentOffset, false)
        setPenSession({ ...penSession, points: nextPts })
        interactionRef.current = {
          kind: "pen-handle",
          nodeId: penSession.nodeId,
          vertexIndex: nextPts.length - 1,
          anchor: nextPt,
          parentOffset: penSession.parentOffset,
          dragged: false,
        }
        e.currentTarget.setPointerCapture?.(e.pointerId)
        return
      }

      const enclosing = findEnclosingFrame(pt)
      const parentBounds = enclosing ? getAbsoluteBounds(enclosing, activePage.nodes) : { x: 0, y: 0 }
      const id = createNodeId("path")
      const node: DesignNode = {
        id,
        name: "Vector Path",
        type: "path",
        parentId: enclosing?.id ?? null,
        x: Math.round(pt.x - parentBounds.x),
        y: Math.round(pt.y - parentBounds.y),
        width: 4,
        height: 4,
        rotation: 0,
        opacity: 1,
        visible: true,
        locked: false,
        fills: [],
        strokes: [
          {
            id: createNodeId("stroke"),
            visible: true,
            color: "#38bdf8",
            width: 2,
            opacity: 1,
            style: "solid",
            align: "center",
          },
        ],
        effects: [],
        cornerRadius: 0,
        blendMode: "normal",
        points: [{ x: 0, y: 0 }],
        bezierPoints: [{ x: 0, y: 0 }],
        closed: false,
      }
      addNode(node, true)
      const firstVertex: BezierPoint = { x: pt.x, y: pt.y }
      const parentOffset = { x: parentBounds.x, y: parentBounds.y }
      setPenSession({
        nodeId: id,
        points: [firstVertex],
        parentId: enclosing?.id ?? null,
        parentOffset,
      })
      interactionRef.current = {
        kind: "pen-handle",
        nodeId: id,
        vertexIndex: 0,
        anchor: pt,
        parentOffset,
        dragged: false,
      }
      e.currentTarget.setPointerCapture?.(e.pointerId)
      return
    }

    // Dedicated Smooth Freehand Pencil tool (Shift+P)
    if (doc.tool === "pencil") {
      const enclosing = findEnclosingFrame(pt)
      const parentBounds = enclosing ? getAbsoluteBounds(enclosing, activePage.nodes) : { x: 0, y: 0 }
      const id = createNodeId("path")
      const node: DesignNode = {
        id,
        name: "Pencil Stroke",
        type: "path",
        parentId: enclosing?.id ?? null,
        x: Math.round(pt.x - parentBounds.x),
        y: Math.round(pt.y - parentBounds.y),
        width: 4,
        height: 4,
        rotation: 0,
        opacity: 1,
        visible: true,
        locked: false,
        fills: [],
        strokes: [
          {
            id: createNodeId("stroke"),
            visible: true,
            color: "#f8fafc",
            width: 2.5,
            opacity: 1,
            style: "solid",
            align: "center",
          },
        ],
        effects: [],
        cornerRadius: 0,
        blendMode: "normal",
        points: [{ x: 0, y: 0 }],
        smooth: true,
      }
      addNode(node, true)
      interactionRef.current = {
        kind: "pencil-stroke",
        nodeId: id,
        parentOffset: { x: parentBounds.x, y: parentBounds.y },
        rawPoints: [pt],
      }
      e.currentTarget.setPointerCapture?.(e.pointerId)
      return
    }

    const drawType = (doc.tool === "image" ? "rectangle" : doc.tool) as DesignNode["type"]
    const isSection = drawType === "section"
    const isFrame = drawType === "frame"
    const enclosing = isFrame || isSection ? null : findEnclosingFrame(pt)
    const parentBounds = enclosing ? getAbsoluteBounds(enclosing, activePage.nodes) : { x: 0, y: 0 }
    const id = createNodeId(drawType)
    const isLine = drawType === "line"
    const node: DesignNode = {
      id,
      name: isSection ? "Section" : `${drawType.charAt(0).toUpperCase()}${drawType.slice(1)}`,
      type: drawType,
      parentId: enclosing?.id ?? null,
      x: Math.round(pt.x - parentBounds.x),
      y: Math.round(pt.y - parentBounds.y),
      width: 2,
      height: 2,
      rotation: 0,
      opacity: 1,
      visible: true,
      locked: false,
      clipContent: isFrame,
      fills: isLine
        ? []
        : [
            solidFill(
              isSection
                ? "rgba(255, 255, 255, 0.04)"
                : isFrame
                  ? "#181b22"
                  : drawType === "star"
                    ? "#facc15"
                    : drawType === "polygon"
                      ? "#a855f7"
                      : "#0d99ff"
            ),
          ],
      strokes:
        isSection || isFrame || isLine
          ? [
              {
                id: createNodeId("stroke"),
                visible: true,
                color: isSection ? "#5c5c5c" : isFrame ? "#3b4252" : "#f8fafc",
                width: isLine ? 2 : 1,
                opacity: 1,
                style: "solid",
                align: "inside",
              },
            ]
          : [],
      effects: [],
      cornerRadius: isSection ? 12 : drawType === "rectangle" || isFrame ? 8 : 0,
      blendMode: "normal",
      ...(drawType === "polygon" ? { polygonSides: 3 } : {}),
      ...(drawType === "star" ? { starPoints: 5 } : {}),
    }
    addNode(node, true)
    interactionRef.current = {
      kind: "draw",
      nodeId: id,
      startCanvas: pt,
      parentOffset: { x: parentBounds.x, y: parentBounds.y },
      nodeType: drawType,
    }
    e.currentTarget.setPointerCapture?.(e.pointerId)
  }

  const handleNodePointerDown = (e: React.PointerEvent, node: DesignNode) => {
    if (e.button === 1 || doc.tool === "hand" || spacePressed) return
    if (
      doc.tool === "comment" ||
      doc.tool === "eyedropper" ||
      doc.tool === "pen" ||
      doc.tool === "pencil"
    )
      return
    if (doc.tool !== "select") return
    e.stopPropagation()
    setAlInlineEdit(null)

    if (e.button === 2) {
      if (!doc.selectedIds.includes(node.id)) setSelectedIds([node.id])
      return
    }
    if (e.button !== 0 || node.locked) return

    // Figma selection hierarchy: single-click selects top-level container first; Ctrl/Cmd+Click or double-click drills down.
    const deepSelect = e.metaKey || e.ctrlKey || doc.devMode || !node.parentId
    let targetNode = node
    if (!deepSelect && node.parentId) {
      const chain = getAncestors(node.id, activePage.nodes)
      const selectedIdx = chain.findIndex((a) => doc.selectedIds.includes(a.id))
      if (selectedIdx === -1) {
        const siblingSelected = chain.some((a) =>
          doc.selectedIds.some((sid) => activePage.nodes[sid]?.parentId === a.id)
        )
        if (!siblingSelected) {
          targetNode = chain[0] ?? node
        }
      } else if (selectedIdx < chain.length - 1) {
        targetNode = chain[selectedIdx + 1]
      }
    }

    let nextSelected: string[]
    if (e.shiftKey) {
      nextSelected = doc.selectedIds.includes(targetNode.id)
        ? doc.selectedIds.filter((id) => id !== targetNode.id)
        : [...doc.selectedIds, targetNode.id]
      setSelectedIds(nextSelected)
    } else if (doc.selectedIds.includes(targetNode.id)) {
      nextSelected = doc.selectedIds
    } else {
      nextSelected = [targetNode.id]
      setSelectedIds(nextSelected)
    }

    if (doc.devMode) return

    const movableIds = getTopLevelSelection(nextSelected, activePage.nodes).filter(
      (id) => !activePage.nodes[id]?.locked
    )
    if (movableIds.length === 0) return

    const initialBounds = getSelectionBounds(movableIds, activePage.nodes)
    if (!initialBounds) return

    const initialPositions: Record<string, Point> = {}
    for (const id of movableIds) {
      initialPositions[id] = { x: activePage.nodes[id].x, y: activePage.nodes[id].y }
    }

    interactionRef.current = {
      kind: "move",
      pointerId: e.pointerId,
      startCanvas: clientToCanvas(e.clientX, e.clientY),
      ids: movableIds,
      initialPositions,
      initialBounds,
      moved: false,
      altDuplicated: false,
    }
  }

  const handleResizePointerDown = (e: React.PointerEvent, handle: ResizeHandle) => {
    e.stopPropagation()
    if (doc.devMode) return
    const movableIds = getTopLevelSelection(doc.selectedIds, activePage.nodes).filter(
      (id) => !activePage.nodes[id]?.locked
    )
    if (movableIds.length === 0) return
    const groupBounds = getSelectionBounds(movableIds, activePage.nodes)
    if (!groupBounds) return

    const initialNodes: Record<
      string,
      { x: number; y: number; width: number; height: number; absX: number; absY: number }
    > = {}
    for (const id of movableIds) {
      const n = activePage.nodes[id]
      const abs = getAbsoluteBounds(n, activePage.nodes)
      initialNodes[id] = {
        x: n.x,
        y: n.y,
        width: n.width,
        height: n.height,
        absX: abs.x,
        absY: abs.y,
      }
    }

    interactionRef.current = {
      kind: "resize",
      handle,
      startCanvas: clientToCanvas(e.clientX, e.clientY),
      ids: movableIds,
      initialGroup: groupBounds,
      initialNodes,
      moved: false,
    }
    containerRef.current?.setPointerCapture?.(e.pointerId)
  }

  const handleRotatePointerDown = (e: React.PointerEvent) => {
    e.stopPropagation()
    if (doc.devMode) return
    const target = selectedNodes[0]
    if (!target || target.locked) return
    const abs = getAbsoluteBounds(target, activePage.nodes)
    const center = { x: abs.x + abs.width / 2, y: abs.y + abs.height / 2 }
    const pt = clientToCanvas(e.clientX, e.clientY)
    const startAngle = Math.atan2(pt.y - center.y, pt.x - center.x)
    commitCheckpoint()
    setHudPink(false)
    setHudText(`${Math.round(target.rotation)}°`)
    interactionRef.current = {
      kind: "rotate",
      nodeId: target.id,
      center,
      startAngle,
      initialRotation: target.rotation,
    }
    containerRef.current?.setPointerCapture?.(e.pointerId)
  }

  const handleCornerRadiusPointerDown = (
    e: React.PointerEvent,
    cornerIndex: 0 | 1 | 2 | 3,
    dirX: 1 | -1,
    dirY: 1 | -1
  ) => {
    e.stopPropagation()
    if (doc.devMode) return
    const target = selectedNodes[0]
    if (!target || target.locked) return
    commitCheckpoint()
    const radii: [number, number, number, number] = target.cornerRadii
      ? [...target.cornerRadii]
      : [target.cornerRadius, target.cornerRadius, target.cornerRadius, target.cornerRadius]
    const initialR = target.independentCorners ? radii[cornerIndex] : target.cornerRadius
    interactionRef.current = {
      kind: "corner-radius",
      nodeId: target.id,
      cornerIndex,
      startCanvas: clientToCanvas(e.clientX, e.clientY),
      initialRadius: initialR,
      initialRadii: radii,
      maxRadius: Math.round(Math.min(target.width, target.height) / 2),
      dirX,
      dirY,
    }
    setHudPink(false)
    setHudText(e.altKey ? `${CORNER_NAMES[cornerIndex]} Radius ${initialR}` : `Radius ${initialR}`)
    containerRef.current?.setPointerCapture?.(e.pointerId)
  }

  const handlePaddingPointerDown = (e: React.PointerEvent, node: DesignNode, side: PaddingSide) => {
    e.stopPropagation()
    if (doc.devMode || node.locked || !node.layout) return
    const valMap: Record<PaddingSide, number> = {
      top: node.layout.paddingTop,
      right: node.layout.paddingRight,
      bottom: node.layout.paddingBottom,
      left: node.layout.paddingLeft,
    }
    const oppMap: Record<PaddingSide, PaddingSide> = {
      top: "bottom",
      bottom: "top",
      left: "right",
      right: "left",
    }
    interactionRef.current = {
      kind: "al-padding",
      pointerId: e.pointerId,
      nodeId: node.id,
      side,
      startCanvas: clientToCanvas(e.clientX, e.clientY),
      initialVal: valMap[side],
      initialOpposite: valMap[oppMap[side]],
      moved: false,
    }
  }

  const handleGapPointerDown = (e: React.PointerEvent, node: DesignNode) => {
    e.stopPropagation()
    if (doc.devMode || node.locked || !node.layout || node.layout.mode === "none") return
    interactionRef.current = {
      kind: "al-gap",
      pointerId: e.pointerId,
      nodeId: node.id,
      axis: node.layout.mode,
      startCanvas: clientToCanvas(e.clientX, e.clientY),
      initialGap: node.layout.gap,
      moved: false,
    }
  }

  const commitInlineAutoLayoutEdit = () => {
    if (!alInlineEdit) return
    const num = Math.max(0, Math.round(Number(alInlineEdit.value)))
    if (!Number.isNaN(num)) {
      const target = activePage.nodes[alInlineEdit.nodeId]
      if (target?.layout) {
        updateNodes([target.id], {
          layout: {
            ...target.layout,
            [alInlineEdit.field]: num,
            ...(alInlineEdit.field === "gap" && target.layout.primaryAlign === "space-between"
              ? { primaryAlign: "start" }
              : {}),
          },
        })
      }
    }
    setAlInlineEdit(null)
  }

  const commitCanvasLabelRename = () => {
    if (!renamingLabelId) return
    const trimmed = renamingLabelDraft.trim()
    if (trimmed) {
      updateNodes([renamingLabelId], { name: trimmed })
    }
    setRenamingLabelId(null)
  }

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const pt = clientToCanvas(e.clientX, e.clientY)
    setCursorCanvas(pt)
    setCursorClient({ x: e.clientX, y: e.clientY })

    if (doc.tool === "eyedropper") {
      setEyedropperColor(sampleColorAt(pt))
    }

    const current = interactionRef.current
    if (!current) return

    if (current.kind === "pan") {
      setViewport((vp) => ({
        ...vp,
        x: current.originX + (e.clientX - current.startClientX),
        y: current.originY + (e.clientY - current.startClientY),
      }))
      return
    }

    if (current.kind === "guide") {
      if (
        !current.moved &&
        Math.hypot(pt.x - current.startCanvas.x, pt.y - current.startCanvas.y) < 2
      ) {
        return
      }
      if (!current.moved) {
        current.moved = true
        if (current.guideId) commitCheckpoint()
        containerRef.current?.setPointerCapture?.(current.pointerId)
      }
      const nextPos = Math.round(current.axis === "x" ? pt.x : pt.y)
      current.position = nextPos
      setGuidePreview({ axis: current.axis, position: nextPos, guideId: current.guideId })
      if (current.guideId) {
        moveGuide(current.guideId, nextPos)
      }
      return
    }

    if (current.kind === "al-padding") {
      const rawDelta =
        current.side === "top"
          ? pt.y - current.startCanvas.y
          : current.side === "bottom"
            ? current.startCanvas.y - pt.y
            : current.side === "left"
              ? pt.x - current.startCanvas.x
              : current.startCanvas.x - pt.x
      if (!current.moved && Math.abs(rawDelta) < 2) return
      if (!current.moved) {
        current.moved = true
        commitCheckpoint()
        containerRef.current?.setPointerCapture?.(current.pointerId)
      }
      let nextVal = Math.max(0, Math.round(current.initialVal + rawDelta))
      if (e.shiftKey) nextVal = Math.round(nextVal / 8) * 8

      const fieldMap: Record<PaddingSide, AutoLayoutField> = {
        top: "paddingTop",
        right: "paddingRight",
        bottom: "paddingBottom",
        left: "paddingLeft",
      }
      const oppFieldMap: Record<PaddingSide, AutoLayoutField> = {
        top: "paddingBottom",
        bottom: "paddingTop",
        left: "paddingRight",
        right: "paddingLeft",
      }
      const node = activePage.nodes[current.nodeId]
      if (node?.layout) {
        const patch: Partial<typeof node.layout> = { [fieldMap[current.side]]: nextVal }
        if (e.altKey) {
          patch[oppFieldMap[current.side]] = Math.max(0, nextVal)
        }
        updateNodes([current.nodeId], { layout: { ...node.layout, ...patch } }, false)
        setHudPink(true)
        setHudText(e.altKey ? `Padding ±${nextVal}` : `Padding ${nextVal}`)
      }
      return
    }

    if (current.kind === "al-gap") {
      const delta =
        current.axis === "horizontal"
          ? pt.x - current.startCanvas.x
          : pt.y - current.startCanvas.y
      if (!current.moved && Math.abs(delta) < 2) return
      if (!current.moved) {
        current.moved = true
        commitCheckpoint()
        containerRef.current?.setPointerCapture?.(current.pointerId)
      }
      let nextGap = Math.max(0, Math.round(current.initialGap + delta))
      if (e.shiftKey) nextGap = Math.round(nextGap / 4) * 4
      const node = activePage.nodes[current.nodeId]
      if (node?.layout) {
        updateNodes(
          [current.nodeId],
          {
            layout: {
              ...node.layout,
              gap: nextGap,
              primaryAlign:
                node.layout.primaryAlign === "space-between" ? "start" : node.layout.primaryAlign,
            },
          },
          false
        )
        setHudPink(true)
        setHudText(`Gap ${nextGap}`)
      }
      return
    }

    if (current.kind === "corner-radius") {
      const delta =
        ((pt.x - current.startCanvas.x) * current.dirX +
          (pt.y - current.startCanvas.y) * current.dirY) /
        2
      const next = Math.max(0, Math.min(current.maxRadius, Math.round(current.initialRadius + delta)))
      setHudPink(false)
      if (e.altKey) {
        const nextRadii: [number, number, number, number] = [...current.initialRadii]
        nextRadii[current.cornerIndex] = next
        setHudText(`${CORNER_NAMES[current.cornerIndex]} Radius ${next}`)
        updateNodes(
          [current.nodeId],
          { independentCorners: true, cornerRadii: nextRadii },
          false
        )
      } else {
        setHudText(`Radius ${next}`)
        updateNodes(
          [current.nodeId],
          { independentCorners: false, cornerRadius: next, cornerRadii: [next, next, next, next] },
          false
        )
      }
      return
    }

    if (current.kind === "move") {
      let dx = pt.x - current.startCanvas.x
      let dy = pt.y - current.startCanvas.y
      if (!current.moved && Math.hypot(dx, dy) < 2) return
      if (!current.moved) {
        containerRef.current?.setPointerCapture?.(current.pointerId)
        if (e.altKey && !current.altDuplicated) {
          const dupIds = duplicateSelection(current.ids, { x: 0, y: 0 })
          if (dupIds.length > 0) {
            const newInit: Record<string, Point> = {}
            dupIds.forEach((dupId, idx) => {
              const origId = current.ids[idx]
              newInit[dupId] = current.initialPositions[origId] ?? { x: 0, y: 0 }
            })
            current.ids = dupIds
            current.initialPositions = newInit
            current.altDuplicated = true
          }
        } else {
          commitCheckpoint()
        }
        current.moved = true
      }

      if (e.shiftKey) {
        if (Math.abs(dx) >= Math.abs(dy)) dy = 0
        else dx = 0
      }

      if (doc.snapToObjects && !e.metaKey && !e.ctrlKey) {
        const candidate: Bounds = {
          x: current.initialBounds.x + dx,
          y: current.initialBounds.y + dy,
          width: current.initialBounds.width,
          height: current.initialBounds.height,
        }
        const snap = computeSnap(
          candidate,
          new Set(current.ids),
          activePage,
          6 / doc.viewport.zoom
        )
        dx += snap.dx
        dy += snap.dy
        setGuides(snap.guides)
      } else {
        setGuides([])
      }

      const nextX = Math.round(current.initialBounds.x + dx)
      const nextY = Math.round(current.initialBounds.y + dy)
      setHudPink(false)
      setHudText(`X ${nextX}, Y ${nextY}`)

      updateNodes(
        current.ids,
        (node) => {
          const base = current.initialPositions[node.id]
          if (!base) return {}
          return { x: Math.round(base.x + dx), y: Math.round(base.y + dy) }
        },
        false
      )

      if (current.ids.length === 1) {
        const dropFrame = findEnclosingFrame(pt, new Set(current.ids))
        const movedNode = activePage.nodes[current.ids[0]]
        setDropTargetId(dropFrame && dropFrame.id !== movedNode?.parentId ? dropFrame.id : null)
      } else {
        setDropTargetId(null)
      }
      return
    }

    if (current.kind === "resize") {
      let dx = pt.x - current.startCanvas.x
      let dy = pt.y - current.startCanvas.y
      if (!current.moved) {
        commitCheckpoint()
        current.moved = true
      }

      let gx = current.initialGroup.x
      let gy = current.initialGroup.y
      let gw = current.initialGroup.width
      let gh = current.initialGroup.height
      const fromCenter = e.altKey
      const singleNode = current.ids.length === 1 ? activePage.nodes[current.ids[0]] : null
      const lockAspect = Boolean(
        (e.shiftKey && current.handle.length === 2) || singleNode?.lockAspectRatio
      )
      const aspect = current.initialGroup.width / Math.max(1, current.initialGroup.height)

      // Edge snapping during resize (when not holding Ctrl/Cmd)
      if (doc.snapToObjects && !e.metaKey && !e.ctrlKey && !fromCenter) {
        const candidateEdgeX = current.handle.includes("e")
          ? current.initialGroup.x + current.initialGroup.width + dx
          : current.handle.includes("w")
            ? current.initialGroup.x + dx
            : null
        const candidateEdgeY = current.handle.includes("s")
          ? current.initialGroup.y + current.initialGroup.height + dy
          : current.handle.includes("n")
            ? current.initialGroup.y + dy
            : null
        const snap = computeResizeSnap(
          candidateEdgeX,
          candidateEdgeY,
          current.initialGroup,
          new Set(current.ids),
          activePage,
          6 / doc.viewport.zoom
        )
        dx += snap.dx
        dy += snap.dy
        setGuides(snap.guides)
      } else {
        setGuides([])
      }

      if (fromCenter) {
        const mul = 2
        if (current.handle.includes("e")) {
          gw = Math.max(4, current.initialGroup.width + dx * mul)
          gx = current.initialGroup.x + (current.initialGroup.width - gw) / 2
        } else if (current.handle.includes("w")) {
          gw = Math.max(4, current.initialGroup.width - dx * mul)
          gx = current.initialGroup.x + (current.initialGroup.width - gw) / 2
        }
        if (current.handle.includes("s")) {
          gh = Math.max(4, current.initialGroup.height + dy * mul)
          gy = current.initialGroup.y + (current.initialGroup.height - gh) / 2
        } else if (current.handle.includes("n")) {
          gh = Math.max(4, current.initialGroup.height - dy * mul)
          gy = current.initialGroup.y + (current.initialGroup.height - gh) / 2
        }
        if (lockAspect) {
          gh = Math.max(4, gw / aspect)
          gy = current.initialGroup.y + (current.initialGroup.height - gh) / 2
        }
      } else {
        if (current.handle.includes("e")) gw = Math.max(4, current.initialGroup.width + dx)
        if (current.handle.includes("s")) gh = Math.max(4, current.initialGroup.height + dy)
        if (current.handle.includes("w")) {
          const nextW = Math.max(4, current.initialGroup.width - dx)
          gx = current.initialGroup.x + (current.initialGroup.width - nextW)
          gw = nextW
        }
        if (current.handle.includes("n")) {
          const nextH = Math.max(4, current.initialGroup.height - dy)
          gy = current.initialGroup.y + (current.initialGroup.height - nextH)
          gh = nextH
        }
        if (lockAspect) {
          const lockedH = Math.max(4, gw / aspect)
          if (current.handle.includes("n")) {
            gy = current.initialGroup.y + (current.initialGroup.height - lockedH)
          }
          gh = lockedH
        }
      }

      const scaleX = gw / Math.max(1, current.initialGroup.width)
      const scaleY = gh / Math.max(1, current.initialGroup.height)

      setHudPink(false)
      setHudText(`${Math.round(gw)} × ${Math.round(gh)}`)

      updateNodes(
        current.ids,
        (node) => {
          const init = current.initialNodes[node.id]
          if (!init) return {}
          const newAbsX = gx + (init.absX - current.initialGroup.x) * scaleX
          const newAbsY = gy + (init.absY - current.initialGroup.y) * scaleY
          const parentOffsetX = init.absX - init.x
          const parentOffsetY = init.absY - init.y
          return {
            x: Math.round(newAbsX - parentOffsetX),
            y: Math.round(newAbsY - parentOffsetY),
            width: Math.max(4, Math.round(init.width * scaleX)),
            height: Math.max(4, Math.round(init.height * scaleY)),
          }
        },
        false
      )
      return
    }

    if (current.kind === "rotate") {
      const angle = Math.atan2(pt.y - current.center.y, pt.x - current.center.x)
      let deg = current.initialRotation + ((angle - current.startAngle) * 180) / Math.PI
      if (e.shiftKey) deg = Math.round(deg / 15) * 15
      const rounded = Math.round(deg)
      setHudPink(false)
      setHudText(`${rounded}°`)
      updateNodes([current.nodeId], { rotation: rounded }, false)
      return
    }

    if (current.kind === "marquee") {
      current.currentCanvas = pt
      const box: Bounds = {
        x: Math.min(current.startCanvas.x, pt.x),
        y: Math.min(current.startCanvas.y, pt.y),
        width: Math.abs(pt.x - current.startCanvas.x),
        height: Math.abs(pt.y - current.startCanvas.y),
      }
      setMarquee(box)
      const hits = activePage.order.filter((id) => {
        const node = activePage.nodes[id]
        if (!node || !node.visible || node.locked) return false
        return rectsIntersect(box, getAbsoluteBounds(node, activePage.nodes))
      })
      setSelectedIds(hits)
      return
    }

    if (current.kind === "draw") {
      let width = pt.x - current.startCanvas.x
      let height = pt.y - current.startCanvas.y
      if (e.shiftKey) {
        if (current.nodeType === "line") {
          const snapped = snapPenAngle(current.startCanvas, pt)
          width = snapped.x - current.startCanvas.x
          height = snapped.y - current.startCanvas.y
        } else {
          const side = Math.max(Math.abs(width), Math.abs(height))
          width = Math.sign(width || 1) * side
          height = Math.sign(height || 1) * side
        }
      }
      let left: number
      let top: number
      let finalW: number
      let finalH: number
      if (e.altKey) {
        finalW = Math.abs(width) * 2
        finalH = Math.abs(height) * 2
        left = current.startCanvas.x - Math.abs(width)
        top = current.startCanvas.y - Math.abs(height)
      } else {
        left = width >= 0 ? current.startCanvas.x : current.startCanvas.x + width
        top = height >= 0 ? current.startCanvas.y : current.startCanvas.y + height
        finalW = Math.abs(width)
        finalH = Math.abs(height)
      }
      const wRounded = Math.max(2, Math.round(finalW))
      const hRounded = Math.max(2, Math.round(finalH))
      setHudPink(false)
      setHudText(`${wRounded} × ${hRounded}`)
      updateNodes(
        [current.nodeId],
        {
          x: Math.round(left - current.parentOffset.x),
          y: Math.round(top - current.parentOffset.y),
          width: wRounded,
          height: hRounded,
        },
        false
      )
      return
    }

    if (current.kind === "comment-drag") {
      const dx = pt.x - current.startCanvas.x
      const dy = pt.y - current.startCanvas.y
      if (!current.moved && Math.hypot(dx, dy) < 2) return
      if (!current.moved) {
        current.moved = true
        commitCheckpoint()
        containerRef.current?.setPointerCapture?.(current.pointerId)
      }
      const nextWorldX = current.startWorld.x + dx
      const nextWorldY = current.startWorld.y + dy
      const targetFrame = findEnclosingFrame({ x: nextWorldX, y: nextWorldY })
      setDropTargetId(targetFrame?.id ?? null)
      const parentBounds = targetFrame
        ? getAbsoluteBounds(targetFrame, activePage.nodes)
        : { x: 0, y: 0 }
      moveComment(
        current.commentId,
        nextWorldX - parentBounds.x,
        nextWorldY - parentBounds.y,
        targetFrame?.id ?? null
      )
      return
    }

    if (current.kind === "pen-handle") {
      const dist = Math.hypot(pt.x - current.anchor.x, pt.y - current.anchor.y)
      if (!current.dragged && dist < 3 / doc.viewport.zoom) return
      current.dragged = true
      const sess = penSessionRef.current
      if (!sess || sess.nodeId !== current.nodeId) return
      const handleOut: Point = { x: pt.x, y: pt.y }
      const handleIn: Point = {
        x: current.anchor.x * 2 - pt.x,
        y: current.anchor.y * 2 - pt.y,
      }
      const nextPts = sess.points.map((bp, idx) =>
        idx === current.vertexIndex ? { ...bp, handleIn, handleOut } : bp
      )
      setPenSession({ ...sess, points: nextPts })
      syncBezierPenNode(current.nodeId, nextPts, current.parentOffset, false)
      return
    }

    if (current.kind === "pencil-stroke") {
      const last = current.rawPoints[current.rawPoints.length - 1]
      if (Math.hypot(pt.x - last.x, pt.y - last.y) < 3) return
      current.rawPoints.push(pt)
      syncPencilStrokeNode(current.nodeId, current.rawPoints, current.parentOffset)
    }
  }

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    const current = interactionRef.current
    if (!current) return

    if (current.kind === "pan") {
      setIsPanning(false)
    }

    if (current.kind === "guide") {
      if (current.moved) {
        const rect = containerRef.current?.getBoundingClientRect()
        const localX = rect ? e.clientX - rect.left : 999
        const localY = rect ? e.clientY - rect.top : 999
        const overRuler = doc.showRulers && (localX < 20 || localY < 20)
        if (overRuler) {
          if (current.guideId) {
            removeGuide(current.guideId)
            toast("Removed ruler guide")
          }
        } else if (!current.guideId) {
          addGuide(current.axis, current.position)
        }
      }
      setGuidePreview(null)
    }

    if (current.kind === "move" && current.moved && current.ids.length === 1) {
      const movedId = current.ids[0]
      const movedNode = activePage.nodes[movedId]
      if (dropTargetId) {
        reparentNode(movedId, dropTargetId)
      } else if (movedNode?.parentId) {
        // Auto-unparent when dragged completely outside its parent frame onto root canvas
        const parent = activePage.nodes[movedNode.parentId]
        if (parent) {
          const movedAbs = getAbsoluteBounds(movedNode, activePage.nodes)
          const parentAbs = getAbsoluteBounds(parent, activePage.nodes)
          const cx = movedAbs.x + movedAbs.width / 2
          const cy = movedAbs.y + movedAbs.height / 2
          const stillInside =
            cx >= parentAbs.x &&
            cx <= parentAbs.x + parentAbs.width &&
            cy >= parentAbs.y &&
            cy <= parentAbs.y + parentAbs.height
          if (!stillInside) {
            reparentNode(movedId, null)
          }
        }
      }
    }

    if (current.kind === "draw") {
      const created = activePage.nodes[current.nodeId]
      if (created && created.width < 6 && created.height < 6) {
        updateNodes(
          [current.nodeId],
          {
            width: current.nodeType === "section" ? 440 : current.nodeType === "frame" ? 320 : 120,
            height:
              current.nodeType === "section"
                ? 300
                : current.nodeType === "frame"
                  ? 220
                  : current.nodeType === "line"
                    ? 2
                    : 100,
          },
          false
        )
      }
      setTool("select")
    }

    if (current.kind === "comment-drag" && current.moved) {
      suppressCommentClickRef.current = true
    }

    if (current.kind === "pencil-stroke") {
      if (current.rawPoints.length < 2) {
        deleteSelection([current.nodeId])
      }
    }

    interactionRef.current = null
    setGuides([])
    setMarquee(null)
    setDropTargetId(null)
    setHudText(null)
    setHudPink(false)
  }

  const handleDropFiles = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragOverFile(false)
    const file = Array.from(e.dataTransfer.files).find((f) => f.type.startsWith("image/"))
    if (!file) return
    const pt = clientToCanvas(e.clientX, e.clientY)
    await insertImageFromFile(file, pt)
    toast(`Placed image "${file.name}"`)
  }

  const rootIds = React.useMemo(
    () =>
      activePage.order.filter((id) => {
        const node = activePage.nodes[id]
        return node && (!node.parentId || !activePage.nodes[node.parentId])
      }),
    [activePage]
  )

  const childrenByParent = React.useMemo(() => {
    const map = new Map<string, DesignNode[]>()
    for (const id of activePage.order) {
      const node = activePage.nodes[id]
      if (!node || !node.parentId) continue
      const list = map.get(node.parentId) ?? []
      list.push(node)
      map.set(node.parentId, list)
    }
    return map
  }, [activePage])

  const measureLines = React.useMemo<MeasureLine[]>(() => {
    if ((!altPressed && !doc.devMode) || doc.selectedIds.length === 0) return []
    const selBounds = getSelectionBounds(doc.selectedIds, activePage.nodes)
    if (!selBounds) return []
    let targetNode: DesignNode | undefined
    if (hoveredId && !doc.selectedIds.includes(hoveredId)) {
      targetNode = activePage.nodes[hoveredId]
    } else if (altPressed && selectedNodes.length === 1 && selectedNodes[0].parentId) {
      targetNode = activePage.nodes[selectedNodes[0].parentId]
    }
    if (!targetNode) return []
    return computeMeasureLines(selBounds, getAbsoluteBounds(targetNode, activePage.nodes))
  }, [altPressed, doc.devMode, doc.selectedIds, hoveredId, activePage.nodes, selectedNodes])

  const hoverColor = doc.devMode ? "#14ae5c" : "#0d99ff"

  const renderNode = (node: DesignNode): React.ReactNode => {
    if (!node.visible) return null
    const isSelected = doc.selectedIds.includes(node.id)
    const isHovered = hoveredId === node.id && !isSelected && doc.tool === "select"
    const isEditing = editingTextId === node.id
    const isComponent = node.type === "component" || node.type === "instance"
    const isSection = node.type === "section"
    const isDropTarget = dropTargetId === node.id
    const isRenamingLabel = renamingLabelId === node.id
    const children = childrenByParent.get(node.id) ?? []

    const fx = effectsToCss(node.effects)
    const stroke = primaryStroke(node, doc.variables)
    const flipTransform = [
      node.rotation ? `rotate(${node.rotation}deg)` : "",
      node.flipX ? "scaleX(-1)" : "",
      node.flipY ? "scaleY(-1)" : "",
    ]
      .filter(Boolean)
      .join(" ")

    const commonStyle: React.CSSProperties = {
      position: "absolute",
      left: node.x,
      top: node.y,
      width: node.width,
      height: node.height,
      transform: flipTransform || undefined,
      opacity: node.opacity,
      mixBlendMode: node.blendMode,
      filter: fx.filter,
      backdropFilter: fx.backdropFilter,
      boxShadow:
        node.type !== "polygon" && node.type !== "star" && node.type !== "path"
          ? fx.boxShadow
          : undefined,
      cursor:
        isPanning
          ? "grabbing"
          : doc.tool === "hand" || spacePressed
            ? "grab"
            : doc.tool === "eyedropper"
              ? "crosshair"
              : doc.tool === "comment"
                ? "crosshair"
                : doc.tool === "select"
                  ? node.locked
                    ? "not-allowed"
                    : "default"
                  : "crosshair",
    }

    const accentHex = doc.devMode ? "#14ae5c" : isComponent ? "#9747ff" : "#0d99ff"

    if (
      node.type === "frame" ||
      node.type === "section" ||
      node.type === "component" ||
      node.type === "instance"
    ) {
      const radius = cornerRadiusCss(node)
      const isTopLevel = !node.parentId
      return (
        <div
          key={node.id}
          data-node-id={node.id}
          style={{
            ...commonStyle,
            background: nodeBackgroundCss(node, doc.variables),
            border: stroke ? `${stroke.width}px ${stroke.style} ${stroke.color}` : undefined,
            borderRadius: radius,
          }}
          onPointerDown={(e) => handleNodePointerDown(e, node)}
          onDoubleClick={(e) => {
            if (doc.tool !== "select" || doc.devMode) return
            e.stopPropagation()
            const pt = clientToCanvas(e.clientX, e.clientY)
            const hit = hitTestTopNode(pt)
            if (hit && hit.id !== node.id && !hit.locked) {
              setSelectedIds([hit.id])
              if (hit.type === "text") {
                commitCheckpoint()
                setEditingTextId(hit.id)
              }
            }
          }}
          onPointerEnter={(e) => {
            e.stopPropagation()
            setHoveredId(node.id)
          }}
          onPointerLeave={() => setHoveredId((prev) => (prev === node.id ? null : prev))}
        >
          {(isTopLevel || isComponent || isSection) && (
            <div
              onPointerDown={(e) => handleNodePointerDown(e, node)}
              onDoubleClick={(e) => {
                e.stopPropagation()
                if (!node.locked && !doc.devMode) {
                  setSelectedIds([node.id])
                  setRenamingLabelId(node.id)
                  setRenamingLabelDraft(node.name)
                }
              }}
              style={
                isSection
                  ? {
                      position: "absolute",
                      left: 0,
                      top: -28 / doc.viewport.zoom,
                      fontSize: 11 / doc.viewport.zoom,
                      padding: `${3 / doc.viewport.zoom}px ${8 / doc.viewport.zoom}px`,
                      borderRadius: 6 / doc.viewport.zoom,
                      background: isSelected ? "#0d99ff" : "#3a3a3a",
                      color: "#ffffff",
                      fontWeight: 600,
                      whiteSpace: "nowrap",
                      userSelect: "none",
                    }
                  : {
                      position: "absolute",
                      left: 0,
                      top: -20 / doc.viewport.zoom,
                      fontSize: 11 / doc.viewport.zoom,
                      lineHeight: 1.2,
                      whiteSpace: "nowrap",
                      color: isComponent
                        ? "#c084fc"
                        : isSelected
                          ? accentHex
                          : "#9e9e9e",
                      fontWeight: 500,
                      userSelect: "none",
                      display: "flex",
                      alignItems: "center",
                      gap: 4 / doc.viewport.zoom,
                    }
              }
            >
              {node.type === "component" && <span aria-hidden="true">❖</span>}
              {node.type === "instance" && <span aria-hidden="true">◇</span>}
              {isRenamingLabel ? (
                <input
                  aria-label={`Rename ${node.name} on canvas`}
                  autoFocus
                  value={renamingLabelDraft}
                  onChange={(e) => setRenamingLabelDraft(e.target.value)}
                  onPointerDown={(e) => e.stopPropagation()}
                  onDoubleClick={(e) => e.stopPropagation()}
                  onBlur={commitCanvasLabelRename}
                  onKeyDown={(e) => {
                    e.stopPropagation()
                    if (e.key === "Enter") commitCanvasLabelRename()
                    if (e.key === "Escape") setRenamingLabelId(null)
                  }}
                  style={{
                    fontSize: "inherit",
                    fontWeight: "inherit",
                    color: "#ffffff",
                    background: "#1e1e1e",
                    border: `${1 / doc.viewport.zoom}px solid #0d99ff`,
                    borderRadius: 3 / doc.viewport.zoom,
                    padding: `${1 / doc.viewport.zoom}px ${4 / doc.viewport.zoom}px`,
                    outline: "none",
                    minWidth: 80 / doc.viewport.zoom,
                  }}
                />
              ) : (
                <span>{node.name}</span>
              )}
            </div>
          )}
          <div
            style={{
              position: "relative",
              width: "100%",
              height: "100%",
              borderRadius: radius,
              overflow: node.clipContent ? "hidden" : "visible",
            }}
          >
            {children.map((child) => renderNode(child))}
          </div>
          {(isHovered || isDropTarget) && (
            <div
              className="pointer-events-none absolute inset-0"
              style={{
                borderRadius: radius,
                outline: `${(isDropTarget ? 2 : modPressed ? 1.5 : 1) / doc.viewport.zoom}px ${isDropTarget ? "dashed" : "solid"} ${accentHex}`,
                background: isDropTarget ? "rgba(13, 153, 255, 0.08)" : undefined,
              }}
            />
          )}
        </div>
      )
    }

    if (node.type === "rectangle" || node.type === "ellipse" || node.type === "image") {
      return (
        <div
          key={node.id}
          data-node-id={node.id}
          style={{
            ...commonStyle,
            background: nodeBackgroundCss(node, doc.variables),
            border: stroke ? `${stroke.width}px ${stroke.style} ${stroke.color}` : undefined,
            borderRadius: cornerRadiusCss(node),
            outline: isHovered ? `${1 / doc.viewport.zoom}px solid ${hoverColor}` : undefined,
          }}
          onPointerDown={(e) => handleNodePointerDown(e, node)}
          onDoubleClick={(e) => {
            e.stopPropagation()
            if (!node.locked) setSelectedIds([node.id])
          }}
          onPointerEnter={(e) => {
            e.stopPropagation()
            setHoveredId(node.id)
          }}
          onPointerLeave={() => setHoveredId((prev) => (prev === node.id ? null : prev))}
        />
      )
    }

    if (node.type === "text") {
      return (
        <div
          key={node.id}
          data-node-id={node.id}
          style={{
            ...commonStyle,
            color: primaryFillColor(node, doc.variables),
            fontFamily: `"${node.fontFamily ?? "Inter"}", sans-serif`,
            fontSize: node.fontSize ?? 16,
            fontWeight: node.fontWeight ?? 400,
            textAlign: node.textAlign ?? "left",
            textTransform: node.textTransform ?? "none",
            textDecoration: node.textDecoration ?? "none",
            lineHeight: node.lineHeight ?? 1.4,
            letterSpacing: node.letterSpacing ? `${node.letterSpacing}px` : undefined,
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
            outline: isHovered ? `${1 / doc.viewport.zoom}px solid ${hoverColor}` : undefined,
          }}
          onPointerDown={(e) => handleNodePointerDown(e, node)}
          onDoubleClick={(e) => {
            e.stopPropagation()
            if (!node.locked && !doc.devMode) {
              setSelectedIds([node.id])
              commitCheckpoint()
              setEditingTextId(node.id)
            }
          }}
          onPointerEnter={(e) => {
            e.stopPropagation()
            setHoveredId(node.id)
          }}
          onPointerLeave={() => setHoveredId((prev) => (prev === node.id ? null : prev))}
        >
          {isEditing ? (
            <textarea
              aria-label={`Edit text ${node.name}`}
              autoFocus
              value={node.text ?? ""}
              onChange={(e) => {
                const nextText = e.target.value
                const neededH = Math.max(node.height, e.currentTarget.scrollHeight)
                updateNodes(
                  [node.id],
                  neededH > node.height ? { text: nextText, height: neededH } : { text: nextText },
                  false
                )
              }}
              onBlur={() => setEditingTextId(null)}
              onPointerDown={(e) => e.stopPropagation()}
              onKeyDown={(e) => {
                e.stopPropagation()
                if (e.key === "Escape" || ((e.metaKey || e.ctrlKey) && e.key === "Enter")) {
                  setEditingTextId(null)
                }
              }}
              style={{
                width: "100%",
                height: "100%",
                resize: "none",
                background: "rgba(13, 153, 255, 0.08)",
                outline: `${1.5 / doc.viewport.zoom}px solid #0d99ff`,
                border: 0,
                padding: 0,
                margin: 0,
                color: "inherit",
                font: "inherit",
                textAlign: "inherit",
                lineHeight: "inherit",
                letterSpacing: "inherit",
              }}
            />
          ) : (
            node.text
          )}
        </div>
      )
    }

    const svgFill = primaryFillColor(node, doc.variables)
    return (
      <svg
        key={node.id}
        data-node-id={node.id}
        width={Math.max(1, node.width)}
        height={Math.max(1, node.height)}
        viewBox={`0 0 ${Math.max(1, node.width)} ${Math.max(1, node.height)}`}
        style={{
          ...commonStyle,
          overflow: "visible",
          outline: isHovered ? `${1.5 / doc.viewport.zoom}px solid ${hoverColor}` : undefined,
        }}
        onPointerDown={(e) => handleNodePointerDown(e, node)}
        onPointerEnter={(e) => {
          e.stopPropagation()
          setHoveredId(node.id)
        }}
        onPointerLeave={() => setHoveredId((prev) => (prev === node.id ? null : prev))}
      >
        {node.type === "line" && (
          <line
            x1={0}
            y1={0}
            x2={node.width}
            y2={node.height}
            stroke={stroke ? stroke.color : svgFill}
            strokeWidth={Math.max(1, stroke?.width ?? 2)}
            strokeDasharray={stroke?.style === "dashed" ? "6 4" : undefined}
            strokeLinecap="round"
          />
        )}
        {node.type === "polygon" && (
          <polygon
            points={getPolygonPoints(node.width, node.height, node.polygonSides ?? 3)}
            fill={svgFill}
            stroke={stroke ? stroke.color : "none"}
            strokeWidth={stroke?.width ?? 0}
            strokeDasharray={stroke?.style === "dashed" ? "6 4" : undefined}
          />
        )}
        {node.type === "star" && (
          <polygon
            points={getStarPoints(node.width, node.height, node.starPoints ?? 5)}
            fill={svgFill}
            stroke={stroke ? stroke.color : "none"}
            strokeWidth={stroke?.width ?? 0}
            strokeDasharray={stroke?.style === "dashed" ? "6 4" : undefined}
          />
        )}
        {node.type === "path" && (
          <path
            d={buildVectorPathD(node)}
            fill={node.closed && node.fills.some((f) => f.visible) ? svgFill : "none"}
            stroke={stroke ? stroke.color : svgFill}
            strokeWidth={Math.max(2, stroke?.width ?? 2.5)}
            strokeDasharray={stroke?.style === "dashed" ? "6 4" : undefined}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}
      </svg>
    )
  }

  const selectionBounds = React.useMemo(
    () => getSelectionBounds(doc.selectedIds, activePage.nodes),
    [doc.selectedIds, activePage.nodes]
  )

  const rulerStep = doc.viewport.zoom >= 1.8 ? 25 : doc.viewport.zoom >= 0.7 ? 50 : 100
  const horizontalTicks = React.useMemo(() => {
    if (!doc.showRulers) return []
    const start = Math.floor(-doc.viewport.x / doc.viewport.zoom / rulerStep) * rulerStep
    const end =
      Math.ceil((canvasSize.width - doc.viewport.x) / doc.viewport.zoom / rulerStep) * rulerStep
    const ticks: { val: number; pos: number }[] = []
    for (let v = start; v <= end; v += rulerStep) {
      ticks.push({ val: v, pos: v * doc.viewport.zoom + doc.viewport.x })
    }
    return ticks
  }, [doc.showRulers, doc.viewport.x, doc.viewport.zoom, rulerStep, canvasSize.width])

  const verticalTicks = React.useMemo(() => {
    if (!doc.showRulers) return []
    const start = Math.floor(-doc.viewport.y / doc.viewport.zoom / rulerStep) * rulerStep
    const end =
      Math.ceil((canvasSize.height - doc.viewport.y) / doc.viewport.zoom / rulerStep) * rulerStep
    const ticks: { val: number; pos: number }[] = []
    for (let v = start; v <= end; v += rulerStep) {
      ticks.push({ val: v, pos: v * doc.viewport.zoom + doc.viewport.y })
    }
    return ticks
  }, [doc.showRulers, doc.viewport.y, doc.viewport.zoom, rulerStep, canvasSize.height])

  const gridSpacing = Math.max(12, 24 * doc.viewport.zoom)
  const rulerOffset = doc.showRulers ? 20 : 0
  const primarySingle = selectedNodes.length === 1 ? selectedNodes[0] : null
  const primaryIsComponent =
    primarySingle && (primarySingle.type === "component" || primarySingle.type === "instance")
  const selectionStrokeColor = doc.devMode
    ? "#14ae5c"
    : primaryIsComponent
      ? "#9747ff"
      : "#0d99ff"
  const isCursorNearSelection = Boolean(
    selectionBounds &&
      cursorCanvas &&
      cursorCanvas.x >= selectionBounds.x - 14 / doc.viewport.zoom &&
      cursorCanvas.x <= selectionBounds.x + selectionBounds.width + 14 / doc.viewport.zoom &&
      cursorCanvas.y >= selectionBounds.y - 14 / doc.viewport.zoom &&
      cursorCanvas.y <= selectionBounds.y + selectionBounds.height + 14 / doc.viewport.zoom
  )
  const showCornerRadiusHandle =
    Boolean(
      primarySingle &&
        !primarySingle.locked &&
        !doc.devMode &&
        (primarySingle.type === "rectangle" ||
          primarySingle.type === "frame" ||
          primarySingle.type === "image") &&
        primarySingle.width * doc.viewport.zoom >= 64 &&
        primarySingle.height * doc.viewport.zoom >= 64
    )

  // Auto Layout interactive on-canvas spacing overlays (padding bands + gap bars)
  const showAutoLayoutOverlay = Boolean(
    primarySingle &&
      !primarySingle.locked &&
      !doc.devMode &&
      !editingTextId &&
      primarySingle.layout &&
      primarySingle.layout.mode !== "none" &&
      (isCursorNearSelection || hudPink || alInlineEdit?.nodeId === primarySingle.id)
  )

  const autoLayoutFlowChildren = React.useMemo(() => {
    if (!primarySingle?.layout || primarySingle.layout.mode === "none") return []
    const kids = (childrenByParent.get(primarySingle.id) ?? []).filter(
      (c) => c.visible && !c.layoutAbsolute
    )
    return kids
  }, [primarySingle, childrenByParent])

  const unresolvedComments = (activePage.comments ?? []).filter((c) => !c.resolved)
  const pageGuides = activePage.guides ?? []

  const handleContextAction = (action: string) => {
    switch (action) {
      case "copy":
        copySelection()
        toast("Copied selection")
        break
      case "paste":
        pasteClipboard()
        break
      case "duplicate":
        duplicateSelection()
        break
      case "frame":
        frameSelection()
        break
      case "auto-layout":
        toggleAutoLayout()
        break
      case "ungroup":
        ungroupSelection()
        break
      case "create-component":
        createComponentFromSelection()
        toast("Created component")
        break
      case "detach-instance":
        detachInstance()
        toast("Detached instance")
        break
      case "flip-h":
        flipSelection("horizontal")
        break
      case "flip-v":
        flipSelection("vertical")
        break
      case "front":
        reorderZOrder("front")
        break
      case "back":
        reorderZOrder("back")
        break
      case "toggle-lock":
        if (selectedNodes[0]) {
          updateNodes(doc.selectedIds, { locked: !selectedNodes[0].locked })
        }
        break
      case "toggle-hide":
        if (selectedNodes[0]) {
          updateNodes(doc.selectedIds, { visible: !selectedNodes[0].visible })
        }
        break
      case "delete":
        deleteSelection()
        break
      case "zoom-selection":
        zoomToSelection(canvasSize.width, canvasSize.height)
        break
      case "zoom-fit":
        zoomToFit(canvasSize.width, canvasSize.height)
        break
      case "clear-guides":
        clearGuides()
        toast("Cleared ruler guides")
        break
    }
  }

  // Pen rubber-band preview point
  const penPreviewTarget = React.useMemo(() => {
    if (!penSession || !cursorCanvas || penSession.points.length === 0) return null
    const last = penSession.points[penSession.points.length - 1]
    const first = penSession.points[0]
    if (
      penSession.points.length >= 3 &&
      Math.hypot(cursorCanvas.x - first.x, cursorCanvas.y - first.y) <= 10 / doc.viewport.zoom
    ) {
      return { pt: first, closing: true }
    }
    return { pt: shiftPressed ? snapPenAngle(last, cursorCanvas) : cursorCanvas, closing: false }
  }, [penSession, cursorCanvas, shiftPressed, doc.viewport.zoom])

  return (
    <Menu onAction={handleContextAction}>
      <MenuContextTrigger
        ref={containerRef}
        tabIndex={0}
        aria-label="Design canvas"
        onPointerDown={handleCanvasPointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onDoubleClick={() => {
          if (penSession) {
            setPenSession(null)
            setTool("select")
          }
        }}
        onPointerLeave={() => {
          setCursorCanvas(null)
          setCursorClient(null)
        }}
        onDragOver={(e) => {
          e.preventDefault()
          setIsDragOverFile(true)
        }}
        onDragLeave={() => setIsDragOverFile(false)}
        onDrop={(e) => void handleDropFiles(e)}
        className="relative h-full w-full touch-none overflow-hidden outline-none"
        style={{
          backgroundColor: activePage.background || "#1e1e1e",
          cursor: isPanning
            ? "grabbing"
            : doc.tool === "hand" || spacePressed
              ? "grab"
              : doc.tool === "select"
                ? "default"
                : "crosshair",
        }}
      >
        {doc.showGrid && (
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0"
            style={{
              left: rulerOffset,
              top: rulerOffset,
              backgroundImage:
                "radial-gradient(circle, rgba(255, 255, 255, 0.14) 1px, transparent 1px)",
              backgroundSize: `${gridSpacing}px ${gridSpacing}px`,
              backgroundPosition: `${doc.viewport.x % gridSpacing}px ${doc.viewport.y % gridSpacing}px`,
            }}
          />
        )}

        <div
          className="absolute inset-0 overflow-hidden"
          style={{ left: rulerOffset, top: rulerOffset }}
        >
          <div
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              transform: `translate(${doc.viewport.x}px, ${doc.viewport.y}px) scale(${doc.viewport.zoom})`,
              transformOrigin: "0 0",
            }}
          >
            {rootIds.map((id) => renderNode(activePage.nodes[id]))}

            {unresolvedComments.map((comment, idx) => {
              const parentNode = comment.parentId ? activePage.nodes[comment.parentId] : null
              const parentAbs = parentNode
                ? getAbsolutePosition(parentNode, activePage.nodes)
                : { x: 0, y: 0 }
              const worldX = parentAbs.x + comment.x
              const worldY = parentAbs.y + comment.y
              return (
                <CommentPin
                  key={comment.id}
                  comment={comment}
                  worldX={worldX}
                  worldY={worldY}
                  parentName={parentNode?.name ?? null}
                  index={idx}
                  zoom={doc.viewport.zoom}
                  onPinPointerDown={(e) => {
                    if (e.button !== 0) return
                    e.stopPropagation()
                    interactionRef.current = {
                      kind: "comment-drag",
                      commentId: comment.id,
                      pointerId: e.pointerId,
                      startCanvas: clientToCanvas(e.clientX, e.clientY),
                      startWorld: { x: worldX, y: worldY },
                      moved: false,
                    }
                  }}
                  onPinClick={(e) => {
                    if (suppressCommentClickRef.current) {
                      suppressCommentClickRef.current = false
                      e.preventDefault()
                      e.stopPropagation()
                    }
                  }}
                  onReply={(text) => replyComment(comment.id, text)}
                  onResolve={() => {
                    toggleResolveComment(comment.id)
                    toast("Resolved comment")
                  }}
                  onDelete={() => {
                    deleteComment(comment.id)
                    toast("Deleted comment")
                  }}
                />
              )
            })}

            {/* Inline Comment Composer when placing a comment with Comment tool (C) */}
            {pendingComment && (
              <div
                style={{
                  position: "absolute",
                  left: pendingComment.worldX,
                  top: pendingComment.worldY,
                  transform: `scale(${1 / doc.viewport.zoom}) translate(0, -100%)`,
                  transformOrigin: "0 100%",
                  zIndex: 35,
                }}
                onPointerDown={(e) => e.stopPropagation()}
                className="flex items-start gap-2"
              >
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full rounded-bl-none border-2 border-white bg-[var(--color-bg-brand)] text-[11px] font-bold text-white shadow-lg">
                  +
                </span>
                <form
                  onSubmit={(e) => {
                    e.preventDefault()
                    const text = pendingComment.text.trim()
                    if (!text) return
                    const parentNode = pendingComment.parentId
                      ? activePage.nodes[pendingComment.parentId]
                      : null
                    const parentAbs = parentNode
                      ? getAbsolutePosition(parentNode, activePage.nodes)
                      : { x: 0, y: 0 }
                    addComment(
                      pendingComment.worldX - parentAbs.x,
                      pendingComment.worldY - parentAbs.y,
                      text,
                      parentNode?.id ?? null
                    )
                    setPendingComment(null)
                    setTool("select")
                    toast(
                      parentNode
                        ? `Pinned comment to ${parentNode.name}`
                        : "Added comment on canvas"
                    )
                  }}
                  className="flex w-[240px] flex-col gap-1.5 rounded-[8px] border border-[var(--color-border)] bg-[var(--color-bg-elevated)] p-2.5 shadow-[var(--ui-shadow)]"
                >
                  {pendingComment.parentName && (
                    <span className="text-[10px] font-medium text-[var(--color-text-brand)]">
                      Pinning to {pendingComment.parentName}
                    </span>
                  )}
                  <div className="flex items-center gap-1.5">
                    <Input
                      aria-label="New comment text"
                      autoFocus
                      value={pendingComment.text}
                      onValueChange={(next) =>
                        setPendingComment((prev) => (prev ? { ...prev, text: next } : null))
                      }
                      onKeyDown={(e) => {
                        e.stopPropagation()
                        if (e.key === "Escape") {
                          setPendingComment(null)
                          setTool("select")
                        }
                      }}
                      placeholder="Add a comment…"
                      className="h-6 flex-1 border-[var(--color-border)] bg-[var(--color-bg-secondary)] px-2 text-[11px]"
                    />
                    <Button
                      type="submit"
                      aria-label="Post comment"
                      disabled={!pendingComment.text.trim()}
                      className="!h-6 !w-6 shrink-0 border-transparent bg-[var(--color-bg-brand)] !p-0 text-white hover:bg-[var(--color-bg-brand-hover)] disabled:opacity-40"
                    >
                      <SendIcon aria-hidden="true" className="h-3 w-3" />
                    </Button>
                  </div>
                </form>
              </div>
            )}

            {/* Individual outlines for multi-selection (2+ selected nodes) */}
            {selectedNodes.length > 1 &&
              selectedNodes.map((n) => {
                const abs = getAbsoluteBounds(n, activePage.nodes)
                return (
                  <div
                    key={`sel-${n.id}`}
                    aria-hidden="true"
                    className="pointer-events-none absolute"
                    style={{
                      left: abs.x,
                      top: abs.y,
                      width: abs.width,
                      height: abs.height,
                      outline: `${1 / doc.viewport.zoom}px solid ${selectionStrokeColor}`,
                      transform: n.rotation ? `rotate(${n.rotation}deg)` : undefined,
                    }}
                  />
                )
              })}

            {/* Snap alignment guides */}
            {guides.map((guide, i) =>
              guide.orientation === "vertical" ? (
                <div
                  key={`v-${i}`}
                  aria-hidden="true"
                  className="pointer-events-none absolute"
                  style={{
                    left: guide.position,
                    top: guide.start,
                    width: 1 / doc.viewport.zoom,
                    height: guide.end - guide.start,
                    background: "#ff3366",
                  }}
                />
              ) : (
                <div
                  key={`h-${i}`}
                  aria-hidden="true"
                  className="pointer-events-none absolute"
                  style={{
                    left: guide.start,
                    top: guide.position,
                    height: 1 / doc.viewport.zoom,
                    width: guide.end - guide.start,
                    background: "#ff3366",
                  }}
                />
              )
            )}

            {/* Distance measurement redlines (Alt + Hover or Dev Mode) */}
            {measureLines.map((line, i) => {
              const midX = (line.x1 + line.x2) / 2
              const midY = (line.y1 + line.y2) / 2
              return (
                <React.Fragment key={`m-${i}`}>
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute"
                    style={
                      line.orientation === "horizontal"
                        ? {
                            left: Math.min(line.x1, line.x2),
                            top: line.y1,
                            width: Math.abs(line.x2 - line.x1),
                            height: 1 / doc.viewport.zoom,
                            background: "#f24822",
                          }
                        : {
                            left: line.x1,
                            top: Math.min(line.y1, line.y2),
                            width: 1 / doc.viewport.zoom,
                            height: Math.abs(line.y2 - line.y1),
                            background: "#f24822",
                          }
                    }
                  />
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute rounded bg-[#f24822] px-1 font-mono font-semibold text-white"
                    style={{
                      left: midX,
                      top: midY,
                      transform: "translate(-50%, -50%)",
                      fontSize: 9.5 / doc.viewport.zoom,
                      lineHeight: 1.4,
                    }}
                  >
                    {line.distance}
                  </div>
                </React.Fragment>
              )
            })}

            {/* Bézier Pen vector editing overlay (handles, curve preview, vertices) */}
            {penSession && penSession.points.length > 0 && (
              <svg
                aria-hidden="true"
                className="pointer-events-none absolute overflow-visible"
                style={{ left: 0, top: 0, width: 1, height: 1, zIndex: 30 }}
              >
                {penPreviewTarget && (() => {
                  const last = penSession.points[penSession.points.length - 1]
                  const first = penSession.points[0]
                  const target = penPreviewTarget.pt
                  const d =
                    last.handleOut || (penPreviewTarget.closing && first.handleIn)
                      ? `M${last.x} ${last.y} C${(last.handleOut ?? last).x} ${(last.handleOut ?? last).y} ${(penPreviewTarget.closing && first.handleIn ? first.handleIn : target).x} ${(penPreviewTarget.closing && first.handleIn ? first.handleIn : target).y} ${target.x} ${target.y}`
                      : `M${last.x} ${last.y} L${target.x} ${target.y}`
                  return (
                    <path
                      d={d}
                      fill="none"
                      stroke="#0d99ff"
                      strokeWidth={1.25 / doc.viewport.zoom}
                      strokeDasharray={`${4 / doc.viewport.zoom} ${3 / doc.viewport.zoom}`}
                    />
                  )
                })()}
                {penSession.points.map((pt, idx) => (
                  <React.Fragment key={`pen-v-${idx}`}>
                    {pt.handleIn && (
                      <>
                        <line
                          x1={pt.x}
                          y1={pt.y}
                          x2={pt.handleIn.x}
                          y2={pt.handleIn.y}
                          stroke="#80caff"
                          strokeWidth={1 / doc.viewport.zoom}
                        />
                        <circle
                          cx={pt.handleIn.x}
                          cy={pt.handleIn.y}
                          r={3 / doc.viewport.zoom}
                          fill="#ffffff"
                          stroke="#0d99ff"
                          strokeWidth={1.25 / doc.viewport.zoom}
                        />
                      </>
                    )}
                    {pt.handleOut && (
                      <>
                        <line
                          x1={pt.x}
                          y1={pt.y}
                          x2={pt.handleOut.x}
                          y2={pt.handleOut.y}
                          stroke="#80caff"
                          strokeWidth={1 / doc.viewport.zoom}
                        />
                        <circle
                          cx={pt.handleOut.x}
                          cy={pt.handleOut.y}
                          r={3 / doc.viewport.zoom}
                          fill="#ffffff"
                          stroke="#0d99ff"
                          strokeWidth={1.25 / doc.viewport.zoom}
                        />
                      </>
                    )}
                    <circle
                      cx={pt.x}
                      cy={pt.y}
                      r={(idx === 0 && penPreviewTarget?.closing ? 5.5 : 3.5) / doc.viewport.zoom}
                      fill={idx === 0 && penPreviewTarget?.closing ? "#0d99ff" : "#ffffff"}
                      stroke="#0d99ff"
                      strokeWidth={1.5 / doc.viewport.zoom}
                    />
                  </React.Fragment>
                ))}
              </svg>
            )}

            {/* Marquee box */}
            {marquee && (
              <div
                aria-hidden="true"
                className="pointer-events-none absolute"
                style={{
                  left: marquee.x,
                  top: marquee.y,
                  width: marquee.width,
                  height: marquee.height,
                  background: "rgba(13, 153, 255, 0.14)",
                  border: `${1 / doc.viewport.zoom}px solid #0d99ff`,
                }}
              />
            )}

            {/* Selection Box, Auto Layout Handles, Corner Radius Handles, Rotate & Resize Handles */}
            {selectionBounds && !editingTextId && (
              <div
                className="pointer-events-none absolute"
                style={{
                  left: selectionBounds.x,
                  top: selectionBounds.y,
                  width: selectionBounds.width,
                  height: selectionBounds.height,
                  outline: `${1 / doc.viewport.zoom}px solid ${selectionStrokeColor}`,
                  transform:
                    primarySingle && primarySingle.rotation
                      ? `rotate(${primarySingle.rotation}deg)`
                      : undefined,
                }}
              >
                {/* Interactive On-Canvas Auto Layout Padding & Gap Scrub Handles */}
                {showAutoLayoutOverlay && primarySingle?.layout && (
                  <>
                    {(
                      [
                        {
                          side: "top" as PaddingSide,
                          field: "paddingTop" as AutoLayoutField,
                          val: primarySingle.layout.paddingTop,
                          band: {
                            left: 0,
                            top: 0,
                            width: primarySingle.width,
                            height: Math.max(0, primarySingle.layout.paddingTop),
                          },
                          handlePos: {
                            left: primarySingle.width / 2,
                            top: Math.max(6 / doc.viewport.zoom, primarySingle.layout.paddingTop / 2),
                          },
                          barW: 12,
                          barH: 2.5,
                          cursor: "ns-resize",
                        },
                        {
                          side: "bottom" as PaddingSide,
                          field: "paddingBottom" as AutoLayoutField,
                          val: primarySingle.layout.paddingBottom,
                          band: {
                            left: 0,
                            top: primarySingle.height - Math.max(0, primarySingle.layout.paddingBottom),
                            width: primarySingle.width,
                            height: Math.max(0, primarySingle.layout.paddingBottom),
                          },
                          handlePos: {
                            left: primarySingle.width / 2,
                            top:
                              primarySingle.height -
                              Math.max(6 / doc.viewport.zoom, primarySingle.layout.paddingBottom / 2),
                          },
                          barW: 12,
                          barH: 2.5,
                          cursor: "ns-resize",
                        },
                        {
                          side: "left" as PaddingSide,
                          field: "paddingLeft" as AutoLayoutField,
                          val: primarySingle.layout.paddingLeft,
                          band: {
                            left: 0,
                            top: 0,
                            width: Math.max(0, primarySingle.layout.paddingLeft),
                            height: primarySingle.height,
                          },
                          handlePos: {
                            left: Math.max(6 / doc.viewport.zoom, primarySingle.layout.paddingLeft / 2),
                            top: primarySingle.height / 2,
                          },
                          barW: 2.5,
                          barH: 12,
                          cursor: "ew-resize",
                        },
                        {
                          side: "right" as PaddingSide,
                          field: "paddingRight" as AutoLayoutField,
                          val: primarySingle.layout.paddingRight,
                          band: {
                            left: primarySingle.width - Math.max(0, primarySingle.layout.paddingRight),
                            top: 0,
                            width: Math.max(0, primarySingle.layout.paddingRight),
                            height: primarySingle.height,
                          },
                          handlePos: {
                            left:
                              primarySingle.width -
                              Math.max(6 / doc.viewport.zoom, primarySingle.layout.paddingRight / 2),
                            top: primarySingle.height / 2,
                          },
                          barW: 2.5,
                          barH: 12,
                          cursor: "ew-resize",
                        },
                      ] as const
                    ).map((p) => (
                      <React.Fragment key={p.side}>
                        {p.val > 0 && (
                          <div
                            aria-hidden="true"
                            className="pointer-events-none absolute"
                            style={{
                              left: p.band.left,
                              top: p.band.top,
                              width: p.band.width,
                              height: p.band.height,
                              background:
                                "repeating-linear-gradient(-45deg, rgba(242,72,34,0.14), rgba(242,72,34,0.14) 3px, rgba(242,72,34,0.05) 3px, rgba(242,72,34,0.05) 6px)",
                            }}
                          />
                        )}
                        <div
                          data-al-padding-handle={p.side}
                          title={`Drag to adjust ${p.side} padding (${p.val}px) · Alt: opposite · Double-click: type`}
                          onPointerDown={(e) => handlePaddingPointerDown(e, primarySingle, p.side)}
                          onDoubleClick={(e) => {
                            e.stopPropagation()
                            setAlInlineEdit({
                              nodeId: primarySingle.id,
                              field: p.field,
                              value: String(p.val),
                              x: p.handlePos.left,
                              y: p.handlePos.top,
                            })
                          }}
                          className="pointer-events-auto absolute flex items-center justify-center"
                          style={{
                            left: p.handlePos.left,
                            top: p.handlePos.top,
                            width: 18 / doc.viewport.zoom,
                            height: 18 / doc.viewport.zoom,
                            transform: "translate(-50%, -50%)",
                            cursor: p.cursor,
                            zIndex: 6,
                          }}
                        >
                          <span
                            aria-hidden="true"
                            className="block rounded-full bg-[#f24822] shadow-xs"
                            style={{
                              width: p.barW / doc.viewport.zoom,
                              height: p.barH / doc.viewport.zoom,
                            }}
                          />
                        </div>
                      </React.Fragment>
                    ))}

                    {/* Gap scrub handles between consecutive Auto Layout children */}
                    {autoLayoutFlowChildren.length > 1 &&
                      autoLayoutFlowChildren.slice(0, -1).map((child, idx) => {
                        const next = autoLayoutFlowChildren[idx + 1]
                        const isRow = primarySingle.layout!.mode === "horizontal"
                        const gapStart = isRow ? child.x + child.width : child.y + child.height
                        const gapEnd = isRow ? next.x : next.y
                        const gapSpan = Math.max(0, gapEnd - gapStart)
                        const midMain = gapStart + gapSpan / 2
                        const crossStart = isRow
                          ? Math.min(child.y, next.y)
                          : Math.min(child.x, next.x)
                        const crossEnd = isRow
                          ? Math.max(child.y + child.height, next.y + next.height)
                          : Math.max(child.x + child.width, next.x + next.width)
                        const midCross = (crossStart + crossEnd) / 2
                        return (
                          <React.Fragment key={`al-gap-${idx}`}>
                            {gapSpan > 0 && (
                              <div
                                aria-hidden="true"
                                className="pointer-events-none absolute"
                                style={
                                  isRow
                                    ? {
                                        left: gapStart,
                                        top: crossStart,
                                        width: gapSpan,
                                        height: crossEnd - crossStart,
                                        background: "rgba(242, 72, 34, 0.14)",
                                      }
                                    : {
                                        left: crossStart,
                                        top: gapStart,
                                        width: crossEnd - crossStart,
                                        height: gapSpan,
                                        background: "rgba(242, 72, 34, 0.14)",
                                      }
                                }
                              />
                            )}
                            <div
                              data-al-gap-handle={idx}
                              title={`Drag to adjust gap (${primarySingle.layout!.gap}px) · Double-click: type`}
                              onPointerDown={(e) => handleGapPointerDown(e, primarySingle)}
                              onDoubleClick={(e) => {
                                e.stopPropagation()
                                setAlInlineEdit({
                                  nodeId: primarySingle.id,
                                  field: "gap",
                                  value: String(primarySingle.layout!.gap),
                                  x: isRow ? midMain : midCross,
                                  y: isRow ? midCross : midMain,
                                })
                              }}
                              className="pointer-events-auto absolute flex items-center justify-center"
                              style={{
                                left: isRow ? midMain : midCross,
                                top: isRow ? midCross : midMain,
                                width: 18 / doc.viewport.zoom,
                                height: 18 / doc.viewport.zoom,
                                transform: "translate(-50%, -50%)",
                                cursor: isRow ? "ew-resize" : "ns-resize",
                                zIndex: 6,
                              }}
                            >
                              <span
                                aria-hidden="true"
                                className="block rounded-full bg-[#f24822] shadow-xs"
                                style={{
                                  width: (isRow ? 2.5 : 14) / doc.viewport.zoom,
                                  height: (isRow ? 14 : 2.5) / doc.viewport.zoom,
                                }}
                              />
                            </div>
                          </React.Fragment>
                        )
                      })}

                    {/* Inline numeric popover when double-clicking a padding or gap handle */}
                    {alInlineEdit && alInlineEdit.nodeId === primarySingle.id && (
                      <div
                        className="pointer-events-auto absolute z-20"
                        style={{
                          left: alInlineEdit.x,
                          top: alInlineEdit.y,
                          transform: `translate(-50%, -50%) scale(${1 / doc.viewport.zoom})`,
                        }}
                        onPointerDown={(e) => e.stopPropagation()}
                      >
                        <input
                          aria-label={`Edit ${alInlineEdit.field}`}
                          type="number"
                          min={0}
                          autoFocus
                          value={alInlineEdit.value}
                          onChange={(e) =>
                            setAlInlineEdit((prev) =>
                              prev ? { ...prev, value: e.target.value } : null
                            )
                          }
                          onBlur={commitInlineAutoLayoutEdit}
                          onKeyDown={(e) => {
                            e.stopPropagation()
                            if (e.key === "Enter") commitInlineAutoLayoutEdit()
                            if (e.key === "Escape") setAlInlineEdit(null)
                          }}
                          className="h-6 w-14 rounded-[5px] border border-[#f24822] bg-[var(--color-bg-elevated)] px-1.5 text-center font-mono text-[11px] font-medium text-white shadow-lg outline-none tabular-nums"
                        />
                      </div>
                    )}
                  </>
                )}

                {/* Corner radius handles (hold Alt to drag a single independent corner) */}
                {showCornerRadiusHandle &&
                  primarySingle &&
                  (isCursorNearSelection || hudText?.includes("Radius")) &&
                  (
                    [
                      { k: "tl", idx: 0 as const, left: 1 as const, top: 1 as const },
                      { k: "tr", idx: 1 as const, left: -1 as const, top: 1 as const },
                      { k: "br", idx: 2 as const, left: -1 as const, top: -1 as const },
                      { k: "bl", idx: 3 as const, left: 1 as const, top: -1 as const },
                    ] as const
                  ).map((c) => {
                    const maxInset = Math.max(
                      12 / doc.viewport.zoom,
                      Math.min(primarySingle.width, primarySingle.height) / 2 - 8 / doc.viewport.zoom
                    )
                    const cornerVal = primarySingle.independentCorners && primarySingle.cornerRadii
                      ? primarySingle.cornerRadii[c.idx]
                      : primarySingle.cornerRadius
                    const inset = Math.max(
                      12 / doc.viewport.zoom,
                      Math.min(cornerVal + 6, maxInset)
                    )
                    return (
                      <div
                        key={c.k}
                        data-corner-handle={c.k}
                        onPointerDown={(e) => handleCornerRadiusPointerDown(e, c.idx, c.left, c.top)}
                        title={`Drag to adjust corner radius (${cornerVal}px) · Alt: single corner`}
                        className="pointer-events-auto absolute flex items-center justify-center"
                        style={{
                          left: c.left === 1 ? inset : undefined,
                          right: c.left === -1 ? inset : undefined,
                          top: c.top === 1 ? inset : undefined,
                          bottom: c.top === -1 ? inset : undefined,
                          width: 14 / doc.viewport.zoom,
                          height: 14 / doc.viewport.zoom,
                          transform: `translate(${c.left === 1 ? "-50%" : "50%"}, ${c.top === 1 ? "-50%" : "50%"})`,
                          cursor: c.left === c.top ? "nwse-resize" : "nesw-resize",
                          zIndex: 5,
                        }}
                      >
                        <span
                          aria-hidden="true"
                          className="pointer-events-none block rounded-full bg-white shadow-xs"
                          style={{
                            width: 7 / doc.viewport.zoom,
                            height: 7 / doc.viewport.zoom,
                            border: `${1.25 / doc.viewport.zoom}px solid ${selectionStrokeColor}`,
                          }}
                        />
                      </div>
                    )
                  })}

                {selectedNodes.every((n) => !n.locked) && !doc.devMode && (
                  <>
                    {/* Outer-corner rotation hit zones */}
                    {primarySingle &&
                      ROTATE_ZONES.map((z) => (
                        <div
                          key={z.id}
                          onPointerDown={handleRotatePointerDown}
                          title="Drag to rotate (Shift snaps 15°)"
                          className="pointer-events-auto absolute"
                          style={{
                            left: z.left,
                            top: z.top,
                            width: 14 / doc.viewport.zoom,
                            height: 14 / doc.viewport.zoom,
                            transform: `translate(calc(-50% + ${z.dx / doc.viewport.zoom}px), calc(-50% + ${z.dy / doc.viewport.zoom}px))`,
                            cursor: ROTATE_CURSOR,
                          }}
                        />
                      ))}

                    {/* Invisible edge resize strips */}
                    <div
                      onPointerDown={(e) => handleResizePointerDown(e, "n")}
                      className="pointer-events-auto absolute inset-x-0"
                      style={{
                        top: -3 / doc.viewport.zoom,
                        height: 6 / doc.viewport.zoom,
                        cursor: "ns-resize",
                      }}
                    />
                    <div
                      onPointerDown={(e) => handleResizePointerDown(e, "s")}
                      className="pointer-events-auto absolute inset-x-0"
                      style={{
                        bottom: -3 / doc.viewport.zoom,
                        height: 6 / doc.viewport.zoom,
                        cursor: "ns-resize",
                      }}
                    />
                    <div
                      onPointerDown={(e) => handleResizePointerDown(e, "w")}
                      className="pointer-events-auto absolute inset-y-0"
                      style={{
                        left: -3 / doc.viewport.zoom,
                        width: 6 / doc.viewport.zoom,
                        cursor: "ew-resize",
                      }}
                    />
                    <div
                      onPointerDown={(e) => handleResizePointerDown(e, "e")}
                      className="pointer-events-auto absolute inset-y-0"
                      style={{
                        right: -3 / doc.viewport.zoom,
                        width: 6 / doc.viewport.zoom,
                        cursor: "ew-resize",
                      }}
                    />

                    {CORNER_HANDLES.map((h) => (
                      <div
                        key={h.id}
                        onPointerDown={(e) => handleResizePointerDown(e, h.id)}
                        className="pointer-events-auto absolute bg-white"
                        style={{
                          left: h.left,
                          top: h.top,
                          width: 7 / doc.viewport.zoom,
                          height: 7 / doc.viewport.zoom,
                          border: `${1 / doc.viewport.zoom}px solid ${selectionStrokeColor}`,
                          borderRadius: 0,
                          transform: "translate(-50%, -50%)",
                          cursor: h.cursor,
                        }}
                      />
                    ))}
                  </>
                )}

                {/* Selection / Live Interaction HUD Pill */}
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute left-1/2 whitespace-nowrap font-sans font-medium tabular-nums text-white"
                  style={{
                    top: `calc(100% + ${6 / doc.viewport.zoom}px)`,
                    transform: "translateX(-50%)",
                    fontSize: 10.5 / doc.viewport.zoom,
                    lineHeight: 1.35,
                    padding: `${1 / doc.viewport.zoom}px ${5 / doc.viewport.zoom}px`,
                    borderRadius: 3 / doc.viewport.zoom,
                    background: hudPink ? "#f24822" : selectionStrokeColor,
                  }}
                >
                  {hudText ??
                    `${Math.round(selectionBounds.width)} × ${Math.round(selectionBounds.height)}${
                      selectedNodes.length === 1 &&
                      selectedNodes[0]?.layout &&
                      selectedNodes[0].layout.mode !== "none" &&
                      (selectedNodes[0].layout.primarySizing === "hug" ||
                        selectedNodes[0].layout.counterSizing === "hug")
                        ? " Hug"
                        : ""
                    }`}
                </div>
              </div>
            )}
          </div>

          {/* Saved Ruler Guides + Live Dragging Guide Preview (screen-space crisp 1px lines) */}
          {pageGuides.map((g) => {
            const screenPos =
              g.axis === "x"
                ? g.position * doc.viewport.zoom + doc.viewport.x
                : g.position * doc.viewport.zoom + doc.viewport.y
            return (
              <div
                key={g.id}
                data-ruler-guide={g.id}
                title={`Guide at ${g.position}px · Drag to move · Drag to ruler or double-click to remove`}
                onPointerDown={(e) => startGuideDrag(e, g.axis, g.id, g.position)}
                onDoubleClick={(e) => {
                  e.stopPropagation()
                  removeGuide(g.id)
                  toast("Removed ruler guide")
                }}
                className="group/guide pointer-events-auto absolute z-10"
                style={
                  g.axis === "x"
                    ? {
                        left: screenPos - 4,
                        top: 0,
                        bottom: 0,
                        width: 9,
                        cursor: "ew-resize",
                      }
                    : {
                        top: screenPos - 4,
                        left: 0,
                        right: 0,
                        height: 9,
                        cursor: "ns-resize",
                      }
                }
              >
                <div
                  className="bg-[#f24822]/85 transition-colors group-hover/guide:bg-[#ff5c38]"
                  style={
                    g.axis === "x"
                      ? { position: "absolute", left: 4, top: 0, bottom: 0, width: 1 }
                      : { position: "absolute", top: 4, left: 0, right: 0, height: 1 }
                  }
                />
              </div>
            )
          })}

          {guidePreview && !guidePreview.guideId && (
            <div
              aria-hidden="true"
              className="pointer-events-none absolute z-20 bg-[#f24822]"
              style={
                guidePreview.axis === "x"
                  ? {
                      left: guidePreview.position * doc.viewport.zoom + doc.viewport.x,
                      top: 0,
                      bottom: 0,
                      width: 1,
                    }
                  : {
                      top: guidePreview.position * doc.viewport.zoom + doc.viewport.y,
                      left: 0,
                      right: 0,
                      height: 1,
                    }
              }
            />
          )}
        </div>

        {/* Live Eyedropper Loupe following cursor when tool === "eyedropper" */}
        {doc.tool === "eyedropper" && cursorClient && (
          <div
            aria-hidden="true"
            className="pointer-events-none fixed z-50 flex items-center gap-2 rounded-full border border-[var(--color-border-strong)] bg-[var(--color-bg-elevated)] py-1 pl-1 pr-2.5 shadow-[var(--ui-shadow)]"
            style={{
              left: cursorClient.x + 16,
              top: cursorClient.y - 20,
            }}
          >
            <span
              className="flex h-6 w-6 items-center justify-center rounded-full border border-white/25"
              style={{ backgroundColor: eyedropperColor }}
            >
              <PipetteIcon className="h-3 w-3 text-white drop-shadow" />
            </span>
            <span className="font-mono text-[11px] font-medium uppercase text-[var(--color-text)] tabular-nums">
              {eyedropperColor}
            </span>
          </div>
        )}

        {/* Active Pen Session Helper Pill */}
        {penSession && (
          <div
            aria-live="polite"
            className="pointer-events-none fixed left-1/2 top-3 z-30 -translate-x-1/2 rounded-[8px] border border-[var(--color-border)] bg-[var(--color-bg-elevated)] px-3 py-1.5 text-[11px] text-[var(--color-text)] shadow-[var(--ui-shadow)]"
          >
            Click for corner · <span className="text-[var(--color-text-brand)]">Drag</span> for Bézier curve ·{" "}
            <span className="text-[var(--color-text-brand)]">Shift</span> 45° ·{" "}
            <span className="text-[var(--color-text-brand)]">Enter</span> to finish
          </div>
        )}

        {isDragOverFile && (
          <div className="pointer-events-none absolute inset-4 z-40 flex items-center justify-center rounded-xl border-2 border-dashed border-[var(--color-bg-brand)] bg-[var(--color-bg-brand)]/10 backdrop-blur-xs">
            <span className="rounded-[8px] bg-[var(--color-bg-elevated)]/95 px-4 py-2 text-[11px] font-medium text-[var(--color-text)] shadow-lg">
              Drop image to place on canvas
            </span>
          </div>
        )}

        {/* Interactive Rulers (drag from ruler to pull out guides + selection span highlight) */}
        {doc.showRulers && (
          <>
            <div
              aria-hidden="true"
              className="pointer-events-none absolute left-0 top-0 z-10 h-5 w-5 border-b border-r border-[var(--color-border)] bg-[var(--color-bg)]"
            />
            <div
              role="presentation"
              aria-label="Horizontal ruler"
              title="Drag down to add a horizontal guide"
              onPointerDown={(e) => {
                const pt = clientToCanvas(e.clientX, e.clientY)
                startGuideDrag(e, "y", null, pt.y)
              }}
              className="absolute left-5 right-0 top-0 z-10 h-5 cursor-ns-resize overflow-hidden border-b border-[var(--color-border)] bg-[var(--color-bg)] select-none"
            >
              {selectionBounds && (
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute bottom-0 top-0 border-b border-[var(--color-bg-brand)] bg-[var(--color-bg-brand)]/20"
                  style={{
                    left: selectionBounds.x * doc.viewport.zoom + doc.viewport.x,
                    width: Math.max(2, selectionBounds.width * doc.viewport.zoom),
                  }}
                />
              )}
              {horizontalTicks.map((tick) => (
                <div
                  key={tick.val}
                  className="pointer-events-none absolute top-0 flex h-full flex-col justify-between border-l border-[var(--color-border)] pl-1 text-[9px] text-[var(--color-text-tertiary)]"
                  style={{ left: tick.pos }}
                >
                  <span>{tick.val}</span>
                </div>
              ))}
              {cursorCanvas && (
                <div
                  className="pointer-events-none absolute bottom-0 top-0 w-px bg-[var(--color-bg-brand)]"
                  style={{ left: cursorCanvas.x * doc.viewport.zoom + doc.viewport.x }}
                />
              )}
              {guidePreview?.axis === "x" && (
                <div
                  className="pointer-events-none absolute top-0.5 -translate-x-1/2 rounded bg-[#f24822] px-1 font-mono text-[9px] font-semibold text-white"
                  style={{ left: guidePreview.position * doc.viewport.zoom + doc.viewport.x }}
                >
                  {guidePreview.position}
                </div>
              )}
            </div>
            <div
              role="presentation"
              aria-label="Vertical ruler"
              title="Drag right to add a vertical guide"
              onPointerDown={(e) => {
                const pt = clientToCanvas(e.clientX, e.clientY)
                startGuideDrag(e, "x", null, pt.x)
              }}
              className="absolute bottom-0 left-0 top-5 z-10 w-5 cursor-ew-resize overflow-hidden border-r border-[var(--color-border)] bg-[var(--color-bg)] select-none"
            >
              {selectionBounds && (
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute left-0 right-0 border-r border-[var(--color-bg-brand)] bg-[var(--color-bg-brand)]/20"
                  style={{
                    top: selectionBounds.y * doc.viewport.zoom + doc.viewport.y,
                    height: Math.max(2, selectionBounds.height * doc.viewport.zoom),
                  }}
                />
              )}
              {verticalTicks.map((tick) => (
                <div
                  key={tick.val}
                  className="pointer-events-none absolute left-0 right-0 border-t border-[var(--color-border)] text-[9px] text-[var(--color-text-tertiary)]"
                  style={{ top: tick.pos }}
                >
                  <span className="block origin-top-left translate-x-3.5 translate-y-0.5 rotate-90">
                    {tick.val}
                  </span>
                </div>
              ))}
              {cursorCanvas && (
                <div
                  className="pointer-events-none absolute left-0 right-0 h-px bg-[var(--color-bg-brand)]"
                  style={{ top: cursorCanvas.y * doc.viewport.zoom + doc.viewport.y }}
                />
              )}
              {guidePreview?.axis === "y" && (
                <div
                  className="pointer-events-none absolute left-0.5 -translate-y-1/2 rounded bg-[#f24822] px-0.5 font-mono text-[9px] font-semibold text-white"
                  style={{ top: guidePreview.position * doc.viewport.zoom + doc.viewport.y }}
                >
                  {guidePreview.position}
                </div>
              )}
            </div>
          </>
        )}
      </MenuContextTrigger>

      <MenuContent>
        <MenuItem value="copy" shortcut="mod+c" disabled={doc.selectedIds.length === 0}>
          Copy
        </MenuItem>
        <MenuItem value="paste" shortcut="mod+v">
          Paste
        </MenuItem>
        <MenuItem value="duplicate" shortcut="mod+d" disabled={doc.selectedIds.length === 0}>
          Duplicate
        </MenuItem>
        <MenuSeparator />
        <MenuItem value="frame" shortcut="mod+g" disabled={doc.selectedIds.length === 0}>
          Frame selection
        </MenuItem>
        <MenuItem value="auto-layout" shortcut="shift+a" disabled={doc.selectedIds.length === 0}>
          Add / toggle Auto Layout
        </MenuItem>
        <MenuItem value="ungroup" shortcut="mod+shift+g" disabled={doc.selectedIds.length === 0}>
          Ungroup
        </MenuItem>
        <MenuItem value="create-component" shortcut="mod+alt+k" disabled={doc.selectedIds.length === 0}>
          Create component
        </MenuItem>
        {selectedNodes[0]?.type === "instance" && (
          <MenuItem value="detach-instance">Detach instance</MenuItem>
        )}
        <MenuSeparator />
        <MenuItem value="flip-h" shortcut="shift+h" disabled={doc.selectedIds.length === 0}>
          Flip horizontal
        </MenuItem>
        <MenuItem value="flip-v" shortcut="shift+v" disabled={doc.selectedIds.length === 0}>
          Flip vertical
        </MenuItem>
        <MenuItem value="front" disabled={doc.selectedIds.length === 0}>
          Bring to front
        </MenuItem>
        <MenuItem value="back" disabled={doc.selectedIds.length === 0}>
          Send to back
        </MenuItem>
        <MenuItem value="toggle-lock" disabled={doc.selectedIds.length === 0}>
          {selectedNodes[0]?.locked ? "Unlock" : "Lock"}
        </MenuItem>
        <MenuItem value="toggle-hide" disabled={doc.selectedIds.length === 0}>
          {selectedNodes[0]?.visible === false ? "Show" : "Hide"}
        </MenuItem>
        <MenuSeparator />
        <MenuItem value="zoom-selection" shortcut="shift+2" disabled={doc.selectedIds.length === 0}>
          Zoom to selection
        </MenuItem>
        <MenuItem value="zoom-fit" shortcut="shift+1">
          Zoom to fit
        </MenuItem>
        {pageGuides.length > 0 && (
          <MenuItem value="clear-guides">Clear ruler guides ({pageGuides.length})</MenuItem>
        )}
        <MenuSeparator />
        <MenuItem value="delete" destructive disabled={doc.selectedIds.length === 0}>
          Delete
        </MenuItem>
      </MenuContent>
    </Menu>
  )
}

function isEditableTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false
  const tag = target.tagName
  return tag === "INPUT" || tag === "TEXTAREA" || target.isContentEditable
}
