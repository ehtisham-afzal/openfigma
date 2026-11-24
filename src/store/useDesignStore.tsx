"use client"

import * as React from "react"
import type {
  AutoLayoutConfig,
  DesignNode,
  DesignPage,
  DesignVariable,
  DocumentState,
  FramePreset,
  NodeType,
  Point,
  ToolType,
  ViewportState,
} from "../types/design"
import { createStarterDocument, solidFill } from "./starter"
import {
  collectWithDescendants,
  getAbsoluteBounds,
  getAbsolutePosition,
  getTopLevelSelection,
  isDescendant,
} from "../utils/geometry"
import { computeAllAutoLayouts } from "../utils/layoutEngine"

const STORAGE_KEY = "open-figma-v4"
const MAX_HISTORY = 80

interface HistoryState {
  past: DesignPage[][]
  future: DesignPage[][]
  doc: DocumentState
}

function loadInitialDocument(): DocumentState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as DocumentState
      if (parsed && parsed.version === 4 && Array.isArray(parsed.pages) && parsed.pages.length > 0) {
        return { ...createStarterDocument(), ...parsed, presentMode: false }
      }
    }
  } catch {
    // Ignore storage read failures in private or test environments.
  }
  return createStarterDocument()
}

let idCounter = 100
export function createNodeId(prefix: string): string {
  idCounter += 1
  return `${prefix}-${Date.now().toString(36)}-${idCounter}`
}

export type AlignKind = "left" | "center" | "right" | "top" | "middle" | "bottom"
export type DistributeKind = "horizontal" | "vertical"
export type ZOrderAction = "front" | "forward" | "backward" | "back"

export interface AssetTemplate {
  id: string
  name: string
  category: string
  description: string
  build: (originX: number, originY: number) => DesignNode[]
}

export const ASSET_TEMPLATES: AssetTemplate[] = [
  {
    id: "primary-button",
    name: "Primary Button",
    category: "Buttons",
    description: "Auto Layout gradient CTA button",
    build: (x, y) => {
      const frameId = createNodeId("component")
      return [
        {
          id: frameId,
          name: "Button / Primary",
          type: "component",
          parentId: null,
          x,
          y,
          width: 156,
          height: 44,
          rotation: 0,
          opacity: 1,
          visible: true,
          locked: false,
          clipContent: true,
          fills: [
            {
              id: createNodeId("fill"),
              type: "linear",
              visible: true,
              opacity: 1,
              color: "#0d99ff",
              gradientAngle: 135,
              gradientStops: [
                { offset: 0, color: "#0d99ff" },
                { offset: 1, color: "#6366f1" },
              ],
            },
          ],
          strokes: [],
          effects: [
            {
              id: createNodeId("fx"),
              type: "drop-shadow",
              visible: true,
              x: 0,
              y: 8,
              blur: 20,
              spread: 0,
              color: "rgba(13, 153, 255, 0.35)",
            },
          ],
          cornerRadius: 10,
          blendMode: "normal",
          layout: {
            mode: "horizontal",
            gap: 8,
            paddingTop: 12,
            paddingRight: 24,
            paddingBottom: 12,
            paddingLeft: 24,
            primaryAlign: "center",
            counterAlign: "center",
            primarySizing: "hug",
            counterSizing: "hug",
            wrap: false,
          },
        },
        {
          id: createNodeId("text"),
          name: "Label",
          type: "text",
          parentId: frameId,
          x: 24,
          y: 12,
          width: 96,
          height: 18,
          rotation: 0,
          opacity: 1,
          visible: true,
          locked: false,
          fills: [solidFill("#ffffff")],
          strokes: [],
          effects: [],
          cornerRadius: 0,
          blendMode: "normal",
          text: "Get Started",
          fontFamily: "Inter",
          fontSize: 14,
          fontWeight: 600,
          textAlign: "center",
          lineHeight: 1.3,
          letterSpacing: 0,
        },
      ]
    },
  },
  {
    id: "stat-card",
    name: "Metric Card",
    category: "Cards",
    description: "Auto Layout KPI analytics card",
    build: (x, y) => {
      const frameId = createNodeId("frame")
      return [
        {
          id: frameId,
          name: "Card / Metric",
          type: "frame",
          parentId: null,
          x,
          y,
          width: 248,
          height: 136,
          rotation: 0,
          opacity: 1,
          visible: true,
          locked: false,
          clipContent: true,
          fills: [solidFill("#111318", "var-surface")],
          strokes: [
            {
              id: createNodeId("stroke"),
              visible: true,
              color: "#2d3340",
              variableId: "var-border",
              width: 1,
              opacity: 1,
              style: "solid",
              align: "inside",
            },
          ],
          effects: [
            {
              id: createNodeId("fx"),
              type: "drop-shadow",
              visible: true,
              x: 0,
              y: 12,
              blur: 28,
              spread: 0,
              color: "rgba(0,0,0,0.35)",
            },
          ],
          cornerRadius: 14,
          blendMode: "normal",
          layout: {
            mode: "vertical",
            gap: 8,
            paddingTop: 20,
            paddingRight: 20,
            paddingBottom: 20,
            paddingLeft: 20,
            primaryAlign: "start",
            counterAlign: "stretch",
            primarySizing: "hug",
            counterSizing: "fixed",
            wrap: false,
          },
        },
        {
          id: createNodeId("text"),
          name: "Metric Label",
          type: "text",
          parentId: frameId,
          x: 20,
          y: 20,
          width: 208,
          height: 18,
          rotation: 0,
          opacity: 1,
          visible: true,
          locked: false,
          fills: [solidFill("#9ca3af", "var-text-muted")],
          strokes: [],
          effects: [],
          cornerRadius: 0,
          blendMode: "normal",
          text: "Monthly Active Users",
          fontFamily: "Inter",
          fontSize: 12,
          fontWeight: 500,
          textAlign: "left",
          lineHeight: 1.4,
          letterSpacing: 0,
        },
        {
          id: createNodeId("text"),
          name: "Metric Value",
          type: "text",
          parentId: frameId,
          x: 20,
          y: 46,
          width: 208,
          height: 36,
          rotation: 0,
          opacity: 1,
          visible: true,
          locked: false,
          fills: [solidFill("#f8fafc", "var-text-primary")],
          strokes: [],
          effects: [],
          cornerRadius: 0,
          blendMode: "normal",
          text: "48,920",
          fontFamily: "Plus Jakarta Sans",
          fontSize: 30,
          fontWeight: 700,
          textAlign: "left",
          lineHeight: 1.2,
          letterSpacing: -0.6,
        },
        {
          id: createNodeId("text"),
          name: "Metric Delta",
          type: "text",
          parentId: frameId,
          x: 20,
          y: 90,
          width: 208,
          height: 18,
          rotation: 0,
          opacity: 1,
          visible: true,
          locked: false,
          fills: [solidFill("#34d399")],
          strokes: [],
          effects: [],
          cornerRadius: 0,
          blendMode: "normal",
          text: "+18.4% vs last month",
          fontFamily: "Inter",
          fontSize: 12,
          fontWeight: 600,
          textAlign: "left",
          lineHeight: 1.3,
          letterSpacing: 0,
        },
      ]
    },
  },
  {
    id: "glass-navbar",
    name: "Glass Navbar",
    category: "Navigation",
    description: "Frosted background-blur nav header",
    build: (x, y) => {
      const frameId = createNodeId("frame")
      return [
        {
          id: frameId,
          name: "Navbar / Glass",
          type: "frame",
          parentId: null,
          x,
          y,
          width: 480,
          height: 56,
          rotation: 0,
          opacity: 1,
          visible: true,
          locked: false,
          clipContent: true,
          fills: [solidFill("#1e222b", null, 0.72)],
          strokes: [
            {
              id: createNodeId("stroke"),
              visible: true,
              color: "#ffffff",
              width: 1,
              opacity: 0.14,
              style: "solid",
              align: "inside",
            },
          ],
          effects: [
            {
              id: createNodeId("fx"),
              type: "background-blur",
              visible: true,
              x: 0,
              y: 0,
              blur: 16,
              spread: 0,
              color: "#000000",
            },
          ],
          cornerRadius: 14,
          blendMode: "normal",
          layout: {
            mode: "horizontal",
            gap: 16,
            paddingTop: 12,
            paddingRight: 20,
            paddingBottom: 12,
            paddingLeft: 20,
            primaryAlign: "space-between",
            counterAlign: "center",
            primarySizing: "fixed",
            counterSizing: "fixed",
            wrap: false,
          },
        },
        {
          id: createNodeId("text"),
          name: "Brand",
          type: "text",
          parentId: frameId,
          x: 20,
          y: 18,
          width: 96,
          height: 20,
          rotation: 0,
          opacity: 1,
          visible: true,
          locked: false,
          fills: [solidFill("#ffffff")],
          strokes: [],
          effects: [],
          cornerRadius: 0,
          blendMode: "normal",
          text: "Acme Studio",
          fontFamily: "Plus Jakarta Sans",
          fontSize: 14,
          fontWeight: 700,
          textAlign: "left",
          lineHeight: 1.4,
          letterSpacing: -0.2,
        },
        {
          id: createNodeId("text"),
          name: "Nav Links",
          type: "text",
          parentId: frameId,
          x: 180,
          y: 18,
          width: 180,
          height: 18,
          rotation: 0,
          opacity: 1,
          visible: true,
          locked: false,
          fills: [solidFill("#cbd5e1")],
          strokes: [],
          effects: [],
          cornerRadius: 0,
          blendMode: "normal",
          text: "Features   Pricing   Docs",
          fontFamily: "Inter",
          fontSize: 12.5,
          fontWeight: 500,
          textAlign: "right",
          lineHeight: 1.4,
          letterSpacing: 0,
        },
      ]
    },
  },
  {
    id: "input-field",
    name: "Text Input",
    category: "Forms",
    description: "Labeled dark input component",
    build: (x, y) => {
      const frameId = createNodeId("frame")
      return [
        {
          id: frameId,
          name: "Input / Default",
          type: "frame",
          parentId: null,
          x,
          y,
          width: 260,
          height: 66,
          rotation: 0,
          opacity: 1,
          visible: true,
          locked: false,
          clipContent: false,
          fills: [],
          strokes: [],
          effects: [],
          cornerRadius: 0,
          blendMode: "normal",
          layout: {
            mode: "vertical",
            gap: 6,
            paddingTop: 0,
            paddingRight: 0,
            paddingBottom: 0,
            paddingLeft: 0,
            primaryAlign: "start",
            counterAlign: "stretch",
            primarySizing: "hug",
            counterSizing: "fixed",
            wrap: false,
          },
        },
        {
          id: createNodeId("text"),
          name: "Field Label",
          type: "text",
          parentId: frameId,
          x: 0,
          y: 0,
          width: 260,
          height: 18,
          rotation: 0,
          opacity: 1,
          visible: true,
          locked: false,
          fills: [solidFill("#d4d4d8", "var-text-primary")],
          strokes: [],
          effects: [],
          cornerRadius: 0,
          blendMode: "normal",
          text: "Email address",
          fontFamily: "Inter",
          fontSize: 12,
          fontWeight: 500,
          textAlign: "left",
          lineHeight: 1.4,
          letterSpacing: 0,
        },
        {
          id: createNodeId("frame"),
          name: "Input Box",
          type: "frame",
          parentId: frameId,
          x: 0,
          y: 24,
          width: 260,
          height: 40,
          rotation: 0,
          opacity: 1,
          visible: true,
          locked: false,
          fills: [solidFill("#14161b", "var-surface-subtle")],
          strokes: [
            {
              id: createNodeId("stroke"),
              visible: true,
              color: "#3f4654",
              variableId: "var-border",
              width: 1,
              opacity: 1,
              style: "solid",
              align: "inside",
            },
          ],
          effects: [],
          cornerRadius: 8,
          blendMode: "normal",
        },
      ]
    },
  },
]

