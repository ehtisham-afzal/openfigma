import * as React from "react"

type IconProps = {
  className?: string
}

/**
 * Official Figma UI3 24x24 icon primitives (`data-fpl-icon-size="24"`).
 * All paths live inside Figma's canonical 24x24 grid (12x12–14x14 optical box
 * with crisp 1px strokes) and MUST render at native `24px` (`h-6 w-6`) so
 * stroke weights stay razor-sharp and match official Figma UI3 1:1.
 */
const DEFAULT_CLS = "h-6 w-6 shrink-0"

export function FigmaAlignLeftIcon({ className = DEFAULT_CLS }: IconProps) {
  return (
    <svg aria-hidden="true" width="24" height="24" viewBox="0 0 24 24" fill="none" className={className}>
      <path
        fill="currentColor"
        fillRule="evenodd"
        clipRule="evenodd"
        d="M17.25 10a.75.75 0 0 0 .75-.75v-.5a.75.75 0 0 0-.75-.75h-8.5a.75.75 0 0 0-.75.75v.5c0 .414.336.75.75.75zm-4 5a.75.75 0 0 0 .75-.75v-.5a.75.75 0 0 0-.75-.75h-4.5a.75.75 0 0 0-.75.75v.5c0 .414.336.75.75.75z"
      />
      <path fill="currentColor" fillOpacity="0.45" d="M6 17.5a.5.5 0 0 1-1 0v-12a.5.5 0 0 1 1 0z" />
    </svg>
  )
}

export function FigmaAlignHorizontalCenterIcon({ className = DEFAULT_CLS }: IconProps) {
  return (
    <svg aria-hidden="true" width="24" height="24" viewBox="0 0 24 24" fill="none" className={className}>
      <path
        fill="currentColor"
        fillRule="evenodd"
        clipRule="evenodd"
        d="M17.25 10a.75.75 0 0 0 .75-.75v-.5a.75.75 0 0 0-.75-.75h-9.5a.75.75 0 0 0-.75.75v.5c0 .414.336.75.75.75zm-2 5a.75.75 0 0 0 .75-.75v-.5a.75.75 0 0 0-.75-.75h-5.5a.75.75 0 0 0-.75.75v.5c0 .414.336.75.75.75z"
      />
      <path
        fill="currentColor"
        fillOpacity="0.45"
        fillRule="evenodd"
        clipRule="evenodd"
        d="M13 17.5a.5.5 0 0 1-1 0V15h1zm0-4.5v-3h-1v3zm0-7.5V8h-1V5.5a.5.5 0 0 1 1 0"
      />
    </svg>
  )
}

export function FigmaAlignRightIcon({ className = DEFAULT_CLS }: IconProps) {
  return (
    <svg aria-hidden="true" width="24" height="24" viewBox="0 0 24 24" fill="none" className={className}>
      <path
        fill="currentColor"
        fillRule="evenodd"
        clipRule="evenodd"
        d="M6.75 10A.75.75 0 0 1 6 9.25v-.5A.75.75 0 0 1 6.75 8h8.5a.75.75 0 0 1 .75.75v.5a.75.75 0 0 1-.75.75zm4 5a.75.75 0 0 1-.75-.75v-.5a.75.75 0 0 1 .75-.75h4.5a.75.75 0 0 1 .75.75v.5a.75.75 0 0 1-.75.75z"
      />
      <path fill="currentColor" fillOpacity="0.45" d="M18 17.5a.5.5 0 0 0 1 0v-12a.5.5 0 0 0-1 0z" />
    </svg>
  )
}

export function FigmaAlignTopIcon({ className = DEFAULT_CLS }: IconProps) {
  return (
    <svg aria-hidden="true" width="24" height="24" viewBox="0 0 24 24" fill="none" className={className}>
      <path
        fill="currentColor"
        fillRule="evenodd"
        clipRule="evenodd"
        d="M10 17.25a.75.75 0 0 1-.75.75h-.5a.75.75 0 0 1-.75-.75v-8.5A.75.75 0 0 1 8.75 8h.5a.75.75 0 0 1 .75.75zm5-4a.75.75 0 0 1-.75.75h-.5a.75.75 0 0 1-.75-.75v-4.5a.75.75 0 0 1 .75-.75h.5a.75.75 0 0 1 .75.75z"
      />
      <path fill="currentColor" fillOpacity="0.45" d="M17.5 6a.5.5 0 0 0 0-1h-12a.5.5 0 0 0 0 1z" />
    </svg>
  )
}

export function FigmaAlignVerticalCenterIcon({ className = DEFAULT_CLS }: IconProps) {
  return (
    <svg aria-hidden="true" width="24" height="24" viewBox="0 0 24 24" fill="none" className={className}>
      <path
        fill="currentColor"
        fillRule="evenodd"
        clipRule="evenodd"
        d="M10 6.75A.75.75 0 0 0 9.25 6h-.5a.75.75 0 0 0-.75.75v9.5c0 .414.336.75.75.75h.5a.75.75 0 0 0 .75-.75zm5 2a.75.75 0 0 0-.75-.75h-.5a.75.75 0 0 0-.75.75v5.5c0 .414.336.75.75.75h.5a.75.75 0 0 0 .75-.75z"
      />
      <path
        fill="currentColor"
        fillOpacity="0.45"
        fillRule="evenodd"
        clipRule="evenodd"
        d="M17.5 11a.5.5 0 0 1 0 1H15v-1zM13 11h-3v1h3zm-7.5 0H8v1H5.5a.5.5 0 0 1 0-1"
      />
    </svg>
  )
}

export function FigmaAlignBottomIcon({ className = DEFAULT_CLS }: IconProps) {
  return (
    <svg aria-hidden="true" width="24" height="24" viewBox="0 0 24 24" fill="none" className={className}>
      <path
        fill="currentColor"
        fillRule="evenodd"
        clipRule="evenodd"
        d="M10 6.75A.75.75 0 0 0 9.25 6h-.5a.75.75 0 0 0-.75.75v8.5c0 .414.336.75.75.75h.5a.75.75 0 0 0 .75-.75zm5 4a.75.75 0 0 0-.75-.75h-.5a.75.75 0 0 0-.75.75v4.5c0 .414.336.75.75.75h.5a.75.75 0 0 0 .75-.75z"
      />
      <path fill="currentColor" fillOpacity="0.45" d="M17.5 18a.5.5 0 0 1 0 1h-12a.5.5 0 0 1 0-1z" />
    </svg>
  )
}

