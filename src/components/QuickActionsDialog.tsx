"use client"

import * as React from "react"
import { Button } from "@ui-sdk/react/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandGroupLabel,
  CommandInput,
  CommandItem,
  CommandItemIcon,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@ui-sdk/react/command"
import {
  Dialog,
  DialogBackdrop,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@ui-sdk/react/dialog"
import { toast } from "@ui-sdk/react/toast"
import {
  CircleIcon,
  Code2Icon,
  ComponentIcon,
  CopyIcon,
  DownloadIcon,
  FilePlus2Icon,
  FlipHorizontal2Icon,
  FlipVertical2Icon,
  FolderOpenIcon,
  FrameIcon,
  Grid3x3Icon,
  LayersIcon,
  LayoutGridIcon,
  Maximize2Icon,
  MessageSquareIcon,
  PlayIcon,
  Redo2Icon,
  RefreshCwIcon,
  RotateCcwIcon,
  RulerIcon,
  SaveIcon,
  SearchIcon,
  SquareDashedIcon,
  SquareIcon,
  StarIcon,
  Trash2Icon,
  TypeIcon,
  Undo2Icon,
  XIcon,
} from "lucide-react"
import { ActionButton, TextField } from "./ui"

interface QuickActionsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onRunAction: (action: string) => void
}

const CMD_ITEM_CLS =
  "flex h-[32px] items-center gap-2 rounded-[6px] px-2.5 text-[11px] text-[var(--color-text)] data-highlighted:bg-[var(--color-bg-brand)] data-highlighted:text-white"
const CMD_LABEL_CLS =
  "px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-[var(--color-text-tertiary)]"