export interface DesignStoreContextValue {
  doc: DocumentState
  activePage: DesignPage
  selectedNodes: DesignNode[]
  localComponents: DesignNode[]
  canUndo: boolean
  canRedo: boolean
  editingTextId: string | null
  setEditingTextId: (id: string | null) => void
  setTitle: (title: string) => void
  setTool: (tool: ToolType) => void
  setViewport: (updater: ViewportState | ((prev: ViewportState) => ViewportState)) => void
  setSelectedIds: (ids: string[]) => void
  toggleFlag: (flag: "showGrid" | "showRulers" | "snapToObjects", value?: boolean) => void
  commitCheckpoint: () => void
  addNode: (node: DesignNode, select?: boolean) => void
  insertNodes: (nodes: DesignNode[], selectTopLevel?: boolean) => void
  updateNodes: (
    ids: string[],
    updater: Partial<DesignNode> | ((node: DesignNode) => Partial<DesignNode>),
    recordHistory?: boolean
  ) => void
  deleteSelection: (ids?: string[]) => void
  duplicateSelection: (ids?: string[], offset?: Point) => string[]
  copySelection: () => void
  pasteClipboard: () => void
  selectAll: () => void
  frameSelection: () => void
  ungroupSelection: () => void
  toggleAutoLayout: () => void
  createComponentFromSelection: () => void
  insertComponentInstance: (componentId: string) => void
  detachInstance: () => void
  reparentNode: (nodeId: string, newParentId: string | null, insertIndex?: number) => void
  nudgeSelection: (dx: number, dy: number) => void
  flipSelection: (axis: "horizontal" | "vertical") => void
  alignSelection: (kind: AlignKind) => void
  distributeSelection: (kind: DistributeKind) => void
  reorderZOrder: (action: ZOrderAction, targetIds?: string[]) => void
  undo: () => void
  redo: () => void
  switchPage: (pageId: string) => void
  addPage: () => void
  renamePage: (pageId: string, name: string) => void
  setPageBackground: (color: string) => void
  duplicatePage: (pageId: string) => void
  deletePage: (pageId: string) => void
  resetDocument: () => void
  newBlankDocument: () => void
  exportDocumentJson: () => string
  importDocumentJson: (raw: string) => boolean
  zoomToFit: (canvasWidth: number, canvasHeight: number) => void
  zoomToSelection: (canvasWidth: number, canvasHeight: number) => void
  createQuickShape: (type: NodeType) => void
  createFrameFromPreset: (preset: FramePreset, canvasWidth?: number, canvasHeight?: number) => void
  insertImageFromFile: (file: File, position?: Point) => Promise<void>
  setActiveVariableMode: (modeId: string) => void
  addVariable: (type: "color" | "number") => void
  updateVariable: (id: string, patch: Partial<DesignVariable>) => void
  updateVariableModeValue: (id: string, modeId: string, value: string | number) => void
  deleteVariable: (id: string) => void
  toggleShowUI: (value?: boolean) => void
  setDevMode: (value: boolean | ((prev: boolean) => boolean)) => void
  setPresentMode: (value: boolean) => void
  addComment: (x: number, y: number, text: string, parentId?: string | null) => string
  moveComment: (commentId: string, x: number, y: number, parentId: string | null) => void
  replyComment: (commentId: string, text: string) => void
  toggleResolveComment: (commentId: string) => void
  deleteComment: (commentId: string) => void
  addGuide: (axis: "x" | "y", position: number) => string
  moveGuide: (guideId: string, position: number) => void
  removeGuide: (guideId: string) => void
  clearGuides: () => void
}

const DesignStoreContext = React.createContext<DesignStoreContextValue | null>(null)

function clonePages(pages: DesignPage[]): DesignPage[] {
  return structuredClone(pages)
}