export function FigmaRotationAngleIcon({ className = DEFAULT_CLS }: IconProps) {
  return (
    <svg aria-hidden="true" width="24" height="24" viewBox="0 0 24 24" fill="none" className={className}>
      <path
        fill="currentColor"
        fillRule="evenodd"
        clipRule="evenodd"
        d="M9 8.5a.5.5 0 0 0-1 0v7a.5.5 0 0 0 .5.5h7a.5.5 0 0 0 0-1H13a4 4 0 0 0-4-4zM9 12v3h3a3 3 0 0 0-3-3"
      />
    </svg>
  )
}

export function FigmaRotate90Icon({ className = DEFAULT_CLS }: IconProps) {
  return (
    <svg aria-hidden="true" width="24" height="24" viewBox="0 0 24 24" fill="none" className={className}>
      <path
        fill="currentColor"
        d="M10.94 9.44a1.5 1.5 0 0 1 2.121 0l3.501 3.5a1.5 1.5 0 0 1 0 2.122l-3.501 3.5a1.5 1.5 0 0 1-2.121 0l-3.5-3.5a1.5 1.5 0 0 1 0-2.122zm1.414.708a.5.5 0 0 0-.707 0l-3.5 3.5a.5.5 0 0 0 0 .707l3.5 3.5a.5.5 0 0 0 .707 0l3.5-3.5a.5.5 0 0 0 0-.707zm-2.828-4.38a3.5 3.5 0 0 1 4.95 0L16 7.293V6a.5.5 0 1 1 1 0v2.5a.5.5 0 0 1-.5.5H14a.5.5 0 0 1 0-1h1.293l-1.525-1.525a2.5 2.5 0 0 0-3.535 0L7.854 8.854a.5.5 0 0 1-.707-.708z"
      />
    </svg>
  )
}

export function FigmaFlipHorizontalIcon({ className = DEFAULT_CLS }: IconProps) {
  return (
    <svg aria-hidden="true" width="24" height="24" viewBox="0 0 24 24" fill="none" className={className}>
      <path
        fill="currentColor"
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12 6.5a.5.5 0 0 0-1 0v11a.5.5 0 0 0 1 0zM6 9.604a.75.75 0 0 1 1.28-.53l2.22 2.219a1 1 0 0 1 0 1.414l-2.22 2.22a.75.75 0 0 1-1.28-.53zm1 4.189L8.793 12 7 10.207zm10-4.19a.75.75 0 0 0-1.28-.53l-2.22 2.22a1 1 0 0 0 0 1.414l2.22 2.22a.75.75 0 0 0 1.28-.53zm-1 4.19L14.207 12 16 10.207z"
      />
    </svg>
  )
}

export function FigmaFlipVerticalIcon({ className = DEFAULT_CLS }: IconProps) {
  return (
    <svg aria-hidden="true" width="24" height="24" viewBox="0 0 24 24" fill="none" className={className}>
      <path
        fill="currentColor"
        fillRule="evenodd"
        clipRule="evenodd"
        d="M17.5 12a.5.5 0 0 0 0-1h-11a.5.5 0 0 0 0 1zm-3.104-6a.75.75 0 0 1 .53 1.28L12.708 9.5a1 1 0 0 1-1.414 0l-2.22-2.22A.75.75 0 0 1 9.603 6zm-4.189 1L12 8.793 13.793 7zm4.19 10a.75.75 0 0 0 .53-1.28l-2.22-2.22a1 1 0 0 0-1.414 0l-2.22 2.22a.75.75 0 0 0 .53 1.28zm-4.19-1L12 14.207 13.793 16z"
      />
    </svg>
  )
}

export function FigmaPlayIcon({ className = DEFAULT_CLS }: IconProps) {
  return (
    <svg aria-hidden="true" width="24" height="24" viewBox="0 0 24 24" fill="none" className={className}>
      <path
        fill="currentColor"
        fillRule="evenodd"
        clipRule="evenodd"
        d="M6 5.903C6 4.43 7.604 3.517 8.87 4.269l10.15 6.028c1.307.776 1.305 2.669-.003 3.442l-10.15 5.995c-1.228.724-2.768-.11-2.863-1.5L6 18.098zm1 12.195a.9.9 0 0 0 1.357.774l10.152-5.995a1 1 0 0 0 .002-1.72L8.359 5.129A.9.9 0 0 0 7 5.903z"
      />
    </svg>
  )
}

export function FigmaChevronDownIcon({ className = "h-4 w-4 shrink-0" }: IconProps) {
  return (
    <svg aria-hidden="true" width="16" height="16" viewBox="0 0 16 16" fill="none" className={className}>
      <path
        fill="currentColor"
        d="M9.768 6.768a.5.5 0 0 1 .707.707l-2.12 2.121a.5.5 0 0 1-.708 0L5.525 7.475a.5.5 0 0 1 .708-.707l1.768 1.767z"
      />
    </svg>
  )
}

export function FigmaPlusIcon({ className = DEFAULT_CLS }: IconProps) {
  return (
    <svg aria-hidden="true" width="24" height="24" viewBox="0 0 24 24" fill="none" className={className}>
      <path
        fill="currentColor"
        fillRule="evenodd"
        clipRule="evenodd"
        d="M11.5 6a.5.5 0 0 1 .5.5V11h4.5a.5.5 0 0 1 0 1H12v4.5a.5.5 0 0 1-1 0V12H6.5a.5.5 0 0 1 0-1H11V6.5a.5.5 0 0 1 .5-.5"
      />
    </svg>
  )
}

export function FigmaMinusIcon({ className = DEFAULT_CLS }: IconProps) {
  return (
    <svg aria-hidden="true" width="24" height="24" viewBox="0 0 24 24" fill="none" className={className}>
      <path
        fill="currentColor"
        fillRule="evenodd"
        clipRule="evenodd"
        d="M6.5 11.5a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H7a.5.5 0 0 1-.5-.5"
      />
    </svg>
  )
}

