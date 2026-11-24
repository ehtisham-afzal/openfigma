export type NodeType =
  | "frame"
  | "section"
  | "component"
  | "instance"
  | "rectangle"
  | "ellipse"
  | "line"
  | "polygon"
  | "star"
  | "text"
  | "path"
  | "image"

export type ToolType =
  | "select"
  | "hand"
  | "frame"
  | "section"
  | "rectangle"
  | "ellipse"
  | "line"
  | "polygon"
  | "star"
  | "text"
  | "pen"
  | "pencil"
  | "comment"
  | "image"
  | "eyedropper"

export type BlendMode =
  | "normal"
  | "multiply"
  | "screen"
  | "overlay"
  | "darken"
  | "lighten"

export type TextAlign = "left" | "center" | "right"
export type TextTransform = "none" | "uppercase" | "lowercase" | "capitalize"
export type TextDecoration = "none" | "underline" | "line-through"

export type LayoutMode = "none" | "horizontal" | "vertical"
export type LayoutAlign = "start" | "center" | "end" | "space-between"
export type CounterAlign = "start" | "center" | "end" | "stretch"
export type AxisSizing = "fixed" | "hug"

export interface Point {
  x: number
  y: number
}

export interface BezierPoint {
  x: number
  y: number
  handleIn?: Point
  handleOut?: Point
}

export interface GradientStop {
  offset: number
  color: string
}

export interface FillLayer {
  id: string
  type: "solid" | "linear" | "radial" | "image"
  visible: boolean
  opacity: number
  color: string
  variableId?: string | null
  gradientAngle?: number
  gradientStops?: GradientStop[]
  imageUrl?: string
  imageScaleMode?: "cover" | "contain" | "fill"
}

export interface StrokeLayer {
  id: string
  visible: boolean
  color: string
  variableId?: string | null
  width: number
  opacity: number
  style: "solid" | "dashed"
  align: "inside" | "center" | "outside"
}

export interface EffectLayer {
  id: string
  type: "drop-shadow" | "inner-shadow" | "layer-blur" | "background-blur"
  visible: boolean
  x: number
  y: number
  blur: number
  spread: number
  color: string
}

export interface AutoLayoutConfig {
  mode: LayoutMode
  gap: number
  paddingTop: number
  paddingRight: number
  paddingBottom: number
  paddingLeft: number
  primaryAlign: LayoutAlign
  counterAlign: CounterAlign
  primarySizing: AxisSizing
  counterSizing: AxisSizing
  wrap: boolean
}

export interface DesignNode {
  id: string
  name: string
  type: NodeType
  parentId: string | null
  componentId?: string | null
  x: number
  y: number
  width: number
  height: number
  rotation: number
  flipX?: boolean
  flipY?: boolean
  lockAspectRatio?: boolean
  opacity: number
  visible: boolean
  locked: boolean
  clipContent?: boolean
  isMask?: boolean
  fills: FillLayer[]
  strokes: StrokeLayer[]
  effects: EffectLayer[]
  cornerRadius: number
  independentCorners?: boolean
  cornerRadii?: [number, number, number, number]
  blendMode: BlendMode
  layout?: AutoLayoutConfig
  layoutGrow?: number
  layoutAbsolute?: boolean
  text?: string
  fontFamily?: string
  fontSize?: number
  fontWeight?: number
  textAlign?: TextAlign
  textTransform?: TextTransform
  textDecoration?: TextDecoration
  lineHeight?: number
  letterSpacing?: number
  points?: Point[]
  bezierPoints?: BezierPoint[]
  closed?: boolean
  smooth?: boolean
  polygonSides?: number
  starPoints?: number
}

export interface DesignVariable {
  id: string
  name: string
  type: "color" | "number"
  values: Record<string, string | number>
}

export interface VariableCollection {
  modes: { id: string; name: string }[]
  activeModeId: string
  variables: DesignVariable[]
}

export interface CanvasComment {
  id: string
  parentId?: string | null
  x: number
  y: number
  author: string
  avatarColor: string
  text: string
  createdAt: string
  resolved: boolean
  replies: { id: string; author: string; text: string; createdAt: string }[]
}

export interface RulerGuide {
  id: string
  axis: "x" | "y"
  position: number
}

export interface DesignPage {
  id: string
  name: string
  background: string
  nodes: Record<string, DesignNode>
  order: string[]
  comments?: CanvasComment[]
  guides?: RulerGuide[]
}

export interface ViewportState {
  x: number
  y: number
  zoom: number
}

export interface DocumentState {
  version: number
  title: string
  pages: DesignPage[]
  activePageId: string
  selectedIds: string[]
  tool: ToolType
  lastShapeTool: "rectangle" | "ellipse" | "line" | "polygon" | "star"
  lastDrawTool?: "pen" | "pencil"
  viewport: ViewportState
  showGrid: boolean
  showRulers: boolean
  snapToObjects: boolean
  showUI: boolean
  devMode: boolean
  presentMode: boolean
  variables: VariableCollection
}

export interface SnapGuide {
  orientation: "vertical" | "horizontal"
  position: number
  start: number
  end: number
}

export interface MeasureLine {
  orientation: "horizontal" | "vertical"
  x1: number
  y1: number
  x2: number
  y2: number
  distance: number
}

export interface FramePreset {
  category: "Phone" | "Tablet" | "Desktop" | "Social"
  name: string
  width: number
  height: number
}

export const FRAME_PRESETS: FramePreset[] = [
  { category: "Phone", name: "iPhone 16", width: 393, height: 852 },
  { category: "Phone", name: "iPhone 16 Pro Max", width: 440, height: 956 },
  { category: "Phone", name: "Android Compact", width: 412, height: 915 },
  { category: "Tablet", name: "iPad Mini", width: 744, height: 1133 },
  { category: "Tablet", name: "iPad Pro 11\"", width: 834, height: 1194 },
  { category: "Desktop", name: "MacBook Air", width: 1280, height: 832 },
  { category: "Desktop", name: "Desktop 1440", width: 1440, height: 900 },
  { category: "Desktop", name: "Slide 16:9", width: 1920, height: 1080 },
  { category: "Social", name: "Instagram Post", width: 1080, height: 1080 },
  { category: "Social", name: "OG / Social Card", width: 1200, height: 630 },
]
