export function OpenFigmaLogo({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="openfigma-mark-grad" x1="3" y1="3" x2="21" y2="21" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#38BDF8" />
          <stop offset="55%" stopColor="#0D99FF" />
          <stop offset="100%" stopColor="#6366F1" />
        </linearGradient>
      </defs>
      {/* Precision open-canvas vector frame */}
      <rect
        x="4.5"
        y="4.5"
        width="15"
        height="15"
        rx="3.5"
        stroke="url(#openfigma-mark-grad)"
        strokeWidth="2"
      />
      {/* Inner geometric vector diamond */}
      <path
        d="M12 8.2L15.8 12L12 15.8L8.2 12L12 8.2Z"
        fill="url(#openfigma-mark-grad)"
      />
      {/* Four crisp vector corner anchor handles */}
      <rect x="2.5" y="2.5" width="3.5" height="3.5" rx="0.75" fill="#FFFFFF" stroke="#0D99FF" strokeWidth="1" />
      <rect x="18" y="2.5" width="3.5" height="3.5" rx="0.75" fill="#FFFFFF" stroke="#0D99FF" strokeWidth="1" />
      <rect x="2.5" y="18" width="3.5" height="3.5" rx="0.75" fill="#FFFFFF" stroke="#6366F1" strokeWidth="1" />
      <rect x="18" y="18" width="3.5" height="3.5" rx="0.75" fill="#FFFFFF" stroke="#6366F1" strokeWidth="1" />
    </svg>
  )
}