export function FigmaEyeIcon({ className = DEFAULT_CLS }: IconProps) {
  return (
    <svg aria-hidden="true" width="24" height="24" viewBox="0 0 24 24" fill="none" className={className}>
      <path
        fill="currentColor"
        fillRule="evenodd"
        clipRule="evenodd"
        d="M6 12c0-.066.054-.358.313-.825a5.9 5.9 0 0 1 1.12-1.414C8.443 8.816 9.956 8 12 8s3.558.816 4.566 1.76c.508.477.88.98 1.121 1.415.258.467.313.76.313.825 0 .066-.055.358-.313.825-.24.435-.613.938-1.12 1.414C15.557 15.184 14.044 16 12 16s-3.558-.816-4.566-1.76a5.9 5.9 0 0 1-1.121-1.415C6.055 12.358 6 12.065 6 12m-1 0c0-1.25 2.333-5 7-5s7 3.75 7 5-2.333 5-7 5-7-3.75-7-5m8 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0m1 0a2 2 0 1 1-4 0 2 2 0 0 1 4 0"
      />
    </svg>
  )
}

export function FigmaEyeOffIcon({ className = DEFAULT_CLS }: IconProps) {
  return (
    <svg aria-hidden="true" width="24" height="24" viewBox="0 0 24 24" fill="none" className={className}>
      <path
        fill="currentColor"
        d="M5.854 5.146a.5.5 0 1 0-.708.708l2.14 2.14C5.862 9.152 5 10.97 5 12c0 1.25 2.333 5 7 5 1.564 0 2.912-.42 4.027-1.066l2.12 2.12a.5.5 0 0 0 .707-.708zM12 16c-2.044 0-3.558-.816-4.566-1.76a5.9 5.9 0 0 1-1.121-1.415C6.055 12.358 6 12.065 6 12c0-.066.054-.358.313-.825.354-.64.918-1.394 1.716-1.997l1.56 1.56a2.5 2.5 0 0 0 3.673 3.673l1.972 1.972C14.327 15.792 13.235 16 12 16m6.999-4c0-.988-1.577-3.68-4.703-4.636a.5.5 0 1 0-.292.956c2.696.824 3.995 3.12 3.995 3.68 0 .066-.055.358-.313.825a5.9 5.9 0 0 1-.873 1.158.5.5 0 0 0 .719.695C18.395 13.78 19 12.66 19 12"
      />
    </svg>
  )
}

export function FigmaUnlinkIcon({ className = DEFAULT_CLS }: IconProps) {
  return (
    <svg aria-hidden="true" width="24" height="24" viewBox="0 0 24 24" fill="none" className={className}>
      <path
        fill="currentColor"
        d="M8.111 11.648a.5.5 0 0 1 .708.707l-1.232 1.232a2 2 0 0 0 2.828 2.828l1.232-1.232a.5.5 0 0 1 .707.707l-1.232 1.232A3 3 0 0 1 6.88 12.88zM6.147 6.147a.5.5 0 0 1 .629-.065l.078.065 11 11 .064.078a.5.5 0 0 1-.693.693l-.078-.064-11-11-.065-.078a.5.5 0 0 1 .065-.63m6.844.627a3 3 0 0 1 4.238 4.237l-.107.111-1.232 1.233a.5.5 0 0 1-.707-.707l1.232-1.233.138-.151a2.002 2.002 0 0 0-2.815-2.815l-.15.138-1.233 1.232a.5.5 0 0 1-.707-.707L12.88 6.88z"
      />
    </svg>
  )
}

export function FigmaStylesGridIcon({ className = DEFAULT_CLS }: IconProps) {
  return (
    <svg aria-hidden="true" width="24" height="24" viewBox="0 0 24 24" fill="none" className={className}>
      <path
        fill="currentColor"
        fillRule="evenodd"
        clipRule="evenodd"
        d="M8.5 10a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3m0 1a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5m7-1a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3m0 1a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5M14 15.5a1.5 1.5 0 1 0 3 0 1.5 1.5 0 0 0-3 0m-1 0a2.5 2.5 0 1 0 5 0 2.5 2.5 0 0 0-5 0M8.5 17a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3m0 1a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5"
      />
    </svg>
  )
}

export function FigmaSelectMatchingIcon({ className = DEFAULT_CLS }: IconProps) {
  return (
    <svg aria-hidden="true" width="24" height="24" viewBox="0 0 24 24" fill="none" className={className}>
      <path
        fill="currentColor"
        d="M6.5 16a.5.5 0 0 1 .49.4l.02.2c.04.196.194.35.39.39l.2.02a.5.5 0 0 1-.1.99A1.5 1.5 0 0 1 6 16.5a.5.5 0 0 1 .5-.5m4 0a.5.5 0 0 1 .5.5A1.5 1.5 0 0 1 9.5 18a.5.5 0 0 1-.1-.99l.2-.02a.5.5 0 0 0 .39-.39l.02-.2a.5.5 0 0 1 .49-.4m3 0a.5.5 0 0 1 .49.4l.02.2c.04.196.194.35.39.39l.2.02a.5.5 0 0 1-.1.99 1.5 1.5 0 0 1-1.5-1.5.5.5 0 0 1 .5-.5m4 0a.5.5 0 0 1 .5.5 1.5 1.5 0 0 1-1.5 1.5.5.5 0 0 1-.1-.99l.2-.02a.5.5 0 0 0 .39-.39l.02-.2a.5.5 0 0 1 .49-.4m-10-3a.5.5 0 0 1 .1.99l-.2.02a.5.5 0 0 0-.39.39l-.02.2a.5.5 0 0 1-.99-.1A1.5 1.5 0 0 1 7.5 13m2 0a1.5 1.5 0 0 1 1.5 1.5.5.5 0 0 1-.99.1l-.02-.2a.5.5 0 0 0-.39-.39l-.2-.02a.5.5 0 0 1 .1-.99m5 0a.5.5 0 0 1 .1.99l-.2.02a.5.5 0 0 0-.39.39l-.02.2a.5.5 0 0 1-.99-.1 1.5 1.5 0 0 1 1.5-1.5m2 0a1.5 1.5 0 0 1 1.5 1.5.5.5 0 0 1-.99.1l-.02-.2a.5.5 0 0 0-.39-.39l-.2-.02a.5.5 0 0 1 .1-.99m-7-7A1.5 1.5 0 0 1 11 7.5v2A1.5 1.5 0 0 1 9.5 11h-2A1.5 1.5 0 0 1 6 9.5v-2A1.5 1.5 0 0 1 7.5 6zm4 3a.5.5 0 0 1 .49.4l.02.2c.04.196.194.35.39.39l.2.02a.5.5 0 0 1-.1.99A1.5 1.5 0 0 1 13 9.5a.5.5 0 0 1 .5-.5m4 0a.5.5 0 0 1 .5.5 1.5 1.5 0 0 1-1.5 1.5.5.5 0 0 1-.1-.99l.2-.02a.5.5 0 0 0 .39-.39l.02-.2a.5.5 0 0 1 .49-.4m-10-2a.5.5 0 0 0-.5.5v2a.5.5 0 0 0 .5.5h2a.5.5 0 0 0 .5-.5v-2a.5.5 0 0 0-.5-.5zm7-1a.5.5 0 0 1 .1.99l-.2.02a.5.5 0 0 0-.39.39l-.02.2a.5.5 0 0 1-.99-.1A1.5 1.5 0 0 1 14.5 6m2 0A1.5 1.5 0 0 1 18 7.5a.5.5 0 0 1-.99.1l-.02-.2a.5.5 0 0 0-.39-.39l-.2-.02a.5.5 0 0 1 .1-.99"
      />
    </svg>
  )
}

