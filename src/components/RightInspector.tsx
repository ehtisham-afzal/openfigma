"use client"

import * as React from "react"
import { Button } from "@ui-sdk/react/button"
import {
  Dialog,
  DialogBackdrop,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@ui-sdk/react/dialog"
import {
  Menu,
  MenuContent,
  MenuItem,
  MenuSeparator,
  MenuTrigger,
} from "@ui-sdk/react/menu"
import {
  ScrollArea,
  ScrollAreaContent,
  ScrollAreaScrollbar,
  ScrollAreaThumb,
  ScrollAreaViewport,
} from "@ui-sdk/react/scroll-area"
import { Switch, SwitchThumb } from "@ui-sdk/react/switch"
import { Tabs, TabsList, TabsPanel, TabsTab } from "@ui-sdk/react/tabs"
import { toast } from "@ui-sdk/react/toast"
import {
  AlignCenterIcon,
  AlignLeftIcon,
  AlignRightIcon,
  CheckIcon,
  ChevronRightIcon,
  Code2Icon,
  CopyIcon,
  DownloadIcon,
  FileJsonIcon,
  Grid2x2Icon,
  StrikethroughIcon,
  UnderlineIcon,
  XIcon,
} from "lucide-react"
import { createNodeId, useDesignStore } from "../store/useDesignStore"
import {
  FRAME_PRESETS,
  type AutoLayoutConfig,
  type BlendMode,
  type CounterAlign,
  type DesignNode,
  type LayoutAlign,
  type StrokeLayer,
  type TextAlign,
  type TextTransform,
} from "../types/design"
import {
  buildCssSnippet,
  buildReactTailwindSnippet,
  buildSvgMarkup,
  buildTokensCssSnippet,
  downloadTextFile,
  exportSvgAsPng,
} from "../utils/export"
import {
  ActionButton,
  CheckboxField,
  ColorField,
  EffectPopoverField,
  FieldLabel,
  FigmaAlignBottomIcon,
  FigmaAlignHorizontalCenterIcon,
  FigmaAlignLeftIcon,
  FigmaAlignRightIcon,
  FigmaAlignTopIcon,
  FigmaAlignVerticalCenterIcon,
  FigmaAspectRatioLockIcon,
  FigmaAutoLayoutToggleIcon,
  FigmaBlendModeIcon,
  FigmaChevronDownIcon,
  FigmaCodeIcon,
  FigmaComponentIcon,
  FigmaCornerRadiusIcon,
  FigmaDistributeIcon,
  FigmaEyeIcon,
  FigmaEyeOffIcon,
  FigmaFlipHorizontalIcon,
  FigmaFlipVerticalIcon,
  FigmaFlowFreeformIcon,
  FigmaFlowGridIcon,
  FigmaFlowHorizontalIcon,
  FigmaFlowVerticalIcon,
  FigmaGapVerticalIcon,
  FigmaIgnoreAutoLayoutIcon,
  FigmaIndividualPaddingIcon,
  FigmaMinusIcon,
  FigmaMoreIcon,
  FigmaOpacityIcon,
  FigmaPaddingHorizontalIcon,
  FigmaPaddingVerticalIcon,
  FigmaPlayIcon,
  FigmaPlusIcon,
  FigmaRotate90Icon,
  FigmaRotationAngleIcon,
  FigmaSlidersIcon,
  FigmaStylesGridIcon,
  FigmaTargetIcon,
  FigmaUnlinkIcon,
  FigmaWrapIcon,
  FillField,
  IconButton,
  IconMenuTrigger,
  IconToggle,
  InspectorRow,
  InspectorSection,
  InspectorSectionHeader,
  NumberField,
  SegmentedField,
  SegmentedIconButton,
  SegmentedIconGroup,
  SelectField,
} from "./ui"

const FONT_FAMILIES = [
  { value: "Inter", label: "Inter" },
  { value: "Plus Jakarta Sans", label: "Plus Jakarta Sans" },
  { value: "Playfair Display", label: "Playfair Display" },
  { value: "JetBrains Mono", label: "JetBrains Mono" },
]

const FONT_WEIGHTS = [
  { value: "400", label: "Regular" },
  { value: "500", label: "Medium" },
  { value: "600", label: "SemiBold" },
  { value: "700", label: "Bold" },
]

const BLEND_MODES: { value: BlendMode; label: string }[] = [
  { value: "normal", label: "Pass through" },
  { value: "multiply", label: "Multiply" },
  { value: "screen", label: "Screen" },
  { value: "overlay", label: "Overlay" },
  { value: "darken", label: "Darken" },
  { value: "lighten", label: "Lighten" },
]

const STROKE_POSITIONS = [
  { value: "inside", label: "Inside" },
  { value: "center", label: "Center" },
  { value: "outside", label: "Outside" },
]

const EXPORT_SCALES = [
  { value: "1x", label: "1x" },
  { value: "2x", label: "2x" },
]

const EXPORT_FORMATS = [
  { value: "png", label: "PNG" },
  { value: "svg", label: "SVG" },
]

const NODE_TYPE_LABELS: Record<DesignNode["type"], string> = {
  frame: "Frame",
  section: "Section",
  component: "Component",
  instance: "Instance",
  rectangle: "Rectangle",
  ellipse: "Ellipse",
  line: "Line",
  polygon: "Polygon",
  star: "Star",
  text: "Text",
  path: "Vector",
  image: "Image",
}

function CornerArcIcon({ corner }: { corner: "TL" | "TR" | "BR" | "BL" }) {
  const d =
    corner === "TL"
      ? "M7 17V11.5A4.5 4.5 0 0 1 11.5 7H17"
      : corner === "TR"
        ? "M7 7H12.5A4.5 4.5 0 0 1 17 11.5V17"
        : corner === "BL"
          ? "M17 17H11.5A4.5 4.5 0 0 1 7 12.5V7"
          : "M17 7V12.5A4.5 4.5 0 0 1 12.5 17H7"
  return (
    <svg aria-hidden="true" width="24" height="24" viewBox="0 0 24 24" fill="none" className="h-6 w-6 shrink-0">
      <path d={d} stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

/**
 * Official Figma 3x3 Auto Layout Alignment Grid:
 * - Single-click selects primary + counter alignment.
 * - Double-click toggles `Space between` (Auto gap), visually spreading the 3 bars across the axis.
 */
function AutoLayoutAlignmentGrid({
  layout,
  onSelect,
  onToggleSpaceBetween,
}: {
  layout: AutoLayoutConfig
  onSelect: (primary: LayoutAlign, counter: CounterAlign) => void
  onToggleSpaceBetween: (counter: CounterAlign) => void
}) {
  const axes: ("start" | "center" | "end")[] = ["start", "center", "end"]
  const isRow = layout.mode === "horizontal"
  const isSpaceBetween = layout.primaryAlign === "space-between"

  return (
    <div
      role="group"
      aria-label="Auto Layout alignment grid"
      title="Click to align · Double-click for Space between"
      className="relative grid h-[56px] w-full grid-cols-3 grid-rows-3 rounded-[5px] bg-[var(--color-bg-secondary)] p-1"
    >
      {axes.map((row) =>
        axes.map((col) => {
          const pVal = isRow ? col : row
          const cVal = isRow ? row : col
          const matchesCounter =
            layout.counterAlign === cVal ||
            (layout.counterAlign === "stretch" && cVal === "start")
          const active = isSpaceBetween
            ? matchesCounter
            : layout.primaryAlign === pVal && matchesCounter

          return (
            <Button
              key={`${row}-${col}`}
              aria-label={`Align ${row} ${col}`}
              onClick={() =>
                onSelect(isSpaceBetween ? "space-between" : pVal, cVal)
              }
              onDoubleClick={() => onToggleSpaceBetween(cVal)}
              className="flex !h-full !w-full items-center justify-center rounded-[3px] border-transparent bg-transparent !p-0 hover:bg-[var(--color-bg-hover)]"
            >
              {isSpaceBetween && active ? (
                <span
                  aria-hidden="true"
                  className={
                    isRow
                      ? "h-2.5 w-[1.5px] rounded-full bg-[var(--color-icon-brand)]"
                      : "h-[1.5px] w-2.5 rounded-full bg-[var(--color-icon-brand)]"
                  }
                />
              ) : !isSpaceBetween && active ? (
                <span
                  aria-hidden="true"
                  className={`flex items-center justify-center gap-[1.5px] ${
                    isRow ? "flex-row" : "flex-col"
                  }`}
                >
                  <span
                    className={
                      isRow
                        ? "h-2 w-[1.5px] rounded-full bg-[var(--color-icon-brand)]"
                        : "h-[1.5px] w-2 rounded-full bg-[var(--color-icon-brand)]"
                    }
                  />
                  <span
                    className={
                      isRow
                        ? "h-3 w-[1.5px] rounded-full bg-[var(--color-icon-brand)]"
                        : "h-[1.5px] w-3 rounded-full bg-[var(--color-icon-brand)]"
                    }
                  />
                  <span
                    className={
                      isRow
                        ? "h-2 w-[1.5px] rounded-full bg-[var(--color-icon-brand)]"
                        : "h-[1.5px] w-2 rounded-full bg-[var(--color-icon-brand)]"
                    }
                  />
                </span>
              ) : (
                <span
                  className="h-[2px] w-[2px] rounded-full bg-[var(--color-icon-tertiary)]"
                  aria-hidden="true"
                />
              )}
            </Button>
          )
        })
      )}
    </div>
  )
}

interface SelectionColorEntry {
  key: string
  color: string
  label: string
  variableId: string | null
  nodeIds: string[]
}

interface RightInspectorProps {
  onRunAction: (action: string) => void
}

export function RightInspector({ onRunAction }: RightInspectorProps) {
  const {
    doc,
    activePage,
    selectedNodes,
    setSelectedIds,
    updateNodes,
    commitCheckpoint,
    toggleFlag,
    alignSelection,
    distributeSelection,
    flipSelection,
    toggleAutoLayout,
    createComponentFromSelection,
    detachInstance,
    setPageBackground,
    setActiveVariableMode,
    setPresentMode,
    exportDocumentJson,
  } = useDesignStore()

  const [inspectorTab, setInspectorTab] = React.useState<"design" | "inspect">("design")
  const [codeFormat, setCodeFormat] = React.useState<"jsx" | "css" | "tokens" | "svg">("jsx")
  const [exportScale, setExportScale] = React.useState<"1x" | "2x">("2x")
  const [exportFormat, setExportFormat] = React.useState<"png" | "svg">("png")
  const [exportExpanded, setExportExpanded] = React.useState(true)
  const [exportPreviewOpen, setExportPreviewOpen] = React.useState(false)
  const [indepPadding, setIndepPadding] = React.useState(false)
  const primary = selectedNodes[0] ?? null
  const primaryParent = primary?.parentId ? activePage.nodes[primary.parentId] : null
  const insideAutoLayout = Boolean(primaryParent?.layout && primaryParent.layout.mode !== "none")
  const isFlowChild = Boolean(insideAutoLayout && primary && !primary.layoutAbsolute)
  const selectedIds = doc.selectedIds
  const hasCheckpointRef = React.useRef(false)

  React.useEffect(() => {
    setInspectorTab(doc.devMode ? "inspect" : "design")
  }, [doc.devMode])

  const beginLiveEdit = () => {
    if (!hasCheckpointRef.current) {
      commitCheckpoint()
      hasCheckpointRef.current = true
    }
  }

  const endLiveEdit = () => {
    hasCheckpointRef.current = false
  }

  const isMixed = React.useCallback(
    (getter: (n: DesignNode) => number | string | undefined) => {
      if (selectedNodes.length <= 1) return false
      const first = getter(selectedNodes[0])
      return selectedNodes.some((n) => getter(n) !== first)
    },
    [selectedNodes]
  )

  const canAlign = Boolean(
    selectedNodes.length >= 2 ||
      (selectedNodes.length === 1 && primary?.parentId && !isFlowChild)
  )

  const supportsCornerRadius = Boolean(
    primary && primary.type !== "text" && primary.type !== "line"
  )

  const safeFilename = doc.title.toLowerCase().replace(/[^a-z0-9]+/g, "-") || "design"

  const svgSnippet = React.useMemo(
    () =>
      buildSvgMarkup(activePage, doc.variables, selectedIds.length > 0 ? selectedIds : undefined),
    [activePage, doc.variables, selectedIds]
  )

  const svgPreviewDataUri = React.useMemo(() => {
    if (!exportPreviewOpen) return ""
    return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgSnippet)}`
  }, [exportPreviewOpen, svgSnippet])

  const codeSnippet = React.useMemo(() => {
    if (codeFormat === "tokens") return buildTokensCssSnippet(doc.variables)
    if (codeFormat === "svg") return svgSnippet
    if (!primary) return "/* Select a layer to generate code */"
    if (codeFormat === "css") return buildCssSnippet(primary, doc.variables)
    return buildReactTailwindSnippet(primary, activePage, doc.variables)
  }, [codeFormat, doc.variables, svgSnippet, primary, activePage])

  const colorVariables = React.useMemo(
    () => doc.variables.variables.filter((v) => v.type === "color"),
    [doc.variables.variables]
  )

  const selectionColors = React.useMemo<SelectionColorEntry[]>(() => {
    if (selectedIds.length === 0) return []
    const subtreeIds = new Set<string>(selectedIds)
    let added = true
    while (added) {
      added = false
      for (const id of activePage.order) {
        const node = activePage.nodes[id]
        if (node?.parentId && subtreeIds.has(node.parentId) && !subtreeIds.has(id)) {
          subtreeIds.add(id)
          added = true
        }
      }
    }
    const map = new Map<string, SelectionColorEntry>()
    for (const id of subtreeIds) {
      const node = activePage.nodes[id]
      if (!node) continue
      for (const fill of node.fills) {
        if (!fill.visible || fill.type === "image") continue
        const bound = fill.variableId
          ? doc.variables.variables.find((v) => v.id === fill.variableId)
          : undefined
        const resolved = bound
          ? String(bound.values[doc.variables.activeModeId] ?? fill.color)
          : fill.color
        const key = bound ? `var:${bound.id}` : `hex:${resolved.toLowerCase()}`
        const existing = map.get(key)
        if (existing) {
          if (!existing.nodeIds.includes(id)) existing.nodeIds.push(id)
        } else {
          map.set(key, {
            key,
            color: resolved,
            label: bound ? bound.name : resolved.replace(/^#/, "").toUpperCase(),
            variableId: bound ? bound.id : null,
            nodeIds: [id],
          })
        }
      }
      for (const stroke of node.strokes) {
        if (!stroke.visible) continue
        const bound = stroke.variableId
          ? doc.variables.variables.find((v) => v.id === stroke.variableId)
          : undefined
        const resolved = bound
          ? String(bound.values[doc.variables.activeModeId] ?? stroke.color)
          : stroke.color
        const key = bound ? `var:${bound.id}` : `hex:${resolved.toLowerCase()}`
        const existing = map.get(key)
        if (existing) {
          if (!existing.nodeIds.includes(id)) existing.nodeIds.push(id)
        } else {
          map.set(key, {
            key,
            color: resolved,
            label: bound ? bound.name : resolved.replace(/^#/, "").toUpperCase(),
            variableId: bound ? bound.id : null,
            nodeIds: [id],
          })
        }
      }
    }
    return Array.from(map.values()).slice(0, 6)
  }, [activePage, doc.variables, selectedIds])

  const handleCopy = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text)
      toast(`Copied ${label}`)
    } catch {
      toast("Unable to access clipboard")
    }
  }

  const isFrameLike =
    primary &&
    (primary.type === "frame" ||
      primary.type === "section" ||
      primary.type === "component" ||
      primary.type === "instance")

  const hasFlexLayout = Boolean(isFrameLike && primary.layout && primary.layout.mode !== "none")

  const updateLayout = (patch: Partial<AutoLayoutConfig>, record = true) => {
    if (!primary) return
    const current: AutoLayoutConfig = primary.layout ?? {
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
    updateNodes(selectedIds, { layout: { ...current, ...patch } }, record)
  }

  const handleExportLayer = () => {
    const baseName = primary ? primary.name : activePage.name
    if (exportFormat === "svg") {
      downloadTextFile(`${baseName}.svg`, svgSnippet, "image/svg+xml")
      toast(`Exported ${baseName}.svg`)
    } else {
      void exportSvgAsPng(svgSnippet, `${baseName}.png`)
      toast(`Exported ${baseName}.png (${exportScale})`)
    }
  }

  const handleExportCodeFile = () => {
    const ext = codeFormat === "jsx" ? "tsx" : codeFormat === "svg" ? "svg" : "css"
    downloadTextFile(`${safeFilename}.${ext}`, codeSnippet, "text/plain")
    toast(`Exported ${safeFilename}.${ext}`)
  }

  const handleSelectMatchingLayers = () => {
    if (!primary) return
    const matches = activePage.order.filter((id) => {
      const n = activePage.nodes[id]
      return n && n.type === primary.type && n.parentId === primary.parentId
    })
    if (matches.length > 0) {
      setSelectedIds(matches)
      toast(`Selected ${matches.length} matching ${NODE_TYPE_LABELS[primary.type].toLowerCase()} layer(s)`)
    }
  }

  const handleBatchColorUpdate = (entry: SelectionColorEntry, nextColor: string) => {
    beginLiveEdit()
    const matchHex = entry.color.toLowerCase()
    updateNodes(
      entry.nodeIds,
      (node) => ({
        fills: node.fills.map((f) => {
          const matches = entry.variableId
            ? f.variableId === entry.variableId
            : !f.variableId && f.color.toLowerCase() === matchHex
          return matches ? { ...f, color: nextColor, variableId: null } : f
        }),
        strokes: node.strokes.map((s) => {
          const matches = entry.variableId
            ? s.variableId === entry.variableId
            : !s.variableId && s.color.toLowerCase() === matchHex
          return matches ? { ...s, color: nextColor, variableId: null } : s
        }),
      }),
      false
    )
  }

  const flowModeValue = !hasFlexLayout
    ? "none"
    : primary?.layout?.wrap && primary.layout.mode === "horizontal"
      ? "grid"
      : primary?.layout?.mode ?? "none"

  // Determine inline Figma Resizing mode badges for W & H
  const parentMainIsRow = primaryParent?.layout?.mode === "horizontal"
  const widthMode: "fixed" | "hug" | "fill" =
    isFlowChild && parentMainIsRow && primary?.layoutGrow
      ? "fill"
      : hasFlexLayout && primary?.layout
        ? (primary.layout.mode === "horizontal"
            ? primary.layout.primarySizing
            : primary.layout.counterSizing)
        : "fixed"

  const heightMode: "fixed" | "hug" | "fill" =
    isFlowChild && !parentMainIsRow && primary?.layoutGrow
      ? "fill"
      : hasFlexLayout && primary?.layout
        ? (primary.layout.mode === "vertical"
            ? primary.layout.primarySizing
            : primary.layout.counterSizing)
        : "fixed"

  const showWidthResizeMenu = Boolean(hasFlexLayout || (isFlowChild && parentMainIsRow))
  const showHeightResizeMenu = Boolean(hasFlexLayout || (isFlowChild && !parentMainIsRow))

  const applyAxisResizeMode = (axis: "width" | "height", mode: "fixed" | "hug" | "fill") => {
    if (!primary) return
    if (mode === "fill") {
      updateNodes(selectedIds, { layoutGrow: 1 })
      return
    }
    if (isFlowChild && ((axis === "width" && parentMainIsRow) || (axis === "height" && !parentMainIsRow))) {
      updateNodes(selectedIds, { layoutGrow: 0 })
    }
    if (hasFlexLayout && primary.layout) {
      const isPrimary =
        (axis === "width" && primary.layout.mode === "horizontal") ||
        (axis === "height" && primary.layout.mode === "vertical")
      updateLayout(isPrimary ? { primarySizing: mode } : { counterSizing: mode })
    }
  }

  const isSpaceBetween = Boolean(primary?.layout?.primaryAlign === "space-between")

  return (
    <aside
      aria-label="OpenFigma right inspector"
      className="figma-ui3-panel flex h-full w-full flex-col overflow-hidden"
    >
      {/* Official Figma UI3 40px Top Panel Header */}
      <div className="flex h-[40px] shrink-0 items-center justify-between gap-2 px-3 pt-1">
        <div className="flex items-center gap-1.5">
          <div
            title="You (Active)"
            className="flex h-[24px] items-center gap-0.5 rounded-full text-[var(--color-icon-secondary)]"
          >
            <span className="flex h-[24px] w-[24px] items-center justify-center rounded-full bg-[#f2c94c] text-[11px] font-semibold text-[#1e1e1e]">
              Y
            </span>
            <FigmaChevronDownIcon />
          </div>
          {doc.devMode && (
            <span className="rounded bg-[var(--color-bg-dev)]/20 px-1.5 py-0.5 text-[10px] font-semibold text-[#4ade80]">
              Dev Mode
            </span>
          )}
        </div>

        <div className="flex items-center gap-1">
          <div role="group" aria-label="Prototype view" className="flex items-center">
            <IconButton
              size="md"
              label="Present prototype"
              onClick={() => setPresentMode(true)}
              className="rounded-r-none"
            >
              <FigmaPlayIcon />
            </IconButton>
            <Menu
              onAction={(val) => {
                if (val === "present") setPresentMode(true)
                else onRunAction(val)
              }}
            >
              <MenuTrigger
                aria-label="Prototype view options"
                className="flex !h-[32px] !w-[16px] items-center justify-center rounded-l-none rounded-r-[5px] border-transparent bg-transparent !p-0 text-[var(--color-icon-secondary)] hover:bg-[var(--color-bg-hover)] hover:text-[var(--color-icon)]"
              >
                <FigmaChevronDownIcon />
              </MenuTrigger>
              <MenuContent align="end">
                <MenuItem value="present">Present</MenuItem>
                <MenuItem value="zoom-fit">Preview fit to screen</MenuItem>
              </MenuContent>
            </Menu>
          </div>

          <Dialog>
            <DialogTrigger
              data-variant="solid"
              className="!h-[32px] rounded-[5px] border-[var(--color-bg-brand)] bg-[var(--color-bg-brand)] px-3 text-[11px] font-semibold text-white hover:bg-[var(--color-bg-brand-hover)]"
            >
              Share
            </DialogTrigger>
            <DialogBackdrop />
            <DialogContent className="w-[430px] max-w-[92vw] p-4">
              <div className="mb-3 flex items-start justify-between">
                <div>
                  <DialogTitle className="text-sm font-semibold text-[var(--color-text)]">
                    Share &amp; Export Design
                  </DialogTitle>
                  <DialogDescription className="mt-0.5 text-xs text-[var(--color-text-secondary)]">
                    Export {doc.selectedIds.length > 0 ? `${doc.selectedIds.length} selected layer(s)` : activePage.name} or save a local OpenFigma project.
                  </DialogDescription>
                </div>
                <DialogClose
                  aria-label="Close share dialog"
                  className="!h-[24px] !w-[24px] border-transparent bg-transparent !p-0"
                >
                  <XIcon aria-hidden="true" className="h-4 w-4" />
                </DialogClose>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <ActionButton
                  size="lg"
                  icon={<DownloadIcon aria-hidden="true" className="h-3.5 w-3.5 shrink-0" />}
                  onClick={() => {
                    downloadTextFile(`${safeFilename}.svg`, svgSnippet, "image/svg+xml")
                    toast("Exported Vector SVG")
                  }}
                >
                  Vector SVG
                </ActionButton>
                <ActionButton
                  size="lg"
                  variant="primary"
                  icon={<DownloadIcon aria-hidden="true" className="h-3.5 w-3.5 shrink-0" />}
                  onClick={() => {
                    void exportSvgAsPng(svgSnippet, `${safeFilename}.png`)
                    toast("Exported PNG 2×")
                  }}
                >
                  PNG 2×
                </ActionButton>
                <ActionButton
                  size="lg"
                  icon={<Code2Icon aria-hidden="true" className="h-3.5 w-3.5 shrink-0" />}
                  onClick={() => {
                    const target = primary ?? activePage.nodes[activePage.order[0]]
                    if (target) {
                      downloadTextFile(
                        `${safeFilename}.tsx`,
                        buildReactTailwindSnippet(target, activePage, doc.variables),
                        "text/plain"
                      )
                      toast("Exported React + Tailwind JSX")
                    }
                  }}
                >
                  React + Tailwind
                </ActionButton>
                <ActionButton
                  size="lg"
                  icon={<FileJsonIcon aria-hidden="true" className="h-3.5 w-3.5 shrink-0" />}
                  onClick={() => {
                    downloadTextFile(`${safeFilename}.openfigma.json`, exportDocumentJson(), "application/json")
                    toast("Saved OpenFigma project (.json)")
                  }}
                >
                  Save .json
                </ActionButton>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Official Figma UI3 40px Tab Bar (Design / Inspect + Zoom) */}
      <Tabs
        value={inspectorTab}
        onValueChange={(val) => val && setInspectorTab(val as "design" | "inspect")}
        className="flex min-h-0 flex-1 flex-col"
      >
        <div className="flex h-[40px] shrink-0 items-center justify-between border-b border-[var(--color-border)] px-3">
          <TabsList aria-label="Inspector mode" className="flex gap-1">
            <TabsTab value="design">Design</TabsTab>
            <TabsTab
              value="inspect"
              className={
                doc.devMode
                  ? "data-selected:bg-[#14ae5c]/25 data-selected:text-[#4ade80]"
                  : undefined
              }
            >
              Inspect
            </TabsTab>
          </TabsList>

          <Menu onAction={onRunAction}>
            <MenuTrigger
              aria-label="Zoom level"
              className="!h-[24px] gap-0.5 rounded-[5px] border-transparent bg-transparent px-1.5 text-[11px] font-medium tabular-nums text-[var(--color-text)] hover:bg-[var(--color-bg-secondary)]"
            >
              <span>{Math.round(doc.viewport.zoom * 100)}%</span>
              <FigmaChevronDownIcon className="h-4 w-4 text-[var(--color-icon-secondary)]" />
            </MenuTrigger>
            <MenuContent align="end">
              <MenuItem value="zoom-in" shortcut="mod+=">Zoom in</MenuItem>
              <MenuItem value="zoom-out" shortcut="mod+-">Zoom out</MenuItem>
              <MenuSeparator />
              <MenuItem value="zoom-100" shortcut="shift+0">Zoom to 100%</MenuItem>
              <MenuItem value="zoom-fit" shortcut="shift+1">Zoom to fit</MenuItem>
              <MenuItem value="zoom-selection" shortcut="shift+2" disabled={doc.selectedIds.length === 0}>
                Zoom to selection
              </MenuItem>
            </MenuContent>
          </Menu>
        </div>

        <TabsPanel value="design" className="flex min-h-0 flex-1 flex-col">
          <ScrollArea className="border-none">
            <ScrollAreaViewport role="region" aria-label="Design properties">
              <ScrollAreaContent className="flex flex-col divide-y divide-[var(--color-border)]">
                {!primary ? (
                  <>
                    <InspectorSection>
                      <InspectorSectionHeader
                        title="Page"
                        action={
                          <span className="text-[11px] text-[var(--color-text-secondary)]">
                            {activePage.order.length} layers
                          </span>
                        }
                      />
                      <ColorField
                        label="Page background"
                        value={activePage.background || "#1e1e1e"}
                        onValueChange={(color) => setPageBackground(color)}
                      />
                      <label className="flex h-[24px] items-center justify-between text-[11px] text-[var(--color-text)]">
                        <span>Canvas Grid</span>
                        <Switch
                          aria-label="Show canvas grid"
                          checked={doc.showGrid}
                          onCheckedChange={(v) => toggleFlag("showGrid", v)}
                        >
                          <SwitchThumb />
                        </Switch>
                      </label>
                      <label className="flex h-[24px] items-center justify-between text-[11px] text-[var(--color-text)]">
                        <span>Rulers</span>
                        <Switch
                          aria-label="Show rulers"
                          checked={doc.showRulers}
                          onCheckedChange={(v) => toggleFlag("showRulers", v)}
                        >
                          <SwitchThumb />
                        </Switch>
                      </label>
                      <label className="flex h-[24px] items-center justify-between text-[11px] text-[var(--color-text)]">
                        <span>Snap to Objects</span>
                        <Switch
                          aria-label="Snap to objects"
                          checked={doc.snapToObjects}
                          onCheckedChange={(v) => toggleFlag("snapToObjects", v)}
                        >
                          <SwitchThumb />
                        </Switch>
                      </label>
                    </InspectorSection>

                    <InspectorSection>
                      <InspectorSectionHeader title="Variables" />
                      <SegmentedField
                        label="Page variable mode"
                        value={doc.variables.activeModeId}
                        options={doc.variables.modes.map((m) => ({ value: m.id, label: m.name }))}
                        onValueChange={(val) => setActiveVariableMode(val)}
                      />
                    </InspectorSection>

                    <InspectorSection>
                      <InspectorSectionHeader title="Export" />
                      <div className="grid grid-cols-2 gap-2">
                        <SelectField
                          label="Export scale"
                          value={exportScale}
                          options={EXPORT_SCALES}
                          showIndicator={false}
                          onValueChange={(v) => setExportScale(v as "1x" | "2x")}
                        />
                        <SelectField
                          label="Export format"
                          value={exportFormat}
                          options={EXPORT_FORMATS}
                          showIndicator={false}
                          onValueChange={(v) => setExportFormat(v as "png" | "svg")}
                        />
                      </div>
                      <ActionButton onClick={handleExportLayer} className="w-full">
                        Export {activePage.name}
                      </ActionButton>
                    </InspectorSection>
                  </>
                ) : (
                  <>
                    {/* Official Figma UI3 40px Selection Action Bar (Frame ▾ ... </> ❖ ⋯) */}
                    <div className="flex h-[40px] shrink-0 items-center justify-between gap-1 px-3.5">
                      {primary.type === "frame" && selectedNodes.length === 1 ? (
                        <Menu
                          onAction={(val) => {
                            const preset = FRAME_PRESETS.find((p) => p.name === val)
                            if (preset) {
                              updateNodes(selectedIds, {
                                width: preset.width,
                                height: preset.height,
                                name: preset.name,
                              })
                              toast(`Resized to ${preset.name}`)
                            }
                          }}
                        >
                          <MenuTrigger
                            aria-label="Frame dimension presets"
                            className="!h-[24px] -ml-1.5 gap-0.5 rounded-[5px] border-transparent bg-transparent px-1.5 text-[13px] font-semibold text-[var(--color-text)] hover:bg-[var(--color-bg-secondary)]"
                          >
                            <span>Frame</span>
                            <FigmaChevronDownIcon className="h-4 w-4 text-[var(--color-icon-secondary)]" />
                          </MenuTrigger>
                          <MenuContent align="start">
                            {FRAME_PRESETS.map((preset) => (
                              <MenuItem key={preset.name} value={preset.name}>
                                <span>{preset.name}</span>
                                <span className="ml-auto pl-3 text-[11px] tabular-nums text-[var(--color-text-secondary)]">
                                  {preset.width}×{preset.height}
                                </span>
                              </MenuItem>
                            ))}
                          </MenuContent>
                        </Menu>
                      ) : (
                        <span className="truncate text-[13px] font-semibold text-[var(--color-text)]">
                          {selectedNodes.length > 1
                            ? `${selectedNodes.length} Layers`
                            : NODE_TYPE_LABELS[primary.type]}
                        </span>
                      )}

                      <div className="flex items-center gap-1">
                        <IconButton
                          label="Inspect code for selection"
                          title="Inspect code"
                          active={doc.devMode}
                          onClick={() => setInspectorTab("inspect")}
                        >
                          <FigmaCodeIcon />
                        </IconButton>

                        {primary.type === "instance" ? (
                          <IconButton
                            label="Detach instance"
                            title="Detach instance"
                            onClick={() => {
                              detachInstance()
                              toast("Detached component instance")
                            }}
                            className="text-[var(--color-text-component)]"
                          >
                            <FigmaUnlinkIcon />
                          </IconButton>
                        ) : (
                          <IconButton
                            label="Create component"
                            title="Create component"
                            disabled={primary.type === "component"}
                            onClick={() => {
                              createComponentFromSelection()
                              toast("Created component")
                            }}
                          >
                            <FigmaComponentIcon />
                          </IconButton>
                        )}

                        <Menu
                          onAction={(val) => {
                            if (val === "select-matching") handleSelectMatchingLayers()
                            else if (val === "toggle-mask") {
                              const next = !primary.isMask
                              updateNodes(selectedIds, {
                                isMask: next,
                                ...(next ? { clipContent: true } : {}),
                              })
                              toast(next ? "Enabled layer as mask" : "Disabled layer mask")
                            } else onRunAction(val)
                          }}
                        >
                          <IconMenuTrigger label="More selection actions">
                            <FigmaMoreIcon />
                          </IconMenuTrigger>
                          <MenuContent align="end">
                            <MenuItem value="select-matching">Select matching layers</MenuItem>
                            <MenuItem value="toggle-mask">
                              {primary.isMask ? "Remove mask" : "Use as mask"}
                            </MenuItem>
                            <MenuSeparator />
                            <MenuItem value="frame-selection" shortcut="mod+g">Frame selection</MenuItem>
                            <MenuItem value="ungroup" shortcut="mod+shift+g">Ungroup selection</MenuItem>
                            <MenuItem value="duplicate" shortcut="mod+d">Duplicate</MenuItem>
                          </MenuContent>
                        </Menu>
                      </div>
                    </div>

                    {/* Official Figma UI3 Position Section */}
                    <InspectorSection>
                      <InspectorSectionHeader
                        title="Position"
                        action={
                          insideAutoLayout && (
                            <IconToggle
                              label="Ignore auto layout"
                              title="Ignore auto layout (absolute position)"
                              pressed={Boolean(primary.layoutAbsolute)}
                              onPressedChange={(layoutAbsolute) =>
                                updateNodes(selectedIds, { layoutAbsolute })
                              }
                            >
                              <FigmaIgnoreAutoLayoutIcon />
                            </IconToggle>
                          )
                        }
                      />

                      <div>
                        <FieldLabel>Alignment</FieldLabel>
                        <InspectorRow>
                          <SegmentedIconGroup label="Horizontal alignment">
                            <SegmentedIconButton
                              label="Align left"
                              disabled={!canAlign}
                              onClick={() => alignSelection("left")}
                            >
                              <FigmaAlignLeftIcon />
                            </SegmentedIconButton>
                            <SegmentedIconButton
                              label="Align horizontal centers"
                              disabled={!canAlign}
                              onClick={() => alignSelection("center")}
                            >
                              <FigmaAlignHorizontalCenterIcon />
                            </SegmentedIconButton>
                            <SegmentedIconButton
                              label="Align right"
                              disabled={!canAlign}
                              onClick={() => alignSelection("right")}
                            >
                              <FigmaAlignRightIcon />
                            </SegmentedIconButton>
                          </SegmentedIconGroup>

                          <SegmentedIconGroup label="Vertical alignment">
                            <SegmentedIconButton
                              label="Align top"
                              disabled={!canAlign}
                              onClick={() => alignSelection("top")}
                            >
                              <FigmaAlignTopIcon />
                            </SegmentedIconButton>
                            <SegmentedIconButton
                              label="Align vertical centers"
                              disabled={!canAlign}
                              onClick={() => alignSelection("middle")}
                            >
                              <FigmaAlignVerticalCenterIcon />
                            </SegmentedIconButton>
                            <SegmentedIconButton
                              label="Align bottom"
                              disabled={!canAlign}
                              onClick={() => alignSelection("bottom")}
                            >
                              <FigmaAlignBottomIcon />
                            </SegmentedIconButton>
                          </SegmentedIconGroup>

                          <Menu
                            onAction={(val) => {
                              if (val === "dist-h") distributeSelection("horizontal")
                              else if (val === "dist-v") distributeSelection("vertical")
                            }}
                          >
                            <IconMenuTrigger label="More alignment actions">
                              <FigmaDistributeIcon />
                            </IconMenuTrigger>
                            <MenuContent align="end">
                              <MenuItem value="dist-h" disabled={selectedNodes.length < 3}>
                                Distribute horizontal spacing
                              </MenuItem>
                              <MenuItem value="dist-v" disabled={selectedNodes.length < 3}>
                                Distribute vertical spacing
                              </MenuItem>
                            </MenuContent>
                          </Menu>
                        </InspectorRow>
                      </div>

                      <div>
                        <FieldLabel>Position</FieldLabel>
                        <InspectorRow>
                          <NumberField
                            label="X position"
                            prefix="X"
                            value={primary.x}
                            mixed={isMixed((n) => Math.round(n.x))}
                            disabled={isFlowChild}
                            onChange={(x) => {
                              beginLiveEdit()
                              updateNodes(selectedIds, { x }, false)
                            }}
                            onCommit={endLiveEdit}
                          />
                          <NumberField
                            label="Y position"
                            prefix="Y"
                            value={primary.y}
                            mixed={isMixed((n) => Math.round(n.y))}
                            disabled={isFlowChild}
                            onChange={(y) => {
                              beginLiveEdit()
                              updateNodes(selectedIds, { y }, false)
                            }}
                            onCommit={endLiveEdit}
                          />
                          <div aria-hidden="true" />
                        </InspectorRow>
                      </div>

                      <div>
                        <FieldLabel>Rotation</FieldLabel>
                        <InspectorRow>
                          <NumberField
                            label="Rotation"
                            prefix={<FigmaRotationAngleIcon />}
                            suffix="°"
                            value={primary.rotation}
                            mixed={isMixed((n) => Math.round(n.rotation))}
                            min={-360}
                            max={360}
                            onChange={(rotation) => {
                              beginLiveEdit()
                              updateNodes(selectedIds, { rotation }, false)
                            }}
                            onCommit={endLiveEdit}
                          />
                          <SegmentedIconGroup label="Transform actions">
                            <SegmentedIconButton
                              label="Rotate 90° right"
                              title="Rotate 90° right"
                              onClick={() =>
                                updateNodes(selectedIds, (n) => ({
                                  rotation: Math.round((n.rotation + 90) % 360),
                                }))
                              }
                            >
                              <FigmaRotate90Icon />
                            </SegmentedIconButton>
                            <SegmentedIconButton
                              label="Flip horizontal"
                              title="Flip horizontal"
                              onClick={() => flipSelection("horizontal")}
                            >
                              <FigmaFlipHorizontalIcon />
                            </SegmentedIconButton>
                            <SegmentedIconButton
                              label="Flip vertical"
                              title="Flip vertical"
                              onClick={() => flipSelection("vertical")}
                            >
                              <FigmaFlipVerticalIcon />
                            </SegmentedIconButton>
                          </SegmentedIconGroup>
                          <div aria-hidden="true" />
                        </InspectorRow>
                      </div>
                    </InspectorSection>

                    {/* Official Figma UI3 Auto layout / Layout Section */}
                    <InspectorSection>
                      <InspectorSectionHeader
                        title={hasFlexLayout ? "Auto layout" : "Layout"}
                        action={
                          isFrameLike && (
                            <IconButton
                              active={hasFlexLayout}
                              label={hasFlexLayout ? "Remove auto layout" : "Add auto layout"}
                              title={hasFlexLayout ? "Remove auto layout (Shift+A)" : "Add auto layout (Shift+A)"}
                              onClick={toggleAutoLayout}
                            >
                              <FigmaAutoLayoutToggleIcon />
                            </IconButton>
                          )
                        }
                      />

                      {isFrameLike && (
                        <div>
                          <FieldLabel>Flow</FieldLabel>
                          <div className="grid grid-cols-[1fr_24px] items-center gap-2">
                            <SegmentedField
                              label="Layout flow"
                              value={flowModeValue}
                              options={[
                                {
                                  value: "none",
                                  ariaLabel: "Freeform",
                                  label: <FigmaFlowFreeformIcon />,
                                },
                                {
                                  value: "vertical",
                                  ariaLabel: "Vertical",
                                  label: <FigmaFlowVerticalIcon />,
                                },
                                {
                                  value: "horizontal",
                                  ariaLabel: "Horizontal",
                                  label: <FigmaFlowHorizontalIcon />,
                                },
                                {
                                  value: "grid",
                                  ariaLabel: "Grid",
                                  label: <FigmaFlowGridIcon />,
                                },
                              ]}
                              onValueChange={(val) => {
                                if (val === "none") {
                                  updateNodes(selectedIds, { layout: undefined })
                                } else if (val === "grid") {
                                  updateLayout({ mode: "horizontal", wrap: true })
                                } else {
                                  updateLayout({
                                    mode: val as "horizontal" | "vertical",
                                    wrap: false,
                                  })
                                }
                              }}
                            />
                            <IconToggle
                              label="Wrap auto layout"
                              title="Wrap"
                              pressed={Boolean(primary.layout?.wrap)}
                              disabled={!hasFlexLayout}
                              onPressedChange={(wrap) => updateLayout({ wrap })}
                            >
                              <FigmaWrapIcon />
                            </IconToggle>
                          </div>
                        </div>
                      )}

                      <div>
                        <FieldLabel>
                          {showWidthResizeMenu || showHeightResizeMenu ? "Resizing" : "Dimensions"}
                        </FieldLabel>
                        <InspectorRow>
                          <NumberField
                            label="Layer width"
                            prefix="W"
                            value={primary.width}
                            mixed={isMixed((n) => Math.round(n.width))}
                            min={1}
                            onChange={(width) => {
                              beginLiveEdit()
                              const clamped = Math.max(1, width)
                              if (primary.lockAspectRatio) {
                                const ratio = primary.height / Math.max(1, primary.width)
                                updateNodes(
                                  selectedIds,
                                  { width: clamped, height: Math.max(1, Math.round(clamped * ratio)) },
                                  false
                                )
                              } else {
                                updateNodes(selectedIds, { width: clamped }, false)
                              }
                            }}
                            onCommit={endLiveEdit}
                            trailing={
                              showWidthResizeMenu ? (
                                <Menu
                                  onAction={(val) =>
                                    applyAxisResizeMode("width", val as "fixed" | "hug" | "fill")
                                  }
                                >
                                  <MenuTrigger
                                    aria-label="Horizontal resizing"
                                    className="flex !h-full shrink-0 items-center gap-0.5 border-0 bg-transparent px-1 text-[10px] font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-text)]"
                                  >
                                    {widthMode !== "fixed" && (
                                      <span className="capitalize">{widthMode}</span>
                                    )}
                                    <FigmaChevronDownIcon className="h-3.5 w-3.5" />
                                  </MenuTrigger>
                                  <MenuContent align="end">
                                    <MenuItem value="fixed">
                                      <span className="inline-flex w-3.5">
                                        {widthMode === "fixed" && <CheckIcon aria-hidden="true" className="h-3 w-3" />}
                                      </span>
                                      Fixed width
                                    </MenuItem>
                                    {hasFlexLayout && (
                                      <MenuItem value="hug">
                                        <span className="inline-flex w-3.5">
                                          {widthMode === "hug" && <CheckIcon aria-hidden="true" className="h-3 w-3" />}
                                        </span>
                                        Hug contents
                                      </MenuItem>
                                    )}
                                    {isFlowChild && parentMainIsRow && (
                                      <MenuItem value="fill">
                                        <span className="inline-flex w-3.5">
                                          {widthMode === "fill" && <CheckIcon aria-hidden="true" className="h-3 w-3" />}
                                        </span>
                                        Fill container
                                      </MenuItem>
                                    )}
                                  </MenuContent>
                                </Menu>
                              ) : undefined
                            }
                          />

                          <NumberField
                            label="Layer height"
                            prefix="H"
                            value={primary.height}
                            mixed={isMixed((n) => Math.round(n.height))}
                            min={1}
                            onChange={(height) => {
                              beginLiveEdit()
                              const clamped = Math.max(1, height)
                              if (primary.lockAspectRatio) {
                                const ratio = primary.width / Math.max(1, primary.height)
                                updateNodes(
                                  selectedIds,
                                  { height: clamped, width: Math.max(1, Math.round(clamped * ratio)) },
                                  false
                                )
                              } else {
                                updateNodes(selectedIds, { height: clamped }, false)
                              }
                            }}
                            onCommit={endLiveEdit}
                            trailing={
                              showHeightResizeMenu ? (
                                <Menu
                                  onAction={(val) =>
                                    applyAxisResizeMode("height", val as "fixed" | "hug" | "fill")
                                  }
                                >
                                  <MenuTrigger
                                    aria-label="Vertical resizing"
                                    className="flex !h-full shrink-0 items-center gap-0.5 border-0 bg-transparent px-1 text-[10px] font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-text)]"
                                  >
                                    {heightMode !== "fixed" && (
                                      <span className="capitalize">{heightMode}</span>
                                    )}
                                    <FigmaChevronDownIcon className="h-3.5 w-3.5" />
                                  </MenuTrigger>
                                  <MenuContent align="end">
                                    <MenuItem value="fixed">
                                      <span className="inline-flex w-3.5">
                                        {heightMode === "fixed" && <CheckIcon aria-hidden="true" className="h-3 w-3" />}
                                      </span>
                                      Fixed height
                                    </MenuItem>
                                    {hasFlexLayout && (
                                      <MenuItem value="hug">
                                        <span className="inline-flex w-3.5">
                                          {heightMode === "hug" && <CheckIcon aria-hidden="true" className="h-3 w-3" />}
                                        </span>
                                        Hug contents
                                      </MenuItem>
                                    )}
                                    {isFlowChild && !parentMainIsRow && (
                                      <MenuItem value="fill">
                                        <span className="inline-flex w-3.5">
                                          {heightMode === "fill" && <CheckIcon aria-hidden="true" className="h-3 w-3" />}
                                        </span>
                                        Fill container
                                      </MenuItem>
                                    )}
                                  </MenuContent>
                                </Menu>
                              ) : undefined
                            }
                          />

                          <IconToggle
                            label="Lock aspect ratio"
                            title="Lock aspect ratio"
                            pressed={Boolean(primary.lockAspectRatio)}
                            onPressedChange={(lockAspectRatio) =>
                              updateNodes(selectedIds, { lockAspectRatio })
                            }
                          >
                            <FigmaAspectRatioLockIcon />
                          </IconToggle>
                        </InspectorRow>
                      </div>

                      {hasFlexLayout && primary.layout && (
                        <>
                          <div>
                            <InspectorRow>
                              <FieldLabel>Alignment</FieldLabel>
                              <FieldLabel>Gap</FieldLabel>
                              <div aria-hidden="true" />
                            </InspectorRow>
                            <InspectorRow align="start">
                              <AutoLayoutAlignmentGrid
                                layout={primary.layout}
                                onSelect={(primaryAlign, counterAlign) =>
                                  updateLayout({ primaryAlign, counterAlign })
                                }
                                onToggleSpaceBetween={(counterAlign) =>
                                  updateLayout({
                                    primaryAlign: isSpaceBetween ? "start" : "space-between",
                                    counterAlign,
                                  })
                                }
                              />
                              <NumberField
                                compactAddon
                                label="Item gap"
                                prefix={<FigmaGapVerticalIcon />}
                                value={primary.layout.gap}
                                displayText={isSpaceBetween ? "Auto" : undefined}
                                min={0}
                                max={240}
                                onChange={(gap) => {
                                  beginLiveEdit()
                                  updateLayout(
                                    {
                                      gap: Math.max(0, gap),
                                      ...(isSpaceBetween ? { primaryAlign: "start" } : {}),
                                    },
                                    false
                                  )
                                }}
                                onCommit={endLiveEdit}
                                trailing={
                                  <Menu
                                    onAction={(val) => {
                                      if (val === "auto") updateLayout({ primaryAlign: "space-between" })
                                      else if (val === "fixed") updateLayout({ primaryAlign: "start" })
                                    }}
                                  >
                                    <MenuTrigger
                                      aria-label="Gap spacing mode"
                                      className="flex !h-full shrink-0 items-center border-0 bg-transparent px-0.5 text-[var(--color-icon-secondary)] hover:text-[var(--color-icon)]"
                                    >
                                      <FigmaChevronDownIcon className="h-3.5 w-3.5" />
                                    </MenuTrigger>
                                    <MenuContent align="end">
                                      <MenuItem value="fixed">
                                        <span className="inline-flex w-3.5">
                                          {!isSpaceBetween && <CheckIcon aria-hidden="true" className="h-3 w-3" />}
                                        </span>
                                        Fixed ({primary.layout.gap})
                                      </MenuItem>
                                      <MenuItem value="auto">
                                        <span className="inline-flex w-3.5">
                                          {isSpaceBetween && <CheckIcon aria-hidden="true" className="h-3 w-3" />}
                                        </span>
                                        Auto (Space between)
                                      </MenuItem>
                                    </MenuContent>
                                  </Menu>
                                }
                              />
                              <Menu
                                onAction={(val) => {
                                  if (val === "packed") updateLayout({ primaryAlign: "start" })
                                  else if (val === "space-between")
                                    updateLayout({ primaryAlign: "space-between" })
                                  else if (val === "wrap")
                                    updateLayout({ wrap: !primary.layout?.wrap })
                                }}
                              >
                                <IconMenuTrigger label="Auto layout settings">
                                  <FigmaSlidersIcon />
                                </IconMenuTrigger>
                                <MenuContent align="end">
                                  <MenuItem value="packed">
                                    <span className="inline-flex w-3.5">
                                      {!isSpaceBetween && <CheckIcon aria-hidden="true" className="h-3 w-3" />}
                                    </span>
                                    Packed spacing
                                  </MenuItem>
                                  <MenuItem value="space-between">
                                    <span className="inline-flex w-3.5">
                                      {isSpaceBetween && <CheckIcon aria-hidden="true" className="h-3 w-3" />}
                                    </span>
                                    Space between (Auto)
                                  </MenuItem>
                                  <MenuSeparator />
                                  <MenuItem value="wrap">
                                    <span className="inline-flex w-3.5">
                                      {primary.layout.wrap && <CheckIcon aria-hidden="true" className="h-3 w-3" />}
                                    </span>
                                    Wrap items
                                  </MenuItem>
                                </MenuContent>
                              </Menu>
                            </InspectorRow>
                          </div>

                          <div>
                            <FieldLabel>Padding</FieldLabel>
                            <InspectorRow align="start">
                              {indepPadding ? (
                                <>
                                  <NumberField
                                    label="Padding left"
                                    prefix="L"
                                    value={primary.layout.paddingLeft}
                                    min={0}
                                    max={240}
                                    onChange={(v) => {
                                      beginLiveEdit()
                                      updateLayout({ paddingLeft: Math.max(0, v) }, false)
                                    }}
                                    onCommit={endLiveEdit}
                                  />
                                  <NumberField
                                    label="Padding top"
                                    prefix="T"
                                    value={primary.layout.paddingTop}
                                    min={0}
                                    max={240}
                                    onChange={(v) => {
                                      beginLiveEdit()
                                      updateLayout({ paddingTop: Math.max(0, v) }, false)
                                    }}
                                    onCommit={endLiveEdit}
                                  />
                                  <IconToggle
                                    label="Individual padding"
                                    title="Individual padding"
                                    pressed={indepPadding}
                                    onPressedChange={setIndepPadding}
                                  >
                                    <FigmaIndividualPaddingIcon />
                                  </IconToggle>
                                  <NumberField
                                    label="Padding right"
                                    prefix="R"
                                    value={primary.layout.paddingRight}
                                    min={0}
                                    max={240}
                                    onChange={(v) => {
                                      beginLiveEdit()
                                      updateLayout({ paddingRight: Math.max(0, v) }, false)
                                    }}
                                    onCommit={endLiveEdit}
                                  />
                                  <NumberField
                                    label="Padding bottom"
                                    prefix="B"
                                    value={primary.layout.paddingBottom}
                                    min={0}
                                    max={240}
                                    onChange={(v) => {
                                      beginLiveEdit()
                                      updateLayout({ paddingBottom: Math.max(0, v) }, false)
                                    }}
                                    onCommit={endLiveEdit}
                                  />
                                  <div aria-hidden="true" />
                                </>
                              ) : (
                                <>
                                  <NumberField
                                    label="Horizontal padding"
                                    prefix={<FigmaPaddingHorizontalIcon />}
                                    value={primary.layout.paddingLeft}
                                    min={0}
                                    max={240}
                                    onChange={(pad) => {
                                      beginLiveEdit()
                                      const v = Math.max(0, pad)
                                      updateLayout({ paddingLeft: v, paddingRight: v }, false)
                                    }}
                                    onCommit={endLiveEdit}
                                  />
                                  <NumberField
                                    label="Vertical padding"
                                    prefix={<FigmaPaddingVerticalIcon />}
                                    value={primary.layout.paddingTop}
                                    min={0}
                                    max={240}
                                    onChange={(pad) => {
                                      beginLiveEdit()
                                      const v = Math.max(0, pad)
                                      updateLayout({ paddingTop: v, paddingBottom: v }, false)
                                    }}
                                    onCommit={endLiveEdit}
                                  />
                                  <IconToggle
                                    label="Individual padding"
                                    title="Individual padding"
                                    pressed={indepPadding}
                                    onPressedChange={setIndepPadding}
                                  >
                                    <FigmaIndividualPaddingIcon />
                                  </IconToggle>
                                </>
                              )}
                            </InspectorRow>
                          </div>
                        </>
                      )}

                      {isFrameLike && (
                        <CheckboxField
                          label="Clip content"
                          checked={Boolean(primary.clipContent)}
                          onCheckedChange={(clipContent) =>
                            updateNodes(selectedIds, { clipContent })
                          }
                        />
                      )}

                      {primary.type === "polygon" && (
                        <NumberField
                          label="Polygon sides"
                          prefix="Sides"
                          value={primary.polygonSides ?? 3}
                          min={3}
                          max={24}
                          onChange={(polygonSides) =>
                            updateNodes(selectedIds, {
                              polygonSides: Math.max(3, Math.round(polygonSides)),
                            })
                          }
                        />
                      )}

                      {primary.type === "star" && (
                        <NumberField
                          label="Star points"
                          prefix="Pts"
                          value={primary.starPoints ?? 5}
                          min={3}
                          max={24}
                          onChange={(starPoints) =>
                            updateNodes(selectedIds, {
                              starPoints: Math.max(3, Math.round(starPoints)),
                            })
                          }
                        />
                      )}
                    </InspectorSection>

                    {/* Official Figma UI3 Appearance Section */}
                    <InspectorSection>
                      <InspectorSectionHeader
                        title="Appearance"
                        action={
                          <>
                            <IconButton
                              label={primary.visible ? "Hide selected layer" : "Show selected layer"}
                              title={primary.visible ? "Hide" : "Show"}
                              onClick={() => updateNodes(selectedIds, { visible: !primary.visible })}
                            >
                              {primary.visible ? <FigmaEyeIcon /> : <FigmaEyeOffIcon />}
                            </IconButton>

                            <Menu
                              onAction={(val) =>
                                updateNodes(selectedIds, { blendMode: val as BlendMode })
                              }
                            >
                              <IconMenuTrigger
                                label="Apply blend mode"
                                active={primary.blendMode !== "normal"}
                              >
                                <FigmaBlendModeIcon />
                              </IconMenuTrigger>
                              <MenuContent align="end">
                                {BLEND_MODES.map((m) => (
                                  <MenuItem key={m.value} value={m.value}>
                                    <span className="inline-flex w-3.5">
                                      {primary.blendMode === m.value && (
                                        <CheckIcon aria-hidden="true" className="h-3 w-3" />
                                      )}
                                    </span>
                                    {m.label}
                                  </MenuItem>
                                ))}
                              </MenuContent>
                            </Menu>
                          </>
                        }
                      />

                      <div>
                        <InspectorRow>
                          <FieldLabel>Opacity</FieldLabel>
                          {supportsCornerRadius ? (
                            <FieldLabel>Corner radius</FieldLabel>
                          ) : (
                            <div aria-hidden="true" />
                          )}
                          <div aria-hidden="true" />
                        </InspectorRow>
                        <InspectorRow align="start">
                          <NumberField
                            label="Layer opacity"
                            prefix={<FigmaOpacityIcon />}
                            suffix="%"
                            value={Math.round(primary.opacity * 100)}
                            mixed={isMixed((n) => Math.round(n.opacity * 100))}
                            min={0}
                            max={100}
                            onChange={(pct) => {
                              beginLiveEdit()
                              const clamped = Math.max(0, Math.min(100, pct))
                              updateNodes(selectedIds, { opacity: clamped / 100 }, false)
                            }}
                            onCommit={endLiveEdit}
                          />
                          {supportsCornerRadius ? (
                            <>
                              <NumberField
                                label="Corner radius"
                                prefix={<FigmaCornerRadiusIcon />}
                                value={primary.cornerRadius}
                                mixed={isMixed((n) => n.cornerRadius)}
                                min={0}
                                max={999}
                                onChange={(cornerRadius) => {
                                  beginLiveEdit()
                                  const r = Math.max(0, cornerRadius)
                                  updateNodes(
                                    selectedIds,
                                    { cornerRadius: r, cornerRadii: [r, r, r, r] },
                                    false
                                  )
                                }}
                                onCommit={endLiveEdit}
                              />
                              <IconToggle
                                label="Individual corners"
                                title="Individual corners"
                                pressed={Boolean(primary.independentCorners)}
                                onPressedChange={(independentCorners) =>
                                  updateNodes(selectedIds, (node) => ({
                                    independentCorners,
                                    cornerRadii: node.cornerRadii ?? [
                                      node.cornerRadius,
                                      node.cornerRadius,
                                      node.cornerRadius,
                                      node.cornerRadius,
                                    ],
                                  }))
                                }
                              >
                                <FigmaCornerRadiusIcon />
                              </IconToggle>
                            </>
                          ) : (
                            <>
                              <div aria-hidden="true" />
                              <div aria-hidden="true" />
                            </>
                          )}
                        </InspectorRow>

                        {supportsCornerRadius && primary.independentCorners && (
                          <InspectorRow className="mt-2">
                            {(["TL", "TR", "BL", "BR"] as const).map((corner, idx) => {
                              const rIdx =
                                corner === "TL" ? 0 : corner === "TR" ? 1 : corner === "BR" ? 2 : 3
                              return (
                                <React.Fragment key={corner}>
                                  <NumberField
                                    label={`${corner} radius`}
                                    prefix={<CornerArcIcon corner={corner} />}
                                    value={primary.cornerRadii?.[rIdx] ?? primary.cornerRadius}
                                    min={0}
                                    max={999}
                                    onChange={(val) => {
                                      beginLiveEdit()
                                      updateNodes(
                                        selectedIds,
                                        (node) => {
                                          const next: [number, number, number, number] = [
                                            ...(node.cornerRadii ?? [
                                              node.cornerRadius,
                                              node.cornerRadius,
                                              node.cornerRadius,
                                              node.cornerRadius,
                                            ]),
                                          ]
                                          next[rIdx] = Math.max(0, val)
                                          return { cornerRadii: next }
                                        },
                                        false
                                      )
                                    }}
                                    onCommit={endLiveEdit}
                                  />
                                  {idx % 2 === 1 && <div aria-hidden="true" />}
                                </React.Fragment>
                              )
                            })}
                          </InspectorRow>
                        )}
                      </div>
                    </InspectorSection>

                    {/* Typography Section (Official Figma order: right above Fill for Text Layers) */}
                    {primary.type === "text" && (
                      <InspectorSection>
                        <InspectorSectionHeader title="Typography" />
                        <SelectField
                          label="Font family"
                          value={primary.fontFamily ?? "Inter"}
                          options={FONT_FAMILIES}
                          onValueChange={(fontFamily) => updateNodes(selectedIds, { fontFamily })}
                        />

                        <div className="grid grid-cols-2 gap-2">
                          <SelectField
                            label="Font weight"
                            value={String(primary.fontWeight ?? 400)}
                            options={FONT_WEIGHTS}
                            onValueChange={(val) =>
                              updateNodes(selectedIds, { fontWeight: Number(val) })
                            }
                          />
                          <NumberField
                            label="Font size"
                            prefix="Aa"
                            value={primary.fontSize ?? 16}
                            mixed={isMixed((n) => n.fontSize)}
                            min={8}
                            max={160}
                            onChange={(fontSize) => {
                              beginLiveEdit()
                              updateNodes(selectedIds, { fontSize }, false)
                            }}
                            onCommit={endLiveEdit}
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <NumberField
                            label="Line height"
                            prefix="↕"
                            value={primary.lineHeight ?? 1.4}
                            mixed={isMixed((n) => n.lineHeight)}
                            min={0.8}
                            max={3}
                            step={0.05}
                            onChange={(lineHeight) => {
                              beginLiveEdit()
                              updateNodes(selectedIds, { lineHeight }, false)
                            }}
                            onCommit={endLiveEdit}
                          />
                          <NumberField
                            label="Letter spacing"
                            prefix="↔"
                            value={primary.letterSpacing ?? 0}
                            mixed={isMixed((n) => n.letterSpacing)}
                            min={-6}
                            max={20}
                            step={0.2}
                            onChange={(letterSpacing) => {
                              beginLiveEdit()
                              updateNodes(selectedIds, { letterSpacing }, false)
                            }}
                            onCommit={endLiveEdit}
                          />
                        </div>

                        <div className="grid grid-cols-[1fr_24px_24px] items-center gap-2">
                          <SegmentedField
                            label="Text alignment"
                            value={primary.textAlign ?? "left"}
                            options={[
                              {
                                value: "left",
                                ariaLabel: "Align text left",
                                label: <AlignLeftIcon aria-hidden="true" className="h-3.5 w-3.5" />,
                              },
                              {
                                value: "center",
                                ariaLabel: "Align text center",
                                label: <AlignCenterIcon aria-hidden="true" className="h-3.5 w-3.5" />,
                              },
                              {
                                value: "right",
                                ariaLabel: "Align text right",
                                label: <AlignRightIcon aria-hidden="true" className="h-3.5 w-3.5" />,
                              },
                            ]}
                            onValueChange={(val) =>
                              updateNodes(selectedIds, { textAlign: val as TextAlign })
                            }
                          />
                          <IconToggle
                            variant="filled"
                            label="Underline text"
                            pressed={primary.textDecoration === "underline"}
                            onPressedChange={(on) =>
                              updateNodes(selectedIds, {
                                textDecoration: on ? "underline" : "none",
                              })
                            }
                          >
                            <UnderlineIcon className="h-3.5 w-3.5" />
                          </IconToggle>
                          <IconToggle
                            variant="filled"
                            label="Strikethrough text"
                            pressed={primary.textDecoration === "line-through"}
                            onPressedChange={(on) =>
                              updateNodes(selectedIds, {
                                textDecoration: on ? "line-through" : "none",
                              })
                            }
                          >
                            <StrikethroughIcon className="h-3.5 w-3.5" />
                          </IconToggle>
                        </div>

                        <SegmentedField
                          label="Text case"
                          value={primary.textTransform ?? "none"}
                          options={[
                            { value: "none", label: "Aa" },
                            { value: "uppercase", label: "AG" },
                            { value: "lowercase", label: "ag" },
                            { value: "capitalize", label: "Title" },
                          ]}
                          onValueChange={(val) =>
                            updateNodes(selectedIds, { textTransform: val as TextTransform })
                          }
                        />
                      </InspectorSection>
                    )}

                    {/* Official Figma UI3 Fill Section */}
                    <InspectorSection>
                      <InspectorSectionHeader
                        title="Fill"
                        action={
                          <>
                            <Menu
                              onAction={(varId) => {
                                const variable = colorVariables.find((v) => v.id === varId)
                                if (!variable) return
                                const color = String(
                                  variable.values[doc.variables.activeModeId] ?? "#ffffff"
                                )
                                updateNodes(selectedIds, (node) => ({
                                  fills:
                                    node.fills.length > 0
                                      ? node.fills.map((f, i) =>
                                          i === 0
                                            ? { ...f, type: "solid", color, variableId: variable.id, visible: true }
                                            : f
                                        )
                                      : [
                                          {
                                            id: createNodeId("fill"),
                                            type: "solid",
                                            visible: true,
                                            opacity: 1,
                                            color,
                                            variableId: variable.id,
                                          },
                                        ],
                                }))
                                toast(`Applied ${variable.name}`)
                              }}
                            >
                              <IconMenuTrigger label="Fill, Apply styles and variables">
                                <FigmaStylesGridIcon />
                              </IconMenuTrigger>
                              <MenuContent align="end">
                                {colorVariables.map((v) => {
                                  const val = String(v.values[doc.variables.activeModeId] ?? "#fff")
                                  return (
                                    <MenuItem key={v.id} value={v.id}>
                                      <span
                                        aria-hidden="true"
                                        className="h-3 w-3 rounded-[3px] border border-white/25"
                                        style={{ background: val }}
                                      />
                                      <span>{v.name}</span>
                                    </MenuItem>
                                  )
                                })}
                              </MenuContent>
                            </Menu>

                            <IconButton
                              label="Add fill"
                              title="Add fill"
                              onClick={() =>
                                updateNodes(selectedIds, (node) => ({
                                  fills: [
                                    ...node.fills,
                                    {
                                      id: createNodeId("fill"),
                                      type: "solid",
                                      visible: true,
                                      opacity: 1,
                                      color: "#0d99ff",
                                    },
                                  ],
                                }))
                              }
                            >
                              <FigmaPlusIcon />
                            </IconButton>
                          </>
                        }
                      />

                      {primary.fills.length > 0 && (
                        <div className="flex flex-col gap-1.5">
                          {primary.fills.map((fill, index) => (
                            <div
                              key={fill.id}
                              className={`flex items-center gap-1 ${
                                fill.visible ? "" : "opacity-45"
                              }`}
                            >
                              <FillField
                                label={`Fill ${index + 1}`}
                                fill={fill}
                                variables={doc.variables}
                                onChange={(patch) => {
                                  beginLiveEdit()
                                  updateNodes(
                                    selectedIds,
                                    (node) => ({
                                      fills: node.fills.map((f, i) =>
                                        i === index ? { ...f, ...patch } : f
                                      ),
                                    }),
                                    false
                                  )
                                }}
                                onCommit={endLiveEdit}
                              />
                              <IconButton
                                label={fill.visible ? `Hide fill ${index + 1}` : `Show fill ${index + 1}`}
                                onClick={() =>
                                  updateNodes(selectedIds, (node) => ({
                                    fills: node.fills.map((f, i) =>
                                      i === index ? { ...f, visible: !f.visible } : f
                                    ),
                                  }))
                                }
                              >
                                {fill.visible ? <FigmaEyeIcon /> : <FigmaEyeOffIcon />}
                              </IconButton>
                              <IconButton
                                label={`Remove fill ${index + 1}`}
                                onClick={() =>
                                  updateNodes(selectedIds, (node) => ({
                                    fills: node.fills.filter((_, i) => i !== index),
                                  }))
                                }
                              >
                                <FigmaMinusIcon />
                              </IconButton>
                            </div>
                          ))}
                        </div>
                      )}
                    </InspectorSection>

                    {/* Official Figma UI3 Stroke Section (Compact 2-row layout with Stroke settings menu) */}
                    <InspectorSection>
                      <InspectorSectionHeader
                        title="Stroke"
                        action={
                          <>
                            <Menu
                              onAction={(varId) => {
                                const variable = colorVariables.find((v) => v.id === varId)
                                if (!variable) return
                                const color = String(
                                  variable.values[doc.variables.activeModeId] ?? "#ffffff"
                                )
                                updateNodes(selectedIds, (node) => ({
                                  strokes:
                                    node.strokes.length > 0
                                      ? node.strokes.map((s, i) =>
                                          i === 0 ? { ...s, color, variableId: variable.id, visible: true } : s
                                        )
                                      : [
                                          {
                                            id: createNodeId("stroke"),
                                            visible: true,
                                            color,
                                            variableId: variable.id,
                                            width: 1,
                                            opacity: 1,
                                            style: "solid",
                                            align: "inside",
                                          },
                                        ],
                                }))
                                toast(`Applied stroke ${variable.name}`)
                              }}
                            >
                              <IconMenuTrigger label="Stroke, Apply styles and variables">
                                <FigmaStylesGridIcon />
                              </IconMenuTrigger>
                              <MenuContent align="end">
                                {colorVariables.map((v) => {
                                  const val = String(v.values[doc.variables.activeModeId] ?? "#fff")
                                  return (
                                    <MenuItem key={v.id} value={v.id}>
                                      <span
                                        aria-hidden="true"
                                        className="h-3 w-3 rounded-[3px] border border-white/25"
                                        style={{ background: val }}
                                      />
                                      <span>{v.name}</span>
                                    </MenuItem>
                                  )
                                })}
                              </MenuContent>
                            </Menu>

                            <IconButton
                              label="Add stroke"
                              title="Add stroke"
                              onClick={() =>
                                updateNodes(selectedIds, (node) => ({
                                  strokes: [
                                    ...node.strokes,
                                    {
                                      id: createNodeId("stroke"),
                                      visible: true,
                                      color: "#ffffff",
                                      width: 1,
                                      opacity: 1,
                                      style: "solid",
                                      align: "inside",
                                    },
                                  ],
                                }))
                              }
                            >
                              <FigmaPlusIcon />
                            </IconButton>
                          </>
                        }
                      />

                      {primary.strokes.length > 0 && (
                        <div className="flex flex-col gap-2">
                          {primary.strokes.map((stroke, index) => (
                            <div
                              key={stroke.id}
                              className={`flex flex-col gap-2 ${stroke.visible ? "" : "opacity-45"}`}
                            >
                              <div className="flex items-center gap-1">
                                <ColorField
                                  label={`Stroke ${index + 1}`}
                                  value={stroke.color}
                                  opacity={stroke.opacity}
                                  onOpacityChange={(opacity) => {
                                    beginLiveEdit()
                                    updateNodes(
                                      selectedIds,
                                      (node) => ({
                                        strokes: node.strokes.map((s, i) =>
                                          i === index ? { ...s, opacity } : s
                                        ),
                                      }),
                                      false
                                    )
                                  }}
                                  onValueChange={(color) => {
                                    beginLiveEdit()
                                    updateNodes(
                                      selectedIds,
                                      (node) => ({
                                        strokes: node.strokes.map((s, i) =>
                                          i === index ? { ...s, color, variableId: null } : s
                                        ),
                                      }),
                                      false
                                    )
                                  }}
                                  onValueCommit={endLiveEdit}
                                />
                                <IconButton
                                  label={stroke.visible ? `Hide stroke ${index + 1}` : `Show stroke ${index + 1}`}
                                  onClick={() =>
                                    updateNodes(selectedIds, (node) => ({
                                      strokes: node.strokes.map((s, i) =>
                                        i === index ? { ...s, visible: !s.visible } : s
                                      ),
                                    }))
                                  }
                                >
                                  {stroke.visible ? <FigmaEyeIcon /> : <FigmaEyeOffIcon />}
                                </IconButton>
                                <IconButton
                                  label={`Remove stroke ${index + 1}`}
                                  onClick={() =>
                                    updateNodes(selectedIds, (node) => ({
                                      strokes: node.strokes.filter((_, i) => i !== index),
                                    }))
                                  }
                                >
                                  <FigmaMinusIcon />
                                </IconButton>
                              </div>

                              <InspectorRow align="start">
                                <div>
                                  <FieldLabel>Position</FieldLabel>
                                  <SelectField
                                    label={`Stroke ${index + 1} position`}
                                    value={stroke.align}
                                    options={STROKE_POSITIONS}
                                    showIndicator={false}
                                    onValueChange={(val) =>
                                      updateNodes(selectedIds, (node) => ({
                                        strokes: node.strokes.map((s, i) =>
                                          i === index
                                            ? { ...s, align: val as StrokeLayer["align"] }
                                            : s
                                        ),
                                      }))
                                    }
                                  />
                                </div>
                                <div>
                                  <FieldLabel>Weight</FieldLabel>
                                  <NumberField
                                    label={`Stroke ${index + 1} weight`}
                                    prefix="W"
                                    value={stroke.width}
                                    min={0}
                                    max={48}
                                    onChange={(width) => {
                                      beginLiveEdit()
                                      updateNodes(
                                        selectedIds,
                                        (node) => ({
                                          strokes: node.strokes.map((s, i) =>
                                            i === index ? { ...s, width: Math.max(0, width) } : s
                                          ),
                                        }),
                                        false
                                      )
                                    }}
                                    onCommit={endLiveEdit}
                                  />
                                </div>
                                <div className="pt-[20px]">
                                  <Menu
                                    onAction={(val) =>
                                      updateNodes(selectedIds, (node) => ({
                                        strokes: node.strokes.map((s, i) =>
                                          i === index
                                            ? { ...s, style: val as "solid" | "dashed" }
                                            : s
                                        ),
                                      }))
                                    }
                                  >
                                    <IconMenuTrigger
                                      label={`Stroke ${index + 1} style settings`}
                                      active={stroke.style === "dashed"}
                                    >
                                      <FigmaSlidersIcon />
                                    </IconMenuTrigger>
                                    <MenuContent align="end">
                                      <MenuItem value="solid">
                                        <span className="inline-flex w-3.5">
                                          {stroke.style === "solid" && (
                                            <CheckIcon aria-hidden="true" className="h-3 w-3" />
                                          )}
                                        </span>
                                        Solid stroke
                                      </MenuItem>
                                      <MenuItem value="dashed">
                                        <span className="inline-flex w-3.5">
                                          {stroke.style === "dashed" && (
                                            <CheckIcon aria-hidden="true" className="h-3 w-3" />
                                          )}
                                        </span>
                                        Dashed stroke
                                      </MenuItem>
                                    </MenuContent>
                                  </Menu>
                                </div>
                              </InspectorRow>
                            </div>
                          ))}
                        </div>
                      )}
                    </InspectorSection>

                    {/* Official Figma UI3 Effects Section */}
                    <InspectorSection>
                      <InspectorSectionHeader
                        title="Effects"
                        action={
                          <>
                            <Menu
                              onAction={(preset) => {
                                const fx =
                                  preset === "glass"
                                    ? {
                                        id: createNodeId("fx"),
                                        type: "background-blur" as const,
                                        visible: true,
                                        x: 0,
                                        y: 0,
                                        blur: 16,
                                        spread: 0,
                                        color: "rgba(0, 0, 0, 0.2)",
                                      }
                                    : preset === "elevated"
                                      ? {
                                          id: createNodeId("fx"),
                                          type: "drop-shadow" as const,
                                          visible: true,
                                          x: 0,
                                          y: 20,
                                          blur: 48,
                                          spread: 0,
                                          color: "rgba(0, 0, 0, 0.45)",
                                        }
                                      : {
                                          id: createNodeId("fx"),
                                          type: "drop-shadow" as const,
                                          visible: true,
                                          x: 0,
                                          y: 4,
                                          blur: 12,
                                          spread: 0,
                                          color: "rgba(0, 0, 0, 0.25)",
                                        }
                                updateNodes(selectedIds, (node) => ({
                                  effects: [...node.effects, fx],
                                }))
                              }}
                            >
                              <IconMenuTrigger label="Effects, Apply styles">
                                <FigmaStylesGridIcon />
                              </IconMenuTrigger>
                              <MenuContent align="end">
                                <MenuItem value="soft">Soft Shadow (4 / 12)</MenuItem>
                                <MenuItem value="elevated">Elevated Card (20 / 48)</MenuItem>
                                <MenuItem value="glass">Glass Backdrop Blur</MenuItem>
                              </MenuContent>
                            </Menu>

                            <IconButton
                              label="Add effect"
                              title="Add effect"
                              onClick={() =>
                                updateNodes(selectedIds, (node) => ({
                                  effects: [
                                    ...node.effects,
                                    {
                                      id: createNodeId("fx"),
                                      type: "drop-shadow",
                                      visible: true,
                                      x: 0,
                                      y: 8,
                                      blur: 24,
                                      spread: 0,
                                      color: "rgba(0, 0, 0, 0.35)",
                                    },
                                  ],
                                }))
                              }
                            >
                              <FigmaPlusIcon />
                            </IconButton>
                          </>
                        }
                      />

                      {primary.effects.length > 0 && (
                        <div className="flex flex-col gap-1.5">
                          {primary.effects.map((fx, index) => (
                            <div
                              key={fx.id}
                              className={`flex items-center gap-1 ${fx.visible ? "" : "opacity-45"}`}
                            >
                              <EffectPopoverField
                                index={index}
                                effect={fx}
                                onChange={(patch) => {
                                  beginLiveEdit()
                                  updateNodes(
                                    selectedIds,
                                    (node) => ({
                                      effects: node.effects.map((e, i) =>
                                        i === index ? { ...e, ...patch } : e
                                      ),
                                    }),
                                    false
                                  )
                                }}
                                onCommit={endLiveEdit}
                              />
                              <IconButton
                                label={fx.visible ? `Hide effect ${index + 1}` : `Show effect ${index + 1}`}
                                onClick={() =>
                                  updateNodes(selectedIds, (node) => ({
                                    effects: node.effects.map((e, i) =>
                                      i === index ? { ...e, visible: !e.visible } : e
                                    ),
                                  }))
                                }
                              >
                                {fx.visible ? <FigmaEyeIcon /> : <FigmaEyeOffIcon />}
                              </IconButton>
                              <IconButton
                                label={`Remove effect ${index + 1}`}
                                onClick={() =>
                                  updateNodes(selectedIds, (node) => ({
                                    effects: node.effects.filter((_, i) => i !== index),
                                  }))
                                }
                              >
                                <FigmaMinusIcon />
                              </IconButton>
                            </div>
                          ))}
                        </div>
                      )}
                    </InspectorSection>

                    {/* Official Figma UI3 Live Selection Colors (Batch-edit subtree colors) */}
                    {selectionColors.length > 0 && (
                      <InspectorSection>
                        <InspectorSectionHeader title="Selection colors" />
                        <div className="flex flex-col gap-1">
                          {selectionColors.map((entry) => (
                            <div
                              key={entry.key}
                              className="flex h-[24px] items-center gap-1"
                            >
                              <ColorField
                                label={`Selection color ${entry.label}`}
                                value={entry.color}
                                onValueChange={(nextColor) =>
                                  handleBatchColorUpdate(entry, nextColor)
                                }
                                onValueCommit={endLiveEdit}
                              />
                              {entry.variableId && (
                                <IconButton
                                  label={`Detach ${entry.label}`}
                                  title="Detach variable"
                                  onClick={() => {
                                    updateNodes(entry.nodeIds, (node) => ({
                                      fills: node.fills.map((f) =>
                                        f.variableId === entry.variableId
                                          ? { ...f, variableId: null, color: entry.color }
                                          : f
                                      ),
                                      strokes: node.strokes.map((s) =>
                                        s.variableId === entry.variableId
                                          ? { ...s, variableId: null, color: entry.color }
                                          : s
                                      ),
                                    }))
                                    toast(`Detached ${entry.label}`)
                                  }}
                                >
                                  <FigmaUnlinkIcon />
                                </IconButton>
                              )}
                              <IconButton
                                label={`Select layers using ${entry.label}`}
                                title="Select item using this color"
                                onClick={() => {
                                  setSelectedIds(entry.nodeIds)
                                  toast(`Selected ${entry.nodeIds.length} layer(s) using ${entry.label}`)
                                }}
                              >
                                <FigmaTargetIcon />
                              </IconButton>
                            </div>
                          ))}
                        </div>
                      </InspectorSection>
                    )}

                    {/* Official Figma UI3 Layout guide Section (Frames / Components / Sections only) */}
                    {isFrameLike && (
                      <InspectorSection>
                        <InspectorSectionHeader
                          title="Layout guide"
                          action={
                            <>
                              <IconButton
                                label="Layout guide styles"
                                title="Toggle rulers"
                                active={doc.showRulers}
                                onClick={() => toggleFlag("showRulers")}
                              >
                                <FigmaStylesGridIcon />
                              </IconButton>
                              <IconButton
                                label="Add layout guide"
                                title="Toggle layout grid"
                                onClick={() => toggleFlag("showGrid", true)}
                              >
                                <FigmaPlusIcon />
                              </IconButton>
                            </>
                          }
                        />
                        {doc.showGrid && (
                          <div className="flex h-[24px] items-center gap-1">
                            <div className="flex h-[24px] min-w-0 flex-1 items-center gap-1.5 rounded-[5px] bg-[var(--color-bg-secondary)] px-1.5 text-[11px] text-[var(--color-text)]">
                              <Grid2x2Icon aria-hidden="true" className="h-3.5 w-3.5 text-[#f24822]" />
                              <span className="truncate">Grid (16px)</span>
                            </div>
                            <IconButton
                              label="Hide layout guide"
                              onClick={() => toggleFlag("showGrid", false)}
                            >
                              <FigmaEyeIcon />
                            </IconButton>
                            <IconButton
                              label="Remove layout guide"
                              onClick={() => toggleFlag("showGrid", false)}
                            >
                              <FigmaMinusIcon />
                            </IconButton>
                          </div>
                        )}
                      </InspectorSection>
                    )}

                    {/* Official Figma UI3 Export Section with Collapsible Live Preview */}
                    <InspectorSection>
                      <InspectorSectionHeader
                        title="Export"
                        action={
                          <IconButton
                            label="Add export settings"
                            title="Add export settings"
                            onClick={() => setExportExpanded((prev) => !prev)}
                          >
                            <FigmaPlusIcon />
                          </IconButton>
                        }
                      />
                      {exportExpanded && (
                        <>
                          <div className="grid grid-cols-2 gap-2">
                            <SelectField
                              label="Export scale"
                              value={exportScale}
                              options={EXPORT_SCALES}
                              showIndicator={false}
                              onValueChange={(v) => setExportScale(v as "1x" | "2x")}
                            />
                            <SelectField
                              label="Export format"
                              value={exportFormat}
                              options={EXPORT_FORMATS}
                              showIndicator={false}
                              onValueChange={(v) => setExportFormat(v as "png" | "svg")}
                            />
                          </div>
                          <ActionButton onClick={handleExportLayer} className="w-full">
                            Export {primary.name}
                          </ActionButton>
                          <Button
                            aria-label="Toggle export preview"
                            onClick={() => setExportPreviewOpen((v) => !v)}
                            className="!h-[22px] w-full justify-start gap-1 border-transparent bg-transparent px-0 text-[11px] font-medium text-[var(--color-text-secondary)] hover:bg-transparent hover:text-[var(--color-text)]"
                          >
                            <ChevronRightIcon
                              aria-hidden="true"
                              className={`h-3 w-3 transition-transform ${
                                exportPreviewOpen ? "rotate-90" : ""
                              }`}
                            />
                            <span>Preview</span>
                          </Button>
                          {exportPreviewOpen && svgPreviewDataUri && (
                            <div
                              className="flex h-[96px] w-full items-center justify-center overflow-hidden rounded-[5px] border border-[var(--color-border)] p-2"
                              style={{
                                backgroundImage:
                                  "repeating-conic-gradient(#383838 0% 25%, #2a2a2a 0% 50%)",
                                backgroundSize: "10px 10px",
                              }}
                            >
                              <img
                                src={svgPreviewDataUri}
                                alt={`Export preview of ${primary.name}`}
                                className="max-h-full max-w-full object-contain"
                              />
                            </div>
                          )}
                        </>
                      )}
                    </InspectorSection>
                  </>
                )}
              </ScrollAreaContent>
            </ScrollAreaViewport>
            <ScrollAreaScrollbar orientation="vertical">
              <ScrollAreaThumb />
            </ScrollAreaScrollbar>
          </ScrollArea>
        </TabsPanel>

        <TabsPanel value="inspect" className="flex min-h-0 flex-1 flex-col">
          {primary && (
            <InspectorSection className="border-b border-[var(--color-border)]">
              <InspectorSectionHeader
                title={primary.name}
                action={
                  <span className="rounded bg-[#14ae5c]/15 px-1.5 py-0.5 text-[10px] capitalize text-[#4ade80]">
                    {primary.type}
                  </span>
                }
              />

              <div>
                <div className="mb-1 flex items-center justify-between text-[11px] text-[var(--color-text-secondary)]">
                  <span>Box Model</span>
                  <span className="tabular-nums text-[#4ade80]">
                    {Math.round(primary.x)}, {Math.round(primary.y)}
                  </span>
                </div>
                <div className="flex flex-col items-center rounded-[5px] border border-dashed border-[#14ae5c]/45 bg-[#14ae5c]/10 p-1.5 font-mono text-[10.5px] text-[#86efac]">
                  <span>{primary.layout?.paddingTop ?? 0}</span>
                  <div className="flex w-full items-center justify-between gap-1.5 py-1">
                    <span>{primary.layout?.paddingLeft ?? 0}</span>
                    <div className="flex-1 rounded-[4px] border border-[#14ae5c]/70 bg-[#182920] py-1 text-center tabular-nums text-white">
                      {Math.round(primary.width)} × {Math.round(primary.height)}
                    </div>
                    <span>{primary.layout?.paddingRight ?? 0}</span>
                  </div>
                  <span>{primary.layout?.paddingBottom ?? 0}</span>
                </div>
              </div>

              {primary.type === "text" && primary.text && (
                <div className="flex items-center justify-between gap-1.5 rounded-[5px] bg-[var(--color-bg-secondary)] px-2 py-1">
                  <span className="min-w-0 flex-1 truncate text-[11px] text-[var(--color-text)]">
                    {primary.text}
                  </span>
                  <ActionButton
                    size="xs"
                    variant="subtle"
                    ariaLabel="Copy text content"
                    icon={<CopyIcon aria-hidden="true" className="h-3 w-3 shrink-0" />}
                    onClick={() => void handleCopy(primary.text ?? "", "text")}
                  >
                    Copy
                  </ActionButton>
                </div>
              )}

              {primary.fills.filter((f) => f.visible).length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {primary.fills
                    .filter((f) => f.visible)
                    .map((fill) => {
                      const bound = fill.variableId
                        ? doc.variables.variables.find((v) => v.id === fill.variableId)
                        : undefined
                      const resolved = bound
                        ? String(bound.values[doc.variables.activeModeId] ?? fill.color)
                        : fill.color
                      const labelText = bound ? bound.name : resolved.toUpperCase()
                      return (
                        <Button
                          key={fill.id}
                          aria-label={`Copy ${labelText}`}
                          onClick={() =>
                            void handleCopy(
                              bound ? `var(--${bound.name.replace(/[^a-z0-9]+/gi, "-")})` : resolved,
                              labelText
                            )
                          }
                          className="!h-[24px] gap-1.5 rounded-[5px] border-transparent bg-[var(--color-bg-secondary)] px-2 text-[11px] text-[var(--color-text)] hover:bg-[var(--color-bg-tertiary)]"
                        >
                          <span
                            aria-hidden="true"
                            className="h-2.5 w-2.5 rounded-[2px] border border-white/20"
                            style={{ background: resolved }}
                          />
                          <span className="max-w-[110px] truncate">{labelText}</span>
                        </Button>
                      )
                    })}
                </div>
              )}
            </InspectorSection>
          )}

          <div className="border-b border-[var(--color-border)] px-3.5 py-2">
            <SegmentedField
              label="Code export format"
              value={codeFormat}
              options={[
                { value: "jsx", label: "JSX" },
                { value: "css", label: "CSS" },
                { value: "tokens", label: "Tokens" },
                { value: "svg", label: "SVG" },
              ]}
              onValueChange={(val) => setCodeFormat(val as typeof codeFormat)}
            />
          </div>

          <ScrollArea>
            <ScrollAreaViewport role="region" aria-label="Inspect generated code">
              <ScrollAreaContent className="flex flex-col gap-2 !p-2.5">
                <div className="flex items-center justify-between gap-1">
                  <span className="text-[11px] font-semibold text-[var(--color-text)]">
                    {codeFormat === "jsx"
                      ? "React + Tailwind"
                      : codeFormat === "css"
                        ? "CSS"
                        : codeFormat === "tokens"
                          ? "CSS Variables"
                          : "SVG"}
                  </span>
                  <div className="flex items-center gap-1">
                    <ActionButton
                      ariaLabel="Copy generated code"
                      icon={<CopyIcon aria-hidden="true" className="h-3 w-3 shrink-0" />}
                      onClick={() => void handleCopy(codeSnippet, codeFormat.toUpperCase())}
                    >
                      Copy
                    </ActionButton>
                    <IconButton
                      variant="filled"
                      label="Download generated code"
                      onClick={handleExportCodeFile}
                    >
                      <DownloadIcon aria-hidden="true" className="h-3.5 w-3.5" />
                    </IconButton>
                  </div>
                </div>
                <pre className="overflow-x-auto rounded-[5px] border border-[var(--color-border)] bg-[var(--color-bg-elevated)] p-2.5 font-mono text-[10.5px] leading-relaxed text-[var(--color-text)]">
                  {codeSnippet}
                </pre>
              </ScrollAreaContent>
            </ScrollAreaViewport>
            <ScrollAreaScrollbar orientation="vertical">
              <ScrollAreaThumb />
            </ScrollAreaScrollbar>
          </ScrollArea>
        </TabsPanel>
      </Tabs>
    </aside>
  )
}