export function QuickActionsDialog({
  open,
  onOpenChange,
  onRunAction,
}: QuickActionsDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogBackdrop />
      <DialogContent
        finalFocus="none"
        className="w-[520px] max-w-[92vw] overflow-hidden !rounded-[12px] !border-[var(--color-border)] !bg-[var(--color-bg-elevated)] p-0"
      >
        <DialogTitle className="sr-only">Quick Actions</DialogTitle>
        <Command
          onAction={(value) => {
            onRunAction(value)
            onOpenChange(false)
          }}
          className="flex w-full flex-col"
        >
          <div className="flex h-[44px] items-center gap-2.5 border-b border-[var(--color-border)] px-3.5">
            <SearchIcon aria-hidden="true" className="h-4 w-4 shrink-0 text-[var(--color-icon-secondary)]" />
            <CommandInput
              aria-label="Search OpenFigma actions"
              placeholder="Search actions, insert shapes, Auto Layout, Dev Mode…"
              className="h-7 flex-1 border-0 bg-transparent px-0 text-[12px] text-[var(--color-text)] placeholder:text-[var(--color-text-tertiary)] outline-none"
            />
            <kbd className="rounded-[4px] border border-[var(--color-border)] bg-[var(--color-bg-secondary)] px-1.5 py-0.5 font-mono text-[10px] text-[var(--color-text-secondary)]">
              ESC
            </kbd>
          </div>
          <CommandEmpty className="px-4 py-8 text-center text-[11px] text-[var(--color-text-tertiary)] empty:hidden">
            No matching actions found.
          </CommandEmpty>
          <CommandList className="max-h-[340px] overflow-y-auto p-1.5">
            <CommandGroup>
              <CommandGroupLabel className={CMD_LABEL_CLS}>Insert</CommandGroupLabel>
              <CommandItem value="insert-frame" className={CMD_ITEM_CLS}>
                <CommandItemIcon><FrameIcon className="h-3.5 w-3.5" /></CommandItemIcon>
                <span className="flex-1">Insert Frame</span>
              </CommandItem>
              <CommandItem value="insert-section" className={CMD_ITEM_CLS}>
                <CommandItemIcon><SquareDashedIcon className="h-3.5 w-3.5" /></CommandItemIcon>
                <span className="flex-1">Insert Section</span>
              </CommandItem>
              <CommandItem value="insert-rect" className={CMD_ITEM_CLS}>
                <CommandItemIcon><SquareIcon className="h-3.5 w-3.5" /></CommandItemIcon>
                <span className="flex-1">Insert Rectangle</span>
              </CommandItem>
              <CommandItem value="insert-ellipse" className={CMD_ITEM_CLS}>
                <CommandItemIcon><CircleIcon className="h-3.5 w-3.5" /></CommandItemIcon>
                <span className="flex-1">Insert Ellipse</span>
              </CommandItem>
              <CommandItem value="insert-star" className={CMD_ITEM_CLS}>
                <CommandItemIcon><StarIcon className="h-3.5 w-3.5" /></CommandItemIcon>
                <span className="flex-1">Insert Star</span>
              </CommandItem>
              <CommandItem value="insert-text" className={CMD_ITEM_CLS}>
                <CommandItemIcon><TypeIcon className="h-3.5 w-3.5" /></CommandItemIcon>
                <span className="flex-1">Insert Text Layer</span>
              </CommandItem>
            </CommandGroup>
            <CommandSeparator className="my-1 h-px bg-[var(--color-border)]" />
            <CommandGroup>
              <CommandGroupLabel className={CMD_LABEL_CLS}>
                Layout, Modes &amp; Components
              </CommandGroupLabel>
              <CommandItem value="auto-layout" shortcut="shift+a" className={CMD_ITEM_CLS}>
                <CommandItemIcon><LayoutGridIcon className="h-3.5 w-3.5" /></CommandItemIcon>
                <span className="flex-1">Add / Toggle Auto Layout</span>
                <CommandShortcut />
              </CommandItem>
              <CommandItem value="frame-selection" shortcut="mod+g" className={CMD_ITEM_CLS}>
                <CommandItemIcon><FrameIcon className="h-3.5 w-3.5" /></CommandItemIcon>
                <span className="flex-1">Frame Selection</span>
                <CommandShortcut />
              </CommandItem>
              <CommandItem value="create-component" shortcut="mod+alt+k" className={CMD_ITEM_CLS}>
                <CommandItemIcon><ComponentIcon className="h-3.5 w-3.5" /></CommandItemIcon>
                <span className="flex-1">Create Component</span>
                <CommandShortcut />
              </CommandItem>
              <CommandItem value="ungroup" shortcut="mod+shift+g" className={CMD_ITEM_CLS}>
                <CommandItemIcon><LayersIcon className="h-3.5 w-3.5" /></CommandItemIcon>
                <span className="flex-1">Ungroup Frame</span>
                <CommandShortcut />
              </CommandItem>
              <CommandItem value="flip-h" shortcut="shift+h" className={CMD_ITEM_CLS}>
                <CommandItemIcon><FlipHorizontal2Icon className="h-3.5 w-3.5" /></CommandItemIcon>
                <span className="flex-1">Flip Horizontal</span>
                <CommandShortcut />
              </CommandItem>
              <CommandItem value="flip-v" shortcut="shift+v" className={CMD_ITEM_CLS}>
                <CommandItemIcon><FlipVertical2Icon className="h-3.5 w-3.5" /></CommandItemIcon>
                <span className="flex-1">Flip Vertical</span>
                <CommandShortcut />
              </CommandItem>
              <CommandItem value="toggle-dev-mode" shortcut="shift+d" className={CMD_ITEM_CLS}>
                <CommandItemIcon><Code2Icon className="h-3.5 w-3.5" /></CommandItemIcon>
                <span className="flex-1">Toggle Dev Mode</span>
                <CommandShortcut />
              </CommandItem>
              <CommandItem value="present" className={CMD_ITEM_CLS}>
                <CommandItemIcon><PlayIcon className="h-3.5 w-3.5" /></CommandItemIcon>
                <span className="flex-1">Present Prototype</span>
              </CommandItem>
              <CommandItem value="comment-tool" shortcut="c" className={CMD_ITEM_CLS}>
                <CommandItemIcon><MessageSquareIcon className="h-3.5 w-3.5" /></CommandItemIcon>
                <span className="flex-1">Add Comment</span>
                <CommandShortcut />
              </CommandItem>
            </CommandGroup>
            <CommandSeparator className="my-1 h-px bg-[var(--color-border)]" />
            <CommandGroup>
              <CommandGroupLabel className={CMD_LABEL_CLS}>
                Canvas, File &amp; Export
              </CommandGroupLabel>
              <CommandItem value="zoom-fit" shortcut="shift+1" className={CMD_ITEM_CLS}>
                <CommandItemIcon><Maximize2Icon className="h-3.5 w-3.5" /></CommandItemIcon>
                <span className="flex-1">Zoom to Fit</span>
                <CommandShortcut />
              </CommandItem>
              <CommandItem value="zoom-selection" shortcut="shift+2" className={CMD_ITEM_CLS}>
                <CommandItemIcon><Maximize2Icon className="h-3.5 w-3.5" /></CommandItemIcon>
                <span className="flex-1">Zoom to Selection</span>
                <CommandShortcut />
              </CommandItem>
              <CommandItem value="zoom-100" shortcut="shift+0" className={CMD_ITEM_CLS}>
                <CommandItemIcon><Maximize2Icon className="h-3.5 w-3.5" /></CommandItemIcon>
                <span className="flex-1">Zoom to 100%</span>
                <CommandShortcut />
              </CommandItem>
              <CommandItem value="toggle-grid" className={CMD_ITEM_CLS}>
                <CommandItemIcon><Grid3x3Icon className="h-3.5 w-3.5" /></CommandItemIcon>
                <span className="flex-1">Toggle Canvas Grid</span>
              </CommandItem>
              <CommandItem value="toggle-rulers" shortcut="shift+r" className={CMD_ITEM_CLS}>
                <CommandItemIcon><RulerIcon className="h-3.5 w-3.5" /></CommandItemIcon>
                <span className="flex-1">Toggle Rulers</span>
                <CommandShortcut />
              </CommandItem>
              <CommandItem value="toggle-ui" shortcut="mod+\" className={CMD_ITEM_CLS}>
                <CommandItemIcon><LayersIcon className="h-3.5 w-3.5" /></CommandItemIcon>
                <span className="flex-1">Show / Hide UI</span>
                <CommandShortcut />
              </CommandItem>
              <CommandItem value="duplicate" shortcut="mod+d" className={CMD_ITEM_CLS}>
                <CommandItemIcon><CopyIcon className="h-3.5 w-3.5" /></CommandItemIcon>
                <span className="flex-1">Duplicate Selection</span>
                <CommandShortcut />
              </CommandItem>
              <CommandItem value="undo" shortcut="mod+z" className={CMD_ITEM_CLS}>
                <CommandItemIcon><Undo2Icon className="h-3.5 w-3.5" /></CommandItemIcon>
                <span className="flex-1">Undo</span>
                <CommandShortcut />
              </CommandItem>
              <CommandItem value="redo" shortcut="mod+shift+z" className={CMD_ITEM_CLS}>
                <CommandItemIcon><Redo2Icon className="h-3.5 w-3.5" /></CommandItemIcon>
                <span className="flex-1">Redo</span>
                <CommandShortcut />
              </CommandItem>
              <CommandItem value="new-blank" className={CMD_ITEM_CLS}>
                <CommandItemIcon><FilePlus2Icon className="h-3.5 w-3.5" /></CommandItemIcon>
                <span className="flex-1">New Blank Design</span>
              </CommandItem>
              <CommandItem value="open-json" className={CMD_ITEM_CLS}>
                <CommandItemIcon><FolderOpenIcon className="h-3.5 w-3.5" /></CommandItemIcon>
                <span className="flex-1">Open Local File (.json)…</span>
              </CommandItem>
              <CommandItem value="save-json" shortcut="mod+s" className={CMD_ITEM_CLS}>
                <CommandItemIcon><SaveIcon className="h-3.5 w-3.5" /></CommandItemIcon>
                <span className="flex-1">Save Project (.json)</span>
                <CommandShortcut />
              </CommandItem>
              <CommandItem value="export-svg" className={CMD_ITEM_CLS}>
                <CommandItemIcon><DownloadIcon className="h-3.5 w-3.5" /></CommandItemIcon>
                <span className="flex-1">Export as SVG</span>
              </CommandItem>
              <CommandItem value="export-png" className={CMD_ITEM_CLS}>
                <CommandItemIcon><DownloadIcon className="h-3.5 w-3.5" /></CommandItemIcon>
                <span className="flex-1">Export as PNG 2×</span>
              </CommandItem>
              <CommandItem value="export-jsx" className={CMD_ITEM_CLS}>
                <CommandItemIcon><Code2Icon className="h-3.5 w-3.5" /></CommandItemIcon>
                <span className="flex-1">Export React + Tailwind JSX</span>
              </CommandItem>
              <CommandItem value="delete" className={CMD_ITEM_CLS}>
                <CommandItemIcon><Trash2Icon className="h-3.5 w-3.5" /></CommandItemIcon>
                <span className="flex-1">Delete Selection</span>
              </CommandItem>
              <CommandItem value="reset-doc" className={CMD_ITEM_CLS}>
                <CommandItemIcon><RotateCcwIcon className="h-3.5 w-3.5" /></CommandItemIcon>
                <span className="flex-1">Reset Starter Document</span>
              </CommandItem>
            </CommandGroup>
          </CommandList>
          <div className="flex h-[32px] items-center justify-between border-t border-[var(--color-border)] bg-[var(--color-bg)] px-3.5 text-[10px] text-[var(--color-text-tertiary)]">
            <span>↑↓ Navigate · ↵ Run action · Esc Close</span>
            <span>OpenFigma Actions</span>
          </div>
        </Command>
      </DialogContent>
    </Dialog>
  )
}