export function FigmaComponentIcon({ className = DEFAULT_CLS }: IconProps) {
  return (
    <svg aria-hidden="true" width="24" height="24" viewBox="0 0 24 24" fill="none" className={className}>
      <path
        fill="currentColor"
        fillRule="evenodd"
        clipRule="evenodd"
        d="M11.116 13.592a1.25 1.25 0 0 1 1.768 0l1.637 1.637a1.25 1.25 0 0 1 0 1.768l-1.637 1.638-.095.085a1.25 1.25 0 0 1-1.578 0l-.095-.085-1.638-1.64a1.25 1.25 0 0 1-.085-1.672l.085-.095zm1.06.707a.25.25 0 0 0-.353 0l-1.638 1.636a.25.25 0 0 0 0 .354l1.638 1.639a.25.25 0 0 0 .354 0l1.637-1.638a.25.25 0 0 0 0-.354zm3.053-4.82a1.25 1.25 0 0 1 1.767 0l1.639 1.637a1.25 1.25 0 0 1 0 1.768l-1.639 1.638-.095.086a1.25 1.25 0 0 1-1.578 0l-.095-.086-1.637-1.637a1.25 1.25 0 0 1-.086-1.673l.086-.095zm-8.226 0a1.25 1.25 0 0 1 1.767 0l1.64 1.638a1.25 1.25 0 0 1 0 1.768L8.77 14.52a1.25 1.25 0 0 1-1.672.086l-.095-.086-1.638-1.637a1.25 1.25 0 0 1-.086-1.673l.086-.095zm9.286.706a.25.25 0 0 0-.354 0l-1.637 1.64a.25.25 0 0 0 0 .353l1.637 1.637a.25.25 0 0 0 .354 0l1.639-1.638a.25.25 0 0 0 0-.354zm-8.226 0a.25.25 0 0 0-.353 0l-1.637 1.638a.25.25 0 0 0 0 .354l1.638 1.637a.25.25 0 0 0 .353 0l1.638-1.636a.25.25 0 0 0 0-.354zm3.053-4.819a1.25 1.25 0 0 1 1.768 0l1.637 1.638a1.25 1.25 0 0 1 0 1.767l-1.637 1.639-.095.085a1.25 1.25 0 0 1-1.578 0l-.095-.085-1.639-1.639a1.25 1.25 0 0 1-.085-1.673l.085-.094zm1.06.707a.25.25 0 0 0-.353 0l-1.639 1.638a.25.25 0 0 0 0 .353l1.64 1.639a.25.25 0 0 0 .353 0l1.637-1.639a.25.25 0 0 0 0-.353z"
      />
    </svg>
  )
}

export function FigmaMaskIcon({ className = DEFAULT_CLS }: IconProps) {
  return (
    <svg aria-hidden="true" width="24" height="24" viewBox="0 0 24 24" fill="none" className={className}>
      <path
        fill="currentColor"
        fillRule="evenodd"
        clipRule="evenodd"
        d="M18 12a6 6 0 0 1-8.5 5.456 6.001 6.001 0 0 0 0-10.912A6 6 0 0 1 18 12M6 12a5.99 5.99 0 0 1 2.401-4.801 5.003 5.003 0 0 1 0 9.602A5.99 5.99 0 0 1 6 12m2.2-5.88a7 7 0 1 0 7.6 11.76A7 7 0 0 0 8.2 6.12"
      />
      <path
        fill="currentColor"
        fillOpacity="0.35"
        fillRule="evenodd"
        clipRule="evenodd"
        d="M8.4 16.8a5.002 5.002 0 0 0 .001-9.602A5.99 5.99 0 0 0 6 12a5.99 5.99 0 0 0 2.4 4.8"
      />
    </svg>
  )
}

export function FigmaBooleanUnionIcon({ className = DEFAULT_CLS }: IconProps) {
  return (
    <svg aria-hidden="true" width="24" height="24" viewBox="0 0 24 24" fill="none" className={className}>
      <path
        fill="currentColor"
        fillOpacity="0.3"
        fillRule="evenodd"
        clipRule="evenodd"
        d="M14 7H7v7h3v3h7v-7h-3z"
      />
      <path
        stroke="currentColor"
        strokeWidth="1.2"
        d="M7 6.5h7a.5.5 0 0 1 .5.5v2.5H17a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-.5.5h-7a.5.5 0 0 1-.5-.5v-2.5H7a.5.5 0 0 1-.5-.5V7a.5.5 0 0 1 .5-.5Z"
      />
    </svg>
  )
}

