"use client"

import * as React from "react"
import {
  Menu,
  MenuContent,
  MenuItem,
  MenuSeparator,
  MenuTrigger,
} from "@ui-sdk/react/menu"
import { Toggle, ToggleGroup, ToggleIcon } from "@ui-sdk/react/toggle"
import { Toolbar, ToolbarButton, ToolbarSeparator } from "@ui-sdk/react/toolbar"
import {
  Tooltip,
  TooltipContent,
  TooltipShortcut,
  TooltipTrigger,
} from "@ui-sdk/react/tooltip"
import { toast } from "@ui-sdk/react/toast"
import {
  BotIcon,
  BracesIcon,
  CheckIcon,
  CircleIcon,
  Code2Icon,
  DiamondIcon,
  FrameIcon,
  HandIcon,
  HelpCircleIcon,
  ImagePlusIcon,
  KeyboardIcon,
  LayoutGridIcon,
  MessageSquareIcon,
  MinusIcon,
  MousePointer2Icon,
  PenToolIcon,
  PencilIcon,
  PencilRulerIcon,
  RotateCcwIcon,
  SearchIcon,
  SplineIcon,
  SquareDashedIcon,
  SquareIcon,
  StarIcon,
  TriangleIcon,
  TypeIcon,
} from "lucide-react"
import { useDesignStore } from "../store/useDesignStore"
import type { ToolType } from "../types/design"
import { FigmaChevronDownIcon } from "./ui"

const SHAPE_TOOLS = [
  { value: "rectangle", label: "Rectangle", shortcut: "r", icon: SquareIcon },
  { value: "ellipse", label: "Ellipse", shortcut: "o", icon: CircleIcon },
  { value: "line", label: "Line", shortcut: "l", icon: MinusIcon },
  { value: "polygon", label: "Polygon", shortcut: "", icon: TriangleIcon },
  { value: "star", label: "Star", shortcut: "shift+s", icon: StarIcon },
] as const

interface BottomToolbarProps {
  onOpenActions: () => void
  onOpenShortcuts: () => void
  onOpenAgent: () => void
  onRunAction: (action: string) => void
  leftOffset?: number
  rightOffset?: number
}