type ShortcutCategory = "All" | "Tools" | "Selection & Layers" | "Layout & Editing" | "View & Zoom"

interface ShortcutDef {
  category: Exclude<ShortcutCategory, "All">
  keys: string[]
  label: string
}

const SHORTCUT_CATEGORIES: ShortcutCategory[] = [
  "All",
  "Tools",
  "Selection & Layers",
  "Layout & Editing",
  "View & Zoom",
]

const SHORTCUT_ITEMS: ShortcutDef[] = [
  { category: "Tools", keys: ["V", "H"], label: "Move / Hand tool" },
  { category: "Tools", keys: ["F", "R", "O", "L"], label: "Frame, Rectangle, Ellipse, Line" },
  { category: "Tools", keys: ["P"], label: "Pen tool (Bézier vector)" },
  { category: "Tools", keys: ["Shift", "P"], label: "Pencil tool (Freehand)" },
  { category: "Tools", keys: ["T", "C"], label: "Text, Comment tools" },
  { category: "Tools", keys: ["I"], label: "Eyedropper color picker" },
  { category: "Tools", keys: ["Shift", "S"], label: "Star tool" },
  { category: "Selection & Layers", keys: ["Ctrl", "F"], label: "Find & filter layers" },
  { category: "Selection & Layers", keys: ["Alt", "L"], label: "Collapse / Expand all layers" },
  { category: "Selection & Layers", keys: ["F2"], label: "Rename selected layer" },
  { category: "Selection & Layers", keys: ["Shift", "Click"], label: "Range-select layers in tree" },
  { category: "Selection & Layers", keys: ["Enter"], label: "Drill into children or edit text" },
  { category: "Selection & Layers", keys: ["Shift", "Enter"], label: "Select parent container" },
  { category: "Selection & Layers", keys: ["Ctrl", "Click"], label: "Deep-select nested child on canvas" },
  { category: "Layout & Editing", keys: ["Shift", "A"], label: "Add or toggle Auto Layout" },
  { category: "Layout & Editing", keys: ["Ctrl", "G"], label: "Frame selection" },
  { category: "Layout & Editing", keys: ["Ctrl", "Shift", "G"], label: "Ungroup frame" },
  { category: "Layout & Editing", keys: ["Ctrl", "Alt", "K"], label: "Create reusable Component" },
  { category: "Layout & Editing", keys: ["Shift", "H"], label: "Flip horizontal" },
  { category: "Layout & Editing", keys: ["Shift", "V"], label: "Flip vertical" },
  { category: "Layout & Editing", keys: ["Alt", "Drag"], label: "Duplicate layer on canvas" },
  { category: "Layout & Editing", keys: ["Arrow"], label: "Nudge 1px (Shift for 10px)" },
  { category: "Layout & Editing", keys: ["560/2"], label: "Math expressions in numeric fields" },
  { category: "View & Zoom", keys: ["Ctrl", "K"], label: "Quick Actions palette" },
  { category: "View & Zoom", keys: ["?"], label: "Toggle Keyboard Shortcuts" },
  { category: "View & Zoom", keys: ["Ctrl", "\\"], label: "Show / Hide UI panels" },
  { category: "View & Zoom", keys: ["Shift", "D"], label: "Toggle Dev Mode" },
  { category: "View & Zoom", keys: ["Shift", "R"], label: "Toggle canvas rulers" },
  { category: "View & Zoom", keys: ["Space", "Drag"], label: "Pan infinite canvas" },
  { category: "View & Zoom", keys: ["Ctrl", "Scroll"], label: "Zoom to cursor" },
  { category: "View & Zoom", keys: ["Alt", "Hover"], label: "Measure distance guides" },
  { category: "View & Zoom", keys: ["Shift", "1"], label: "Zoom to fit" },
  { category: "View & Zoom", keys: ["Shift", "2"], label: "Zoom to selection" },
  { category: "View & Zoom", keys: ["Shift", "0"], label: "Zoom to 100%" },
]