export function FigmaIgnoreAutoLayoutIcon({ className = DEFAULT_CLS }: IconProps) {
  return (
    <svg aria-hidden="true" width="24" height="24" viewBox="0 0 24 24" fill="none" className={className}>
      <path
        fill="currentColor"
        fillRule="evenodd"
        clipRule="evenodd"
        d="M6 7a1 1 0 0 1 1-1h2.5a.5.5 0 0 1 0 1H7v2.5a.5.5 0 0 1-1 0zm12 0a1 1 0 0 0-1-1h-2.5a.5.5 0 0 0 0 1H17v2.5a.5.5 0 0 0 1 0zM7 18a1 1 0 0 1-1-1v-2.5a.5.5 0 0 1 1 0V17h2.5a.5.5 0 0 1 0 1zm11-1a1 1 0 0 1-1 1h-2.5a.5.5 0 0 1 0-1H17v-2.5a.5.5 0 0 1 1 0zm-8-7h4v4h-4zm-1 0a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v4a1 1 0 0 1-1 1h-4a1 1 0 0 1-1-1z"
      />
    </svg>
  )
}

export function FigmaDistributeIcon({ className = DEFAULT_CLS }: IconProps) {
  return (
    <svg aria-hidden="true" width="24" height="24" viewBox="0 0 24 24" fill="none" className={className}>
      <path
        fill="currentColor"
        d="M9 12.25c0 .414.336.75.75.75h5.5a.75.75 0 0 0 .75-.75v-.5a.75.75 0 0 0-.75-.75h-5.5a.75.75 0 0 0-.75.75z"
      />
      <path
        fill="currentColor"
        fillOpacity="0.45"
        fillRule="evenodd"
        clipRule="evenodd"
        d="M19 6.5a.5.5 0 0 0-.5-.5h-12a.5.5 0 0 0 0 1h12a.5.5 0 0 0 .5-.5m0 11a.5.5 0 0 0-.5-.5h-12a.5.5 0 0 0 0 1h12a.5.5 0 0 0 .5-.5"
      />
    </svg>
  )
}

export function FigmaAutoLayoutToggleIcon({ className = DEFAULT_CLS }: IconProps) {
  return (
    <svg aria-hidden="true" width="24" height="24" viewBox="0 0 24 24" fill="none" className={className}>
      <path
        fill="currentColor"
        fillRule="evenodd"
        clipRule="evenodd"
        d="M9.5 7h-2a.5.5 0 0 0-.5.5v9a.5.5 0 0 0 .5.5h2a.5.5 0 0 0 .5-.5v-9a.5.5 0 0 0-.5-.5m-2-1A1.5 1.5 0 0 0 6 7.5v9A1.5 1.5 0 0 0 7.5 18h2a1.5 1.5 0 0 0 1.5-1.5v-9A1.5 1.5 0 0 0 9.5 6zm9 1h-2a.5.5 0 0 0-.5.5v2a.5.5 0 0 0 .5.5h2a.5.5 0 0 0 .5-.5v-2a.5.5 0 0 0-.5-.5m-2-1A1.5 1.5 0 0 0 13 7.5v2a1.5 1.5 0 0 0 1.5 1.5h2A1.5 1.5 0 0 0 18 9.5v-2A1.5 1.5 0 0 0 16.5 6zm3.384 8.32a.5.5 0 0 0-.768-.64l-2.15 2.58-1.112-1.114a.5.5 0 0 0-.708.708l1.5 1.5a.5.5 0 0 0 .738-.034z"
      />
    </svg>
  )
}

export function FigmaFlowFreeformIcon({ className = DEFAULT_CLS }: IconProps) {
  return (
    <svg aria-hidden="true" width="24" height="24" viewBox="0 0 24 24" fill="none" className={className}>
      <path
        fill="currentColor"
        d="M11.653 13.008A1.5 1.5 0 0 1 13 14.5v2l-.008.153a1.5 1.5 0 0 1-1.339 1.34L11.5 18h-2l-.153-.008a1.5 1.5 0 0 1-1.34-1.339L8 16.5v-2a1.5 1.5 0 0 1 1.347-1.492L9.5 13h2zM9.5 14a.5.5 0 0 0-.5.5v2a.5.5 0 0 0 .5.5h2a.5.5 0 0 0 .5-.5v-2a.5.5 0 0 0-.5-.5zm7.153-5.992A1.5 1.5 0 0 1 18 9.5v2l-.008.153a1.5 1.5 0 0 1-1.339 1.34L16.5 13h-2l-.153-.008a1.5 1.5 0 0 1-1.34-1.339L13 11.5v-2a1.5 1.5 0 0 1 1.347-1.492L14.5 8h2zM14.5 9a.5.5 0 0 0-.5.5v2a.5.5 0 0 0 .5.5h2a.5.5 0 0 0 .5-.5v-2a.5.5 0 0 0-.5-.5zM9.653 6.008A1.5 1.5 0 0 1 11 7.5v2l-.008.153a1.5 1.5 0 0 1-1.339 1.34L9.5 11h-2l-.153-.008a1.5 1.5 0 0 1-1.34-1.339L6 9.5v-2a1.5 1.5 0 0 1 1.347-1.492L7.5 6h2zM7.5 7a.5.5 0 0 0-.5.5v2a.5.5 0 0 0 .5.5h2a.5.5 0 0 0 .5-.5v-2a.5.5 0 0 0-.5-.5z"
      />
    </svg>
  )
}

export function FigmaFlowVerticalIcon({ className = DEFAULT_CLS }: IconProps) {
  return (
    <svg aria-hidden="true" width="24" height="24" viewBox="0 0 24 24" fill="none" className={className}>
      <path
        fill="currentColor"
        d="M9.654 13.008A1.5 1.5 0 0 1 11 14.5v2l-.008.153a1.5 1.5 0 0 1-1.338 1.34L9.5 18h-2l-.153-.008a1.5 1.5 0 0 1-1.339-1.339L6 16.5v-2a1.5 1.5 0 0 1 1.347-1.492L7.5 13h2zM15.5 6a.5.5 0 0 1 .49.4l.01.1v9.794l1.146-1.146a.501.501 0 0 1 .708.707l-2 2a.5.5 0 0 1-.707 0l-2-2a.5.5 0 0 1 .707-.707L15 16.294V6.5l.01-.1a.5.5 0 0 1 .49-.4m-8 8a.5.5 0 0 0-.5.5v2a.5.5 0 0 0 .5.5h2a.5.5 0 0 0 .5-.5v-2a.5.5 0 0 0-.5-.5zm2.154-7.992A1.5 1.5 0 0 1 11 7.5v2l-.008.153a1.5 1.5 0 0 1-1.338 1.34L9.5 11h-2l-.153-.008a1.5 1.5 0 0 1-1.339-1.339L6 9.5v-2a1.5 1.5 0 0 1 1.347-1.492L7.5 6h2zM7.5 7a.5.5 0 0 0-.5.5v2a.5.5 0 0 0 .5.5h2a.5.5 0 0 0 .5-.5v-2a.5.5 0 0 0-.5-.5z"
      />
    </svg>
  )
}

