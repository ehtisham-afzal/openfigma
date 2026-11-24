import { act, render, screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { createAgent } from "@ui-sdk/react/agent"
import { expect, test } from "vitest"
import { App } from "./App"

const agent = createAgent()

test("an agent can inspect and operate OpenFigma UI3 controls", async () => {
  render(<App />)

  const components = agent
    .snapshot()
    .filter((entry) => !entry.offPage && entry.component !== "more")

  for (const entry of components) {
    expect(entry.label, `${entry.component} ${entry.ref} has no name`).toBeTruthy()
  }

  const labels = components.map((entry) => entry.label)
  for (const required of [
    "Document title",
    "OpenFigma main menu",
    "Layers",
    "X position",
    "Layer width",
    "Clip content",
    "Toggle Dev Mode",
    "Present prototype",
  ]) {
    expect(labels, `${required} is missing from agent snapshot`).toContain(required)
  }

  const renameResult = await agent.act({
    steps: [
      { ref: "Document title", action: "setValue", args: ["Mobile App Spec"] },
      { ref: "Layer width", action: "setValue", args: [620] },
    ],
  })
  expect(renameResult.ok, renameResult.error?.message).toBe(true)

  expect(screen.getByLabelText<HTMLInputElement>("Document title").value).toBe(
    "Mobile App Spec"
  )
  expect(screen.getByLabelText<HTMLInputElement>("Layer width").value).toBe("620")
})

test("switching to Assets tab inserts a component and updates canvas", async () => {
  render(<App />)

  const switchResult = await agent.act({
    steps: [{ ref: "Left sidebar mode", action: "setValue", args: ["Assets"] }],
  })
  expect(switchResult.ok, switchResult.error?.message).toBe(true)

  const insertButton = await screen.findByRole("button", { name: /Metric Card/i })
  insertButton.click()

  const matches = await screen.findAllByText("Card / Metric")
  expect(matches.length).toBeGreaterThanOrEqual(1)
})

test("switching to Tokens tab changes variable theme modes live", async () => {
  const user = userEvent.setup()
  render(<App />)

  await user.click(screen.getByRole("tab", { name: "Tokens" }))
  const lightRadio = await screen.findByRole("radio", { name: "Light" })
  await user.click(lightRadio)
  expect(lightRadio.getAttribute("aria-checked")).toBe("true")
})

test("Dev Mode toggle activates Inspect view with Box Model, JSX, and Tokens", async () => {
  const user = userEvent.setup()
  render(<App />)

  await user.click(screen.getByRole("button", { name: "Toggle Dev Mode" }))
  expect(await screen.findByText("Box Model")).toBeTruthy()
  expect(await screen.findByText(/export function HeroDesktop/)).toBeTruthy()

  await user.click(screen.getByRole("radio", { name: "Tokens" }))
  expect(await screen.findByText(/--surface-card:/)).toBeTruthy()
})

test("Collapse UI toggles focus mode and Show UI restores panels", async () => {
  const user = userEvent.setup()
  render(<App />)

  await user.click(screen.getByRole("button", { name: "Collapse UI panels" }))
  expect(screen.queryByLabelText("Document title")).toBeNull()

  const showBtn = await screen.findByRole("button", { name: "Show UI panels" })
  await user.click(showBtn)
  expect(await screen.findByLabelText("Document title")).toBeTruthy()
})

test("Present prototype opens presentation modal and exits cleanly", async () => {
  const user = userEvent.setup()
  render(<App />)

  await user.click(screen.getByRole("button", { name: "Present prototype" }))
  expect(await screen.findByRole("dialog", { name: "Prototype presentation" })).toBeTruthy()

  await user.click(screen.getByRole("button", { name: "Exit presentation" }))
  expect(screen.queryByRole("dialog", { name: "Prototype presentation" })).toBeNull()
})

test("clicking a canvas comment pin opens thread and adds a reply", async () => {
  const user = userEvent.setup()
  render(<App />)

  await user.click(screen.getByRole("button", { name: "Comment 1 by Maya Lin" }))
  const replyInput = await screen.findByLabelText("Reply to comment 1")
  await user.type(replyInput, "Looks sharp!{Enter}")

  expect(await screen.findByText("Looks sharp!")).toBeTruthy()
})

test("clicking a layer in the tree replaces selection and shows Auto Layout matrix", async () => {
  const user = userEvent.setup()
  render(<App />)

  const mobileCardItem = screen.getByRole("treeitem", { name: /Mobile Card/i })
  await user.click(within(mobileCardItem).getByText("Mobile Card"))

  expect(await screen.findByRole("button", { name: "Align start start" })).toBeTruthy()
  expect(screen.queryByText(/2 Layers/i)).toBeNull()
})

test(
  "double-clicking a page renames it inline and toggling layer visibility preserves selection",
  async () => {
    const user = userEvent.setup()
    render(<App />)

    const pageBtn = screen.getByRole("button", { name: "Design System" })
    await user.dblClick(pageBtn)
    const pageInput = await screen.findByLabelText("Rename page Design System")
    await user.clear(pageInput)
    await user.type(pageInput, "Brand Foundations{Enter}")
    expect(await screen.findByRole("button", { name: "Brand Foundations" })).toBeTruthy()

    // Hiding Mobile Card should NOT switch selection away from Hero Desktop
    await user.click(screen.getByRole("button", { name: "Hide Mobile Card" }))
    expect(screen.getByLabelText<HTMLInputElement>("Layer width").value).toBe("560")
  },
  10_000
)

test("Ctrl+wheel prevents browser zoom globally and zooms only the canvas", () => {
  render(<App />)

  const zoomBtn = screen.getByRole("button", { name: "Zoom level" })
  expect(zoomBtn.textContent).toContain("85%")

  const globalWheel = new WheelEvent("wheel", {
    ctrlKey: true,
    deltaY: -100,
    bubbles: true,
    cancelable: true,
  })
  window.dispatchEvent(globalWheel)
  expect(globalWheel.defaultPrevented).toBe(true)

  const canvas = screen.getByLabelText("Design canvas")
  const canvasWheel = new WheelEvent("wheel", {
    ctrlKey: true,
    deltaY: -100,
    clientX: 600,
    clientY: 400,
    bubbles: true,
    cancelable: true,
  })
  act(() => {
    canvas.dispatchEvent(canvasWheel)
  })
  expect(canvasWheel.defaultPrevented).toBe(true)
  expect(zoomBtn.textContent).not.toContain("85%")
})

test("quick actions dialog runs a command and closes", async () => {
  const user = userEvent.setup()
  render(<App />)

  await user.click(screen.getByRole("button", { name: "Quick actions" }))
  const search = await screen.findByRole("combobox", { name: "Search OpenFigma actions" })
  await user.type(search, "star")
  await user.keyboard("{Enter}")

  expect(screen.queryByRole("combobox", { name: "Search OpenFigma actions" })).toBeNull()
  const starNodes = await screen.findAllByText("Star")
  expect(starNodes.length).toBeGreaterThanOrEqual(1)
})

test(
  "RightInspector supports math expressions, root align disabled state, and double-click Space Between",
  async () => {
    const user = userEvent.setup()
    render(<App />)

    // Single root frame disables alignment buttons just like Figma
    const alignLeftBtn = screen.getByRole("button", { name: "Align left" })
    expect((alignLeftBtn as HTMLButtonElement).disabled).toBe(true)

    // Math expression in NumberField evaluates on Enter (560/2 -> 280)
    const widthInput = screen.getByLabelText<HTMLInputElement>("Layer width")
    await user.click(widthInput)
    await user.clear(widthInput)
    await user.type(widthInput, "560/2{Enter}")
    expect(widthInput.value).toBe("280")

    // Double-clicking Auto Layout 3x3 alignment grid toggles Space between (Auto gap)
    const mobileCardItem = screen.getByRole("treeitem", { name: /Mobile Card/i })
    await user.click(within(mobileCardItem).getByText("Mobile Card"))
    const gridCell = await screen.findByRole("button", { name: "Align start start" })
    await user.dblClick(gridCell)
    expect(await screen.findByText("Auto")).toBeTruthy()
  },
  10_000
)

test(
  "LeftSidebar supports layer Find type filters, Collapse/Expand toggle, Agents prompt, and Variables groups",
  async () => {
    const user = userEvent.setup()
    render(<App />)

    // Open Find layers and filter by Text type
    await user.click(screen.getByRole("button", { name: "Toggle layer search" }))
    const searchInput = await screen.findByLabelText("Filter layers")
    await user.click(screen.getByRole("button", { name: "Text" }))
    await user.type(searchInput, "Price")
    expect(screen.getByRole("treeitem", { name: /Price/i })).toBeTruthy()
    await user.click(screen.getByRole("button", { name: "Toggle layer search" }))

    // Collapse all layers switches to Expand all layers toggle
    await user.click(screen.getByRole("button", { name: "Collapse all layers" }))
    expect(screen.getByRole("button", { name: "Expand all layers" })).toBeTruthy()
    await user.click(screen.getByRole("button", { name: "Expand all layers" }))
    expect(screen.getByRole("button", { name: "Collapse all layers" })).toBeTruthy()

    // Agents tab interactive prompt runs live action
    await user.click(screen.getByRole("tab", { name: "Agents" }))
    const promptInput = await screen.findByLabelText("Ask design agent")
    await user.type(promptInput, "add metric card{Enter}")
    expect(await screen.findByText(/Generated Metric Card on canvas/i)).toBeTruthy()

    // Variables tab filters by Colors vs Numbers
    await user.click(screen.getByRole("tab", { name: "Tokens" }))
    await user.click(await screen.findByRole("button", { name: "Numbers" }))
    expect(screen.getByText(/Variables \(\d+\)/)).toBeTruthy()
  },
  10_000
)

test(
  "BottomToolbar Help menu opens categorized Shortcuts dialog and PresentationModal switches slides",
  async () => {
    const user = userEvent.setup()
    render(<App />)

    // Open Help menu -> Keyboard shortcuts
    await user.click(screen.getByRole("button", { name: "Help and resources" }))
    await user.click(await screen.findByRole("menuitem", { name: /Keyboard shortcuts/i }))
    const shortcutSearch = await screen.findByLabelText("Filter shortcuts")
    await user.type(shortcutSearch, "Auto Layout")
    expect(await screen.findByText(/Add or toggle Auto Layout/i)).toBeTruthy()
    await user.click(screen.getByRole("button", { name: "Close shortcuts dialog" }))

    // Present prototype and switch slide via bottom frame strip
    await user.click(screen.getByRole("button", { name: "Present prototype" }))
    const dialog = await screen.findByRole("dialog", { name: "Prototype presentation" })
    const mobileSlideBtn = within(dialog).getByRole("button", { name: "Mobile Card" })
    await user.click(mobileSlideBtn)
    expect(mobileSlideBtn.getAttribute("aria-current")).toBe("page")
    await user.click(within(dialog).getByRole("button", { name: "Exit presentation" }))
  },
  10_000
)

test(
  "Canvas supports inline frame label rename, rulers, and eyedropper shortcut",
  async () => {
    const user = userEvent.setup()
    render(<App />)

    // Double-click Hero Desktop canvas title label to rename inline on canvas
    const heroLabels = screen.getAllByText("Hero Desktop")
    const canvasLabel = heroLabels.find((el) => el.closest('[aria-label="Design canvas"]'))
    expect(canvasLabel).toBeTruthy()
    await user.dblClick(canvasLabel!)
    const renameInput = await screen.findByLabelText("Rename Hero Desktop on canvas")
    await user.clear(renameInput)
    await user.type(renameInput, "Landing Hero{Enter}")
    expect(await screen.findAllByText("Landing Hero")).toBeTruthy()

    // Shift+R toggles interactive rulers on canvas
    await user.keyboard("{Shift>}R{/Shift}")
    expect(await screen.findByLabelText("Horizontal ruler")).toBeTruthy()
    expect(await screen.findByLabelText("Vertical ruler")).toBeTruthy()
  },
  10_000
)

test(
  "Comments stick to parent frame on move and toolbar splits Pen (Bézier) and Pencil (Freehand)",
  async () => {
    const user = userEvent.setup()
    render(<App />)

    // Starter comment-1 is pinned to Hero Desktop: nudging Hero Desktop moves the comment pin with it
    const commentPin = document.querySelector('[data-comment-pin="comment-1"]') as HTMLElement
    expect(commentPin).toBeTruthy()
    const initialLeft = parseFloat(commentPin.style.left)
    await user.keyboard("{Shift>}{ArrowRight}{/Shift}")
    const movedLeft = parseFloat(commentPin.style.left)
    expect(movedLeft).toBe(initialLeft + 10)

    // BottomToolbar splits Pen (Bézier) and Pencil (Freehand)
    await user.click(screen.getByRole("button", { name: "Pen and pencil tools" }))
    expect(await screen.findByRole("menuitem", { name: /Pen \(Bézier\)/i })).toBeTruthy()
    const pencilItem = await screen.findByRole("menuitem", { name: /Pencil \(Freehand\)/i })
    await user.click(pencilItem)
    expect(await screen.findByRole("button", { name: "Pencil draw tool" })).toBeTruthy()
  },
  10_000
)
