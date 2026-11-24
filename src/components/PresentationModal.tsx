"use client"

import * as React from "react"
import { Button } from "@ui-sdk/react/button"
import {
  Dialog,
  DialogBackdrop,
  DialogContent,
  DialogTitle,
} from "@ui-sdk/react/dialog"
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  Maximize2Icon,
  RotateCcwIcon,
  XIcon,
} from "lucide-react"
import { useDesignStore } from "../store/useDesignStore"
import type { DesignNode } from "../types/design"
import { buildVectorPathD, getAncestors, getPolygonPoints, getStarPoints } from "../utils/geometry"
import {
  cornerRadiusCss,
  effectsToCss,
  nodeBackgroundCss,
  primaryFillColor,
  primaryStroke,
} from "../utils/paint"
import { OpenFigmaLogo } from "./OpenFigmaLogo"
import { ActionButton, IconButton } from "./ui"

export function PresentationModal() {
  const { doc, activePage, setPresentMode } = useDesignStore()

  const slides = React.useMemo(
    () =>
      activePage.order
        .map((id) => activePage.nodes[id])
        .filter(
          (n): n is DesignNode =>
            Boolean(n && n.visible && !n.parentId && (n.type === "frame" || n.type === "component"))
        ),
    [activePage]
  )

  const [index, setIndex] = React.useState(0)
  const [fitToScreen, setFitToScreen] = React.useState(true)
  const [stageSize, setStageSize] = React.useState(() => ({
    width: typeof window !== "undefined" ? window.innerWidth : 1280,
    height: typeof window !== "undefined" ? window.innerHeight : 800,
  }))

  React.useEffect(() => {
    if (!doc.presentMode) return
    const onResize = () => {
      setStageSize({ width: window.innerWidth, height: window.innerHeight })
    }
    onResize()
    window.addEventListener("resize", onResize)
    return () => window.removeEventListener("resize", onResize)
  }, [doc.presentMode])

  React.useEffect(() => {
    if (!doc.presentMode) return
    const firstSelected = doc.selectedIds[0]
    if (firstSelected) {
      const chain = getAncestors(firstSelected, activePage.nodes)
      const rootId = chain[0]?.id ?? firstSelected
      const found = slides.findIndex((s) => s.id === rootId)
      if (found >= 0) {
        setIndex(found)
        return
      }
    }
    setIndex(0)
  }, [doc.presentMode, doc.selectedIds, activePage.nodes, slides])

  React.useEffect(() => {
    if (!doc.presentMode) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") setIndex((i) => Math.min(slides.length - 1, i + 1))
      if (e.key === "ArrowLeft") setIndex((i) => Math.max(0, i - 1))
      if (e.key === "r" || e.key === "R") setIndex(0)
      if (e.key === "z" || e.key === "Z") setFitToScreen((v) => !v)
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [doc.presentMode, slides.length])

  const activeSlide = slides[Math.min(index, Math.max(0, slides.length - 1))] ?? null

  const childrenByParent = React.useMemo(() => {
    const map = new Map<string, DesignNode[]>()
    for (const id of activePage.order) {
      const n = activePage.nodes[id]
      if (!n || !n.parentId) continue
      const list = map.get(n.parentId) ?? []
      list.push(n)
      map.set(n.parentId, list)
    }
    return map
  }, [activePage])

  const renderPreviewNode = (node: DesignNode, isRoot = false): React.ReactNode => {
    if (!node.visible) return null
    const fx = effectsToCss(node.effects)
    const stroke = primaryStroke(node, doc.variables)
    const style: React.CSSProperties = {
      position: isRoot ? "relative" : "absolute",
      left: isRoot ? undefined : node.x,
      top: isRoot ? undefined : node.y,
      width: node.width,
      height: node.height,
      transform: node.rotation ? `rotate(${node.rotation}deg)` : undefined,
      opacity: node.opacity,
      mixBlendMode: node.blendMode,
      filter: fx.filter,
      backdropFilter: fx.backdropFilter,
      boxShadow: fx.boxShadow,
    }

    if (node.type === "text") {
      return (
        <div
          key={node.id}
          style={{
            ...style,
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
          }}
        >
          {node.text}
        </div>
      )
    }

    if (node.type === "star" || node.type === "polygon" || node.type === "line" || node.type === "path") {
      const fill = primaryFillColor(node, doc.variables)
      return (
        <svg key={node.id} width={node.width} height={node.height} viewBox={`0 0 ${node.width} ${node.height}`} style={style}>
          {node.type === "star" && <polygon points={getStarPoints(node.width, node.height, node.starPoints ?? 5)} fill={fill} />}
          {node.type === "polygon" && <polygon points={getPolygonPoints(node.width, node.height, node.polygonSides ?? 3)} fill={fill} />}
          {node.type === "line" && <line x1={0} y1={0} x2={node.width} y2={node.height} stroke={stroke?.color ?? fill} strokeWidth={stroke?.width ?? 2} />}
          {node.type === "path" && (
            <path d={buildVectorPathD(node)} fill={node.closed && node.fills.some((f) => f.visible) ? fill : "none"} stroke={stroke?.color ?? fill} strokeWidth={stroke?.width ?? 2} strokeLinecap="round" strokeLinejoin="round" />
          )}
        </svg>
      )
    }

    const kids = childrenByParent.get(node.id) ?? []
    return (
      <div
        key={node.id}
        style={{
          ...style,
          background: nodeBackgroundCss(node, doc.variables),
          border: stroke ? `${stroke.width}px ${stroke.style} ${stroke.color}` : undefined,
          borderRadius: cornerRadiusCss(node),
          overflow: node.clipContent ? "hidden" : "visible",
        }}
      >
        {kids.map((k) => renderPreviewNode(k, false))}
      </div>
    )
  }

  const availW = Math.max(320, stageSize.width - 96)
  const availH = Math.max(240, stageSize.height - 160)
  const fitScale =
    activeSlide && fitToScreen
      ? Math.min(1.5, Math.min(availW / Math.max(1, activeSlide.width), availH / Math.max(1, activeSlide.height)))
      : 1

  return (
    <Dialog open={doc.presentMode} onOpenChange={setPresentMode}>
      <DialogBackdrop className="!bg-black/95" />
      <DialogContent
        aria-label="Prototype presentation"
        finalFocus="none"
        className="!fixed !inset-0 !left-0 !top-0 !h-screen !w-screen !max-w-none !translate-x-0 !translate-y-0 flex flex-col !rounded-none !border-0 !bg-[var(--color-bg-elevated)] !p-0 text-[var(--color-text)]"
      >
        <DialogTitle className="sr-only">Prototype presentation</DialogTitle>

        {/* Presentation Header (48px) */}
        <div className="flex h-12 shrink-0 items-center justify-between border-b border-[var(--color-border)] bg-[var(--color-bg)] px-4">
          <div className="flex min-w-0 items-center gap-2 text-[11px]">
            <OpenFigmaLogo className="h-4 w-3 shrink-0" />
            <span className="truncate font-semibold text-[var(--color-text)]">{doc.title}</span>
            <span className="text-[var(--color-text-tertiary)]">/</span>
            <span className="truncate text-[var(--color-text-secondary)]">
              {activeSlide?.name ?? "No frames"}
            </span>
            {activeSlide && (
              <span className="rounded-[4px] bg-[var(--color-bg-secondary)] px-1.5 py-0.5 font-mono text-[10px] tabular-nums text-[var(--color-text-secondary)]">
                {Math.round(activeSlide.width)} × {Math.round(activeSlide.height)}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1.5">
            <ActionButton
              size="md"
              variant="subtle"
              ariaLabel="Restart prototype"
              icon={<RotateCcwIcon aria-hidden="true" className="h-3 w-3 shrink-0" />}
              onClick={() => setIndex(0)}
            >
              Restart
            </ActionButton>
            <ActionButton
              size="md"
              variant="subtle"
              active={fitToScreen}
              ariaLabel="Toggle fit to screen"
              icon={<Maximize2Icon aria-hidden="true" className="h-3 w-3 shrink-0" />}
              onClick={() => setFitToScreen((v) => !v)}
            >
              {fitToScreen ? "Fit" : "100%"}
            </ActionButton>
            <ActionButton
              size="md"
              variant="subtle"
              ariaLabel="Exit presentation"
              icon={<XIcon aria-hidden="true" className="h-3.5 w-3.5 shrink-0" />}
              onClick={() => setPresentMode(false)}
            >
              Exit
            </ActionButton>
          </div>
        </div>

        {/* Prototype Stage */}
        <div className="flex flex-1 items-center justify-center overflow-auto bg-[var(--color-bg-canvas)] p-10">
          {activeSlide ? (
            <div
              style={{ transform: `scale(${fitScale})`, transformOrigin: "center center" }}
              className="rounded-[2px] shadow-[0_24px_80px_rgba(0,0,0,0.65)] ring-1 ring-white/10"
            >
              {renderPreviewNode(activeSlide, true)}
            </div>
          ) : (
            <p className="text-[12px] text-[var(--color-text-secondary)]">
              Create a top-level Frame to present it here.
            </p>
          )}
        </div>

        {/* Presentation Footer Bar */}
        {slides.length > 0 && (
          <div className="flex h-12 shrink-0 items-center justify-between border-t border-[var(--color-border)] bg-[var(--color-bg)] px-4">
            <div className="flex items-center gap-1 overflow-x-auto">
              {slides.map((slide, idx) => {
                const isCurrent = idx === index
                return (
                  <Button
                    key={slide.id}
                    aria-current={isCurrent ? "page" : undefined}
                    onClick={() => setIndex(idx)}
                    className={`!h-[24px] rounded-[5px] border-transparent px-2 text-[11px] font-medium ${
                      isCurrent
                        ? "bg-[var(--color-bg-selected)] text-[var(--color-text-brand)]"
                        : "bg-transparent text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-hover)] hover:text-[var(--color-text)]"
                    }`}
                  >
                    {slide.name}
                  </Button>
                )
              })}
            </div>

            <div className="flex items-center gap-2">
              <IconButton
                size="md"
                variant="subtle"
                label="Previous frame"
                disabled={index <= 0}
                onClick={() => setIndex((i) => Math.max(0, i - 1))}
              >
                <ChevronLeftIcon aria-hidden="true" className="h-4 w-4" />
              </IconButton>
              <span className="min-w-[44px] text-center font-mono text-[11px] tabular-nums text-[var(--color-text-secondary)]">
                {index + 1} / {slides.length}
              </span>
              <IconButton
                size="md"
                variant="subtle"
                label="Next frame"
                disabled={index >= slides.length - 1}
                onClick={() => setIndex((i) => Math.min(slides.length - 1, i + 1))}
              >
                <ChevronRightIcon aria-hidden="true" className="h-4 w-4" />
              </IconButton>
            </div>

            <span className="hidden text-[10px] text-[var(--color-text-tertiary)] md:inline">
              ← → Navigate · R Restart · Z Scale · Esc Exit
            </span>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