export function FigmaFlowHorizontalIcon({ className = DEFAULT_CLS }: IconProps) {
  return (
    <svg aria-hidden="true" width="24" height="24" viewBox="0 0 24 24" fill="none" className={className}>
      <path
        fill="currentColor"
        d="M15.147 13.147a.5.5 0 0 1 .707 0l2 2a.5.5 0 0 1 0 .707l-2 2a.5.5 0 0 1-.707-.707L16.293 16H6.5l-.101-.01a.5.5 0 0 1 0-.98L6.5 15h9.793l-1.146-1.146a.5.5 0 0 1 0-.707m-5.493-7.14A1.5 1.5 0 0 1 11 7.5v2l-.007.153a1.5 1.5 0 0 1-1.34 1.34L9.5 11h-2l-.153-.008a1.5 1.5 0 0 1-1.339-1.339L6 9.5v-2a1.5 1.5 0 0 1 1.347-1.492L7.5 6h2zm7 0A1.5 1.5 0 0 1 18 7.5v2l-.007.153a1.5 1.5 0 0 1-1.34 1.34L16.5 11h-2l-.153-.008a1.5 1.5 0 0 1-1.339-1.339L13 9.5v-2a1.5 1.5 0 0 1 1.347-1.492L14.5 6h2zM14.5 7a.5.5 0 0 0-.5.5v2a.5.5 0 0 0 .5.5h2a.5.5 0 0 0 .5-.5v-2a.5.5 0 0 0-.5-.5zm-7 0a.5.5 0 0 0-.5.5v2a.5.5 0 0 0 .5.5h2a.5.5 0 0 0 .5-.5v-2a.5.5 0 0 0-.5-.5z"
      />
    </svg>
  )
}

export function FigmaFlowGridIcon({ className = DEFAULT_CLS }: IconProps) {
  return (
    <svg aria-hidden="true" width="24" height="24" viewBox="0 0 24 24" fill="none" className={className}>
      <path
        fill="currentColor"
        d="M9.653 13.008A1.5 1.5 0 0 1 11 14.5v2l-.008.153a1.5 1.5 0 0 1-1.339 1.34L9.5 18h-2a1.5 1.5 0 0 1-1.492-1.347L6 16.5v-2A1.5 1.5 0 0 1 7.5 13h2zm7 0A1.5 1.5 0 0 1 18 14.5v2l-.008.153a1.5 1.5 0 0 1-1.339 1.34L16.5 18h-2a1.5 1.5 0 0 1-1.492-1.347L13 16.5v-2a1.5 1.5 0 0 1 1.5-1.5h2zM7.5 14a.5.5 0 0 0-.5.5v2a.5.5 0 0 0 .5.5h2a.5.5 0 0 0 .5-.5v-2a.5.5 0 0 0-.5-.5zm7 0a.5.5 0 0 0-.5.5v2a.5.5 0 0 0 .5.5h2a.5.5 0 0 0 .5-.5v-2a.5.5 0 0 0-.5-.5zM9.653 6.008A1.5 1.5 0 0 1 11 7.5v2l-.008.153a1.5 1.5 0 0 1-1.339 1.34L9.5 11h-2a1.5 1.5 0 0 1-1.492-1.347L6 9.5v-2A1.5 1.5 0 0 1 7.5 6h2zm7 0A1.5 1.5 0 0 1 18 7.5v2l-.008.153a1.5 1.5 0 0 1-1.339 1.34L16.5 11h-2a1.5 1.5 0 0 1-1.492-1.347L13 9.5v-2A1.5 1.5 0 0 1 14.5 6h2zM7.5 7a.5.5 0 0 0-.5.5v2a.5.5 0 0 0 .5.5h2a.5.5 0 0 0 .5-.5v-2a.5.5 0 0 0-.5-.5zm7 0a.5.5 0 0 0-.5.5v2a.5.5 0 0 0 .5.5h2a.5.5 0 0 0 .5-.5v-2a.5.5 0 0 0-.5-.5z"
      />
    </svg>
  )
}

export function FigmaWrapIcon({ className = "h-4 w-4 shrink-0" }: IconProps) {
  return (
    <svg aria-hidden="true" width="16" height="16" viewBox="0 0 16 16" fill="none" className={className}>
      <path
        fill="currentColor"
        fillRule="evenodd"
        clipRule="evenodd"
        d="M8 3h2c1.933 0 3.5 1.567 3.5 3.5 0 1.933-1.567 3.5-3.5 3.5H4.707l2.147 2.146-.708.708-3-3-.353-.354.353-.354 3-3 .708.708L4.707 9H10c1.38 0 2.5-1.12 2.5-2.5C12.5 5.12 11.38 4 10 4H8z"
      />
    </svg>
  )
}

export function FigmaAspectRatioLockIcon({ className = DEFAULT_CLS }: IconProps) {
  return (
    <svg aria-hidden="true" width="24" height="24" viewBox="0 0 24 24" fill="none" className={className}>
      <path
        fill="currentColor"
        fillRule="evenodd"
        clipRule="evenodd"
        d="M7.5 7h9a.5.5 0 0 1 .5.5v9a.5.5 0 0 1-.5.5h-9a.5.5 0 0 1-.5-.5v-9a.5.5 0 0 1 .5-.5M6 7.5A1.5 1.5 0 0 1 7.5 6h9A1.5 1.5 0 0 1 18 7.5v9a1.5 1.5 0 0 1-1.5 1.5h-9A1.5 1.5 0 0 1 6 16.5zM9.5 9a.5.5 0 0 0-.5.5v2a.5.5 0 0 0 1 0V10h1.5a.5.5 0 0 0 0-1zm5.5 3.5a.5.5 0 0 0-1 0V14h-1.5a.5.5 0 0 0 0 1h2a.5.5 0 0 0 .5-.5z"
      />
    </svg>
  )
}

