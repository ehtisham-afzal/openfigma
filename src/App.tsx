"use client"

import * as React from "react"
import { createAgent } from "@ui-sdk/react/agent"
import { Button } from "@ui-sdk/react/button"
import { OverlayHost } from "@ui-sdk/react/overlays"
import { useShortcut } from "@ui-sdk/react/shortcuts"
import { toast } from "@ui-sdk/react/toast"
import { PanelLeftOpenIcon } from "lucide-react"
import { BottomToolbar } from "./components/BottomToolbar"
import { Canvas } from "./components/Canvas"
import { LeftSidebar } from "./components/LeftSidebar"
import { OpenFigmaLogo } from "./components/OpenFigmaLogo"
import { PresentationModal } from "./components/PresentationModal"
import {
  AgentInspectorDialog,
  QuickActionsDialog,
  ShortcutsDialog,
} from "./components/QuickActionsDialog"
import { RightInspector } from "./components/RightInspector"
import { DesignStoreProvider, useDesignStore } from "./store/useDesignStore"
import {
  buildReactTailwindSnippet,
  buildSvgMarkup,
  downloadTextFile,
  exportSvgAsPng,
} from "./utils/export"

function OpenFigmaWorkspace() {
  const {
    doc,
    activePage,
    selectedNodes,
    setEditingTextId,
    commitCheckpoint,
    setTool,
    setViewport,
    setSelectedIds,
    toggleFlag,
    toggleShowUI,
    setDevMode,
    setPresentMode,
    undo,
    redo,
    copySelection,
    pasteClipboard,
    duplicateSelection,
    deleteSelection,
    selectAll,
    frameSelection,
    ungroupSelection,
    toggleAutoLayout,
    createComponentFromSelection,
    nudgeSelection,
    flipSelection,
    reorderZOrder,
    zoomToFit,
    zoomToSelection,
    createQuickShape,
    newBlankDocument,
    resetDocument,
    exportDocumentJson,
    importDocumentJson,
  } = useDesignStore()

  const canvasSizeRef = React.useRef({ width: 1440, height: 900 })
  const fileOpenRef = React.useRef<HTMLInputElement>(null)
  const [commandOpen, setCommandOpen] = React.useState(false)
  const [shortcutsOpen, setShortcutsOpen] = React.useState(false)
  const [agentOpen, setAgentOpen] = React.useState(false)
  const [leftWidth, setLeftWidth] = React.useState(297)
  const [rightWidth, setRightWidth] = React.useState(252)
  const [agent] = React.useState(() => createAgent())

  React.useEffect(() => {
    ;(window as unknown as { __uiSdkAgent?: typeof agent }).__uiSdkAgent = agent
  }, [agent])

  // Prevent browser-level Ctrl/Cmd+wheel, pinch-gesture, and Ctrl +/-/0 page zoom so only the canvas zooms.
  React.useEffect(() => {
    const onGlobalWheel = (e: WheelEvent) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault()
      }
    }
    const onGesture = (e: Event) => {
      e.preventDefault()
    }
    const onGlobalKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && (e.key === "+" || e.key === "=" || e.key === "-" || e.key === "_" || e.key === "0")) {
        e.preventDefault()
      }
    }
    window.addEventListener("wheel", onGlobalWheel, { passive: false })
    window.addEventListener("gesturestart", onGesture, { passive: false })
    window.addEventListener("gesturechange", onGesture, { passive: false })
    window.addEventListener("keydown", onGlobalKeyDown, { capture: true })
    return () => {
      window.removeEventListener("wheel", onGlobalWheel)
      window.removeEventListener("gesturestart", onGesture)
      window.removeEventListener("gesturechange", onGesture)
      window.removeEventListener("keydown", onGlobalKeyDown, { capture: true })
    }
  }, [])

  const safeFilename = doc.title.toLowerCase().replace(/[^a-z0-9]+/g, "-") || "design"

  const runAction = React.useCallback(
    (action: string) => {
      const { width, height } = canvasSizeRef.current
      switch (action) {
        case "new-blank":
          newBlankDocument()
          toast("Created blank design")
          break
        case "open-json":
          fileOpenRef.current?.click()
          break
        case "save-json":
          downloadTextFile(
            `${safeFilename}.openfigma.json`,
            exportDocumentJson(),
            "application/json"
          )
          toast("Saved OpenFigma project (.json)")
          break
        case "export-svg": {
          const svg = buildSvgMarkup(
            activePage,
            doc.variables,
            doc.selectedIds.length > 0 ? doc.selectedIds : undefined
          )
          downloadTextFile(`${safeFilename}.svg`, svg, "image/svg+xml")
          toast("Exported Vector SVG")
          break
        }
        case "export-png": {
          const svg = buildSvgMarkup(
            activePage,
            doc.variables,
            doc.selectedIds.length > 0 ? doc.selectedIds : undefined
          )
          void exportSvgAsPng(svg, `${safeFilename}.png`)
          toast("Exported PNG 2×")
          break
        }
        case "export-jsx": {
          const target = selectedNodes[0] ?? activePage.nodes[activePage.order[0]]
          if (target) {
            downloadTextFile(
              `${safeFilename}.tsx`,
              buildReactTailwindSnippet(target, activePage, doc.variables),
              "text/plain"
            )
            toast("Exported React + Tailwind JSX")
          }
          break
        }
        case "reset-doc":
          resetDocument()
          toast("Reset to starter showcase")
          break
        case "undo":
          undo()
          break
        case "redo":
          redo()
          break
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
        case "select-all":
          selectAll()
          break
        case "delete":
          deleteSelection()
          break
        case "frame-selection":
          frameSelection()
          break
        case "auto-layout":
          toggleAutoLayout()
          toast("Toggled Auto Layout")
          break
        case "ungroup":
          ungroupSelection()
          break
        case "create-component":
          createComponentFromSelection()
          toast("Created Component")
          break
        case "toggle-dev-mode":
          setDevMode((v) => !v)
          break
        case "present":
          setPresentMode(true)
          break
        case "comment-tool":
          setTool("comment")
          break
        case "flip-h":
          flipSelection("horizontal")
          break
        case "flip-v":
          flipSelection("vertical")
          break
        case "zoom-in":
          setViewport((vp) => ({ ...vp, zoom: Math.min(8, Number((vp.zoom * 1.25).toFixed(2))) }))
          break
        case "zoom-out":
          setViewport((vp) => ({ ...vp, zoom: Math.max(0.1, Number((vp.zoom / 1.25).toFixed(2))) }))
          break
        case "zoom-100":
          setViewport((vp) => ({ ...vp, zoom: 1 }))
          break
        case "zoom-fit":
          zoomToFit(width, height)
          break
        case "zoom-selection":
          zoomToSelection(width, height)
          break
        case "toggle-grid":
          toggleFlag("showGrid")
          break
        case "toggle-rulers":
          toggleFlag("showRulers")
          break
        case "toggle-ui":
          toggleShowUI()
          break
        case "insert-frame":
          createQuickShape("frame")
          break
        case "insert-section":
          createQuickShape("section")
          break
        case "insert-rect":
          createQuickShape("rectangle")
          break
        case "insert-ellipse":
          createQuickShape("ellipse")
          break
        case "insert-star":
          createQuickShape("star")
          break
        case "insert-text":
          createQuickShape("text")
          break
      }
    },
    [
      activePage,
      copySelection,
      createComponentFromSelection,
      createQuickShape,
      deleteSelection,
      doc.selectedIds,
      doc.variables,
      duplicateSelection,
      exportDocumentJson,
      flipSelection,
      frameSelection,
      newBlankDocument,
      pasteClipboard,
      redo,
      resetDocument,
      safeFilename,
      selectAll,
      selectedNodes,
      setDevMode,
      setPresentMode,
      setTool,
      setViewport,
      toggleAutoLayout,
      toggleFlag,
      toggleShowUI,
      undo,
      ungroupSelection,
      zoomToFit,
      zoomToSelection,
    ]
  )

  useShortcut("mod+k", () => setCommandOpen(true), { allowInInput: true, description: "Quick actions" })
  useShortcut("shift+/", () => setShortcutsOpen((v) => !v), { description: "Keyboard shortcuts" })
  useShortcut("mod+\\", () => toggleShowUI(), { description: "Show or hide UI" })
  useShortcut("shift+d", () => setDevMode((v) => !v), { description: "Toggle Dev Mode" })
  useShortcut("shift+r", () => toggleFlag("showRulers"), { description: "Toggle rulers" })

  useShortcut("v", () => setTool("select"), { description: "Move tool" })
  useShortcut("h", () => setTool("hand"), { description: "Hand tool" })
  useShortcut("f", () => setTool("frame"), { description: "Frame tool" })
  useShortcut("r", () => setTool("rectangle"), { description: "Rectangle tool" })
  useShortcut("o", () => setTool("ellipse"), { description: "Ellipse tool" })
  useShortcut("l", () => setTool("line"), { description: "Line tool" })
  useShortcut("shift+s", () => setTool("star"), { description: "Star tool" })
  useShortcut("p", () => setTool("pen"), { description: "Pen tool" })
  useShortcut("shift+p", () => setTool("pencil"), { description: "Pencil tool" })
  useShortcut("t", () => setTool("text"), { description: "Text tool" })
  useShortcut("c", () => setTool("comment"), { description: "Comment tool" })
  useShortcut("i", () => setTool(doc.tool === "eyedropper" ? "select" : "eyedropper"), {
    description: "Eyedropper color picker",
  })

  useShortcut("mod+z", () => undo(), { description: "Undo" })
  useShortcut("mod+shift+z", () => redo(), { description: "Redo" })
  useShortcut("mod+s", () => runAction("save-json"), { description: "Save project JSON" })
  useShortcut("mod+c", () => runAction("copy"), { description: "Copy" })
  useShortcut("mod+v", () => pasteClipboard(), { description: "Paste" })
  useShortcut("mod+d", () => duplicateSelection(), { description: "Duplicate" })
  useShortcut("mod+a", () => selectAll(), { description: "Select all" })
  useShortcut("mod+g", () => frameSelection(), { description: "Frame selection" })
  useShortcut("mod+shift+g", () => ungroupSelection(), { description: "Ungroup" })
  useShortcut("shift+a", () => runAction("auto-layout"), { description: "Toggle Auto Layout" })
  useShortcut("mod+alt+k", () => runAction("create-component"), { description: "Create component" })
  useShortcut("shift+h", () => flipSelection("horizontal"), { description: "Flip horizontal" })
  useShortcut("shift+v", () => flipSelection("vertical"), { description: "Flip vertical" })
  useShortcut("backspace", () => deleteSelection(), { description: "Delete selection" })
  useShortcut("delete", () => deleteSelection(), { description: "Delete selection" })
  useShortcut("]", () => reorderZOrder("forward"), { description: "Bring forward" })
  useShortcut("[", () => reorderZOrder("backward"), { description: "Send backward" })

  useShortcut("arrowleft", () => nudgeSelection(-1, 0), { repeat: true, description: "Nudge left" })
  useShortcut("arrowright", () => nudgeSelection(1, 0), { repeat: true, description: "Nudge right" })
  useShortcut("arrowup", () => nudgeSelection(0, -1), { repeat: true, description: "Nudge up" })
  useShortcut("arrowdown", () => nudgeSelection(0, 1), { repeat: true, description: "Nudge down" })
  useShortcut("shift+arrowleft", () => nudgeSelection(-10, 0), { repeat: true, description: "Nudge left 10px" })
  useShortcut("shift+arrowright", () => nudgeSelection(10, 0), { repeat: true, description: "Nudge right 10px" })
  useShortcut("shift+arrowup", () => nudgeSelection(0, -10), { repeat: true, description: "Nudge up 10px" })
  useShortcut("shift+arrowdown", () => nudgeSelection(0, 10), { repeat: true, description: "Nudge down 10px" })

  useShortcut("shift+enter", () => {
    const first = doc.selectedIds[0] ? activePage.nodes[doc.selectedIds[0]] : null
    if (first?.parentId) setSelectedIds([first.parentId])
  }, { description: "Select parent layer" })

  useShortcut("enter", () => {
    if (doc.selectedIds.length !== 1 || doc.devMode) return
    const node = activePage.nodes[doc.selectedIds[0]]
    if (!node || node.locked) return
    if (node.type === "text") {
      commitCheckpoint()
      setEditingTextId(node.id)
      return
    }
    const childIds = activePage.order.filter((id) => activePage.nodes[id]?.parentId === node.id)
    if (childIds.length > 0) setSelectedIds(childIds)
  }, { description: "Drill into children or edit text" })

  useShortcut("shift+0", () => runAction("zoom-100"), { description: "Zoom to 100%" })
  useShortcut("mod+0", () => runAction("zoom-100"), { description: "Zoom to 100%" })
  useShortcut("mod+=", () => runAction("zoom-in"), { description: "Zoom in" })
  useShortcut("mod+-", () => runAction("zoom-out"), { description: "Zoom out" })
  useShortcut("shift+1", () => runAction("zoom-fit"), { description: "Zoom to fit" })
  useShortcut("shift+2", () => runAction("zoom-selection"), { description: "Zoom to selection" })

  const startResizeSide = (side: "left" | "right", startX: number) => {
    const startW = side === "left" ? leftWidth : rightWidth
    const onMove = (e: PointerEvent) => {
      const dx = e.clientX - startX
      const next = side === "left" ? startW + dx : startW - dx
      const clamped =
        side === "left"
          ? Math.max(256, Math.min(420, next))
          : Math.max(240, Math.min(380, next))
      if (side === "left") setLeftWidth(clamped)
      else setRightWidth(clamped)
    }
    const onUp = () => {
      window.removeEventListener("pointermove", onMove)
      window.removeEventListener("pointerup", onUp)
    }
    window.addEventListener("pointermove", onMove)
    window.addEventListener("pointerup", onUp)
  }

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-[var(--color-bg-canvas)] text-[var(--color-text)]">
      <OverlayHost />

      <input
        ref={fileOpenRef}
        type="file"
        accept=".json,.pen,application/json"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0]
          e.target.value = ""
          if (!file) return
          const reader = new FileReader()
          reader.onload = () => {
            const ok = importDocumentJson(String(reader.result ?? ""))
            if (ok) toast(`Opened "${file.name}"`)
            else toast("Invalid OpenFigma JSON file")
          }
          reader.readAsText(file)
        }}
      />

      <main className="fixed inset-0">
        <Canvas canvasSizeRef={canvasSizeRef} />
      </main>

      <BottomToolbar
        onOpenActions={() => setCommandOpen(true)}
        onOpenShortcuts={() => setShortcutsOpen(true)}
        onOpenAgent={() => setAgentOpen(true)}
        onRunAction={runAction}
        leftOffset={doc.showUI ? leftWidth : 0}
        rightOffset={doc.showUI ? rightWidth : 0}
      />

      {doc.showUI ? (
        <>
          <div
            style={{ width: leftWidth }}
            className="fixed bottom-0 left-0 top-0 z-20 flex border-r border-[var(--color-border)]"
          >
            <LeftSidebar
              onRunAction={runAction}
              onOpenCommand={() => setCommandOpen(true)}
              onOpenShortcuts={() => setShortcutsOpen(true)}
              onOpenAgent={() => setAgentOpen(true)}
            />
            <div
              aria-hidden="true"
              onPointerDown={(e) => startResizeSide("left", e.clientX)}
              className="absolute -right-1 inset-y-0 w-2 cursor-col-resize hover:bg-[var(--color-bg-brand)]/40"
            />
          </div>

          <div
            style={{ width: rightWidth }}
            className="fixed bottom-0 right-0 top-0 z-20 flex border-l border-[var(--color-border)]"
          >
            <div
              aria-hidden="true"
              onPointerDown={(e) => startResizeSide("right", e.clientX)}
              className="absolute -left-1 inset-y-0 w-2 cursor-col-resize hover:bg-[var(--color-bg-brand)]/40"
            />
            <RightInspector onRunAction={runAction} />
          </div>
        </>
      ) : (
        <div className="fixed left-3 top-3 z-20">
          <Button
            aria-label="Show UI panels"
            onClick={() => toggleShowUI(true)}
            className="figma-ui3-toolbar !h-9 gap-2 px-3 text-[11px] font-medium text-[var(--color-text)] hover:bg-[var(--color-bg-secondary)]"
          >
            <OpenFigmaLogo className="h-4 w-4" />
            <PanelLeftOpenIcon aria-hidden="true" className="h-3.5 w-3.5 text-[var(--color-icon-secondary)]" />
            <span>Show UI</span>
          </Button>
        </div>
      )}

      <QuickActionsDialog
        open={commandOpen}
        onOpenChange={setCommandOpen}
        onRunAction={runAction}
      />
      <ShortcutsDialog open={shortcutsOpen} onOpenChange={setShortcutsOpen} />
      <AgentInspectorDialog
        open={agentOpen}
        onOpenChange={setAgentOpen}
        getSnapshot={() =>
          agent.snapshot().filter((entry) => !entry.offPage && entry.component !== "more")
        }
      />
      <PresentationModal />
    </div>
  )
}

export function App() {
  return (
    <DesignStoreProvider>
      <OpenFigmaWorkspace />
    </DesignStoreProvider>
  )
}

export default App