export function BottomToolbar({
  onOpenActions,
  onOpenShortcuts,
  onOpenAgent,
  onRunAction,
  leftOffset = 0,
  rightOffset = 0,
}: BottomToolbarProps) {
  const { doc, activePage, setTool, setDevMode, setPresentMode, insertImageFromFile } =
    useDesignStore()

  const imageInputRef = React.useRef<HTMLInputElement>(null)
  const activeShape =
    SHAPE_TOOLS.find((t) => t.value === doc.lastShapeTool) ?? SHAPE_TOOLS[0]
  const ActiveShapeIcon = activeShape.icon
  const isShapeActive = SHAPE_TOOLS.some((t) => t.value === doc.tool)
  const isRegionActive = doc.tool === "frame" || doc.tool === "section"
  const isPointerActive = doc.tool === "select" || doc.tool === "hand"
  const isDrawActive = doc.tool === "pen" || doc.tool === "pencil"
  const activeDrawTool = isDrawActive ? doc.tool : doc.lastDrawTool ?? "pen"
  const normalizedToggleValue = isShapeActive
    ? "shape"
    : isRegionActive
      ? "region"
      : isPointerActive
        ? "pointer"
        : isDrawActive
          ? "draw"
          : doc.tool

  const unresolvedComments = (activePage.comments ?? []).filter((c) => !c.resolved).length

  const pressedAccent = doc.devMode
    ? "data-pressed:bg-[var(--color-bg-dev)] data-pressed:text-white"
    : "data-pressed:bg-[var(--color-bg-brand)] data-pressed:text-white"

  const toolBtnCls = `h-8 w-8 rounded-[8px] border-transparent bg-transparent text-[var(--color-icon)]/90 hover:bg-[var(--color-bg-hover)] hover:text-[var(--color-icon)] transition-colors ${pressedAccent}`
  const chevronBtnCls =
    "h-8 w-3.5 rounded-[5px] border-transparent bg-transparent px-0 text-[var(--color-icon-tertiary)] hover:bg-[var(--color-bg-hover)] hover:text-[var(--color-icon)] transition-colors"

  const handleImageFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ""
    if (!file) return
    await insertImageFromFile(file)
    toast(`Placed image "${file.name}"`)
  }

  return (
    <>
      {/* Centered over the actual canvas viewport between left & right panels */}
      <div
        style={{ left: leftOffset, right: rightOffset }}
        className="pointer-events-none fixed bottom-3 z-30 flex justify-center px-4"
      >
        <input
          ref={imageInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => void handleImageFile(e)}
        />
        <Toolbar
          aria-label="Canvas tools"
          className={`figma-ui3-toolbar pointer-events-auto flex h-[48px] items-center gap-1 px-2 transition-colors ${
            doc.devMode ? "border-[var(--color-bg-dev)]/60" : ""
          }`}
        >
          <ToggleGroup
            value={[normalizedToggleValue]}
            deselectable={false}
            aria-label="Primary tools"
            onValueChange={([next]) => {
              if (!next) return
              if (next === "shape") setTool(doc.lastShapeTool)
              else if (next === "region") setTool(doc.tool === "section" ? "section" : "frame")
              else if (next === "pointer") setTool(doc.tool === "hand" ? "hand" : "select")
              else if (next === "draw") setTool(activeDrawTool)
              else setTool(next as ToolType)
            }}
            className="flex items-center gap-1 pl-0"
          >
            {/* Move / Hand split tool */}
            <div className="flex items-center">
              <Tooltip>
                <TooltipTrigger
                  render={
                    <Toggle value="pointer" aria-label="Move tool" className={toolBtnCls}>
                      <ToggleIcon>
                        {doc.tool === "hand" ? (
                          <HandIcon className="h-4 w-4" />
                        ) : (
                          <MousePointer2Icon className="h-4 w-4" />
                        )}
                      </ToggleIcon>
                    </Toggle>
                  }
                />
                <TooltipContent side="top" sideOffset={12}>
                  {doc.tool === "hand" ? "Hand tool" : "Move"}{" "}
                  <TooltipShortcut>{doc.tool === "hand" ? "H" : "V"}</TooltipShortcut>
                </TooltipContent>
              </Tooltip>

              <Menu onAction={(val) => setTool(val as ToolType)}>
                <ToolbarButton
                  render={<MenuTrigger />}
                  aria-label="Move and hand tools"
                  className={chevronBtnCls}
                >
                  <FigmaChevronDownIcon className="h-3.5 w-3.5" />
                </ToolbarButton>
                <MenuContent side="top" sideOffset={12} align="center">
                  <MenuItem value="select" shortcut="v">
                    <span className="inline-flex w-3.5 justify-center">
                      {doc.tool === "select" && <CheckIcon aria-hidden="true" className="h-3 w-3" />}
                    </span>
                    <MousePointer2Icon aria-hidden="true" className="h-3.5 w-3.5" />
                    Move
                  </MenuItem>
                  <MenuItem value="hand" shortcut="h">
                    <span className="inline-flex w-3.5 justify-center">
                      {doc.tool === "hand" && <CheckIcon aria-hidden="true" className="h-3 w-3" />}
                    </span>
                    <HandIcon aria-hidden="true" className="h-3.5 w-3.5" />
                    Hand tool
                  </MenuItem>
                </MenuContent>
              </Menu>
            </div>

            {/* Frame / Section split tool */}
            <div className="flex items-center">
              <Tooltip>
                <TooltipTrigger
                  render={
                    <Toggle value="region" aria-label="Frame tool" className={toolBtnCls}>
                      <ToggleIcon>
                        {doc.tool === "section" ? (
                          <SquareDashedIcon className="h-4 w-4" />
                        ) : (
                          <FrameIcon className="h-4 w-4" />
                        )}
                      </ToggleIcon>
                    </Toggle>
                  }
                />
                <TooltipContent side="top" sideOffset={12}>
                  {doc.tool === "section" ? (
                    "Section"
                  ) : (
                    <>
                      Frame <TooltipShortcut>F</TooltipShortcut>
                    </>
                  )}
                </TooltipContent>
              </Tooltip>

              <Menu onAction={(val) => setTool(val as ToolType)}>
                <ToolbarButton
                  render={<MenuTrigger />}
                  aria-label="Region tools"
                  className={chevronBtnCls}
                >
                  <FigmaChevronDownIcon className="h-3.5 w-3.5" />
                </ToolbarButton>
                <MenuContent side="top" sideOffset={12} align="center">
                  <MenuItem value="frame" shortcut="f">
                    <span className="inline-flex w-3.5 justify-center">
                      {doc.tool === "frame" && <CheckIcon aria-hidden="true" className="h-3 w-3" />}
                    </span>
                    <FrameIcon aria-hidden="true" className="h-3.5 w-3.5" />
                    Frame
                  </MenuItem>
                  <MenuItem value="section">
                    <span className="inline-flex w-3.5 justify-center">
                      {doc.tool === "section" && <CheckIcon aria-hidden="true" className="h-3 w-3" />}
                    </span>
                    <SquareDashedIcon aria-hidden="true" className="h-3.5 w-3.5" />
                    Section
                  </MenuItem>
                </MenuContent>
              </Menu>
            </div>

            {/* Shape split tool */}
            <div className="flex items-center">
              <Tooltip>
                <TooltipTrigger
                  render={
                    <Toggle
                      value="shape"
                      aria-label={`${activeShape.label} tool`}
                      className={toolBtnCls}
                    >
                      <ToggleIcon>
                        <ActiveShapeIcon className="h-4 w-4" />
                      </ToggleIcon>
                    </Toggle>
                  }
                />
                <TooltipContent side="top" sideOffset={12}>
                  {activeShape.label}
                  {activeShape.shortcut && (
                    <>
                      {" "}
                      <TooltipShortcut>{activeShape.shortcut.toUpperCase()}</TooltipShortcut>
                    </>
                  )}
                </TooltipContent>
              </Tooltip>

              <Menu
                onAction={(value) => {
                  if (value === "place-image") imageInputRef.current?.click()
                  else setTool(value as ToolType)
                }}
              >
                <ToolbarButton
                  render={<MenuTrigger />}
                  aria-label="Choose shape tool"
                  className={chevronBtnCls}
                >
                  <FigmaChevronDownIcon className="h-3.5 w-3.5" />
                </ToolbarButton>
                <MenuContent side="top" sideOffset={12} align="center">
                  {SHAPE_TOOLS.map((shape) => {
                    const Icon = shape.icon
                    const isCurrent = doc.tool === shape.value
                    return (
                      <MenuItem
                        key={shape.value}
                        value={shape.value}
                        shortcut={shape.shortcut || undefined}
                      >
                        <span className="inline-flex w-3.5 justify-center">
                          {isCurrent && <CheckIcon aria-hidden="true" className="h-3 w-3" />}
                        </span>
                        <Icon aria-hidden="true" className="h-3.5 w-3.5" />
                        {shape.label}
                      </MenuItem>
                    )
                  })}
                  <MenuSeparator  />
                  <MenuItem value="place-image">
                    <span className="inline-flex w-3.5 justify-center" />
                    <ImagePlusIcon aria-hidden="true" className="h-3.5 w-3.5" />
                    Place image…
                  </MenuItem>
                </MenuContent>
              </Menu>
            </div>

            {/* Pen / Pencil split tool (matching Figma's Pen P & Pencil Shift+P) */}
            <div className="flex items-center">
              <Tooltip>
                <TooltipTrigger
                  render={
                    <Toggle
                      value="draw"
                      aria-label={activeDrawTool === "pencil" ? "Pencil draw tool" : "Pen draw tool"}
                      className={toolBtnCls}
                    >
                      <ToggleIcon>
                        {activeDrawTool === "pencil" ? (
                          <PencilIcon className="h-4 w-4" />
                        ) : (
                          <PenToolIcon className="h-4 w-4" />
                        )}
                      </ToggleIcon>
                    </Toggle>
                  }
                />
                <TooltipContent side="top" sideOffset={12}>
                  {activeDrawTool === "pencil" ? (
                    <>
                      Pencil <TooltipShortcut>Shift+P</TooltipShortcut>
                    </>
                  ) : (
                    <>
                      Pen <TooltipShortcut>P</TooltipShortcut>
                    </>
                  )}
                </TooltipContent>
              </Tooltip>

              <Menu onAction={(val) => setTool(val as ToolType)}>
                <ToolbarButton
                  render={<MenuTrigger />}
                  aria-label="Pen and pencil tools"
                  className={chevronBtnCls}
                >
                  <FigmaChevronDownIcon className="h-3.5 w-3.5" />
                </ToolbarButton>
                <MenuContent side="top" sideOffset={12} align="center">
                  <MenuItem value="pen" shortcut="p">
                    <span className="inline-flex w-3.5 justify-center">
                      {doc.tool === "pen" && <CheckIcon aria-hidden="true" className="h-3 w-3" />}
                    </span>
                    <PenToolIcon aria-hidden="true" className="h-3.5 w-3.5" />
                    Pen (Bézier)
                  </MenuItem>
                  <MenuItem value="pencil" shortcut="shift+p">
                    <span className="inline-flex w-3.5 justify-center">
                      {doc.tool === "pencil" && <CheckIcon aria-hidden="true" className="h-3 w-3" />}
                    </span>
                    <PencilIcon aria-hidden="true" className="h-3.5 w-3.5" />
                    Pencil (Freehand)
                  </MenuItem>
                </MenuContent>
              </Menu>
            </div>

            <Tooltip>
              <TooltipTrigger
                render={
                  <Toggle value="text" aria-label="Text tool" className={toolBtnCls}>
                    <ToggleIcon>
                      <TypeIcon className="h-4 w-4" />
                    </ToggleIcon>
                  </Toggle>
                }
              />
              <TooltipContent side="top" sideOffset={12}>
                Text <TooltipShortcut>T</TooltipShortcut>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger
                render={
                  <ToolbarButton
                    aria-label="Inspect code mode"
                    aria-pressed={doc.devMode}
                    onClick={() => setDevMode((v) => !v)}
                    className={`h-8 w-8 rounded-[8px] border-transparent transition-colors ${
                      doc.devMode
                        ? "bg-[var(--color-bg-dev)]/20 text-[var(--color-bg-dev)] hover:bg-[var(--color-bg-dev)]/30"
                        : "bg-transparent text-[var(--color-icon)]/90 hover:bg-[var(--color-bg-hover)] hover:text-[var(--color-icon)]"
                    }`}
                  >
                    <BracesIcon aria-hidden="true" className="h-4 w-4" />
                  </ToolbarButton>
                }
              />
              <TooltipContent side="top" sideOffset={12}>
                Code inspect <TooltipShortcut>Shift+D</TooltipShortcut>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger
                render={
                  <Toggle
                    value="comment"
                    aria-label="Comment tool"
                    className={`relative ${toolBtnCls}`}
                  >
                    <ToggleIcon>
                      <MessageSquareIcon className="h-4 w-4" />
                    </ToggleIcon>
                    {unresolvedComments > 0 && (
                      <span
                        aria-hidden="true"
                        className={`absolute right-1 top-1 h-1.5 w-1.5 rounded-full ${
                          doc.devMode
                            ? "bg-[var(--color-bg-dev)]"
                            : "bg-[var(--color-bg-brand)]"
                        }`}
                      />
                    )}
                  </Toggle>
                }
              />
              <TooltipContent side="top" sideOffset={12}>
                Comment <TooltipShortcut>C</TooltipShortcut>
              </TooltipContent>
            </Tooltip>
          </ToggleGroup>

          <Tooltip>
            <TooltipTrigger
              render={
                <ToolbarButton
                  aria-label="Quick actions"
                  onClick={onOpenActions}
                  className="h-8 w-8 rounded-[8px] border-transparent bg-transparent text-[var(--color-icon)]/90 transition-colors hover:bg-[var(--color-bg-hover)] hover:text-[var(--color-icon)]"
                >
                  <LayoutGridIcon aria-hidden="true" className="h-4 w-4" />
                </ToolbarButton>
              }
            />
            <TooltipContent side="top" sideOffset={12}>
              Actions <TooltipShortcut>Ctrl+K</TooltipShortcut>
            </TooltipContent>
          </Tooltip>

          <ToolbarSeparator className="my-2" />

          {/* Official 2026 Figma 4-Mode Switcher Track (Draw / Design / Present / Dev Mode) */}
          <div
            role="group"
            aria-label="Workspace mode"
            className="flex h-[34px] items-center gap-0.5 rounded-[9px] bg-[var(--color-bg-secondary)] p-[3px]"
          >
            <Tooltip>
              <TooltipTrigger
                render={
                  <ToolbarButton
                    aria-label="Draw mode"
                    aria-pressed={!doc.devMode && isDrawActive}
                    onClick={() => {
                      setDevMode(false)
                      setTool(activeDrawTool)
                    }}
                    className={`h-[28px] w-[28px] rounded-[6px] border-transparent !p-0 transition-colors ${
                      !doc.devMode && isDrawActive
                        ? "bg-[var(--color-bg-selected)] text-[var(--color-icon-brand)]"
                        : "bg-transparent text-[var(--color-icon-secondary)] hover:text-[var(--color-icon)]"
                    }`}
                  >
                    <SplineIcon aria-hidden="true" className="h-3.5 w-3.5" />
                  </ToolbarButton>
                }
              />
              <TooltipContent side="top" sideOffset={12}>
                Draw <TooltipShortcut>P</TooltipShortcut>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger
                render={
                  <ToolbarButton
                    aria-label="Design mode"
                    aria-pressed={!doc.devMode && !isDrawActive}
                    onClick={() => {
                      setDevMode(false)
                      if (isDrawActive) setTool("select")
                    }}
                    className={`h-[28px] w-[28px] rounded-[6px] border-transparent !p-0 transition-colors ${
                      !doc.devMode && !isDrawActive
                        ? "bg-[var(--color-bg-selected)] text-[var(--color-icon-brand)]"
                        : "bg-transparent text-[var(--color-icon-secondary)] hover:text-[var(--color-icon)]"
                    }`}
                  >
                    <PencilRulerIcon aria-hidden="true" className="h-3.5 w-3.5" />
                  </ToolbarButton>
                }
              />
              <TooltipContent side="top" sideOffset={12}>
                Design
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger
                render={
                  <ToolbarButton
                    aria-label="Prototype mode"
                    onClick={() => setPresentMode(true)}
                    className="h-[28px] w-[28px] rounded-[6px] border-transparent bg-transparent !p-0 text-[var(--color-icon-secondary)] transition-colors hover:text-[var(--color-icon)]"
                  >
                    <DiamondIcon aria-hidden="true" className="h-3.5 w-3.5" />
                  </ToolbarButton>
                }
              />
              <TooltipContent side="top" sideOffset={12}>
                Present prototype
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger
                render={
                  <Toggle
                    aria-label="Toggle Dev Mode"
                    pressed={doc.devMode}
                    onPressedChange={(next) => setDevMode(next)}
                    className="flex h-[28px] w-[28px] items-center justify-center rounded-[6px] border-transparent bg-transparent !p-0 text-[var(--color-icon-secondary)] transition-colors hover:text-[var(--color-icon)] data-pressed:bg-[var(--color-bg-dev)] data-pressed:text-white"
                  >
                    <ToggleIcon>
                      <Code2Icon className="h-3.5 w-3.5" />
                    </ToggleIcon>
                  </Toggle>
                }
              />
              <TooltipContent side="top" sideOffset={12}>
                {doc.devMode ? "Exit Dev Mode" : "Enter Dev Mode"}{" "}
                <TooltipShortcut>Shift+D</TooltipShortcut>
              </TooltipContent>
            </Tooltip>
          </div>
        </Toolbar>
      </div>

      {/* Official Figma 32x32 Floating Circular Help (?) Menu Button */}
      <div
        style={{ right: rightOffset + 20 }}
        className="fixed bottom-5 z-30"
      >
        <Menu
          onAction={(val) => {
            if (val === "shortcuts") onOpenShortcuts()
            else if (val === "quick-actions") onOpenActions()
            else if (val === "agent-inspector") onOpenAgent()
            else onRunAction(val)
          }}
        >
          <MenuTrigger
            aria-label="Help and resources"
            className="flex !h-[32px] !w-[32px] items-center justify-center rounded-full border border-[var(--color-border)] bg-[var(--color-bg)] !p-0 text-[var(--color-icon-secondary)] shadow-[0_4px_14px_rgba(0,0,0,0.45)] transition-colors hover:bg-[var(--color-bg-secondary)] hover:text-[var(--color-icon)]"
          >
            <HelpCircleIcon aria-hidden="true" className="h-4 w-4" />
          </MenuTrigger>
          <MenuContent side="top" align="end" sideOffset={10}>
            <MenuItem value="shortcuts" shortcut="?">
              <KeyboardIcon aria-hidden="true" className="h-3.5 w-3.5" />
              Keyboard shortcuts
            </MenuItem>
            <MenuItem value="quick-actions" shortcut="mod+k">
              <SearchIcon aria-hidden="true" className="h-3.5 w-3.5" />
              Quick actions…
            </MenuItem>
            <MenuItem value="agent-inspector">
              <BotIcon aria-hidden="true" className="h-3.5 w-3.5 text-[var(--color-icon-brand)]" />
              UI SDK Agent Snapshot…
            </MenuItem>
            <MenuSeparator />
            <MenuItem value="toggle-ui" shortcut="mod+\">
              Hide / Show UI
            </MenuItem>
            <MenuItem value="reset-doc">
              <RotateCcwIcon aria-hidden="true" className="h-3.5 w-3.5" />
              Reset starter showcase
            </MenuItem>
            <MenuSeparator />
            <div className="px-2 py-1 text-[10px] leading-snug text-[var(--color-text-tertiary)]">
              Independent open-source starter.
              <br />
              Not affiliated with Figma, Inc.
            </div>
          </MenuContent>
        </Menu>
      </div>
    </>
  )
}