export function FigmaGapVerticalIcon({ className = DEFAULT_CLS }: IconProps) {
  return (
    <svg aria-hidden="true" width="24" height="24" viewBox="0 0 24 24" fill="none" className={className}>
      <path
        fill="currentColor"
        d="M15.5 15a1.5 1.5 0 0 1 1.5 1.5.5.5 0 0 1-.99.1l-.02-.2a.5.5 0 0 0-.49-.4h-7a.5.5 0 0 0-.49.4l-.02.2a.5.5 0 0 1-.99-.1A1.5 1.5 0 0 1 8.5 15zM12 11a1 1 0 1 1 0 2 1 1 0 0 1 0-2m4.5-4a.5.5 0 0 1 .5.5A1.5 1.5 0 0 1 15.5 9h-7A1.5 1.5 0 0 1 7 7.5a.5.5 0 0 1 .99-.1l.02.2a.5.5 0 0 0 .49.4h7a.5.5 0 0 0 .49-.4l.02-.2a.5.5 0 0 1 .49-.4"
      />
    </svg>
  )
}

export function FigmaPaddingHorizontalIcon({ className = DEFAULT_CLS }: IconProps) {
  return (
    <svg aria-hidden="true" width="24" height="24" viewBox="0 0 24 24" fill="none" className={className}>
      <path
        fill="currentColor"
        d="M16.5 6A1.5 1.5 0 0 1 18 7.5v9a1.5 1.5 0 0 1-1.5 1.5h-9A1.5 1.5 0 0 1 6 16.5v-9A1.5 1.5 0 0 1 7.5 6zm-9 1a.5.5 0 0 0-.5.5v9a.5.5 0 0 0 .5.5h9a.5.5 0 0 0 .5-.5v-9a.5.5 0 0 0-.5-.5zm2 2a.5.5 0 0 1 .5.5v5a.5.5 0 0 1-1 0v-5a.5.5 0 0 1 .5-.5m5 0a.5.5 0 0 1 .5.5v5a.5.5 0 0 1-1 0v-5a.5.5 0 0 1 .5-.5"
      />
    </svg>
  )
}

export function FigmaPaddingVerticalIcon({ className = DEFAULT_CLS }: IconProps) {
  return (
    <svg aria-hidden="true" width="24" height="24" viewBox="0 0 24 24" fill="none" className={className}>
      <path
        fill="currentColor"
        d="M6 7.5A1.5 1.5 0 0 1 7.5 6h9A1.5 1.5 0 0 1 18 7.5v9a1.5 1.5 0 0 1-1.5 1.5h-9A1.5 1.5 0 0 1 6 16.5zm1 9a.5.5 0 0 0 .5.5h9a.5.5 0 0 0 .5-.5v-9a.5.5 0 0 0-.5-.5h-9a.5.5 0 0 0-.5.5zm2-2a.5.5 0 0 1 .5-.5h5a.5.5 0 0 1 0 1h-5a.5.5 0 0 1-.5-.5m0-5a.5.5 0 0 1 .5-.5h5a.5.5 0 0 1 0 1h-5a.5.5 0 0 1-.5-.5"
      />
    </svg>
  )
}

export function FigmaIndividualPaddingIcon({ className = DEFAULT_CLS }: IconProps) {
  return (
    <svg aria-hidden="true" width="24" height="24" viewBox="0 0 24 24" fill="none" className={className}>
      <path
        fill="currentColor"
        d="M6 7.5A1.5 1.5 0 0 1 7.5 6h9A1.5 1.5 0 0 1 18 7.5v9a1.5 1.5 0 0 1-1.5 1.5h-9A1.5 1.5 0 0 1 6 16.5zm1 9a.5.5 0 0 0 .5.5h9a.5.5 0 0 0 .5-.5v-9a.5.5 0 0 0-.5-.5h-9a.5.5 0 0 0-.5.5zm8-6.5a.5.5 0 0 1 1 0v4a.5.5 0 0 1-1 0zm-5.5 5.5a.5.5 0 0 1 .5-.5h4a.5.5 0 0 1 0 1h-4a.5.5 0 0 1-.5-.5m0-7A.5.5 0 0 1 10 8h4a.5.5 0 0 1 0 1h-4a.5.5 0 0 1-.5-.5M8 10a.5.5 0 0 1 1 0v4a.5.5 0 0 1-1 0z"
      />
    </svg>
  )
}

export function FigmaBlendModeIcon({ className = DEFAULT_CLS }: IconProps) {
  return (
    <svg aria-hidden="true" width="24" height="24" viewBox="0 0 24 24" fill="none" className={className}>
      <path
        fill="currentColor"
        d="M11.353 5.623a.91.91 0 0 1 1.295 0C14 6.978 17 10.29 17 13.001c0 3.5-2.5 5-5 5s-5-1.5-5-5c0-2.711 3-6.023 4.352-7.378m.647.77c-.658.663-1.663 1.75-2.507 2.977C8.597 10.673 8 11.965 8 13.001c0 1.49.522 2.453 1.218 3.057.72.623 1.72.943 2.782.943s2.063-.32 2.782-.943C15.478 15.454 16 14.492 16 13c0-1.036-.597-2.328-1.493-3.63-.844-1.227-1.85-2.315-2.507-2.978"
      />
    </svg>
  )
}