export function ShortcutsDialog({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const [category, setCategory] = React.useState<ShortcutCategory>("All")
  const [query, setQuery] = React.useState("")

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase()
    return SHORTCUT_ITEMS.filter((item) => {
      const catOk = category === "All" || item.category === category
      const qOk =
        !q ||
        item.label.toLowerCase().includes(q) ||
        item.keys.join(" ").toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q)
      return catOk && qOk
    })
  }, [category, query])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogBackdrop />
      <DialogContent className="w-[540px] max-w-[92vw] overflow-hidden p-0">
        <div className="flex items-start justify-between border-b border-[var(--color-border)] px-4 py-3">
          <div>
            <DialogTitle className="text-[13px] font-semibold text-[var(--color-text)]">
              Keyboard shortcuts
            </DialogTitle>
            <DialogDescription className="mt-0.5 text-[11px] text-[var(--color-text-secondary)]">
              Figma UI3 shortcuts for tools, Auto Layout, Layers, Dev Mode, and navigation.
            </DialogDescription>
          </div>
          <DialogClose
            aria-label="Close shortcuts dialog"
            className="flex !h-[24px] !w-[24px] items-center justify-center rounded-[5px] border-transparent bg-transparent !p-0 text-[var(--color-icon-secondary)] hover:bg-[var(--color-bg-hover)] hover:text-[var(--color-icon)]"
          >
            <XIcon aria-hidden="true" className="h-3.5 w-3.5" />
          </DialogClose>
        </div>

        <div className="flex flex-col gap-2 border-b border-[var(--color-border)] px-4 py-2.5">
          <TextField
            label="Filter shortcuts"
            value={query}
            onValueChange={setQuery}
            placeholder="Search shortcuts…"
            leading={<SearchIcon className="h-3.5 w-3.5" />}
            clearable
            clearLabel="Clear shortcut search"
          />
          <div className="flex flex-wrap items-center gap-1" role="group" aria-label="Shortcut categories">
            {SHORTCUT_CATEGORIES.map((cat) => {
              const active = category === cat
              return (
                <Button
                  key={cat}
                  aria-pressed={active}
                  onClick={() => setCategory(cat)}
                  className={`!h-[22px] rounded-[5px] border-transparent px-2 text-[10.5px] font-medium ${
                    active
                      ? "bg-[var(--color-bg-selected)] text-[var(--color-text-brand)]"
                      : "bg-[var(--color-bg-secondary)] text-[var(--color-text-secondary)] hover:text-[var(--color-text)]"
                  }`}
                >
                  {cat}
                </Button>
              )
            })}
          </div>
        </div>

        <div className="flex max-h-[340px] flex-col divide-y divide-[var(--color-border)]/60 overflow-y-auto px-4 py-1">
          {filtered.length === 0 ? (
            <div className="py-8 text-center text-[11px] text-[var(--color-text-tertiary)]">
              No shortcuts match &ldquo;{query}&rdquo;.
            </div>
          ) : (
            filtered.map((item) => (
              <div
                key={`${item.category}-${item.label}`}
                className="flex h-[32px] items-center justify-between gap-4 text-[11px]"
              >
                <span className="truncate text-[var(--color-text)]">{item.label}</span>
                <span className="flex shrink-0 items-center gap-1">
                  {item.keys.map((key, idx) => (
                    <kbd
                      key={`${key}-${idx}`}
                      className="inline-flex min-w-[20px] items-center justify-center rounded-[4px] border border-[var(--color-border-strong)] bg-[var(--color-bg-elevated)] px-1.5 py-0.5 font-mono text-[10px] font-medium leading-none text-[var(--color-text)]"
                    >
                      {key}
                    </kbd>
                  ))}
                </span>
              </div>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

export function AgentInspectorDialog({
  open,
  onOpenChange,
  getSnapshot,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  getSnapshot: () => unknown[]
}) {
  const [entries, setEntries] = React.useState<unknown[]>([])
  const [filter, setFilter] = React.useState("")

  const refresh = React.useCallback(() => {
    setEntries(getSnapshot())
  }, [getSnapshot])

  React.useEffect(() => {
    if (open) refresh()
  }, [open, refresh])

  const filteredEntries = React.useMemo(() => {
    const q = filter.trim().toLowerCase()
    if (!q) return entries
    return entries.filter((e) => JSON.stringify(e).toLowerCase().includes(q))
  }, [entries, filter])

  const json = React.useMemo(() => JSON.stringify(filteredEntries, null, 2), [filteredEntries])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogBackdrop />
      <DialogContent className="w-[580px] max-w-[92vw] overflow-hidden p-0">
        <div className="flex items-start justify-between gap-3 border-b border-[var(--color-border)] px-4 py-3">
          <div>
            <div className="flex items-center gap-2">
              <DialogTitle className="text-[13px] font-semibold text-[var(--color-text)]">
                UI SDK Agent Bridge Snapshot
              </DialogTitle>
              <span className="rounded-[4px] bg-[var(--color-bg-selected)] px-1.5 py-0.5 text-[10px] font-medium leading-none text-[var(--color-text-brand)] tabular-nums">
                {filteredEntries.length} controls
              </span>
            </div>
            <DialogDescription className="mt-0.5 text-[11px] text-[var(--color-text-secondary)]">
              Live output of <code>createAgent().snapshot()</code> from <code>@ui-sdk/react/agent</code>.
            </DialogDescription>
          </div>
          <DialogClose
            aria-label="Close agent inspector"
            className="flex !h-[24px] !w-[24px] items-center justify-center rounded-[5px] border-transparent bg-transparent !p-0 text-[var(--color-icon-secondary)] hover:bg-[var(--color-bg-hover)] hover:text-[var(--color-icon)]"
          >
            <XIcon aria-hidden="true" className="h-3.5 w-3.5" />
          </DialogClose>
        </div>

        <div className="flex flex-col gap-2.5 p-4">
          <TextField
            label="Filter agent snapshot"
            value={filter}
            onValueChange={setFilter}
            placeholder="Filter controls by label, role, or ref…"
            leading={<SearchIcon className="h-3.5 w-3.5" />}
            clearable
            clearLabel="Clear snapshot filter"
          />

          <pre className="max-h-80 overflow-auto rounded-[6px] border border-[var(--color-border)] bg-[var(--color-bg-elevated)] p-3 font-mono text-[11px] leading-relaxed text-[var(--color-text)]/90">
            {json}
          </pre>

          <div className="flex items-center justify-end gap-1.5">
            <ActionButton
              icon={<CopyIcon aria-hidden="true" className="h-3 w-3" />}
              onClick={() => {
                void navigator.clipboard?.writeText(json)
                toast("Copied Agent Snapshot JSON")
              }}
            >
              Copy JSON
            </ActionButton>
            <ActionButton
              icon={<RefreshCwIcon aria-hidden="true" className="h-3 w-3" />}
              onClick={refresh}
            >
              Refresh Snapshot
            </ActionButton>
            <DialogClose
              data-variant="solid"
              className="!h-[24px] rounded-[5px] border-transparent bg-[var(--color-bg-brand)] px-3 text-[11px] font-medium text-white hover:bg-[var(--color-bg-brand-hover)]"
            >
              Done
            </DialogClose>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