export function DesignStoreProvider({ children }: { children: React.ReactNode }) {
  const [history, setHistory] = React.useState<HistoryState>(() => ({
    past: [],
    future: [],
    doc: loadInitialDocument(),
  }))
  const [editingTextId, setEditingTextId] = React.useState<string | null>(null)
  const clipboardRef = React.useRef<DesignNode[]>([])

  React.useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(history.doc))
    } catch {
      // Ignore storage quota errors.
    }
  }, [history.doc])

  const updateActivePage = React.useCallback(
    (
      mutator: (page: DesignPage) => {
        page: DesignPage
        selectedIds?: string[]
        tool?: ToolType
      },
      recordHistory = true
    ) => {
      setHistory((prev) => {
        const currentPage =
          prev.doc.pages.find((p) => p.id === prev.doc.activePageId) ?? prev.doc.pages[0]
        const nextResult = mutator(currentPage)
        const laidOutPage = computeAllAutoLayouts(nextResult.page)
        const nextPages = prev.doc.pages.map((p) => (p.id === currentPage.id ? laidOutPage : p))
        return {
          past: recordHistory
            ? [...prev.past.slice(-(MAX_HISTORY - 1)), clonePages(prev.doc.pages)]
            : prev.past,
          future: recordHistory ? [] : prev.future,
          doc: {
            ...prev.doc,
            pages: nextPages,
            selectedIds: nextResult.selectedIds ?? prev.doc.selectedIds,
            tool: nextResult.tool ?? prev.doc.tool,
          },
        }
      })
    },
    []
  )

  const commitCheckpoint = React.useCallback(() => {
    setHistory((prev) => ({
      past: [...prev.past.slice(-(MAX_HISTORY - 1)), clonePages(prev.doc.pages)],
      future: [],
      doc: prev.doc,
    }))
  }, [])

  const setTitle = React.useCallback((title: string) => {
    setHistory((prev) => ({ ...prev, doc: { ...prev.doc, title } }))
  }, [])

  const setTool = React.useCallback((tool: ToolType) => {
    setEditingTextId(null)
    setHistory((prev) => ({
      ...prev,
      doc: {
        ...prev.doc,
        tool,
        lastShapeTool:
          tool === "rectangle" ||
          tool === "ellipse" ||
          tool === "line" ||
          tool === "polygon" ||
          tool === "star"
            ? tool
            : prev.doc.lastShapeTool,
        lastDrawTool:
          tool === "pen" || tool === "pencil"
            ? tool
            : prev.doc.lastDrawTool ?? "pen",
      },
    }))
  }, [])

  const setViewport = React.useCallback(
    (updater: ViewportState | ((prev: ViewportState) => ViewportState)) => {
      setHistory((prev) => ({
        ...prev,
        doc: {
          ...prev.doc,
          viewport: typeof updater === "function" ? updater(prev.doc.viewport) : updater,
        },
      }))
    },
    []
  )

  const setSelectedIds = React.useCallback((ids: string[]) => {
    setHistory((prev) => ({
      ...prev,
      doc: { ...prev.doc, selectedIds: ids },
    }))
  }, [])

  const toggleFlag = React.useCallback(
    (flag: "showGrid" | "showRulers" | "snapToObjects", value?: boolean) => {
      setHistory((prev) => ({
        ...prev,
        doc: {
          ...prev.doc,
          [flag]: value === undefined ? !prev.doc[flag] : value,
        },
      }))
    },
    []
  )

  const addNode = React.useCallback(
    (node: DesignNode, select = true) => {
      updateActivePage((page) => ({
        page: {
          ...page,
          nodes: { ...page.nodes, [node.id]: node },
          order: [...page.order, node.id],
        },
        selectedIds: select ? [node.id] : undefined,
      }))
    },
    [updateActivePage]
  )

  const insertNodes = React.useCallback(
    (nodes: DesignNode[], selectTopLevel = true) => {
      if (nodes.length === 0) return
      updateActivePage((page) => {
        const nextNodes = { ...page.nodes }
        const nextOrder = [...page.order]
        for (const n of nodes) {
          nextNodes[n.id] = n
          nextOrder.push(n.id)
        }
        const topLevel = nodes.filter((n) => !n.parentId).map((n) => n.id)
        return {
          page: { ...page, nodes: nextNodes, order: nextOrder },
          selectedIds: selectTopLevel ? (topLevel.length ? topLevel : [nodes[0].id]) : undefined,
          tool: "select",
        }
      })
    },
    [updateActivePage]
  )

  const updateNodes = React.useCallback(
    (
      ids: string[],
      updater: Partial<DesignNode> | ((node: DesignNode) => Partial<DesignNode>),
      recordHistory = true
    ) => {
      if (ids.length === 0) return
      updateActivePage((page) => {
        const nextNodes = { ...page.nodes }
        let changed = false
        for (const id of ids) {
          const existing = nextNodes[id]
          if (!existing) continue
          const patch = typeof updater === "function" ? updater(existing) : updater
          nextNodes[id] = { ...existing, ...patch }
          changed = true
        }
        return { page: changed ? { ...page, nodes: nextNodes } : page }
      }, recordHistory)
    },
    [updateActivePage]
  )

  const deleteSelection = React.useCallback((explicitIds?: string[]) => {
    setHistory((prev) => {
      const targets = explicitIds ?? prev.doc.selectedIds
      if (targets.length === 0) return prev
      const page =
        prev.doc.pages.find((p) => p.id === prev.doc.activePageId) ?? prev.doc.pages[0]
      const removeSet = new Set(collectWithDescendants(targets, page))
      const nextNodes: Record<string, DesignNode> = {}
      for (const [id, node] of Object.entries(page.nodes)) {
        if (!removeSet.has(id)) nextNodes[id] = node
      }
      const nextOrder = page.order.filter((id) => !removeSet.has(id))
      const nextComments = (page.comments ?? []).map((c) => {
        if (c.parentId && removeSet.has(c.parentId)) {
          const parentNode = page.nodes[c.parentId]
          const parentAbs = parentNode ? getAbsolutePosition(parentNode, page.nodes) : { x: 0, y: 0 }
          return {
            ...c,
            parentId: null,
            x: Math.round(parentAbs.x + c.x),
            y: Math.round(parentAbs.y + c.y),
          }
        }
        return c
      })
      const laidOut = computeAllAutoLayouts({
        ...page,
        nodes: nextNodes,
        order: nextOrder,
        comments: nextComments,
      })
      const nextPages = prev.doc.pages.map((p) => (p.id === page.id ? laidOut : p))
      return {
        past: [...prev.past.slice(-(MAX_HISTORY - 1)), clonePages(prev.doc.pages)],
        future: [],
        doc: {
          ...prev.doc,
          pages: nextPages,
          selectedIds: prev.doc.selectedIds.filter((id) => !removeSet.has(id)),
        },
      }
    })
  }, [])

  const duplicateSelection = React.useCallback(
    (explicitIds?: string[], offset: Point = { x: 24, y: 24 }): string[] => {
      let createdTopIds: string[] = []
      setHistory((prev) => {
        const page =
          prev.doc.pages.find((p) => p.id === prev.doc.activePageId) ?? prev.doc.pages[0]
        const rawTargets = explicitIds ?? prev.doc.selectedIds
        const topIds = getTopLevelSelection(rawTargets, page.nodes)
        if (topIds.length === 0) return prev
        const allIds = collectWithDescendants(topIds, page)
        const idMap = new Map<string, string>()
        for (const id of allIds) {
          idMap.set(id, createNodeId(page.nodes[id].type))
        }
        const nextNodes = { ...page.nodes }
        const nextOrder = [...page.order]
        const newSelected: string[] = []
        for (const id of allIds) {
          const orig = page.nodes[id]
          const newId = idMap.get(id)!
          const mappedParent =
            orig.parentId && idMap.has(orig.parentId) ? idMap.get(orig.parentId)! : orig.parentId
          const isRootOfCopy = topIds.includes(id)
          nextNodes[newId] = {
            ...structuredClone(orig),
            id: newId,
            name: isRootOfCopy ? `${orig.name} Copy` : orig.name,
            parentId: mappedParent,
            x: isRootOfCopy ? orig.x + offset.x : orig.x,
            y: isRootOfCopy ? orig.y + offset.y : orig.y,
          }
          nextOrder.push(newId)
          if (isRootOfCopy) newSelected.push(newId)
        }
        createdTopIds = newSelected
        const laidOut = computeAllAutoLayouts({ ...page, nodes: nextNodes, order: nextOrder })
        const nextPages = prev.doc.pages.map((p) => (p.id === page.id ? laidOut : p))
        return {
          past: [...prev.past.slice(-(MAX_HISTORY - 1)), clonePages(prev.doc.pages)],
          future: [],
          doc: {
            ...prev.doc,
            pages: nextPages,
            selectedIds: newSelected,
          },
        }
      })
      return createdTopIds
    },
    []
  )

  const copySelection = React.useCallback(() => {
    const page =
      history.doc.pages.find((p) => p.id === history.doc.activePageId) ?? history.doc.pages[0]
    const topIds = getTopLevelSelection(history.doc.selectedIds, page.nodes)
    if (topIds.length === 0) return
    const allIds = collectWithDescendants(topIds, page)
    clipboardRef.current = allIds.map((id) => structuredClone(page.nodes[id]))
  }, [history.doc])

  const pasteClipboard = React.useCallback(() => {
    const items = clipboardRef.current
    if (items.length === 0) return
    const idMap = new Map<string, string>()
    for (const item of items) {
      idMap.set(item.id, createNodeId(item.type))
    }
    const created: DesignNode[] = items.map((item) => {
      const parentInClip = item.parentId && idMap.has(item.parentId)
      return {
        ...structuredClone(item),
        id: idMap.get(item.id)!,
        parentId: parentInClip ? idMap.get(item.parentId!)! : null,
        x: parentInClip ? item.x : item.x + 32,
        y: parentInClip ? item.y : item.y + 32,
      }
    })
    insertNodes(created, true)
  }, [insertNodes])

  const selectAll = React.useCallback(() => {
    setHistory((prev) => {
      const page =
        prev.doc.pages.find((p) => p.id === prev.doc.activePageId) ?? prev.doc.pages[0]
      const selectable = page.order.filter((id) => {
        const n = page.nodes[id]
        return n && n.visible && !n.locked && n.parentId === null
      })
      return { ...prev, doc: { ...prev.doc, selectedIds: selectable } }
    })
  }, [])

  const wrapIdsInFrame = React.useCallback((withAutoLayout: boolean, asComponent = false) => {
    setHistory((prev) => {
      const page =
        prev.doc.pages.find((p) => p.id === prev.doc.activePageId) ?? prev.doc.pages[0]
      const topIds = getTopLevelSelection(prev.doc.selectedIds, page.nodes)
      if (topIds.length === 0) return prev

      if (topIds.length === 1 && !withAutoLayout && asComponent) {
        const single = page.nodes[topIds[0]]
        if (single && single.type === "frame") {
          const nextNodes = {
            ...page.nodes,
            [single.id]: { ...single, type: "component" as const },
          }
          const nextPages = prev.doc.pages.map((p) =>
            p.id === page.id ? { ...p, nodes: nextNodes } : p
          )
          return {
            past: [...prev.past.slice(-(MAX_HISTORY - 1)), clonePages(prev.doc.pages)],
            future: [],
            doc: { ...prev.doc, pages: nextPages },
          }
        }
      }

      if (topIds.length === 1 && withAutoLayout) {
        const single = page.nodes[topIds[0]]
        if (single && (single.type === "frame" || single.type === "component")) {
          const hasLayout = Boolean(single.layout && single.layout.mode !== "none")
          const nextLayout: AutoLayoutConfig = hasLayout
            ? { ...single.layout!, mode: "none" }
            : {
                mode: "vertical",
                gap: 12,
                paddingTop: 16,
                paddingRight: 16,
                paddingBottom: 16,
                paddingLeft: 16,
                primaryAlign: "start",
                counterAlign: "start",
                primarySizing: "hug",
                counterSizing: "hug",
                wrap: false,
              }
          const nextNodes = {
            ...page.nodes,
            [single.id]: { ...single, layout: nextLayout },
          }
          const laidOut = computeAllAutoLayouts({ ...page, nodes: nextNodes })
          const nextPages = prev.doc.pages.map((p) => (p.id === page.id ? laidOut : p))
          return {
            past: [...prev.past.slice(-(MAX_HISTORY - 1)), clonePages(prev.doc.pages)],
            future: [],
            doc: { ...prev.doc, pages: nextPages },
          }
        }
      }

      let minX = Infinity
      let minY = Infinity
      let maxX = -Infinity
      let maxY = -Infinity
      const boxes = topIds.map((id) => ({ id, b: getAbsoluteBounds(page.nodes[id], page.nodes) }))
      for (const { b } of boxes) {
        minX = Math.min(minX, b.x)
        minY = Math.min(minY, b.y)
        maxX = Math.max(maxX, b.x + b.width)
        maxY = Math.max(maxY, b.y + b.height)
      }

      const spreadX = maxX - minX
      const spreadY = maxY - minY
      const inferHorizontal = boxes.length > 1 && spreadX >= spreadY
      const pad = withAutoLayout ? 16 : 20
      const frameId = createNodeId(asComponent ? "component" : "frame")
      const frameNode: DesignNode = {
        id: frameId,
        name: asComponent ? "Component" : withAutoLayout ? "Auto Layout" : "Frame",
        type: asComponent ? "component" : "frame",
        parentId: null,
        x: Math.round(minX - pad),
        y: Math.round(minY - pad),
        width: Math.max(40, Math.round(maxX - minX + pad * 2)),
        height: Math.max(40, Math.round(maxY - minY + pad * 2)),
        rotation: 0,
        opacity: 1,
        visible: true,
        locked: false,
        clipContent: true,
        fills: [solidFill("#181b22")],
        strokes: [
          {
            id: createNodeId("stroke"),
            visible: true,
            color: "#3b4252",
            width: 1,
            opacity: 1,
            style: "solid",
            align: "inside",
          },
        ],
        effects: [],
        cornerRadius: 12,
        blendMode: "normal",
        ...(withAutoLayout
          ? {
              layout: {
                mode: inferHorizontal ? ("horizontal" as const) : ("vertical" as const),
                gap: 12,
                paddingTop: pad,
                paddingRight: pad,
                paddingBottom: pad,
                paddingLeft: pad,
                primaryAlign: "start" as const,
                counterAlign: "center" as const,
                primarySizing: "hug" as const,
                counterSizing: "hug" as const,
                wrap: false,
              },
            }
          : {}),
      }

      const nextNodes = { ...page.nodes, [frameId]: frameNode }
      for (const { id, b } of boxes) {
        nextNodes[id] = {
          ...nextNodes[id],
          parentId: frameId,
          x: Math.round(b.x - frameNode.x),
          y: Math.round(b.y - frameNode.y),
        }
      }
      const firstIndex = Math.min(...topIds.map((id) => page.order.indexOf(id)))
      const nextOrder = [...page.order]
      nextOrder.splice(Math.max(0, firstIndex), 0, frameId)
      const laidOut = computeAllAutoLayouts({ ...page, nodes: nextNodes, order: nextOrder })
      const nextPages = prev.doc.pages.map((p) => (p.id === page.id ? laidOut : p))
      return {
        past: [...prev.past.slice(-(MAX_HISTORY - 1)), clonePages(prev.doc.pages)],
        future: [],
        doc: { ...prev.doc, pages: nextPages, selectedIds: [frameId] },
      }
    })
  }, [])

  const frameSelection = React.useCallback(() => wrapIdsInFrame(false, false), [wrapIdsInFrame])
  const toggleAutoLayout = React.useCallback(() => wrapIdsInFrame(true, false), [wrapIdsInFrame])
  const createComponentFromSelection = React.useCallback(
    () => wrapIdsInFrame(false, true),
    [wrapIdsInFrame]
  )

  const ungroupSelection = React.useCallback(() => {
    setHistory((prev) => {
      const page =
        prev.doc.pages.find((p) => p.id === prev.doc.activePageId) ?? prev.doc.pages[0]
      const containers = prev.doc.selectedIds.filter((id) => {
        const n = page.nodes[id]
        return n && (n.type === "frame" || n.type === "component" || n.type === "instance")
      })
      if (containers.length === 0) return prev
      const nextNodes = { ...page.nodes }
      const removeIds = new Set(containers)
      const promoted: string[] = []

      for (const containerId of containers) {
        const container = page.nodes[containerId]
        const grandParent = container.parentId
        const grandPos = grandParent && page.nodes[grandParent]
          ? getAbsolutePosition(page.nodes[grandParent], page.nodes)
          : { x: 0, y: 0 }

        for (const id of page.order) {
          const child = nextNodes[id]
          if (child?.parentId === containerId) {
            const abs = getAbsolutePosition(child, page.nodes)
            nextNodes[id] = {
              ...child,
              parentId: grandParent,
              x: Math.round(abs.x - grandPos.x),
              y: Math.round(abs.y - grandPos.y),
            }
            promoted.push(id)
          }
        }
        delete nextNodes[containerId]
      }

      const nextOrder = page.order.filter((id) => !removeIds.has(id))
      const laidOut = computeAllAutoLayouts({ ...page, nodes: nextNodes, order: nextOrder })
      const nextPages = prev.doc.pages.map((p) => (p.id === page.id ? laidOut : p))
      return {
        past: [...prev.past.slice(-(MAX_HISTORY - 1)), clonePages(prev.doc.pages)],
        future: [],
        doc: { ...prev.doc, pages: nextPages, selectedIds: promoted },
      }
    })
  }, [])

  const insertComponentInstance = React.useCallback(
    (componentId: string) => {
      const page =
        history.doc.pages.find((p) => p.id === history.doc.activePageId) ?? history.doc.pages[0]
      const master = page.nodes[componentId]
      if (!master) return
      const subtreeIds = collectWithDescendants([componentId], page)
      const idMap = new Map<string, string>()
      for (const id of subtreeIds) {
        idMap.set(id, createNodeId(id === componentId ? "instance" : page.nodes[id].type))
      }
      const vp = history.doc.viewport
      const dropX = Math.round((300 - vp.x) / vp.zoom)
      const dropY = Math.round((180 - vp.y) / vp.zoom)

      const nodesToInsert: DesignNode[] = subtreeIds.map((id) => {
        const orig = page.nodes[id]
        const isRoot = id === componentId
        return {
          ...structuredClone(orig),
          id: idMap.get(id)!,
          type: isRoot ? "instance" : orig.type,
          componentId: isRoot ? componentId : orig.componentId,
          parentId: isRoot ? null : idMap.get(orig.parentId!) ?? null,
          x: isRoot ? dropX : orig.x,
          y: isRoot ? dropY : orig.y,
        }
      })
      insertNodes(nodesToInsert, true)
    },
    [history.doc, insertNodes]
  )

  const detachInstance = React.useCallback(() => {
    updateNodes(
      history.doc.selectedIds,
      (node) => (node.type === "instance" ? { type: "frame", componentId: null } : {}),
      true
    )
  }, [history.doc.selectedIds, updateNodes])

  const reparentNode = React.useCallback(
    (nodeId: string, newParentId: string | null, insertIndex?: number) => {
      setHistory((prev) => {
        const page =
          prev.doc.pages.find((p) => p.id === prev.doc.activePageId) ?? prev.doc.pages[0]
        const node = page.nodes[nodeId]
        if (!node) return prev
        if (newParentId === nodeId) return prev
        if (newParentId && isDescendant(newParentId, nodeId, page.nodes)) return prev

        const abs = getAbsolutePosition(node, page.nodes)
        const parentAbs =
          newParentId && page.nodes[newParentId]
            ? getAbsolutePosition(page.nodes[newParentId], page.nodes)
            : { x: 0, y: 0 }

        const nextNodes = {
          ...page.nodes,
          [nodeId]: {
            ...node,
            parentId: newParentId,
            x: Math.round(abs.x - parentAbs.x),
            y: Math.round(abs.y - parentAbs.y),
          },
        }

        let nextOrder = [...page.order]
        if (insertIndex !== undefined) {
          const moving = collectWithDescendants([nodeId], page)
          const movingSet = new Set(moving)
          const rest = nextOrder.filter((id) => !movingSet.has(id))
          const clamped = Math.max(0, Math.min(rest.length, insertIndex))
          nextOrder = [...rest.slice(0, clamped), ...moving, ...rest.slice(clamped)]
        }

        const laidOut = computeAllAutoLayouts({ ...page, nodes: nextNodes, order: nextOrder })
        const nextPages = prev.doc.pages.map((p) => (p.id === page.id ? laidOut : p))
        return {
          past: [...prev.past.slice(-(MAX_HISTORY - 1)), clonePages(prev.doc.pages)],
          future: [],
          doc: { ...prev.doc, pages: nextPages },
        }
      })
    },
    []
  )

  const nudgeSelection = React.useCallback((dx: number, dy: number) => {
    setHistory((prev) => {
      const page =
        prev.doc.pages.find((p) => p.id === prev.doc.activePageId) ?? prev.doc.pages[0]
      const ids = getTopLevelSelection(prev.doc.selectedIds, page.nodes).filter(
        (id) => !page.nodes[id]?.locked
      )
      if (ids.length === 0) return prev

      // Inside an Auto Layout parent, arrow keys reorder children along the flex flow.
      if (ids.length === 1) {
        const single = page.nodes[ids[0]]
        const parent = single?.parentId ? page.nodes[single.parentId] : null
        if (parent?.layout && parent.layout.mode !== "none" && !single.layoutAbsolute) {
          const step =
            parent.layout.mode === "horizontal"
              ? Math.sign(dx)
              : Math.sign(dy)
          if (step !== 0) {
            const siblings = page.order.filter((id) => page.nodes[id]?.parentId === parent.id)
            const idx = siblings.indexOf(single.id)
            const targetIdx = idx + step
            if (targetIdx >= 0 && targetIdx < siblings.length) {
              const orderCopy = [...page.order]
              const a = orderCopy.indexOf(siblings[idx])
              const b = orderCopy.indexOf(siblings[targetIdx])
              ;[orderCopy[a], orderCopy[b]] = [orderCopy[b], orderCopy[a]]
              const laidOut = computeAllAutoLayouts({ ...page, order: orderCopy })
              const nextPages = prev.doc.pages.map((p) => (p.id === page.id ? laidOut : p))
              return {
                past: [...prev.past.slice(-(MAX_HISTORY - 1)), clonePages(prev.doc.pages)],
                future: [],
                doc: { ...prev.doc, pages: nextPages },
              }
            }
            return prev
          }
        }
      }

      const nextNodes = { ...page.nodes }
      for (const id of ids) {
        const n = nextNodes[id]
        nextNodes[id] = { ...n, x: Math.round(n.x + dx), y: Math.round(n.y + dy) }
      }
      const nextPages = prev.doc.pages.map((p) =>
        p.id === page.id ? { ...p, nodes: nextNodes } : p
      )
      return {
        past: [...prev.past.slice(-(MAX_HISTORY - 1)), clonePages(prev.doc.pages)],
        future: [],
        doc: { ...prev.doc, pages: nextPages },
      }
    })
  }, [])

  const flipSelection = React.useCallback(
    (axis: "horizontal" | "vertical") => {
      updateNodes(
        history.doc.selectedIds,
        (node) =>
          axis === "horizontal" ? { flipX: !node.flipX } : { flipY: !node.flipY },
        true
      )
    },
    [history.doc.selectedIds, updateNodes]
  )

  const alignSelection = React.useCallback((kind: AlignKind) => {
    setHistory((prev) => {
      const page =
        prev.doc.pages.find((p) => p.id === prev.doc.activePageId) ?? prev.doc.pages[0]
      const ids = getTopLevelSelection(prev.doc.selectedIds, page.nodes)
      if (ids.length === 0) return prev
      const nextNodes = { ...page.nodes }

      if (ids.length === 1) {
        const node = nextNodes[ids[0]]
        if (!node || !node.parentId || !nextNodes[node.parentId]) return prev
        const parent = nextNodes[node.parentId]
        const patch: Partial<DesignNode> = {}
        if (kind === "left") patch.x = 0
        if (kind === "center") patch.x = Math.round((parent.width - node.width) / 2)
        if (kind === "right") patch.x = Math.round(parent.width - node.width)
        if (kind === "top") patch.y = 0
        if (kind === "middle") patch.y = Math.round((parent.height - node.height) / 2)
        if (kind === "bottom") patch.y = Math.round(parent.height - node.height)
        nextNodes[node.id] = { ...node, ...patch }
      } else {
        const boxes = ids.map((id) => ({
          id,
          bounds: getAbsoluteBounds(page.nodes[id], page.nodes),
        }))
        const minX = Math.min(...boxes.map((b) => b.bounds.x))
        const maxX = Math.max(...boxes.map((b) => b.bounds.x + b.bounds.width))
        const minY = Math.min(...boxes.map((b) => b.bounds.y))
        const maxY = Math.max(...boxes.map((b) => b.bounds.y + b.bounds.height))
        const midX = (minX + maxX) / 2
        const midY = (minY + maxY) / 2

        for (const { id, bounds } of boxes) {
          const node = nextNodes[id]
          let dx = 0
          let dy = 0
          if (kind === "left") dx = minX - bounds.x
          if (kind === "center") dx = midX - (bounds.x + bounds.width / 2)
          if (kind === "right") dx = maxX - (bounds.x + bounds.width)
          if (kind === "top") dy = minY - bounds.y
          if (kind === "middle") dy = midY - (bounds.y + bounds.height / 2)
          if (kind === "bottom") dy = maxY - (bounds.y + bounds.height)
          nextNodes[id] = { ...node, x: Math.round(node.x + dx), y: Math.round(node.y + dy) }
        }
      }

      const nextPages = prev.doc.pages.map((p) =>
        p.id === page.id ? { ...p, nodes: nextNodes } : p
      )
      return {
        past: [...prev.past.slice(-(MAX_HISTORY - 1)), clonePages(prev.doc.pages)],
        future: [],
        doc: { ...prev.doc, pages: nextPages },
      }
    })
  }, [])

  const distributeSelection = React.useCallback((kind: DistributeKind) => {
    setHistory((prev) => {
      const page =
        prev.doc.pages.find((p) => p.id === prev.doc.activePageId) ?? prev.doc.pages[0]
      const ids = getTopLevelSelection(prev.doc.selectedIds, page.nodes)
      if (ids.length < 3) return prev
      const boxes = ids.map((id) => ({
        id,
        bounds: getAbsoluteBounds(page.nodes[id], page.nodes),
      }))
      const nextNodes = { ...page.nodes }

      if (kind === "horizontal") {
        boxes.sort((a, b) => a.bounds.x - b.bounds.x)
        const totalWidth = boxes.reduce((acc, b) => acc + b.bounds.width, 0)
        const span =
          boxes[boxes.length - 1].bounds.x +
          boxes[boxes.length - 1].bounds.width -
          boxes[0].bounds.x
        const gap = (span - totalWidth) / (boxes.length - 1)
        let cursor = boxes[0].bounds.x
        for (const item of boxes) {
          const dx = cursor - item.bounds.x
          nextNodes[item.id] = { ...nextNodes[item.id], x: Math.round(nextNodes[item.id].x + dx) }
          cursor += item.bounds.width + gap
        }
      } else {
        boxes.sort((a, b) => a.bounds.y - b.bounds.y)
        const totalHeight = boxes.reduce((acc, b) => acc + b.bounds.height, 0)
        const span =
          boxes[boxes.length - 1].bounds.y +
          boxes[boxes.length - 1].bounds.height -
          boxes[0].bounds.y
        const gap = (span - totalHeight) / (boxes.length - 1)
        let cursor = boxes[0].bounds.y
        for (const item of boxes) {
          const dy = cursor - item.bounds.y
          nextNodes[item.id] = { ...nextNodes[item.id], y: Math.round(nextNodes[item.id].y + dy) }
          cursor += item.bounds.height + gap
        }
      }

      const nextPages = prev.doc.pages.map((p) =>
        p.id === page.id ? { ...p, nodes: nextNodes } : p
      )
      return {
        past: [...prev.past.slice(-(MAX_HISTORY - 1)), clonePages(prev.doc.pages)],
        future: [],
        doc: { ...prev.doc, pages: nextPages },
      }
    })
  }, [])

  const reorderZOrder = React.useCallback((action: ZOrderAction, explicitIds?: string[]) => {
    setHistory((prev) => {
      const page =
        prev.doc.pages.find((p) => p.id === prev.doc.activePageId) ?? prev.doc.pages[0]
      const ids = explicitIds ?? prev.doc.selectedIds
      if (ids.length === 0) return prev
      const moving = collectWithDescendants(ids, page)
      const movingSet = new Set(moving)
      const rest = page.order.filter((id) => !movingSet.has(id))
      let nextOrder: string[] = [...page.order]

      if (action === "front") {
        nextOrder = [...rest, ...moving]
      } else if (action === "back") {
        nextOrder = [...moving, ...rest]
      } else if (action === "forward") {
        const lastIdx = Math.max(...moving.map((id) => page.order.indexOf(id)))
        const insertAt = Math.min(rest.length, Math.max(0, lastIdx - moving.length + 2))
        nextOrder = [...rest.slice(0, insertAt), ...moving, ...rest.slice(insertAt)]
      } else if (action === "backward") {
        const firstIdx = Math.min(...moving.map((id) => page.order.indexOf(id)))
        const insertAt = Math.max(0, firstIdx - 1)
        nextOrder = [...rest.slice(0, insertAt), ...moving, ...rest.slice(insertAt)]
      }

      const laidOut = computeAllAutoLayouts({ ...page, order: nextOrder })
      const nextPages = prev.doc.pages.map((p) => (p.id === page.id ? laidOut : p))
      return {
        past: [...prev.past.slice(-(MAX_HISTORY - 1)), clonePages(prev.doc.pages)],
        future: [],
        doc: { ...prev.doc, pages: nextPages },
      }
    })
  }, [])

  const undo = React.useCallback(() => {
    setHistory((prev) => {
      if (prev.past.length === 0) return prev
      const previousPages = prev.past[prev.past.length - 1]
      return {
        past: prev.past.slice(0, -1),
        future: [clonePages(prev.doc.pages), ...prev.future.slice(0, MAX_HISTORY - 1)],
        doc: { ...prev.doc, pages: previousPages, selectedIds: [] },
      }
    })
  }, [])

  const redo = React.useCallback(() => {
    setHistory((prev) => {
      if (prev.future.length === 0) return prev
      const nextPages = prev.future[0]
      return {
        past: [...prev.past.slice(-(MAX_HISTORY - 1)), clonePages(prev.doc.pages)],
        future: prev.future.slice(1),
        doc: { ...prev.doc, pages: nextPages, selectedIds: [] },
      }
    })
  }, [])

  const switchPage = React.useCallback((pageId: string) => {
    setEditingTextId(null)
    setHistory((prev) => {
      if (prev.doc.activePageId === pageId || !prev.doc.pages.some((p) => p.id === pageId)) {
        return prev
      }
      return { ...prev, doc: { ...prev.doc, activePageId: pageId, selectedIds: [] } }
    })
  }, [])

  const addPage = React.useCallback(() => {
    setHistory((prev) => {
      const nextNum = prev.doc.pages.length + 1
      const newPage: DesignPage = {
        id: createNodeId("page"),
        name: `Page ${nextNum}`,
        background: "#1e1e1e",
        nodes: {},
        order: [],
      }
      return {
        past: [...prev.past.slice(-(MAX_HISTORY - 1)), clonePages(prev.doc.pages)],
        future: [],
        doc: {
          ...prev.doc,
          pages: [...prev.doc.pages, newPage],
          activePageId: newPage.id,
          selectedIds: [],
        },
      }
    })
  }, [])

  const renamePage = React.useCallback((pageId: string, name: string) => {
    const trimmed = name.trim()
    if (!trimmed) return
    setHistory((prev) => ({
      ...prev,
      doc: {
        ...prev.doc,
        pages: prev.doc.pages.map((p) => (p.id === pageId ? { ...p, name: trimmed } : p)),
      },
    }))
  }, [])

  const setPageBackground = React.useCallback((background: string) => {
    setHistory((prev) => ({
      ...prev,
      doc: {
        ...prev.doc,
        pages: prev.doc.pages.map((p) =>
          p.id === prev.doc.activePageId ? { ...p, background } : p
        ),
      },
    }))
  }, [])

  const duplicatePage = React.useCallback((pageId: string) => {
    setHistory((prev) => {
      const target = prev.doc.pages.find((p) => p.id === pageId)
      if (!target) return prev
      const clone: DesignPage = {
        ...structuredClone(target),
        id: createNodeId("page"),
        name: `${target.name} Copy`,
      }
      return {
        past: [...prev.past.slice(-(MAX_HISTORY - 1)), clonePages(prev.doc.pages)],
        future: [],
        doc: {
          ...prev.doc,
          pages: [...prev.doc.pages, clone],
          activePageId: clone.id,
          selectedIds: [],
        },
      }
    })
  }, [])

  const deletePage = React.useCallback((pageId: string) => {
    setHistory((prev) => {
      if (prev.doc.pages.length <= 1) return prev
      const remaining = prev.doc.pages.filter((p) => p.id !== pageId)
      return {
        past: [...prev.past.slice(-(MAX_HISTORY - 1)), clonePages(prev.doc.pages)],
        future: [],
        doc: {
          ...prev.doc,
          pages: remaining,
          activePageId:
            prev.doc.activePageId === pageId ? remaining[0].id : prev.doc.activePageId,
          selectedIds: [],
        },
      }
    })
  }, [])

  const resetDocument = React.useCallback(() => {
    setEditingTextId(null)
    setHistory({ past: [], future: [], doc: createStarterDocument() })
  }, [])

  const newBlankDocument = React.useCallback(() => {
    setEditingTextId(null)
    const fresh = createStarterDocument()
    const blankPage: DesignPage = {
      id: "page-1",
      name: "Page 1",
      background: "#1e1e1e",
      nodes: {},
      order: [],
    }
    setHistory({
      past: [],
      future: [],
      doc: {
        ...fresh,
        title: "Untitled Design",
        pages: [blankPage],
        activePageId: "page-1",
        selectedIds: [],
        viewport: { x: 40, y: 40, zoom: 1 },
      },
    })
  }, [])

  const exportDocumentJson = React.useCallback(
    () => JSON.stringify(history.doc, null, 2),
    [history.doc]
  )

  const importDocumentJson = React.useCallback((raw: string): boolean => {
    try {
      const parsed = JSON.parse(raw) as DocumentState
      if (!parsed || !Array.isArray(parsed.pages) || parsed.pages.length === 0) {
        return false
      }
      setEditingTextId(null)
      setHistory({
        past: [],
        future: [],
        doc: {
          ...createStarterDocument(),
          ...parsed,
          version: 4,
          selectedIds: [],
          presentMode: false,
        },
      })
      return true
    } catch {
      return false
    }
  }, [])

  const zoomToBounds = React.useCallback(
    (ids: string[], canvasWidth: number, canvasHeight: number) => {
      setHistory((prev) => {
        const page =
          prev.doc.pages.find((p) => p.id === prev.doc.activePageId) ?? prev.doc.pages[0]
        const targetIds = ids.length > 0 ? ids : page.order
        let minX = Infinity
        let minY = Infinity
        let maxX = -Infinity
        let maxY = -Infinity
        for (const id of targetIds) {
          const n = page.nodes[id]
          if (!n || !n.visible) continue
          const b = getAbsoluteBounds(n, page.nodes)
          minX = Math.min(minX, b.x)
          minY = Math.min(minY, b.y)
          maxX = Math.max(maxX, b.x + b.width)
          maxY = Math.max(maxY, b.y + b.height)
        }
        if (!Number.isFinite(minX)) {
          return { ...prev, doc: { ...prev.doc, viewport: { x: 40, y: 40, zoom: 1 } } }
        }
        const safeLeft = prev.doc.showUI ? 268 : 48
        const safeRight = prev.doc.showUI ? 276 : 48
        const safeTop = 56
        const safeBottom = 84
        const availW = Math.max(200, canvasWidth - safeLeft - safeRight)
        const availH = Math.max(200, canvasHeight - safeTop - safeBottom)
        const w = Math.max(1, maxX - minX)
        const h = Math.max(1, maxY - minY)
        const zoom = Math.min(2, Math.max(0.12, Math.min(availW / w, availH / h)))
        const x = safeLeft + (availW - w * zoom) / 2 - minX * zoom
        const y = safeTop + (availH - h * zoom) / 2 - minY * zoom
        return {
          ...prev,
          doc: { ...prev.doc, viewport: { x, y, zoom } },
        }
      })
    },
    []
  )

  const zoomToFit = React.useCallback(
    (canvasWidth: number, canvasHeight: number) => zoomToBounds([], canvasWidth, canvasHeight),
    [zoomToBounds]
  )

  const zoomToSelection = React.useCallback(
    (canvasWidth: number, canvasHeight: number) =>
      zoomToBounds(history.doc.selectedIds, canvasWidth, canvasHeight),
    [zoomToBounds, history.doc.selectedIds]
  )

  const createQuickShape = React.useCallback(
    (type: NodeType) => {
      const vp = history.doc.viewport
      const cx = Math.round((640 - vp.x) / vp.zoom)
      const cy = Math.round((540 - vp.y) / vp.zoom)
      const id = createNodeId(type)
      const isText = type === "text"
      const isSection = type === "section"
      const isFrame = type === "frame" || type === "component"
      const isLine = type === "line"
      const node: DesignNode = {
        id,
        name: isSection ? "Section 1" : `${type.charAt(0).toUpperCase()}${type.slice(1)}`,
        type,
        parentId: null,
        x: cx,
        y: cy,
        width: isSection ? 480 : isFrame ? 320 : isText ? 180 : 140,
        height: isSection ? 340 : isFrame ? 240 : isLine ? 2 : isText ? 34 : 120,
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
                    : isText
                      ? "#f8fafc"
                      : type === "star"
                        ? "#facc15"
                        : "#0c8ce9"
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
        cornerRadius: isSection ? 12 : type === "rectangle" || isFrame ? 10 : 0,
        blendMode: "normal",
        ...(isText
          ? {
              text: "New Text",
              fontFamily: "Inter",
              fontSize: 22,
              fontWeight: 600,
              textAlign: "left" as const,
              lineHeight: 1.3,
              letterSpacing: 0,
            }
          : {}),
      }
      addNode(node, true)
      setTool("select")
    },
    [addNode, history.doc.viewport, setTool]
  )

  const createFrameFromPreset = React.useCallback(
    (preset: FramePreset, canvasWidth = 960, canvasHeight = 640) => {
      const vp = history.doc.viewport
      const centerX = (canvasWidth / 2 - vp.x) / vp.zoom
      const centerY = (canvasHeight / 2 - vp.y) / vp.zoom
      const node: DesignNode = {
        id: createNodeId("frame"),
        name: preset.name,
        type: "frame",
        parentId: null,
        x: Math.round(centerX - preset.width / 2),
        y: Math.round(centerY - preset.height / 2),
        width: preset.width,
        height: preset.height,
        rotation: 0,
        opacity: 1,
        visible: true,
        locked: false,
        clipContent: true,
        fills: [solidFill("#111318", "var-surface")],
        strokes: [
          {
            id: createNodeId("stroke"),
            visible: true,
            color: "#2d3340",
            variableId: "var-border",
            width: 1,
            opacity: 1,
            style: "solid",
            align: "inside",
          },
        ],
        effects: [
          {
            id: createNodeId("fx"),
            type: "drop-shadow",
            visible: true,
            x: 0,
            y: 20,
            blur: 44,
            spread: 0,
            color: "rgba(0,0,0,0.4)",
          },
        ],
        cornerRadius: preset.category === "Phone" ? 36 : preset.category === "Tablet" ? 20 : 8,
        blendMode: "normal",
      }
      addNode(node, true)
      setTool("select")
    },
    [addNode, history.doc.viewport, setTool]
  )

  const insertImageFromFile = React.useCallback(
    async (file: File, position?: Point) => {
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => resolve(String(reader.result))
        reader.onerror = () => reject(new Error("Failed to read image"))
        reader.readAsDataURL(file)
      })
      const dims = await new Promise<{ w: number; h: number }>((resolve) => {
        const img = new Image()
        img.onload = () => {
          const maxDim = 360
          const scale = Math.min(1, maxDim / Math.max(img.naturalWidth || 300, img.naturalHeight || 240))
          resolve({
            w: Math.max(40, Math.round((img.naturalWidth || 300) * scale)),
            h: Math.max(40, Math.round((img.naturalHeight || 240) * scale)),
          })
        }
        img.onerror = () => resolve({ w: 280, h: 200 })
        img.src = dataUrl
      })
      const vp = history.doc.viewport
      const x = position ? Math.round(position.x) : Math.round((320 - vp.x) / vp.zoom)
      const y = position ? Math.round(position.y) : Math.round((180 - vp.y) / vp.zoom)
      const node: DesignNode = {
        id: createNodeId("image"),
        name: file.name.replace(/\.[^.]+$/, "") || "Image",
        type: "image",
        parentId: null,
        x,
        y,
        width: dims.w,
        height: dims.h,
        rotation: 0,
        opacity: 1,
        visible: true,
        locked: false,
        fills: [
          {
            id: createNodeId("fill"),
            type: "image",
            visible: true,
            opacity: 1,
            color: "#1e222b",
            imageUrl: dataUrl,
            imageScaleMode: "cover",
          },
        ],
        strokes: [],
        effects: [],
        cornerRadius: 8,
        blendMode: "normal",
      }
      addNode(node, true)
      setTool("select")
    },
    [addNode, history.doc.viewport, setTool]
  )

  const setActiveVariableMode = React.useCallback((modeId: string) => {
    setHistory((prev) => ({
      ...prev,
      doc: {
        ...prev.doc,
        variables: { ...prev.doc.variables, activeModeId: modeId },
      },
    }))
  }, [])

  const addVariable = React.useCallback((type: "color" | "number") => {
    setHistory((prev) => {
      const count = prev.doc.variables.variables.length + 1
      const values: Record<string, string | number> = {}
      for (const mode of prev.doc.variables.modes) {
        values[mode.id] = type === "color" ? "#38bdf8" : 16
      }
      const nextVar: DesignVariable = {
        id: createNodeId("var"),
        name: type === "color" ? `color/token-${count}` : `space/token-${count}`,
        type,
        values,
      }
      return {
        ...prev,
        doc: {
          ...prev.doc,
          variables: {
            ...prev.doc.variables,
            variables: [...prev.doc.variables.variables, nextVar],
          },
        },
      }
    })
  }, [])

  const updateVariable = React.useCallback((id: string, patch: Partial<DesignVariable>) => {
    setHistory((prev) => ({
      ...prev,
      doc: {
        ...prev.doc,
        variables: {
          ...prev.doc.variables,
          variables: prev.doc.variables.variables.map((v) =>
            v.id === id ? { ...v, ...patch } : v
          ),
        },
      },
    }))
  }, [])

  const updateVariableModeValue = React.useCallback(
    (id: string, modeId: string, value: string | number) => {
      setHistory((prev) => ({
        ...prev,
        doc: {
          ...prev.doc,
          variables: {
            ...prev.doc.variables,
            variables: prev.doc.variables.variables.map((v) =>
              v.id === id ? { ...v, values: { ...v.values, [modeId]: value } } : v
            ),
          },
        },
      }))
    },
    []
  )

  const deleteVariable = React.useCallback((id: string) => {
    setHistory((prev) => ({
      ...prev,
      doc: {
        ...prev.doc,
        variables: {
          ...prev.doc.variables,
          variables: prev.doc.variables.variables.filter((v) => v.id !== id),
        },
      },
    }))
  }, [])

  const toggleShowUI = React.useCallback((value?: boolean) => {
    setHistory((prev) => ({
      ...prev,
      doc: { ...prev.doc, showUI: value === undefined ? !prev.doc.showUI : value },
    }))
  }, [])

  const setDevMode = React.useCallback((value: boolean | ((prev: boolean) => boolean)) => {
    setHistory((prev) => ({
      ...prev,
      doc: {
        ...prev.doc,
        devMode: typeof value === "function" ? value(prev.doc.devMode) : value,
      },
    }))
  }, [])

  const setPresentMode = React.useCallback((value: boolean) => {
    setHistory((prev) => ({
      ...prev,
      doc: { ...prev.doc, presentMode: value },
    }))
  }, [])

  const addComment = React.useCallback(
    (x: number, y: number, text: string, parentId?: string | null) => {
      const id = createNodeId("comment")
      updateActivePage((page) => ({
        page: {
          ...page,
          comments: [
            ...(page.comments ?? []),
            {
              id,
              parentId: parentId ?? null,
              x: Math.round(x),
              y: Math.round(y),
              author: "You",
              avatarColor: "#0d99ff",
              text: text.trim() || "New comment",
              createdAt: "Just now",
              resolved: false,
              replies: [],
            },
          ],
        },
      }))
      return id
    },
    [updateActivePage]
  )

  const moveComment = React.useCallback(
    (commentId: string, x: number, y: number, parentId: string | null) => {
      updateActivePage(
        (page) => ({
          page: {
            ...page,
            comments: (page.comments ?? []).map((c) =>
              c.id === commentId
                ? { ...c, parentId, x: Math.round(x), y: Math.round(y) }
                : c
            ),
          },
        }),
        false
      )
    },
    [updateActivePage]
  )

  const replyComment = React.useCallback(
    (commentId: string, text: string) => {
      const clean = text.trim()
      if (!clean) return
      updateActivePage((page) => ({
        page: {
          ...page,
          comments: (page.comments ?? []).map((c) =>
            c.id === commentId
              ? {
                  ...c,
                  replies: [
                    ...c.replies,
                    { id: createNodeId("reply"), author: "You", text: clean, createdAt: "Just now" },
                  ],
                }
              : c
          ),
        },
      }))
    },
    [updateActivePage]
  )

  const toggleResolveComment = React.useCallback(
    (commentId: string) => {
      updateActivePage((page) => ({
        page: {
          ...page,
          comments: (page.comments ?? []).map((c) =>
            c.id === commentId ? { ...c, resolved: !c.resolved } : c
          ),
        },
      }))
    },
    [updateActivePage]
  )

  const deleteComment = React.useCallback(
    (commentId: string) => {
      updateActivePage((page) => ({
        page: {
          ...page,
          comments: (page.comments ?? []).filter((c) => c.id !== commentId),
        },
      }))
    },
    [updateActivePage]
  )

  const addGuide = React.useCallback(
    (axis: "x" | "y", position: number): string => {
      const id = createNodeId("guide")
      const rounded = Math.round(position)
      updateActivePage((page) => ({
        page: {
          ...page,
          guides: [...(page.guides ?? []), { id, axis, position: rounded }],
        },
      }))
      return id
    },
    [updateActivePage]
  )

  const moveGuide = React.useCallback(
    (guideId: string, position: number) => {
      const rounded = Math.round(position)
      updateActivePage(
        (page) => ({
          page: {
            ...page,
            guides: (page.guides ?? []).map((g) =>
              g.id === guideId ? { ...g, position: rounded } : g
            ),
          },
        }),
        false
      )
    },
    [updateActivePage]
  )

  const removeGuide = React.useCallback(
    (guideId: string) => {
      updateActivePage((page) => ({
        page: {
          ...page,
          guides: (page.guides ?? []).filter((g) => g.id !== guideId),
        },
      }))
    },
    [updateActivePage]
  )

  const clearGuides = React.useCallback(() => {
    updateActivePage((page) => ({
      page: {
        ...page,
        guides: [],
      },
    }))
  }, [updateActivePage])

  const activePage = React.useMemo(
    () => history.doc.pages.find((p) => p.id === history.doc.activePageId) ?? history.doc.pages[0],
    [history.doc.pages, history.doc.activePageId]
  )

  const selectedNodes = React.useMemo(
    () => history.doc.selectedIds.map((id) => activePage.nodes[id]).filter(Boolean),
    [history.doc.selectedIds, activePage.nodes]
  )

  const localComponents = React.useMemo(
    () =>
      activePage.order
        .map((id) => activePage.nodes[id])
        .filter((n): n is DesignNode => Boolean(n && n.type === "component")),
    [activePage]
  )

  const value = React.useMemo<DesignStoreContextValue>(
    () => ({
      doc: history.doc,
      activePage,
      selectedNodes,
      localComponents,
      canUndo: history.past.length > 0,
      canRedo: history.future.length > 0,
      editingTextId,
      setEditingTextId,
      setTitle,
      setTool,
      setViewport,
      setSelectedIds,
      toggleFlag,
      commitCheckpoint,
      addNode,
      insertNodes,
      updateNodes,
      deleteSelection,
      duplicateSelection,
      copySelection,
      pasteClipboard,
      selectAll,
      frameSelection,
      ungroupSelection,
      toggleAutoLayout,
      createComponentFromSelection,
      insertComponentInstance,
      detachInstance,
      reparentNode,
      nudgeSelection,
      flipSelection,
      alignSelection,
      distributeSelection,
      reorderZOrder,
      undo,
      redo,
      switchPage,
      addPage,
      renamePage,
      setPageBackground,
      duplicatePage,
      deletePage,
      resetDocument,
      newBlankDocument,
      exportDocumentJson,
      importDocumentJson,
      zoomToFit,
      zoomToSelection,
      createQuickShape,
      createFrameFromPreset,
      insertImageFromFile,
      setActiveVariableMode,
      addVariable,
      updateVariable,
      updateVariableModeValue,
      deleteVariable,
      toggleShowUI,
      setDevMode,
      setPresentMode,
      addComment,
      moveComment,
      replyComment,
      toggleResolveComment,
      deleteComment,
      addGuide,
      moveGuide,
      removeGuide,
      clearGuides,
    }),
    [
      history.doc,
      history.past.length,
      history.future.length,
      activePage,
      selectedNodes,
      localComponents,
      editingTextId,
      setTitle,
      setTool,
      setViewport,
      setSelectedIds,
      toggleFlag,
      commitCheckpoint,
      addNode,
      insertNodes,
      updateNodes,
      deleteSelection,
      duplicateSelection,
      copySelection,
      pasteClipboard,
      selectAll,
      frameSelection,
      ungroupSelection,
      toggleAutoLayout,
      createComponentFromSelection,
      insertComponentInstance,
      detachInstance,
      reparentNode,
      nudgeSelection,
      flipSelection,
      alignSelection,
      distributeSelection,
      reorderZOrder,
      undo,
      redo,
      switchPage,
      addPage,
      renamePage,
      setPageBackground,
      duplicatePage,
      deletePage,
      resetDocument,
      newBlankDocument,
      exportDocumentJson,
      importDocumentJson,
      zoomToFit,
      zoomToSelection,
      createQuickShape,
      createFrameFromPreset,
      insertImageFromFile,
      setActiveVariableMode,
      addVariable,
      updateVariable,
      updateVariableModeValue,
      deleteVariable,
      toggleShowUI,
      setDevMode,
      setPresentMode,
      addComment,
      moveComment,
      replyComment,
      toggleResolveComment,
      deleteComment,
      addGuide,
      moveGuide,
      removeGuide,
      clearGuides,
    ]
  )

  return <DesignStoreContext.Provider value={value}>{children}</DesignStoreContext.Provider>
}

export function useDesignStore(): DesignStoreContextValue {
  const ctx = React.useContext(DesignStoreContext)
  if (!ctx) throw new Error("useDesignStore must be used inside DesignStoreProvider")
  return ctx
}