export function FigmaOpacityIcon({ className = DEFAULT_CLS }: IconProps) {
  return (
    <svg aria-hidden="true" width="24" height="24" viewBox="0 0 24 24" fill="none" className={className}>
      <path
        fill="currentColor"
        fillRule="evenodd"
        clipRule="evenodd"
        d="M8 7h7a1 1 0 0 1 1 1v7a1 1 0 0 1-1 1H8a1 1 0 0 1-1-1V8a1 1 0 0 1 1-1M6 8a2 2 0 0 1 2-2h7a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2zm8.5 1a.5.5 0 1 0 0-1 .5.5 0 0 0 0 1M13 10.5a.5.5 0 1 1-1 0 .5.5 0 0 1 1 0m-2 2a.5.5 0 1 1-1 0 .5.5 0 0 1 1 0m-2 2a.5.5 0 1 1-1 0 .5.5 0 0 1 1 0m1.5.5a.5.5 0 1 0 0-1 .5.5 0 0 0 0 1m2-2a.5.5 0 1 0 0-1 .5.5 0 0 0 0 1m.5 1.5a.5.5 0 1 1-1 0 .5.5 0 0 1 1 0m2-4a.5.5 0 1 1-1 0 .5.5 0 0 1 1 0m-.5 2.5a.5.5 0 1 0 0-1 .5.5 0 0 0 0 1m.5 1.5a.5.5 0 1 1-1 0 .5.5 0 0 1 1 0"
      />
    </svg>
  )
}

export function FigmaCornerRadiusIcon({ className = DEFAULT_CLS }: IconProps) {
  return (
    <svg aria-hidden="true" width="24" height="24" viewBox="0 0 24 24" fill="none" className={className}>
      <path
        fill="currentColor"
        d="M6.5 14a.5.5 0 0 1 .5.5v.6c0 .428 0 .72.019.945.017.219.05.331.09.41.096.187.249.34.437.436.078.04.19.073.41.09.224.019.516.019.944.019h.6a.5.5 0 0 1 0 1h-.621c-.402 0-.734 0-1.005-.023-.281-.022-.54-.071-.782-.195a2 2 0 0 1-.874-.874c-.124-.242-.173-.501-.196-.782A13 13 0 0 1 6 15.121V14.5a.5.5 0 0 1 .5-.5m11 0a.5.5 0 0 1 .5.5v.621c0 .402 0 .734-.023 1.005-.022.281-.071.54-.195.782a2 2 0 0 1-.874.874c-.242.124-.501.173-.782.195-.27.023-.603.023-1.005.023H14.5a.5.5 0 0 1 0-1h.6c.428 0 .72 0 .945-.019.219-.018.331-.05.41-.09a1 1 0 0 0 .436-.437c.04-.078.073-.19.09-.41.019-.224.019-.516.019-.944v-.6a.5.5 0 0 1 .5-.5m-8-8a.5.5 0 0 1 0 1h-.6c-.428 0-.719 0-.944.019-.22.017-.332.05-.41.09a1 1 0 0 0-.437.437c-.04.078-.073.19-.09.41C7 8.18 7 8.471 7 8.9v.6a.5.5 0 0 1-1 0v-.621c0-.402 0-.734.022-1.005.023-.281.072-.54.196-.782a2 2 0 0 1 .874-.874c.242-.124.501-.173.782-.196C8.144 6 8.477 6 8.88 6zm5.621 0c.402 0 .734 0 1.005.022.281.023.54.072.782.196a2 2 0 0 1 .874.874c.124.242.173.501.195.782.023.27.023.603.023 1.005V9.5a.5.5 0 0 1-1 0v-.6c0-.428 0-.72-.019-.945-.018-.219-.05-.33-.09-.41a1 1 0 0 0-.437-.436c-.078-.04-.19-.073-.41-.09A13 13 0 0 0 15.1 7h-.6a.5.5 0 0 1 0-1z"
      />
    </svg>
  )
}

export function FigmaSlidersIcon({ className = DEFAULT_CLS }: IconProps) {
  return (
    <svg aria-hidden="true" width="24" height="24" viewBox="0 0 24 24" fill="none" className={className}>
      <path
        fill="currentColor"
        d="M8.5 18a.5.5 0 0 0 .5-.5v-1.55a2.5 2.5 0 0 0 0-4.9V6.5a.5.5 0 0 0-1 0v4.55a2.501 2.501 0 0 0 0 4.9v1.55a.5.5 0 0 0 .5.5m7 0a.5.5 0 0 0 .5-.5v-4.55a2.5 2.5 0 0 0 0-4.9V6.5a.5.5 0 0 0-1 0v1.55a2.5 2.5 0 0 0 0 4.9v4.55a.5.5 0 0 0 .5.5m0-6a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3m-7 3a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3"
      />
    </svg>
  )
}

export function FigmaTargetIcon({ className = DEFAULT_CLS }: IconProps) {
  return (
    <svg aria-hidden="true" width="24" height="24" viewBox="0 0 24 24" fill="none" className={className}>
      <path
        fill="currentColor"
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12 18a6 6 0 1 0 0-12 6 6 0 0 0 0 12m0 1a7 7 0 1 0 0-14 7 7 0 0 0 0 14m0-4a3 3 0 1 0 0-6 3 3 0 0 0 0 6m0 1a4 4 0 1 0 0-8 4 4 0 0 0 0 8m1-4a1 1 0 1 1-2 0 1 1 0 0 1 2 0"
      />
    </svg>
  )
}

export function FigmaMoreIcon({ className = DEFAULT_CLS }: IconProps) {
  return (
    <svg aria-hidden="true" width="24" height="24" viewBox="0 0 24 24" fill="none" className={className}>
      <circle cx="7.5" cy="12" r="1.15" fill="currentColor" />
      <circle cx="12" cy="12" r="1.15" fill="currentColor" />
      <circle cx="16.5" cy="12" r="1.15" fill="currentColor" />
    </svg>
  )
}

export function FigmaCodeIcon({ className = DEFAULT_CLS }: IconProps) {
  return (
    <svg aria-hidden="true" width="24" height="24" viewBox="0 0 24 24" fill="none" className={className}>
      <path
        fill="currentColor"
        fillRule="evenodd"
        clipRule="evenodd"
        d="M13.657 6.135a.5.5 0 0 1 .35.614l-3.046 10.72a.5.5 0 1 1-.962-.273l3.045-10.72a.5.5 0 0 1 .613-.341M8.854 8.646a.5.5 0 0 1 0 .708L6.207 12l2.647 2.646a.5.5 0 0 1-.708.708l-3-3a.5.5 0 0 1 0-.708l3-3a.5.5 0 0 1 .708 0m6.292 0a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1 0 .708l-3 3a.5.5 0 0 1-.708-.708L17.793 12l-2.647-2.646a.5.5 0 0 1 0-.708"
      />
    </svg>
  )
}
