"use client"

import * as React from "react"
import { Button } from "@ui-sdk/react/button"
import {
  Menu,
  MenuCheckboxItem,
  MenuContent,
  MenuItem,
  MenuItemIndicator,
  MenuSeparator,
  MenuSub,
  MenuSubContent,
  MenuSubTrigger,
  MenuTrigger,
} from "@ui-sdk/react/menu"
import {
  ScrollArea,
  ScrollAreaContent,
  ScrollAreaScrollbar,
  ScrollAreaThumb,
  ScrollAreaViewport,
} from "@ui-sdk/react/scroll-area"
import { Tabs, TabsList, TabsPanel, TabsTab } from "@ui-sdk/react/tabs"
import {
  Tree,
  TreeGroup,
  TreeItem,
  TreeItemIndicator,
  TreeItemLabel,
  type TreeItemData,
} from "@ui-sdk/react/tree"
import { toast } from "@ui-sdk/react/toast"
import {
  ArrowUpIcon,
  BotIcon,
  BriefcaseIcon,
  CheckIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  ChevronsDownUpIcon,
  ChevronsUpDownIcon,
  CircleIcon,
  CirclePlusIcon,
  ComponentIcon,
  DiamondIcon,
  FileTextIcon,
  FrameIcon,
  HexagonIcon,
  ImageIcon,
  Link2Icon,
  LockIcon,
  MinusIcon,
  PanelLeftCloseIcon,
  PenToolIcon,
  SearchIcon,
  SmartphoneIcon,
  SparklesIcon,
  SquareDashedIcon,
  SquareIcon,
  StarIcon,
  Trash2Icon,
  TriangleIcon,
  TypeIcon,
  UnlockIcon,
} from "lucide-react"
import { ASSET_TEMPLATES, useDesignStore } from "../store/useDesignStore"
import { FRAME_PRESETS, type DesignNode } from "../types/design"
import { OpenFigmaLogo } from "./OpenFigmaLogo"
import {
  ActionButton,
  ColorField,
  FigmaChevronDownIcon,
  FigmaEyeIcon,
  FigmaEyeOffIcon,
  FigmaMoreIcon,
  FigmaPlusIcon,
  IconButton,
  IconMenuTrigger,
  SegmentedField,
  TextField,
} from "./ui"

type LayerTypeFilter = "all" | "frame" | "text" | "component" | "shape"
type VariableTypeFilter = "all" | "color" | "number"
type DropPosition = "into" | "before" | "after"

interface LayerContextMenuState {
  nodeId: string
  x: number
  y: number
}

interface PageContextMenuState {
  pageId: string
  x: number
  y: number
}

interface AgentLogEntry {
  id: string
  prompt: string
  result: string
}

const LAYER_FILTER_OPTIONS: { value: LayerTypeFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "frame", label: "Frames" },
  { value: "text", label: "Text" },
  { value: "component", label: "Components" },
  { value: "shape", label: "Shapes" },
]

const VARIABLE_FILTER_OPTIONS: { value: VariableTypeFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "color", label: "Colors" },
  { value: "number", label: "Numbers" },
]

interface ToolCatalogItem {
  id: string
  label: string
  shortcut?: string
  category: "Create" | "Arrange & Layout" | "View & Code"
  action: string
}

const TOOL_CATALOG: ToolCatalogItem[] = [
  { id: "quick", label: "Quick Actions", shortcut: "Ctrl+K", category: "View & Code", action: "quick-actions" },
  { id: "frame", label: "Insert Frame", shortcut: "F", category: "Create", action: "insert-frame" },
  { id: "section", label: "Insert Section", shortcut: "Shift+S", category: "Create", action: "insert-section" },
  { id: "rect", label: "Insert Rectangle", shortcut: "R", category: "Create", action: "insert-rect" },
  { id: "ellipse", label: "Insert Ellipse", shortcut: "O", category: "Create", action: "insert-ellipse" },
  { id: "star", label: "Insert Star", category: "Create", action: "insert-star" },
  { id: "text", label: "Insert Text Layer", shortcut: "T", category: "Create", action: "insert-text" },
  { id: "auto-layout", label: "Add / Toggle Auto Layout", shortcut: "Shift+A", category: "Arrange & Layout", action: "auto-layout" },
  { id: "frame-sel", label: "Frame Selection", shortcut: "Ctrl+G", category: "Arrange & Layout", action: "frame-selection" },
  { id: "component", label: "Create Component", shortcut: "Ctrl+Alt+K", category: "Arrange & Layout", action: "create-component" },
  { id: "zoom-fit", label: "Zoom to Fit", shortcut: "Shift+1", category: "View & Code", action: "zoom-fit" },
  { id: "dev-mode", label: "Toggle Dev Mode", shortcut: "Shift+D", category: "View & Code", action: "toggle-dev-mode" },
  { id: "shortcuts", label: "Keyboard Shortcuts", shortcut: "?", category: "View & Code", action: "shortcuts" },
]

function matchesLayerTypeFilter(node: DesignNode, filter: LayerTypeFilter): boolean {
  if (filter === "all") return true
  if (filter === "frame") return node.type === "frame" || node.type === "section"
  if (filter === "text") return node.type === "text"
  if (filter === "component") return node.type === "component" || node.type === "instance"
  return (
    node.type === "rectangle" ||
    node.type === "ellipse" ||
    node.type === "line" ||
    node.type === "polygon" ||
    node.type === "star" ||
    node.type === "path" ||
    node.type === "image"
  )
}

function NodeTypeIcon({ node, selected }: { node: DesignNode; selected?: boolean }) {
  const isComp = node.type === "component" || node.type === "instance"
  const tone = isComp
    ? "text-[var(--color-text-component)]"
    : selected
      ? "text-[var(--color-icon)]"
      : "text-[var(--color-icon-secondary)]"
  const barBg = selected ? "bg-[var(--color-icon)]" : "bg-[var(--color-icon-secondary)]"
  const cls = `h-3 w-3 shrink-0 ${tone}`

  switch (node.type) {
    case "frame":
      if (node.layout && node.layout.mode === "horizontal") {
        return (
          <span
            aria-hidden="true"
            className="inline-flex h-3 w-3 shrink-0 items-center justify-center gap-[1.5px]"
          >
            <span className={`h-2.5 w-[2.5px] rounded-[0.5px] ${barBg}`} />
            <span className={`h-2.5 w-[2.5px] rounded-[0.5px] ${barBg}`} />
          </span>
        )
      }
      if (node.layout && node.layout.mode === "vertical") {
        return (
          <span
            aria-hidden="true"
            className="inline-flex h-3 w-3 shrink-0 flex-col items-center justify-center gap-[1.5px]"
          >
            <span className={`h-[2.5px] w-2.5 rounded-[0.5px] ${barBg}`} />
            <span className={`h-[2.5px] w-2.5 rounded-[0.5px] ${barBg}`} />
          </span>
        )
      }
      return <FrameIcon aria-hidden="true" className={cls} />
    case "section":
      return <SquareDashedIcon aria-hidden="true" className={cls} />
    case "component":
      return <ComponentIcon aria-hidden="true" className={cls} />
    case "instance":
      return <DiamondIcon aria-hidden="true" className={cls} />
    case "rectangle":
      return <SquareIcon aria-hidden="true" className={cls} />
    case "ellipse":
      return <CircleIcon aria-hidden="true" className={cls} />
    case "line":
      return <MinusIcon aria-hidden="true" className={cls} />
    case "polygon":
      return <TriangleIcon aria-hidden="true" className={cls} />
    case "star":
      return <StarIcon aria-hidden="true" className={cls} />
    case "text":
      return <TypeIcon aria-hidden="true" className={cls} />
    case "path":
      return <PenToolIcon aria-hidden="true" className={cls} />
    case "image":
      return <ImageIcon aria-hidden="true" className={cls} />
  }
}

interface LayerTreeNode extends TreeItemData {
  node: DesignNode
  children?: LayerTreeNode[]
}

interface LeftSidebarProps {
  onRunAction: (action: string) => void
  onOpenCommand: () => void
  onOpenShortcuts: () => void
  onOpenAgent: () => void
}

export function LeftSidebar({
  onRunAction,
  onOpenCommand,
  onOpenShortcuts,
  onOpenAgent,
}: LeftSidebarProps) {
  const {
    doc,
    activePage,
    localComponents,
    canUndo,
    canRedo,
    setTitle,
    setSelectedIds,
    updateNodes,
    reparentNode,
    switchPage,
    addPage,
    renamePage,
    duplicatePage,
    deletePage,
    insertNodes,
    insertComponentInstance,
    createFrameFromPreset,
    toggleFlag,
    toggleShowUI,
    setActiveVariableMode,
    addVariable,
    updateVariable,
    updateVariableModeValue,
    deleteVariable,
  } = useDesignStore()

  const [activeTab, setActiveTab] = React.useState("file")
  const [expanded, setExpanded] = React.useState<string[]>([
    "frame-hero",
    "hero-badge",
    "hero-actions",
    "comp-primary-btn",
    "hero-cta-secondary",
    "frame-mobile",
    "mobile-banner",
    "mobile-footer",
    "mobile-pill",
    "wf-frame",
    "wf-cards",
  ])
  const [pagesOpen, setPagesOpen] = React.useState(true)
  const [searchVisible, setSearchVisible] = React.useState(false)
  const [layerQuery, setLayerQuery] = React.useState("")
  const [layerTypeFilter, setLayerTypeFilter] = React.useState<LayerTypeFilter>("all")
  const [assetQuery, setAssetQuery] = React.useState("")
  const [toolQuery, setToolQuery] = React.useState("")
  const [variableQuery, setVariableQuery] = React.useState("")
  const [variableTypeFilter, setVariableTypeFilter] = React.useState<VariableTypeFilter>("all")
  const [agentPrompt, setAgentPrompt] = React.useState("")
  const [agentLog, setAgentLog] = React.useState<AgentLogEntry[]>([])
  const [localAssetsOpen, setLocalAssetsOpen] = React.useState(true)
  const [uiKitOpen, setUiKitOpen] = React.useState(true)
  const [presetsOpen, setPresetsOpen] = React.useState(true)

  const [renamingId, setRenamingId] = React.useState<string | null>(null)
  const [renameDraft, setRenameDraft] = React.useState("")
  const [renamingPageId, setRenamingPageId] = React.useState<string | null>(null)
  const [pageRenameDraft, setPageRenameDraft] = React.useState("")
  const [draggedId, setDraggedId] = React.useState<string | null>(null)
  const [dragOver, setDragOver] = React.useState<{ id: string; position: DropPosition } | null>(null)
  const [contextMenu, setContextMenu] = React.useState<LayerContextMenuState | null>(null)
  const [pageContextMenu, setPageContextMenu] = React.useState<PageContextMenuState | null>(null)

  const treeClickRef = React.useRef<{ id: string; additive: boolean; range: boolean } | null>(null)
  const lastSelectedAnchorRef = React.useRef<string | null>(doc.selectedIds[0] ?? null)
  const titleContainerRef = React.useRef<HTMLDivElement>(null)
  const searchContainerRef = React.useRef<HTMLDivElement>(null)

  // Auto-expand ancestors of selected layers so selection is always visible in the Layers tree.
  React.useEffect(() => {
    if (doc.selectedIds.length === 0) return
    const ancestorsToOpen: string[] = []
    for (const id of doc.selectedIds) {
      let cur = activePage.nodes[id]
      while (cur?.parentId) {
        ancestorsToOpen.push(cur.parentId)
        cur = activePage.nodes[cur.parentId]
      }
    }
    if (ancestorsToOpen.length === 0) return
    setExpanded((prev) => {
      const missing = ancestorsToOpen.filter((a) => !prev.includes(a))
      return missing.length > 0 ? [...prev, ...missing] : prev
    })
  }, [doc.selectedIds, activePage.nodes])

  // Dismiss floating context menus on outside pointerdown or Escape.
  React.useEffect(() => {
    if (!contextMenu && !pageContextMenu) return
    const onPointerDown = (e: PointerEvent) => {
      const target = e.target as HTMLElement | null
      if (target?.closest("[data-figma-context-menu]")) return
      setContextMenu(null)
      setPageContextMenu(null)
    }
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setContextMenu(null)
        setPageContextMenu(null)
      }
    }
    window.addEventListener("pointerdown", onPointerDown, true)
    window.addEventListener("keydown", onKeyDown)
    return () => {
      window.removeEventListener("pointerdown", onPointerDown, true)
      window.removeEventListener("keydown", onKeyDown)
    }
  }, [contextMenu, pageContextMenu])

  // Collect all expandable container IDs on the active page (for Collapse/Expand all).
  const allExpandableIds = React.useMemo(() => {
    const parentIds = new Set<string>()
    for (const id of activePage.order) {
      const node = activePage.nodes[id]
      if (node?.parentId && activePage.nodes[node.parentId]) {
        parentIds.add(node.parentId)
      }
    }
    return Array.from(parentIds)
  }, [activePage])

  const hasExpandedContainers = React.useMemo(
    () => allExpandableIds.some((id) => expanded.includes(id)),
    [allExpandableIds, expanded]
  )

  const toggleCollapseExpandAll = React.useCallback(() => {
    if (hasExpandedContainers) {
      setExpanded([])
    } else {
      setExpanded(allExpandableIds)
    }
  }, [hasExpandedContainers, allExpandableIds])

  // Keyboard shortcuts: F2 rename, Ctrl/Cmd+F find layers, Alt+L collapse/expand all layers.
  React.useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null
      const inEditable =
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        Boolean(target?.isContentEditable)

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "f") {
        e.preventDefault()
        setActiveTab("file")
        setSearchVisible(true)
        requestAnimationFrame(() => {
          const input = searchContainerRef.current?.querySelector("input")
          input?.focus()
          input?.select()
        })
        return
      }

      if (inEditable) return

      if (e.altKey && !e.ctrlKey && !e.metaKey && e.key.toLowerCase() === "l") {
        e.preventDefault()
        toggleCollapseExpandAll()
        return
      }

      if (e.key === "F2" && doc.selectedIds.length === 1 && !renamingId) {
        const node = activePage.nodes[doc.selectedIds[0]]
        if (node) {
          e.preventDefault()
          setRenamingId(node.id)
          setRenameDraft(node.name)
        }
      }
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [doc.selectedIds, activePage.nodes, renamingId, toggleCollapseExpandAll])

  const isFilteringLayers = layerQuery.trim().length > 0 || layerTypeFilter !== "all"

  const { treeData, matchCount } = React.useMemo(() => {
    const query = layerQuery.trim().toLowerCase()
    const childrenMap = new Map<string | null, DesignNode[]>()
    for (let i = activePage.order.length - 1; i >= 0; i--) {
      const id = activePage.order[i]
      const node = activePage.nodes[id]
      if (!node) continue
      const key = node.parentId && activePage.nodes[node.parentId] ? node.parentId : null
      const list = childrenMap.get(key) ?? []
      list.push(node)
      childrenMap.set(key, list)
    }

    let matchesTotal = 0
    const build = (parentId: string | null): LayerTreeNode[] => {
      const list = childrenMap.get(parentId) ?? []
      const result: LayerTreeNode[] = []
      for (const node of list) {
        const kids = build(node.id)
        const queryMatch =
          !query ||
          node.name.toLowerCase().includes(query) ||
          node.type.toLowerCase().includes(query)
        const typeMatch = matchesLayerTypeFilter(node, layerTypeFilter)
        const directMatch = queryMatch && typeMatch
        if (directMatch) matchesTotal += 1
        if (directMatch || kids.length > 0) {
          result.push({
            value: node.id,
            label: node.name,
            node,
            ...(kids.length > 0 ? { children: kids } : {}),
          })
        }
      }
      return result
    }
    return { treeData: build(null), matchCount: matchesTotal }
  }, [activePage, layerQuery, layerTypeFilter])

  // Flattened visible order for authentic Figma Shift+Click range selection.
  const visibleLayerIds = React.useMemo(() => {
    const ids: string[] = []
    const walk = (items: LayerTreeNode[]) => {
      for (const item of items) {
        ids.push(item.value)
        if (item.children && (isFilteringLayers || expanded.includes(item.value))) {
          walk(item.children)
        }
      }
    }
    walk(treeData)
    return ids
  }, [treeData, expanded, isFilteringLayers])

  const commitRename = (id: string) => {
    const trimmed = renameDraft.trim()
    if (trimmed) updateNodes([id], { name: trimmed })
    setRenamingId(null)
  }

  const commitPageRename = (pageId: string) => {
    const trimmed = pageRenameDraft.trim()
    if (trimmed) renamePage(pageId, trimmed)
    setRenamingPageId(null)
  }

  const handleDropOnLayer = (targetNode: DesignNode, position: DropPosition) => {
    if (!draggedId || draggedId === targetNode.id) return
    const isContainer =
      targetNode.type === "frame" ||
      targetNode.type === "component" ||
      targetNode.type === "section"
    if (position === "into" && isContainer) {
      reparentNode(draggedId, targetNode.id)
      if (!expanded.includes(targetNode.id)) {
        setExpanded((prev) => [...prev, targetNode.id])
      }
    } else {
      const idx = activePage.order.indexOf(targetNode.id)
      // Tree renders activePage.order in reverse (higher index = visually higher in tree).
      const targetIndex = position === "before" ? idx + 1 : Math.max(0, idx)
      reparentNode(draggedId, targetNode.parentId, targetIndex)
    }
    setDraggedId(null)
    setDragOver(null)
  }

  const insertTemplateAtViewportCenter = React.useCallback(
    (templateIndex: number) => {
      const asset = ASSET_TEMPLATES[templateIndex] ?? ASSET_TEMPLATES[0]
      if (!asset) return null
      const vp = doc.viewport
      const x = Math.round((640 - vp.x) / vp.zoom)
      const y = Math.round((540 - vp.y) / vp.zoom)
      insertNodes(asset.build(x, y), true)
      toast(`Inserted ${asset.name}`)
      return asset.name
    },
    [doc.viewport, insertNodes]
  )

  const handleAgentSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const raw = agentPrompt.trim()
    if (!raw) return
    const q = raw.toLowerCase()
    let outcome = ""

    if (q.includes("light")) {
      const lightMode = doc.variables.modes.find((m) => m.name.toLowerCase().includes("light"))
      if (lightMode) {
        setActiveVariableMode(lightMode.id)
        outcome = `Switched variables to ${lightMode.name} mode.`
      }
    } else if (q.includes("dark")) {
      const darkMode = doc.variables.modes.find((m) => m.name.toLowerCase().includes("dark"))
      if (darkMode) {
        setActiveVariableMode(darkMode.id)
        outcome = `Switched variables to ${darkMode.name} mode.`
      }
    } else if (q.includes("auto layout") || q.includes("tidy") || q.includes("stack")) {
      onRunAction("auto-layout")
      outcome = "Toggled Auto Layout on current selection."
    } else if (q.includes("metric") || q.includes("card")) {
      const idx = ASSET_TEMPLATES.findIndex((a) => a.name.toLowerCase().includes("card"))
      const inserted = insertTemplateAtViewportCenter(idx >= 0 ? idx : 0)
      outcome = `Generated ${inserted ?? "UI Card"} on canvas.`
    } else if (q.includes("button") || q.includes("cta")) {
      const idx = ASSET_TEMPLATES.findIndex((a) => a.name.toLowerCase().includes("button"))
      const inserted = insertTemplateAtViewportCenter(idx >= 0 ? idx : 0)
      outcome = `Generated ${inserted ?? "Primary Button"} on canvas.`
    } else if (q.includes("nav") || q.includes("header")) {
      const idx = ASSET_TEMPLATES.findIndex((a) => a.name.toLowerCase().includes("nav"))
      const inserted = insertTemplateAtViewportCenter(idx >= 0 ? idx : 0)
      outcome = `Generated ${inserted ?? "Navigation"} on canvas.`
    } else if (q.includes("frame")) {
      onRunAction("insert-frame")
      outcome = "Inserted a new Frame layer."
    } else if (q.includes("text") || q.includes("heading")) {
      onRunAction("insert-text")
      outcome = "Inserted a new Text layer."
    } else if (q.includes("circle") || q.includes("ellipse")) {
      onRunAction("insert-ellipse")
      outcome = "Inserted a new Ellipse layer."
    } else if (q.includes("star")) {
      onRunAction("insert-star")
      outcome = "Inserted a new Star layer."
    } else if (q.includes("rect") || q.includes("box")) {
      onRunAction("insert-rect")
      outcome = "Inserted a new Rectangle layer."
    } else if (q.includes("component")) {
      onRunAction("create-component")
      outcome = "Converted selection into a Component."
    } else if (q.includes("duplicate")) {
      onRunAction("duplicate")
      outcome = "Duplicated current selection."
    } else if (q.includes("delete") || q.includes("remove")) {
      onRunAction("delete")
      outcome = "Deleted current selection."
    } else if (q.includes("fit") || q.includes("zoom")) {
      onRunAction("zoom-fit")
      outcome = "Zoomed canvas to fit all layers."
    } else if (q.includes("dev") || q.includes("inspect") || q.includes("code")) {
      onRunAction("toggle-dev-mode")
      outcome = "Toggled Dev Mode Inspect panel."
    } else if (q.includes("present") || q.includes("preview")) {
      onRunAction("present")
      outcome = "Opened Prototype Presentation mode."
    } else if (q.includes("snapshot") || q.includes("agent")) {
      onOpenAgent()
      outcome = "Opened UI SDK Agent Snapshot."
    } else {
      onOpenCommand()
      outcome = "Opened Quick Actions to run custom command."
    }

    setAgentLog((prev) => [{ id: `log-${Date.now()}`, prompt: raw, result: outcome }, ...prev].slice(0, 6))
    setAgentPrompt("")
  }

  const renderTreeItems = (
    items: LayerTreeNode[],
    inheritedSelection: "none" | "frame" | "component" = "none"
  ) =>
    items.map((item) => {
      const { node } = item
      const isRenaming = renamingId === node.id
      const dropPos = dragOver?.id === node.id && draggedId !== node.id ? dragOver.position : null
      const isSelected = doc.selectedIds.includes(node.id)
      const isComp = node.type === "component" || node.type === "instance"
      const isTopLevelContainer =
        !node.parentId &&
        (node.type === "frame" || node.type === "section" || node.type === "component")
      const childSelection: "none" | "frame" | "component" = isSelected
        ? isComp
          ? "component"
          : "frame"
        : inheritedSelection

      const rowHighlight = isSelected
        ? isComp
          ? "!bg-[var(--color-bg-component-selected)] !text-white"
          : "!bg-[var(--color-bg-selected)] !text-white"
        : inheritedSelection === "component"
          ? "bg-[var(--color-bg-component-secondary)]/75"
          : inheritedSelection === "frame"
            ? "bg-[var(--color-bg-selected-secondary)]/75"
            : ""

      const dropCue =
        dropPos === "into"
          ? "bg-[var(--color-bg-brand)]/15 outline-1 outline-[var(--color-border-selected)]"
          : dropPos === "before"
            ? "shadow-[inset_0_2px_0_0_var(--color-bg-brand)]"
            : dropPos === "after"
              ? "shadow-[inset_0_-2px_0_0_var(--color-bg-brand)]"
              : ""

      return (
        <TreeItem key={item.value} value={item.value}>
          <TreeItemLabel
            draggable={!isRenaming}
            onPointerDown={(e) => {
              treeClickRef.current = {
                id: node.id,
                additive: e.metaKey || e.ctrlKey,
                range: e.shiftKey,
              }
            }}
            onContextMenu={(e) => {
              e.preventDefault()
              e.stopPropagation()
              if (!doc.selectedIds.includes(node.id)) {
                setSelectedIds([node.id])
                lastSelectedAnchorRef.current = node.id
              }
              setPageContextMenu(null)
              setContextMenu({
                nodeId: node.id,
                x: Math.min(e.clientX, window.innerWidth - 210),
                y: Math.min(e.clientY, window.innerHeight - 320),
              })
            }}
            onDragStart={(e) => {
              e.stopPropagation()
              setDraggedId(node.id)
            }}
            onDragOver={(e) => {
              e.preventDefault()
              e.stopPropagation()
              const rect = e.currentTarget.getBoundingClientRect()
              const ratio = (e.clientY - rect.top) / Math.max(rect.height, 1)
              const isContainer =
                node.type === "frame" || node.type === "component" || node.type === "section"
              const position: DropPosition = isContainer
                ? ratio < 0.25
                  ? "before"
                  : ratio > 0.75
                    ? "after"
                    : "into"
                : ratio < 0.5
                  ? "before"
                  : "after"
              setDragOver((prev) =>
                prev && prev.id === node.id && prev.position === position
                  ? prev
                  : { id: node.id, position }
              )
            }}
            onDragLeave={() => setDragOver((prev) => (prev?.id === node.id ? null : prev))}
            onDrop={(e) => {
              e.preventDefault()
              e.stopPropagation()
              handleDropOnLayer(node, dragOver?.position ?? "into")
            }}
            onDragEnd={() => {
              setDraggedId(null)
              setDragOver(null)
            }}
            className={`group/layer relative ${rowHighlight} ${dropCue}`}
            onDoubleClick={(e) => {
              e.stopPropagation()
              setRenamingId(node.id)
              setRenameDraft(node.name)
            }}
          >
            {item.children ? (
              <TreeItemIndicator>
                <ChevronRightIcon aria-hidden="true" className="h-3 w-3" />
              </TreeItemIndicator>
            ) : (
              <span className="inline-block w-3 shrink-0" aria-hidden="true" />
            )}
            <span
              title="Double-click to zoom to layer"
              onDoubleClick={(e) => {
                e.stopPropagation()
                setSelectedIds([node.id])
                lastSelectedAnchorRef.current = node.id
                onRunAction("zoom-selection")
              }}
              className="inline-flex shrink-0 items-center justify-center"
            >
              <NodeTypeIcon node={node} selected={isSelected} />
            </span>
            {isRenaming ? (
              <TextField
                size="xs"
                variant="inline"
                label={`Rename ${node.name}`}
                value={renameDraft}
                onValueChange={setRenameDraft}
                autoFocus
                onPointerDown={(e) => e.stopPropagation()}
                onClick={(e) => e.stopPropagation()}
                onKeyDown={(e) => {
                  e.stopPropagation()
                  if (e.key === "Enter") commitRename(node.id)
                  if (e.key === "Escape") setRenamingId(null)
                }}
                onBlur={() => commitRename(node.id)}
                className="flex-1 px-1"
              />
            ) : (
              <span
                className={`min-w-0 flex-1 truncate ${
                  isTopLevelContainer ? "font-medium text-[var(--color-text)]" : ""
                } ${!node.visible ? "text-[var(--color-text-tertiary)] line-through" : ""} ${
                  isComp ? "text-[var(--color-text-component)]" : ""
                }`}
              >
                {node.name}
              </span>
            )}
            <span
              className={`flex shrink-0 items-center gap-0.5 ${
                !node.visible || node.locked
                  ? "ml-auto opacity-100"
                  : `pointer-events-none absolute right-1 top-1/2 z-10 -translate-y-1/2 rounded-[4px] px-0.5 opacity-0 transition-opacity group-hover/layer:pointer-events-auto group-hover/layer:opacity-100 group-focus-within/layer:pointer-events-auto group-focus-within/layer:opacity-100 ${
                      isSelected
                        ? isComp
                          ? "bg-[var(--color-bg-component-selected)]"
                          : "bg-[var(--color-bg-selected-hover)]"
                        : inheritedSelection === "component"
                          ? "bg-[var(--color-bg-component-secondary)]"
                          : inheritedSelection === "frame"
                            ? "bg-[var(--color-bg-selected-secondary)]"
                            : "bg-[var(--color-bg-secondary)]"
                    }`
              }`}
              onPointerDown={(e) => e.stopPropagation()}
              onClick={(e) => e.stopPropagation()}
            >
              <IconButton
                size="xs"
                label={node.locked ? `Unlock ${node.name}` : `Lock ${node.name}`}
                onClick={() => updateNodes([node.id], { locked: !node.locked })}
              >
                {node.locked ? (
                  <LockIcon aria-hidden="true" className="h-3 w-3 text-[var(--color-text-brand)]" />
                ) : (
                  <UnlockIcon aria-hidden="true" className="h-3 w-3" />
                )}
              </IconButton>
              <IconButton
                size="xs"
                label={node.visible ? `Hide ${node.name}` : `Show ${node.name}`}
                onClick={() => updateNodes([node.id], { visible: !node.visible })}
              >
                {node.visible ? (
                  <FigmaEyeIcon className="h-[18px] w-[18px] shrink-0" />
                ) : (
                  <FigmaEyeOffIcon className="h-[18px] w-[18px] shrink-0 text-[var(--color-text-tertiary)]" />
                )}
              </IconButton>
            </span>
          </TreeItemLabel>
          {item.children && (
            <TreeGroup>{renderTreeItems(item.children, childSelection)}</TreeGroup>
          )}
        </TreeItem>
      )
    })

  const contextNode = contextMenu ? activePage.nodes[contextMenu.nodeId] : null
  const contextPage = pageContextMenu
    ? doc.pages.find((p) => p.id === pageContextMenu.pageId) ?? null
    : null

  return (
    <aside
      aria-label="OpenFigma left panel"
      className="figma-ui3-panel flex h-full w-full flex-row overflow-hidden"
    >
      <Tabs
        value={activeTab}
        onValueChange={(next) => {
          if (next) setActiveTab(next)
        }}
        orientation="vertical"
        className="flex min-h-0 w-full min-w-0 flex-1 flex-row overflow-hidden"
      >
        {/* Official Figma 57px Left Navigation Rail */}
        <div className="figma-left-rail flex w-[57px] shrink-0 flex-col items-center border-r border-[var(--color-border)] bg-[var(--color-bg)] py-2">
          <Menu
            onAction={(val) => {
              if (val === "quick-actions") onOpenCommand()
              else if (val === "shortcuts") onOpenShortcuts()
              else if (val === "agent-inspector") onOpenAgent()
              else onRunAction(val)
            }}
            onCheckedChange={(checked, details) => {
              if (details.value === "grid") toggleFlag("showGrid", checked)
              if (details.value === "rulers") toggleFlag("showRulers", checked)
              if (details.value === "snap") toggleFlag("snapToObjects", checked)
            }}
          >
            <MenuTrigger
              aria-label="OpenFigma main menu"
              className="mb-3 flex !h-[32px] !w-[32px] items-center justify-center rounded-[8px] border-transparent bg-transparent !p-0 text-[var(--color-icon)] hover:bg-[var(--color-bg-secondary)]"
            >
              <OpenFigmaLogo className="h-[18px] w-[18px]" />
            </MenuTrigger>
            <MenuContent side="right" align="start" sideOffset={8}>
              <MenuItem value="quick-actions" shortcut="mod+k">
                Quick actions…
              </MenuItem>
              <MenuSeparator />
              <MenuSub>
                <MenuSubTrigger>
                  File
                  <ChevronRightIcon aria-hidden="true" className="ml-auto h-3.5 w-3.5" />
                </MenuSubTrigger>
                <MenuSubContent>
                  <MenuItem value="new-blank">New blank design</MenuItem>
                  <MenuItem value="open-json">Open local file (.json)…</MenuItem>
                  <MenuItem value="save-json" shortcut="mod+s">
                    Save local copy (.json)
                  </MenuItem>
                  <MenuSeparator />
                  <MenuItem value="export-svg">Export SVG…</MenuItem>
                  <MenuItem value="export-png">Export PNG 2×…</MenuItem>
                  <MenuItem value="export-jsx">Export React + Tailwind…</MenuItem>
                  <MenuSeparator />
                  <MenuItem value="reset-doc">Reset starter showcase</MenuItem>
                </MenuSubContent>
              </MenuSub>
              <MenuSub>
                <MenuSubTrigger>
                  Edit
                  <ChevronRightIcon aria-hidden="true" className="ml-auto h-3.5 w-3.5" />
                </MenuSubTrigger>
                <MenuSubContent>
                  <MenuItem value="undo" shortcut="mod+z" disabled={!canUndo}>
                    Undo
                  </MenuItem>
                  <MenuItem value="redo" shortcut="mod+shift+z" disabled={!canRedo}>
                    Redo
                  </MenuItem>
                  <MenuSeparator />
                  <MenuItem value="copy" shortcut="mod+c" disabled={doc.selectedIds.length === 0}>
                    Copy
                  </MenuItem>
                  <MenuItem value="paste" shortcut="mod+v">
                    Paste
                  </MenuItem>
                  <MenuItem value="duplicate" shortcut="mod+d" disabled={doc.selectedIds.length === 0}>
                    Duplicate
                  </MenuItem>
                  <MenuItem value="select-all" shortcut="mod+a">
                    Select all
                  </MenuItem>
                  <MenuItem value="delete" shortcut="backspace" disabled={doc.selectedIds.length === 0}>
                    Delete
                  </MenuItem>
                </MenuSubContent>
              </MenuSub>
              <MenuSub>
                <MenuSubTrigger>
                  View
                  <ChevronRightIcon aria-hidden="true" className="ml-auto h-3.5 w-3.5" />
                </MenuSubTrigger>
                <MenuSubContent>
                  <MenuCheckboxItem value="grid" checked={doc.showGrid}>
                    <MenuItemIndicator keepMounted>
                      <CheckIcon aria-hidden="true" className="h-3.5 w-3.5" />
                    </MenuItemIndicator>
                    Pixel / Dot Grid
                  </MenuCheckboxItem>
                  <MenuCheckboxItem value="rulers" checked={doc.showRulers}>
                    <MenuItemIndicator keepMounted>
                      <CheckIcon aria-hidden="true" className="h-3.5 w-3.5" />
                    </MenuItemIndicator>
                    Rulers
                  </MenuCheckboxItem>
                  <MenuCheckboxItem value="snap" checked={doc.snapToObjects}>
                    <MenuItemIndicator keepMounted>
                      <CheckIcon aria-hidden="true" className="h-3.5 w-3.5" />
                    </MenuItemIndicator>
                    Snap to geometry
                  </MenuCheckboxItem>
                  <MenuSeparator />
                  <MenuItem value="zoom-in" shortcut="mod+=">Zoom in</MenuItem>
                  <MenuItem value="zoom-out" shortcut="mod+-">Zoom out</MenuItem>
                  <MenuItem value="zoom-100" shortcut="shift+0">Zoom to 100%</MenuItem>
                  <MenuItem value="zoom-fit" shortcut="shift+1">Zoom to fit</MenuItem>
                  <MenuItem value="toggle-ui" shortcut="mod+\">Hide / Show UI</MenuItem>
                </MenuSubContent>
              </MenuSub>
              <MenuSub>
                <MenuSubTrigger>
                  Object
                  <ChevronRightIcon aria-hidden="true" className="ml-auto h-3.5 w-3.5" />
                </MenuSubTrigger>
                <MenuSubContent>
                  <MenuItem value="frame-selection" shortcut="mod+g" disabled={doc.selectedIds.length === 0}>
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
                  <MenuSeparator />
                  <MenuItem value="flip-h" shortcut="shift+h" disabled={doc.selectedIds.length === 0}>
                    Flip horizontal
                  </MenuItem>
                  <MenuItem value="flip-v" shortcut="shift+v" disabled={doc.selectedIds.length === 0}>
                    Flip vertical
                  </MenuItem>
                </MenuSubContent>
              </MenuSub>
              <MenuSeparator />
              <MenuItem value="agent-inspector">
                <BotIcon aria-hidden="true" className="h-3.5 w-3.5 text-[var(--color-icon-brand)]" />
                UI SDK Agent Snapshot…
              </MenuItem>
              <MenuItem value="shortcuts">Keyboard shortcuts</MenuItem>
            </MenuContent>
          </Menu>

          <TabsList aria-label="Left sidebar mode" className="flex w-full flex-col items-center gap-2">
            <TabsTab value="file" className="flex w-full flex-col items-center gap-1">
              <span className="figma-rail-icon flex h-[32px] w-[32px] items-center justify-center rounded-[8px] transition-colors hover:bg-[var(--color-bg-hover)]">
                <FileTextIcon aria-hidden="true" className="h-[16px] w-[16px]" />
              </span>
              <span className="text-[9.5px] font-medium leading-none">File</span>
            </TabsTab>
            <TabsTab value="agents" className="flex w-full flex-col items-center gap-1">
              <span className="figma-rail-icon flex h-[32px] w-[32px] items-center justify-center rounded-[8px] transition-colors hover:bg-[var(--color-bg-hover)]">
                <SparklesIcon aria-hidden="true" className="h-[16px] w-[16px]" />
              </span>
              <span className="text-[9.5px] font-medium leading-none">Agents</span>
            </TabsTab>
            <TabsTab value="assets" className="flex w-full flex-col items-center gap-1">
              <span className="figma-rail-icon flex h-[32px] w-[32px] items-center justify-center rounded-[8px] transition-colors hover:bg-[var(--color-bg-hover)]">
                <CirclePlusIcon aria-hidden="true" className="h-[16px] w-[16px]" />
              </span>
              <span className="text-[9.5px] font-medium leading-none">Assets</span>
            </TabsTab>
            <TabsTab value="tools" className="flex w-full flex-col items-center gap-1">
              <span className="figma-rail-icon flex h-[32px] w-[32px] items-center justify-center rounded-[8px] transition-colors hover:bg-[var(--color-bg-hover)]">
                <BriefcaseIcon aria-hidden="true" className="h-[16px] w-[16px]" />
              </span>
              <span className="text-[9.5px] font-medium leading-none">Tools</span>
            </TabsTab>
            <TabsTab value="tokens" aria-label="Tokens" className="flex w-full flex-col items-center gap-1">
              <span className="figma-rail-icon flex h-[32px] w-[32px] items-center justify-center rounded-[8px] transition-colors hover:bg-[var(--color-bg-hover)]">
                <HexagonIcon aria-hidden="true" className="h-[16px] w-[16px]" />
              </span>
              <span className="text-[9.5px] font-medium leading-none">Variables</span>
            </TabsTab>
          </TabsList>
        </div>

        {/* Official Figma 240px Docked Left Panel */}
        <div className="flex min-w-0 flex-1 flex-col overflow-hidden bg-[var(--color-bg)]">
          {/* File Header (64px) */}
          <div className="flex h-[64px] shrink-0 flex-col justify-center gap-1 border-b border-[var(--color-border)] px-3">
            <div ref={titleContainerRef} className="flex items-center justify-between gap-0.5">
              <TextField
                size="sm"
                variant="ghost"
                label="Document title"
                value={doc.title}
                onValueChange={setTitle}
                className="min-w-0 flex-1 px-0.5 text-[13px] font-semibold"
              />
              <Menu
                onAction={(val) => {
                  if (val === "rename-file") {
                    const input = titleContainerRef.current?.querySelector("input")
                    input?.focus()
                    input?.select()
                  } else {
                    onRunAction(val)
                  }
                }}
              >
                <IconMenuTrigger size="xs" label="File actions">
                  <FigmaChevronDownIcon className="h-4 w-4 text-[var(--color-icon-secondary)]" />
                </IconMenuTrigger>
                <MenuContent align="end">
                  <MenuItem value="rename-file">Rename…</MenuItem>
                  <MenuSeparator />
                  <MenuItem value="new-blank">New blank design</MenuItem>
                  <MenuItem value="open-json">Open local file (.json)…</MenuItem>
                  <MenuItem value="save-json" shortcut="mod+s">
                    Save local copy (.json)
                  </MenuItem>
                  <MenuSeparator />
                  <MenuItem value="export-svg">Export SVG…</MenuItem>
                  <MenuItem value="export-png">Export PNG 2×…</MenuItem>
                  <MenuItem value="export-jsx">Export React + Tailwind…</MenuItem>
                  <MenuSeparator />
                  <MenuItem value="reset-doc">Reset starter showcase</MenuItem>
                </MenuContent>
              </Menu>
              <IconButton
                size="sm"
                label="Collapse UI panels"
                title="Minimize UI (Ctrl+\)"
                onClick={() => toggleShowUI(false)}
              >
                <PanelLeftCloseIcon aria-hidden="true" className="h-4 w-4" />
              </IconButton>
            </div>
            <div className="flex items-center gap-1.5 px-0.5 text-[11px] text-[var(--color-text-secondary)]">
              <span>Drafts</span>
              <span className="rounded-[4px] bg-[var(--color-bg-selected)] px-1.5 py-0.5 text-[10px] font-medium leading-none text-[var(--color-text-brand)]">
                OpenFigma
              </span>
            </div>
          </div>

          {/* File Tab: Pages + Find + Layers Tree */}
          <TabsPanel value="file" className="flex min-h-0 w-full min-w-0 flex-1 flex-col overflow-hidden">
            <div className="border-b border-[var(--color-border)] px-3 py-2">
              <div className="flex h-[24px] items-center justify-between">
                <Button
                  aria-label="Toggle pages list"
                  onClick={() => setPagesOpen((v) => !v)}
                  className="!h-[24px] gap-1 border-transparent bg-transparent px-0 text-[11px] font-semibold text-[var(--color-text)] hover:bg-transparent"
                >
                  <span>Pages</span>
                  {!pagesOpen && (
                    <span className="text-[10px] font-normal text-[var(--color-text-tertiary)]">
                      ({doc.pages.length})
                    </span>
                  )}
                </Button>
                <div className="flex items-center gap-0.5">
                  <IconButton
                    label="Toggle layer search"
                    title="Find layers (Ctrl+F)"
                    active={searchVisible}
                    onClick={() => {
                      setSearchVisible((v) => {
                        const next = !v
                        if (!next) {
                          setLayerQuery("")
                          setLayerTypeFilter("all")
                        }
                        return next
                      })
                    }}
                  >
                    <SearchIcon aria-hidden="true" className="h-3.5 w-3.5" />
                  </IconButton>
                  <IconButton
                    label="Add page"
                    title="Add new page"
                    onClick={() => {
                      addPage()
                      setPagesOpen(true)
                      toast("Created new page")
                    }}
                  >
                    <FigmaPlusIcon />
                  </IconButton>
                  <Menu
                    onAction={(action) => {
                      if (action === "rename-page") {
                        setRenamingPageId(activePage.id)
                        setPageRenameDraft(activePage.name)
                      } else if (action === "duplicate-page") {
                        duplicatePage(activePage.id)
                        toast("Duplicated page")
                      } else if (action === "delete-page") {
                        deletePage(activePage.id)
                        toast("Deleted page")
                      }
                    }}
                  >
                    <IconMenuTrigger label="Page options">
                      <FigmaMoreIcon />
                    </IconMenuTrigger>
                    <MenuContent align="end">
                      <MenuItem value="rename-page">Rename page</MenuItem>
                      <MenuItem value="duplicate-page">Duplicate page</MenuItem>
                      <MenuSeparator />
                      <MenuItem value="delete-page" destructive disabled={doc.pages.length <= 1}>
                        Delete page
                      </MenuItem>
                    </MenuContent>
                  </Menu>
                </div>
              </div>

              {pagesOpen && (
                <div className="mt-1.5 flex max-h-28 flex-col gap-0.5 overflow-y-auto">
                  {doc.pages.map((page) => {
                    const isActive = page.id === doc.activePageId
                    const isRenamingPage = renamingPageId === page.id
                    if (isRenamingPage) {
                      return (
                        <TextField
                          key={page.id}
                          size="sm"
                          variant="inline"
                          label={`Rename page ${page.name}`}
                          value={pageRenameDraft}
                          onValueChange={setPageRenameDraft}
                          autoFocus
                          onKeyDown={(e) => {
                            e.stopPropagation()
                            if (e.key === "Enter") commitPageRename(page.id)
                            if (e.key === "Escape") setRenamingPageId(null)
                          }}
                          onBlur={() => commitPageRename(page.id)}
                          className="w-full"
                        />
                      )
                    }
                    return (
                      <Button
                        key={page.id}
                        onClick={() => switchPage(page.id)}
                        onDoubleClick={() => {
                          setRenamingPageId(page.id)
                          setPageRenameDraft(page.name)
                        }}
                        onContextMenu={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          setContextMenu(null)
                          setPageContextMenu({
                            pageId: page.id,
                            x: Math.min(e.clientX, window.innerWidth - 180),
                            y: Math.min(e.clientY, window.innerHeight - 140),
                          })
                        }}
                        className={`!h-[32px] w-full justify-start rounded-[5px] border-transparent px-2 text-[11px] font-normal ${
                          isActive
                            ? "bg-[var(--color-bg-secondary)] font-medium text-[var(--color-text)]"
                            : "bg-transparent text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-hover)] hover:text-[var(--color-text)]"
                        }`}
                      >
                        <span className="truncate">{page.name}</span>
                      </Button>
                    )
                  })}
                </div>
              )}
            </div>

            {searchVisible && (
              <div
                ref={searchContainerRef}
                className="flex flex-col gap-1.5 border-b border-[var(--color-border)] px-3 py-2"
              >
                <TextField
                  label="Filter layers"
                  value={layerQuery}
                  onValueChange={setLayerQuery}
                  placeholder="Find layers…"
                  autoFocus
                  leading={<SearchIcon className="h-3.5 w-3.5" />}
                  clearable
                  clearLabel="Clear layer search"
                  onKeyDown={(e) => {
                    if (e.key === "Escape") {
                      if (layerQuery || layerTypeFilter !== "all") {
                        setLayerQuery("")
                        setLayerTypeFilter("all")
                      } else {
                        setSearchVisible(false)
                      }
                    }
                  }}
                />
                <div className="flex flex-wrap items-center gap-1" role="group" aria-label="Filter layers by type">
                  {LAYER_FILTER_OPTIONS.map((opt) => {
                    const active = layerTypeFilter === opt.value
                    return (
                      <Button
                        key={opt.value}
                        aria-pressed={active}
                        onClick={() => setLayerTypeFilter(opt.value)}
                        className={`!h-[20px] rounded-[4px] border-transparent px-1.5 text-[10px] font-medium ${
                          active
                            ? "bg-[var(--color-bg-selected)] text-[var(--color-text-brand)]"
                            : "bg-[var(--color-bg-secondary)] text-[var(--color-text-secondary)] hover:text-[var(--color-text)]"
                        }`}
                      >
                        {opt.label}
                      </Button>
                    )
                  })}
                  {isFilteringLayers && (
                    <span className="ml-auto tabular-nums text-[10px] text-[var(--color-text-tertiary)]">
                      {matchCount}
                    </span>
                  )}
                </div>
              </div>
            )}

            <div className="flex h-[36px] shrink-0 items-center justify-between px-3">
              <span className="text-[11px] font-semibold text-[var(--color-text)]">Layers</span>
              <IconButton
                label={hasExpandedContainers ? "Collapse all layers" : "Expand all layers"}
                title={
                  hasExpandedContainers
                    ? "Collapse all layers (Alt+L)"
                    : "Expand all layers (Alt+L)"
                }
                disabled={allExpandableIds.length === 0}
                onClick={toggleCollapseExpandAll}
                className="text-[var(--color-icon-secondary)]"
              >
                {hasExpandedContainers ? (
                  <ChevronsDownUpIcon aria-hidden="true" className="h-3.5 w-3.5" />
                ) : (
                  <ChevronsUpDownIcon aria-hidden="true" className="h-3.5 w-3.5" />
                )}
              </IconButton>
            </div>

            <ScrollArea className="w-full min-w-0">
              <ScrollAreaViewport role="region" aria-label="Layer tree" className="w-full min-w-0">
                <ScrollAreaContent className="w-full min-w-0">
                  {treeData.length === 0 ? (
                    <div className="px-4 py-8 text-center text-[11px] text-[var(--color-text-tertiary)]">
                      {isFilteringLayers ? "No matching layers." : "No layers yet."}
                    </div>
                  ) : (
                    <Tree
                      aria-label="Layers"
                      items={treeData}
                      mode="multiple"
                      value={doc.selectedIds}
                      onValueChange={(next) => {
                        const click = treeClickRef.current
                        treeClickRef.current = null
                        if (click?.range) {
                          const anchor =
                            lastSelectedAnchorRef.current ??
                            doc.selectedIds[doc.selectedIds.length - 1] ??
                            click.id
                          const startIdx = visibleLayerIds.indexOf(anchor)
                          const endIdx = visibleLayerIds.indexOf(click.id)
                          if (startIdx >= 0 && endIdx >= 0) {
                            const lo = Math.min(startIdx, endIdx)
                            const hi = Math.max(startIdx, endIdx)
                            setSelectedIds(visibleLayerIds.slice(lo, hi + 1))
                            return
                          }
                        }
                        if (click && !click.additive) {
                          setSelectedIds([click.id])
                          lastSelectedAnchorRef.current = click.id
                        } else {
                          setSelectedIds(next)
                          if (click) lastSelectedAnchorRef.current = click.id
                        }
                      }}
                      expanded={isFilteringLayers ? allExpandableIds : expanded}
                      onExpandedChange={setExpanded}
                      expandOnPress={false}
                    >
                      {renderTreeItems(treeData)}
                    </Tree>
                  )}
                </ScrollAreaContent>
              </ScrollAreaViewport>
              <ScrollAreaScrollbar orientation="vertical">
                <ScrollAreaThumb />
              </ScrollAreaScrollbar>
            </ScrollArea>
          </TabsPanel>

          {/* Agents Tab */}
          <TabsPanel value="agents" className="flex min-h-0 flex-1 flex-col overflow-hidden">
            <ScrollArea>
              <ScrollAreaViewport role="region" aria-label="Design agents">
                <ScrollAreaContent className="flex flex-col gap-3 !p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-[var(--color-text)]">Agents</span>
                    <span className="rounded-[4px] bg-[var(--color-bg-selected)] px-1.5 py-0.5 text-[10px] font-medium leading-none text-[var(--color-text-brand)]">
                      UI SDK
                    </span>
                  </div>

                  <form
                    onSubmit={handleAgentSubmit}
                    className="flex flex-col gap-1.5 rounded-[8px] border border-[var(--color-border)] bg-[var(--color-bg-secondary)] p-2"
                  >
                    <div className="flex items-center gap-1">
                      <TextField
                        size="sm"
                        variant="ghost"
                        label="Ask design agent"
                        value={agentPrompt}
                        onValueChange={setAgentPrompt}
                        placeholder="Ask for changes…"
                        className="flex-1 px-1"
                      />
                      <IconButton
                        size="sm"
                        type="submit"
                        label="Run agent prompt"
                        title="Run prompt"
                        disabled={!agentPrompt.trim()}
                        className="bg-[var(--color-bg-brand)] text-white hover:bg-[var(--color-bg-brand-hover)] disabled:bg-[var(--color-bg-tertiary)] disabled:text-[var(--color-icon-tertiary)]"
                      >
                        <ArrowUpIcon aria-hidden="true" className="h-3.5 w-3.5" />
                      </IconButton>
                    </div>
                    <span className="px-1 text-[10px] text-[var(--color-text-tertiary)]">
                      Try: &ldquo;add metric card&rdquo;, &ldquo;light mode&rdquo;, &ldquo;auto layout&rdquo;
                    </span>
                  </form>

                  <div className="flex flex-col gap-1.5">
                    <span className="text-[10px] font-medium text-[var(--color-text-secondary)]">
                      Quick actions
                    </span>
                    <ActionButton
                      icon={<SparklesIcon aria-hidden="true" className="h-3.5 w-3.5 text-[var(--color-icon-brand)]" />}
                      onClick={() => onRunAction("auto-layout")}
                      className="w-full justify-start"
                    >
                      Tidy &amp; toggle Auto Layout
                    </ActionButton>
                    <ActionButton
                      icon={<ComponentIcon aria-hidden="true" className="h-3.5 w-3.5 text-[var(--color-text-component)]" />}
                      onClick={() => insertTemplateAtViewportCenter(0)}
                      className="w-full justify-start"
                    >
                      Generate UI Card
                    </ActionButton>
                    <ActionButton
                      icon={<BotIcon aria-hidden="true" className="h-3.5 w-3.5 text-[var(--color-bg-dev)]" />}
                      onClick={onOpenAgent}
                      className="w-full justify-start"
                    >
                      Open Agent Snapshot…
                    </ActionButton>
                  </div>

                  {agentLog.length > 0 && (
                    <div className="flex flex-col gap-1.5 border-t border-[var(--color-border)] pt-2.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-medium text-[var(--color-text-secondary)]">
                          Recent runs
                        </span>
                        <Button
                          onClick={() => setAgentLog([])}
                          className="!h-[20px] border-transparent bg-transparent px-1 text-[10px] text-[var(--color-text-tertiary)] hover:text-[var(--color-text)]"
                        >
                          Clear
                        </Button>
                      </div>
                      {agentLog.map((entry) => (
                        <div
                          key={entry.id}
                          className="flex flex-col gap-0.5 rounded-[5px] bg-[var(--color-bg-secondary)] px-2 py-1.5 text-[11px]"
                        >
                          <span className="truncate font-medium text-[var(--color-text)]">
                            {entry.prompt}
                          </span>
                          <span className="text-[10px] text-[var(--color-text-secondary)]">
                            {entry.result}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollAreaContent>
              </ScrollAreaViewport>
            </ScrollArea>
          </TabsPanel>

          {/* Tools Tab */}
          <TabsPanel value="tools" className="flex min-h-0 flex-1 flex-col overflow-hidden">
            <div className="border-b border-[var(--color-border)] px-3 py-2">
              <TextField
                label="Search tools"
                value={toolQuery}
                onValueChange={setToolQuery}
                placeholder="Search all tools…"
                leading={<SearchIcon className="h-3.5 w-3.5" />}
                clearable
                clearLabel="Clear tool search"
              />
            </div>
            <ScrollArea>
              <ScrollAreaViewport role="region" aria-label="Editor tools">
                <ScrollAreaContent className="flex flex-col gap-3 !p-3">
                  {(["Create", "Arrange & Layout", "View & Code"] as const).map((category) => {
                    const q = toolQuery.trim().toLowerCase()
                    const items = TOOL_CATALOG.filter(
                      (item) =>
                        item.category === category &&
                        (!q ||
                          item.label.toLowerCase().includes(q) ||
                          item.category.toLowerCase().includes(q))
                    )
                    if (items.length === 0) return null
                    return (
                      <div key={category} className="flex flex-col gap-1">
                        <span className="text-[11px] font-semibold text-[var(--color-text)]">
                          {category}
                        </span>
                        {items.map((item) => (
                          <Button
                            key={item.id}
                            onClick={() => {
                              if (item.action === "quick-actions") onOpenCommand()
                              else if (item.action === "shortcuts") onOpenShortcuts()
                              else onRunAction(item.action)
                            }}
                            className="!h-[28px] w-full justify-between rounded-[5px] border-transparent bg-[var(--color-bg-secondary)] px-2 text-[11px] font-normal text-[var(--color-text)] hover:bg-[var(--color-bg-tertiary)]"
                          >
                            <span className="truncate">{item.label}</span>
                            {item.shortcut && (
                              <span className="shrink-0 font-mono text-[10px] text-[var(--color-text-tertiary)]">
                                {item.shortcut}
                              </span>
                            )}
                          </Button>
                        ))}
                      </div>
                    )
                  })}
                </ScrollAreaContent>
              </ScrollAreaViewport>
              <ScrollAreaScrollbar orientation="vertical">
                <ScrollAreaThumb />
              </ScrollAreaScrollbar>
            </ScrollArea>
          </TabsPanel>

          {/* Assets Tab */}
          <TabsPanel value="assets" className="flex min-h-0 flex-1 flex-col overflow-hidden">
            <div className="border-b border-[var(--color-border)] px-3 py-2">
              <TextField
                label="Search assets"
                value={assetQuery}
                onValueChange={setAssetQuery}
                placeholder="Search components & presets…"
                leading={<SearchIcon className="h-3.5 w-3.5" />}
                clearable
                clearLabel="Clear asset search"
              />
            </div>
            <ScrollArea>
              <ScrollAreaViewport role="region" aria-label="Reusable assets">
                <ScrollAreaContent className="flex flex-col gap-3 !p-3">
                  {(() => {
                    const q = assetQuery.trim().toLowerCase()
                    const filteredLocal = localComponents.filter(
                      (c) => !q || c.name.toLowerCase().includes(q)
                    )
                    const filteredKit = ASSET_TEMPLATES.filter(
                      (a) =>
                        !q ||
                        a.name.toLowerCase().includes(q) ||
                        a.category.toLowerCase().includes(q) ||
                        a.description.toLowerCase().includes(q)
                    )
                    const filteredPresets = FRAME_PRESETS.filter(
                      (p) =>
                        !q ||
                        p.name.toLowerCase().includes(q) ||
                        p.category.toLowerCase().includes(q)
                    )
                    return (
                      <>
                        {filteredLocal.length > 0 && (
                          <div className="flex flex-col gap-1.5">
                            <Button
                              onClick={() => setLocalAssetsOpen((v) => !v)}
                              className="!h-[22px] w-full justify-between border-transparent bg-transparent px-0 text-[11px] font-semibold text-[var(--color-text-component)] hover:bg-transparent"
                            >
                              <span className="flex items-center gap-1">
                                {localAssetsOpen ? (
                                  <ChevronDownIcon aria-hidden="true" className="h-3 w-3" />
                                ) : (
                                  <ChevronRightIcon aria-hidden="true" className="h-3 w-3" />
                                )}
                                Created in this file ({filteredLocal.length})
                              </span>
                            </Button>
                            {localAssetsOpen &&
                              filteredLocal.map((comp) => (
                                <Button
                                  key={comp.id}
                                  onClick={() => {
                                    insertComponentInstance(comp.id)
                                    toast(`Inserted instance of ${comp.name}`)
                                  }}
                                  className="!h-[32px] w-full justify-between rounded-[5px] border-transparent bg-[var(--color-bg-component-secondary)] px-2 text-left text-[11px] text-[var(--color-text)] hover:bg-[var(--color-bg-component-selected)]"
                                >
                                  <span className="flex min-w-0 items-center gap-1.5 truncate">
                                    <ComponentIcon
                                      aria-hidden="true"
                                      className="h-3.5 w-3.5 shrink-0 text-[var(--color-text-component)]"
                                    />
                                    <span className="truncate">{comp.name}</span>
                                  </span>
                                  <span className="shrink-0 text-[10px] text-[var(--color-text-component)]">
                                    + Insert
                                  </span>
                                </Button>
                              ))}
                          </div>
                        )}

                        {filteredKit.length > 0 && (
                          <div className="flex flex-col gap-1.5">
                            <Button
                              onClick={() => setUiKitOpen((v) => !v)}
                              className="!h-[22px] w-full justify-between border-transparent bg-transparent px-0 text-[11px] font-semibold text-[var(--color-text)] hover:bg-transparent"
                            >
                              <span className="flex items-center gap-1">
                                {uiKitOpen ? (
                                  <ChevronDownIcon aria-hidden="true" className="h-3 w-3 text-[var(--color-icon-secondary)]" />
                                ) : (
                                  <ChevronRightIcon aria-hidden="true" className="h-3 w-3 text-[var(--color-icon-secondary)]" />
                                )}
                                UI Kit ({filteredKit.length})
                              </span>
                            </Button>
                            {uiKitOpen &&
                              filteredKit.map((asset) => (
                                <Button
                                  key={asset.id}
                                  onClick={() => {
                                    const vp = doc.viewport
                                    const x = Math.round((640 - vp.x) / vp.zoom)
                                    const y = Math.round((540 - vp.y) / vp.zoom)
                                    insertNodes(asset.build(x, y), true)
                                    toast(`Inserted ${asset.name}`)
                                  }}
                                  className="h-auto w-full flex-col items-start gap-0.5 rounded-[5px] border-transparent bg-[var(--color-bg-secondary)] !p-2 text-left hover:bg-[var(--color-bg-tertiary)]"
                                >
                                  <span className="flex w-full items-center justify-between text-[11px] font-medium text-[var(--color-text)]">
                                    <span className="flex items-center gap-1.5">
                                      <ComponentIcon
                                        aria-hidden="true"
                                        className="h-3 w-3 text-[var(--color-text-component)]"
                                      />
                                      {asset.name}
                                    </span>
                                    <span className="rounded-[4px] bg-[var(--color-bg)] px-1.5 py-px text-[10px] text-[var(--color-text-secondary)]">
                                      {asset.category}
                                    </span>
                                  </span>
                                  <span className="text-[10.5px] font-normal text-[var(--color-text-secondary)]">
                                    {asset.description}
                                  </span>
                                </Button>
                              ))}
                          </div>
                        )}

                        {filteredPresets.length > 0 && (
                          <div className="flex flex-col gap-1.5">
                            <Button
                              onClick={() => setPresetsOpen((v) => !v)}
                              className="!h-[22px] w-full justify-between border-transparent bg-transparent px-0 text-[11px] font-semibold text-[var(--color-text)] hover:bg-transparent"
                            >
                              <span className="flex items-center gap-1">
                                {presetsOpen ? (
                                  <ChevronDownIcon aria-hidden="true" className="h-3 w-3 text-[var(--color-icon-secondary)]" />
                                ) : (
                                  <ChevronRightIcon aria-hidden="true" className="h-3 w-3 text-[var(--color-icon-secondary)]" />
                                )}
                                Frame presets ({filteredPresets.length})
                              </span>
                            </Button>
                            {presetsOpen && (
                              <div className="grid grid-cols-1 gap-1">
                                {filteredPresets.map((preset) => (
                                  <Button
                                    key={preset.name}
                                    onClick={() => {
                                      createFrameFromPreset(preset)
                                      toast(`Added ${preset.name} frame`)
                                    }}
                                    className="!h-[28px] w-full justify-between rounded-[5px] border-transparent bg-[var(--color-bg-secondary)] px-2 text-[11px] font-normal text-[var(--color-text)] hover:bg-[var(--color-bg-tertiary)]"
                                  >
                                    <span className="flex min-w-0 items-center gap-1.5 truncate">
                                      <SmartphoneIcon
                                        aria-hidden="true"
                                        className="h-3 w-3 shrink-0 text-[var(--color-icon-secondary)]"
                                      />
                                      <span className="truncate">{preset.name}</span>
                                    </span>
                                    <span className="shrink-0 tabular-nums text-[10.5px] text-[var(--color-text-secondary)]">
                                      {preset.width}×{preset.height}
                                    </span>
                                  </Button>
                                ))}
                              </div>
                            )}
                          </div>
                        )}

                        {filteredLocal.length === 0 &&
                          filteredKit.length === 0 &&
                          filteredPresets.length === 0 && (
                            <div className="py-8 text-center text-[11px] text-[var(--color-text-tertiary)]">
                              No assets match &ldquo;{assetQuery}&rdquo;.
                            </div>
                          )}
                      </>
                    )
                  })()}
                </ScrollAreaContent>
              </ScrollAreaViewport>
              <ScrollAreaScrollbar orientation="vertical">
                <ScrollAreaThumb />
              </ScrollAreaScrollbar>
            </ScrollArea>
          </TabsPanel>

          {/* Variables (Tokens) Tab */}
          <TabsPanel value="tokens" className="flex min-h-0 flex-1 flex-col overflow-hidden">
            <div className="flex flex-col gap-2 border-b border-[var(--color-border)] px-3 py-2.5">
              <span className="text-[11px] font-semibold text-[var(--color-text)]">Variable mode</span>
              <SegmentedField
                label="Variable theme mode"
                value={doc.variables.activeModeId}
                options={doc.variables.modes.map((m) => ({ value: m.id, label: m.name }))}
                onValueChange={(val) => setActiveVariableMode(val)}
              />
              <TextField
                label="Filter variables"
                value={variableQuery}
                onValueChange={setVariableQuery}
                placeholder="Search variables…"
                leading={<SearchIcon className="h-3.5 w-3.5" />}
                clearable
                clearLabel="Clear variable search"
              />
              <div className="flex items-center gap-1" role="group" aria-label="Filter variables by group">
                {VARIABLE_FILTER_OPTIONS.map((opt) => {
                  const active = variableTypeFilter === opt.value
                  return (
                    <Button
                      key={opt.value}
                      aria-pressed={active}
                      onClick={() => setVariableTypeFilter(opt.value)}
                      className={`!h-[20px] rounded-[4px] border-transparent px-1.5 text-[10px] font-medium ${
                        active
                          ? "bg-[var(--color-bg-selected)] text-[var(--color-text-brand)]"
                          : "bg-[var(--color-bg-secondary)] text-[var(--color-text-secondary)] hover:text-[var(--color-text)]"
                      }`}
                    >
                      {opt.label}
                    </Button>
                  )
                })}
              </div>
            </div>

            <ScrollArea>
              <ScrollAreaViewport role="region" aria-label="Design tokens">
                <ScrollAreaContent className="flex flex-col gap-1.5 !p-3">
                  {(() => {
                    const q = variableQuery.trim().toLowerCase()
                    const filteredVars = doc.variables.variables.filter((v) => {
                      const matchesType =
                        variableTypeFilter === "all" || v.type === variableTypeFilter
                      const matchesQuery = !q || v.name.toLowerCase().includes(q)
                      return matchesType && matchesQuery
                    })
                    return (
                      <>
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-semibold text-[var(--color-text)]">
                            Variables ({filteredVars.length})
                          </span>
                          <div className="flex gap-1">
                            <ActionButton
                              ariaLabel="Add color variable"
                              onClick={() => addVariable("color")}
                            >
                              + Color
                            </ActionButton>
                            <ActionButton
                              ariaLabel="Add number variable"
                              onClick={() => addVariable("number")}
                            >
                              + Num
                            </ActionButton>
                          </div>
                        </div>

                        {filteredVars.length === 0 ? (
                          <div className="py-6 text-center text-[11px] text-[var(--color-text-tertiary)]">
                            No matching variables.
                          </div>
                        ) : (
                          filteredVars.map((v) => {
                            const currentVal = v.values[doc.variables.activeModeId]
                            return (
                              <div
                                key={v.id}
                                className="flex h-[32px] items-center gap-1.5 rounded-[5px] bg-[var(--color-bg-secondary)] px-1.5"
                              >
                                {v.type === "color" ? (
                                  <ColorField
                                    compact
                                    side="right"
                                    label={`${v.name} color`}
                                    value={String(currentVal || "#ffffff")}
                                    onValueChange={(nextColor) =>
                                      updateVariableModeValue(
                                        v.id,
                                        doc.variables.activeModeId,
                                        nextColor
                                      )
                                    }
                                  />
                                ) : (
                                  <span className="w-[22px] shrink-0 text-center font-mono text-[11px] text-[var(--color-text-brand)]">
                                    #
                                  </span>
                                )}
                                <TextField
                                  size="xs"
                                  variant="ghost"
                                  label={`Token name ${v.name}`}
                                  value={v.name}
                                  onValueChange={(next) => updateVariable(v.id, { name: next })}
                                  className="flex-1 px-1"
                                />
                                {v.type === "number" && (
                                  <TextField
                                    size="xs"
                                    label={`Token value ${v.name}`}
                                    value={String(currentVal ?? 0)}
                                    onValueChange={(next) => {
                                      const num = Number(next)
                                      if (!Number.isNaN(num)) {
                                        updateVariableModeValue(v.id, doc.variables.activeModeId, num)
                                      }
                                    }}
                                    className="w-11 bg-[var(--color-bg)] px-1 text-right tabular-nums"
                                  />
                                )}
                                {v.type === "color" && doc.selectedIds.length > 0 && (
                                  <IconButton
                                    size="xs"
                                    label={`Bind ${v.name} to selected fill`}
                                    title="Bind to selected layer fill"
                                    onClick={() => {
                                      updateNodes(doc.selectedIds, (node) => ({
                                        fills:
                                          node.fills.length > 0
                                            ? node.fills.map((f, idx) =>
                                                idx === 0
                                                  ? {
                                                      ...f,
                                                      type: "solid",
                                                      color: String(currentVal || f.color),
                                                      variableId: v.id,
                                                    }
                                                  : f
                                              )
                                            : [
                                                {
                                                  id: `fill-${Date.now()}`,
                                                  type: "solid",
                                                  visible: true,
                                                  opacity: 1,
                                                  color: String(currentVal || "#ffffff"),
                                                  variableId: v.id,
                                                },
                                              ],
                                      }))
                                      toast(`Bound ${v.name} to fill`)
                                    }}
                                    className="hover:text-[var(--color-icon-brand)]"
                                  >
                                    <Link2Icon aria-hidden="true" className="h-3 w-3" />
                                  </IconButton>
                                )}
                                <IconButton
                                  size="xs"
                                  label={`Delete variable ${v.name}`}
                                  onClick={() => deleteVariable(v.id)}
                                  className="hover:text-[var(--ui-destructive)]"
                                >
                                  <Trash2Icon aria-hidden="true" className="h-3 w-3" />
                                </IconButton>
                              </div>
                            )
                          })
                        )}
                      </>
                    )
                  })()}
                </ScrollAreaContent>
              </ScrollAreaViewport>
              <ScrollAreaScrollbar orientation="vertical">
                <ScrollAreaThumb />
              </ScrollAreaScrollbar>
            </ScrollArea>
          </TabsPanel>
        </div>
      </Tabs>

      {/* Right-click Layer Context Menu (mounted on demand) */}
      {contextMenu && contextNode && (
        <div
          data-figma-context-menu=""
          role="menu"
          aria-label={`Layer actions for ${contextNode.name}`}
          style={{ left: contextMenu.x, top: contextMenu.y }}
          className="fixed z-50 flex w-[196px] flex-col rounded-[8px] border border-[var(--color-border)] bg-[var(--color-bg-elevated)] p-1 shadow-[var(--ui-shadow)]"
        >
          {[
            {
              label: "Rename",
              shortcut: "F2",
              run: () => {
                setRenamingId(contextNode.id)
                setRenameDraft(contextNode.name)
              },
            },
            {
              label: "Zoom to selection",
              shortcut: "Shift+2",
              run: () => onRunAction("zoom-selection"),
            },
          ].map((item) => (
            <Button
              key={item.label}
              role="menuitem"
              onClick={() => {
                setContextMenu(null)
                item.run()
              }}
              className="!h-[26px] w-full justify-between rounded-[5px] border-transparent bg-transparent px-2 text-[11px] font-normal text-[var(--color-text)] hover:bg-[var(--color-bg-brand)] hover:text-white"
            >
              <span>{item.label}</span>
              <span className="text-[10px] opacity-60">{item.shortcut}</span>
            </Button>
          ))}
          <div className="my-1 h-px bg-[var(--color-border)]" />
          {[
            { label: "Duplicate", shortcut: "Ctrl+D", action: "duplicate" },
            { label: "Frame selection", shortcut: "Ctrl+G", action: "frame-selection" },
            { label: "Add / toggle Auto Layout", shortcut: "Shift+A", action: "auto-layout" },
            { label: "Create component", shortcut: "Ctrl+Alt+K", action: "create-component" },
            { label: "Ungroup", shortcut: "Ctrl+Shift+G", action: "ungroup" },
          ].map((item) => (
            <Button
              key={item.label}
              role="menuitem"
              onClick={() => {
                setContextMenu(null)
                onRunAction(item.action)
              }}
              className="!h-[26px] w-full justify-between rounded-[5px] border-transparent bg-transparent px-2 text-[11px] font-normal text-[var(--color-text)] hover:bg-[var(--color-bg-brand)] hover:text-white"
            >
              <span>{item.label}</span>
              <span className="text-[10px] opacity-60">{item.shortcut}</span>
            </Button>
          ))}
          <div className="my-1 h-px bg-[var(--color-border)]" />
          <Button
            role="menuitem"
            onClick={() => {
              setContextMenu(null)
              updateNodes(doc.selectedIds, { locked: !contextNode.locked })
            }}
            className="!h-[26px] w-full justify-between rounded-[5px] border-transparent bg-transparent px-2 text-[11px] font-normal text-[var(--color-text)] hover:bg-[var(--color-bg-brand)] hover:text-white"
          >
            <span>{contextNode.locked ? "Unlock" : "Lock"}</span>
          </Button>
          <Button
            role="menuitem"
            onClick={() => {
              setContextMenu(null)
              updateNodes(doc.selectedIds, { visible: !contextNode.visible })
            }}
            className="!h-[26px] w-full justify-between rounded-[5px] border-transparent bg-transparent px-2 text-[11px] font-normal text-[var(--color-text)] hover:bg-[var(--color-bg-brand)] hover:text-white"
          >
            <span>{contextNode.visible ? "Hide" : "Show"}</span>
          </Button>
          <div className="my-1 h-px bg-[var(--color-border)]" />
          <Button
            role="menuitem"
            onClick={() => {
              setContextMenu(null)
              onRunAction("delete")
            }}
            className="!h-[26px] w-full justify-between rounded-[5px] border-transparent bg-transparent px-2 text-[11px] font-normal text-[var(--ui-destructive)] hover:bg-[var(--ui-destructive)] hover:text-white"
          >
            <span>Delete</span>
            <span className="text-[10px] opacity-70">Del</span>
          </Button>
        </div>
      )}

      {/* Right-click Page Context Menu (mounted on demand) */}
      {pageContextMenu && contextPage && (
        <div
          data-figma-context-menu=""
          role="menu"
          aria-label={`Page actions for ${contextPage.name}`}
          style={{ left: pageContextMenu.x, top: pageContextMenu.y }}
          className="fixed z-50 flex w-[164px] flex-col rounded-[8px] border border-[var(--color-border)] bg-[var(--color-bg-elevated)] p-1 shadow-[var(--ui-shadow)]"
        >
          <Button
            role="menuitem"
            onClick={() => {
              setPageContextMenu(null)
              setRenamingPageId(contextPage.id)
              setPageRenameDraft(contextPage.name)
            }}
            className="!h-[26px] w-full justify-start rounded-[5px] border-transparent bg-transparent px-2 text-[11px] font-normal text-[var(--color-text)] hover:bg-[var(--color-bg-brand)] hover:text-white"
          >
            Rename page
          </Button>
          <Button
            role="menuitem"
            onClick={() => {
              setPageContextMenu(null)
              duplicatePage(contextPage.id)
              toast("Duplicated page")
            }}
            className="!h-[26px] w-full justify-start rounded-[5px] border-transparent bg-transparent px-2 text-[11px] font-normal text-[var(--color-text)] hover:bg-[var(--color-bg-brand)] hover:text-white"
          >
            Duplicate page
          </Button>
          <div className="my-1 h-px bg-[var(--color-border)]" />
          <Button
            role="menuitem"
            disabled={doc.pages.length <= 1}
            onClick={() => {
              setPageContextMenu(null)
              deletePage(contextPage.id)
              toast("Deleted page")
            }}
            className="!h-[26px] w-full justify-start rounded-[5px] border-transparent bg-transparent px-2 text-[11px] font-normal text-[var(--ui-destructive)] hover:bg-[var(--ui-destructive)] hover:text-white disabled:opacity-40"
          >
            Delete page
          </Button>
        </div>
      )}
    </aside>
  )
}
